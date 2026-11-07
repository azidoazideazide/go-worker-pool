# Worker pool

The public site teaches one Go worker pool. The site shows a picture of that pool. The program is the pool you run, and the site does not run the program.

## Language

**Worker pool**:
A fixed set of workers that take jobs from one channel.
_Avoid_: catalog, producer-consumer, cargo system

**Job**:
One piece of work that takes a set amount of time.
_Avoid_: cargo, task, entry

**Worker**:
One member of the pool. A worker takes one job at a time.
_Avoid_: dock, consumer

**Channel**:
The queue of jobs waiting for a worker.
_Avoid_: canal, queue

**Buffer**:
The maximum number of jobs that can wait in the channel.
_Avoid_: queue length, backlog

**Picture**:
The harbor drawing of the worker pool on the home page.
_Avoid_: visualizer, simulation, demo

**Program**:
The Go module in this repository that implements the worker pool.
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

**Motion**:
The movement of jobs across the channel and progress bars inside the workers.
_Avoid_: animation loop, visualizer, simulation

**Preset**:
One named starting state of the worker pool in the picture, such as normal run, full buffer, or all workers idle.
_Avoid_: demo mode, sample scenario

**Theme**:
The light mode or dark mode Go color palette applied to the site and the picture.
_Avoid_: skin, mode switch
