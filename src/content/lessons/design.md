---
title: Concepts
description: What a worker pool is, why workloads need one, and how the 4 zones, channel buffer, handoff, backpressure, and worker states work.
order: 1
stage: System Design
---

A **worker pool** is a system-design pattern that processes background work at a safe, steady speed. Instead of starting a new worker for every incoming request, a fixed team of **workers** takes **jobs** one at a time from a shared waiting line (**channel buffer**).

You do not need to know Go to read this lesson. Every part of the interactive **picture** on the **Overview** page follows these rules.

## Why systems need a worker pool

Imagine an application where customers upload photos, trigger webhooks, and request email receipts:

- If you run jobs **one by one (Sequential)**, a single slow upload blocks 99 quick emails behind it.
- If you run jobs **all at once (Unbounded)**, a sudden burst of 1,000 requests starts 1,000 tasks at the same moment. Memory spikes, CPU cores thrash, and the database runs out of connections.
- With a **worker pool**, you choose the concurrency limit up front — for example, **3 workers** and a **buffer of 6 slots**. At most 3 jobs run at once, up to 6 extra jobs wait in line, and the 10th job makes the sender wait (**backpressure**).

## Which workloads fit a worker pool?

Each **job packet** in the picture carries one of four **job types**. Each job type stands for a real engineering workload:

| Job type | Workload kind | Work time | Why a worker pool helps |
| --- | --- | --- | --- |
| `EMAIL` | **I/O-bound network work** | `1s–2s` | Workers spend most of their time waiting on the mail server. Running a few in parallel multiplies throughput without flooding SMTP limits. |
| `WEBHOOK` | **I/O-bound HTTP calls** | `1s–3s` | Customer endpoints can be slow or return `HTTP 503`. Bounding active calls keeps slow endpoints from exhausting local sockets. |
| `IMG` | **CPU-bound work** | `3s–5s` | Resizing images uses heavy CPU and RAM. Matching worker count to CPU cores prevents memory exhaustion. |
| `SYNC` | **Connection-limited work** | `2s–4s` | Databases permit only a small pool of concurrent connections. A fixed worker pool respects that ceiling. |

## The four zones in the picture

Read the stage from left to right on desktop, or from top to bottom on a phone. Each zone has a number and the exact line of Go code it represents.

| Zone | Everyday meaning | Go code | What happens here |
| --- | --- | --- | --- |
| **01 Producer** | The sender at the start of the line | `jobs <- job` | One goroutine creates jobs and sends them into the channel. |
| **02 Channel** | A waiting line with `N` slots | `jobs := make(chan Job, N)` | Holds waiting jobs in first-in, first-out order. |
| **03 Workers** | A fixed team of gopher clerks | `go worker(id, jobs, results)` | Up to 6 goroutines. Each worker runs `for job := range jobs` and takes one job at a time. |
| **04 Results** | The finished outbox and error tray | `results <- Result{}` | Each worker sends one result (`Done` or `Failed`) after finishing a job. |

<!-- diagram: pipeline -->

## Five channel rules the picture follows

These rules come directly from the Go runtime (`runtime/chan.go`):

1. **Idle workers use zero CPU.** A worker waiting on `<-jobs` is parked by the runtime until a job arrives.
2. **Handoff skips the buffer.** When at least one worker is **Idle**, a **send** goes straight from the **producer** to that worker. The job packet does not stop in a buffer slot.
3. **Busy workers fill the buffer from front to tail.** When all workers are **Busy** and the buffer has room, new jobs enter at the tail (`Slot [N-1]`) and shift toward the **front** (`Slot [0]`).
4. **A full buffer triggers backpressure.** When all workers are **Busy** and every slot is full, the producer becomes **Blocked**. The picture shows the waiting job in the producer outlet with an amber border.
5. **Receiving from a full buffer unblocks the producer in the same step.** When a worker finishes its job and takes `Slot [0]`, the remaining slots shift right and the blocked producer job moves into the tail slot immediately.

Because of Rule 2, **an Idle worker never sits next to a non-empty buffer**. If a job is waiting in the buffer, every active worker is already busy.

## Buffer slots and unbuffered mode

Slots are numbered from the **front**. `Slot [0]` is on the right side of the channel, closest to the workers. The next worker to finish always takes `Slot [0]`.

The buffer size `cap(jobs)` is fixed when `make(chan Job, N)` runs. Moving the **Buffer** slider in the picture restarts the pool because Go cannot resize an existing channel.

When you set **Buffer** to `0`, the channel is **unbuffered**: there are no waiting slots, so every send must wait for an **Idle** worker to receive it directly.

## Worker states

Each worker card shows a Go **gopher** whose pose and pill reflect its current **worker state**:

| Worker state | Gopher pose | Meaning |
| --- | --- | --- |
| **Idle** | Half-closed eyes, looking at the channel | Parked on `<-jobs`, waiting for the next job. |
| **Busy** | Eyes open, holding the job packet, meter filling | Running `process(ctx, job)`. |
| **Alert** (`Timeout` / `Error`) | Wide eyes, coral flash, `!` mark | The attempt failed in **Resilience mode**. The worker reports the failure, then takes the next job. |
| **Draining** | Busy pose with note `Exits after this job` | You lowered the **Workers** slider. The worker finishes its current job before exiting so work is never lost. |
| **Offline** | Grey and asleep | The worker slot has no running goroutine. |

<!-- diagram: states -->

## Reading a job packet

Every job is drawn as one **job packet** that keeps its identity from the producer all the way to the result tray:

- **Type badge**: color and icon for `EMAIL`, `WEBHOOK`, `IMG`, or `SYNC`.
- **Job ID**: the job number, such as `Job 104`.
- **Work time**: how long the job takes to finish, such as `4s`. Work time does not change between retries.
- **Retry badge**: `r1/2` means retry 1 of 2. It appears only after a failed attempt in **Resilience mode**.

## Four presets to compare

| Preset | What to observe |
| --- | --- |
| **1 Steady flow** | Three workers keep up with incoming work. Watch jobs hand off directly to idle workers. |
| **2 Backpressure** | Two workers are slower than the producer. All 4 slots fill, `FULL` appears, and the producer becomes **Blocked**. |
| **3 Timeout & retry** | **Resilience mode** is on. Slow attempts hit the context deadline, flash **Alert**, wait in **Retry backoff**, and try again. |
| **4 Drain & idle** | Auto-send is off. Workers empty the buffer from `Slot [0]`, then park in **Idle**. |

## What the picture simplifies

- The picture clock moves in `0.05s` ticks (`Step` advances by `0.5s`). Real OS and Go schedulers run continuously.
- The picture has one producer goroutine, so at most one job is blocked in the outlet at a time.
- When a worker hits a timeout or transient error, the card flashes **Alert** for `0.7s` so your eye can see it before the packet moves to **Retry backoff** or **Failed**.
