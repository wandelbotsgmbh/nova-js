/**
 * Check that a Metro consumer can resolve every public subpath of this package.
 *
 * Metro only reads the "exports" map while package exports are enabled: the
 * default since React Native 0.79, and behind
 * `resolver.unstable_enablePackageExports: true` on older versions. Without it
 * Metro looks for a real directory at the subpath, so every entry that lives
 * under dist/ fails with "could not be found within the project or in these
 * directories".
 *
 * This drives Metro's own resolver (metro-resolver, no bundler) once with
 * package exports enabled and once without, so a break in the exports map
 * fails here instead of in a consumer's app. The disabled run is reported, not
 * asserted: it names the gap a consumer on older Metro hits.
 *
 * Run `pnpm build` first, the check resolves against the built dist.
 * Run with: pnpm check:metro
 */
import fs from "node:fs"
import { createRequire } from "node:module"
import os from "node:os"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { FailedToResolveNameError, resolve } from "metro-resolver"

const require = createRequire(import.meta.url)
// Metro's own context helper (it only adds the "browser"-field redirect on top
// of the callbacks below), imported through metro's private subpath export.
const createDefaultContextModule = require("metro-resolver/private/createDefaultContext")
const createDefaultContext =
  createDefaultContextModule.default ?? createDefaultContextModule

type PackageJson = {
  name?: string
  exports?: Record<string, unknown>
}

type LookupResult =
  | { exists: false }
  | { exists: true; type: "f" | "d"; realPath: string }

type ExportEntry = {
  key: string
  specifier: string
  target: string
}

type ResolutionAttempt =
  | { status: "resolved"; filePath: string }
  | { status: "failed" | "unsupported"; detail: string }

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
)
const manifest = JSON.parse(
  fs.readFileSync(path.join(repoRoot, "package.json"), "utf8"),
) as PackageJson
const packageName = manifest.name
if (!packageName) {
  throw new Error("package.json has no name")
}
const exportsField = manifest.exports
if (exportsField == null || typeof exportsField !== "object") {
  throw new Error(`${packageName}: package.json has no "exports" map to check`)
}
if (!fs.existsSync(path.join(repoRoot, "dist"))) {
  throw new Error("dist/ not found; run `pnpm build` before this check")
}

// A throwaway project that imports the package by name, the way a consumer
// does. extraNodeModules points the name at this checkout, so no install is
// needed and nothing is read from a package registry.
const consumerDir = fs.mkdtempSync(path.join(os.tmpdir(), "nova-js-metro-"))
const originModulePath = path.join(consumerDir, "index.js")
fs.writeFileSync(originModulePath, "")
fs.writeFileSync(
  path.join(consumerDir, "package.json"),
  JSON.stringify({ name: "metro-subpath-check", private: true }),
)

const fileLookup = (absolutePath: string): LookupResult => {
  try {
    const stats = fs.statSync(absolutePath)
    return {
      exists: true,
      type: stats.isDirectory() ? "d" : "f",
      realPath: fs.realpathSync(absolutePath),
    }
  } catch {
    return { exists: false }
  }
}

const getPackage = (packageJsonPath: string) => {
  try {
    return JSON.parse(fs.readFileSync(packageJsonPath, "utf8"))
  } catch {
    return null
  }
}

// Mirrors Metro's own lookup: the closest package.json at or above the path,
// without crossing a node_modules boundary.
const getPackageForModule = (absoluteModulePath: string) => {
  const moduleLookup = fileLookup(absoluteModulePath)
  let dir =
    moduleLookup.exists && moduleLookup.type === "f"
      ? path.dirname(absoluteModulePath)
      : absoluteModulePath
  for (;;) {
    if (path.basename(dir) === "node_modules") {
      return null
    }
    const packageJsonPath = path.join(dir, "package.json")
    if (fileLookup(packageJsonPath).exists) {
      return {
        packageJson: getPackage(packageJsonPath) ?? {},
        packageRelativePath: path.relative(dir, absoluteModulePath),
        rootPath: dir,
      }
    }
    const parent = path.dirname(dir)
    if (parent === dir) {
      return null
    }
    dir = parent
  }
}

