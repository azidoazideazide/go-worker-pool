---
title: Setup
description: Make the Go module in processor/, define the Job and Result types, and run the race detector.
order: 1
---

This lesson prepares the companion Go program. You write the program. The site does not call it.

> The site and `processor/` stay separate. The site never imports or calls the Go program (ADR-0001).

## What you need

- Go 1.22 or later. Run `go version` to check.
- A terminal in the repository root.

## Make the module

Go into the `processor/` folder. Make one module there.

```sh
cd processor
go mod init github.com/azidoazideazide/go-worker-pool/processor
```

Keep the program in one `main` package at first. Split it into packages only when the code tells you to.

## Define the data

A **job** is one unit of work. A **result** is what a worker sends back after one job.

```go
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
	Work    time.Duration // fake work time, for example 4 * time.Second
	Attempt int           // 1 for the first run
}

type Result struct {
	JobID int
	Err   error
	Took  time.Duration
}
```

The picture uses the same fields. The job packet shows the ID, the type tag, the work time, and the retry badge (`r1/2` means retry 1 of 2).

## Run and test

| Command | What it does |
| --- | --- |
| `go run .` | Builds and runs the program. |
| `go test ./...` | Runs every test in the module. |
| `go test -race ./...` | Runs the tests with the race detector. Use this for all concurrent code. |
| `go vet ./...` | Finds common mistakes. |

Run `go test -race ./...` after each change. The race detector finds two goroutines that touch the same memory without a lock or a channel.

## Checklist

1. `processor/go.mod` exists.
2. `Job` and `Result` types compile.
3. `go test -race ./...` passes, even with no tests yet.

Next: the **Design** lesson maps each part of the picture to Go code.
