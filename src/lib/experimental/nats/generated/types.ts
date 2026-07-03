/**
 * AUTO-GENERATED FILE - DO NOT EDIT.
 * Generated from src/asyncapi.yaml by scripts/generate-nats-client.ts.
 * Run `pnpm generate:nats` to regenerate.
 */

/**
 * A unique name for the cell used as an identifier for addressing the cell in all API calls.
 * It must be a valid k8s label name as defined by [RFC 1123](https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#dns-label-names).
 *
 *
 * This interface was referenced by `GeneratedNatsPayloadsRoot`'s JSON-Schema
 * via the `definition` "CellName".
 */
export type CellName = string
/**
 * A description of the cell.
 *
 *
 * This interface was referenced by `GeneratedNatsPayloadsRoot`'s JSON-Schema
 * via the `definition` "CellDescription".
 */
export type CellDescription = string
/**
 * This interface was referenced by `GeneratedNatsPayloadsRoot`'s JSON-Schema
 * via the `definition` "Manufacturer".
 */
export type Manufacturer =
  | "abb"
  | "fanuc"
  | "kuka"
  | "staubli"
  | "universalrobots"
  | "yaskawa"
/**
 * Identifies a single motion group model.
 * See [getMotionGroupModels](#/operations/getMotionGroupModels) for supported types.
 *
 *
 * This interface was referenced by `GeneratedNatsPayloadsRoot`'s JSON-Schema
 * via the `definition` "MotionGroupModel".
 */
export type MotionGroupModel = string
/**
 * Request body wrapper for `addVirtualControllerMotionGroup`.
 * Allow either referencing a predefined motion group model or
 * uploading a JSON configuration that the backend converts into a
 * motion group description.
 *
 *
 * This interface was referenced by `GeneratedNatsPayloadsRoot`'s JSON-Schema
 * via the `definition` "AddVirtualControllerMotionGroupRequest".
 */
export type AddVirtualControllerMotionGroupRequest =
  | MotionGroupFromModel
  | MotionGroupFromJSON
/**
 * A list of environment variables with name and their value.
 * These can be used to configure the containerized application, and turn features on or off.
 *
 *
 * This interface was referenced by `GeneratedNatsPayloadsRoot`'s JSON-Schema
 * via the `definition` "ContainerEnvironment".
 */
export type ContainerEnvironment = {
  name: string
  value: string
}[]
/**
 * The amount of requested storage capacity.
 *
 * This interface was referenced by `GeneratedNatsPayloadsRoot`'s JSON-Schema
 * via the `definition` "Capacity".
 */
export type Capacity = string
/**
 * The state of a program run.
 *
 * This interface was referenced by `GeneratedNatsPayloadsRoot`'s JSON-Schema
 * via the `definition` "ProgramRunState".
 */
export type ProgramRunState =
  | "PREPARING"
  | "RUNNING"
  | "COMPLETED"
  | "FAILED"
  | "STOPPED"
/**
 * State of the program run.
 */
export type ProgramRunState1 =
  | "PREPARING"
  | "RUNNING"
  | "COMPLETED"
  | "FAILED"
  | "STOPPED"
/**
 * This interface was referenced by `GeneratedNatsPayloadsRoot`'s JSON-Schema
 * via the `definition` "ServiceGroup".
 */
export type ServiceGroup =
  | "SystemService"
  | "CellService"
  | "RobotController"
  | "App"
/**
 * This interface was referenced by `GeneratedNatsPayloadsRoot`'s JSON-Schema
 * via the `definition` "ServiceStatusSeverity".
 */
export type ServiceStatusSeverity = "INFO" | "WARNING" | "ERROR"
/**
 * This interface was referenced by `GeneratedNatsPayloadsRoot`'s JSON-Schema
 * via the `definition` "ServiceStatusPhase".
 */
export type ServiceStatusPhase =
  | "Terminating"
  | "Initialized"
  | "Running"
  | "NoReady"
  | "Completed"
  | "ContainerCreating"
  | "PodInitializing"
  | "Unknown"
  | "CrashLoopBackOff"
  | "Error"
  | "ImagePullBackOff"
  | "OOMKilled"
  | "Pending"
  | "Evicted"
/**
 * This interface was referenced by `GeneratedNatsPayloadsRoot`'s JSON-Schema
 * via the `definition` "ServiceStatusList".
 */
export type ServiceStatusList = ServiceStatus[]
/**
 * A three-dimensional vector [x, y, z] with double precision.
 *
 *
 * @minItems 3
 * @maxItems 3
 *
 * This interface was referenced by `GeneratedNatsPayloadsRoot`'s JSON-Schema
 * via the `definition` "Vector3d".
 */
export type Vector3D = [number, number, number]
/**
 * Defines a rotation in 3D space.
 * A three-dimensional Vector [rx, ry, rz] with double precision.
 * Rotation is applied around the vector.
 * The angle of rotation equals the length of the vector.
 *
 *
 * @minItems 3
 * @maxItems 3
 *
 * This interface was referenced by `GeneratedNatsPayloadsRoot`'s JSON-Schema
 * via the `definition` "RotationVector".
 */
export type RotationVector = [number, number, number]
/**
 * A link chain is a kinematic chain of links that is connected via joints.
 * A motion group can be used to control the motion of the joints in a link chain.
 *
 * A link is a group of colliders that is attached to the link reference frame.
 *
 * The reference frame of a link is obtained after applying all sets of Denavit-Hartenberg-parameters from base to (including) the link index.
 *
 * This means that the reference frame of the link is on the rotation axis of the next joint in the kinematic chain.
 * Example: For a motion group with 2 joints, the collider reference frame (CRF) for link 1 is on the rotation axis of joint 2. The chain looks like:
 * - Origin >> Mounting >> Base >> (CRF Base) Joint 0 >> Link 0 >> (CRF Link 0) Joint 1 >> Link 1 >> (CRF Link 1) Flange (CRF Tool) >> TCP
 *
 * Adjacent links in the kinematic chain of the motion group are not checked for mutual collision.
 *
 *
 * This interface was referenced by `GeneratedNatsPayloadsRoot`'s JSON-Schema
 * via the `definition` "LinkChain".
 */
export type LinkChain = CollisionMotionGroupLink[]
/**
 * The shape of the motion groups links to validate against colliders.
 * Indexed along the kinematic chain, starting with a static base shape before first joint.
 * The base of the motion group is not checked for collision against the environment.
 *
 */
export type LinkChain1 = CollisionMotionGroupLink[]
/**
 * Current state of the BUS input/output service.
 *
 *
 * This interface was referenced by `GeneratedNatsPayloadsRoot`'s JSON-Schema
 * via the `definition` "BusIOsStateEnum".
 */
export type BusIOsStateEnum =
  | "BUS_IOS_STATE_UNKNOWN"
  | "BUS_IOS_STATE_INITIALIZING"
  | "BUS_IOS_STATE_CONNECTED"
  | "BUS_IOS_STATE_DISCONNECTED"
/**
 * This interface was referenced by `GeneratedNatsPayloadsRoot`'s JSON-Schema
 * via the `definition` "IOValue".
 */
export type IOValue = IOBooleanValue | IOIntegerValue | IOFloatValue
/**
 * Array of input/output values.
 *
 * This interface was referenced by `GeneratedNatsPayloadsRoot`'s JSON-Schema
 * via the `definition` "ListIOValuesResponse".
 */
export type ListIOValuesResponse = IOValue[]
/**
 * Defines the current system mode of the robot system, including NOVA communicating with the robot controller.
 *
 * ### MODE_CONTROLLER_NOT_CONFIGURED
 *
 * No controller with the specified identifier is configured. Call [addRobotController](#/operations/addRobotController) to register a controller.
 *
 * ### MODE_INITIALIZING
 *
 * Indicates that a connection to the robot controller is established or reestablished in case of a disconnect.
 * On success, the controller is set to MODE_MONITOR.
 * On failure, the initialization process is retried until successful or cancelled by the user.
 *
 * ### MODE_MONITOR
 *
 * Read-only mode with an active controller connection.
 * - Receives robot state and I/O signals
 * - Move requests are rejected
 * - No commands are sent to the controller
 *
 * ### MODE_CONTROL
 *
 * Active control mode.
 *
 * **Movement is possible in this mode**
 *
 * The robot is cyclically commanded to hold its current position.
 * The robot state is received in sync with the controller cycle.
 * Motion and jogging requests are accepted and executed.
 * Input/Output interaction is enabled.
 *
 * ### MODE_FREE_DRIVE
 *
 * Read-only mode with servo motors enabled for manual movement (Free Drive).
 *
 * Move requests are rejected.
 *
 * Not supported by all robots: Use [getSupportedModes](#/operations/getSupportedModes) to check Free Drive availability.
 *
 *
 * This interface was referenced by `GeneratedNatsPayloadsRoot`'s JSON-Schema
 * via the `definition` "RobotSystemMode".
 */
