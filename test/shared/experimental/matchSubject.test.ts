import { describe, expect, test } from "vitest"
// biome-ignore lint/style/noRestrictedImports: internal unit testing
import { matchSubject } from "../../../src/lib/experimental/nats/matchSubject.ts"

describe("matchSubject", () => {
  test("extracts params from a concrete subject", () => {
    expect(
      matchSubject(
        "nova.v2.cells.{cell}.controllers.{controller}.state",
        "nova.v2.cells.mycell.controllers.ur5e.state",
      ),
    ).toEqual({ cell: "mycell", controller: "ur5e" })
  })

  test("extracts params with non-identifier names like {motion-group}", () => {
    expect(
      matchSubject(
        "nova.v2.cells.{cell}.controllers.{controller}.motion-groups.{motion-group}.description",
        "nova.v2.cells.mycell.controllers.ur5e.motion-groups.0.description",
      ),
    ).toEqual({ cell: "mycell", controller: "ur5e", "motion-group": "0" })
  })

  test("matches a template without params exactly, returning an empty record", () => {
    expect(
      matchSubject("nova.v2.system.status", "nova.v2.system.status"),
    ).toEqual({})
  })

  test("returns undefined when a literal token differs", () => {
    expect(
      matchSubject("nova.v2.cells.{cell}.status", "nova.v2.cells.mycell.cycle"),
    ).toBeUndefined()
  })

  test("returns undefined when the token counts differ", () => {
    expect(
      matchSubject("nova.v2.cells.{cell}", "nova.v2.cells.mycell.status"),
    ).toBeUndefined()
    expect(
      matchSubject("nova.v2.cells.{cell}.status", "nova.v2.cells.mycell"),
    ).toBeUndefined()
  })

  test("treats a literal '*' token as match-any without capturing it", () => {
    expect(
      matchSubject("nova.v2.cells.{cell}.apps.*", "nova.v2.cells.a.apps.b"),
    ).toEqual({ cell: "a" })
    expect(
      matchSubject("nova.v2.cells.*.status", "nova.v2.cells.a.cycle"),
    ).toBeUndefined()
  })

  test("treats a trailing '>' token as match-remainder", () => {
    expect(
      matchSubject("nova.v2.cells.{cell}.>", "nova.v2.cells.a.apps.b.c"),
    ).toEqual({ cell: "a" })
    expect(
      matchSubject("nova.v2.cells.{cell}.>", "nova.v2.cells.a"),
    ).toBeUndefined()
  })

  test("round-trips subjects built by buildSubject", () => {
    expect(
      matchSubject("nova.v2.cells.{cell}.apps.{app}", "nova.v2.cells.c.apps.x"),
    ).toEqual({ cell: "c", app: "x" })
  })
})
