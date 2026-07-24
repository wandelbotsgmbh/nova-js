// biome-ignore-all lint/suspicious/noExplicitAny: dynamic API class discovery
import * as novaApiV2 from "@wandelbots/nova-js/v2"
import { Nova, NovaAPIClient } from "@wandelbots/nova-js/v2"
import { expect, test } from "vitest"

/**
 * This test ensures that every generated API class exported from nova-js/v2 is
 * wrapped by NovaAPIClient. If a new API is added upstream without being
 * exposed here, this test will fail.
 */
test("NovaAPIClient covers all generated API classes", () => {
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

  if (missingApis.length > 0 && process.env.NOVA_API_DEV_BUILD) {
    // When building against @wandelbots/nova-api's `dev` channel (ahead of a
    // stable release), new API classes may show up here before NovaAPIClient
    // has been updated to wrap them. Warn instead of failing so the
    // publish-nova-api-dev workflow can still publish a preview build; a
    // normal build/test run (this env var unset) still fails as usual.
    console.warn(
      `NovaAPIClient is missing wrappers for: ${missingApis.join(", ")}`,
    )
    return
  }

  expect(
    missingApis,
    `NovaAPIClient is missing wrappers for: ${missingApis.join(", ")}`,
  ).toEqual([])
})

test("NovaAPIClient uses camelCase property names", () => {
  const nova = new Nova({
    instanceUrl: "https://mock.example.com",
  })

  // Verify key properties resolve on the type
  nova.api.controllerIOs satisfies object
  nova.api.busIOs satisfies object
  nova.api.virtualControllerIOs satisfies object
  nova.api.novaCloud satisfies object
})
