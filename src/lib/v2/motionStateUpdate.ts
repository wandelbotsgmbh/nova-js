import type { Pose } from "@wandelbots/nova-api/v2"

export function jointValuesEqual(
  oldJointValues: number[],
  newJointValues: number[],
  changeDeltaThreshold: number,
): boolean {
  if (newJointValues.length !== oldJointValues.length) {
    return true
  }

  for (let jointIndex = 0; jointIndex < newJointValues.length; jointIndex++) {
    if (
      Math.abs(newJointValues[jointIndex]! - oldJointValues[jointIndex]!) >
      changeDeltaThreshold
    ) {
      return false
    }
  }

  return true
}

export function tcpPoseEqual(
  oldTcp: Pose | undefined,
  newTcp: Pose | undefined,
  changeDeltaThreshold: number,
): boolean {
  // undefined -> defined (+reverse) transition
  if ((oldTcp === undefined && newTcp) || (oldTcp && newTcp === undefined)) {
    return false
  }

  // the typechecker cannot resolve states to "!= undefined" if "&&" is used
  if (oldTcp === undefined || newTcp === undefined) {
    return true
  }

  let changedDelta = 0
  if (oldTcp.orientation && newTcp.orientation) {
    changedDelta += Math.abs(oldTcp.orientation[0] - newTcp.orientation[0])
    changedDelta += Math.abs(oldTcp.orientation[1] - newTcp.orientation[1])
    changedDelta += Math.abs(oldTcp.orientation[2] - newTcp.orientation[2])
  }
  if (oldTcp.position && newTcp.position) {
    changedDelta += Math.abs(oldTcp.position[0] - newTcp.position[0])
    changedDelta += Math.abs(oldTcp.position[1] - newTcp.position[1])
    changedDelta += Math.abs(oldTcp.position[2] - newTcp.position[2])
  }

  if (changedDelta > changeDeltaThreshold) {
    return false
  }

  return true
}
