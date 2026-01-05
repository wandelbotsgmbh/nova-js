export type URLParseOptions = {
  /**
   * Ignore any scheme in the input string and force this scheme instead.
   */
  scheme?: "http" | "https"
  /**
   * If the input string does not include a scheme, use this as the default
   * scheme.
   */
  defaultScheme?: "http" | "https"
}

/**
 * Parse a string as a URL, with options to enforce or default the scheme.
 */
export function parseUrl(url: string, options: URLParseOptions = {}): URL {
  const { scheme, defaultScheme } = options

  const schemeRegex = /^[a-zA-Z]+:\/\//

  if (scheme) {
    // Force the scheme by removing any existing scheme and prepending the desired one
    url = url.replace(schemeRegex, "")
    url = `${scheme}://${url}`
  } else if (defaultScheme && !schemeRegex.test(url)) {
    // No scheme is present, add the default one
    url = `${defaultScheme}://${url}`
  }

  return new URL(url)
}

/**
 * Attempt to parse a string as a URL; return undefined if we can't
 */
export function tryParseUrl(
  url: string,
  options: URLParseOptions = {},
): URL | undefined {
  try {
    return parseUrl(url, options)
  } catch {
    return undefined
  }
}

/**
 * Permissively parse a NOVA instance URL from a config variable.
 * If scheme is not specified, defaults to https for *.wandelbots.io hosts,
 * and http otherwise.
 * Throws an error if a valid URL could not be determined.
 */
export function parseNovaInstanceUrl(url: string): URL {
  const testUrl = tryParseUrl(url, { defaultScheme: "http" })
  if (testUrl?.host.endsWith(".wandelbots.io")) {
    return parseUrl(url, { defaultScheme: "https" })
  } else {
    return parseUrl(url, { defaultScheme: "http" })
  }
}

/** Try to parse something as JSON; return undefined if we can't */
// biome-ignore lint/suspicious/noExplicitAny: it's json
export function tryParseJson(json: unknown): any {
  try {
    return JSON.parse(json as string)
  } catch {
    return undefined
  }
}

/** Try to turn something into JSON; return undefined if we can't */
export function tryStringifyJson(json: unknown): string | undefined {
  try {
    return JSON.stringify(json)
  } catch {
    return undefined
  }
}

/**
 * Converts object parameters to query string.
 * e.g. { a: "1", b: "2" } => "?a=1&b=2"
 *      {} => ""
 */
export function makeUrlQueryString(obj: Record<string, string>): string {
  const str = new URLSearchParams(obj).toString()
  return str ? `?${str}` : ""
}

/** Convert radians to degrees */
export function radiansToDegrees(radians: number): number {
  return radians * (180 / Math.PI)
}

/** Convert degrees to radians */
export function degreesToRadians(degrees: number): number {
  return degrees * (Math.PI / 180)
}

/**
 * Check for coordinate system id equivalence, accounting for the "world" default
 * on empty/undefined values.
 */
export function isSameCoordinateSystem(
  firstCoordSystem: string | undefined,
  secondCoordSystem: string | undefined,
) {
  if (!firstCoordSystem) firstCoordSystem = "world"
  if (!secondCoordSystem) secondCoordSystem = "world"

  return firstCoordSystem === secondCoordSystem
}

/**
 * Helpful const for converting {x, y, z} to [x, y, z] and vice versa
 */
export const XYZ_TO_VECTOR = { x: 0, y: 1, z: 2 }
