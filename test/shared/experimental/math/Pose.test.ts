import { Pose } from "@wandelbots/nova-js/experimental/math"
import { describe, expect, test } from "vitest"

describe("Pose", () => {
  test("identity multiplied by any pose returns that pose", () => {
    const pose = new Pose([1, 2, 3], [0.1, 0.2, 0.3])
    const result = Pose.identity().multiply(pose)

    expect(result.isApprox(pose)).toBe(true)
  })

  test("multiply composes translation for poses with no rotation", () => {
    const a = new Pose([10, 0, 0], [0, 0, 0])
    const b = new Pose([0, 5, 0], [0, 0, 0])

    const result = a.multiply(b)

    expect(result.position).toEqual([10, 5, 0])
    expect(result.orientation).toEqual([0, 0, 0])
  })

  test("multiply rotates the other pose's position into this pose's frame", () => {
    // 90 degree rotation around Z
    const a = new Pose([0, 0, 0], [0, 0, Math.PI / 2])
    const b = new Pose([1, 0, 0], [0, 0, 0])

    const result = a.multiply(b)

    expect(result.position[0]).toBeCloseTo(0, 9)
    expect(result.position[1]).toBeCloseTo(1, 9)
    expect(result.position[2]).toBeCloseTo(0, 9)
  })

  test("inverse undoes a pose when composed", () => {
    const pose = new Pose([3, -2, 7], [0.4, -0.1, 0.9])

    const result = pose.multiply(pose.inverse())

    expect(result.isApprox(Pose.identity(), 1e-9, 1e-9)).toBe(true)
  })

  test("transformPoint applies position and orientation", () => {
    const pose = new Pose([1, 0, 0], [0, 0, Math.PI / 2])

    const [x, y, z] = pose.transformPoint([1, 0, 0])

    expect(x).toBeCloseTo(1, 9)
    expect(y).toBeCloseTo(1, 9)
    expect(z).toBeCloseTo(0, 9)
  })

  test("from() wraps a plain Pose and is idempotent", () => {
    const plain = { position: [1, 2, 3], orientation: [0, 0, 0] }

    const wrapped = Pose.from(plain)
    expect(wrapped).toBeInstanceOf(Pose)
    expect(Pose.from(wrapped)).toBe(wrapped)
  })

  test("toJSON / JSON.stringify only include position and orientation", () => {
    const pose = new Pose([1, 2, 3], [0.1, 0.2, 0.3])

    expect(JSON.parse(JSON.stringify(pose))).toEqual({
      position: [1, 2, 3],
      orientation: [0.1, 0.2, 0.3],
    })
  })

  test("isApprox uses separate position/orientation tolerances", () => {
    const pose = new Pose([1, 2, 3], [0, 0, Math.PI])

    // Same rotation, represented via the antipodal quaternion's canonical
    // form (0, 0, -pi) - angularDistance should treat these as identical,
    // unlike a naive per-component comparison of the raw rotation vectors.
    const sameRotationDifferentSign = new Pose([1, 2, 3], [0, 0, -Math.PI])
    expect(pose.isApprox(sameRotationDifferentSign)).toBe(true)

    expect(
      pose.isApprox({ position: [1, 2, 3.002], orientation: [0, 0, Math.PI] }),
    ).toBe(false)
    expect(
      pose.isApprox(
        { position: [1, 2, 3.002], orientation: [0, 0, Math.PI] },
        1e-2,
      ),
    ).toBe(true)
  })

  test("toCartesian returns position + roll/pitch/yaw euler angles", () => {
    expect(Pose.identity().toCartesian()).toEqual([0, 0, 0, 0, 0, 0])

    // 90 degree rotation around Z should be pure yaw
    const pose = new Pose([1, 2, 3], [0, 0, Math.PI / 2])
    const [x, y, z, roll, pitch, yaw] = pose.toCartesian()
    expect(x).toBe(1)
    expect(y).toBe(2)
    expect(z).toBe(3)
    expect(roll).toBeCloseTo(0, 9)
    expect(pitch).toBeCloseTo(0, 9)
    expect(yaw).toBeCloseTo(Math.PI / 2, 9)
  })

  test("toString formats position and orientation", () => {
    const pose = new Pose([1, 2, 3], [0.1, 0.2, 0.3])
    expect(pose.toString()).toBe("[1, 2, 3][0.1, 0.2, 0.3]")
  })

  test("constructor throws on malformed position/orientation", () => {
    expect(() => new Pose([1, 2], [0, 0, 0])).toThrow()
    expect(() => new Pose([1, 2, 3], [0, 0, Number.NaN])).toThrow()
  })
})
