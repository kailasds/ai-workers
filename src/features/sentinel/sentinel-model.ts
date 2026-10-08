export const DIMENSIONS = [
  { key: 'monitor', name: 'Monitor', question: 'Is every Worker watched?', purpose: 'Watches oversight and learning of every Worker and raises a fleet signal when something leaves its normal range. It decides nothing itself.', panel: 'Fleet watch', empty: 'No Worker is reporting, so nothing is being watched yet.' },
  { key: 'enforce', name: 'Enforce', question: 'Do all Workers stay inside the rules?', purpose: 'Caps every Worker’s Sentinel with the platform rules and refuses anything that would cross a tenant, customer or reach boundary, naming the rule.', panel: 'Rules in force', empty: 'The platform sets no bounds, managed values or directives. Sharing is declared, not active.' },
  { key: 'align', name: 'Align', question: 'Better at the work, or at the score?', purpose: 'Finds misalignment that only shows across Workers: one harness teaching the score, tampering on one version, lessons that do not fit where they were shared.', panel: 'Patterns across Workers', empty: 'No cross-Worker pattern has been recorded.' },
  { key: 'control', name: 'Control', question: 'How much may the fleet do right now?', purpose: 'Changes what Workers may do, smallest scope first. Restores need evidence or a person.', panel: 'In force and harness switches', empty: 'Nothing is in force and no harness is blocked.' },
  { key: 'unlearn', name: 'Unlearn', question: 'When a lesson is withdrawn, who lets go?', purpose: 'Decides for each Worker that received a withdrawn lesson whether it withholds it too, from that Worker’s own evidence.', panel: 'Withdrawn shared items', empty: 'No shared lesson has been withdrawn.' },
] as const

export const SEVERITY_WORDS: Record<string, string> = { '0': 'signal', '1': 'warning', '2': 'restriction', '3': 'stop', grant: 'grant' }

/** "1 stop · 2 restrictions open", or "Nothing open" — never "safe" and never a tick. */
export function openPhrase(open: Record<string, number>) {
  const parts = ['3', '2', '1', '0', 'grant'].filter((k) => open[k] > 0).map((k) => `${open[k]} ${SEVERITY_WORDS[k]}${open[k] === 1 ? '' : 's'}`)
  return parts.length ? `${parts.join(' · ')} open` : 'Nothing open'
}

export const SENTINEL_VIEWS = [
  { value: 'overview', label: 'Overview', to: '/sentinel' },
  { value: 'workers', label: 'Workers', to: '/sentinel/workers' },
  { value: 'decisions', label: 'Decisions', to: '/sentinel/decisions' },
  { value: 'policy', label: 'Policy', to: '/sentinel/policy' },
]
