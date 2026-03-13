# nova-js Contribution Guide

Hi! We are excited that you are interested in contributing to nova-js. Before submitting your contribution, please make sure to take a moment and read through the following guide:

## What to contribute

nova-js aims to stay lightweight to ensure good compatibility and performance. Bug fixes, compatibility or documentation improvements are always welcome. For feature development, make sure to discuss the proposed feature with maintainers before development (e.g. as a feature request issue) to ensure nova-js is the right place to add this feature.

## Repo setup

nova-js uses [pnpm](https://pnpm.io/installation) for package management. pnpm also automatically uses a consistent nodejs version specified by the repo. To install:

```bash
pnpm install
```

Then you can run the unit tests against a mocked NOVA API and socket connections:

```bash
pnpm run test
```

## Connecting NOVA

The library provides some tooling to set up a NOVA instance for testing and development.

Configure `NOVA_INSTANCE_PROVIDER` in `.env.local`:

```
NOVA_INSTANCE_PROVIDER=your-instance-provider-host
```

Then run:

```bash
pnpm run td
```

This will provision a new instance, configure a test cell with a virtual robot, and save the `NOVA` URL to `.env.local`. On subsequent runs, the existing instance will be extended instead of creating a new one.

## E2E tests

To run basic E2E tests against a live NOVA instance during development:

```bash
NOVA=SOME_IP_ADDRESS pnpm run e2e 
```

This is just for development right now, the tests are not integrated with CI yet. You will need to create a virtual robot (any robot) on the instance first for the jogging test to work.