const makeContext = (enablePackageExports: boolean) =>
  createDefaultContext(
    {
      allowHaste: false,
      assetExts: new Set(["png", "jpg", "jpeg", "gif", "webp", "svg"]),
      customResolverOptions: {},
      dev: false,
      disableHierarchicalLookup: true,
      doesFileExist: (absolutePath: string) => {
        const result = fileLookup(absolutePath)
        return result.exists && result.type === "f"
      },
      extraNodeModules: { [packageName]: repoRoot },
      fileSystemLookup: fileLookup,
      getPackage,
      getPackageForModule,
      isESMImport: true,
      mainFields: ["react-native", "browser", "main"],
      nodeModulesPaths: [],
      originModulePath,
      preferNativePlatform: true,
      resolveAsset: () => null,
      resolveHasteModule: () => null,
      resolveHastePackage: () => null,
      resolveRequest: null,
      sourceExts: ["js", "jsx", "json", "ts", "tsx", "mjs", "cjs"],
      unstable_conditionNames: ["require", "import", "react-native"],
      unstable_conditionsByPlatform: {
        ios: ["react-native"],
        android: ["react-native"],
      },
      unstable_enablePackageExports: enablePackageExports,
      unstable_incrementalResolution: false,
      unstable_logWarning: (message: string) => {
        console.warn(`  Metro warning: ${message}`)
      },
    },
    {
      name: "",
      data: { asyncType: null, isESMImport: true, key: "", locs: [] },
    },
  )

const tryResolve = (
  context: ReturnType<typeof makeContext>,
  specifier: string,
): ResolutionAttempt => {
  try {
    const resolution = resolve(context, specifier, null)
    if (resolution.type === "sourceFile") {
      return { status: "resolved", filePath: resolution.filePath }
    }
    return { status: "unsupported", detail: JSON.stringify(resolution) }
  } catch (error) {
    let detail: string
    if (error instanceof FailedToResolveNameError) {
      // The module name is not on disk anywhere Metro looked; name the places
      // so the report says why the subpath is unreachable.
      const lookedAt = [...error.dirPaths, ...error.extraPaths]
      detail =
        lookedAt.length > 0
          ? `not found, looked at ${lookedAt.join(", ")}`
          : "not found below any node_modules directory"
    } else if (error instanceof Error) {
      detail = `${error.name}: ${error.message.split("\n")[0]}`
    } else {
      detail = String(error)
    }
    return { status: "failed", detail }
  }
}

const entries: ExportEntry[] = Object.entries(exportsField).map(
  ([key, value]) => {
    const target =
      typeof value === "string"
        ? value
        : (value as Record<string, unknown> | null)?.default
    if (typeof target !== "string") {
      throw new Error(`exports["${key}"] has no runtime "default" target`)
    }
    return {
      key,
      specifier:
        key === "."
          ? packageName
          : `${packageName}/${key.replace(/^\.\//, "")}`,
      target: path.resolve(repoRoot, target),
    }
  },
)

console.log(`Metro subpath resolution for ${packageName}`)
console.log(`  package root:   ${repoRoot}`)
console.log(`  consumer entry: ${originModulePath}`)
console.log("")

const relative = (absolutePath: string) => path.relative(repoRoot, absolutePath)

console.log(
  "package exports enabled (React Native >= 0.79, or resolver.unstable_enablePackageExports: true)",
)
const enabledContext = makeContext(true)
let failures = 0
for (const { key, specifier, target } of entries) {
  const attempt = tryResolve(enabledContext, specifier)
  if (attempt.status === "resolved" && attempt.filePath === target) {
    console.log(`  ok   ${key} -> ${relative(attempt.filePath)}`)
  } else if (attempt.status === "resolved") {
    failures++
    console.log(
      `  FAIL ${key} -> resolved to ${relative(attempt.filePath)}, expected ${relative(target)} (package exports enabled)`,
    )
  } else {
    failures++
    console.log(
      `  FAIL ${key} -> not resolved: ${attempt.detail} (package exports enabled)`,
    )
  }
}

console.log("")
console.log(
  "package exports disabled (older Metro default, the state the colleague hit)",
)
const disabledContext = makeContext(false)
for (const { key, specifier, target } of entries) {
  const attempt = tryResolve(disabledContext, specifier)
  if (attempt.status === "resolved") {
    const note =
      attempt.filePath === target
        ? "same file as with package exports"
        : `resolved to ${relative(attempt.filePath)}`
    console.log(`  ok   ${key} -> ${relative(attempt.filePath)} (${note})`)
  } else {
    console.log(`  gap  ${key} -> not resolved: ${attempt.detail}`)
  }
}
console.log("")

fs.rmSync(consumerDir, { recursive: true, force: true })

if (failures > 0) {
  console.error(
    `${failures} public subpath(s) do not resolve with Metro's package exports enabled`,
  )
  process.exit(1)
}
console.log("all public subpaths resolve with Metro's package exports enabled")
