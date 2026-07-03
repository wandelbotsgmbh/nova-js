/**
 * Generates a typed NATS client surface from src/asyncapi.yaml.
 *
 * Produces:
 * - src/lib/experimental/nats/generated/types.ts       TypeScript interfaces for every message payload schema
 * - src/lib/experimental/nats/generated/operations.ts  Subject templates + typed operation maps
 *
 * Run with: pnpm generate:nats
 */
import { Parser } from "@asyncapi/parser"
import { compile } from "json-schema-to-typescript"
import { readFile, writeFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { parse as parseYaml } from "yaml"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, "..")
const specPath = path.join(repoRoot, "src/asyncapi.yaml")
const outDir = path.join(repoRoot, "src/lib/experimental/nats/generated")

const GENERATED_BANNER = `/**
 * AUTO-GENERATED FILE - DO NOT EDIT.
 * Generated from src/asyncapi.yaml by scripts/generate-nats-client.ts.
 * Run \`pnpm generate:nats\` to regenerate.
 */\n\n`

// Renamed to avoid colliding with the global \`Error\` type.
const SCHEMA_NAME_OVERRIDES: Record<string, string> = {
  Error: "NatsErrorPayload",
}
// The `instance` channel parameter is always "nova" for now, so it's baked
// into subjects as a literal instead of being a parameter callers must pass.
const INSTANCE_PARAM_NAME = "instance"
const FIXED_INSTANCE = "nova"
function schemaExportName(schemaName: string): string {
  return SCHEMA_NAME_OVERRIDES[schemaName] ?? schemaName
}

type RawSpec = {
  components: { schemas: Record<string, unknown> }
  channels: Record<
    string,
    {
      address: string | null
      parameters?: Record<string, unknown>
      messages?: Record<string, { payload?: { $ref?: string } }>
    }
  >
  operations: Record<
    string,
    {
      action: "send" | "receive"
      channel: { $ref: string }
      reply?: { channel: { $ref: string } }
    }
  >
}

