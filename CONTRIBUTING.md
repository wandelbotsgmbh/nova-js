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
