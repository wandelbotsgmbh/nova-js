// Some general checks about the context the nova-js code is running in

const isBrowser = typeof window !== "undefined"

export const isLocalhostDev =
  isBrowser &&
  window.location.hostname === "localhost" &&
  process.env.NODE_ENV === "development"
