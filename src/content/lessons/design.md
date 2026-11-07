---
title: Design
description: How each zone of the picture maps to Go — producer, channel, buffer, workers, and results.
order: 2
---

The picture shows one Go program. Each zone has a number and a line of Go code. Read the zones from left to right (or from top to bottom on a phone).

## The four zones

| Zone | Go code | What it means |
| --- | --- | --- |
| 01 Producer | `jobs <- job` | One goroutine sends jobs into the channel. |
| 02 Channel | `jobs := make(chan Job, N)` | A first-in, first-out channel with N buffer slots. |
| 03 Workers | `go worker(id, jobs, results)` | A fixed number of goroutines. Each one runs `for job := range jobs`. |
| 04 Results | `results <- Result{}` | Each worker sends one result for each job. |

## Channel rules the picture follows

The rules come from the Go runtime (`runtime/chan.go`).

1. A worker that waits on `<-jobs` is **parked**. It uses no CPU.
2. When a parked worker exists, a send goes **directly** to that worker. The job skips the buffer.
3. When no worker waits and the buffer has space, the job goes to the **tail** of the buffer.
4. When the buffer is full, the sender **blocks**. The picture shows the blocked job in the producer outlet, with a dashed amber border.
5. When a worker receives from a full buffer, it takes the **front** job. The blocked job then moves into the tail.

Thus an idle worker never sits next to a non-empty buffer. If you see this in real code, the worker is not really waiting on the channel.

## Buffer slots

Slots are numbered from the front. `Buffer [0]` is the front: the next job that a worker receives. It is on the right side, near the workers. New jobs enter at the left.

`cap(jobs)` is fixed when `make` runs. A new buffer size in the picture restarts the pool, because Go cannot resize a channel.

With a buffer of 0, the channel is **unbuffered**. Each send waits until a worker receives it.

## Worker states

| State | Gopher | Go meaning |
| --- | --- | --- |
| Idle | Half-closed eyes, looks at the channel | Parked on `<-jobs`. |
| Busy | Eyes open, hands up, progress meter fills | Runs the job. |
| Timeout / Error | Wide eyes, coral flash, "!" mark | The attempt failed. The worker reports the result (Resilience mode). |
| Offline | Grey and asleep | The goroutine is not started, or it exited. |
| Draining | Busy, "Exits after this job" | You lowered the worker count. The worker stops after its current job. |

## The job packet

Each job is one packet. The packet keeps its look in every zone.

- **Type badge**: a color and an icon. EMAIL, WEBHOOK, IMG, or SYNC.
- **ID**: the job number, for example 104.
- **Work time**: how long the job needs, for example `4s`.
- **Retry badge**: `r1/2` means retry 1 of 2. It shows only after a failed attempt.

In a slot the packet is a small card. On a worker it is a row. In a tray it is a chip.

## Presets

| Preset | Look for |
| --- | --- |
| 1 Steady flow | Workers keep up. A parked worker takes each new job at once. |
| 2 Backpressure | Two workers are too slow. The buffer fills. The producer blocks. |
| 3 Timeout & retry | Resilience mode. Attempts that do not reply reach the deadline and retry after a backoff. |
| 4 Drain & idle | No new jobs. Workers empty the buffer, then park on `<-jobs`. |

## What the picture makes simple

- Time moves in steps of 0.05 seconds. Real goroutines do not move in steps.
- The producer holds at most one blocked job, because it is one goroutine.
- When two parked workers can receive, the worker that waited longest gets the job. Go also keeps parked receivers in arrival order, but you must not depend on this order in your code.
- A worker that times out shows the alert for 0.7 seconds. This is the time to report `Result{Err}`. Real code is faster.
