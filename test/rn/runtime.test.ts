import { expect, test } from "vitest"

/**
 * The "rn" project is only meaningful while the emulated globals look like a
 * React Native app. These assertions fail loudly when the setup file or the
 * vitest environment drifts, so the tests next to them cannot pass for the
 * wrong reason.
 *
 * The point of the emulation is the combination: `window` exists, but it is
 * `global` rather than a DOM window, so `window.location`, `document` and web
 * storage are missing. Checking only `typeof window` tells you nothing about
 * whether a web API is available.
 */
test("has a window that is not a DOM window", () => {
  expect(typeof window).toBe("object")
  expect(window).toBe(globalThis)
  expect(window.location).toBeUndefined()

  expect(typeof document).toBe("undefined")
  expect(typeof localStorage).toBe("undefined")
  expect(typeof sessionStorage).toBe("undefined")
})

test("identifies itself as React Native and has the network primitives", () => {
  expect((navigator as { product?: string }).product).toBe("ReactNative")
  expect(typeof WebSocket).toBe("function")
  expect(typeof fetch).toBe("function")
})
