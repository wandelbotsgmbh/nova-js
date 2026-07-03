/**
 * Builds a NATS subject from an AsyncAPI-style channel address template
 * (e.g. `"{instance}.v2.cells.{cell}"`) by substituting each `{param}`
 * placeholder with the corresponding value from `params`.
 */
export function buildSubject(
  template: string,
  params: Record<string, string>,
): string {
  return template.replace(/\{([^}]+)\}/g, (match, paramName: string) => {
    const value = params[paramName]
    if (value === undefined) {
      throw new Error(
        `Missing value for subject parameter "${paramName}" in template "${template}"`,
      )
    }
    if (value === "" || /[\s.>*]/.test(value)) {
      throw new Error(
        `Invalid value for subject parameter "${paramName}": "${value}" (must be non-empty and must not contain whitespace or the NATS special characters ".", ">", "*")`,
      )
    }
    return value
  })
}