export type RobotSystemMode =
  | "MODE_CONTROLLER_NOT_CONFIGURED"
  | "MODE_INITIALIZING"
  | "MODE_MONITOR"
  | "MODE_CONTROL"
  | "MODE_FREE_DRIVE"
/**
 * Current operation mode of the configured robot controller.
 * Operation modes in which the attached motion groups can be moved are:
 * - OPERATION_MODE_MANUAL (if enabling switch is pressed)
 * - OPERATION_MODE_MANUAL_T1 (if enabling switch is pressed)
 * - OPERATION_MODE_MANUAL_T2 (if enabling switch is pressed)
 * - OPERATION_MODE_AUTO (without needing to press enabling switch)
 * All other modes are considered as non-operational.
 *
 *
 * This interface was referenced by `GeneratedNatsPayloadsRoot`'s JSON-Schema
 * via the `definition` "OperationMode".
 */
export type OperationMode =
  | "OPERATION_MODE_UNKNOWN"
  | "OPERATION_MODE_NO_CONTROLLER"
  | "OPERATION_MODE_DISCONNECTED"
  | "OPERATION_MODE_POWER_ON"
  | "OPERATION_MODE_PENDING"
  | "OPERATION_MODE_MANUAL"
  | "OPERATION_MODE_MANUAL_T1"
  | "OPERATION_MODE_MANUAL_T2"
  | "OPERATION_MODE_AUTO"
  | "OPERATION_MODE_RECOVERY"
/**
 * Current safety state of the configured robot controller.
 * Operation modes in which the attached motion groups can be moved are:
 * - SAFETY_STATE_NORMAL
 * - SAFETY_STATE_REDUCED
 * All other modes are considered as non-operational.
 *
 *
 * This interface was referenced by `GeneratedNatsPayloadsRoot`'s JSON-Schema
 * via the `definition` "SafetyStateType".
 */
export type SafetyStateType =
  | "SAFETY_STATE_UNKNOWN"
  | "SAFETY_STATE_FAULT"
  | "SAFETY_STATE_NORMAL"
  | "SAFETY_STATE_MASTERING"
  | "SAFETY_STATE_CONFIRM_SAFETY"
  | "SAFETY_STATE_OPERATOR_SAFETY"
  | "SAFETY_STATE_PROTECTIVE_STOP"
  | "SAFETY_STATE_REDUCED"
  | "SAFETY_STATE_STOP"
  | "SAFETY_STATE_STOP_0"
  | "SAFETY_STATE_STOP_1"
  | "SAFETY_STATE_STOP_2"
  | "SAFETY_STATE_RECOVERY"
  | "SAFETY_STATE_DEVICE_EMERGENCY_STOP"
  | "SAFETY_STATE_ROBOT_EMERGENCY_STOP"
  | "SAFETY_STATE_VIOLATION"
/**
 * This structure describes a set of joint values, e.g., positions, currents, torques, of a motion group.
 *
 * Float precision is the default.
 *
 *
 * This interface was referenced by `GeneratedNatsPayloadsRoot`'s JSON-Schema
 * via the `definition` "Joints".
 */
export type Joints = number[]
/**
 * - The location is a scalar value that defines a position along a path, typically ranging from 0 to `n`,
 *   where `n` denotes the number of motion commands
 * - Each integer value of the location corresponds to a specific motion command,
 *   while non-integer values interpolate positions within the segments.
 * - The location is calculated from the joint path
 *
 *
 * This interface was referenced by `GeneratedNatsPayloadsRoot`'s JSON-Schema
 * via the `definition` "Location".
 */
export type Location = number
/**
 * Current joint position of each joint.
 * The unit depends on the type of joint: For revolute joints, the angle is given in [rad]; for prismatic joints, the displacement is given in [mm].
 *
 */
export type Joints1 = number[]
/**
 * Current joint torque of each joint in [Nm].
 * Is only available if the robot controller supports it, e.g., available for UR controllers.
 *
 */
export type Joints2 = number[]
/**
 * Current at TCP in [A].
 * Is only available if the robot controller supports it, e.g., available for UR controllers.
 *
 */
export type Joints3 = number[]
/**
 * State of indicated motion groups.
 * In case of state request via controller all configured motion groups are returned.
 * In case of executing a motion only the affected motion groups are returned.
 *
 */
export type MotionGroupState1 = MotionGroupState[]
/**
 * A three-dimensional vector [x, y, z] with double precision.
 *
 *
 * @minItems 3
 * @maxItems 3
 */
export type Vector3D1 = [number, number, number]
/**
 * A three-dimensional vector [x, y, z] with double precision.
 *
 *
 * @minItems 3
 * @maxItems 3
 */
export type Vector3D2 = [number, number, number]
/**
 * This interface was referenced by `GeneratedNatsPayloadsRoot`'s JSON-Schema
 * via the `definition` "JointTypeEnum".
 */
export type JointTypeEnum = "REVOLUTE_JOINT" | "PRISMATIC_JOINT"
/**
 * This interface was referenced by `GeneratedNatsPayloadsRoot`'s JSON-Schema
 * via the `definition` "SystemUpdateStartedEvent".
 */
export type SystemUpdateStartedEvent = CloudEvent & {
  type?: "nova.v2.events.system.update.started"
  source?: "/nova/service-manager"
  /**
   * Unique identifier for this update process
   */
  id: {
    [k: string]: unknown
  }
  /**
   * Timestamp when the update process started (RFC3339)
   */
  time: {
    [k: string]: unknown
  }
  /**
   * System update started event payload
   */
  data: {
    /**
     * New system version being installed
     */
    newVersion: string
    /**
     * Previous system version, if available
     */
    oldVersion?: string
  }
}
/**
 * This interface was referenced by `GeneratedNatsPayloadsRoot`'s JSON-Schema
 * via the `definition` "SystemUpdateCompletedEvent".
 */
export type SystemUpdateCompletedEvent = CloudEvent & {
  type?: "nova.v2.events.system.update.completed"
  source?: "/nova/service-manager"
  /**
   * Same unique identifier from the started event for correlation
   */
  id: {
    [k: string]: unknown
  }
  /**
   * Timestamp when the update process completed (RFC3339)
   */
  time: {
    [k: string]: unknown
  }
  /**
   * System update completed event payload
   */
  data: {
    /**
     * New system version that was installed
     */
    newVersion: string
    /**
     * Error message if update failed
     */
    error?: string
  }
}
/**
 * The operating state.
 *
 * This interface was referenced by `GeneratedNatsPayloadsRoot`'s JSON-Schema
 * via the `definition` "OperatingState".
 */
export type OperatingState = "ACTIVE" | "INACTIVE"
/**
 * This interface was referenced by `GeneratedNatsPayloadsRoot`'s JSON-Schema
 * via the `definition` "CellCreatedEvent".
 */
export type CellCreatedEvent = {
  type?: "nova.v2.events.cells.{cell}.created"
  source?: "/nova/service-manager"
  /**
   * Unique identifier for this cell created event.
   */
  id: {
    [k: string]: unknown
  }
  /**
   * Timestamp when the cell foundation release was created.
   */
  time: {
    [k: string]: unknown
  }
  data: CellEventData
} & CloudEvent
/**
 * This interface was referenced by `GeneratedNatsPayloadsRoot`'s JSON-Schema
 * via the `definition` "CellUpdatedEvent".
 */
export type CellUpdatedEvent = {
  type?: "nova.v2.events.cells.{cell}.updated"
  source?: "/nova/service-manager"
  /**
   * Unique identifier for this cell updated event.
   */
  id: {
    [k: string]: unknown
  }
  /**
   * Timestamp when the cell foundation release was updated.
   */
  time: {
    [k: string]: unknown
  }
  data: CellEventData
} & CloudEvent
/**
 * This interface was referenced by `GeneratedNatsPayloadsRoot`'s JSON-Schema
 * via the `definition` "CellDeletedEvent".
 */
export type CellDeletedEvent = {
  type?: "nova.v2.events.cells.{cell}.deleted"
  source?: "/nova/service-manager"
  /**
   * Unique identifier for this cell deleted event.
   */
  id: {
    [k: string]: unknown
  }
  /**
   * Timestamp when the cell foundation release was deleted.
   */
  time: {
    [k: string]: unknown
  }
  data: CellEventData
} & CloudEvent
/**
 * This interface was referenced by `GeneratedNatsPayloadsRoot`'s JSON-Schema
 * via the `definition` "AppCreatedEvent".
 */
export type AppCreatedEvent = {
  type?: "nova.v2.events.cells.{cell}.apps.{app}.created"
  source?: "/nova/service-manager"
  /**
   * Unique identifier for this app created event.
   */
  id: {
    [k: string]: unknown
  }
  /**
   * Timestamp when the app release was created.
   */
  time: {
    [k: string]: unknown
  }
  data: AppEventData
} & CloudEvent
/**
 * This interface was referenced by `GeneratedNatsPayloadsRoot`'s JSON-Schema
 * via the `definition` "AppUpdatedEvent".
 */
