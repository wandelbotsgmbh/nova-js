// biome-ignore-all lint/suspicious/noExplicitAny: dynamic API class discovery
import * as novaApiV2 from "@wandelbots/nova-api/v2"
import { Nova, NovaAPIClient } from "@wandelbots/nova-js/v2"
import { expect, test } from "vitest"

/**
 * This test ensures that every API class exported from @wandelbots/nova-api/v2
 * is wrapped by NovaAPIClient. If a new API is added to the upstream
 * package without being exposed here, this test will fail.
 */
test("NovaAPIClient covers all API classes from @wandelbots/nova-api/v2", () => {
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

  const client = new NovaAPIClient({
    basePath: "https://mock.example.com",
    isJsonMime: (mime: string) => mime === "application/json",
  })

  // Collect which API classes are used by the client by checking all property values
  const usedApiClasses = new Set<string>()
  for (const key of Object.keys(client)) {
    const value = (client as any)[key]
    if (value && typeof value === "object") {
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
    `NovaAPIClient is missing wrappers for: ${missingApis.join(", ")}`,
  ).toEqual([])
})

test("NovaAPIClient aliases InputsOutputs to IOs in property names", () => {
  const nova = new Nova({
    instanceUrl: "https://mock.example.com",
  })

  const keys = Object.keys(nova.api)

  // Should have the short aliases
  expect(keys).toContain("controllerIOs")
  expect(keys).toContain("busIOs")
  expect(keys).toContain("virtualControllerIOs")
  expect(keys).toContain("novaCloud")

  // Should NOT have the long form
  expect(keys).not.toContain("controllerInputsOutputs")
  expect(keys).not.toContain("busInputsOutputs")
  expect(keys).not.toContain("virtualControllerInputsOutputs")
  expect(keys).not.toContain("NovaCloud")

  // Verify the types also resolve these properties
  nova.api.controllerIOs satisfies object
  nova.api.busIOs satisfies object
  nova.api.virtualControllerIOs satisfies object
  nova.api.novaCloud satisfies object
})
