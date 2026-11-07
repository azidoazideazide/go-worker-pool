---
title: Go Syntax
description: Focused Go concurrency tutorial for the worker pool pattern — goroutines, buffered channels, directional types, range and close, sync.WaitGroup, and select.
order: 3
stage: Go Concurrency
---

This lesson moves from system design into Go code. It covers the six Go language features that power the **worker pool** in the picture and prepares you to build the companion program in `processor/`.

## 1. Start a goroutine (`go`)

The `go` keyword starts a function call concurrently in a new **goroutine**. The caller does not wait for the function to finish.

```go
go worker(id, jobs, results)
```

A goroutine starts with a tiny stack (a few kilobytes) multiplexed onto OS threads by the Go runtime. Even though goroutines are cheap, the work inside them (memory buffers, file descriptors, database queries) is not — which is why we cap them in a **worker pool**.

## 2. Make a channel (`make(chan T, N)`)

A **channel** is a typed, thread-safe line that passes values between goroutines in first-in, first-out order.

```go
jobs := make(chan Job, 6)    // buffered channel: 6 waiting slots
results := make(chan Result) // unbuffered channel: 0 waiting slots
```

Two built-in functions inspect a channel at any moment:

- `len(jobs)`: the number of jobs waiting in the **buffer** right now.
- `cap(jobs)`: the total number of **slots** allocated by `make`.

In the picture's **Readout**, `len(jobs)` is displayed as `len/cap` (for example `2/6`).

## 3. Send and receive (`<-`)

The arrow operator `<-` both sends and receives. The position of the channel tells you which operation is happening:

```go
jobs <- job   // send: puts job into the channel (blocks when buffer is full)
job := <-jobs // receive: takes Slot [0] from the channel (blocks when empty)
```

- When a worker waits on `<-jobs` and a producer runs `jobs <- job`, the Go runtime copies the value directly from the sender stack to the receiver stack (**handoff**).
- When all workers are busy and `len(jobs) == cap(jobs)`, `jobs <- job` parks the producer goroutine until a worker receives. This natural pause is **backpressure**.

## 4. Channel direction (`<-chan` and `chan<-`)

In function signatures, restrict each channel parameter to the single direction that function needs. The Go compiler then rejects accidental misuse (such as a worker closing `jobs` or reading from `results`).

```go
func worker(id int, jobs <-chan Job, results chan<- Result) {
	for job := range jobs {
		start := time.Now()
		err := process(job)
		results <- Result{JobID: job.ID, Err: err, Took: time.Since(start)}
	}
}
```

- `jobs <-chan Job`: **receive-only** inside `worker`.
- `results chan<- Result`: **send-only** inside `worker`.

## 5. Range and close (`for range` and `close`)

`for job := range jobs` keeps receiving jobs from the channel until `jobs` is **closed** and its buffer is completely empty.

```go
func produce(jobs chan<- Job, batch []Job) {
	defer close(jobs) // signal that no more jobs will be sent
	for _, job := range batch {
		jobs <- job
	}
}
```

Three rules govern `close`:

1. **Only the sender closes a channel.** A receiver must never close `jobs`, because the sender cannot tell if a channel is already closed before sending.
2. **Sending on a closed channel causes a runtime panic.**
3. **Receiving from a closedchannel first drains remaining buffered items, then returns the zero value immediately (`ok == false`).**

## 6. Coordinate worker shutdown (`sync.WaitGroup`)

When multiple workers send into one `results` channel, no single worker knows when the *other* workers are done. Use `sync.WaitGroup` to wait for every worker goroutine to exit before closing `results`:

```go
var wg sync.WaitGroup
for id := 1; id <= numWorkers; id++ {
	wg.Add(1)
	go func() {
		defer wg.Done()
		worker(id, jobs, results)
	}()
}

// Closer goroutine: waits for all workers to finish, then closes results.
go func() {
	wg.Wait()
	close(results)
}()

// Main goroutine: reads results until the closer goroutine closes the channel.
for r := range results {
	log.Printf("job %d finished in %s (err=%v)", r.JobID, r.Took, r.Err)
}
```

> In Go 1.22 and later, `for` loop variables (`id`) have per-iteration scope, so you no longer need `id := id` before `go func()`.

## 7. `select` and the two worker exit patterns

The `select` statement waits on multiple channel operations at the same time and runs whichever case becomes ready first.

When shutting down a worker pool, engineers choose between two loop patterns inside `worker`:

### Pattern A: Graceful drain (`for job := range jobs`)

When the producer calls `close(jobs)`, each worker finishes every job still sitting in the buffer before returning:

```go
func workerDrain(ctx context.Context, jobs <-chan Job, results chan<- Result) {
	for job := range jobs {
		err := runAttempt(ctx, job, 4*time.Second)
		results <- Result{JobID: job.ID, Err: err}
	}
}
```

Use **Pattern A** when queued jobs in the buffer must not be dropped on normal completion (shown in **Preset 4: Drain & idle**).

### Pattern B: Immediate stop on cancellation (`select` with `ctx.Done()`)

When you need workers to abandon the remaining queue immediately as soon as `ctx` is cancelled:

```go
func workerAbort(ctx context.Context, jobs <-chan Job, results chan<- Result) {
	for {
		select {
		case <-ctx.Done():
			return // context cancelled: exit immediately
		case job, ok := <-jobs:
			if !ok {
				return // jobs channel closed and drained: exit
			}
			err := runAttempt(ctx, job, 4*time.Second)
			results <- Result{JobID: job.ID, Err: err}
		}
	}
}
```

## Summary: Go syntax to picture mapping

| Go syntax | What happens in the picture |
| --- | --- |
| `go worker(...)` | A gopher card wakes up from **Offline** to **Idle**. |
| `jobs := make(chan Job, 6)` | Zone 02 allocates 6 buffer slots (`[5]` down to `[0]`). |
| `jobs <- job` | A job packet leaves the producer (or blocks in the outlet when full). |
| `job, ok := <-jobs` | An **Idle** gopher takes `Slot [0]` and turns **Busy**. |
| `close(jobs)` | Workers drain remaining buffer slots, then exit their loop. |
| `results <- r` | A chip lands in the **Done** (or **Failed**) tray. |
