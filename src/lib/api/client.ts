// Thin transport for the console API (`/api`). Mirrors the product's error contract:
// callers branch on `code`, never on message text, and a dropped request means a write
// may have succeeded (re-read, never blind re-send).

export class ApiError extends Error {
  readonly status: number
  readonly code: string | null
  readonly decisionId: string | null

  constructor(status: number, message: string, code: string | null = null, decisionId: string | null = null) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.decisionId = decisionId
  }

  /** TypeError (network) or 502/504: the request may or may not have landed. */
  get dropped() {
    return this.status === 0 || this.status === 502 || this.status === 504
  }
}

const API_BASE = '/api'

/**
 * `VITE_API_MODE=live` talks to the real console API. Anything else serves the
 * captured mock data in `src/data/mock`, so the UI runs with no backend.
 */
export const USE_MOCK = import.meta.env.VITE_API_MODE !== 'live'

export async function apiGet<T>(path: string, signal?: AbortSignal): Promise<T> {
  let response: Response
  try {
    response = await fetch(`${API_BASE}${path}`, { credentials: 'same-origin', signal })
  } catch (cause) {
    if (cause instanceof DOMException && cause.name === 'AbortError') throw cause
    throw new ApiError(0, 'The console could not be reached. Check your connection and try again.')
  }

  if (!response.ok) {
    const contentType = response.headers.get('content-type') ?? ''
    if (!contentType.includes('json')) {
      throw new ApiError(
        response.status,
        'The request was blocked before it reached the console. Retry or contact an administrator.',
      )
    }
    const body = (await response.json().catch(() => ({}))) as { message?: string; code?: string; decision_id?: string }
    throw new ApiError(response.status, body.message ?? `Request failed (${response.status})`, body.code ?? null, body.decision_id ?? null)
  }
  return (await response.json()) as T
}
