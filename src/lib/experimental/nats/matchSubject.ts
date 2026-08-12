/**
 * The inverse of `buildSubject`: extracts the `{param}` values of an
 * AsyncAPI-style channel address template from a concrete NATS subject.
 *
 * Useful when subscribing with a wildcard param (e.g. `{ cell: "*" }`) to
 * recover which entity a received message belongs to from `msg.subject`,
 * instead of indexing into `subject.split(".")` by hand:
 *
 *     matchSubject("nova.v2.cells.{cell}.status", "nova.v2.cells.a.status")
 *     // -> { cell: "a" }
 *
 * Matching is per dot-separated token: a `{param}` template token captures
 * the concrete token under the param's name, a literal `*` token matches any
 * single token without capturing, a trailing `>` token matches one or more
 * remaining tokens, and any other token must match exactly. Placeholders
 * embedded inside a larger token (e.g. `prefix-{param}`) are not supported.
 *
 * Returns the captured params (an empty object for a template without
 * params), or `undefined` when the subject does not match the template.
 */
export function matchSubject(
  template: string,
  subject: string,
): Record<string, string> | undefined {
  const templateTokens = template.split(".")
  const subjectTokens = subject.split(".")

  const params: Record<string, string> = {}

  for (const [i, token] of templateTokens.entries()) {
    if (token === ">" && i === templateTokens.length - 1) {
      // `>` must match at least one remaining token.
      return subjectTokens.length > i ? params : undefined
    }

    const subjectToken = subjectTokens[i]
    if (subjectToken === undefined) return undefined

    if (token.startsWith("{") && token.endsWith("}") && token.length > 2) {
      params[token.slice(1, -1)] = subjectToken
    } else if (token !== "*" && token !== subjectToken) {
      return undefined
    }
  }

  if (subjectTokens.length !== templateTokens.length) return undefined

  return params
}
