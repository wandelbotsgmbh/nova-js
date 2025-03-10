import type { GetTrajectoryResponse } from "@wandelbots/nova-api/v1"
import type { NovaCellAPIClient } from "./NovaCellAPIClient"

let lastMotionIds: Set<string> = new Set()

export async function getLatestTrajectories(
  apiClient: NovaCellAPIClient,
  sampleTime: number = 50,
  responsesCoordinateSystem?: string,
): Promise<GetTrajectoryResponse[]> {
  const newTrajectories: GetTrajectoryResponse[] = []

  try {
    const motions = await apiClient.motion.listMotions()
    const currentMotionIds = new Set(motions.motions)

    const newMotionIds = Array.from(currentMotionIds).filter(
      (id) => !lastMotionIds.has(id),
    )

    for (const motionId of newMotionIds) {
      const trajectory = await apiClient.motion.getMotionTrajectory(
        motionId,
        sampleTime,
        responsesCoordinateSystem,
      )
      newTrajectories.push(trajectory)
    }

    lastMotionIds = currentMotionIds
  } catch (error) {
    console.error("Failed to get latest trajectories:", error)
  }

  return newTrajectories
}
