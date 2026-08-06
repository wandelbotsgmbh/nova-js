import { Quaternion } from "@wandelbots/nova-js/experimental/math"
import { describe, expect, test } from "vitest"

// Regression values ported verbatim from wb-robotix's
// tests/math/QuaternionTest.cpp (`fromAndToRotationVector` test), which are
// themselves cross-checked against https://www.andre-gaschler.com/rotationconverter/.
// wb-robotix's `Quaternion::toRotationVector()` uses atan2 (not acos) so the
// angle is always canonically within [0, pi], regardless of which of the two
// antipodal quaternions (q or -q) is given for the same rotation - these
// cases confirm our port keeps that property.
describe("Quaternion.toRotationVector (ported from wb-robotix QuaternionTest)", () => {
  const cases: Array<[Quaternion, number[]]> = [
    [
      new Quaternion(0.9639685, 0.098796, 0.1975921, 0.1481941),
      [0.2, 0.4, 0.3],
    ],
    [
      new Quaternion(0.982551, -0.0497088, 0.1491265, -0.0994177),
      [-0.1, 0.3, -0.2],
    ],
    [
      new Quaternion(0.0015608, -0.2230383, -0.1911757, -0.9558783),
      [-0.7, -0.6, -3],
    ],
    [new Quaternion(1, 0, 0, 0), [0, 0, 0]],
  ]

  test.each(cases)(
    "converts %o to the expected rotation vector, regardless of quaternion sign",
    (quaternion, rotationVector) => {
      const negated = new Quaternion(
        -quaternion.w,
        -quaternion.x,
        -quaternion.y,
        -quaternion.z,
      )

      for (const [x, y, z] of [
        quaternion.toRotationVector(),
        negated.toRotationVector(),
      ]) {
        expect(x).toBeCloseTo(rotationVector[0] ?? 0, 6)
        expect(y).toBeCloseTo(rotationVector[1] ?? 0, 6)
        expect(z).toBeCloseTo(rotationVector[2] ?? 0, 6)
      }
    },
  )

  test("180 degree rotation: sign of w picks the rotation vector's direction", () => {
    const quaternion180 = new Quaternion(0, 0, 1, 0)
    const [x1, y1, z1] = quaternion180.toRotationVector()
    expect(x1).toBeCloseTo(0, 6)
    expect(y1).toBeCloseTo(Math.PI, 6)
    expect(z1).toBeCloseTo(0, 6)

    const negated180 = new Quaternion(-0, -0, -1, -0)
    const [x2, y2, z2] = negated180.toRotationVector()
    expect(x2).toBeCloseTo(0, 6)
    expect(y2).toBeCloseTo(-Math.PI, 6)
    expect(z2).toBeCloseTo(0, 6)
  })

  test("round-trips through fromRotationVector for every case", () => {
    for (const [quaternion, rotationVector] of cases) {
      const roundTripped =
        Quaternion.fromRotationVector(rotationVector).toRotationVector()
      const [x, y, z] = quaternion.toRotationVector()
      expect(roundTripped[0] ?? 0).toBeCloseTo(x ?? 0, 6)
      expect(roundTripped[1] ?? 0).toBeCloseTo(y ?? 0, 6)
      expect(roundTripped[2] ?? 0).toBeCloseTo(z ?? 0, 6)
    }
  })
})

describe("Quaternion", () => {
  test("multiply composes rotations (Hamilton product)", () => {
    const identity = Quaternion.identity()
    const q = Quaternion.fromRotationVector([0.1, 0.2, 0.3])

    const result = identity.multiply(q)
    expect(result.w).toBeCloseTo(q.w, 9)
    expect(result.x).toBeCloseTo(q.x, 9)
    expect(result.y).toBeCloseTo(q.y, 9)
    expect(result.z).toBeCloseTo(q.z, 9)
  })

  test("inverse undoes a rotation when composed", () => {
    const q = Quaternion.fromRotationVector([0.4, -0.1, 0.9])
    const result = q.multiply(q.inverse())

    expect(result.w).toBeCloseTo(1, 9)
    expect(result.x).toBeCloseTo(0, 9)
    expect(result.y).toBeCloseTo(0, 9)
    expect(result.z).toBeCloseTo(0, 9)
  })

  test("rotateVector applies the rotation to a point", () => {
    // 90 degree rotation around Z
    const q = Quaternion.fromRotationVector([0, 0, Math.PI / 2])
    const [x, y, z] = q.rotateVector([1, 0, 0])

    expect(x).toBeCloseTo(0, 9)
    expect(y).toBeCloseTo(1, 9)
    expect(z).toBeCloseTo(0, 9)
  })
})