export type AppUpdatedEvent = {
  type?: "nova.v2.events.cells.{cell}.apps.{app}.updated"
  source?: "/nova/service-manager"
  /**
   * Unique identifier for this app updated event.
   */
  id: {
    [k: string]: unknown
  }
  /**
   * Timestamp when the app release was updated.
   */
  time: {
    [k: string]: unknown
  }
  data: AppEventData
} & CloudEvent
/**
 * This interface was referenced by `GeneratedNatsPayloadsRoot`'s JSON-Schema
 * via the `definition` "AppDeletedEvent".
 */
export type AppDeletedEvent = {
  type?: "nova.v2.events.cells.{cell}.apps.{app}.deleted"
  source?: "/nova/service-manager"
  /**
   * Unique identifier for this app deleted event.
   */
  id: {
    [k: string]: unknown
  }
  /**
   * Timestamp when the app release was deleted.
   */
  time: {
    [k: string]: unknown
  }
  data: AppEventData
} & CloudEvent
/**
 * This interface was referenced by `GeneratedNatsPayloadsRoot`'s JSON-Schema
 * via the `definition` "RobotControllerCreatedEvent".
 */
export type RobotControllerCreatedEvent = {
  type?: "nova.v2.events.cells.{cell}.controllers.{controller}.created"
  source?: "/nova/service-manager"
  /**
   * Unique identifier for this robot controller created event.
   */
  id: {
    [k: string]: unknown
  }
  /**
   * Timestamp when the robot controller release was created.
   */
  time: {
    [k: string]: unknown
  }
  data: RobotControllerEventData
} & CloudEvent
/**
 * This interface was referenced by `GeneratedNatsPayloadsRoot`'s JSON-Schema
 * via the `definition` "RobotControllerUpdatedEvent".
 */
export type RobotControllerUpdatedEvent = {
  type?: "nova.v2.events.cells.{cell}.controllers.{controller}.updated"
  source?: "/nova/service-manager"
  /**
   * Unique identifier for this robot controller updated event.
   */
  id: {
    [k: string]: unknown
  }
  /**
   * Timestamp when the robot controller release was updated.
   */
  time: {
    [k: string]: unknown
  }
  data: RobotControllerEventData
} & CloudEvent
/**
 * This interface was referenced by `GeneratedNatsPayloadsRoot`'s JSON-Schema
 * via the `definition` "RobotControllerDeletedEvent".
 */
export type RobotControllerDeletedEvent = {
  type?: "nova.v2.events.cells.{cell}.controllers.{controller}.deleted"
  source?: "/nova/service-manager"
  /**
   * Unique identifier for this robot controller deleted event.
   */
  id: {
    [k: string]: unknown
  }
  /**
   * Timestamp when the robot controller release was deleted.
   */
  time: {
    [k: string]: unknown
  }
  data: RobotControllerEventData
} & CloudEvent

export interface AbbController {
  kind: "AbbController"
  controller_ip: string
  /**
   * Default values: 80, 443. If custom value is set, field is required.
   *
   */
  controller_port: number
  /**
   * The EGM server runs inside of the cell, thus its IP must be in the same network as the 'controller_ip'
   */
  egm_server: {
    ip: string
    port: number
  }
}
/**
 * Optional dedicated network interface for a physical robot controller.
 *
 * When set, the controller is given its own network interface on the selected
 * physical network port (`pf`) with the given `address`, so it can reach the
 * robot network directly.
 *
 *
 * This interface was referenced by `GeneratedNatsPayloadsRoot`'s JSON-Schema
 * via the `definition` "ControllerNetworkInterface".
 */
export interface ControllerNetworkInterface {
  /**
   * IPv4 address in CIDR notation to assign to the controller's network
   * interface, for example `192.168.1.10/24`. The value must be a valid IPv4
   * address followed by a prefix length between 0 and 32.
   *
   */
  address: string
  /**
   * Name of the node's physical network port that connects to the robot
   * network, for example `enp10s0f0`. The controller's interface is provided
   * from this port.
   *
   */
  pf: string
}
/**
 * The configuration of a physical FANUC robot controller has to contain IP address of the controller.
 *
 * This interface was referenced by `GeneratedNatsPayloadsRoot`'s JSON-Schema
 * via the `definition` "FanucController".
 */
export interface FanucController {
  kind: "FanucController"
  controller_ip: string
  network_interface?: ControllerNetworkInterface
}
/**
 * The configuration of a physical KUKA robot controller has to contain an IP address.
 * Additionally an RSI server configuration has to be specified in order to control the robot.
 * Deploying the server is a functionality of this API.
 *
 *
 * This interface was referenced by `GeneratedNatsPayloadsRoot`'s JSON-Schema
 * via the `definition` "KukaController".
 */
export interface KukaController {
  kind: "KukaController"
  controller_ip: string
  controller_port: number
  /**
   * The RSI server runs inside of the cell.
   */
  rsi_server: {
    ip: string
    port: number
  }
  /**
   * If true, uses slower cycle time of 12ms instead of 4ms.
   *
   */
  slow_cycle_rate?: boolean
}
/**
 * The configuration of a physical Universal Robots controller has to contain IP address of the controller.
 *
 * This interface was referenced by `GeneratedNatsPayloadsRoot`'s JSON-Schema
 * via the `definition` "UniversalrobotsController".
 */
export interface UniversalrobotsController {
  kind: "UniversalrobotsController"
  controller_ip: string
}
/**
 * This interface was referenced by `GeneratedNatsPayloadsRoot`'s JSON-Schema
 * via the `definition` "MotionGroupFromType".
 */
export interface MotionGroupFromModel {
  /**
   * Unique identifier for the motion group to be added.
   */
  motion_group: string
  motion_group_model: MotionGroupModel
  /**
   * Initial joint position of the added motion group.
   * Provides the joint position as a JSON array of float values in radians. The array length
   * must match the robot's degrees of freedom, e.g., `"[0, 0, 0, 0, 0, 0]"` for a 6-DOF robot.
   * If the provided array length does not match the robot's DOF, the array will be adjusted; if it is longer, extra values will be truncated;
   * if it is shorter, missing values will be filled with zeros.
   *
   */
  initial_joint_position?: string
}
/**
 * This interface was referenced by `GeneratedNatsPayloadsRoot`'s JSON-Schema
 * via the `definition` "MotionGroupFromJson".
 */
export interface MotionGroupFromJSON {
  /**
   * Unique identifier for the motion group to be added.
   */
  motion_group: string
  /**
   * JSON configuration of the virtual robot controller, can be obtained from the physical controller's configuration
   * via [getVirtualControllerConfiguration](#/operations/getVirtualControllerConfiguration).
   *
   */
  json_data: string
  /**
   * The identifier of the motion group that needs to be extracted from the provided JSON configuration.
   *
   */
  extracted_motion_group_id: string
  /**
   * Initial joint position of the added motion group.
   * Provides the joint position as a JSON array of float values in radians. The array length
   * must match the robot's degrees of freedom, e.g., `"[0, 0, 0, 0, 0, 0]"` for a 6-DOF robot.
   * If the provided array length does not match the robot's DOF, the array will be adjusted: if it is longer, extra values will be truncated;
   * if it is shorter, missing values will be filled with zeros.
   *
   */
  initial_joint_position?: string
}
/**
 * The configuration of a virtual robot controller has to contain the manufacturer string,
 * an optional joint position string array, and either a preset `type` **or** the complete JSON configuration.
 *
 *
 * This interface was referenced by `GeneratedNatsPayloadsRoot`'s JSON-Schema
 * via the `definition` "VirtualController".
 */
