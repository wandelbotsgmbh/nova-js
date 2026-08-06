import { augmentPoses, Pose } from "@wandelbots/nova-js/experimental/math"
import { describe, expect, test } from "vitest"

describe("augmentPoses", () => {
  test("upgrades Pose-shaped objects nested in a plain parsed message to Pose instances", () => {
    // Shaped like a parsed websocket message rather than a REST response,
    // since augmentPoses is meant to be applied manually to those.
    const message = {
      motion_groups: [
        {
          flange_pose: { position: [1, 2, 3], orientation: [0.1, 0.2, 0.3] },
          tcp_pose: { position: [4, 5, 6], orientation: [0, 0, 0] },
          tcp: "Flange",
        },
      ],
    }

    const result = augmentPoses(message)
    const [motionGroup] = result.motion_groups
    expect(motionGroup).toBeDefined()

    const flangePose = motionGroup?.flange_pose
    expect(flangePose).toBeInstanceOf(Pose)
    expect(motionGroup?.tcp_pose).toBeInstanceOf(Pose)

    // Still usable as plain wire-format data (e.g. sent back in a request).
    expect(JSON.parse(JSON.stringify(flangePose))).toEqual({
      position: flangePose?.position,
      orientation: flangePose?.orientation,
    })

    // And has math methods available, with no cast needed: `flange_pose`'s
    // static type is `Pose`, not the raw API `PoseData`.
    expect(flangePose?.multiply(Pose.identity())).toBeInstanceOf(Pose)
  })

  test("mutates and returns the same object reference, rather than a copy", () => {
    const message = { pose: { position: [1, 2, 3], orientation: [0, 0, 0] } }

    const result = augmentPoses(message)

    expect(result).toBe(message)
    expect(message.pose).toBeInstanceOf(Pose)
  })

  test("ignores objects that aren't shaped exactly like a Pose", () => {
    const message = {
      not_a_pose: { position: [1, 2, 3] },
      also_not_a_pose: {
        position: [1, 2, 3],
        orientation: [0, 0, 0],
        extra: 1,
      },
    }

    augmentPoses(message)

    expect(message.not_a_pose).not.toBeInstanceOf(Pose)
    expect(message.also_not_a_pose).not.toBeInstanceOf(Pose)
  })
})
