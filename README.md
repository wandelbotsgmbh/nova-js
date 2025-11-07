# @wandelbots/nova-js

[![NPM version](https://img.shields.io/npm/v/@wandelbots/nova-js.svg)](https://npmjs.org/package/@wandelbots/nova-js)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/@wandelbots/nova-js)](https://bundlephobia.com/result?p=@wandelbots/nova-js)
[![Release](https://github.com/wandelbotsgmbh/nova-js/actions/workflows/release.yml/badge.svg)](https://github.com/wandelbotsgmbh/nova-js/actions/workflows/release.yml)
[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/wandelbotsgmbh/nova-js)

This library provides an idiomatic TypeScript client for working with the Wandelbots NOVA API.

```bash
npm install @wandelbots/nova-js
```

If you develop a React application we also provide a set of [React components](https://github.com/wandelbotsgmbh/wandelbots-js-react-components). It includes a [Robot Jogging Panel](https://wandelbotsgmbh.github.io/wandelbots-js-react-components/?path=/docs/jogging-joggingpanel--docs), a [Robot Visualization](https://wandelbotsgmbh.github.io/wandelbots-js-react-components/?path=/docs/3d-view-robot--docs) and other useful UI widgets.

## Table of contents

- [Basic usage](#basic-usage)
- [API calls](#api-calls)
- [API version support](#api-version-support)
- [Opening websockets](#opening-websockets)
- [Execute Wandelscript (V1)](#execute-wandelscript-v1)

## Basic usage

The core of this package is the `NovaClient`, which represents a connection to a configured robot cell on a given Nova instance:

```ts
// Please make sure you import NovaClient from "@wandelbots/nova-js/v2"
//
// The NovaClient from "@wandelbots/nova-js" is still API v1,
// but it will be removed in the future, use "@wandelbots/nova-js/v1" if
// you need the API v1 client
import { NovaClient } from "@wandelbots/nova-js/v2"

const nova = new NovaClient({
  instanceUrl: "https://example.instance.wandelbots.io",
  cellId: "cell",
  // Access token is given in the developer portal UI when you create an instance
  accessToken: "...",
})
```

### API calls

You can make calls to the REST API via `nova.api`, which contains a bunch of namespaced methods for each endpoint generated from the OpenAPI spec and documentation.

For example, to list the controllers configured in your cell:

```ts
const controllerIds = await nova.api.controller.listRobotControllers()
// -> e.g. ["ur5e", ...]
```

Documentation for the various API endpoints is available on your Nova instance at `/api/v2/ui` or on [portal.wandelbots.io](https://portal.wandelbots.io/docs/api/v2/ui/)


## API version support

This library supports **Nova API v1** and **v2**. Please note that except for Wandelscript execution, usage of **API v1** is deprecated and not recommended.

V1 usage:

```ts
// The NovaClient from "@wandelbots/nova-js" is still API v1,
// but it will be removed in the future, use "@wandelbots/nova-js/v1" if
// you need the API v1 client
import { NovaClient } from "@wandelbots/nova-js/v1"

const nova = new NovaClient({
  instanceUrl: "https://example.instance.wandelbots.io",
  cellId: "cell",
  accessToken: "...",
})

// Deprecated API version is still callable
const { instances } = await nova.api.controller.listControllers()
```

*Please note*: When using the v1 client, please make sure to add `"three"` to your package.json, since it will be moved to peer dependency in *v4.0* of this library.

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
