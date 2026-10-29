import { useCallback } from 'react'
import { useSearchParams } from 'react-router'

export const PAGE_SIZES = [10, 20, 50]

/**
 * Client-side pagination over a complete, already-loaded list, kept in the URL so back/forward,
 * refresh and shared links land on the same page. `prefix` keeps two lists on one page apart.
 * The page is clamped to the last valid one, so a smaller list or a larger page size never
 * leaves the reader on an empty page; filters reset it by removing `${prefix}page`.
 */
export function usePaged<T>(items: T[], { prefix = '', defaultSize = 20 }: { prefix?: string; defaultSize?: number } = {}) {
  const [params, setParams] = useSearchParams()
  const pageKey = `${prefix}page`
  const sizeKey = `${prefix}size`
  const rawSize = Number(params.get(sizeKey))
  const size = PAGE_SIZES.includes(rawSize) ? rawSize : defaultSize
  const pages = Math.max(1, Math.ceil(items.length / size))
  const page = Math.min(Math.max(1, Number(params.get(pageKey)) || 1), pages)

  const write = useCallback(
    (changes: Record<string, string | null>) =>
      setParams(
        (p) => {
          const n = new URLSearchParams(p)
          for (const [k, v] of Object.entries(changes)) {
            if (v === null) n.delete(k)
            else n.set(k, v)
          }
          return n
        },
        { replace: true, preventScrollReset: true },
      ),
    [setParams],
  )

  const setPage = useCallback((n: number) => write({ [pageKey]: n <= 1 ? null : String(n) }), [write, pageKey])
  // A new size keeps the first row the reader was looking at on screen.
  const setSize = useCallback(
    (n: number) => {
      const first = (page - 1) * size
      const next = Math.floor(first / n) + 1
      write({ [sizeKey]: n === defaultSize ? null : String(n), [pageKey]: next <= 1 ? null : String(next) })
    },
    [write, page, size, sizeKey, pageKey, defaultSize],
  )

  return {
    page,
    size,
    pages,
    total: items.length,
    rows: items.slice((page - 1) * size, page * size),
    setPage,
    setSize,
    pageKey,
  }
}
