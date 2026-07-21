import { isAxiosError } from "axios"
import { tryStringifyJson } from "./converters.ts"

export function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Attempts to make a helpful error message from an unknown thrown error
 * or promise rejection.
 *
 * This function is mainly to aid debugging and good bug reports. For
 * expected errors encountered by end users, it's more ideal to catch
 * the specific error code and provide a localized app-specific error message.
 */
export function makeErrorMessage(err: unknown): string {
  if (isAxiosError(err)) {
    if (err.response) {
      return `${err.response?.status} ${err.response?.statusText} from ${err.response?.config.method?.toUpperCase() || "accessing"} ${err.response?.config.url}: ${JSON.stringify(err.response?.data)}`
    } else if (err.config) {
      if (err.code === "ERR_NETWORK") {
        return `${err.message} from ${err.config.method?.toUpperCase() || "accessing"} ${err.config.url}. This error can happen because of either connection issues or server CORS policy.`
      } else {
        return `${err.message} from ${err.config.method?.toUpperCase() || "accessing"} ${err.config.url}`
      }
    }
  } else if (err instanceof Error) {
    return err.message
  } else if (typeof err === "string") {
    return err
  } else if (typeof err === "object") {
    return tryStringifyJson(err) || `Unserializable object ${err}`
  }

  return `${err}`
}

/**
 * Reloads the page with protection against loops.
 * Allows at most one reload per 10 seconds; otherwise throws
 * an error.
 */
export function guardedPageReload(key: string): Promise<never> {
  const RELOAD_KEY = `novajs_reload_guard:${key}`
  const RELOAD_COOLDOWN_MS = 10_000
  const lastReloadAt = Number(window.sessionStorage.getItem(RELOAD_KEY) ?? "0")

  if (Date.now() - lastReloadAt < RELOAD_COOLDOWN_MS) {
    throw new Error(
      `Unhandled error caused a reload (${key}), but a reload was already attempted recently. Aborting to prevent reload loop.`,
    )
  }

  window.sessionStorage.setItem(RELOAD_KEY, String(Date.now()))
  window.location.reload()

  return new Promise(() => {}) // never settles, the page should be reloading
}
