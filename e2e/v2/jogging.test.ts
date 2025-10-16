import { expect, test, vi } from "vitest"
import { delay } from "../../src/lib/errorHandling"
import { NovaClient } from "../../src/lib/v2"
import { jointValuesEqual } from "../../src/lib/v1/motionStateUpdate"
import { env } from "../env"

// Note: Requires a robot on the instance to work

test("jog a robot somewhat", async () => {
  const nova = new NovaClient({
    instanceUrl: env.NOVA,
  })

  // Find a virtual robot we can jog
  const controllerNames = await nova.api.controller.listRobotControllers()
  const firstControllerName = controllerNames[0]

  if (!firstControllerName) {
    throw new Error("No robot controllers found on instance")
  }

  const controllerConfig =
    await nova.api.controller.getRobotController(firstControllerName)
  const controllerState =
    await nova.api.controller.getCurrentRobotControllerState(
      firstControllerName,
    )
  console.log("verify, got controller config and state", {
    controllerConfig,
    controllerState,
  })

  if (!controllerConfig || !controllerState) {
    throw new Error(
      `Could not get controller config and state for ${firstControllerName}`,
    )
  }

  if (controllerConfig.configuration.kind !== "VirtualController") {
    throw new Error(
      `Controller ${firstControllerName} is not a VirtualController, it's a ${controllerConfig.configuration.kind}`,
    )
  }

  if (controllerState.last_error?.[0]) {
    throw new Error(
      `Controller ${firstControllerName} has error: ${controllerState.last_error[0]}`,
    )
  }

  const virtualMotionGroup = controllerState.motion_groups[0]

  if (!virtualMotionGroup) {
    throw new Error(
      `Could not find a joggable motion group. Saw controller: ${firstControllerName}`,
    )
  }

  const jogger = await nova.connectJogger(virtualMotionGroup.motion_group)

  function getJoints() {
    return jogger.motionStream.rapidlyChangingMotionState.joint_position
  }

  let joints = getJoints()

  await jogger.setJoggingMode("jogging")

  await jogger.rotateJoints({
    joint: 0,
    direction: "+",
    velocityRadsPerSec: 0.1,
  })
  await delay(500)
  await jogger.stop()

  await expect.poll(() => getJoints()[0]).toBeGreaterThan(joints[0] + 0.01)
  expect(getJoints()[1]).toBeCloseTo(joints[1])

  joints = getJoints()

  await jogger.rotateJoints({
    joint: 0,
    direction: "-",
    velocityRadsPerSec: 0.1,
  })
  await delay(500)
  await jogger.stop()

  await expect.poll(() => getJoints()[0]).toBeLessThan(joints[0] + 0.01)
  expect(getJoints()[1]).toBeCloseTo(joints[1])

  // Wait for motion to stop
  await vi.waitUntil(
    async () => {
      const joints = getJoints()
      await jogger.motionStream.motionStateSocket.nextMessage()
      return jointValuesEqual(joints, getJoints(), 0.0001)
    },
    {
      timeout: 3000,
    },
  )
})
