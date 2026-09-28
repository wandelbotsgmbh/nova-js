/**
 * AUTO-GENERATED FILE - DO NOT EDIT.
 * Generated from src/asyncapi.yaml by scripts/generate-nats-client.ts.
 * Run `pnpm generate:nats` to regenerate.
 */

import type {
  App,
  AppCreatedEvent,
  AppDeletedEvent,
  AppUpdatedEvent,
  ArpScanReply,
  ArpScanRequest,
  BusIOsState,
  CancelIOSubscription,
  Cell,
  CellCreatedEvent,
  CellCycleEvent,
  CellDeletedEvent,
  CellUpdatedEvent,
  CollisionSetup,
  IOSubscriptionCreated,
  IOSubscriptionLease,
  ListIOValuesResponse,
  MotionGroupDescription,
  NatsErrorPayload,
  NetworkInterfacesReply,
  NetworkInterfacesRequest,
  NetworkStatusChangedEvent,
  ProgramStatus,
  RenewIOSubscription,
  RobotController,
  RobotControllerCreatedEvent,
  RobotControllerDeletedEvent,
  RobotControllerState,
  RobotControllerUpdatedEvent,
  SelectIOs,
  ServiceStatusList,
  StreamIOValuesResponse,
  SubscribeIOs,
  SystemUpdateCompletedEvent,
  SystemUpdateStartedEvent,
  UpdateIOSubscription,
} from "./types.ts"

