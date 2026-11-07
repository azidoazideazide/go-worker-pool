# Worker pool

The public site teaches one Go worker pool. The site shows a picture of that pool. The program is the pool you run, and the site does not run the program.

Use these words in all headings, UI labels, lessons, `aria-label` text, and documentation. Use each word with one meaning only. If you need a new word, add it here first.

## Language

### The pool

**Worker pool**:
A fixed set of workers that take jobs from one channel and send one result for each job.
_Avoid_: catalog, producer-consumer, cargo system, thread pool

**Producer**:
The goroutine that makes jobs and sends them into the channel with `jobs <- job`. The picture has one producer.
_Avoid_: client, publisher, enqueuer, source

**Job**:
One piece of work. A job has an ID, a job type, and a work time.
_Avoid_: cargo, task, entry, message

**Job type**:
The kind of work in a job: `EMAIL`, `WEBHOOK`, `IMG`, or `SYNC`. The job type sets the work time range and the error text.
_Avoid_: category, kind, label

**Work time**:
The time a job needs to finish, for example `4s`. It does not change between attempts.
_Avoid_: duration, ETA, cost

**Channel**:
The Go `chan Job` that carries jobs from the producer to the workers, in first-in, first-out order.
_Avoid_: canal, queue, pipe, topic

**Buffer**:
The fixed number of jobs that can wait in the channel, set by `make(chan Job, N)` and read with `cap(jobs)`. The buffer can be `0` (unbuffered).
_Avoid_: queue length, backlog, capacity limit

**Slot**:
One place in the buffer for one job. Slot `[0]` is the front.
_Avoid_: cell, bucket, position

**Front**:
The slot that the next receive takes from, slot `[0]`.
_Avoid_: head, top, next

**Worker**:
One goroutine in the pool. A worker runs `for job := range jobs` and takes one job at a time.
_Avoid_: dock, consumer, thread, server

**Result**:
The value that a worker sends on `chan Result` after each job. A result is done or failed.
_Avoid_: output, response, receipt

**Done**:
A result for a job that finished without an error. The Done tray in the picture shows the last results.
_Avoid_: success, complete, shipped

**Failed**:
A job that used all of its attempts. In production systems this is a dead-letter queue (DLQ). Use "dead-letter queue" only to connect the picture to production systems.
_Avoid_: dead, dropped, lost, error bin

### Channel behavior

**Send**:
One `jobs <- job` operation.
_Avoid_: push, publish, enqueue, emit

**Receive**:
One `<-jobs` operation. In the pool, `for job := range jobs` receives.
_Avoid_: pop, pull, dequeue, consume

**Handoff**:
A send that goes directly to a worker that waits on `<-jobs`. The job does not go into the buffer. Go does this when a receiver waits.
_Avoid_: bypass, shortcut, direct send

**Blocked**:
The state of a producer whose send waits because the buffer is full and no worker waits to receive.
_Avoid_: stuck, frozen, hung, rejected

**Backpressure**:
The effect when all workers are busy and the buffer is full: the producer blocks, so it slows to the speed of the workers.
_Avoid_: throttling, overload, congestion

**Drained**:
The state when the producer has stopped, the buffer is empty, and all workers are idle.
_Avoid_: finished, empty, done (Done is a result)

### Worker states

**Worker state**:
One of Idle, Busy, Alert, Draining, or Offline. The pill on each worker card shows it.
_Avoid_: status, mode (Mode is Core or Resilience)

**Idle**:
A worker that is parked on `<-jobs` because the channel is empty. It uses no CPU. A worker is never idle while the buffer holds a job.
_Avoid_: free, available, sleeping (sleeping is Offline)

**Busy**:
A worker that is running a job.
_Avoid_: active, working, running (Running is the clock)

**Alert**:
A short worker state after a timeout or a transient error. The gopher is startled and the card flashes coral. Then the job goes to Retry backoff or to Failed.
_Avoid_: crash, panic, error state

**Draining**:
A worker that finishes its current job and then exits, because the visitor made the pool smaller.
_Avoid_: shutting down, killing, stopping

**Offline**:
A worker slot with no goroutine. It is not started, or it has exited.
_Avoid_: dead, disabled, removed

### Resilience

**Mode**:
The rule set of the picture: Core mode or Resilience mode.
_Avoid_: theme (Theme is light or dark), level, setting

**Core mode**:
The plain worker pool. Every job finishes. There are no deadlines, errors, or retries.
_Avoid_: basic mode, simple mode, happy path

**Resilience mode**:
The worker pool with a deadline for each attempt, transient errors, retries with backoff, and Failed.
_Avoid_: advanced mode, chaos mode, error mode