export interface VirtualController {
  kind: "VirtualController"
  manufacturer: Manufacturer
  /**
   * Preset type of the virtual robot controller.
   * See [getRobotConfigurations](#/operations/getRobotConfigurations) for supported types.
   *
   */
  type?: string
  /**
   * Complete JSON configuration of the virtual robot controller.
   * Can be obtained from the physical controller's configuration via [getVirtualControllerConfiguration](#/operations/getVirtualControllerConfiguration).
   * If provided, the `type` field should not be used.
   *
   */
  json?: string
  /**
   * Initial joint position of the first motion group from the virtual robot controller.
   * Provides the joint position as a JSON array of float values in radians. The array length
   * must match the robot's degrees of freedom, e.g., `"[0, 0, 0, 0, 0, 0]"` for a 6-DOF robot.
   * If the provided array length does not match the robot's DOF, the array will be adjusted: if it is longer, extra values will be truncated;
   * if it is shorter, missing values will be filled with zeros.
   *
   */
  initial_joint_position?: string
  /**
   * Adds a motion group configuration for the virtual robot controller.
   *
   * > **NOTE**
   * >
   * > Set only one of the two options, **motion_group_model**, or **json_data**
   *
   * - **motion_group_model**: Identifies a single motion group. See [getMotionGroupModels](#/operations/getMotionGroupModels) for supported types
   * - **json_data**: JSON configuration of the virtual robot controller, can be obtained from the physical controller's configuration
   *     via [getVirtualControllerConfiguration](#/operations/getVirtualControllerConfiguration)
   * - **extracted_motion_group_id**: Motion group identifier to extract from the provided JSON configuration,  required when using json_data
   * - **motion_group**: Unique identifier for the motion group
   * - **initial_joint_position**: Specifies the initial joint position for the added motion group
   *
   *
   * @maxItems 10
   */
  motion_groups?:
    | []
    | [AddVirtualControllerMotionGroupRequest]
    | [
        AddVirtualControllerMotionGroupRequest,
        AddVirtualControllerMotionGroupRequest,
      ]
    | [
        AddVirtualControllerMotionGroupRequest,
        AddVirtualControllerMotionGroupRequest,
        AddVirtualControllerMotionGroupRequest,
      ]
    | [
        AddVirtualControllerMotionGroupRequest,
        AddVirtualControllerMotionGroupRequest,
        AddVirtualControllerMotionGroupRequest,
        AddVirtualControllerMotionGroupRequest,
      ]
    | [
        AddVirtualControllerMotionGroupRequest,
        AddVirtualControllerMotionGroupRequest,
        AddVirtualControllerMotionGroupRequest,
        AddVirtualControllerMotionGroupRequest,
        AddVirtualControllerMotionGroupRequest,
      ]
    | [
        AddVirtualControllerMotionGroupRequest,
        AddVirtualControllerMotionGroupRequest,
        AddVirtualControllerMotionGroupRequest,
        AddVirtualControllerMotionGroupRequest,
        AddVirtualControllerMotionGroupRequest,
        AddVirtualControllerMotionGroupRequest,
      ]
    | [
        AddVirtualControllerMotionGroupRequest,
        AddVirtualControllerMotionGroupRequest,
        AddVirtualControllerMotionGroupRequest,
        AddVirtualControllerMotionGroupRequest,
        AddVirtualControllerMotionGroupRequest,
        AddVirtualControllerMotionGroupRequest,
        AddVirtualControllerMotionGroupRequest,
      ]
    | [
        AddVirtualControllerMotionGroupRequest,
        AddVirtualControllerMotionGroupRequest,
        AddVirtualControllerMotionGroupRequest,
        AddVirtualControllerMotionGroupRequest,
        AddVirtualControllerMotionGroupRequest,
        AddVirtualControllerMotionGroupRequest,
        AddVirtualControllerMotionGroupRequest,
        AddVirtualControllerMotionGroupRequest,
      ]
    | [
        AddVirtualControllerMotionGroupRequest,
        AddVirtualControllerMotionGroupRequest,
        AddVirtualControllerMotionGroupRequest,
        AddVirtualControllerMotionGroupRequest,
        AddVirtualControllerMotionGroupRequest,
        AddVirtualControllerMotionGroupRequest,
        AddVirtualControllerMotionGroupRequest,
        AddVirtualControllerMotionGroupRequest,
        AddVirtualControllerMotionGroupRequest,
      ]
    | [
        AddVirtualControllerMotionGroupRequest,
        AddVirtualControllerMotionGroupRequest,
        AddVirtualControllerMotionGroupRequest,
        AddVirtualControllerMotionGroupRequest,
        AddVirtualControllerMotionGroupRequest,
        AddVirtualControllerMotionGroupRequest,
        AddVirtualControllerMotionGroupRequest,
        AddVirtualControllerMotionGroupRequest,
        AddVirtualControllerMotionGroupRequest,
        AddVirtualControllerMotionGroupRequest,
      ]
}
/**
 * The configuration of a physical Yaskawa robot controller has to contain IP address of the controller.
 *
 * This interface was referenced by `GeneratedNatsPayloadsRoot`'s JSON-Schema
 * via the `definition` "YaskawaController".
 */
export interface YaskawaController {
  kind: "YaskawaController"
  controller_ip: string
}
/**
 * The configuration of a physical or virtual robot controller.
 *
 * This interface was referenced by `GeneratedNatsPayloadsRoot`'s JSON-Schema
 * via the `definition` "RobotController".
 */
export interface RobotController {
  /**
   * Unique name of controller within the cell.
   * It must be a valid k8s label name as defined by [RFC 1035](https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#rfc-1035-label-names).
   *
   */
  name: string
  configuration:
    | AbbController
    | FanucController
    | KukaController
    | UniversalrobotsController
    | VirtualController
    | YaskawaController
}
/**
 * User provided credentials for creating a secret to pull an image from a registry.
 *
 *
 * This interface was referenced by `GeneratedNatsPayloadsRoot`'s JSON-Schema
 * via the `definition` "ImageCredentials".
 */
export interface ImageCredentials {
  registry: string
  user: string
  password: string
}
/**
 * A user provided, custom container image and the required credentials to pull it from a registry.
 *
 *
 * This interface was referenced by `GeneratedNatsPayloadsRoot`'s JSON-Schema
 * via the `definition` "ContainerImage".
 */
export interface ContainerImage {
  /**
   * The location of a container image in the form of `<registry>/<image>:<tag>`.
   */
  image: string
  credentials?: ImageCredentials
  /**
   * Known secrets for authentication with the container registry.
   */
  secrets?: {
    name: string
  }[]
}
/**
 * The path and capacity of a volume that retains data across application restarts.
 * The maximal requestable capacity is 300Mi.
 * If you need more capacity consider using [storeObject](#/operations/storeObject).
 *
 *
 * This interface was referenced by `GeneratedNatsPayloadsRoot`'s JSON-Schema
 * via the `definition` "ContainerStorage".
 */
export interface ContainerStorage {
  mount_path: string
  /**
   * The amount of local storage available for the application.
   *
   * **NOTE:** The capacity can NEVER be reduced!
   *
   */
  capacity: string
}
/**
 * Additional resources that the application requires.
 *
 * This interface was referenced by `GeneratedNatsPayloadsRoot`'s JSON-Schema
 * via the `definition` "ContainerResources".
 */
export interface ContainerResources {
  /**
   * Number of GPUs the application requires.
   */
  intel_gpu?: number
  /**
   * The maximum memory allocated to this application.
   */
  memory_limit?: string
}
/**
 * An App is defined by a webserver, packed inside a container, serving a web-application.
 *
 *
 * This interface was referenced by `GeneratedNatsPayloadsRoot`'s JSON-Schema
 * via the `definition` "App".
 */
export interface App {
  /**
   * The name of the provided application.
   * The name must be unique within the cell and is used as an identifier for addressing the application in all API calls
   * , e.g., when updating the application.
   *
   * It also defines where the application is reachable (/$cell/$name).
   *
   * It must be a valid k8s label name as defined by [RFC 1035](https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#rfc-1035-label-names).
   *
   */
  name: string
  /**
   * The path of the icon for the App (/$cell/$name/$app_icon).
   */
  app_icon: string
  container_image: ContainerImage
  /**
   * The port the containerized webserver is listening on.
   */
  port?: number
  environment?: ContainerEnvironment
  storage?: ContainerStorage
  resources?: ContainerResources
  /**
   * Defines the URL path suffix used to check the application's health status. The complete health check URL
   * is constructed as `/$cell/$name/$health_path`. When the application is working as expected,
   * the endpoint returns an HTTP 200 status code.
   *
   * If not specified, the system will default to using the application icon path suffix
   * (the value of `app_icon`) as the health check endpoint, resulting in `/$cell/$name/$app_icon`.
   *
   * If the health check fails (no response or non-200 status code), the system will
   * automatically restart the application container to restore service.
   *
   */
  health_path?: string
  /**
   * Defines the URL path suffix used to provide an endpoint for diagnosis data collection.
   * The complete diagnosis check URL is constructed as `/$cell/$name/$diagnosis_path`.
   *
   * The endpoint is called when a diagnosis package is requested via the diagnosis API.
   * The endpoint needs to return the data within a zip file `application/zip` response.
   *
   */
  diagnosis_path?: string
}
/**
 * To create a robot cell, only a valid name is required.
 * Once created, a robot cell provides access to the Wandelbots NOVA foundation services.
 * The configuration can be customized, e.g., robot controllers, also within apps.
 *
 *
 * This interface was referenced by `GeneratedNatsPayloadsRoot`'s JSON-Schema
 * via the `definition` "Cell".
 */
export interface Cell {
  /**
   * A unique name for the cell used as an identifier for addressing the cell in all API calls.
   * It must be a valid k8s label name as defined by [RFC 1123](https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#dns-label-names).
   *
   */
  name: string
  /**
   * Wandelbots NOVA version of the cell.
   * This version must not exceed the current system version.
   *
   */
  version?: string
  description?: CellDescription
  controllers?: RobotController[]
  apps?: App[]
  [k: string]: unknown
}
/**
 * This interface was referenced by `GeneratedNatsPayloadsRoot`'s JSON-Schema
 * via the `definition` "ProgramStatus".
 */
