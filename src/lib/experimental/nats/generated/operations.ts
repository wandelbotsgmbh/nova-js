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
  BusIOsState,
  Cell,
  CellCreatedEvent,
  CellCycleEvent,
  CellDeletedEvent,
  CellUpdatedEvent,
  CollisionSetup,
  ListIOValuesResponse,
  MotionGroupDescription,
  NatsErrorPayload,
  NetworkStatusChangedEvent,
  ProgramStatus,
  RobotController,
  RobotControllerCreatedEvent,
  RobotControllerDeletedEvent,
  RobotControllerState,
  RobotControllerUpdatedEvent,
  SelectIOs,
  ServiceStatusList,
  StreamIOValuesResponse,
  SystemUpdateCompletedEvent,
  SystemUpdateStartedEvent,
} from "./types.ts"

/** Subject parameters required by each NATS subject, e.g. "nova.v2.cells.{cell}". */
export interface NatsOperationParams {
  /** publishCell */
  "nova.v2.cells.{cell}": { cell: string }
  /** publishApp */
  "nova.v2.cells.{cell}.apps.{app}": { cell: string; app: string }
  /** publishProgramStatus */
  "nova.v2.cells.{cell}.programs": { cell: string }
  /** publishRobotController */
  "nova.v2.cells.{cell}.controllers.{controller}": {
    cell: string
    controller: string
  }
  /** publishCellStatus */
  "nova.v2.cells.{cell}.status": { cell: string }
  /** publishCellCycle */
  "nova.v2.cells.{cell}.cycle": { cell: string }
  /** publishSystemStatus */
  "nova.v2.system.status": Record<string, never>
  /** publishCollisionSetup */
  "nova.v2.cells.{cell}.collision.setups.{setup}": {
    cell: string
    setup: string
  }
  /** publishBUSIOStatus */
  "nova.v2.cells.{cell}.bus-ios.status": { cell: string }
  /** publishBUSIOsIOs */
  "nova.v2.cells.{cell}.bus-ios.ios": { cell: string }
  /** setBUSIOsIOs */
  "nova.v2.cells.{cell}.bus-ios.ios.set": { cell: string }
  /** selectRobotControllerIOs */
  "nova.v2.cells.{cell}.controllers.{controller}.ios.select": {
    cell: string
    controller: string
  }
  /** publishRobotControllerIOs */
  "nova.v2.cells.{cell}.controllers.{controller}.ios": {
    cell: string
    controller: string
  }
  /** publishRobotControllersState */
  "nova.v2.cells.{cell}.controllers.{controller}.state": {
    cell: string
    controller: string
  }
  /** publishMotionGroupDescription */
  "nova.v2.cells.{cell}.controllers.{controller}.motion-groups.{motion-group}.description": {
    cell: string
    controller: string
    "motion-group": string
  }
  /** eventSystemUpdateStarted */
  "nova.v2.events.system.update.started": Record<string, never>
  /** eventSystemUpdateCompleted */
  "nova.v2.events.system.update.completed": Record<string, never>
  /** eventSystemNetworkStatusChanged */
  "nova.v2.events.system.network.status.changed": Record<string, never>
  /** eventCellCreated */
  "nova.v2.events.cells.{cell}.created": { cell: string }
  /** eventCellUpdated */
  "nova.v2.events.cells.{cell}.updated": { cell: string }
  /** eventCellDeleted */
  "nova.v2.events.cells.{cell}.deleted": { cell: string }
  /** eventAppCreated */
  "nova.v2.events.cells.{cell}.apps.{app}.created": {
    cell: string
    app: string
  }
  /** eventAppUpdated */
  "nova.v2.events.cells.{cell}.apps.{app}.updated": {
    cell: string
    app: string
  }
  /** eventAppDeleted */
  "nova.v2.events.cells.{cell}.apps.{app}.deleted": {
    cell: string
    app: string
  }
  /** eventRobotControllerCreated */
  "nova.v2.events.cells.{cell}.controllers.{controller}.created": {
    cell: string
    controller: string
  }
  /** eventRobotControllerUpdated */
  "nova.v2.events.cells.{cell}.controllers.{controller}.updated": {
    cell: string
    controller: string
  }
  /** eventRobotControllerDeleted */
  "nova.v2.events.cells.{cell}.controllers.{controller}.deleted": {
    cell: string
    controller: string
  }
}