function channelNameFromRef(ref: string): string {
  // e.g. "#/channels/{instance}.v2.cells.{cell}" -> "{instance}.v2.cells.{cell}"
  return decodeURIComponent(ref.replace(/^#\/channels\//, ""))
}

function schemaNameFromRef(ref: string): string {
  // e.g. "#/components/schemas/Cell" -> "Cell"
  return ref.replace(/^#\/components\/schemas\//, "")
}

function firstMessagePayloadSchemaName(
  channel: RawSpec["channels"][string],
): string {
  const messages = Object.values(channel.messages ?? {})
  const firstMessage = messages[0]
  const ref = firstMessage?.payload?.$ref
  if (!ref) {
    throw new Error(
      `Channel is missing a message payload $ref: ${channel.address}`,
    )
  }
  return schemaNameFromRef(ref)
}

async function validateSpec(specText: string) {
  const parser = new Parser()
  const diagnostics = await parser.validate(specText)
  const errors = diagnostics.filter((d) => d.severity === 0)
  if (errors.length > 0) {
    for (const err of errors) {
      console.error(`${err.path.join(".")}: ${err.message}`)
    }
    throw new Error(
      `src/asyncapi.yaml failed validation (${errors.length} error(s))`,
    )
  }
}

async function generateTypes(
  spec: RawSpec,
): Promise<{ source: string; exportedNames: Set<string> }> {
  // Rewrite $ref pointers so they resolve within a synthetic `definitions` bag,
  // and rename schemas that collide with reserved global identifiers.
  let bagJson = JSON.stringify(spec.components.schemas).replaceAll(
    "#/components/schemas/",
    "#/definitions/",
  )
  for (const [from, to] of Object.entries(SCHEMA_NAME_OVERRIDES)) {
    bagJson = bagJson.replaceAll(
      `#/definitions/${from}"`,
      `#/definitions/${to}"`,
    )
  }
  const definitions = JSON.parse(bagJson) as Record<string, unknown>
  for (const [from, to] of Object.entries(SCHEMA_NAME_OVERRIDES)) {
    if (from in definitions) {
      definitions[to] = definitions[from]
      delete definitions[from]
    }
  }

  const rootSchema = {
    $id: "GeneratedNatsPayloadsRoot",
    type: "object",
    definitions,
  }

  const ts = await compile(rootSchema, "GeneratedNatsPayloadsRoot", {
    bannerComment: "",
    unreachableDefinitions: true,
    declareExternallyReferenced: true,
    additionalProperties: false,
    style: { semi: false },
  })

  // Drop the synthetic root interface/type from the output (its declaration
  // line, not just any block that mentions it in a provenance comment).
  const withoutRoot = ts
    .split(/\n(?=export )/)
    .filter(
      (block) =>
        !/^export (?:interface|type) GeneratedNatsPayloadsRoot\b/.test(block),
    )
    .join("\n")

  const exportedNames = new Set<string>()
  for (const match of withoutRoot.matchAll(
    /export (?:interface|type) (\w+)/g,
  )) {
    const name = match[1]
    if (name) exportedNames.add(name)
  }

  return { source: GENERATED_BANNER + withoutRoot, exportedNames }
}

function generateOperations(
  spec: RawSpec,
  availableTypeNames: Set<string>,
): string {
  const channelByName = spec.channels

  type OperationInfo = {
    name: string
    subject: string
    paramNames: string[]
    payloadTypeName: string
    kind: "subscribe" | "request"
    replyPayloadTypeName?: string
  }

  const operations: OperationInfo[] = Object.entries(spec.operations).map(
    ([name, op]) => {
      const channelName = channelNameFromRef(op.channel.$ref)
      const channel = channelByName[channelName]
      if (!channel) {
        throw new Error(
          `Operation "${name}" references unknown channel "${channelName}"`,
        )
      }
      if (!channel.address) {
        throw new Error(
          `Operation "${name}" channel "${channelName}" has no address`,
        )
      }

      const subject = channel.address.replaceAll(
        `{${INSTANCE_PARAM_NAME}}`,
        FIXED_INSTANCE,
      )
      const paramNames = Object.keys(channel.parameters ?? {}).filter(
        (p) => p !== INSTANCE_PARAM_NAME,
      )
      const payloadSchemaName = firstMessagePayloadSchemaName(channel)
      const payloadTypeName = schemaExportName(payloadSchemaName)

      if (op.action === "send") {
        return {
          name,
          subject,
          paramNames,
          payloadTypeName,
          kind: "subscribe",
        }
      }

      // action === "receive": the server receives this message, so from the
      // client's perspective this is a request that expects a reply.
      if (!op.reply) {
        throw new Error(
          `Operation "${name}" has action "receive" but no reply channel`,
        )
      }
      const replyChannelName = channelNameFromRef(op.reply.channel.$ref)
      const replyChannel = channelByName[replyChannelName]
      if (!replyChannel) {
        throw new Error(
          `Operation "${name}" reply references unknown channel "${replyChannelName}"`,
        )
      }
      const replyPayloadSchemaName = firstMessagePayloadSchemaName(replyChannel)

      return {
        name,
        subject,
        paramNames,
        payloadTypeName,
        kind: "request",
        replyPayloadTypeName: schemaExportName(replyPayloadSchemaName),
      }
    },
  )

  const usedTypeNames = new Set<string>()
  for (const op of operations) {
    usedTypeNames.add(op.payloadTypeName)
    if (op.replyPayloadTypeName) usedTypeNames.add(op.replyPayloadTypeName)
  }
  for (const typeName of usedTypeNames) {
    if (!availableTypeNames.has(typeName)) {
      throw new Error(
        `Generated types.ts does not export "${typeName}", required by an operation payload`,
      )
    }
  }

  const subscribeOps = operations.filter((op) => op.kind === "subscribe")
  const requestOps = operations.filter((op) => op.kind === "request")

  const paramsKey = (paramName: string) =>
    /^[A-Za-z_$][\w$]*$/.test(paramName) ? paramName : JSON.stringify(paramName)

  const lines: string[] = []
  lines.push(GENERATED_BANNER)
  lines.push(`import type {`)
  for (const typeName of [...usedTypeNames].sort()) {
    lines.push(`  ${typeName},`)
  }
  lines.push(`} from "./types.ts"\n`)

  lines.push(
    `/** Subject parameters required by each NATS subject, e.g. "nova.v2.cells.{cell}". */`,
  )
  lines.push(`export interface NatsOperationParams {`)
  for (const op of operations) {
    const paramsType = op.paramNames.length
      ? `{ ${op.paramNames.map((p) => `${paramsKey(p)}: string`).join("; ")} }`
      : "Record<string, never>"
    lines.push(`  /** ${op.name} */`)
    lines.push(`  ${JSON.stringify(op.subject)}: ${paramsType}`)
  }
  lines.push(`}\n`)

  lines.push(
    `/** Payload types for subjects the server publishes and the client subscribes to. */`,
  )
  lines.push(`export interface NatsSubscribePayloads {`)
  for (const op of subscribeOps) {
    lines.push(`  /** ${op.name} */`)
    lines.push(`  ${JSON.stringify(op.subject)}: ${op.payloadTypeName}`)
  }
  lines.push(`}\n`)
  lines.push(`export type NatsSubscribeSubject = keyof NatsSubscribePayloads\n`)

  lines.push(
    `/** Request payload types for subjects the client sends requests to. */`,
  )
  lines.push(`export interface NatsRequestPayloads {`)
  for (const op of requestOps) {
    lines.push(`  /** ${op.name} */`)
    lines.push(`  ${JSON.stringify(op.subject)}: ${op.payloadTypeName}`)
  }
  lines.push(`}\n`)

  lines.push(`/** Reply payload types for request/reply subjects. */`)
  lines.push(`export interface NatsReplyPayloads {`)
  for (const op of requestOps) {
    lines.push(`  /** ${op.name} */`)
    lines.push(`  ${JSON.stringify(op.subject)}: ${op.replyPayloadTypeName}`)
  }
  lines.push(`}\n`)
  lines.push(`export type NatsRequestSubject = keyof NatsRequestPayloads\n`)

  return lines.join("\n")
}

async function main() {
  const specText = await readFile(specPath, "utf-8")
  await validateSpec(specText)

  const spec = parseYaml(specText) as RawSpec

  const { source: typesSource, exportedNames } = await generateTypes(spec)
  const operationsSource = generateOperations(spec, exportedNames)

  await writeFile(path.join(outDir, "types.ts"), typesSource)
  await writeFile(path.join(outDir, "operations.ts"), operationsSource)

  console.log(
    `Generated NATS client sources in ${path.relative(repoRoot, outDir)}/`,
  )
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
