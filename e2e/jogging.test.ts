import { keyBy } from "lodash-es"
import { expect, test, vi } from "vitest"
import { delay } from "../src/lib/errorHandling"
import { NovaClient } from "../src/lib/v1"
import { jointValuesEqual } from "../src/lib/v1/motionStateUpdate"
import { env } from "./env"

test("jog a robot somewhat", async () => {
  const nova = new NovaClient({
    instanceUrl: env.NOVA,
  })

  // Find a virtual robot we can jog
  const cell = await nova.api.cell.getCell("cell")
  const configsByController = keyBy(cell.controllers || [], (c) => c.name)

  const controllers = await nova.api.controller.listControllers()

  const virtualMotionGroups = controllers.instances
    .filter(
      (c) =>
        configsByController[c.controller]?.configuration.kind ===
          "VirtualController" && !c.has_error,
    )
    .flatMap((c) => c.physical_motion_groups)

  const virtualMotionGroup = virtualMotionGroups[0]
  if (!virtualMotionGroup) {
    throw new Error(
      `Could not find a joggable motion group. Saw controllers: ${JSON.stringify(
        controllers.instances.map((c) => ({
          controller: c.controller,
          has_error: c.has_error,
          physical_motion_groups: c.physical_motion_groups.map(
            (mg) => mg.motion_group,
          ),
        })),
      )}`,
    )
  }

  console.log("Found virtual motion group to jog:", virtualMotionGroup)

  const jogger = await nova.connectJogger(virtualMotionGroup.motion_group)

  function getJoints() {
    return jogger.motionStream.rapidlyChangingMotionState.state.joint_position
      .joints
  }

  let joints = getJoints()

  jogger.setJoggingMode("joint")

  await jogger.startJointRotation({
    joint: 0,
    direction: "+",
    velocityRadsPerSec: 0.1,
  })
  await delay(500)
  await jogger.stop()

  await expect.poll(() => getJoints()[0]).toBeGreaterThan(joints[0] + 0.01)
  expect(getJoints()[1]).toBeCloseTo(joints[1])

  joints = getJoints()

  await jogger.startJointRotation({
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
      await jogger.activeWebsocket?.nextMessage()
      return jointValuesEqual(joints, getJoints(), 0.0001)
    },
    {
      timeout: 3000,
    },
  )
})
