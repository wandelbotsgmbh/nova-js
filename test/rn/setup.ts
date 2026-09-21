// React Native execution environment, emulated on top of the node environment
// (see the "rn" project in vitest.config.ts).
//
// React Native is not a browser and not plain node:
//   - it defines `window` as an alias of `global`, so `typeof window` is
//     "object"; but that object has no `location` and no web storage, and
//     `document` does not exist at all
//   - `fetch` and `WebSocket` exist and behave like the browser ones
//
// The globals match what React Native 0.87.1 shows under
// `@react-native/jest-preset` 0.87.1, the environment a native app's tests
// run in. `navigator.product` is deliberately not emulated: that environment
// leaves it undefined, and this library does not read it.

const emulatedGlobals = globalThis as {
  location?: unknown
  document?: unknown
  localStorage?: unknown
  sessionStorage?: unknown
}

// React Native's `window` is `global`; there is no `location` on it.
Object.defineProperty(globalThis, "window", {
  value: globalThis,
  configurable: true,
  writable: true,
})

// Present in a browser, absent in React Native: `document`, web storage, and
// anything that would only exist on a `window` that is a real DOM window.
delete emulatedGlobals.location
delete emulatedGlobals.document
delete emulatedGlobals.localStorage
delete emulatedGlobals.sessionStorage
