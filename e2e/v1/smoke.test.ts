import { NovaClient } from "@wandelbots/nova-js"
import { expect, test } from "vitest"
import { env } from "../env.ts"

test("basic smoke test of API client", async () => {
  const nova = new NovaClient({
    instanceUrl: env.NOVA,
  })

  const cell = await nova.api.cell.getCell("cell")
  expect(cell.name).toBe("cell")
})
