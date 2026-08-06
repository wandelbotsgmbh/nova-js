import { Pose } from "@wandelbots/nova-js/experimental/math"
import { describe, expect, test } from "vitest"

// Cases ported from wandelbots/robot-pad's Pose3/PoseTransformer unit tests,
// which implement the same axis-angle <-> quaternion pose composition math
// client-side (using three.js) to avoid a network round-trip for animation.

describe("Pose (ported from robot-pad)", () => {
  test("double inverse round-trips a pose (from Pose3.test.ts)", () => {
    const pose = new Pose([1, 2, 3], [0, 1.2, 0])

    const doubleInverse = pose.inverse().inverse()

    const [px, py, pz] = pose.position
    const [ox, oy, oz] = pose.orientation

    expect(doubleInverse.position[0]).toBeCloseTo(px ?? 0)
    expect(doubleInverse.position[1]).toBeCloseTo(py ?? 0)
    expect(doubleInverse.position[2]).toBeCloseTo(pz ?? 0)
    expect(doubleInverse.orientation[0]).toBeCloseTo(ox ?? 0)
    expect(doubleInverse.orientation[1]).toBeCloseTo(oy ?? 0)
    expect(doubleInverse.orientation[2]).toBeCloseTo(oz ?? 0)
  })

  test("inverse transform TCP => Flange (regression RPS-1590, from PoseTransformer.test.ts)", () => {
    // Pose of a point expressed relative to `tcp_frame_3`.
    const poseInTcpFrame = new Pose(
      [445.8445870131073, 8.543116867448944, -102.44259543449492],
      [-2.2200715682868584, -2.2204911643877585, -0.000058320795199238045],
    )
    // `tcp_frame_3`'s offset from the flange.
    const tcpOffset = new Pose([15.04, 0, 159], [0, -0.785, 0])
    // The flange has no offset from itself.
    const flangeOffset = Pose.identity()

    const poseInFlangeFrame = poseInTcpFrame
      .multiply(tcpOffset.inverse())
      .multiply(flangeOffset)

    expect(poseInFlangeFrame.position[0]).toBeCloseTo(445.9832385471837)
    expect(poseInFlangeFrame.position[1]).toBeCloseTo(-114.6019304795401)
    expect(poseInFlangeFrame.position[2]).toBeCloseTo(-0.7446127128109623)
    expect(poseInFlangeFrame.orientation[0]).toBeCloseTo(-1.7593623643757612)
    expect(poseInFlangeFrame.orientation[1]).toBeCloseTo(-1.7588689904693675)
    expect(poseInFlangeFrame.orientation[2]).toBeCloseTo(-0.728395574353933)
  })
})
