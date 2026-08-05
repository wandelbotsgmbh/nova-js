/**
 * Experimental pose math helpers (`Pose`, `augmentMath`) for working with
 * position + axis-angle orientation values from the NOVA API.
 *
 * This API is experimental and may change without a major version bump.
 */
export type { Pose as PoseData } from "@wandelbots/nova-api/v2"
export {
  augmentMath,
  augmentPoses,
} from "../../lib/experimental/math/augmentMath.ts"
export type {
  DeepPoseAugmented,
  NovaWithMath,
} from "../../lib/experimental/math/augmentMath.ts"
export { Pose } from "../../lib/experimental/math/Pose.ts"
export {
  axisAngleToQuaternion,
  conjugateQuaternion,
  multiplyQuaternions,
  quaternionToAxisAngle,
  rotateVectorByQuaternion,
} from "../../lib/experimental/math/Quaternion.ts"
export type { Quaternion } from "../../lib/experimental/math/Quaternion.ts"
