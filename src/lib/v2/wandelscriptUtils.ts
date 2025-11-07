import type { Pose } from "@wandelbots/nova-api/v2"

/**
 * Convert a Pose object representing a motion group position
 * into a string which represents that pose in Wandelscript.
 */
export function poseToWandelscriptString(
  pose: Pick<Pose, "position" | "orientation">,
) {
  const position = [
    pose.position?.[0] ?? 0,
    pose.position?.[1] ?? 0,
    pose.position?.[2] ?? 0,
  ]

  const orientation = [
    pose.orientation?.[0] ?? 0,
    pose.orientation?.[1] ?? 0,
    pose.orientation?.[2] ?? 0,
  ]

  const positionValues = position.map((v) => v.toFixed(1))
  // Rotation needs more precision since it's in radians
  const rotationValues = orientation.map((v) => v.toFixed(4))

  return `(${positionValues.concat(rotationValues).join(", ")})`
}