export interface ProgramStatus {
  /**
   * The app name where the program is hosted.
   */
  app: string
  /**
   * Unique identifier of the program.
   */
  program: string
  /**
   * Unique identifier of the program run.
   */
  run: string
  state: ProgramRunState1
  /**
   * Error message if the program run failed.
   */
  error?: string
  /**
   * RFC3339 timestamp when the program run started.
   */
  start_time?: string
  /**
   * RFC3339 timestamp when the program run ended.
   */
  end_time?: string
  /**
   * RFC3339 timestamp when the program run ended.
   */
  timestamp: string
}
/**
 * This interface was referenced by `GeneratedNatsPayloadsRoot`'s JSON-Schema
 * via the `definition` "ServiceStatus".
 */
export interface ServiceStatus {
  service: string
  group: ServiceGroup
  status: {
    severity: ServiceStatusSeverity
    code: ServiceStatusPhase
    reason?: string
  }
}
/**
 * Lifecycle event for a cell cycle.
 *
 *
 * This interface was referenced by `GeneratedNatsPayloadsRoot`'s JSON-Schema
 * via the `definition` "CellCycleEvent".
 */
export interface CellCycleEvent {
  /**
   * Type of the cycle event.
   */
  event_type: "cycle_started" | "cycle_finished" | "cycle_failed"
  /**
   * Unique identifier of this cycle event.
   */
  id: string
  /**
   * Unique identifier of the cycle this event belongs to.
   */
  cycle_id: string
  /**
   * Timestamp when the cycle event occurred, in ISO 8601 format.
   */
  timestamp: string
  /**
   * Unique identifier of the cell the event belongs to.
   */
  cell: string
  /**
   * Additional event-specific data. May be empty.
   */
  extra?: {
    [k: string]: unknown
  }
  /**
   * Duration of the cycle in milliseconds.
   */
  duration_ms?: number
  /**
   * Reason for cycle failure.
   */
  reason?: string
}
/**
 * Defines a spherical shape centred around the origin.
 *
 * This interface was referenced by `GeneratedNatsPayloadsRoot`'s JSON-Schema
 * via the `definition` "Sphere".
 */
export interface Sphere {
  shape_type: "sphere"
  /**
   * The radius of the sphere in [mm].
   */
  radius: number
}
/**
 * Defines a cuboid shape centred around an origin.
 *
 * If a margin is applied to the box type full, it is added to all size values. The shape will keep its edges.
 * The hollow box type consists of thin boxes that make up its walls.
 * If a margin is applied to the box type hollow, its size values are reduced by the margin.
 *
 *
 * This interface was referenced by `GeneratedNatsPayloadsRoot`'s JSON-Schema
 * via the `definition` "Box".
 */
export interface Box {
  shape_type: "box"
  /**
   * The dimension in x-direction in [mm].
   */
  size_x: number
  /**
   * The dimension in y-direction in [mm].
   */
  size_y: number
  /**
   * The dimension in z-direction in [mm].
   */
  size_z: number
  /**
   * The box type defines if the box is hollow or full.
   */
  box_type: "HOLLOW" | "FULL"
}
/**
 * Defines an x/y-plane with finite size. Centred around the z-axis.
 *
 * This interface was referenced by `GeneratedNatsPayloadsRoot`'s JSON-Schema
 * via the `definition` "Rectangle".
 */
export interface Rectangle {
  shape_type: "rectangle"
  /**
   * The dimension in x-direction in [mm].
   */
  size_x: number
  /**
   * The dimension in y-direction in [mm].
   */
  size_y: number
}
/**
 * Defines an x/y-plane with infinite size.
 *
 * This interface was referenced by `GeneratedNatsPayloadsRoot`'s JSON-Schema
 * via the `definition` "Plane".
 */
export interface Plane {
  shape_type: "plane"
}
/**
 * Defines a cylindrical shape.
 * Centred around origin, symmetric around z-axis.
 *
 * If a margin is applied, it is added to radius and height. The shape will keep its edges.
 *
 *
 * This interface was referenced by `GeneratedNatsPayloadsRoot`'s JSON-Schema
 * via the `definition` "Cylinder".
 */
export interface Cylinder {
  shape_type: "cylinder"
  /**
   * The radius of the cylinder in [mm].
   */
  radius: number
  /**
   * The height of the cylinder in [mm].
   */
  height: number
}
/**
 * Defines a cylindrical shape with 2 semi-spheres on the top and bottom.
 * Centred around origin, symmetric around z-axis.
 *
 *
 * This interface was referenced by `GeneratedNatsPayloadsRoot`'s JSON-Schema
 * via the `definition` "Capsule".
 */
export interface Capsule {
  shape_type: "capsule"
  /**
   * The radius of the cylinder and semi-spheres in [mm].
   */
  radius: number
  /**
   * The height of the inner cylinder in [mm].
   */
  cylinder_height: number
}
/**
 * Convex hull around four spheres. Sphere center points in x/y-plane, offset by either combination "+/- sizeX" or "+/- sizeY".
 *
 * Alternative description: Rectangle in x/y-plane with a 3D padding.
 *
 *
 * This interface was referenced by `GeneratedNatsPayloadsRoot`'s JSON-Schema
 * via the `definition` "RectangularCapsule".
 */
export interface RectangularCapsule {
  shape_type: "rectangular_capsule"
  /**
   * The radius of the inner spheres in [mm].
   */
  radius: number
  /**
   * The distance of the sphere center in x-direction in [mm].
   */
  sphere_center_distance_x: number
  /**
   * The distance of the sphere center in y-direction in [mm].
   */
  sphere_center_distance_y: number
}
/**
 * Defines a convex hull encapsulating a set of vertices.
 *
 * This interface was referenced by `GeneratedNatsPayloadsRoot`'s JSON-Schema
 * via the `definition` "ConvexHull".
 */
export interface ConvexHull {
  shape_type: "convex_hull"
  /**
   * The list of encapsulated points.
   */
  vertices: Vector3D[]
}
/**
 * Defines a pose in 3D space.
 * A pose is a combination of a position and an orientation.
 * The position is applied before the orientation.
 *
 *
 * This interface was referenced by `GeneratedNatsPayloadsRoot`'s JSON-Schema
 * via the `definition` "Pose".
 */
export interface Pose {
  position?: Vector3D
  orientation?: RotationVector
}
/**
 * Defines a collider with a single shape.
 *
 * A collider is an object that is used for collision detection.
 * It defines the `shape` that is attached with the offset of `pose` to a reference frame.
 *
 * Use colliders to:
 * - Define the shape of a workpiece. The reference frame is the scene origin.
 * - Define the shape of a link in a motion group. The reference frame is the link coordinate system.
 * - Define the shape of a tool. The reference frame is the flange coordinate system.
 *
 *
 * This interface was referenced by `GeneratedNatsPayloadsRoot`'s JSON-Schema
 * via the `definition` "Collider".
 */
export interface Collider {
  shape:
    | Sphere
    | Box
    | Rectangle
    | Plane
    | Cylinder
    | Capsule
    | RectangularCapsule
    | ConvexHull
  pose?: Pose
  /**
   * Increases the shape's size in all dimensions. Applied in [mm]. Can be used to keep a safe distance to the shape.
   */
  margin?: number
}
/**
 * A collection of identifiable colliders.
 *
 * This interface was referenced by `GeneratedNatsPayloadsRoot`'s JSON-Schema
 * via the `definition` "ColliderDictionary".
 */
export interface ColliderDictionary {
  [k: string]: Collider
}
/**
 * This interface was referenced by `GeneratedNatsPayloadsRoot`'s JSON-Schema
 * via the `definition` "Link".
 */
export interface CollisionMotionGroupLink {
  [k: string]: Collider
}
/**
 * Defines the shape of a tool.
 *
 * A tool is a dictionary of colliders.
 *
 * All colliders that make up a tool are attached to the flange frame of the motion group.
 *
 *
 * This interface was referenced by `GeneratedNatsPayloadsRoot`'s JSON-Schema
 * via the `definition` "Tool".
 */
export interface CollisionMotionGroupTool {
  [k: string]: Collider
}
/**
 * This interface was referenced by `GeneratedNatsPayloadsRoot`'s JSON-Schema
 * via the `definition` "CollisionSetup".
 */
export interface CollisionSetup {
  colliders?: ColliderDictionary1
  link_chain?: LinkChain1
  tool?: CollisionMotionGroupTool1
  /**
   * If true, self-collision detection is enabled for the motion group.
   *
   * Self-collision detection checks if links in the kinematic chain of the motion group collide with each other.
   * Adjacent links in the kinematic chain of the motion group are not checked for mutual collision.
   * The tool is treated like a link at the end of the kinematic chain. It is checked against all links except the last one.
   *
   * Default is true.
   *
   */
  self_collision_detection?: boolean
}
/**
 * Colliders are checked against links and tool.
 *
 */
