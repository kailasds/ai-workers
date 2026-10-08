import { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

/** P-18: `sha256:abcd…wxyz` style. Short form on screen, full value on hover and in the copy. */
export function shortId(value: string, head = 8, tail = 4) {
  if (value.length <= head + tail + 1) return value
  const [prefix, rest] = value.includes(':') && !value.startsWith('spiffe') && !value.startsWith('aw:') ? [value.slice(0, value.indexOf(':') + 1), value.slice(value.indexOf(':') + 1)] : ['', value]
  return `${prefix}${rest.slice(0, head)}…${rest.slice(-tail)}`
}

export function CopyValue({ value, display, label, className }: { value: string; display?: string; label: string; className?: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <span className={cn('inline-flex max-w-full min-w-0 items-center gap-1', className)}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="truncate font-mono text-meta" tabIndex={0}>
            {display ?? shortId(value)}
          </span>
        </TooltipTrigger>
        <TooltipContent className="max-w-sm font-mono break-all">{value}</TooltipContent>
      </Tooltip>
      <button
        type="button"
        onClick={() => {
          void navigator.clipboard?.writeText(value).then(() => {
            setCopied(true)
            setTimeout(() => setCopied(false), 1500)
          })
        }}
        className="grid size-6 shrink-0 place-items-center rounded-md text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={copied ? `${label} copied` : `Copy ${label}`}
      >
        {copied ? <Check className="size-3.5" aria-hidden="true" /> : <Copy className="size-3.5" aria-hidden="true" />}
      </button>
    </span>
  )
}