/** Subject parameters required by each NATS subject, e.g. "nova.v2.cells.{cell}". */
export interface NatsOperationParams {
  /**
   * Cell Configuration
   *
   * Publishes the configuration for a cell.
   *
   * The latest status message is persisted NATS JetStream, documented in `x-nats-jetstream-stream`
   *
   * @operationId publishCell
   */
  "nova.v2.cells.{cell}": {
    /**
     * Unique identifier addressing a cell in all API calls.
     */
    cell: string
  }
  /**
   * App Configuration
   *
   * Publishes the configuration for a GUI application in the cell.
   *
   * The latest status message is persisted NATS JetStream, documented in `x-nats-jetstream-stream`
   *
   * @operationId publishApp
   */
  "nova.v2.cells.{cell}.apps.{app}": {
    /**
     * Unique identifier addressing a cell in all API calls.
     */
    cell: string
    /**
     * Name of the provided application.
     * Must be unique within the cell and is used as an identifier for addressing the application in all API calls, e.g., when updating the application.
     */
    app: string
  }
  /**
   * Program Status
   *
   * Publishes status messages for programs running in an app within a cell.
   * The status messages provide information about the current state of a program run.
   *
   * @operationId publishProgramStatus
   */
  "nova.v2.cells.{cell}.programs": {
    /**
     * Unique identifier addressing a cell in all API calls.
     */
    cell: string
  }
  /**
   * Robot Controller Configuration
   *
   * Publishes the configuration of a robot controller.
   *
   * @operationId publishRobotController
   */
  "nova.v2.cells.{cell}.controllers.{controller}": {
    /**
     * Unique identifier addressing a cell in all API calls.
     */
    cell: string
    /**
     * Unique identifier to address a controller in the cell.
     */
    controller: string
  }
  /**
   * Service Status
   *
   * Publishes the status of all cell resources.
   *
   * The latest status message is persisted NATS JetStream, documented in `x-nats-jetstream-stream`
   *
   * @operationId publishCellStatus
   */
  "nova.v2.cells.{cell}.status": {
    /**
     * Unique identifier addressing a cell in all API calls.
     */
    cell: string
  }
  /**
   * Cell Cycle Event
   *
   * Publishes the cycle events for a cell.
   *
   * @operationId publishCellCycle
   */
  "nova.v2.cells.{cell}.cycle": {
    /**
     * Unique identifier addressing a cell in all API calls.
     */
    cell: string
  }
  /**
   * Wandelbots NOVA status
   *
   * Publishes the status of all system services.
   *
   * The latest status message is persisted NATS JetStream, documented in `x-nats-jetstream-stream`
   *
   * @operationId publishSystemStatus
   */
  "nova.v2.system.status": Record<never, never>
  /**
   * Collision Setup
   *
   * Publishes the stored collision setup.
   *
   * The latest status message is persisted NATS JetStream, documented in `x-nats-jetstream-stream`
   *
   * @operationId publishCollisionSetup
   */
  "nova.v2.cells.{cell}.collision.setups.{setup}": {
    /**
     * Unique identifier addressing a cell in all API calls.
     */
    cell: string
    /**
     * Unique identifier addressing a collision setup.
     */
    setup: string
  }
  /**
   * BUS Inputs/Outputs Service Status
   *
   * Publishes the status of BUS inputs/outputs service.
   *
   * The latest status message is persisted NATS JetStream, documented in `x-nats-jetstream-stream`.
   *
   * @operationId publishBUSIOStatus
   */
  "nova.v2.cells.{cell}.bus-ios.status": {
    /**
     * Unique identifier addressing a cell in all API calls.
     */
    cell: string
  }
  /**
   * BUS Input/Output Values
   *
   * Publishes updates of BUS input/output values.
   *
   * @operationId publishBUSIOsIOs
   */
  "nova.v2.cells.{cell}.bus-ios.ios": {
    /**
     * Unique identifier addressing a cell in all API calls.
     */
    cell: string
  }
  /**
   * Set Output Values
   *
   * Set output values published with the BUS inputs/outputs service.
   * If you're using a virtual service, you can set inputs as well.
   *
   * @operationId setBUSIOsIOs
   */
  "nova.v2.cells.{cell}.bus-ios.ios.set": {
    /**
     * Unique identifier addressing a cell in all API calls.
     */
    cell: string
  }
  /**
   * Select Input/Output Values
   *
   * Select input/output values published by the controller on the shared `...ios` subject.
   *
   * This is the reserved, never-expiring default stream, shared by all clients that use it. For
   * independent per-client streams with their own update type and time to live use the `ios.subscribe`
   * operations instead. Malformed requests (non-string or empty entries in `ios`, an invalid
   * `update_type`) are rejected and leave the current selection unchanged.
   *
   * @operationId selectRobotControllerIOs
   */
  "nova.v2.cells.{cell}.controllers.{controller}.ios.select": {
    /**
     * Unique identifier addressing a cell in all API calls.
     */
    cell: string
    /**
     * Unique identifier to address a controller in a cell.
     */
    controller: string
  }
  /**
   * Input/Output Values
   *
   * Publishes updates of input/output values.
   *
   * @operationId publishRobotControllerIOs
   */
  "nova.v2.cells.{cell}.controllers.{controller}.ios": {
    /**
     * Unique identifier addressing a cell in all API calls.
     */
    cell: string
    /**
     * Unique identifier to address a controller in the cell.
     */
    controller: string
  }
  /**
   * Subscribe to Input/Output Values
   *
   * Create a per-client subscription that streams the selected input/output values on a dedicated,
   * subscription-specific subject.
   *
   * The server generates a subject-safe `subscription_id` and returns it in the reply; values are then
   * published on `{instance}.v2.cells.{cell}.controllers.{controller}.ios.{subscription_id}`. The
   * subscription expires after `ttl_seconds` unless it is renewed. A subscription that would push the
   * union of all subscriptions' ports beyond the controller's realtime input/output capacity is rejected.
   *
   * @operationId subscribeRobotControllerIOs
   */
  "nova.v2.cells.{cell}.controllers.{controller}.ios.subscribe": {
    /**
     * Unique identifier addressing a cell in all API calls.
     */
    cell: string
    /**
     * Unique identifier to address a controller in a cell.
     */
    controller: string
  }
  /**
   * Update an Input/Output Subscription
   *
   * Partially update an existing subscription by its server-issued `subscription_id`. Only the supplied
   * fields (`ios`, `update_type`, `ttl_seconds`) are changed; omitted fields are kept unchanged, so the
   * time to live or the update type can be changed without resending the port list. An update that would
   * push the union of all subscriptions' ports beyond the controller's realtime input/output capacity is
   * rejected and leaves the subscription unchanged.
   *
   * A successful update also renews the lease: `expires_at` is reset to the current time plus the
   * subscription's time to live, even when `ttl_seconds` is omitted.
   *
   * @operationId updateRobotControllerIOSubscription
   */
  "nova.v2.cells.{cell}.controllers.{controller}.ios.subscribe.update": {
    /**
     * Unique identifier addressing a cell in all API calls.
     */
    cell: string
    /**
     * Unique identifier to address a controller in a cell.
     */
    controller: string
  }
  /**
   * Renew an Input/Output Subscription
   *
   * Extend the lease of an existing subscription identified by its server-issued `subscription_id`.
   * Clients should renew at roughly a third of the subscription's time to live. A subscription that has
   * already expired is not found and must be created again.
   *
   * @operationId renewRobotControllerIOSubscription
   */
  "nova.v2.cells.{cell}.controllers.{controller}.ios.subscribe.renew": {
    /**
     * Unique identifier addressing a cell in all API calls.
     */
    cell: string
    /**
     * Unique identifier to address a controller in a cell.
     */
    controller: string
  }
  /**
   * Cancel an Input/Output Subscription
   *
   * Cancel an existing subscription identified by its server-issued `subscription_id`. Streaming on the
   * subscription's subject stops and its ports are removed from the union read from the controller.
   *
   * @operationId cancelRobotControllerIOSubscription
   */
  "nova.v2.cells.{cell}.controllers.{controller}.ios.subscribe.cancel": {
    /**
     * Unique identifier addressing a cell in all API calls.
     */
    cell: string
    /**
     * Unique identifier to address a controller in a cell.
     */
    controller: string
  }
  /**
   * Subscription Input/Output Values
   *
   * Publishes updates of input/output values for a single subscription on its dedicated
   * `...ios.{subscription_id}` subject. Each subscription receives its own `full` or `changes` view.
   *
   * @operationId publishRobotControllerIOSubscription
   */
  "nova.v2.cells.{cell}.controllers.{controller}.ios.{subscription_id}": {
    /**
     * Unique identifier addressing a cell in all API calls.
     */
    cell: string
    /**
     * Unique identifier to address a controller in the cell.
     */
    controller: string
    /**
     * Server-issued identifier of the subscription this stream belongs to.
     */
    subscription_id: string
  }
  /**
   * State of Robot Controller
   *
   * Publishes the current state of a robot controller.
   *
   * @operationId publishRobotControllersState
   */
  "nova.v2.cells.{cell}.controllers.{controller}.state": {
    /**
     * Unique identifier addressing a cell in all API calls.
     */
    cell: string
    /**
     * Unique identifier to address a controller in the cell.
     */
    controller: string
  }
  /**
   * Description of Motion Group
   *
   * Publishes the description of a motion group, including TCPs, mounting, safety zones, limits, etc.
   *
   * @operationId publishMotionGroupDescription
   */
  "nova.v2.cells.{cell}.controllers.{controller}.motion-groups.{motion-group}.description": {
    /**
     * Unique identifier addressing a cell in all API calls.
     */
    cell: string
    /**
     * Unique identifier addressing a controller in the cell.
     */
    controller: string
    /**
     * Motion group identifier.
     */
    "motion-group": string
  }
  /**
   * System Update Started
   *
   * Publishes an event when a system update process is initiated.
   *
   * This event is triggered once the service-manager begins a system update process,
   * providing details about the update metadata, trigger information, and pre-update checks.
   *
   * The event follows CloudEvents v1.0 specification and is persisted in NATS JetStream
   * for reliable delivery and event replay capabilities.
   *
   * @operationId eventSystemUpdateStarted
   */
  "nova.v2.events.system.update.started": Record<never, never>
  /**
   * System Update Completed
   *
   * Publishes an event when a system update process is completed.
   *
   * This event is triggered once the service-manager completes a system update process,
   * providing comprehensive results including success status, component outcomes,
   * error details, and post-update validation results.
   *
   * The event follows CloudEvents v1.0 specification and is persisted in NATS JetStream
   * for reliable delivery and event replay capabilities.
   *
   * @operationId eventSystemUpdateCompleted
   */
  "nova.v2.events.system.update.completed": Record<never, never>
  /**
   * System Network Status Changed
   *
   * Publishes an event when a system network status changes.
   *
   * This event is triggered once system-info service detects a change in the system network status,
   * providing details about the new network state and related information.
   *
   * The event follows CloudEvents v1.0 specification and is persisted in NATS JetStream
   * for reliable delivery and event replay capabilities.
   *
   * @operationId eventSystemNetworkStatusChanged
   */
  "nova.v2.events.system.network.status.changed": Record<never, never>
  /**
   * List Network Interfaces
   *
   * Lists all managed network interfaces available for controller connections and ARP scanning.
   *
   * @operationId getNetworkInterfaces
   */
  "nova.v2.system.network.interfaces": Record<never, never>
  /**
   * Run ARP Scan
   *
   * Runs an ARP scan on the target interface and returns all discovered devices.
   *
   * @operationId arpScan
   */
  "nova.v2.system.network.arpscan": Record<never, never>
  /**
   * Cell Created
   *
   * Publishes an event when a cell foundation release is created.
   *
   * The event follows CloudEvents v1.0 and is persisted in NATS JetStream for reliable delivery and replay capabilities.
   *
   * @operationId eventCellCreated
   */
  "nova.v2.events.cells.{cell}.created": {
    /**
     * Unique identifier addressing a cell in all API calls.
     */
    cell: string
  }
  /**
   * Cell Updated
   *
   * Publishes an event when a cell foundation release is updated.
   *
   * The event follows CloudEvents v1.0 and is persisted in NATS JetStream for reliable delivery and replay capabilities.
   *
   * @operationId eventCellUpdated
   */
  "nova.v2.events.cells.{cell}.updated": {
    /**
     * Unique identifier addressing a cell in all API calls.
     */
    cell: string
  }
  /**
   * Cell Deleted
   *
   * Publishes an event when a cell foundation release is deleted.
   *
   * The event follows CloudEvents v1.0 and is persisted in NATS JetStream for reliable delivery and replay capabilities.
   *
   * @operationId eventCellDeleted
   */
  "nova.v2.events.cells.{cell}.deleted": {
    /**
     * Unique identifier addressing a cell in all API calls.
     */
    cell: string
  }
  /**
   * App Created
   *
   * Publishes an event when an app release is created in a cell.
   *
   * The event follows CloudEvents v1.0 and is persisted in NATS JetStream for reliable delivery and replay capabilities.
   *
   * @operationId eventAppCreated
   */
  "nova.v2.events.cells.{cell}.apps.{app}.created": {
    /**
     * Unique identifier addressing a cell in all API calls.
     */
    cell: string
    /**
     * Unique identifier addressing an app in the cell.
     */
    app: string
  }
  /**
   * App Updated
   *
   * Publishes an event when an app release is updated in a cell.
   *
   * The event follows CloudEvents v1.0 and is persisted in NATS JetStream for reliable delivery and replay capabilities.
   *
   * @operationId eventAppUpdated
   */
  "nova.v2.events.cells.{cell}.apps.{app}.updated": {
    /**
     * Unique identifier addressing a cell in all API calls.
     */
    cell: string
    /**
     * Unique identifier addressing an app in the cell.
     */
    app: string
  }
  /**
   * App Deleted
   *
   * Publishes an event when an app release is deleted from a cell.
   *
   * The event follows CloudEvents v1.0 and is persisted in NATS JetStream for reliable delivery and replay capabilities.
   *
   * @operationId eventAppDeleted
   */
  "nova.v2.events.cells.{cell}.apps.{app}.deleted": {
    /**
     * Unique identifier addressing a cell in all API calls.
     */
    cell: string
    /**
     * Unique identifier addressing an app in the cell.
     */
    app: string
  }
  /**
   * Robot Controller Created
   *
   * Publishes an event when a robot controller release is created in a cell.
   *
   * The event follows CloudEvents v1.0 and is persisted in NATS JetStream for reliable delivery and replay capabilities.
   *
   * @operationId eventRobotControllerCreated
   */
  "nova.v2.events.cells.{cell}.controllers.{controller}.created": {
    /**
     * Unique identifier addressing a cell in all API calls.
     */
    cell: string
    /**
     * Unique identifier to address a controller in the cell.
     */
    controller: string
  }
  /**
   * Robot Controller Updated
   *
   * Publishes an event when a robot controller release is updated in a cell.
   *
   * The event follows CloudEvents v1.0 and is persisted in NATS JetStream for reliable delivery and replay capabilities.
   *
   * @operationId eventRobotControllerUpdated
   */
  "nova.v2.events.cells.{cell}.controllers.{controller}.updated": {
    /**
     * Unique identifier addressing a cell in all API calls.
     */
    cell: string
    /**
     * Unique identifier to address a controller in the cell.
     */
    controller: string
  }
  /**
   * Robot Controller Deleted
   *
   * Publishes an event when a robot controller release is deleted from a cell.
   *
   * The event follows CloudEvents v1.0 and is persisted in NATS JetStream for reliable delivery and replay capabilities.
   *
   * @operationId eventRobotControllerDeleted
   */
  "nova.v2.events.cells.{cell}.controllers.{controller}.deleted": {
    /**
     * Unique identifier addressing a cell in all API calls.
     */
    cell: string
    /**
     * Unique identifier to address a controller in the cell.
     */
    controller: string
  }
}

