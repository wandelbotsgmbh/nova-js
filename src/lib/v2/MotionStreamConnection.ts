import type { MotionGroupDescription, MotionGroupState } from "@wandelbots/nova-api/v2"
import { makeAutoObservable, runInAction } from "mobx"
import * as THREE from "three"
import type { AutoReconnectingWebsocket } from "../AutoReconnectingWebsocket"
import { tryParseJson } from "../converters"
import { jointValuesEqual, tcpPoseEqual } from "./motionStateUpdate"
import type { NovaClient } from "./NovaClient"
import { type Vector3d, vector3ToArray } from "./vectorUtils"

const MOTION_DELTA_THRESHOLD = 0.0001

function unwrapRotationVector(
  newRotationVectorApi: Vector3d,
  currentRotationVectorApi: Vector3d,
): Vector3d {
  const currentRotationVector = new THREE.Vector3(
    currentRotationVectorApi[0],
    currentRotationVectorApi[1],
    currentRotationVectorApi[2],
  )

  const newRotationVector = new THREE.Vector3(
    newRotationVectorApi[0],
    newRotationVectorApi[1],
    newRotationVectorApi[2],
  )

  const currentAngle = currentRotationVector.length()
  const currentAxis = currentRotationVector.normalize()

  let newAngle = newRotationVector.length()
  let newAxis = newRotationVector.normalize()

  // Align rotation axes
  if (newAxis.dot(currentAxis) < 0) {
    newAngle = -newAngle
    newAxis = newAxis.multiplyScalar(-1.0)
  }

  // Shift rotation angle close to previous one to extend domain of rotation angles beyond [0, pi]
  // - this simplifies interpolation and prevents abruptly changing signs of the rotation angles
  let angleDifference = newAngle - currentAngle
  angleDifference -=
    2.0 * Math.PI * Math.floor((angleDifference + Math.PI) / (2.0 * Math.PI))

  newAngle = currentAngle + angleDifference

  return vector3ToArray(newAxis.multiplyScalar(newAngle))
}

/**
 * Store representing the current state of a connected motion group.
 */
export class MotionStreamConnection {
  static async open(nova: NovaClient, motionGroupId: string) {
    const controllerIds = await nova.api.controllerApi.listRobotControllers()

    const [_motionGroupIndex, controllerId] = motionGroupId.split("@") as [
      string,
      string,
    ]

    if (!controllerIds.includes(controllerId)) {
      throw new Error(`Controller ${controllerId} not found`)
    }

    // Verify motion group exists by getting its state
    let initialMotionState: MotionGroupState
    try {
      initialMotionState =
        await nova.api.motionGroupApi.getCurrentMotionGroupState(
          controllerId,
          motionGroupId,
        )
    } catch (error) {
      throw new Error(
        `Motion group ${motionGroupId} not found on controller ${controllerId}`,
      )
    }

    const motionGroupDescription =
      await nova.api.motionGroupApi.getMotionGroupDescription(
        controllerId,
        motionGroupId,
      )

    const motionStateSocket = nova.openReconnectingWebsocket(
      `/cells/${nova.config.cellId}/controllers/${controllerId}/motion-groups/${motionGroupId}/state-stream`,
    )

    console.log(
      `Connected motion state websocket to motion group ${motionGroupId}. Initial state:\n  `,
      initialMotionState,
    )

    return new MotionStreamConnection(
      nova,
      controllerId,
      motionGroupId,
      initialMotionState,
      motionStateSocket,
      motionGroupDescription,
    )
  }

  // Not mobx-observable as this changes very fast; should be observed
  // using animation frames
  rapidlyChangingMotionState: MotionGroupState

  constructor(
    readonly nova: NovaClient,
    readonly controllerId: string,
    readonly motionGroupId: string,
    readonly initialMotionState: MotionGroupState,
    readonly motionStateSocket: AutoReconnectingWebsocket,
    readonly motionGroupDescription: MotionGroupDescription,
  ) {
    this.rapidlyChangingMotionState = initialMotionState

    motionStateSocket.addEventListener("message", (event) => {
      const motionState = tryParseJson(event.data)?.result as
        | MotionGroupState
        | undefined

      if (!motionState) {
        throw new Error(
          `Failed to get motion state for ${this.motionGroupId}: ${event.data}`,
        )
      }

      // handle motionState message
      if (
        !jointValuesEqual(
          this.rapidlyChangingMotionState.joint_position.joints,
          motionState.joint_position.joints,
          MOTION_DELTA_THRESHOLD,
        )
      ) {
        runInAction(() => {
          this.rapidlyChangingMotionState = motionState
        })
      }

      // handle tcpPose message
      if (
        !tcpPoseEqual(
          this.rapidlyChangingMotionState.tcp_pose,
          motionState.tcp_pose,
          MOTION_DELTA_THRESHOLD,
        )
      ) {
        runInAction(() => {
          if (this.rapidlyChangingMotionState.tcp_pose === undefined) {
            this.rapidlyChangingMotionState.tcp_pose = motionState.tcp_pose
          } else {
            this.rapidlyChangingMotionState.tcp_pose = {
              position: motionState.tcp_pose!.position,
              orientation: unwrapRotationVector(
                motionState.tcp_pose!.orientation as Vector3d,
                this.rapidlyChangingMotionState.tcp_pose!
                  .orientation as Vector3d,
              ),
              // reference_coordinate_system removed in v2
            }
          }
        })
      }
    })
    makeAutoObservable(this)
  }

  get modelFromController() {
    return this.motionGroupDescription.motion_group_model || "Unknown"
  }

  get wandelscriptIdentifier() {
    const num = this.motionGroupId.split("@")[0]
    return `${this.controllerId.replaceAll("-", "_")}_${num}`
  }

  get joints() {
    return this.initialMotionState.joint_position.joints.map((_, i) => {
      return {
        index: i,
      }
    })
  }

  dispose() {
    this.motionStateSocket.close()
  }
}
