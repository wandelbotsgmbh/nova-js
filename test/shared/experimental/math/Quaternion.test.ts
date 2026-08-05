import {
  axisAngleToQuaternion,
  type Quaternion,
  quaternionToAxisAngle,
} from "@wandelbots/nova-js/experimental/math"
import { describe, expect, test } from "vitest"

// Regression values ported verbatim from wb-robotix's
// tests/math/QuaternionTest.cpp (`fromAndToRotationVector` test), which are
// themselves cross-checked against https://www.andre-gaschler.com/rotationconverter/.
// wb-robotix's `Quaternion::toRotationVector()` uses atan2 (not acos) so the
// angle is always canonically within [0, pi], regardless of which of the two
// antipodal quaternions (q or -q) is given for the same rotation - these
// cases confirm our port keeps that property.
describe("quaternionToAxisAngle (ported from wb-robotix QuaternionTest)", () => {
  const cases: Array<[Quaternion, number[]]> = [
    [
      { w: 0.9639685, x: 0.098796, y: 0.1975921, z: 0.1481941 },
      [0.2, 0.4, 0.3],
    ],
    [
      { w: 0.982551, x: -0.0497088, y: 0.1491265, z: -0.0994177 },
      [-0.1, 0.3, -0.2],
    ],
    [
      { w: 0.0015608, x: -0.2230383, y: -0.1911757, z: -0.9558783 },
      [-0.7, -0.6, -3],
    ],
    [{ w: 1, x: 0, y: 0, z: 0 }, [0, 0, 0]],
  ]

  test.each(cases)(
    "converts %o to the expected rotation vector, regardless of quaternion sign",
    (quaternion, rotationVector) => {
      const negated: Quaternion = {
        w: -quaternion.w,
        x: -quaternion.x,
        y: -quaternion.y,
        z: -quaternion.z,
      }

      for (const [x, y, z] of [
        quaternionToAxisAngle(quaternion),
        quaternionToAxisAngle(negated),
      ]) {
        expect(x).toBeCloseTo(rotationVector[0] ?? 0, 6)
        expect(y).toBeCloseTo(rotationVector[1] ?? 0, 6)
        expect(z).toBeCloseTo(rotationVector[2] ?? 0, 6)
      }
    },
  )

  test("180 degree rotation: sign of w picks the rotation vector's direction", () => {
    const quaternion180: Quaternion = { w: 0, x: 0, y: 1, z: 0 }
    const [x1, y1, z1] = quaternionToAxisAngle(quaternion180)
    expect(x1).toBeCloseTo(0, 6)
    expect(y1).toBeCloseTo(Math.PI, 6)
    expect(z1).toBeCloseTo(0, 6)

    const negated180: Quaternion = { w: -0, x: -0, y: -1, z: -0 }
    const [x2, y2, z2] = quaternionToAxisAngle(negated180)
    expect(x2).toBeCloseTo(0, 6)
    expect(y2).toBeCloseTo(-Math.PI, 6)
    expect(z2).toBeCloseTo(0, 6)
  })

  test("round-trips through axisAngleToQuaternion for every case", () => {
    for (const [quaternion, rotationVector] of cases) {
      const roundTripped = quaternionToAxisAngle(
        axisAngleToQuaternion(rotationVector),
      )
      const [x, y, z] = quaternionToAxisAngle(quaternion)
      expect(roundTripped[0] ?? 0).toBeCloseTo(x ?? 0, 6)
      expect(roundTripped[1] ?? 0).toBeCloseTo(y ?? 0, 6)
      expect(roundTripped[2] ?? 0).toBeCloseTo(z ?? 0, 6)
    }
  })
})
