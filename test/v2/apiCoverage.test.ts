// biome-ignore-all lint/suspicious/noExplicitAny: dynamic API class discovery
import * as novaApiV2 from "@wandelbots/nova-api/v2"
import { expect, test } from "vitest"
import { NovaCellAPIClient } from "../../src/lib/deprecated/v2/NovaCellAPIClient"
import { NovaAPIClient } from "../../src/lib/v2/NovaAPIClient"

function getAllApiClassNames() {
  return Object.entries(novaApiV2)
    .filter(
      ([name, value]) =>
        name.endsWith("Api") &&
        typeof value === "function" &&
        !name.includes("Factory") &&
        !name.includes("Fp") &&
        !name.includes("ParamCreator"),
    )
    .map(([name]) => name)
    .sort()
}

function getUsedApiClasses(client: any, allApiClassNames: string[]) {
  const usedApiClasses = new Set<string>()
  for (const key of Object.keys(client)) {
    const value = client[key]
    if (value && typeof value === "object") {
      for (const apiClassName of allApiClassNames) {
        const ApiClass = (novaApiV2 as any)[apiClassName]
        if (value instanceof ApiClass) {
          usedApiClasses.add(apiClassName)
        }
      }
    }
  }
  return usedApiClasses
}

/**
 * This test ensures that every API class exported from @wandelbots/nova-api/v2
 * is wrapped by NovaCellAPIClient. If a new API is added to the upstream
 * package without being exposed here, this test will fail.
 */
test("NovaCellAPIClient covers all API classes from @wandelbots/nova-api/v2", () => {
  const allApiClassNames = getAllApiClassNames()
  expect(allApiClassNames.length).toBeGreaterThan(10)

  const client = new NovaCellAPIClient("test-cell", {
    basePath: "https://mock.example.com",
  })

  const usedApiClasses = getUsedApiClasses(client, allApiClassNames)
  const missingApis = allApiClassNames.filter(
    (name) => !usedApiClasses.has(name),
  )

  expect(
    missingApis,
    `NovaCellAPIClient is missing wrappers for: ${missingApis.join(", ")}`,
  ).toEqual([])
})

/**
 * NovaAPIClient auto-discovers API classes at runtime, so this should
 * always pass without manual updates.
 */
test("NovaAPIClient auto-discovers all API classes from @wandelbots/nova-api/v2", () => {
  const allApiClassNames = getAllApiClassNames()
  expect(allApiClassNames.length).toBeGreaterThan(10)

  const client = new NovaAPIClient("test-cell", {
    basePath: "https://mock.example.com",
  })

  const usedApiClasses = getUsedApiClasses(client, allApiClassNames)
  const missingApis = allApiClassNames.filter(
    (name) => !usedApiClasses.has(name),
  )

  expect(
    missingApis,
    `NovaAPIClient is missing wrappers for: ${missingApis.join(", ")}`,
  ).toEqual([])
})