export interface ColliderDictionary1 {
  [k: string]: Collider
}
/**
 * Shape of the tool to validate against colliders.
 *
 */
export interface CollisionMotionGroupTool1 {
  [k: string]: Collider
}
/**
 * This interface was referenced by `GeneratedNatsPayloadsRoot`'s JSON-Schema
 * via the `definition` "BusIOsState".
 */
export interface BusIOsState {
  state: BusIOsStateEnum
  /**
   * A message providing additional information on the input/output service, e.g., BUS service status, encountered errors.
   * May be empty if no additional information is available.
   *
   */
  message?: string
}
/**
 * Input/Output boolean value representation.
 *
 * This interface was referenced by `GeneratedNatsPayloadsRoot`'s JSON-Schema
 * via the `definition` "IOBooleanValue".
 */
export interface IOBooleanValue {
  /**
   * Unique identifier of the input/output.
   */
  io: string
  /**
   * Value of a digital input/output.
   *
   */
  value: boolean
  value_type: "boolean"
}
/**
 * This interface was referenced by `GeneratedNatsPayloadsRoot`'s JSON-Schema
 * via the `definition` "IOIntegerValue".
 */
export interface IOIntegerValue {
  /**
   * Unique identifier of the input/output.
   */
  io: string
  /**
   * Value of an input/output with integer representation.
   *
   * > The integral value is transmitted as a string to avoid precision loss during conversion to JSON.
   * > Recommended: Use int64 in your implementation. If you want to interact with int64 in numbers,
   * > JS bigint libraries can help you to parse the string into an integral value.
   *
   */
  value: string
  value_type: "integer"
}
/**
 * This interface was referenced by `GeneratedNatsPayloadsRoot`'s JSON-Schema
 * via the `definition` "IOFloatValue".
 */
export interface IOFloatValue {
  /**
   * Unique identifier of the input/output.
   */
  io: string
  /**
   * Value of an analog input/output in floating number representation.
   *
   */
  value: number
  value_type: "float"
}
/**
 * This interface was referenced by `GeneratedNatsPayloadsRoot`'s JSON-Schema
 * via the `definition` "SelectIOs".
 */
export interface SelectIOs {
  /**
   * Array of input/output identifiers to retrieve the values for.
   */
  ios: string[]
  /**
   * Type of update.
   *     - changes: Only send updates when the value changes.
   *     - full: Send the full list of values at the update rate.
   *
   */
  update_type?: "changes" | "full"
}
/**
 * Array of input/output values.
 *
 * This interface was referenced by `GeneratedNatsPayloadsRoot`'s JSON-Schema
 * via the `definition` "StreamIOValuesResponse".
 */
export interface StreamIOValuesResponse {
  io_values: IOValue[]
  /**
   * Timestamp indicating when the represented information was received from the robot controller.
   */
  timestamp: string
  /**
   * Sequence number of the controller state. It starts with 0 upon establishing the connection with a physical controller.
   * The sequence number is reset when the connection to the physical controller is closed and re-established.
   *
   */
  sequence_number: number
}
/**
 * Indicates which joint of the motion group is in a limit.
 * If a joint is in its limit, only this joint can be moved. Movements that affect any other joints are not executed.
 *
 *
 * This interface was referenced by `GeneratedNatsPayloadsRoot`'s JSON-Schema
 * via the `definition` "MotionGroupState_JointLimitReached".
 */
export interface MotionGroupState_JointLimitReached {
  /**
   * If true, operational (soft) jointLimit is reached for specific joint.
   */
  limit_reached: boolean[]
}
/**
 * Jogging is active.
 *
 *
 * This interface was referenced by `GeneratedNatsPayloadsRoot`'s JSON-Schema
 * via the `definition` "JoggingRunning".
 */
export interface JoggingRunning {
  kind: "RUNNING"
}
/**
 * User has paused jogging.
 *
 *
 * This interface was referenced by `GeneratedNatsPayloadsRoot`'s JSON-Schema
 * via the `definition` "JoggingPausedByUser".
 */
export interface JoggingPausedByUser {
  kind: "PAUSED_BY_USER"
}
/**
 * Jogging was paused because of an I/O event.
 *
 *
 * This interface was referenced by `GeneratedNatsPayloadsRoot`'s JSON-Schema
 * via the `definition` "JoggingPausedOnIO".
 */
export interface JoggingPausedOnIO {
  kind: "PAUSED_ON_IO"
}
/**
 * Jogging was paused because a joint is near its limit.
 *
 *
 * This interface was referenced by `GeneratedNatsPayloadsRoot`'s JSON-Schema
 * via the `definition` "JoggingPausedNearJointLimit".
 */
export interface JoggingPausedNearJointLimit {
  kind: "PAUSED_NEAR_JOINT_LIMIT"
  joint_indices: number[]
}
/**
 * Jogging was paused because the motion group neared a collision.
 *
 *
 * This interface was referenced by `GeneratedNatsPayloadsRoot`'s JSON-Schema
 * via the `definition` "JoggingPausedNearCollision".
 */
export interface JoggingPausedNearCollision {
  kind: "PAUSED_NEAR_COLLISION"
  description: string
}
/**
 * Jogging was paused because the motion group neared a singularity or the workspace boundary.
 *
 *
 * This interface was referenced by `GeneratedNatsPayloadsRoot`'s JSON-Schema
 * via the `definition` "JoggingPausedNearSingularity".
 */
export interface JoggingPausedNearSingularity {
  kind: "PAUSED_NEAR_SINGULARITY"
  description: string
}
/**
 * State of jogging execution.
 * This state is sent during jogging movement, response-rate closest to the nearest multiple of controller step-rate but not exceeding the configured rate.
 * The jogging state can be one of the following:
 * - RUNNING: Jogging is active.
 * - PAUSED_BY_USER: User has paused jogging.
 * - PAUSED_NEAR_JOINT_LIMIT: Jogging was paused because a joint is near its limit.
 * - PAUSED_NEAR_COLLISION: Jogging was paused because the motion group neared a collision.
 * - PAUSED_NEAR_SINGULARITY: Jogging was paused because the motion group neared a singularity or the workspace boundary.
 * - PAUSED_ON_IO: Jogging was paused because of an I/O event.
 *
 *
 * This interface was referenced by `GeneratedNatsPayloadsRoot`'s JSON-Schema
 * via the `definition` "JoggingDetails".
 */
export interface JoggingDetails {
  state:
    | JoggingRunning
    | JoggingPausedByUser
    | JoggingPausedOnIO
    | JoggingPausedNearJointLimit
    | JoggingPausedNearCollision
    | JoggingPausedNearSingularity
  /**
   * Timestamp of the current jogger session in milliseconds.
   * Only waypoint sessions are supported. Other sessions return 0.
   *
   * > **NOTE**
   * >
   * > This field is experimental and its behavior may change in future releases.
   *
   */
  jogger_session_timestamp_ms?: number
  kind: "JOGGING"
}
/**
 * Trajectory is being executed.
 *
 *
 * This interface was referenced by `GeneratedNatsPayloadsRoot`'s JSON-Schema
 * via the `definition` "TrajectoryRunning".
 */
export interface TrajectoryRunning {
  kind: "RUNNING"
  /**
   * Remaining time in milliseconds (ms) to reach the end of the motion.
   */
  time_to_end: number
}
/**
 * User has paused execution.
 *
 *
 * This interface was referenced by `GeneratedNatsPayloadsRoot`'s JSON-Schema
 * via the `definition` "TrajectoryPausedByUser".
 */
export interface TrajectoryPausedByUser {
  kind: "PAUSED_BY_USER"
}
/**
 * First or last sample (depending on direction) of trajectory has been sent.
 *
 *
 * This interface was referenced by `GeneratedNatsPayloadsRoot`'s JSON-Schema
 * via the `definition` "TrajectoryEnded".
 */
export interface TrajectoryEnded {
  kind: "END_OF_TRAJECTORY"
}
/**
 * Waiting for an I/O event to start execution.
 *
 *
 * This interface was referenced by `GeneratedNatsPayloadsRoot`'s JSON-Schema
 * via the `definition` "TrajectoryWaitForIO".
 */
export interface TrajectoryWaitForIO {
  kind: "WAIT_FOR_IO"
}
/**
 * Execution was paused because of an I/O event.
 *
 *
 * This interface was referenced by `GeneratedNatsPayloadsRoot`'s JSON-Schema
 * via the `definition` "TrajectoryPausedOnIO".
 */
export interface TrajectoryPausedOnIO {
  kind: "PAUSED_ON_IO"
}
/**
 * State of trajectory execution.
 * This state is sent during trajectory movement, response-rate closest to the nearest multiple of controller step-rate but not exceeding the configured rate.
 * The trajectory state can be one of the following:
 * - RUNNING: Trajectory is being executed.
 * - PAUSED_BY_USER: User has paused execution.
 * - END_OF_TRAJECTORY: First or last sample (depending on direction) of trajectory has been sent.
 * - WAIT_FOR_IO: Waiting for an I/O event to start execution.
 * - PAUSED_ON_IO: Execution was paused because of an I/O event.
 *
 *
 * This interface was referenced by `GeneratedNatsPayloadsRoot`'s JSON-Schema
 * via the `definition` "TrajectoryDetails".
 */