/** Payload types for subjects the server publishes and the client subscribes to. */
export interface NatsSubscribePayloads {
  /** publishCell */
  "nova.v2.cells.{cell}": Cell
  /** publishApp */
  "nova.v2.cells.{cell}.apps.{app}": App
  /** publishProgramStatus */
  "nova.v2.cells.{cell}.programs": ProgramStatus
  /** publishRobotController */
  "nova.v2.cells.{cell}.controllers.{controller}": RobotController
  /** publishCellStatus */
  "nova.v2.cells.{cell}.status": ServiceStatusList
  /** publishCellCycle */
  "nova.v2.cells.{cell}.cycle": CellCycleEvent
  /** publishSystemStatus */
  "nova.v2.system.status": ServiceStatusList
  /** publishCollisionSetup */
  "nova.v2.cells.{cell}.collision.setups.{setup}": CollisionSetup
  /** publishBUSIOStatus */
  "nova.v2.cells.{cell}.bus-ios.status": BusIOsState
  /** publishBUSIOsIOs */
  "nova.v2.cells.{cell}.bus-ios.ios": ListIOValuesResponse
  /** publishRobotControllerIOs */
  "nova.v2.cells.{cell}.controllers.{controller}.ios": StreamIOValuesResponse
  /** publishRobotControllersState */
  "nova.v2.cells.{cell}.controllers.{controller}.state": RobotControllerState
  /** publishMotionGroupDescription */
  "nova.v2.cells.{cell}.controllers.{controller}.motion-groups.{motion-group}.description": MotionGroupDescription
  /** eventSystemUpdateStarted */
  "nova.v2.events.system.update.started": SystemUpdateStartedEvent
  /** eventSystemUpdateCompleted */
  "nova.v2.events.system.update.completed": SystemUpdateCompletedEvent
  /** eventSystemNetworkStatusChanged */
  "nova.v2.events.system.network.status.changed": NetworkStatusChangedEvent
  /** eventCellCreated */
  "nova.v2.events.cells.{cell}.created": CellCreatedEvent
  /** eventCellUpdated */
  "nova.v2.events.cells.{cell}.updated": CellUpdatedEvent
  /** eventCellDeleted */
  "nova.v2.events.cells.{cell}.deleted": CellDeletedEvent
  /** eventAppCreated */
  "nova.v2.events.cells.{cell}.apps.{app}.created": AppCreatedEvent
  /** eventAppUpdated */
  "nova.v2.events.cells.{cell}.apps.{app}.updated": AppUpdatedEvent
  /** eventAppDeleted */
  "nova.v2.events.cells.{cell}.apps.{app}.deleted": AppDeletedEvent
  /** eventRobotControllerCreated */
  "nova.v2.events.cells.{cell}.controllers.{controller}.created": RobotControllerCreatedEvent
  /** eventRobotControllerUpdated */
  "nova.v2.events.cells.{cell}.controllers.{controller}.updated": RobotControllerUpdatedEvent
  /** eventRobotControllerDeleted */
  "nova.v2.events.cells.{cell}.controllers.{controller}.deleted": RobotControllerDeletedEvent
}

export type NatsSubscribeSubject = keyof NatsSubscribePayloads

/** Request payload types for subjects the client sends requests to. */
export interface NatsRequestPayloads {
  /** setBUSIOsIOs */
  "nova.v2.cells.{cell}.bus-ios.ios.set": ListIOValuesResponse
  /** selectRobotControllerIOs */
  "nova.v2.cells.{cell}.controllers.{controller}.ios.select": SelectIOs
}

/** Reply payload types for request/reply subjects. */
export interface NatsReplyPayloads {
  /** setBUSIOsIOs */
  "nova.v2.cells.{cell}.bus-ios.ios.set": NatsErrorPayload
  /** selectRobotControllerIOs */
  "nova.v2.cells.{cell}.controllers.{controller}.ios.select": NatsErrorPayload
}

export type NatsRequestSubject = keyof NatsRequestPayloads
