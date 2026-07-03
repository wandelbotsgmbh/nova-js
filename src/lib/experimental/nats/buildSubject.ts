/**
 * Builds a NATS subject from an AsyncAPI-style channel address template
 * (e.g. `"{instance}.v2.cells.{cell}"`) by substituting each `{param}`
 * placeholder with the corresponding value from `params`.
 */

function isValidSubjectChar(char: string): boolean {
  const code = char.charCodeAt(0)
  return (
    (code >= 48 && code <= 57) || // 0-9
    (code >= 65 && code <= 90) || // A-Z
    (code >= 97 && code <= 122) || // a-z
    char === "-" ||
    char === "_"
  )
}

function isValidSubjectValue(value: string): boolean {
  if (value.length === 0) return false
  for (const char of value) {
    if (!isValidSubjectChar(char)) return false
  }
  return true
}

export function buildSubject(
  template: string,
  params: Record<string, string>,
): string {
  // Scanned manually (rather than with a regex like /\{([^}]+)\}/g) to avoid
  // a polynomial-time backtracking blowup on pathological input, e.g. a
  // template consisting of many "{" characters with no closing "}".
  let result = ""
  let cursor = 0

  while (cursor < template.length) {
    const openIndex = template.indexOf("{", cursor)
    if (openIndex === -1) {
      result += template.slice(cursor)
      break
    }

    const closeIndex = template.indexOf("}", openIndex + 1)
    if (closeIndex === -1) {
      result += template.slice(cursor)
      break
    }

    result += template.slice(cursor, openIndex)
    const paramName = template.slice(openIndex + 1, closeIndex)
    const value = params[paramName]
    if (value === undefined) {
      throw new Error(
        `Missing value for subject parameter "${paramName}" in template "${template}"`,
      )
    }
    if (!isValidSubjectValue(value)) {
      throw new Error(
        `Invalid value for subject parameter "${paramName}": "${value}" (must be non-empty and contain only letters, digits, "-", and "_")`,
      )
    }
    result += value

    cursor = closeIndex + 1
  }

  return result
}
