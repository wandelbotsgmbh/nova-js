import { Nova, Pose } from "@wandelbots/nova-js/v2"
import { describe, expect, test } from "vitest"

describe("automatic Pose augmentation", () => {
  test("poses nested in API responses are upgraded to Pose", async () => {
    const nova = new Nova({
      instanceUrl: "https://mock.example.com",
    })

    const state = await nova.api.controller.getCurrentRobotControllerState(
      "cell",
      "0@mock-ur5e",
    )
    const [motionGroup] = state.motion_groups
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
    // static type is `Pose | undefined`, not the raw API `PoseData | undefined`.
    expect(flangePose?.multiply(Pose.identity())).toBeInstanceOf(Pose)
  })
})
