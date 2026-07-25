export type GroqFetchResult =
  | { timedOut: false; response: Response }
  | { timedOut: true; response: null }

// Wraps fetch to api.groq.com with an AbortController timeout.
// Returns { timedOut: true } instead of throwing so callers handle it inline.
export async function groqFetch(
  url: string,
  options: RequestInit,
  timeoutMs = 30_000
): Promise<GroqFetchResult> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const response = await fetch(url, { ...options, signal: controller.signal })
    return { timedOut: false, response }
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return { timedOut: true, response: null }
    }
    throw error
  } finally {
    clearTimeout(timer)
  }
}
