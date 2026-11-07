---
title: Resilience
description: Deadlines with context.WithTimeout, retries with backoff and jitter, a maximum number of attempts, and the Failed list.
order: 4
---

Real jobs can stop. A webhook server can hang. A database can reset the connection. This lesson adds three protections. Turn on **Resilience** mode in the picture, or choose preset **3 Timeout & retry**.

## Give each attempt a deadline

Make a new context for each **attempt**. Always call `cancel`.

```go
func runAttempt(parent context.Context, job Job, limit time.Duration) error {
	ctx, cancel := context.WithTimeout(parent, limit)
	defer cancel()
	return process(ctx, job)
}
```

The work must watch `ctx.Done()`. A deadline does not stop code that does not check the context.

```go
func process(ctx context.Context, job Job) error {
	select {
	case <-time.After(job.Work): // stands in for real work
		return nil
	case <-ctx.Done():
		return ctx.Err() // context.DeadlineExceeded
	}
}
```

In the picture, the meter shows the time of the attempt against the deadline. The thin mark shows when the job should finish. If the fill goes past the mark, the work is late and the note shows "no reply". At the deadline the gopher shows **Timeout**.

## Retry only transient errors

A **transient error** can go away by itself, for example HTTP 503. Retry it. Do not retry a permanent error, for example bad input.

## Wait before a retry: backoff with jitter

Do not retry at once. Wait a little longer after each failure. Add a small random **jitter**, so that many jobs do not retry at the same time.

```go
func backoff(attempt int) time.Duration {
	base := 800 * time.Millisecond << (attempt - 2) // 0.8s, 1.6s, ...
	jitter := time.Duration(rand.Int64N(int64(300 * time.Millisecond)))
	return base + jitter
}
```

The picture shows each waiting job in **Retry backoff** with a ring. The ring fills until the retry.

## Stop after a maximum

Set a maximum number of **attempts**. The picture uses 3: the first run and 2 retries. After the last attempt fails, the job goes to **Failed**. In production this is a **dead-letter queue**: a person or a tool looks at it later.

## Do not deadlock on the retry

Do not send the retry back into `jobs` from inside a worker. If the buffer is full, every worker can block on its own send. Then nobody receives, and the pool stops.

Use one of these instead:

1. Retry inside the worker, in a loop, with a new context for each attempt.
2. Send failed jobs to a separate retry goroutine. That goroutine waits for the backoff and then sends to `jobs`.

The picture uses option 2. A retry that finds a full buffer waits in the backoff tray. It does not block a worker.

## Stop the pool cleanly

Use `signal.NotifyContext` to cancel everything on Ctrl+C. Stop sending, close `jobs`, then wait for the workers.

```go
ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt)
defer stop()
```

Pass this `ctx` to the producer and to each attempt. When it is cancelled, running attempts end at their next `ctx.Done()` check.

## Checklist

1. Each attempt has its own `context.WithTimeout` and calls `cancel`.
2. The work checks `ctx.Done()`.
3. Only transient errors retry.
4. Backoff grows and has jitter.
5. A maximum of attempts sends the job to Failed.
6. No worker sends into `jobs`.
7. `go test -race ./...` passes.
