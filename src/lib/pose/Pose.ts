import type { Pose as PoseData } from "@wandelbots/nova-api/v2"
import {
  axisAngleToQuaternion,
  conjugateQuaternion,
  multiplyQuaternions,
  quaternionToAxisAngle,
  rotateVectorByQuaternion,
} from "./quaternionMath.ts"

const ZERO_VECTOR = [0, 0, 0]

function addVectors(a: number[], b: number[]): number[] {
  return [
    (a[0] ?? 0) + (b[0] ?? 0),
    (a[1] ?? 0) + (b[1] ?? 0),
    (a[2] ?? 0) + (b[2] ?? 0),
  ]
}

function negateVector(a: number[]): number[] {
  return [-(a[0] ?? 0), -(a[1] ?? 0), -(a[2] ?? 0)]
}

/**
 * A `Pose` (position + axis-angle orientation) with methods for composing
 * and inverting transforms. Instances are plain-data compatible with the
 * wire-format `PoseData` type (own `position`/`orientation` properties only,
 * no enumerable methods), so they can be passed directly back into API calls
 * that expect a pose.
 *
 * Poses returned from `NovaAPIClient`/`Nova` are automatically upgraded to
 * `Pose` instances; construct one directly only when you have a pose from
 * elsewhere (e.g. a websocket message).
 */
export class Pose implements PoseData {
  readonly position: number[]
  readonly orientation: number[]

  constructor(
    position: number[] = ZERO_VECTOR,
    orientation: number[] = ZERO_VECTOR,
  ) {
    this.position = position
    this.orientation = orientation
  }

  static from(pose: PoseData): Pose {
    if (pose instanceof Pose) {
      return pose
    }
    return new Pose(
      pose.position ?? ZERO_VECTOR,
      pose.orientation ?? ZERO_VECTOR,
    )
  }

  static identity(): Pose {
    return new Pose()
  }

  /**
   * Compose this pose with `other`, treating `other` as being expressed in
   * this pose's coordinate frame. Equivalent to the homogeneous transform
   * product `this * other`: applying the result to a point is the same as
   * applying `other` first, then `this`.
   */
  multiply(other: PoseData): Pose {
    const q1 = axisAngleToQuaternion(this.orientation)
    const q2 = axisAngleToQuaternion(other.orientation ?? ZERO_VECTOR)

    const position = addVectors(
      this.position,
      rotateVectorByQuaternion(q1, other.position ?? ZERO_VECTOR),
    )
    const orientation = quaternionToAxisAngle(multiplyQuaternions(q1, q2))

    return new Pose(position, orientation)
  }

  /** The inverse transform, such that `pose.multiply(pose.inverse())` is the identity pose. */
  inverse(): Pose {
    const q = axisAngleToQuaternion(this.orientation)
    const qInverse = conjugateQuaternion(q)

    const position = rotateVectorByQuaternion(
      qInverse,
      negateVector(this.position),
    )
    // Negating an axis-angle vector gives the inverse rotation directly.
    const orientation = negateVector(this.orientation)

    return new Pose(position, orientation)
  }

  /** Apply this pose's transform to a point, returning the transformed point. */
  transformPoint(point: number[]): number[] {
    const q = axisAngleToQuaternion(this.orientation)
    return addVectors(this.position, rotateVectorByQuaternion(q, point))
  }

  /** Compare to another pose within a tolerance, since floating-point pose math rarely produces exact equality. */
  equals(other: PoseData, epsilon = 1e-9): boolean {
    const otherPosition = other.position ?? ZERO_VECTOR
    const otherOrientation = other.orientation ?? ZERO_VECTOR

    return (
      this.position.every(
        (v, i) => Math.abs(v - (otherPosition[i] ?? 0)) <= epsilon,
      ) &&
      this.orientation.every(
        (v, i) => Math.abs(v - (otherOrientation[i] ?? 0)) <= epsilon,
      )
    )
  }

  toJSON(): PoseData {
    return { position: this.position, orientation: this.orientation }
  }
}
