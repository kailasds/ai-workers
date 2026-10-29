import type { PlatformSentinelOverview, SentinelLearningFleet } from '@/lib/types/catalog'

export const DIMENSIONS = [
  { key: 'monitor', name: 'Monitor', question: 'Is every Worker watched?', purpose: 'Watches oversight and learning of every Worker and raises a fleet signal when something leaves its normal range. It decides nothing itself.', panel: 'Fleet watch', empty: 'No Workers are reporting yet.' },
  { key: 'enforce', name: 'Enforce', question: 'Do all Workers stay inside the rules?', purpose: 'Caps every Worker’s Sentinel with the platform rules and refuses anything that would cross a tenant, customer or reach boundary, naming the rule.', panel: 'Rules in force', empty: 'No platform limits set.' },
  { key: 'align', name: 'Align', question: 'Better at the work, or at the score?', purpose: 'Finds misalignment that only shows across Workers: one harness teaching the score, tampering on one version, lessons that do not fit where they were shared.', panel: 'Patterns across Workers', empty: 'No patterns across Workers yet.' },
  { key: 'control', name: 'Control', question: 'How much may the fleet do right now?', purpose: 'Changes what Workers may do, smallest scope first. Restores need evidence or a person.', panel: 'In force and harness switches', empty: 'No active restrictions.' },
  { key: 'unlearn', name: 'Unlearn', question: 'When a lesson is withdrawn, who lets go?', purpose: 'Decides for each Worker that received a withdrawn lesson whether it withholds it too, from that Worker’s own evidence.', panel: 'Withdrawn shared items', empty: 'No shared lessons withdrawn.' },
] as const

export const SEVERITY_WORDS: Record<string, string> = { '0': 'signal', '1': 'warning', '2': 'restriction', '3': 'stop', grant: 'grant' }

/** "1 stop · 2 restrictions open", or "Nothing open" — never "safe" and never a tick. */
export function openPhrase(open: Record<string, number>) {
  const parts = ['3', '2', '1', '0', 'grant'].filter((k) => open[k] > 0).map((k) => `${open[k]} ${SEVERITY_WORDS[k]}${open[k] === 1 ? '' : 's'}`)
  return parts.length ? `${parts.join(' · ')} open` : 'Nothing open'
}

export const SENTINEL_VIEWS = [
  { value: 'overview', label: 'Overview', to: '/sentinel' },
  { value: 'sharing', label: 'Sharing', to: '/sentinel/sharing' },
  { value: 'decisions', label: 'Decisions', to: '/sentinel/decisions' },
  { value: 'workers', label: 'Workers', to: '/sentinel/workers' },
  { value: 'policy', label: 'Policy', to: '/sentinel/policy' },
]

/** Sharing between Workers moves through separate states; agreement is not delivery, and delivery is not use. */
export const SHARING_STATES = [
  { key: 'eligible', label: 'Ready for sharing review', meaning: 'Eligible: kept by a Worker’s Sentinel and fits the sharing rules.' },
  { key: 'proposed', label: 'Proposed', meaning: 'Offered to another Worker. Waiting for both Sentinels.' },
  { key: 'agreed', label: 'Agreed', meaning: 'Approved by both Workers’ Sentinels. Nothing has been sent yet.' },
  { key: 'delivered', label: 'Delivered', meaning: 'The receiving Worker has it.' },
  { key: 'used', label: 'Used', meaning: 'A run actually drew on it.' },
] as const

/** The product's sharing rules as they stand (constants of the current platform). */
export const SHARING_RULES = [
  { label: 'Independent Workers needed', value: '2 that found the same thing' },
  { label: 'Definition of Done', value: 'Must be met in the runs it came from' },
  { label: 'What can be shared', value: 'Conversion patterns only' },
  { label: 'Customer material', value: 'Never shared' },
  { label: 'Approval route', value: 'Not built yet' },
]

export interface AttentionItem {
  key: string
  kind: 'monitoring' | 'restriction' | 'review'
  title: string
  /** The Worker affected, when the source names one. */
  worker: { id: string; name: string } | null
  detail: string | null
  /** What it means in practice. */
  consequence: string
  actions: { label: string; to: string }[]
}

export const ATTENTION_KIND: Record<AttentionItem['kind'], string> = {
  monitoring: 'Monitoring',
  restriction: 'In force',
  review: 'Review',
}

/**
 * Everything that needs a person, from real fields only. Monitoring gaps stay here until the
 * Worker reports again, whether or not any decision was recorded. The Overview lists these and
 * the Brain tab count is their number.
 */
export function attentionOf(o: PlatformSentinelOverview, fleet: SentinelLearningFleet | null): AttentionItem[] {
  const items: AttentionItem[] = []
  for (const f of o.in_force) {
    items.push({
      key: `inforce:${f.id}`,
      kind: 'restriction',
      title: f.title,
      worker: null,
      detail: `${f.kind[0].toUpperCase()}${f.kind.slice(1)} · ${f.scope}`,
      consequence: f.effect,
      actions: f.decision_id ? [{ label: 'Open decision', to: `/sentinel/decisions/${f.decision_id}` }] : [],
    })
  }
  if (o.needs_review > 0) {
    items.push({ key: 'review', kind: 'review', title: `${o.needs_review} ${o.needs_review === 1 ? 'decision waits' : 'decisions wait'} for a person`, worker: null, detail: null, consequence: 'Nothing changes until someone reviews it.', actions: [{ label: 'See decisions', to: '/sentinel/decisions' }] })
  }
  const silent = fleet?.workers.filter((w) => w.state === 'RUNNING' && w.status !== 'answering') ?? null
  if (silent) {
    for (const w of silent) {
      items.push({
        key: `silent:${w.composition_id}`,
        kind: 'monitoring',
        title: 'Running, but not reporting to Sentinel',
        worker: { id: w.composition_id, name: w.name },
        detail: w.detail,
        consequence: 'Sentinel can’t check what this Worker learns or does until it reports again.',
        actions: [
          { label: 'Open Worker', to: `/workers/${w.composition_id}?view=sentinel` },
          { label: 'See monitoring', to: '/sentinel/workers?filter=unavailable' },
        ],
      })
    }
  } else if (o.coverage.unavailable > 0) {
    items.push({ key: 'silent', kind: 'monitoring', title: `${o.coverage.unavailable} running ${o.coverage.unavailable === 1 ? 'Worker isn’t' : 'Workers aren’t'} reporting to Sentinel`, worker: null, detail: null, consequence: 'Sentinel can’t check what they learn or do until they report again.', actions: [{ label: 'See monitoring', to: '/sentinel/workers?filter=unavailable' }] })
  }
  if (o.coverage.no_sentinel > 0) {
    items.push({ key: 'no-sentinel', kind: 'monitoring', title: `${o.coverage.no_sentinel} running ${o.coverage.no_sentinel === 1 ? 'Worker has' : 'Workers have'} no Sentinel`, worker: null, detail: 'Composed without one.', consequence: 'Nothing checks what they keep from their runs.', actions: [{ label: 'See monitoring', to: '/sentinel/workers?filter=no-sentinel' }] })
  }
  return items
}