/** Payload types for subjects the server publishes and the client subscribes to. */
export interface NatsSubscribePayloads {
  /**
   * Cell Configuration
   *
   * Publishes the configuration for a cell.
   *
   * The latest status message is persisted NATS JetStream, documented in `x-nats-jetstream-stream`
   *
   * @operationId publishCell
   */
  "nova.v2.cells.{cell}": Cell
  /**
   * App Configuration
   *
   * Publishes the configuration for a GUI application in the cell.
   *
   * The latest status message is persisted NATS JetStream, documented in `x-nats-jetstream-stream`
   *
   * @operationId publishApp
   */
  "nova.v2.cells.{cell}.apps.{app}": App
  /**
   * Program Status
   *
   * Publishes status messages for programs running in an app within a cell.
   * The status messages provide information about the current state of a program run.
   *
   * @operationId publishProgramStatus
   */
  "nova.v2.cells.{cell}.programs": ProgramStatus
  /**
   * Robot Controller Configuration
   *
   * Publishes the configuration of a robot controller.
   *
   * @operationId publishRobotController
   */
  "nova.v2.cells.{cell}.controllers.{controller}": RobotController
  /**
   * Service Status
   *
   * Publishes the status of all cell resources.
   *
   * The latest status message is persisted NATS JetStream, documented in `x-nats-jetstream-stream`
   *
   * @operationId publishCellStatus
   */
  "nova.v2.cells.{cell}.status": ServiceStatusList
  /**
   * Cell Cycle Event
   *
   * Publishes the cycle events for a cell.
   *
   * @operationId publishCellCycle
   */
  "nova.v2.cells.{cell}.cycle": CellCycleEvent
  /**
   * Wandelbots NOVA status
   *
   * Publishes the status of all system services.
   *
   * The latest status message is persisted NATS JetStream, documented in `x-nats-jetstream-stream`
   *
   * @operationId publishSystemStatus
   */
  "nova.v2.system.status": ServiceStatusList
  /**
   * Collision Setup
   *
   * Publishes the stored collision setup.
   *
   * The latest status message is persisted NATS JetStream, documented in `x-nats-jetstream-stream`
   *
   * @operationId publishCollisionSetup
   */
  "nova.v2.cells.{cell}.collision.setups.{setup}": CollisionSetup
  /**
   * BUS Inputs/Outputs Service Status
   *
   * Publishes the status of BUS inputs/outputs service.
   *
   * The latest status message is persisted NATS JetStream, documented in `x-nats-jetstream-stream`.
   *
   * @operationId publishBUSIOStatus
   */
  "nova.v2.cells.{cell}.bus-ios.status": BusIOsState
  /**
   * BUS Input/Output Values
   *
   * Publishes updates of BUS input/output values.
   *
   * @operationId publishBUSIOsIOs
   */
  "nova.v2.cells.{cell}.bus-ios.ios": ListIOValuesResponse
  /**
   * Input/Output Values
   *
   * Publishes updates of input/output values.
   *
   * @operationId publishRobotControllerIOs
   */
  "nova.v2.cells.{cell}.controllers.{controller}.ios": StreamIOValuesResponse
  /**
   * Subscription Input/Output Values
   *
   * Publishes updates of input/output values for a single subscription on its dedicated
   * `...ios.{subscription_id}` subject. Each subscription receives its own `full` or `changes` view.
   *
   * @operationId publishRobotControllerIOSubscription
   */
  "nova.v2.cells.{cell}.controllers.{controller}.ios.{subscription_id}": StreamIOValuesResponse
  /**
   * State of Robot Controller
   *
   * Publishes the current state of a robot controller.
   *
   * @operationId publishRobotControllersState
   */
  "nova.v2.cells.{cell}.controllers.{controller}.state": RobotControllerState
  /**
   * Description of Motion Group
   *
   * Publishes the description of a motion group, including TCPs, mounting, safety zones, limits, etc.
   *
   * @operationId publishMotionGroupDescription
   */
  "nova.v2.cells.{cell}.controllers.{controller}.motion-groups.{motion-group}.description": MotionGroupDescription
  /**
   * System Update Started
   *
   * Publishes an event when a system update process is initiated.
   *
   * This event is triggered once the service-manager begins a system update process,
   * providing details about the update metadata, trigger information, and pre-update checks.
   *
   * The event follows CloudEvents v1.0 specification and is persisted in NATS JetStream
   * for reliable delivery and event replay capabilities.
   *
   * @operationId eventSystemUpdateStarted
   */
  "nova.v2.events.system.update.started": SystemUpdateStartedEvent
  /**
   * System Update Completed
   *
   * Publishes an event when a system update process is completed.
   *
   * This event is triggered once the service-manager completes a system update process,
   * providing comprehensive results including success status, component outcomes,
   * error details, and post-update validation results.
   *
   * The event follows CloudEvents v1.0 specification and is persisted in NATS JetStream
   * for reliable delivery and event replay capabilities.
   *
   * @operationId eventSystemUpdateCompleted
   */
  "nova.v2.events.system.update.completed": SystemUpdateCompletedEvent
  /**
   * System Network Status Changed
   *
   * Publishes an event when a system network status changes.
   *
   * This event is triggered once system-info service detects a change in the system network status,
   * providing details about the new network state and related information.
   *
   * The event follows CloudEvents v1.0 specification and is persisted in NATS JetStream
   * for reliable delivery and event replay capabilities.
   *
   * @operationId eventSystemNetworkStatusChanged
   */
  "nova.v2.events.system.network.status.changed": NetworkStatusChangedEvent
  /**
   * Cell Created
   *
   * Publishes an event when a cell foundation release is created.
   *
   * The event follows CloudEvents v1.0 and is persisted in NATS JetStream for reliable delivery and replay capabilities.
   *
   * @operationId eventCellCreated
   */
  "nova.v2.events.cells.{cell}.created": CellCreatedEvent
  /**
   * Cell Updated
   *
   * Publishes an event when a cell foundation release is updated.
   *
   * The event follows CloudEvents v1.0 and is persisted in NATS JetStream for reliable delivery and replay capabilities.
   *
   * @operationId eventCellUpdated
   */
  "nova.v2.events.cells.{cell}.updated": CellUpdatedEvent
  /**
   * Cell Deleted
   *
   * Publishes an event when a cell foundation release is deleted.
   *
   * The event follows CloudEvents v1.0 and is persisted in NATS JetStream for reliable delivery and replay capabilities.
   *
   * @operationId eventCellDeleted
   */
  "nova.v2.events.cells.{cell}.deleted": CellDeletedEvent
  /**
   * App Created
   *
   * Publishes an event when an app release is created in a cell.
   *
   * The event follows CloudEvents v1.0 and is persisted in NATS JetStream for reliable delivery and replay capabilities.
   *
   * @operationId eventAppCreated
   */
  "nova.v2.events.cells.{cell}.apps.{app}.created": AppCreatedEvent
  /**
   * App Updated
   *
   * Publishes an event when an app release is updated in a cell.
   *
   * The event follows CloudEvents v1.0 and is persisted in NATS JetStream for reliable delivery and replay capabilities.
   *
   * @operationId eventAppUpdated
   */
  "nova.v2.events.cells.{cell}.apps.{app}.updated": AppUpdatedEvent
  /**
   * App Deleted
   *
   * Publishes an event when an app release is deleted from a cell.
   *
   * The event follows CloudEvents v1.0 and is persisted in NATS JetStream for reliable delivery and replay capabilities.
   *
   * @operationId eventAppDeleted
   */
  "nova.v2.events.cells.{cell}.apps.{app}.deleted": AppDeletedEvent
  /**
   * Robot Controller Created
   *
   * Publishes an event when a robot controller release is created in a cell.
   *
   * The event follows CloudEvents v1.0 and is persisted in NATS JetStream for reliable delivery and replay capabilities.
   *
   * @operationId eventRobotControllerCreated
   */
  "nova.v2.events.cells.{cell}.controllers.{controller}.created": RobotControllerCreatedEvent
  /**
   * Robot Controller Updated
   *
   * Publishes an event when a robot controller release is updated in a cell.
   *
   * The event follows CloudEvents v1.0 and is persisted in NATS JetStream for reliable delivery and replay capabilities.
   *
   * @operationId eventRobotControllerUpdated
   */
  "nova.v2.events.cells.{cell}.controllers.{controller}.updated": RobotControllerUpdatedEvent
  /**
   * Robot Controller Deleted
   *
   * Publishes an event when a robot controller release is deleted from a cell.
   *
   * The event follows CloudEvents v1.0 and is persisted in NATS JetStream for reliable delivery and replay capabilities.
   *
   * @operationId eventRobotControllerDeleted
   */
  "nova.v2.events.cells.{cell}.controllers.{controller}.deleted": RobotControllerDeletedEvent
}

