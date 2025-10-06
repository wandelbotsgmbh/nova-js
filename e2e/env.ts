if (!process.env.NOVA) {
  throw new Error(
    "NOVA=... environment variable must be set to target e2e tests",
  )
}

export const env = process.env as NodeJS.ProcessEnv & {
  NOVA: string
}
