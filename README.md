# @wandelbots/nova-js

[![NPM version](https://img.shields.io/npm/v/@wandelbots/nova-js.svg)](https://npmjs.org/package/@wandelbots/nova-js)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/@wandelbots/nova-js)](https://bundlephobia.com/result?p=@wandelbots/nova-js)
[![Release](https://github.com/wandelbotsgmbh/nova-js/actions/workflows/release.yml/badge.svg)](https://github.com/wandelbotsgmbh/nova-js/actions/workflows/release.yml)
[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/wandelbotsgmbh/nova-js)

This library provides an idiomatic TypeScript client for working with the Wandelbots NOVA API.

```bash
npm install @wandelbots/nova-js
```

If you develop an React application we also provide a set of [React components](https://github.com/wandelbotsgmbh/wandelbots-js-react-components) which you can use together with this library.

## Table of contents

- [Basic usage](#basic-usage)
- [API Version Support](#api-version-support)
- [API calls](#api-calls)
- [Opening websockets](#opening-websockets)
- [Connect to a motion group](#connect-to-a-motion-group)
- [Jogging](#jogging)
  - [Stopping the jogger](#stopping-the-jogger)
  - [Jogging: Rotating a joint](#jogging-rotating-a-joint-rotatejoints)
  - [Jogging: Moving a TCP](#jogging-moving-a-tcp-translatetcp)
  - [Jogging: Rotating a TCP](#jogging-rotating-a-tcp-rotatetcp)
  - [Trajectory: Plan and run incremental motion](#trajectory-plan-and-run-incremental-motion-runincrementalcartesianmotion)
  - [Post-jogging cleanup](#post-jogging-cleanup)
  - [Jogging UI Panel](#jogging-ui-panel)
- [Execute Wandelscript (V1)](#execute-wandelscript-v1)

## Basic usage

The core of this package is the `NovaClient`, which represents a connection to a configured robot cell on a given Nova instance:

```ts
import { NovaClient } from "@wandelbots/nova-js/v2"

const nova = new NovaClient({
  instanceUrl: "https://example.instance.wandelbots.io",
  cellId: "cell",
  // Access token is given in the developer portal UI when you create an instance
  accessToken: "...",
})
```

## API Version Support

This library supports **Nova API v1** and **v2**, which provides extra functionality including motion group connections, jogging, and all the features documented below. Please note that except for Wandelscript execution, usage of **API v1** is deprecated and not recommended.

V1 usage:

```ts
import { NovaClient } from "@wandelbots/nova-js/v1"

const nova = new NovaClient({
  instanceUrl: "https://example.instance.wandelbots.io",
  cellId: "cell",
  accessToken: "...",
})

// Deprecated API version is still callable
const { instances } = await nova.api.controller.listControllers()
```

## API calls

You can make calls to the REST API via `nova.api`, which contains a bunch of namespaced methods for each endpoint generated from the OpenAPI spec and documentation.

For example, to list the controllers configured in your cell:

```ts
const controllerIds = await nova.api.controller.listRobotControllers()
// -> e.g. ["ur5e", ...]
```

Documentation for the various API endpoints is available on your Nova instance at `/api/v2/ui` or on [portal.wandelbots.io](https://portal.wandelbots.io/docs/api/v2/ui/)

## Opening websockets

`NovaClient` has various convenience features for websocket handling in general. Use `openReconnectingWebsocket` to get a persistent socket for a given Nova streaming endpoint that will handle unexpected closes with exponential backoff:

```ts
const programStateSocket = nova.openReconnectingWebsocket(`/programs/state`)

this.programStateSocket.addEventListener("message", (ev) => {
  console.log(ev.data)
})
```

Websockets on a given Nova client are deduplicated by path, so if you call `openReconnectingWebsocket` twice with the same path you'll get the same object. The exception is if you called `dispose`, which you may do to permanently clean up a reconnecting websocket and free its resources:

```ts
programStateSocket.dispose()
```

The reconnecting websocket interface is fairly low-level and you won't get type safety on the messages. So when available, you'll likely want to use one of the following endpoint-specific abstractions instead which are built on top!

## Connect to a motion group

The library provides an easy to use way to access properties of a motion group.

```ts
activeRobot = await nova.connectMotionGroup(`some-motion-group-id`)
```

This connected motion group opens a websocket and listens to changes of the current joints and the TCP pose. You can read out those values by using the `rapidlyChangingMotionState` of the object. Along other properties it also provides the current `safetySetup` and `tcps`.

```ts
const newJoints =
  activeRobot.rapidlyChangingMotionState.joint_position
```

**Api V2 change:** Please not that joints are now directly accessible in `rapidlyChangingMotionState.joint_position`, previously there were nested in `.rapidlyChangingMotionState.state.joint_position.joints`.

To render a visual representation, you can use the `robot` component of the [react components](https://wandelbotsgmbh.github.io/wandelbots-js-react-components/?path=/docs/3d-view-robot--docs).

## Jogging

Jogging in a robotics context generally refers to the manual movement of the robot via direct human input. The Wandelbots platform provides websocket-based jogging methods which can be used to build similar jogging interfaces to those found on teach pendants.

```ts
const jogger = await nova.connectJogger(`some-motion-group-id`) // or to set options
// const jogger = await nova.connectJogger(`some-motion-group-id`, { options })
```

The jogger's mode is set to "off" first. You'll need to set it to "jogging" or "trajectory" to be able to
send movement commands

```ts
// Set jogger to "jogging" mode and sends InitializeJoggingRequest to API
await jogger.setJoggingMode("jogging")

// You can update options ater initializing like this:
await jogger.setOptions({
  tcp: "Flange", // TCP id
  timeout: 3000 // How long the promise should wait when server does not respond to init request
  orientation: "mode",
})

// For planned motions, use "trajectory" mode
await jogger.setJoggingMode("trajectory")
await jogger.rotateTCP({...}) // Error: Continuous jogging websocket not connected; ...
await jogger.runIncrementalCartesianMotion({...}) // Plan and run trajectory
```

### Stopping the jogger

For safety purposes, let's first consider how to stop the jogger. Calling stop will stop all motion types regardless of mode:

```ts
await jogger.stop()
```

As a failsafe, the server will also stop any jogging motions when it detects the relevant websocket has been closed. This means that if e.g. the network connection drops out or the browser tab is closed in the middle of a motion, it will stop automatically.

However, you should never totally rely on any software being able to stop the robot: always have the hardware emergency stop button within reach just in case!

### Jogging: Rotating a joint `rotateJoints`

This example starts joint 0 of the robot rotating in a positive direction at 1 radian per second:

```ts
await jogger.rotateJoints({
  joint: 0,
  direction: "+",
  velocityRadsPerSec: 1,
})
```

### Jogging: Moving a TCP `translateTCP`

This example starts moving a TCP in a positive direction along the X axis of the specified coordinate system, at a velocity of 10 millimeters per second:

```ts
await jogger.translateTCP({
  axis: "x",
  direction: "+",
  velocityMmPerSec: 10,
})
```

### Jogging: Rotating a TCP `rotateTCP`

This example starts rotating the TCP in a positive direction around the X axis of the specified coordinate system, at a velocity of 1 radians per second:

```ts
await jogger.rotateTCP({
  axis: "x",
  direction: "+",
  velocityRadsPerSec: 1,
})
```

### Trajectory: Plan and run incremental motion `runIncrementalCartesianMotion`

```ts
await jogger.runIncrementalCartesianMotion({...})
```

### Post-jogging cleanup

When you are done with a jogger, make sure to call dispose:

```ts
await jogger.dispose()
```

This will close any open websockets and ensure things are left in a good state.

### Jogging UI Panel

You can use the [Jogging Panel](https://wandelbotsgmbh.github.io/wandelbots-js-react-components/?path=/docs/jogging-joggingpanel--docs) from the [react components](https://github.com/wandelbotsgmbh/wandelbots-js-react-components) library to get a easy to use visualization component.

## Execute Wandelscript (V1)

The `ProgramStateConnection` provides an object which allows to execute and stop a given Wandelscript.

```ts
import script from "./example.ws"
...
programRunner.executeProgram(script)
```

You can `stop` the current execution or listen to state updates of your wandelscript code by observing the `programRunner.executionState`.

## Contributing

If you would like to contribute a change to this repository, see [CONTRIBUTING.md](CONTRIBUTING.md).
