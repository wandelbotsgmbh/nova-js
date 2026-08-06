/**
 * Experimental pose math helpers (`Pose`, `Quaternion`) for working with
 * position + axis-angle orientation values from the NOVA API.
 *
 * This API is experimental and may change without a major version bump.
 */
export type { Pose as PoseData } from "@wandelbots/nova-api/v2"
export { Pose } from "../../lib/experimental/math/Pose.ts"
export { Quaternion } from "../../lib/experimental/math/Quaternion.ts"
export type { QuaternionData } from "../../lib/experimental/math/Quaternion.ts"
