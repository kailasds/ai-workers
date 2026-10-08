// Product words for keys that arrive raw on the wire (domain-model.md §3, §7). A key with no
// known name is shown as-is rather than guessed (P-18: names beat keys, keys if nothing resolves).

const WORKER_TYPES: Record<string, string> = {
  'quality-engineering': 'Quality Engineering Worker',
  modernization: 'Modernisation Worker',
  'software-engineering': 'Full Stack Software Engineering Worker',
}

const OPERATING_MODES: Record<string, string> = {
  propose: 'Propose: suggests, a person acts',
  approval: 'Approval: acts after a person approves',
  bounded: 'Bounded: acts on its own inside its scope',
  autonomous: 'Autonomous',
}

const DOMAINS: Record<string, string> = { insurance: 'Insurance', payments: 'Payments' }

export const workerTypeLabel = (key: string) => WORKER_TYPES[key] ?? key
export const operatingModeLabel = (key: string | null) => (key ? (OPERATING_MODES[key] ?? key) : null)
export const domainLabel = (key: string | null) => (key ? (DOMAINS[key] ?? key) : null)

export const PACKAGE_STATUS: Record<string, { label: string; tone: 'neutral' | 'info' | 'danger' }> = {
  DRAFT_QUEUED: { label: 'Queued', tone: 'info' },
  DRAFT_PREPARING: { label: 'Building', tone: 'info' },
  DRAFT_READY: { label: 'Ready', tone: 'neutral' },
  DRAFT_FAILED: { label: 'Build failed', tone: 'danger' },
  ARCHIVED: { label: 'Archived', tone: 'neutral' },
}

/** Readiness issue sections, in the words Compose uses. */
export const READINESS_SECTIONS: Record<string, string> = {
  purpose: 'Purpose',
  capabilities: 'Capabilities',
  environment: 'Environment',
  models: 'Models',
  memory: 'Memory',
  learning: 'Learning',
  interaction: 'Interaction',
  definition_of_done: 'Definition of Done',
  governance: 'Governance',
  safety: 'Safety',
  package: 'Package',
}