**Attempt**:
One run of a job by a worker. The first run is attempt 1. The picture permits 3 attempts.
_Avoid_: try, execution, pass

**Timeout**:
The end of an attempt when its context deadline passes before the job finishes. The worker sees `ctx.Done()` and `context.DeadlineExceeded`.
_Avoid_: expiry, kill, abort

**Context deadline**:
The time limit of one attempt, set by `context.WithTimeout`. The `ctx timeout` slider sets it.
_Avoid_: TTL, time budget, SLA

**Transient error**:
An error that can go away by itself, for example `HTTP 503`. A transient error can retry. The `Spike chance` slider sets how often one occurs.
_Avoid_: glitch, flake, random failure

**Retry**:
A new attempt of the same job after a timeout or a transient error. The badge `r1/2` means retry 1 of 2.
_Avoid_: redo, replay, resend

**Retry backoff**:
The wait before a retry. It grows after each attempt and has jitter. The Retry backoff tray shows the waiting jobs.
_Avoid_: delay, cooldown, sleep

**Jitter**:
A small random time added to the backoff so that many jobs do not retry at the same time.
_Avoid_: noise, randomness, fuzz

### The site and the picture

**Picture**:
The interactive telemetry board of the worker pool on the home page. It has the stage, the readout, and the controls.
_Avoid_: visualizer, simulation, demo, animation

**Stage**:
The part of the picture that draws the pipeline in four numbered zones: 01 Producer, 02 Channel, 03 Workers, 04 Results.
_Avoid_: canvas, diagram, scene

**Zone**:
One numbered part of the stage, with a label and a Go code caption.
_Avoid_: panel, column, section

**Gopher**:
The SVG Go gopher drawn on each worker card. Its pose shows the worker state. It is based on the Go gopher by Renée French (CC BY 4.0).
_Avoid_: mascot, avatar, character

**Job packet**:
The drawing of one job: icon badge, ID, job type, work time, and retry badge. One job has one packet from send to result.
_Avoid_: card, crate, ticket, token

**Tray**:
A small list of job packets as chips: Retry backoff, Done, or Failed.
_Avoid_: bin, bucket, list, inbox

**Readout**:
The telemetry tiles and the event log under the stage. It shows numbers such as `len(jobs)` and `busy`.
_Avoid_: dashboard, stats, HUD, metrics panel

**Controls**:
The decks under the readout: Presets, Run, Pool, and Context.
_Avoid_: toolbar, settings, instrument bar

**Preset**:
One named starting state of the worker pool in the picture: 1 Steady flow, 2 Backpressure, 3 Timeout & retry, or 4 Drain & idle.
_Avoid_: demo mode, sample scenario, example

**Step**:
One control action that pauses the picture and moves the clock forward by `0.5s`.
_Avoid_: tick, frame, advance

**Clock**:
The time of the picture, shown as `T = 3.1s`. It moves only when the picture runs or when the visitor steps.
_Avoid_: timer, wall time, timestamp

**Motion**:
The movement of job packets between zones, the shift of slots, and the change of gopher poses.
_Avoid_: animation loop, visualizer, simulation

**Program**:
The Go module in `processor/` that implements the worker pool.
_Avoid_: service, backend, code

**Lesson**:
One explanation page about the worker pool.
_Avoid_: entry, post, article

**Site**:
The published pages for the worker pool.
_Avoid_: repository, README, program

**Visitor**:
A person who reads the site and does not run the program.
_Avoid_: user, reader, audience

**Theme**:
The light or dark Go color palette applied to the site and the picture.
_Avoid_: skin, mode (Mode is Core or Resilience)

## Relationships

- A **Producer** sends **Jobs** into one **Channel**.
- A **Channel** has a **Buffer** of N **Slots**. The **Front** is slot `[0]`.
- A **Worker pool** has a fixed number of **Workers**. Each **Worker** receives one **Job** at a time and sends one **Result**.
- A **Send** to a waiting **Worker** is a **Handoff**. It skips the **Buffer**.
- When all **Workers** are **Busy** and the **Buffer** is full, the **Producer** is **Blocked**. This is **Backpressure**.
- In **Resilience mode**, each **Attempt** has a **Context deadline**. A **Timeout** or a **Transient error** gives the **Worker** a short **Alert**, then a **Retry** after **Retry backoff**, or **Failed** after the last **Attempt**.

## Flagged ambiguities

- "Mode" means only Core mode or Resilience mode. Light and dark are a **Theme**.
- "Done" is a **Result**. A pool with no work left is **Drained**.
- "Queue" is not a word for the **Channel**. Use it only in "dead-letter queue" (production name for **Failed**) and when you quote the Go runtime (`sendq`, `recvq`).
- "Sleeping" is **Offline**. A worker that waits on `<-jobs` is **Idle**.