export interface TrajectoryDetails {
  /**
   * Unique identifier of the trajectory being executed.
   *
   */
  trajectory: string
  /**
   * Location of current joint position commmand on the trajectory being executed.
   *
   */
  location: number
  state:
    | TrajectoryRunning
    | TrajectoryPausedByUser
    | TrajectoryEnded
    | TrajectoryWaitForIO
    | TrajectoryPausedOnIO
  /**
   * Discriminator for OpenApi generators, which is always "TRAJECTORY" for this schema.
   *
   */
  kind: "TRAJECTORY"
}
/**
 * Details about the state of the motion execution.
 * The details are either for a jogging or a trajectory.
 * If NOVA is not controlling this motion group at the moment, this field is omitted.
 *
 *
 * This interface was referenced by `GeneratedNatsPayloadsRoot`'s JSON-Schema
 * via the `definition` "Execute".
 */
export interface Execute {
  /**
   * Commanded joint position of each joint. This command was sent in the time step the corresponding state was received.
   * The unit depends on the type of joint: For revolute joints, the angle is given in [rad]; for prismatic joints, the displacement is given in [mm].
   *
   */
  joint_position: number[]
  details?: JoggingDetails | TrajectoryDetails
}
/**
 * Presents the current state of the motion group.
 *
 * This interface was referenced by `GeneratedNatsPayloadsRoot`'s JSON-Schema
 * via the `definition` "MotionGroupState".
 */
export interface MotionGroupState {
  /**
   * Timestamp for when data was received from the robot controller.
   */
  timestamp: string
  /**
   * Sequence number of the controller state. It starts with 0 upon establishing the connection with a physical controller.
   * The sequence number is reset when the connection to the physical controller is closed and re-established.
   *
   */
  sequence_number: number
  /**
   * Identifier of the motion group.
   */
  motion_group: string
  /**
   * Convenience: Identifier of the robot controller the motion group is attached to.
   */
  controller: string
  joint_position: Joints1
  joint_limit_reached: MotionGroupState_JointLimitReached1
  joint_torque?: Joints2
  joint_current?: Joints3
  flange_pose?: Pose1
  /**
   * Unique identifier addressing the active TCP.
   * Might not be returned for positioners as some do not support TCPs, depending on the model.
   *
   */
  tcp?: string
  tcp_pose?: Pose2
  /**
   * Unique identifier addressing the reference coordinate system of the cartesian data.
   * Might not be returned for positioners as some do not support TCPs, depending on the model.
   * Default: world coordinate system of corresponding controller.
   *
   */
  coordinate_system?: string
  /**
   * Unique identifier addressing the active payload.
   * Only fetchable via GET endpoint, not available in WebSocket.
   *
   */
  payload?: string
  /**
   * Indicates whether the motion group is in standstill.
   * Convenience: Signals that NOVA treats measured joint velocities as 0.
   *
   */
  standstill: boolean
  execute?: Execute1
  /**
   * Revision number of the motion group description.
   * The revision is incremented whenever the motion group description changes due to a modification of the tools or the payloads in the robot configuration.
   * The robot controller is polled every 10 s during Monitoring Mode to detect those changes.
   * Use to trigger fetching based on robot configuration changes.
   *
   */
  description_revision: number
}
/**
 * Indicates whether the joint is in a limit for all joints of the motion group.
 *
 */
export interface MotionGroupState_JointLimitReached1 {
  /**
   * If true, operational (soft) jointLimit is reached for specific joint.
   */
  limit_reached: boolean[]
}
/**
 * Defines a pose in 3D space.
 * A pose is a combination of a position and an orientation.
 * The position is applied before the orientation.
 *
 */
export interface Pose1 {
  position?: Vector3D
  orientation?: RotationVector
}
/**
 * Defines a pose in 3D space.
 * A pose is a combination of a position and an orientation.
 * The position is applied before the orientation.
 *
 */
export interface Pose2 {
  position?: Vector3D
  orientation?: RotationVector
}
/**
 * Data that was commanded to the motion group. Includes additional data on NOVA's execution components for executing trajectories and jogging.
 * This is a convenience field to indicate the last command sent to the motion group.
 * It is not available in all cases, e.g., if the motion group is not moved by NOVA.
 *
 */
export interface Execute1 {
  /**
   * Commanded joint position of each joint. This command was sent in the time step the corresponding state was received.
   * The unit depends on the type of joint: For revolute joints, the angle is given in [rad]; for prismatic joints, the displacement is given in [mm].
   *
   */
  joint_position: number[]
  details?: JoggingDetails | TrajectoryDetails
}
/**
 * Returns the whole current state of robot controller.
 *
 * This interface was referenced by `GeneratedNatsPayloadsRoot`'s JSON-Schema
 * via the `definition` "RobotControllerState".
 */
export interface RobotControllerState {
  /**
   * Mode of communication and control between NOVA and the robot controller.
   */
  mode:
    | "MODE_CONTROLLER_NOT_CONFIGURED"
    | "MODE_INITIALIZING"
    | "MODE_MONITOR"
    | "MODE_CONTROL"
    | "MODE_FREE_DRIVE"
  /**
   * Last error stack encountered during initialization process or after a controller disconnect.
   * At this stage, it's unclear whether the error is fatal.
   *
   * Evaluate `last_error` to decide whether to remove the controller using `deleteController`.
   * Examples:
   * - Delete required: Host resolution fails repeatedly due to an incorrect IP.
   * - Delete not required: Temporary network delay caused a disconnect; the system will auto-reconnect.
   *
   */
  last_error?: string[]
  /**
   * Timestamp indicating when the represented information was received from the robot controller.
   */
  timestamp: string
  /**
   * Sequence number of the controller state. It starts with 0 upon establishing the connection with a physical controller.
   * The sequence number is reset when the connection to the physical controller is closed and re-established.
   *
   */
  sequence_number: number
  /**
   * Identifier of the configured robot controller.
   */
  controller: string
  operation_mode: OperationMode
  safety_state: SafetyStateType
  /**
   * If made available by the robot controller, returns the current velocity override in
   * [percentage] for movements adjusted on robot control panel.
   * Valid value range: 1 - 100.
   *
   */
  velocity_override?: number
  motion_groups: MotionGroupState1
}
/**
 * This interface was referenced by `GeneratedNatsPayloadsRoot`'s JSON-Schema
 * via the `definition` "TcpOffset".
 */
export interface TcpOffset {
  /**
   * A readable and changeable name for frontend visualization.
   */
  name: string
  pose: Pose
}
/**
 * The upper_limit must be greater then the lower_limit.
 *
 * This interface was referenced by `GeneratedNatsPayloadsRoot`'s JSON-Schema
 * via the `definition` "LimitRange".
 */
export interface LimitRange {
  lower_limit?: number
  upper_limit?: number
}
/**
 * This interface was referenced by `GeneratedNatsPayloadsRoot`'s JSON-Schema
 * via the `definition` "JointLimits".
 */
export interface JointLimits {
  position?: LimitRange
  velocity?: number
  acceleration?: number
  /**
   * > **NOTE**
   * >
   * > This limit type is experimental and its behavior may change in future releases.
   *
   */
  jerk?: number
  torque?: number
}
/**
 * This interface was referenced by `GeneratedNatsPayloadsRoot`'s JSON-Schema
 * via the `definition` "CartesianLimits".
 */
export interface CartesianLimits {
  velocity?: number
  acceleration?: number
  /**
   * > **NOTE**
   * >
   * > This limit type is experimental and its behavior may change in future releases.
   *
   */
  jerk?: number
  orientation_velocity?: number
  orientation_acceleration?: number
  /**
   * > **NOTE**
   * >
   * > This limit type is experimental and its behavior may change in future releases.
   *
   */
  orientation_jerk?: number
}
/**
 * This interface was referenced by `GeneratedNatsPayloadsRoot`'s JSON-Schema
 * via the `definition` "LimitSet".
 */
export interface LimitSet {
  joints?: JointLimits[]
  tcp?: CartesianLimits
  elbow?: CartesianLimits
  flange?: CartesianLimits
  coupled_shoulder_elbow_joint?: JointLimits
}
/**
 * This interface was referenced by `GeneratedNatsPayloadsRoot`'s JSON-Schema
 * via the `definition` "OperationLimits".
 */
export interface OperationLimits {
  auto_limits?: LimitSet
  manual_limits?: LimitSet
  manual_t1_limits?: LimitSet
  manual_t2_limits?: LimitSet
  /**
   * Flag to indicate whether the TCP velocity limit is also applied for the elbow and flange in auto mode.
   */
  safety_limit_elbow_flange_velocity_in_auto?: boolean
}
/**
 * This interface was referenced by `GeneratedNatsPayloadsRoot`'s JSON-Schema
 * via the `definition` "Payload".
 */
