import type { Pose as PoseData } from "@wandelbots/nova-api/v2"
import { Quaternion } from "./Quaternion.ts"

const ZERO_VECTOR = [0, 0, 0]

// Matches wb-robotix's Constants.h TOLERANCE_MILLI, the default isApprox tolerance.
const TOLERANCE_MILLI = 1e-3

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

function isFiniteVector3(v: number[]): boolean {
  return v.length === 3 && v.every((n) => Number.isFinite(n))
}

/**
 * A `Pose` (position + axis-angle orientation) with methods for composing
 * and inverting transforms. Instances are plain-data compatible with the
 * wire-format `PoseData` type (own `position`/`orientation` properties only,
 * no enumerable methods), so they can be passed directly back into API calls
 * that expect a pose.
 */
export class Pose implements PoseData {
  readonly position: number[]
  readonly orientation: number[]

  constructor(
    position: number[] = ZERO_VECTOR,
    orientation: number[] = ZERO_VECTOR,
  ) {
    if (!isFiniteVector3(position)) {
      throw new Error(
        `Pose constructor: position must be an array of 3 finite numbers, got ${JSON.stringify(position)}`,
      )
    }
    if (!isFiniteVector3(orientation)) {
      throw new Error(
        `Pose constructor: orientation must be an array of 3 finite numbers, got ${JSON.stringify(orientation)}`,
      )
    }
    // Copy defensively so mutating the caller's arrays afterward can't
    // change this (supposedly immutable) instance's state.
    this.position = [...position]
    this.orientation = [...orientation]
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
    const q1 = Quaternion.fromRotationVector(this.orientation)
    const q2 = Quaternion.fromRotationVector(other.orientation ?? ZERO_VECTOR)

    const position = addVectors(
      this.position,
      q1.rotateVector(other.position ?? ZERO_VECTOR),
    )
    const orientation = q1.multiply(q2).toRotationVector()

    return new Pose(position, orientation)
  }

  /** The inverse transform, such that `pose.multiply(pose.inverse())` is the identity pose. */
  inverse(): Pose {
    const qInverse = Quaternion.fromRotationVector(this.orientation).inverse()

    const position = qInverse.rotateVector(negateVector(this.position))
    // Negating an axis-angle vector gives the inverse rotation directly.
    const orientation = negateVector(this.orientation)

    return new Pose(position, orientation)
  }

  /** Apply this pose's transform to a point, returning the transformed point. */
  transformPoint(point: number[]): number[] {
    const q = Quaternion.fromRotationVector(this.orientation)
    return addVectors(this.position, q.rotateVector(point))
  }

  /**
   * Compare to another pose using separate position/orientation tolerances,
   * matching wb-robotix's `Pose::isApprox()`: Euclidean distance for
   * position, and quaternion angular distance for orientation - not a naive
   * per-component diff, since two rotation vectors can represent nearly
   * identical rotations while differing componentwise near a
   * canonicalization boundary (e.g. close to the +/-pi wraparound).
   */
  isApprox(
    other: PoseData,
    deltaPosition = TOLERANCE_MILLI,
    deltaOrientation = TOLERANCE_MILLI,
  ): boolean {
    const otherPosition = other.position ?? ZERO_VECTOR
    const otherOrientation = other.orientation ?? ZERO_VECTOR

    const positionDistance = Math.sqrt(
      this.position.reduce(
        (sum, v, i) => sum + (v - (otherPosition[i] ?? 0)) ** 2,
        0,
      ),
    )
    const orientationDistance = Quaternion.fromRotationVector(
      this.orientation,
    ).angularDistance(Quaternion.fromRotationVector(otherOrientation))

    return (
      positionDistance <= deltaPosition &&
      orientationDistance <= deltaOrientation
    )
  }

  /**
   * Position + orientation as a 6-element [x, y, z, roll, pitch, yaw] vector
   * (Euler angles in rad, XYZ Tait-Bryan / Rx*Ry*Rz convention), matching
   * wb-robotix's `Pose::toCartesian()`.
   */
  toCartesian(): number[] {
    const { w, x, y, z } = Quaternion.fromRotationVector(this.orientation)

    const roll = Math.atan2(2 * (w * x - y * z), 1 - 2 * (x * x + y * y))
    const pitch = Math.asin(Math.min(1, Math.max(-1, 2 * (x * z + w * y))))
    const yaw = Math.atan2(2 * (w * z - x * y), 1 - 2 * (y * y + z * z))

    return [...this.position, roll, pitch, yaw]
  }

  /** Human-readable `[x, y, z][rx, ry, rz]` representation, matching wb-robotix's `Pose::string()`. */
  toString(precision = 6): string {
    const fmt = (v: number) => Number(v.toPrecision(precision))
    return `[${this.position.map(fmt).join(", ")}][${this.orientation.map(fmt).join(", ")}]`
  }

  toJSON(): PoseData {
    return { position: this.position, orientation: this.orientation }
  }
}