export type NatsSubscribeSubject = keyof NatsSubscribePayloads

/** Request payload types for subjects the client sends requests to. */
export interface NatsRequestPayloads {
  /**
   * Set Output Values
   *
   * Set output values published with the BUS inputs/outputs service.
   * If you're using a virtual service, you can set inputs as well.
   *
   * @operationId setBUSIOsIOs
   */
  "nova.v2.cells.{cell}.bus-ios.ios.set": ListIOValuesResponse
  /**
   * Select Input/Output Values
   *
   * Select input/output values published by the controller on the shared `...ios` subject.
   *
   * This is the reserved, never-expiring default stream, shared by all clients that use it. For
   * independent per-client streams with their own update type and time to live use the `ios.subscribe`
   * operations instead. Malformed requests (non-string or empty entries in `ios`, an invalid
   * `update_type`) are rejected and leave the current selection unchanged.
   *
   * @operationId selectRobotControllerIOs
   */
  "nova.v2.cells.{cell}.controllers.{controller}.ios.select": SelectIOs
  /**
   * Subscribe to Input/Output Values
   *
   * Create a per-client subscription that streams the selected input/output values on a dedicated,
   * subscription-specific subject.
   *
   * The server generates a subject-safe `subscription_id` and returns it in the reply; values are then
   * published on `{instance}.v2.cells.{cell}.controllers.{controller}.ios.{subscription_id}`. The
   * subscription expires after `ttl_seconds` unless it is renewed. A subscription that would push the
   * union of all subscriptions' ports beyond the controller's realtime input/output capacity is rejected.
   *
   * @operationId subscribeRobotControllerIOs
   */
  "nova.v2.cells.{cell}.controllers.{controller}.ios.subscribe": SubscribeIOs
  /**
   * Update an Input/Output Subscription
   *
   * Partially update an existing subscription by its server-issued `subscription_id`. Only the supplied
   * fields (`ios`, `update_type`, `ttl_seconds`) are changed; omitted fields are kept unchanged, so the
   * time to live or the update type can be changed without resending the port list. An update that would
   * push the union of all subscriptions' ports beyond the controller's realtime input/output capacity is
   * rejected and leaves the subscription unchanged.
   *
   * A successful update also renews the lease: `expires_at` is reset to the current time plus the
   * subscription's time to live, even when `ttl_seconds` is omitted.
   *
   * @operationId updateRobotControllerIOSubscription
   */
  "nova.v2.cells.{cell}.controllers.{controller}.ios.subscribe.update": UpdateIOSubscription
  /**
   * Renew an Input/Output Subscription
   *
   * Extend the lease of an existing subscription identified by its server-issued `subscription_id`.
   * Clients should renew at roughly a third of the subscription's time to live. A subscription that has
   * already expired is not found and must be created again.
   *
   * @operationId renewRobotControllerIOSubscription
   */
  "nova.v2.cells.{cell}.controllers.{controller}.ios.subscribe.renew": RenewIOSubscription
  /**
   * Cancel an Input/Output Subscription
   *
   * Cancel an existing subscription identified by its server-issued `subscription_id`. Streaming on the
   * subscription's subject stops and its ports are removed from the union read from the controller.
   *
   * @operationId cancelRobotControllerIOSubscription
   */
  "nova.v2.cells.{cell}.controllers.{controller}.ios.subscribe.cancel": CancelIOSubscription
  /**
   * List Network Interfaces
   *
   * Lists all managed network interfaces available for controller connections and ARP scanning.
   *
   * @operationId getNetworkInterfaces
   */
  "nova.v2.system.network.interfaces": NetworkInterfacesRequest
  /**
   * Run ARP Scan
   *
   * Runs an ARP scan on the target interface and returns all discovered devices.
   *
   * @operationId arpScan
   */
  "nova.v2.system.network.arpscan": ArpScanRequest
}

