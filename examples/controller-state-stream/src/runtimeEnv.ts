// Workaround for the lack of runtime environment variable support in
// NextJS. The top level layout.tsx uses dynamic SSR to inject relevant env variables
// from the server runtime environment into this object so client code can access it.
export const env: Partial<ReturnType<typeof getExposedRuntimeEnv>> = {};

/**
 * Set environment variables that should be sent from the server runtime
 * to the browser here. Don't expose secrets!
 */
export function getExposedRuntimeEnv() {
  return {
    BASE_PATH: process.env.BASE_PATH,
    CELL_ID: process.env.CELL_ID,
    NODE_ENV: process.env.NODE_ENV,
    NOVA_DEV_INSTANCE_URL: process.env.NOVA_DEV_INSTANCE_URL,
    NOVA_DEV_ACCESS_TOKEN: process.env.NOVA_DEV_ACCESS_TOKEN,
  };
}
