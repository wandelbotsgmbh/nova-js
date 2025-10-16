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