/** Reply payload types for request/reply subjects. */
export interface NatsReplyPayloads {
  /**
   * Set Output Values
   *
   * Set output values published with the BUS inputs/outputs service.
   * If you're using a virtual service, you can set inputs as well.
   *
   * @operationId setBUSIOsIOs
   */
  "nova.v2.cells.{cell}.bus-ios.ios.set": NatsErrorPayload
  /**
   * Select Input/Output Values
   *
   * Select input/output values published by the controller on the shared `...ios` subject.
   *
   * This is the reserved, never-expiring default stream, shared by all clients that use it. For
   * independent per-client streams with their own update type and time to live use the `ios.subscribe`
   * operations instead. Malformed requests (non-string or empty entries in `ios`, an invalid
   * `update_type`) are rejected and leave the current selection unchanged.
   *
   * @operationId selectRobotControllerIOs
   */
  "nova.v2.cells.{cell}.controllers.{controller}.ios.select": NatsErrorPayload
  /**
   * Subscribe to Input/Output Values
   *
   * Create a per-client subscription that streams the selected input/output values on a dedicated,
   * subscription-specific subject.
   *
   * The server generates a subject-safe `subscription_id` and returns it in the reply; values are then
   * published on `{instance}.v2.cells.{cell}.controllers.{controller}.ios.{subscription_id}`. The
   * subscription expires after `ttl_seconds` unless it is renewed. A subscription that would push the
   * union of all subscriptions' ports beyond the controller's realtime input/output capacity is rejected.
   *
   * @operationId subscribeRobotControllerIOs
   */
  "nova.v2.cells.{cell}.controllers.{controller}.ios.subscribe": IOSubscriptionCreated
  /**
   * Update an Input/Output Subscription
   *
   * Partially update an existing subscription by its server-issued `subscription_id`. Only the supplied
   * fields (`ios`, `update_type`, `ttl_seconds`) are changed; omitted fields are kept unchanged, so the
   * time to live or the update type can be changed without resending the port list. An update that would
   * push the union of all subscriptions' ports beyond the controller's realtime input/output capacity is
   * rejected and leaves the subscription unchanged.
   *
   * A successful update also renews the lease: `expires_at` is reset to the current time plus the
   * subscription's time to live, even when `ttl_seconds` is omitted.
   *
   * @operationId updateRobotControllerIOSubscription
   */
  "nova.v2.cells.{cell}.controllers.{controller}.ios.subscribe.update": IOSubscriptionLease
  /**
   * Renew an Input/Output Subscription
   *
   * Extend the lease of an existing subscription identified by its server-issued `subscription_id`.
   * Clients should renew at roughly a third of the subscription's time to live. A subscription that has
   * already expired is not found and must be created again.
   *
   * @operationId renewRobotControllerIOSubscription
   */
  "nova.v2.cells.{cell}.controllers.{controller}.ios.subscribe.renew": IOSubscriptionLease
  /**
   * Cancel an Input/Output Subscription
   *
   * Cancel an existing subscription identified by its server-issued `subscription_id`. Streaming on the
   * subscription's subject stops and its ports are removed from the union read from the controller.
   *
   * @operationId cancelRobotControllerIOSubscription
   */
  "nova.v2.cells.{cell}.controllers.{controller}.ios.subscribe.cancel": NatsErrorPayload
  /**
   * List Network Interfaces
   *
   * Lists all managed network interfaces available for controller connections and ARP scanning.
   *
   * @operationId getNetworkInterfaces
   */
  "nova.v2.system.network.interfaces": NetworkInterfacesReply
  /**
   * Run ARP Scan
   *
   * Runs an ARP scan on the target interface and returns all discovered devices.
   *
   * @operationId arpScan
   */
  "nova.v2.system.network.arpscan": ArpScanReply
}

