import { expect, test } from "vitest"
import { NovaClient } from "../../src/internal/deprecated/v1"
import { env } from "../env"

test("basic smoke test of API client", async () => {
  const nova = new NovaClient({
    instanceUrl: env.NOVA,
  })

  const cell = await nova.api.cell.getCell("cell")
  expect(cell.name).toBe("cell")
})
