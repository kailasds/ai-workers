import { useLayoutEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { Pager } from './pager'

/** No section shows fewer than this many records per page, nor more unless it has room to spare. */
export const SECTION_SIZE = 5

/**
 * A section's records, five at a time, with a pager below once there are more. The page is
 * clamped, so a shorter list never leaves the reader on an empty page. Give it a `key` that
 * changes with the section's filters to start again from the first page.
 *
 * With `fill`, the list takes whatever height its container gives it (a side panel stretched to
 * the main column, say) and shows as many rows as fit there, never fewer than five, so the space
 * is used instead of left blank. The container needs a definite height: a flex column with
 * `flex-1`, as `Panel fill` provides.
 */
export function Paged<T>({
  rows,
  label,
  order = 'ranked',
  className = 'border-t px-5 py-3',
  fill = false,
  children,
}: {
  rows: T[]
  label: string
  order?: 'ranked' | 'time'
  /** Classes for the pager row; the default suits a flush panel. */
  className?: string
  fill?: boolean
  children: (rows: T[], offset: number) => React.ReactNode
}) {
  const [raw, setPage] = useState(1)
  const [fit, setFit] = useState({ rows: SECTION_SIZE, rowHeight: 0 })
  const box = useRef<HTMLDivElement>(null)
  const size = fill ? fit.rows : SECTION_SIZE
  const pages = Math.max(1, Math.ceil(rows.length / size))
  const page = Math.min(raw, pages)
  const offset = (page - 1) * size

  useLayoutEffect(() => {
    const el = box.current
    if (!fill || !el) return
    const measure = () => {
      const list = el.firstElementChild
      const n = list?.children.length ?? 0
      if (!list || n === 0) return
      const rowHeight = list.scrollHeight / n
      const next = Math.max(SECTION_SIZE, Math.floor(el.clientHeight / rowHeight))
      setFit((f) => (f.rows === next && Math.abs(f.rowHeight - rowHeight) < 1 ? f : { rows: next, rowHeight }))
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    // The rows may have no size yet on the first pass (fonts, a viewport change): measure again when they do.
    if (el.firstElementChild) ro.observe(el.firstElementChild)
    return () => ro.disconnect()
  }, [fill, rows.length])

  const list = children(rows.slice(offset, offset + size), offset)
  return (
    <>
      {fill ? (
        // The list sits out of flow so it never stretches the column it is measuring.
        <div className="relative min-h-0 flex-1" style={{ minHeight: fit.rowHeight ? fit.rowHeight * Math.min(SECTION_SIZE, rows.length) : undefined }}>
          <div ref={box} className="absolute inset-0 overflow-hidden">{list}</div>
        </div>
      ) : (
        list
      )}
      {rows.length > size && (
        <div className={cn(className)}>
          <Pager page={page} pageSize={size} total={rows.length} onPage={setPage} order={order} label={label} />
        </div>
      )}
    </>
  )
}
