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

  test("inverse divides by squaredNorm, so it's correct even for a non-unit quaternion", () => {
    // Deliberately not a unit quaternion (norm^2 = 4 + 9 + 16 + 25 = 54).
    const q = new Quaternion(2, 3, 4, 5)
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

  test("angularDistance is zero for identical rotations, regardless of antipodal sign", () => {
    const q = Quaternion.fromRotationVector([0.1, 0.2, 0.3])
    const negated = new Quaternion(-q.w, -q.x, -q.y, -q.z)

    expect(q.angularDistance(q)).toBeCloseTo(0, 9)
    expect(q.angularDistance(negated)).toBeCloseTo(0, 9)
  })

  test("angularDistance measures the angle between two rotations", () => {
    const a = Quaternion.fromRotationVector([0, 0, 0])
    const b = Quaternion.fromRotationVector([0, 0, Math.PI / 2])

    expect(a.angularDistance(b)).toBeCloseTo(Math.PI / 2, 9)
  })
})

// Adapted from Eigen's own test/geo_quaternion.cpp (the `quaternion<Scalar,
// Options>()` test function), which nova-js's `Quaternion` mirrors the
// relevant subset of. Eigen-specific tests not applicable here (memory
// layout/Map, casting between scalar types, slerp, setFromTwoVectors,
// rotation-matrix conversion) aren't ported since we don't implement that
// surface. `FromScaledAxis`/`toScaledAxis` in Eigen's test are the same
// axis-angle rotation-vector conversion as our `fromRotationVector`/
// `toRotationVector`.
describe("Quaternion (ported from Eigen's geo_quaternion.cpp)", () => {
  test("multiplying by the identity quaternion on either side is a no-op", () => {
    const q = Quaternion.fromRotationVector([0.3, -0.6, 0.9])
    const identity = Quaternion.identity()

    for (const result of [q.multiply(identity), identity.multiply(q)]) {
      expect(result.w).toBeCloseTo(q.w, 9)
      expect(result.x).toBeCloseTo(q.x, 9)
      expect(result.y).toBeCloseTo(q.y, 9)
      expect(result.z).toBeCloseTo(q.z, 9)
    }
  })

  test("rotating a vector by q then by q.inverse()/q.conjugate() returns the original vector", () => {
    const q = Quaternion.fromRotationVector([0.4, -0.8, 0.2])
    const v = [1, 2, 3]

    const viaInverse = q.rotateVector(q.inverse().rotateVector(v))
    const viaConjugate = q.rotateVector(q.conjugate().rotateVector(v))

    for (const result of [viaInverse, viaConjugate]) {
      expect(result[0]).toBeCloseTo(v[0] ?? 0, 9)
      expect(result[1]).toBeCloseTo(v[1] ?? 0, 9)
      expect(result[2]).toBeCloseTo(v[2] ?? 0, 9)
    }
  })

  test("angularDistance matches the magnitude of the relative rotation's rotation vector", () => {
    const q1 = Quaternion.fromRotationVector([0.2, 0.4, 0.3])
    const q2 = Quaternion.fromRotationVector([-0.1, 0.3, -0.2])

    const relative = q1.inverse().multiply(q2)
    const [rx, ry, rz] = relative.toRotationVector()
    const expectedAngle = Math.sqrt(
      (rx ?? 0) ** 2 + (ry ?? 0) ** 2 + (rz ?? 0) ** 2,
    )

    expect(q1.angularDistance(q2)).toBeCloseTo(expectedAngle, 9)
  })

  test("angularDistance is invariant to quaternion scale (works for non-unit quaternions)", () => {
    const unit = Quaternion.fromRotationVector([Math.PI / 2, 0, 0])
    const scaled = new Quaternion(
      unit.w * 2,
      unit.x * 2,
      unit.y * 2,
      unit.z * 2,
    )

    expect(scaled.angularDistance(Quaternion.identity())).toBeCloseTo(
      Math.PI / 2,
      9,
    )
    expect(Quaternion.identity().angularDistance(scaled)).toBeCloseTo(
      Math.PI / 2,
      9,
    )
  })

  test("fromRotationVector: canonical 90 degree rotation about X", () => {
    const c = Math.sqrt(2) / 2
    const q = Quaternion.fromRotationVector([Math.PI / 2, 0, 0])

    expect(q.w).toBeCloseTo(c, 9)
    expect(q.x).toBeCloseTo(c, 9)
    expect(q.y).toBeCloseTo(0, 9)
    expect(q.z).toBeCloseTo(0, 9)
  })

  test("toRotationVector: 60 degree rotation about Z from explicit quaternion coefficients", () => {
    const q = new Quaternion(Math.sqrt(3) / 2, 0, 0, 0.5)
    const [x, y, z] = q.toRotationVector()

    expect(x).toBeCloseTo(0, 9)
    expect(y).toBeCloseTo(0, 9)
    expect(z).toBeCloseTo(Math.PI / 3, 9)
  })

  test("fromRotationVector/toRotationVector agree at a small (but not tiny) angle", () => {
    const theta = 1e-2
    const q = Quaternion.fromRotationVector([theta, 0, 0])

    expect(q.w).toBeCloseTo(Math.cos(theta / 2), 9)
    expect(q.x).toBeCloseTo(Math.sin(theta / 2), 9)

    const [x] = q.toRotationVector()
    expect(x).toBeCloseTo(theta, 9)
  })

  test("a quaternion with w exactly -1 (same rotation as identity) round-trips to a zero rotation vector", () => {
    const q = new Quaternion(-1, 0, 0, 0)
    expect(q.toRotationVector()).toEqual([0, 0, 0])
  })

  test("negative-w quaternions still canonicalize to a rotation vector with magnitude <= pi", () => {
    const positive = Quaternion.fromRotationVector([Math.PI / 3, 0, 0])
    const negative = new Quaternion(
      -positive.w,
      -positive.x,
      -positive.y,
      -positive.z,
    )

    for (const q of [positive, negative]) {
      const [x, y, z] = q.toRotationVector()
      const magnitude = Math.sqrt((x ?? 0) ** 2 + (y ?? 0) ** 2 + (z ?? 0) ** 2)
      expect(magnitude).toBeLessThanOrEqual(Math.PI + 1e-9)
    }

    // Both represent the same rotation, so re-deriving a quaternion from
    // the negative one's rotation vector must agree with `positive` up to
    // overall sign (the antipodal double-cover).
    const roundTripped = Quaternion.fromRotationVector(
      negative.toRotationVector(),
    )
    const dot =
      roundTripped.w * positive.w +
      roundTripped.x * positive.x +
      roundTripped.y * positive.y +
      roundTripped.z * positive.z
    expect(Math.abs(dot)).toBeCloseTo(1, 9)
  })

  test("near-pi rotations round-trip through fromRotationVector/toRotationVector", () => {
    // Stress-tests the atan2-based canonicalization right at its boundary.
    const axisNorm = Math.sqrt(1 + 4 + 9)
    const unitAxis = [1 / axisNorm, 2 / axisNorm, 3 / axisNorm]

    for (const gap of [1e-3, 1e-6]) {
      const theta = Math.PI - gap
      const rotationVector = unitAxis.map((v) => v * theta)
      const q = Quaternion.fromRotationVector(rotationVector)

      const [x, y, z] = q.toRotationVector()
      const magnitude = Math.sqrt((x ?? 0) ** 2 + (y ?? 0) ** 2 + (z ?? 0) ** 2)
      expect(magnitude).toBeCloseTo(theta, 6)

      const roundTripped = Quaternion.fromRotationVector([
        x ?? 0,
        y ?? 0,
        z ?? 0,
      ])
      expect(roundTripped.w).toBeCloseTo(q.w, 6)
      expect(roundTripped.x).toBeCloseTo(q.x, 6)
      expect(roundTripped.y).toBeCloseTo(q.y, 6)
      expect(roundTripped.z).toBeCloseTo(q.z, 6)
    }
  })

  test("w = -0 is treated the same as w = +0 (both take the positive canonicalization branch)", () => {
    const positiveZero = new Quaternion(0, 0, 0, 1)
    const negativeZero = new Quaternion(-0, 0, 0, 1)

    const [, , zFromPositive] = positiveZero.toRotationVector()
    const [, , zFromNegative] = negativeZero.toRotationVector()

    expect(zFromPositive).toBeCloseTo(Math.PI, 9)
    expect(zFromNegative).toBeCloseTo(Math.PI, 9)
  })
})
