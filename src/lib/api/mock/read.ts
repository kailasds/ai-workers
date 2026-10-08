import { ApiError } from '../client'

// Shared mock-read behaviour: a short latency, and the `?mock=` scenarios used to review
// non-happy states (loading never resolves, error throws, slow waits).
export async function mockRead<T>(scenario: string | null | undefined, value: () => T, signal?: AbortSignal, ms = 300): Promise<T> {
  await new Promise<void>((resolve, reject) => {
    const timer = setTimeout(resolve, scenario === 'slow' ? 2500 : ms)
    signal?.addEventListener('abort', () => {
      clearTimeout(timer)
      reject(new DOMException('Aborted', 'AbortError'))
    })
  })
  if (scenario === 'loading') {
    await new Promise<never>((_, reject) => signal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError'))))
  }
  if (scenario === 'error') throw new ApiError(503, 'The service did not respond.', 'UPSTREAM_UNAVAILABLE')
  return structuredClone(value())
}
