---
title: Syntax
description: Go syntax for goroutines, channels, range, select, and sync.WaitGroup in a worker pool.
order: 3
---

This lesson shows the Go syntax that each part of the picture uses. Use these pieces in your own `processor/` code.

## Start a goroutine

The `go` keyword starts a function in a new goroutine. The caller does not wait.

```go
go worker(id, jobs, results)
```

## Make a channel

```go
jobs := make(chan Job, 6)    // buffered: 6 slots
results := make(chan Result) // unbuffered: each send waits for a receiver
```

`len(jobs)` is the number of jobs in the buffer now. `cap(jobs)` is the number of slots. The readout shows `len(jobs)` as `2/6`.

## Send and receive

```go
jobs <- job   // send: blocks when the buffer is full
job := <-jobs // receive: blocks when the buffer is empty
```

A blocked send is **backpressure**. It slows the producer to the speed of the workers.

## Channel direction

Give each function only the direction it needs. The compiler then stops wrong use.

```go
func worker(id int, jobs <-chan Job, results chan<- Result) {
	for job := range jobs {
		start := time.Now()
		err := process(job)
		results <- Result{JobID: job.ID, Err: err, Took: time.Since(start)}
	}
}
```

- `<-chan Job`: receive only.
- `chan<- Result`: send only.

## Range and close

`for job := range jobs` receives until the channel is **closed** and empty. Only the sender closes a channel. Close it one time.

```go
for _, job := range batch {
	jobs <- job
}
close(jobs) // no more jobs: each worker's range loop ends
```

A send on a closed channel causes a panic. A receive on a closed, empty channel returns at once.

## Wait for the workers

Use `sync.WaitGroup` to know when all workers stopped. Close `results` only after `wg.Wait()`. If you close it earlier, a worker can send on a closed channel.

```go
var wg sync.WaitGroup
for id := 1; id <= 3; id++ {
	wg.Add(1)
	go func() {
		defer wg.Done()
		worker(id, jobs, results)
	}()
}

go func() {
	wg.Wait()
	close(results)
}()

for r := range results {
	log.Printf("job %d done in %s (err=%v)", r.JobID, r.Took, r.Err)
}
```

In Go 1.22 and later, each loop iteration has its own `id`. You do not need `id := id`.

## Select

`select` waits on more than one channel operation. It runs the first one that is ready.

```go
select {
case jobs <- job:
	// sent
case <-ctx.Done():
	return ctx.Err() // stop: the context was cancelled
}
```

The **Resilience** lesson uses `select` with a deadline.

## Summary

| Syntax | Picture |
| --- | --- |
| `go worker(...)` | A gopher wakes up (Offline to Idle). |
| `jobs <- job` | A packet leaves the producer. |
| `<-jobs` | An idle gopher takes `Buffer [0]`. |
| `close(jobs)` | Workers finish the buffer, then exit. |
| `results <- r` | A chip lands in Done. |
