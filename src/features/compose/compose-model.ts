// Compose vocabulary and the declaration catalogue.
//
// Worker types and geographies are served by the capture. Identities and bounded contexts were
// NOT captured (`/compose/worker-identities`, `/compose/bounded-contexts`), so they are
// reconstructed here from the captured Worker records: their context keys and labels, owned
// outcomes, exclusions, harnesses and the modernisation ladder. Nothing below is invented
// beyond that reconstruction.

export const DECISIONS = ['Worker type', 'Identity', 'Bounded context', 'Confirm identity'] as const

export interface IdentityOption {
  key: string
  workerType: string
  label: string
  summary: string
}

export interface ContextOption {
  key: string
  identity: string
  label: string
  outcome: string
  harness: string
  includes: string
  excludes: string[]
  /** The ladder position: each step adds to the previous one. */
  step: number
  adds: string | null
  availability: 'available' | 'in_build'
}

export const IDENTITIES: IdentityOption[] = [
  { key: 'qe-test-script-generation', workerType: 'quality-engineering', label: 'Test Script Generation and Execution', summary: 'Turns written test cases into automation and runs it.' },
  { key: 'integration-modernization', workerType: 'modernization', label: 'Integration modernisation', summary: 'Converts an integration service into target code.' },
]

const MOD_EXCLUDES = [
  'Controllers, repositories, exception classes and utilities',
  'Oracle SOA Suite, which has a conversion Skill but no parser or detection rules',
  'Performance tuning of the generated services',
  'Infrastructure or deployment migration',
  'Changes to the source integration estate',
]
const MOD_OUTCOME =
  'Convert the supplied legacy source into a compiling, testable target-language service that preserves the behaviour and integration contract of the source.'

export const CONTEXTS: ContextOption[] = [
  {
    key: 'qe-testcases-to-executed-scripts',
    identity: 'qe-test-script-generation',
    label: 'Test Automation Script Generation + Test Suite Execution + Reporting',
    outcome:
      'Produce a working automation script for every supplied test case, execute the suite against the deployed application, and report pass, fail or skipped per scenario with the evidence each verdict rests on.',
    harness: 'Quality Engineering Harness',
    includes: 'Test automation from written test cases',
    excludes: ['Test Case Design and verification', 'Test Data Discovery or Reference Data creation', 'Issue Troubleshooting', 'Defect Management'],
    step: 1,
    adds: null,
    availability: 'available',
  },
  {
    key: 'tibco-bw-to-spring-boot-services',
    identity: 'integration-modernization',
    label: 'Converts Integration Service to Target Code',
    outcome: MOD_OUTCOME,
    harness: 'Integration Modernisation Harness',
    includes: 'Service orchestration modernisation',
    excludes: ['Unit testing of the generated services', ...MOD_EXCLUDES],
    step: 1,
    adds: null,
    availability: 'available',
  },
  {
    key: 'tibco-bw-to-spring-boot-services-tests',
    identity: 'integration-modernization',
    label: 'Converts Integration Service to Unit Tested Target Code',
    outcome: MOD_OUTCOME,
    harness: 'Integration Modernisation Harness',
    includes: 'Service orchestration modernisation, with unit tests',
    excludes: ['Integration tests against live endpoints', ...MOD_EXCLUDES],
    step: 2,
    adds: 'Unit tests for the generated services',
    availability: 'available',
  },
  {
    key: 'tibco-bw-to-spring-boot-services-tests-traceability',
    identity: 'integration-modernization',
    label: 'Converts Integration Service to Traced Target Code',
    outcome: MOD_OUTCOME,
    harness: 'Integration Modernisation Harness',
    includes: 'Service orchestration modernisation, with unit tests and traceability',
    excludes: ['Integration tests against live endpoints', ...MOD_EXCLUDES],
    step: 3,
    adds: 'A source-to-target traceability report',
    availability: 'available',
  },
]

export const BUSINESS_DOMAINS = [
  { key: 'insurance', label: 'Insurance', dslPrefix: 'Insurance' },
  { key: 'insurance-claims', label: 'Insurance claims', dslPrefix: 'Insurance > Claims' },
  { key: 'payments', label: 'Payments', dslPrefix: 'Payments' },
  { key: 'commercial-lending', label: 'Commercial lending', dslPrefix: 'Lending' },
]

export const domainOf = (key: string | null) => BUSINESS_DOMAINS.find((d) => d.key === key) ?? null
export const contextOf = (key: string | null) => CONTEXTS.find((c) => c.key === key) ?? null
export const identityOf = (key: string | null) => IDENTITIES.find((i) => i.key === key) ?? null