export type NatsRequestSubject = keyof NatsRequestPayloads

/** Payload types for every subject defined in the spec, publishable via NovaNatsClient#publish. */
export interface NatsPublishPayloads {
  /**
   * Cell Configuration
   *
   * Publishes the configuration for a cell.
   *
   * The latest status message is persisted NATS JetStream, documented in `x-nats-jetstream-stream`
   *
   * @operationId publishCell
   */
  "nova.v2.cells.{cell}": Cell
  /**
   * App Configuration
   *
   * Publishes the configuration for a GUI application in the cell.
   *
   * The latest status message is persisted NATS JetStream, documented in `x-nats-jetstream-stream`
   *
   * @operationId publishApp
   */
  "nova.v2.cells.{cell}.apps.{app}": App
  /**
   * Program Status
   *
   * Publishes status messages for programs running in an app within a cell.
   * The status messages provide information about the current state of a program run.
   *
   * @operationId publishProgramStatus
   */
  "nova.v2.cells.{cell}.programs": ProgramStatus
  /**
   * Robot Controller Configuration
   *
   * Publishes the configuration of a robot controller.
   *
   * @operationId publishRobotController
   */
  "nova.v2.cells.{cell}.controllers.{controller}": RobotController
  /**
   * Service Status
   *
   * Publishes the status of all cell resources.
   *
   * The latest status message is persisted NATS JetStream, documented in `x-nats-jetstream-stream`
   *
   * @operationId publishCellStatus
   */
  "nova.v2.cells.{cell}.status": ServiceStatusList
  /**
   * Cell Cycle Event
   *
   * Publishes the cycle events for a cell.
   *
   * @operationId publishCellCycle
   */
  "nova.v2.cells.{cell}.cycle": CellCycleEvent
  /**
   * Wandelbots NOVA status
   *
   * Publishes the status of all system services.
   *
   * The latest status message is persisted NATS JetStream, documented in `x-nats-jetstream-stream`
   *
   * @operationId publishSystemStatus
   */
  "nova.v2.system.status": ServiceStatusList
  /**
   * Collision Setup
   *
   * Publishes the stored collision setup.
   *
   * The latest status message is persisted NATS JetStream, documented in `x-nats-jetstream-stream`
   *
   * @operationId publishCollisionSetup
   */
  "nova.v2.cells.{cell}.collision.setups.{setup}": CollisionSetup
  /**
   * BUS Inputs/Outputs Service Status
   *
   * Publishes the status of BUS inputs/outputs service.
   *
   * The latest status message is persisted NATS JetStream, documented in `x-nats-jetstream-stream`.
   *
   * @operationId publishBUSIOStatus
   */
  "nova.v2.cells.{cell}.bus-ios.status": BusIOsState
  /**
   * BUS Input/Output Values
   *
   * Publishes updates of BUS input/output values.
   *
   * @operationId publishBUSIOsIOs
   */
  "nova.v2.cells.{cell}.bus-ios.ios": ListIOValuesResponse
  /**
   * Set Output Values
   *
   * Set output values published with the BUS inputs/outputs service.
   * If you're using a virtual service, you can set inputs as well.
   *
   * @operationId setBUSIOsIOs
   */
  "nova.v2.cells.{cell}.bus-ios.ios.set": ListIOValuesResponse
  /**
   * Select Input/Output Values
   *
   * Select input/output values published by the controller on the shared `...ios` subject.
   *
   * This is the reserved, never-expiring default stream, shared by all clients that use it. For
   * independent per-client streams with their own update type and time to live use the `ios.subscribe`
   * operations instead. Malformed requests (non-string or empty entries in `ios`, an invalid
   * `update_type`) are rejected and leave the current selection unchanged.
   *
   * @operationId selectRobotControllerIOs
   */
  "nova.v2.cells.{cell}.controllers.{controller}.ios.select": SelectIOs
  /**
   * Input/Output Values
   *
   * Publishes updates of input/output values.
   *
   * @operationId publishRobotControllerIOs
   */
  "nova.v2.cells.{cell}.controllers.{controller}.ios": StreamIOValuesResponse
  /**
   * Subscribe to Input/Output Values
   *
   * Create a per-client subscription that streams the selected input/output values on a dedicated,
   * subscription-specific subject.
   *
   * The server generates a subject-safe `subscription_id` and returns it in the reply; values are then
   * published on `{instance}.v2.cells.{cell}.controllers.{controller}.ios.{subscription_id}`. The
   * subscription expires after `ttl_seconds` unless it is renewed. A subscription that would push the
   * union of all subscriptions' ports beyond the controller's realtime input/output capacity is rejected.
   *
   * @operationId subscribeRobotControllerIOs
   */
  "nova.v2.cells.{cell}.controllers.{controller}.ios.subscribe": SubscribeIOs
  /**
   * Update an Input/Output Subscription
   *
   * Partially update an existing subscription by its server-issued `subscription_id`. Only the supplied
   * fields (`ios`, `update_type`, `ttl_seconds`) are changed; omitted fields are kept unchanged, so the
   * time to live or the update type can be changed without resending the port list. An update that would
   * push the union of all subscriptions' ports beyond the controller's realtime input/output capacity is
   * rejected and leaves the subscription unchanged.
   *
   * A successful update also renews the lease: `expires_at` is reset to the current time plus the
   * subscription's time to live, even when `ttl_seconds` is omitted.
   *
   * @operationId updateRobotControllerIOSubscription
   */
  "nova.v2.cells.{cell}.controllers.{controller}.ios.subscribe.update": UpdateIOSubscription
  /**
   * Renew an Input/Output Subscription
   *
   * Extend the lease of an existing subscription identified by its server-issued `subscription_id`.
   * Clients should renew at roughly a third of the subscription's time to live. A subscription that has
   * already expired is not found and must be created again.
   *
   * @operationId renewRobotControllerIOSubscription
   */
  "nova.v2.cells.{cell}.controllers.{controller}.ios.subscribe.renew": RenewIOSubscription
  /**
   * Cancel an Input/Output Subscription
   *
   * Cancel an existing subscription identified by its server-issued `subscription_id`. Streaming on the
   * subscription's subject stops and its ports are removed from the union read from the controller.
   *
   * @operationId cancelRobotControllerIOSubscription
   */
  "nova.v2.cells.{cell}.controllers.{controller}.ios.subscribe.cancel": CancelIOSubscription
  /**
   * Subscription Input/Output Values
   *
   * Publishes updates of input/output values for a single subscription on its dedicated
   * `...ios.{subscription_id}` subject. Each subscription receives its own `full` or `changes` view.
   *
   * @operationId publishRobotControllerIOSubscription
   */
  "nova.v2.cells.{cell}.controllers.{controller}.ios.{subscription_id}": StreamIOValuesResponse
  /**
   * State of Robot Controller
   *
   * Publishes the current state of a robot controller.
   *
   * @operationId publishRobotControllersState
   */
  "nova.v2.cells.{cell}.controllers.{controller}.state": RobotControllerState
  /**
   * Description of Motion Group
   *
   * Publishes the description of a motion group, including TCPs, mounting, safety zones, limits, etc.
   *
   * @operationId publishMotionGroupDescription
   */
  "nova.v2.cells.{cell}.controllers.{controller}.motion-groups.{motion-group}.description": MotionGroupDescription
  /**
   * System Update Started
   *
   * Publishes an event when a system update process is initiated.
   *
   * This event is triggered once the service-manager begins a system update process,
   * providing details about the update metadata, trigger information, and pre-update checks.
   *
   * The event follows CloudEvents v1.0 specification and is persisted in NATS JetStream
   * for reliable delivery and event replay capabilities.
   *
   * @operationId eventSystemUpdateStarted
   */
  "nova.v2.events.system.update.started": SystemUpdateStartedEvent
  /**
   * System Update Completed
   *
   * Publishes an event when a system update process is completed.
   *
   * This event is triggered once the service-manager completes a system update process,
   * providing comprehensive results including success status, component outcomes,
   * error details, and post-update validation results.
   *
   * The event follows CloudEvents v1.0 specification and is persisted in NATS JetStream
   * for reliable delivery and event replay capabilities.
   *
   * @operationId eventSystemUpdateCompleted
   */
  "nova.v2.events.system.update.completed": SystemUpdateCompletedEvent
  /**
   * System Network Status Changed
   *
   * Publishes an event when a system network status changes.
   *
   * This event is triggered once system-info service detects a change in the system network status,
   * providing details about the new network state and related information.
   *
   * The event follows CloudEvents v1.0 specification and is persisted in NATS JetStream
   * for reliable delivery and event replay capabilities.
   *
   * @operationId eventSystemNetworkStatusChanged
   */
  "nova.v2.events.system.network.status.changed": NetworkStatusChangedEvent
  /**
   * List Network Interfaces
   *
   * Lists all managed network interfaces available for controller connections and ARP scanning.
   *
   * @operationId getNetworkInterfaces
   */
  "nova.v2.system.network.interfaces": NetworkInterfacesRequest
  /**
   * Run ARP Scan
   *
   * Runs an ARP scan on the target interface and returns all discovered devices.
   *
   * @operationId arpScan
   */
  "nova.v2.system.network.arpscan": ArpScanRequest
  /**
   * Cell Created
   *
   * Publishes an event when a cell foundation release is created.
   *
   * The event follows CloudEvents v1.0 and is persisted in NATS JetStream for reliable delivery and replay capabilities.
   *
   * @operationId eventCellCreated
   */
  "nova.v2.events.cells.{cell}.created": CellCreatedEvent
  /**
   * Cell Updated
   *
   * Publishes an event when a cell foundation release is updated.
   *
   * The event follows CloudEvents v1.0 and is persisted in NATS JetStream for reliable delivery and replay capabilities.
   *
   * @operationId eventCellUpdated
   */
  "nova.v2.events.cells.{cell}.updated": CellUpdatedEvent
  /**
   * Cell Deleted
   *
   * Publishes an event when a cell foundation release is deleted.
   *
   * The event follows CloudEvents v1.0 and is persisted in NATS JetStream for reliable delivery and replay capabilities.
   *
   * @operationId eventCellDeleted
   */
  "nova.v2.events.cells.{cell}.deleted": CellDeletedEvent
  /**
   * App Created
   *
   * Publishes an event when an app release is created in a cell.
   *
   * The event follows CloudEvents v1.0 and is persisted in NATS JetStream for reliable delivery and replay capabilities.
   *
   * @operationId eventAppCreated
   */
  "nova.v2.events.cells.{cell}.apps.{app}.created": AppCreatedEvent
  /**
   * App Updated
   *
   * Publishes an event when an app release is updated in a cell.
   *
   * The event follows CloudEvents v1.0 and is persisted in NATS JetStream for reliable delivery and replay capabilities.
   *
   * @operationId eventAppUpdated
   */
  "nova.v2.events.cells.{cell}.apps.{app}.updated": AppUpdatedEvent
  /**
   * App Deleted
   *
   * Publishes an event when an app release is deleted from a cell.
   *
   * The event follows CloudEvents v1.0 and is persisted in NATS JetStream for reliable delivery and replay capabilities.
   *
   * @operationId eventAppDeleted
   */
  "nova.v2.events.cells.{cell}.apps.{app}.deleted": AppDeletedEvent
  /**
   * Robot Controller Created
   *
   * Publishes an event when a robot controller release is created in a cell.
   *
   * The event follows CloudEvents v1.0 and is persisted in NATS JetStream for reliable delivery and replay capabilities.
   *
   * @operationId eventRobotControllerCreated
   */
  "nova.v2.events.cells.{cell}.controllers.{controller}.created": RobotControllerCreatedEvent
  /**
   * Robot Controller Updated
   *
   * Publishes an event when a robot controller release is updated in a cell.
   *
   * The event follows CloudEvents v1.0 and is persisted in NATS JetStream for reliable delivery and replay capabilities.
   *
   * @operationId eventRobotControllerUpdated
   */
  "nova.v2.events.cells.{cell}.controllers.{controller}.updated": RobotControllerUpdatedEvent
  /**
   * Robot Controller Deleted
   *
   * Publishes an event when a robot controller release is deleted from a cell.
   *
   * The event follows CloudEvents v1.0 and is persisted in NATS JetStream for reliable delivery and replay capabilities.
   *
   * @operationId eventRobotControllerDeleted
   */
  "nova.v2.events.cells.{cell}.controllers.{controller}.deleted": RobotControllerDeletedEvent
}

export type NatsPublishSubject = keyof NatsPublishPayloads
