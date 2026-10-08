import { useCallback, useEffect, useRef, useState } from 'react'

export interface Resource<T> {
  /** Last successfully read value. Kept while a refresh or a new request is in flight, and after a failed refresh. */
  data: T | null
  error: Error | null
  /** A request is in flight (first read, refresh or a switch to a new key). */
  pending: boolean
  /** When `data` was last read successfully, as a Date. Null until the first success. */
  updatedAt: Date | null
  /** Key whose request produced `data`. Differs from the requested key while a switch is pending or has failed. */
  dataKey: string | null
  refresh: () => void
}

interface Options {
  /** Re-read on this interval while the tab is visible. */
  pollMs?: number
}

/**
 * Minimal read-through hook with the semantics the product requires of every data surface:
 * a refresh keeps what is on screen, a failed refresh keeps the last good data and says
 * when it is from, and a switch to a new key keeps the old data until the new one lands.
 */
export function useResource<T>(key: string, load: (signal: AbortSignal) => Promise<T>, { pollMs }: Options = {}): Resource<T> {
  const [data, setData] = useState<T | null>(null)
  const [dataKey, setDataKey] = useState<string | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [pending, setPending] = useState(true)
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null)

  const loadRef = useRef(load)
  useEffect(() => {
    loadRef.current = load
  })
  const controller = useRef<AbortController | null>(null)

  const run = useCallback(
    (forKey: string) => {
      controller.current?.abort()
      const next = new AbortController()
      controller.current = next
      setPending(true)
      loadRef
        .current(next.signal)
        .then((value) => {
          if (next.signal.aborted) return
          setData(value)
          setDataKey(forKey)
          setError(null)
          setUpdatedAt(new Date())
          setPending(false)
        })
        .catch((cause: unknown) => {
          if (next.signal.aborted) return
          setError(cause instanceof Error ? cause : new Error(String(cause)))
          setPending(false)
        })
    },
    [],
  )

  useEffect(() => {
    run(key)
    return () => controller.current?.abort()
  }, [key, run])

  useEffect(() => {
    if (!pollMs) return
    const tick = () => {
      if (document.visibilityState === 'visible') run(key)
    }
    const id = window.setInterval(tick, pollMs)
    return () => window.clearInterval(id)
  }, [key, pollMs, run])

  const refresh = useCallback(() => run(key), [key, run])

  return { data, error, pending, updatedAt, dataKey, refresh }
}
