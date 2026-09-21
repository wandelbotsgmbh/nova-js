// Some general checks about the context the nova-js code is running in

// `typeof window` alone does not tell us whether a browser is present: React
// Native defines `window` as an alias of `global`, and that object has no
// `location`. Reading a property of it throws while this module loads, which
// breaks the import in a native app. Code that needs the browser APIs
// (`window.location`, `window.sessionStorage`) has to check this instead of
// `typeof window`.
export const hasBrowserLocation =
  typeof window !== "undefined" && typeof window.location !== "undefined"

export const isLocalhostDev =
  hasBrowserLocation &&
  window.location.hostname === "localhost" &&
  process.env.NODE_ENV === "development"
