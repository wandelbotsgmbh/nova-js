import type {
  MotionGroupDescription,
  MotionGroupState,
  RobotTcp,
} from "@wandelbots/nova-api/v2"
import { AxiosError } from "axios"
import { makeAutoObservable, runInAction } from "mobx"
import type { AutoReconnectingWebsocket } from "../AutoReconnectingWebsocket"
import { tryParseJson } from "../converters"
import { jointValuesEqual, tcpPoseEqual } from "./motionStateUpdate"
import type { NovaClient } from "./NovaClient"

const MOTION_DELTA_THRESHOLD = 0.0001

export type MotionGroupOption = {
  selectionId: string
  motionGroupId: string
  controllerId: string
}

/**
 * Store representing the current state of a connected motion group.
 */
export class ConnectedMotionGroup {
  static async connect(
    nova: NovaClient,
    motionGroupId: string,
    controllerIds: string[],
  ) {
    const [_motionGroupIndex, controllerId] = motionGroupId.split("@") as [
      string,
      string,
    ]

    if (!controllerIds.includes(controllerId)) {
      throw new Error(`Controller ${controllerId} not found`)
    }

    // Get motion group state directly to verify it exists
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

    const motionStateSocket = nova.openReconnectingWebsocket(
      `/cells/${nova.config.cellId}/controllers/${controllerId}/motion-groups/${motionGroupId}/state-stream`,
    )

    console.log(
      `Connected motion state websocket to motion group ${motionGroupId}. Initial state:\n  `,
      initialMotionState,
    )

    // This is used to determine if the robot is virtual or physical
    let isVirtual = false
    try {
      const opMode =
        await nova.api.virtualControllerApi.getOperationMode(controllerId)

      if (opMode) isVirtual = true
    } catch (err) {
      if (err instanceof AxiosError) {
        console.log(
          `Received ${err.status} from getOperationMode, concluding that ${controllerId} is physical`,
        )
      } else {
        throw err
      }
    }

    // Find out what TCPs this motion group has (we need it for jogging)
    let tcps: RobotTcp[] = []
    try {
      tcps = await nova.api.virtualControllerApi.listVirtualRobotTcps(
        controllerId,
        motionGroupId,
      )
    } catch (err) {
      // Physical controllers may not support TCP listing
      console.log(`Could not list TCPs for ${motionGroupId}:`, err)
    }

    const motionGroupDescription =
      await nova.api.motionGroupApi.getMotionGroupDescription(
        controllerId,
        motionGroupId,
      )

    return new ConnectedMotionGroup(
      nova,
      controllerId,
      motionGroupId,
      initialMotionState,
      motionStateSocket,
      isVirtual,
      tcps,
      motionGroupDescription,
    )
  }

  connectedJoggingCartesianSocket: WebSocket | null = null
  connectedJoggingJointsSocket: WebSocket | null = null
  planData: any | null // tmp
  joggingVelocity: number = 10

  // Not mobx-observable as this changes very fast; should be observed
  // using animation frames
  rapidlyChangingMotionState: MotionGroupState

  constructor(
    readonly nova: NovaClient,
    readonly controllerId: string,
    readonly motionGroupId: string,
    readonly initialMotionState: MotionGroupState,
    readonly motionStateSocket: AutoReconnectingWebsocket,
    readonly isVirtual: boolean,
    readonly tcps: RobotTcp[],
    readonly motionGroupDescription: MotionGroupDescription,
  ) {
    this.rapidlyChangingMotionState = initialMotionState

    motionStateSocket.addEventListener("message", (event) => {
      const motionStateResponse = tryParseJson(event.data)?.result as
        | MotionGroupState
        | undefined

      if (!motionStateResponse) {
        throw new Error(
          `Failed to get motion state for ${this.motionGroupId}: ${event.data}`,
        )
      }

      // handle motionState message
      if (
        !jointValuesEqual(
          this.rapidlyChangingMotionState.joint_position.joints,
          motionStateResponse.joint_position.joints,
          MOTION_DELTA_THRESHOLD,
        )
      ) {
        runInAction(() => {
          this.rapidlyChangingMotionState = motionStateResponse
        })
      }

      // handle tcpPose message
      if (
        !tcpPoseEqual(
          this.rapidlyChangingMotionState.tcp_pose,
          motionStateResponse.tcp_pose,
          MOTION_DELTA_THRESHOLD,
        )
      ) {
        runInAction(() => {
          this.rapidlyChangingMotionState.tcp_pose =
            motionStateResponse.tcp_pose
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

  /** Jogging velocity in radians for rotation and joint movement */
  get joggingVelocityRads() {
    return (this.joggingVelocity * Math.PI) / 180
  }

  get joints() {
    return this.initialMotionState.joint_position.joints.map((_, i) => {
      return {
        index: i,
      }
    })
  }

  get dhParameters() {
    return this.motionGroupDescription.dh_parameters
  }

  get safetyZones() {
    return this.motionGroupDescription.safety_zones || []
  }

  dispose() {
    this.motionStateSocket.close()
    if (this.connectedJoggingCartesianSocket)
      this.connectedJoggingCartesianSocket.close()
    if (this.connectedJoggingJointsSocket)
      this.connectedJoggingJointsSocket.close()
  }

  setJoggingVelocity(velocity: number) {
    this.joggingVelocity = velocity
  }
}
