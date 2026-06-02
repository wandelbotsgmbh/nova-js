// biome-ignore-all lint/suspicious/noExplicitAny: dynamic API class discovery
import * as novaApiV2 from "@wandelbots/nova-api/v2"
import { expect, test } from "vitest"
import { NovaCellAPIClient } from "../../src/lib/deprecated/v2/NovaCellAPIClient"

/**
 * This test ensures that every API class exported from @wandelbots/nova-api/v2
 * is wrapped by NovaCellAPIClient. If a new API is added to the upstream
 * package without being exposed here, this test will fail.
 */
test("NovaCellAPIClient covers all API classes from @wandelbots/nova-api/v2", () => {
  const allApiClassNames = Object.entries(novaApiV2)
    .filter(
      ([name, value]) =>
        name.endsWith("Api") &&
        typeof value === "function" &&
        // Exclude the helper factories/param creators, only keep the classes
        !name.includes("Factory") &&
        !name.includes("Fp") &&
        !name.includes("ParamCreator"),
    )
    .map(([name]) => name)
    .sort()

  // Sanity check that we actually found some API classes
  expect(allApiClassNames.length).toBeGreaterThan(10)

  const client = new NovaCellAPIClient("test-cell", {
    basePath: "https://mock.example.com",
  })

  // Collect which API classes are used by the client by checking all property values
  const usedApiClasses = new Set<string>()
  for (const key of Object.keys(client)) {
    const value = (client as any)[key]
    if (value && typeof value === "object") {
      // The wrapped API instances have their constructor name mangled,
      // but we can check against the original constructors
      for (const apiClassName of allApiClassNames) {
        const ApiClass = (novaApiV2 as any)[apiClassName]
        if (value instanceof ApiClass) {
          usedApiClasses.add(apiClassName)
        }
      }
    }
  }

  const missingApis = allApiClassNames.filter(
    (name) => !usedApiClasses.has(name),
  )

  expect(
    missingApis,
    `NovaCellAPIClient is missing wrappers for: ${missingApis.join(", ")}`,
  ).toEqual([])
})
