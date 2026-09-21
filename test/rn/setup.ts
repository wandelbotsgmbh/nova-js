// React Native execution environment, emulated on top of the node environment
// (see the "rn" project in vitest.config.ts).
//
// React Native is not a browser and not plain node:
//   - it defines `window` as an alias of `global`, so `typeof window` is
//     "object"; but that object has no `location` and no web storage, and
//     `document` does not exist at all
//   - the platform identifies itself through `navigator.product`
//   - `fetch` and `WebSocket` exist and behave like the browser ones

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

// React Native's Navigator: `product` is the platform marker libraries check.
// Node defines `navigator` as a getter-only property, so it has to be
// redefined rather than assigned.
Object.defineProperty(globalThis, "navigator", {
  value: {
    product: "ReactNative",
    userAgent: "ReactNative",
  },
  configurable: true,
  writable: true,
})
