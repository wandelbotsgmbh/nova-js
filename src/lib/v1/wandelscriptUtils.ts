import type { Pose } from "@wandelbots/nova-api/v1"

/**
 * Convert a Pose object representing a motion group position
 * into a string which represents that pose in Wandelscript.
 */
export function poseToWandelscriptString(
  pose: Pick<Pose, "position" | "orientation">,
) {
  const position = [pose.position.x, pose.position.y, pose.position.z]
  const orientation = [
    pose.orientation?.x ?? 0,
    pose.orientation?.y ?? 0,
    pose.orientation?.z ?? 0,
  ]

  const positionValues = position.map((v) => v.toFixed(1))
  // Rotation needs more precision since it's in radians
  const rotationValues = orientation.map((v) => v.toFixed(4))

  return `(${positionValues.concat(rotationValues).join(", ")})`
}
