import type { SVGProps } from 'react'

/**
 * A Worker, drawn as a person at work: head and shoulders with a headset. Same 24px grid and
 * 2px stroke as the Lucide icons beside it, so it sits in any icon slot. The avatar's background
 * colour carries the Worker's context; this glyph only says "a Worker".
 */
export function WorkerGlyph(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <circle cx="12" cy="9" r="3.25" />
      <path d="M5 21v-.5A4.5 4.5 0 0 1 9.5 16h5a4.5 4.5 0 0 1 4.5 4.5v.5" />
      <path d="M5.5 10V9a6.5 6.5 0 0 1 13 0v1" />
      <rect x="4" y="9" width="2.5" height="4" rx="1.25" fill="currentColor" />
      <rect x="17.5" y="9" width="2.5" height="4" rx="1.25" fill="currentColor" />
      <path d="M18.75 13a2.5 2.5 0 0 1-2.5 2.25H14.5" />
    </svg>
  )
}
