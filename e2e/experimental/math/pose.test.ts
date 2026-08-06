import { Pose } from "@wandelbots/nova-js/experimental/math"
import { Nova } from "@wandelbots/nova-js/v2"
import { expect, test } from "vitest"
import { env } from "../../env.ts"

// Ported from wandelbots/robot-pad's e2e/pose-transforms.test.ts, which checks
// that robot-pad's client-side pose math matches the backend's. Here we check
// Pose directly: for the currently active TCP, composing the live
// flange_pose with the TCP's configured offset (both fetched from a real NOVA
// instance) should reproduce the backend's own reported tcp_pose.
test("Pose.multiply reproduces the backend's flange->TCP transform", async () => {
  const nova = new Nova({
    instanceUrl: env.NOVA,
  })

  const [controller] = await nova.api.controller.listRobotControllers("cell")
  if (!controller) {
    throw new Error("Expected at least one robot controller on the instance")
  }

  const state = await nova.api.controller.getCurrentRobotControllerState(
    "cell",
    controller,
  )
  const [motionGroup] = state.motion_groups
  if (!motionGroup?.flange_pose || !motionGroup.tcp_pose || !motionGroup.tcp) {
    throw new Error(
      "Expected at least one motion group reporting flange_pose/tcp_pose/tcp",
    )
  }

  const description = await nova.api.motionGroup.getMotionGroupDescription(
    "cell",
    controller,
    motionGroup.motion_group,
  )
  const tcpOffset = description.tcps?.[motionGroup.tcp]
  if (!tcpOffset) {
    throw new Error(`Expected a TCP offset configured for '${motionGroup.tcp}'`)
  }

  const computedTcpPose = Pose.from(motionGroup.flange_pose).multiply(
    tcpOffset.pose,
  )

  expect(computedTcpPose.isApprox(motionGroup.tcp_pose, 1e-6)).toBe(true)
})
