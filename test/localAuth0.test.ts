import { expect, test } from "vitest"
import { getAuth0Config } from "../src/LoginWithAuth0"

test("local auth0 login detection", () => {
  expect(() => getAuth0Config("https://waffles.wobbles.io")).toThrowError(
    /waffles/,
  )
  expect(() => getAuth0Config("strange.robots/example")).toThrowError(/strange/)

  // Dev
  expect(
    getAuth0Config("https://waffles.instance.dev.wandelbots.io").domain,
  ).toEqual("https://auth.portal.dev.wandelbots.io")
  expect(
    getAuth0Config("waffles.instance.dev.wandelbots.io/boop").domain,
  ).toEqual("https://auth.portal.dev.wandelbots.io")

  // Stg
  expect(
    getAuth0Config("https://waffles.instance.stg.wandelbots.io").domain,
  ).toEqual("https://auth.portal.stg.wandelbots.io")
  expect(
    getAuth0Config("waffles.instance.stg.wandelbots.io/boop").domain,
  ).toEqual("https://auth.portal.stg.wandelbots.io")

  // Prod
  expect(
    getAuth0Config("https://waffles.instance.wandelbots.io").domain,
  ).toEqual("https://auth.portal.wandelbots.io")

  expect(getAuth0Config("waffles.instance.wandelbots.io/boop").domain).toEqual(
    "https://auth.portal.wandelbots.io",
  )
})