/** The wider contexts above this one on its ladder (where growth could lead). */
export function widerContexts(contextKey: string) {
  const c = contextOf(contextKey)
  if (!c) return []
  return CONTEXTS.filter((x) => x.identity === c.identity && x.step > c.step)
}

export function slug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 48)
}

/** The identifier path: all four segments, or the flat form when no business domain is chosen (ADR 0074). */
export function spiffePreview(type: string | null, identity: string | null, domain: string | null, context: string | null, name: string) {
  const tail = `${slug(name || 'worker')}-…`
  if (!type || !identity || !context) return 'spiffe://…/worker/…'
  if (!domain) return `spiffe://…/worker/${tail}`
  return `spiffe://…/worker/${type}/${identity}/${domain}/${context}/${tail}`
}

// ── The eight review checkpoints and six stations ────────────────────────────

export type StationKey = 'role_identity' | 'worker_intent' | 'brain' | 'definition_of_done' | 'autonomy' | 'package_deploy'
export type CheckpointKey = 'bounded_context' | 'worker_intent' | 'skills' | 'domain_language' | 'evals' | 'gbrain' | 'definition_of_done' | 'autonomy'

export const STATIONS: { key: StationKey; label: string }[] = [
  { key: 'role_identity', label: 'Role and identity' },
  { key: 'worker_intent', label: 'Worker intent' },
  { key: 'brain', label: 'Brain' },
  { key: 'definition_of_done', label: 'Definition of Done' },
  { key: 'autonomy', label: 'Autonomy' },
  { key: 'package_deploy', label: 'Package and deploy' },
]

export const CHECKPOINTS: { key: CheckpointKey; station: StationKey; title: string; decides: string; button: string; stage: string }[] = [
  { key: 'bounded_context', station: 'role_identity', title: 'Bounded context', decides: 'The identity it is issued under and the one business boundary it works in.', button: 'Confirm bounded context', stage: 'identity' },
  { key: 'worker_intent', station: 'worker_intent', title: 'Worker intent', decides: 'Outcome, procedure and Tools.', button: 'Confirm Worker intent', stage: 'models' },
  { key: 'skills', station: 'brain', title: 'Skills', decides: 'Instructions used during a run.', button: 'Confirm Skills', stage: 'capabilities' },
  { key: 'domain_language', station: 'brain', title: 'Domain Specific Language', decides: 'Business rules for this Worker.', button: 'Confirm domain language', stage: 'capabilities' },
  { key: 'evals', station: 'brain', title: 'EVALs', decides: 'Checks bound to this work.', button: 'Confirm EVALs', stage: 'evaluations' },
  { key: 'gbrain', station: 'brain', title: 'Memory and learning', decides: 'What is kept between runs.', button: 'Confirm memory and learning', stage: 'memory' },
  { key: 'definition_of_done', station: 'definition_of_done', title: 'Definition of Done', decides: 'Every required criterion must be met.', button: 'Confirm Definition of Done', stage: 'definition_of_done' },
  { key: 'autonomy', station: 'autonomy', title: 'Autonomy and Sentinel', decides: 'How far it may act, and what the Sentinel does.', button: 'Confirm autonomy', stage: 'governance' },
]

/** The six steps of the stepper: one per station. Declaration is the first half of step 1. */
export const STEPS: { key: StationKey; label: string; sub: string }[] = [
  { key: 'role_identity', label: 'Bounded context', sub: 'Identity · scope' },
  { key: 'worker_intent', label: 'Worker intent', sub: 'Outcome · harness' },
  { key: 'brain', label: 'Worker Brain', sub: 'Skills · DSL · EVALs' },
  { key: 'definition_of_done', label: 'Definition of Done', sub: 'Release gates' },
  { key: 'autonomy', label: 'Autonomy', sub: 'How far it acts' },
  { key: 'package_deploy', label: 'Package', sub: 'Build and deploy' },
]

export const checkpointsOf = (station: StationKey) => CHECKPOINTS.filter((c) => c.station === station)

/** Readiness sections → the checkpoint that owns them (for drafts the platform reports as BLOCKED). */
export const SECTION_CHECKPOINT: Record<string, CheckpointKey> = {
  purpose: 'worker_intent',
  environment: 'worker_intent',
  models: 'worker_intent',
  capabilities: 'skills',
  memory: 'gbrain',
  learning: 'gbrain',
  definition_of_done: 'definition_of_done',
  governance: 'autonomy',
  interaction: 'autonomy',
}
