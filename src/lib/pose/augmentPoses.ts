import type { Pose as PoseData } from "@wandelbots/nova-api/v2"
import { Pose } from "./Pose.ts"

type PoseKeys = keyof PoseData

type IsExactlyPoseData<T> = [Exclude<keyof T, PoseKeys>] extends [never]
  ? [Exclude<PoseKeys, keyof T>] extends [never]
    ? true
    : false
  : false

// Depth cap avoids "type instantiation is excessively deep" on nova-api's
// large (and possibly cyclic, e.g. compound colliders) generated type graph.
type MaxDepth = [
  unknown,
  unknown,
  unknown,
  unknown,
  unknown,
  unknown,
  unknown,
  unknown,
  unknown,
  unknown,
]

type AugmentPosesCore<
  T,
  Depth extends readonly unknown[],
> = Depth["length"] extends MaxDepth["length"]
  ? T
  : IsExactlyPoseData<T> extends true
    ? Pose
    : T extends readonly (infer U)[]
      ? DeepPoseAugmented<U, [...Depth, unknown]>[]
      : T extends object
        ? { [K in keyof T]: DeepPoseAugmented<T[K], [...Depth, unknown]> }
        : T

/**
 * Type-level counterpart to `augmentPoses`: recursively replaces any
 * `PoseData`-shaped field with `Pose` (distributing over unions, e.g. so
 * optional `Pose | undefined` fields keep the `| undefined`), so the static
 * type matches what's actually returned at runtime.
 */
export type DeepPoseAugmented<
  T,
  Depth extends readonly unknown[] = [],
> = T extends unknown ? AugmentPosesCore<T, Depth> : never

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    !(value instanceof Pose)
  )
}

function isNumberTriple(value: unknown): value is number[] {
  return (
    Array.isArray(value) &&
    value.length === 3 &&
    value.every((n) => typeof n === "number")
  )
}

/**
 * Structural check for the wire shape of `Pose` (`{ position, orientation }`,
 * each a 3-number array, and nothing else). This API has no other type with
 * this exact shape, so it reliably identifies `Pose` values without needing
 * per-endpoint knowledge of which fields are poses.
 */
function isPoseShape(value: Record<string, unknown>): boolean {
  return (
    Object.keys(value).length === 2 &&
    isNumberTriple(value.position) &&
    isNumberTriple(value.orientation)
  )
}

function augmentPosesInPlace(value: unknown): void {
  if (Array.isArray(value)) {
    for (const item of value) {
      augmentPosesInPlace(item)
    }
    return
  }

  if (isPlainObject(value)) {
    if (isPoseShape(value)) {
      Object.setPrototypeOf(value, Pose.prototype)
    } else {
      for (const key of Object.keys(value)) {
        augmentPosesInPlace(value[key])
      }
    }
  }
}

/**
 * Recursively walks a parsed API response/request body, upgrading any
 * `Pose`-shaped objects in place to `Pose` instances so they gain math
 * methods (`multiply`, `inverse`, ...) while remaining JSON/wire-compatible.
 * Used automatically by `NovaAPIClient` for REST responses; exported so it
 * can also be applied manually to e.g. websocket messages.
 */
export function augmentPoses<T>(value: T): DeepPoseAugmented<T> {
  augmentPosesInPlace(value)
  return value as DeepPoseAugmented<T>
}
