import { Pose } from "@wandelbots/nova-js/v2"
import { describe, expect, test } from "vitest"

describe("Pose", () => {
  test("identity multiplied by any pose returns that pose", () => {
    const pose = new Pose([1, 2, 3], [0.1, 0.2, 0.3])
    const result = Pose.identity().multiply(pose)

    expect(result.equals(pose)).toBe(true)
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

    expect(result.equals(Pose.identity(), 1e-9)).toBe(true)
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
})
