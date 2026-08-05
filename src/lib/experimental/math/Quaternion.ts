/**
 * Internal quaternion helpers used to compose/invert the axis-angle
 * `orientation` vectors used by the NOVA API's `Pose` type. Rotation vectors
 * are converted to quaternions for composition (numerically stable, unlike
 * composing axis-angle vectors directly) and converted back at the boundary.
 */

export type Quaternion = { w: number; x: number; y: number; z: number }

const EPSILON = 1e-12

/** Convert an axis-angle rotation vector [rx, ry, rz] to a unit quaternion. */
export function axisAngleToQuaternion(r: number[]): Quaternion {
  const rx = r[0] ?? 0
  const ry = r[1] ?? 0
  const rz = r[2] ?? 0

  const angle = Math.sqrt(rx * rx + ry * ry + rz * rz)
  if (angle < EPSILON) {
    return { w: 1, x: 0, y: 0, z: 0 }
  }
  const half = angle / 2
  const s = Math.sin(half) / angle
  return { w: Math.cos(half), x: rx * s, y: ry * s, z: rz * s }
}

/**
 * Convert a unit quaternion back to an axis-angle rotation vector [rx, ry, rz],
 * matching wb-robotix's `Quaternion::toRotationVector()` (ported from
 * QuaternionBasePlugin.h): using `atan2` rather than `acos` keeps the angle
 * canonically within [0, pi] regardless of which of the two antipodal unit
 * quaternions (q or -q) represents the rotation, rather than acos's [0, 2*pi]
 * range - important since composed poses need to match the same canonical
 * rotation vector the robot controller itself would report for a pose.
 */
export function quaternionToAxisAngle(q: Quaternion): number[] {
  const vecNorm = Math.sqrt(q.x * q.x + q.y * q.y + q.z * q.z)
  if (vecNorm < EPSILON) {
    return [0, 0, 0]
  }
  const angle = 2 * Math.atan2(vecNorm, Math.abs(q.w))
  const scale = (q.w >= 0 ? angle : -angle) / vecNorm
  return [q.x * scale, q.y * scale, q.z * scale]
}

/** Hamilton product: composes rotations so that applying `multiplyQuaternions(a, b)` to a vector equals applying `b` then `a`. */
export function multiplyQuaternions(a: Quaternion, b: Quaternion): Quaternion {
  return {
    w: a.w * b.w - a.x * b.x - a.y * b.y - a.z * b.z,
    x: a.w * b.x + a.x * b.w + a.y * b.z - a.z * b.y,
    y: a.w * b.y - a.x * b.z + a.y * b.w + a.z * b.x,
    z: a.w * b.z + a.x * b.y - a.y * b.x + a.z * b.w,
  }
}

/** Conjugate of a unit quaternion equals its inverse. */
export function conjugateQuaternion(q: Quaternion): Quaternion {
  return { w: q.w, x: -q.x, y: -q.y, z: -q.z }
}

/** Rotate a 3D vector by a unit quaternion. */
export function rotateVectorByQuaternion(q: Quaternion, v: number[]): number[] {
  const vx = v[0] ?? 0
  const vy = v[1] ?? 0
  const vz = v[2] ?? 0
  const { w, x, y, z } = q

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
