# ADR 0001: Keep the site and the program separate

## Status
Accepted

## Context
This repository holds a static Astro site on GitHub Pages and a Go program that implements a worker pool. A visitor opens the site in a browser. GitHub Pages serves only static files and cannot run a Go process.

## Decision
Keep the site at the repository root and place the Go program in `processor/`. The site draws a picture of the worker pool in the browser. The site never calls or runs the Go program. A lesson page may quote the Go program.

## Consequences
- GitHub Pages builds and serves the site without a server.
- You can write and run the Go program locally with `go run`.
- You must keep the picture and the Go program aligned manually as you add features.