export interface Payload {
  name: string
  /**
   * Mass of payload in [kg].
   */
  payload: number
  center_of_mass?: Vector3D1
  moment_of_inertia?: Vector3D2
}
/**
 * A single set of DH parameters.
 *
 * This interface was referenced by `GeneratedNatsPayloadsRoot`'s JSON-Schema
 * via the `definition` "DHParameter".
 */
export interface DHParameter {
  /**
   * Angle about x-axis in [rad].
   */
  alpha?: number
  /**
   * Angle about z-axis in [rad].
   */
  theta?: number
  /**
   * Offset along x-axis in [mm].
   */
  a?: number
  /**
   * Offset along z-axis in [mm].
   */
  d?: number
  /**
   * True, if rotation direction of joint is reversed.
   */
  reverse_rotation_direction?: boolean
  type?: JointTypeEnum
}
/**
 * The configuration of a motion-group used for motion planning.
 * The parameters `mounting`, `kinematic_chain_offset`, `dh_parameters`, `flange_offset` and `tcp_offset` are used to model the kinematic structure of the motion group.
 * They can be used to compute the coordinate transformations from world to tcp frame:
 * [world frame] -> mounting -> [base frame] -> kinematic chain offset + motion group kinematics (Denavit-Hartenberg parameters) -> [end of kinematic chain frame]
 * -> flange_offset -> [flange frame] -> tcp_offset -> [tcp frame].
 *
 *
 * This interface was referenced by `GeneratedNatsPayloadsRoot`'s JSON-Schema
 * via the `definition` "MotionGroupDescription".
 */
export interface MotionGroupDescription {
  motion_group_model: MotionGroupModel
  mounting?: Pose3
  tcps?: TcpOffsetDictionary
  safety_zones?: ColliderDictionary2
  /**
   * The shape of the MotionGroups links to validate against safety zones.
   * Indexed along the kinematic chain, starting with a static base shape before first joint.
   *
   */
  safety_link_colliders?: ColliderDictionary[]
  safety_tool_colliders?: SafetyToolColliders
  operation_limits: OperationLimits
  payloads?: PayloadDictionary
  /**
   * [ms] cycle time of the motion group controller. A trajectory for this motion group should be computed to this resolution.
   */
  cycle_time?: number
  /**
   * The Denavit-Hartenberg parameters describing the motion group kinematics.
   */
  dh_parameters?: DHParameter[]
  kinematic_chain_offset?: Pose4
  flange_offset?: Pose5
  /**
   * The serial number of the motion group, if available. If not available, the serial number of the robot controller. If not available, empty.
   *
   */
  serial_number?: string
  /**
   * Revision number of the motion group description.
   * The revision is incremented whenever the motion group description changes due to a modification of the tools or the payloads in the robot configuration.
   * The robot controller is polled every 10 s in Monitoring Mode to detect those changes.
   * Use to detect changes since the last retrieval.
   *
   */
  description_revision?: number
}
/**
 * Defines a pose in 3D space.
 * A pose is a combination of a position and an orientation.
 * The position is applied before the orientation.
 *
 */
export interface Pose3 {
  position?: Vector3D
  orientation?: RotationVector
}
/**
 * Maps a TCP name to its offset relative to the flange coordinate system. Key must be a TCP identifier.
 * Values are TcpOffsets.
 *
 */
export interface TcpOffsetDictionary {
  [k: string]: TcpOffset
}
/**
 * SafetyZones are areas which cannot be entered or where certain limits apply.
 * SafetyZones are defined in the world coordinate system.
 *
 */
export interface ColliderDictionary2 {
  [k: string]: Collider
}
/**
 * Maps a TCP name to its tool collider. Key must be a TCP identifier.
 * Values are ColliderDictionaries that make up the shape of one tool to validate against safety zones.
 *
 */
export interface SafetyToolColliders {
  [k: string]: ColliderDictionary
}
/**
 * Maps a payload name to its configuration. Key must be a payload identifier.
 * Values are payload objects.
 *
 */
export interface PayloadDictionary {
  [k: string]: Payload
}
/**
 * Defines a pose in 3D space.
 * A pose is a combination of a position and an orientation.
 * The position is applied before the orientation.
 *
 */
export interface Pose4 {
  position?: Vector3D
  orientation?: RotationVector
}
/**
 * Defines a pose in 3D space.
 * A pose is a combination of a position and an orientation.
 * The position is applied before the orientation.
 *
 */
export interface Pose5 {
  position?: Vector3D
  orientation?: RotationVector
}
/**
 * CloudEvents specification v1.0.2 compliant event structure.
 * This schema defines the standardized format for event data across all NOVA services.
 *
 *
 * This interface was referenced by `GeneratedNatsPayloadsRoot`'s JSON-Schema
 * via the `definition` "CloudEvent".
 */
export interface CloudEvent {
  /**
   * The version of the CloudEvents specification which the event uses
   */
  specversion: "1.0"
  /**
   * Type of the event related to the source occurrence
   */
  type: string
  /**
   * Identifies the context in which an event happened
   */
  source: string
  /**
   * Unique identifier for the event
   */
  id: string
  /**
   * Timestamp of when the occurrence happened (RFC3339)
   */
  time?: string
  /**
   * Content type of the data value
   */
  datacontenttype?: string
  /**
   * URI reference that identifies the schema that the data adheres to
   */
  dataschema?: string
  /**
   * Subject of the event in the context of the event producer
   */
  subject?: string
  /**
   * The event payload specific to the event type
   */
  data?: {
    [k: string]: unknown
  }
}
/**
 * This interface was referenced by `GeneratedNatsPayloadsRoot`'s JSON-Schema
 * via the `definition` "NetworkState".
 */
export interface NetworkState {
  /**
   * Indicates whether the system is connected to the internet.
   *
   */
  internet_connected: boolean
  /**
   * Type of the active network link (e.g., ethernet, wifi, cellular, vpn, unknown).
   *
   */
  connection_type?: "ethernet" | "wifi" | "cellular" | "vpn" | "unknown"
  /**
   * Received signal strength in dBm for wireless interfaces; negative values indicate weaker signals.
   *
   */
  signal_strength?: number
  /**
   * Normalized link quality metric from 0 (poor) to 1 (excellent) when provided by the interface.
   *
   */
  link_quality?: number
  /**
   * Round-trip latency to the probe endpoint measured in milliseconds.
   *
   */
  latency_ms?: number
  /**
   * Estimated downstream bandwidth in megabits per second based on the probe.
   *
   */
  bandwidth_mbps?: number
}
/**
 * CloudEvents v1.0 compliant event published when system network status changes.
 * This event wraps the NetworkState payload in a standard CloudEvents envelope.
 *
 *
 * This interface was referenced by `GeneratedNatsPayloadsRoot`'s JSON-Schema
 * via the `definition` "NetworkStatusChangedEvent".
 */
export interface NetworkStatusChangedEvent {
  /**
   * The version of the CloudEvents specification which the event uses
   */
  specversion: "1.0"
  /**
   * Type of the event related to the source occurrence
   */
  type: "nova.v2.events.system.network.status.changed"
  /**
   * Identifies the context in which an event happened
   */
  source: "/nova/system-info"
  /**
   * Unique identifier for this network status change event
   */
  id: string
  /**
   * Timestamp when the network status changed (RFC3339)
   */
  time: string
  /**
   * Content type of the data value
   */
  datacontenttype?: string
  data: NetworkState
}
/**
 * Payload for a cell lifecycle event.
 *
 * This interface was referenced by `GeneratedNatsPayloadsRoot`'s JSON-Schema
 * via the `definition` "CellEventData".
 */
export interface CellEventData {
  /**
   * Chart version of the cell foundation release.
   */
  version: string
  operating_state: OperatingState
}
/**
 * Payload for an app lifecycle event.
 *
 * This interface was referenced by `GeneratedNatsPayloadsRoot`'s JSON-Schema
 * via the `definition` "AppEventData".
 */
export interface AppEventData {
  /**
   * OCI image reference of the app release.
   */
  image: string
  operating_state: OperatingState
}
/**
 * Payload for a robot controller lifecycle event.
 *
 * This interface was referenced by `GeneratedNatsPayloadsRoot`'s JSON-Schema
 * via the `definition` "RobotControllerEventData".
 */
export interface RobotControllerEventData {
  manufacturer: Manufacturer
  /**
   * Indicates whether the controller is virtual.
   */
  virtual: boolean
  operating_state: OperatingState
}
/**
 * This interface was referenced by `GeneratedNatsPayloadsRoot`'s JSON-Schema
 * via the `definition` "NatsErrorPayload".
 */
export interface NatsErrorPayload {
  code?: string
  message: string
}
