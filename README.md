# NOVA·JS 4.0

[![NPM version](https://img.shields.io/npm/v/@wandelbots/nova-js.svg)](https://npmjs.org/package/@wandelbots/nova-js)
[![Release](https://github.com/wandelbotsgmbh/nova-js/actions/workflows/release.yml/badge.svg)](https://github.com/wandelbotsgmbh/nova-js/actions/workflows/release.yml)
[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/wandelbotsgmbh/nova-js)

This library provides an idiomatic TypeScript client for working with the Wandelbots NOVA API.

**BREAKING CHANGES:** NOVA·JS version 4.0 includes quite a bunch of changes, like dropping API v1 support. See [MIGRATION-GUIDE-V4](/docs/MIGRATION-GUIDE-V4.md) for details.

## Features

- NOVA REST API v2, including WebSocket based endpoints
- NOVA ASYNC API (*soon*)
- Robot Jogging (*soon*)
- Authenticate with NOVA via Auth0
- Authenticate with NOVA via Entra ID (*soon*)

## Also See: UI Library

If you develop a React application we also provide a set of [React components](https://github.com/wandelbotsgmbh/wandelbots-js-react-components). It includes a [Robot Jogging Panel](https://wandelbotsgmbh.github.io/wandelbots-js-react-components/?path=/docs/jogging-joggingpanel--docs), a [Robot Visualization](https://wandelbotsgmbh.github.io/wandelbots-js-react-components/?path=/docs/3d-view-robot-robot--docs) and other useful UI widgets.

## Get Started

Install with npm or your favorite package manager:

```bash
npm install @wandelbots/nova-js
```

## Basic Usage

The core of this package is the `NovaClient`, which represents a connection to a configured robot cell on a given Nova instance:

```ts
// Please make sure you import NovaClient from "@wandelbots/nova-js/v2"
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


### API calls to WebSocket endpoints

Some API endpoints require a WebSocket connection. You can open a `AutoReconnectingWebsocket` using `nova.ws`:

```ts
const controllerSocket = nova.ws.streamRobotControllerState.connect({cell: "cell", controller: "controller"})
// same as: const controllerSocket = nova.openReconnectingWebsocket(/cells/${cell}/controllers/${controller}/state-stream`)
```

It will create a persistent socket for a given Nova streaming endpoint that will handle unexpected closes with exponential backoff:

```ts
controllerSocket.addEventListener("message", (ev) => {
  console.log(ev.data)
})
```

Websockets on a given Nova client are deduplicated by path, so if you open the `AutoReconnectingWebsocket` twice with the same path you'll get the same object. The exception is if you called `dispose()`, which you may do to permanently clean up a reconnecting websocket and free its resources:

```ts
controllerSocket.dispose()
```

The reconnecting websocket interface is fairly low-level and you won't get type safety on the messages. 

## Contributing

If you would like to contribute a change to this repository, see [CONTRIBUTING.md](CONTRIBUTING.md).
