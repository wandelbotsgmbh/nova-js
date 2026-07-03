import { describe, expect, test } from "vitest"
// biome-ignore lint/style/noRestrictedImports: internal unit testing
import { buildSubject } from "../../../src/lib/experimental/nats/buildSubject.ts"

describe("buildSubject", () => {
  test("substitutes a single param into a channel template", () => {
    expect(
      buildSubject("{instance}.v2.system.status", { instance: "nova" }),
    ).toBe("nova.v2.system.status")
  })

  test("substitutes multiple different params", () => {
    expect(
      buildSubject("{instance}.v2.cells.{cell}.apps.{app}", {
        instance: "nova",
        cell: "cell",
        app: "myapp",
      }),
    ).toBe("nova.v2.cells.cell.apps.myapp")
  })

  test("throws when a param is missing", () => {
    expect(() =>
      buildSubject("{instance}.v2.cells.{cell}", { instance: "nova" }),
    ).toThrowError(/cell/)
  })

  test("throws when a param value is empty or contains NATS special characters", () => {
    expect(() =>
      buildSubject("{instance}.v2.cells.{cell}", {
        instance: "nova",
        cell: "",
      }),
    ).toThrowError()
    expect(() =>
      buildSubject("{instance}.v2.cells.{cell}", {
        instance: "nova",
        cell: "a.b",
      }),
    ).toThrowError()
    expect(() =>
      buildSubject("{instance}.v2.cells.{cell}", {
        instance: "nova",
        cell: "a*b",
      }),
    ).toThrowError()
    expect(() =>
      buildSubject("{instance}.v2.cells.{cell}", {
        instance: "nova",
        cell: "a>b",
      }),
    ).toThrowError()
  })
})
