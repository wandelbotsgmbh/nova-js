/**
 * A unit quaternion representing a 3D rotation. Mirrors the subset of
 * `Eigen::Quaternion`'s API (see wb-robotix's `QuaternionBasePlugin.h`) that
 * `Pose` composition needs: Hamilton product, conjugate/inverse, vector
 * rotation, and axis-angle rotation-vector conversion. Instances are
 * immutable - every method returns a new `Quaternion`.
 */

export type QuaternionData = { w: number; x: number; y: number; z: number }

const EPSILON = 1e-12

export class Quaternion implements QuaternionData {
  readonly w: number
  readonly x: number
  readonly y: number
  readonly z: number

  constructor(w = 1, x = 0, y = 0, z = 0) {
    this.w = w
    this.x = x
    this.y = y
    this.z = z
  }

  static identity(): Quaternion {
    return new Quaternion()
  }

  /**
   * Construct from an axis-angle rotation vector [rx, ry, rz] (magnitude =
   * angle in rad), matching `Eigen::Quaternion::FromRotationVector` (ported
   * from wb-robotix's `QuaternionBasePlugin.h`).
   */
  static fromRotationVector(rotationVector: number[]): Quaternion {
    const rx = rotationVector[0] ?? 0
    const ry = rotationVector[1] ?? 0
    const rz = rotationVector[2] ?? 0

    const angle = Math.sqrt(rx * rx + ry * ry + rz * rz)
    if (angle < EPSILON) {
      return Quaternion.identity()
    }
    const half = angle / 2
    const s = Math.sin(half) / angle
    return new Quaternion(Math.cos(half), rx * s, ry * s, rz * s)
  }

  /**
   * Rotation vector [rx, ry, rz] representation (magnitude = angle in rad),
   * matching `Eigen::Quaternion::toRotationVector()` (ported from
   * wb-robotix's `QuaternionBasePlugin.h`): using `atan2` rather than `acos`
   * keeps the angle canonically within [0, pi] regardless of which of the
   * two antipodal unit quaternions (this or its negation) represents the
   * rotation, rather than acos's [0, 2*pi] range - important since composed
   * poses need to match the same canonical rotation vector the robot
   * controller itself would report for a pose.
   */
  toRotationVector(): number[] {
    const vecNorm = Math.sqrt(
      this.x * this.x + this.y * this.y + this.z * this.z,
    )
    if (vecNorm < EPSILON) {
      return [0, 0, 0]
    }
    const angle = 2 * Math.atan2(vecNorm, Math.abs(this.w))
    const scale = (this.w >= 0 ? angle : -angle) / vecNorm
    return [this.x * scale, this.y * scale, this.z * scale]
  }

  /** Hamilton product: `a.multiply(b)` applied to a vector rotates by `b` first, then by `a`. */
  multiply(other: QuaternionData): Quaternion {
    const { w: aw, x: ax, y: ay, z: az } = this
    const { w: bw, x: bx, y: by, z: bz } = other
    return new Quaternion(
      aw * bw - ax * bx - ay * by - az * bz,
      aw * bx + ax * bw + ay * bz - az * by,
      aw * by - ax * bz + ay * bw + az * bx,
      aw * bz + ax * by - ay * bx + az * bw,
    )
  }

  /** Conjugate: negates the vector part. Equal to `inverse()` for unit quaternions. */
  conjugate(): Quaternion {
    return new Quaternion(this.w, -this.x, -this.y, -this.z)
  }

  /** Inverse: `conjugate()` scaled by `1 / squaredNorm()`, matching `Eigen::Quaternion::inverse()`. Equal to `conjugate()` for unit quaternions. */
  inverse(): Quaternion {
    const squaredNorm =
      this.w * this.w + this.x * this.x + this.y * this.y + this.z * this.z
    // Degenerate (zero) quaternion has no inverse - flag it the same way Eigen does.
    if (squaredNorm < EPSILON) {
      return new Quaternion(0, 0, 0, 0)
    }
    const conjugate = this.conjugate()
    return new Quaternion(
      conjugate.w / squaredNorm,
      conjugate.x / squaredNorm,
      conjugate.y / squaredNorm,
      conjugate.z / squaredNorm,
    )
  }

  /**
   * The angle (in rad, always within [0, pi]) of the rotation that takes
   * `other` to `this`, matching Eigen's built-in `Quaternion::angularDistance()`.
   */
  angularDistance(other: QuaternionData): number {
    const relative = this.multiply({
      w: other.w,
      x: -other.x,
      y: -other.y,
      z: -other.z,
    })
    const vecNorm = Math.sqrt(
      relative.x * relative.x +
        relative.y * relative.y +
        relative.z * relative.z,
    )
    return 2 * Math.atan2(vecNorm, Math.abs(relative.w))
  }

  /** Rotate a 3D vector by this quaternion. */
  rotateVector(v: number[]): number[] {
    const vx = v[0] ?? 0
    const vy = v[1] ?? 0
    const vz = v[2] ?? 0
    const { w, x, y, z } = this

    // t = 2 * cross(q.xyz, v)
    const tx = 2 * (y * vz - z * vy)
    const ty = 2 * (z * vx - x * vz)
    const tz = 2 * (x * vy - y * vx)

    // v' = v + w*t + cross(q.xyz, t)
    return [
      vx + w * tx + (y * tz - z * ty),
      vy + w * ty + (z * tx - x * tz),
      vz + w * tz + (x * ty - y * tx),
    ]
  }

  toJSON(): QuaternionData {
    return { w: this.w, x: this.x, y: this.y, z: this.z }
  }
}
