---
title: Build It
description: Step-by-step 5-part blueprint to build, wire, shut down cleanly, and race-test the companion Go worker pool in processor/.
order: 4
stage: Go Implementation
---

This lesson walks you through building the companion Go **program** inside `processor/` in five steps. You write and run this code in your terminal.

> **Architecture boundary (ADR-0001):** The static site and `processor/` stay separate. The browser picture models the pool in TypeScript and never imports or calls the Go module.

## What you need

- Go 1.22 or later (`go version`).
- A terminal open at the repository root.

```sh
cd processor
go mod init github.com/azidoazideazide/go-worker-pool/processor
```

Keep the implementation in a single `main` package while you build the core pattern. Split into subpackages only when the code outgrows one file.

---

## The 5-step implementation blueprint

### Step 1: Define `Job`, `Result`, and the `process` function

A **job** holds the input data, work time, and attempt counter. A **result** carries the outcome back from a worker.

```go
package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"os/signal"
	"sync"
	"time"
)

type JobType string

const (
	JobEmail   JobType = "email"
	JobWebhook JobType = "webhook"
	JobImage   JobType = "image"
	JobSync    JobType = "sync"
)

type Job struct {
	ID      int
	Type    JobType
	Work    time.Duration // simulated work time, for example 2 * time.Second
	Attempt int           // 1 on the first attempt
}

type Result struct {
	JobID int
	Type  JobType
	Err   error
	Took  time.Duration
}

func process(ctx context.Context, job Job) error {
	select {
	case <-time.After(job.Work):
		return nil
	case <-ctx.Done():
		return ctx.Err()
	}
}
```

### Step 2: Prepare the `jobs` channel and the Producer

Create the buffered `jobs` channel (`Zone 02`) and start the **producer** goroutine (`Zone 01`). The producer always closes `jobs` when it finishes sending.

```go
func startProducer(ctx context.Context, jobs chan<- Job, batch []Job) {
	go func() {
		defer close(jobs)
		for _, job := range batch {
			select {
			case <-ctx.Done():
				return
			case jobs <- job:
			}
		}
	}()
}
```

### Step 3: Start the Worker pool and `WaitGroup` closer

Start a fixed number of worker goroutines (`Zone 03`). Each worker wraps its attempt in `context.WithTimeout`, runs `process`, and sends one `Result`. A background closer goroutine waits for all workers to finish before closing `results`.

```go
func startWorkerPool(
	ctx context.Context,
	numWorkers int,
	attemptTimeout time.Duration,
	jobs <-chan Job,
	results chan<- Result,
) {
	var wg sync.WaitGroup

	for id := 1; id <= numWorkers; id++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			for job := range jobs {
				start := time.Now()
				attemptCtx, cancel := context.WithTimeout(ctx, attemptTimeout)
				err := process(attemptCtx, job)
				cancel()

				results <- Result{
					JobID: job.ID,
					Type:  job.Type,
					Err:   err,
					Took:  time.Since(start),
				}
			}
		}()
	}

	go func() {
		wg.Wait()
		close(results)
	}()
}
```

### Step 4: Collect the `Result` values (`Zone 04`)

Range over `results` in `main` until the closer goroutine closes the channel:

```go
func collectResults(results <-chan Result) (doneCount, failedCount int) {
	for r := range results {
		if r.Err != nil {
			failedCount++
			log.Printf("[FAILED] job %d (%s) after %s: %v", r.JobID, r.Type, r.Took, r.Err)
			continue
		}
		doneCount++
		log.Printf("[DONE]   job %d (%s) in %s", r.JobID, r.Type, r.Took)
	}
	return doneCount, failedCount
}
```

### Step 5: Wire graceful shutdown in `main`

Connect `signal.NotifyContext` so pressing `Ctrl+C` cancels the parent context cleanly:

```go
func main() {
	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt)
	defer stop()

	const (
		numWorkers     = 3
		bufferCapacity = 6
		attemptTimeout = 4 * time.Second
	)

	jobs := make(chan Job, bufferCapacity)
	results := make(chan Result)

	batch := []Job{
		{ID: 101, Type: JobEmail, Work: 1 * time.Second, Attempt: 1},
		{ID: 102, Type: JobWebhook, Work: 2 * time.Second, Attempt: 1},
		{ID: 103, Type: JobImage, Work: 5 * time.Second, Attempt: 1}, // exceeds 4s timeout
		{ID: 104, Type: JobSync, Work: 2 * time.Second, Attempt: 1},
	}

	startProducer(ctx, jobs, batch)
	startWorkerPool(ctx, numWorkers, attemptTimeout, jobs, results)

	done, failed := collectResults(results)
	fmt.Printf("pool drained: done=%d failed=%d\n", done, failed)
}
```

---

## Run, test, and verify with the race detector

| Command | What it does |
| --- | --- |
| `go run .` | Builds and runs the worker pool in `processor/`. |
| `go test ./...` | Runs all unit tests in the module. |
| `go test -race ./...` | Runs tests with the Go race detector enabled. Mandatory for all concurrent code. |
| `go vet ./...` | Checks for common concurrency mistakes (such as copying a `sync.WaitGroup`). |

Always run `go test -race ./...` after every change. The race detector catches two goroutines reading and writing the same memory without channel or lock synchronization.

## Implementation checklist

1. `processor/go.mod` compiles cleanly with Go 1.22+.
2. `jobs` is closed only by the producer (`defer close(jobs)`).
3. `results` is closed only after `wg.Wait()` returns.
4. Each attempt creates a `context.WithTimeout` and calls `cancel()`.
5. `go vet ./...` and `go test -race ./...` pass with zero warnings.
