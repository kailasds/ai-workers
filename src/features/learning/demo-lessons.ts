// Demo learning content. The snapshot has no facts or techniques and only a handful of patterns,
// so these lessons fill the taxonomy for the prototype. Each one is attached to a real run of a
// real Worker (its time and evidence come from that run) and is marked `demo` wherever it shows.
// A lesson key shared by several Workers is what links them as related learning.

import type { CategoryKey } from './model'

export interface Lesson {
  key: string
  category: Extract<CategoryKey, 'facts' | 'techniques' | 'patterns'>
  title: string
  summary: string
  why: string
}

type WorkerKind = 'quality-engineering' | 'modernization'

export const LESSONS: Record<WorkerKind, Lesson[]> = {
  'quality-engineering': [
    { key: 'qe-login-redirect', category: 'facts', title: 'Claims portal login redirects twice before the form loads', summary: 'The login page sends the browser through two redirects before the sign-in form is ready.', why: 'Scripts that looked for the form after the first redirect failed to find it.' },
    { key: 'qe-date-format', category: 'facts', title: 'Quote form date fields expect DD/MM/YYYY', summary: 'Every date input on the quote form rejects month-first dates.', why: 'Test data in month-first format was rejected by the form during the run.' },
    { key: 'qe-search-paging', category: 'facts', title: 'Policy search pages results at 25 rows', summary: 'Search results show 25 policies per page; anything beyond needs the next page.', why: 'An assertion on a 40-row result set only found the first 25.' },
    { key: 'qe-premium-rounding', category: 'facts', title: 'Premium calculator rounds to two decimals on submit', summary: 'The displayed premium changes from four decimals to two when the form is submitted.', why: 'An exact-value check failed by a fraction of a cent.' },
    { key: 'qe-wait-grid', category: 'techniques', title: 'Wait for the claims grid to finish loading before asserting rows', summary: 'Assert on the grid only after its loading indicator has gone.', why: 'Row counts taken while the grid was still loading were wrong.' },
    { key: 'qe-one-scenario', category: 'techniques', title: 'Write one Gherkin scenario per acceptance criterion', summary: 'Each acceptance criterion gets its own scenario, so a failure points to one criterion.', why: 'Scenarios covering several criteria hid which one had failed.' },
    { key: 'qe-test-ids', category: 'techniques', title: 'Prefer data-test ids over CSS paths in page objects', summary: 'Locate elements by their data-test id; fall back to CSS only where none exists.', why: 'CSS-path locators broke when the layout changed between runs.' },
    { key: 'qe-retry-upload', category: 'patterns', title: 'Document upload step is flaky on the first attempt', summary: 'The upload step fails on its first try in some runs and passes on a retry.', why: 'Seen across several runs; kept as a pattern once enough runs agree.' },
  ],
  modernization: [
    { key: 'mod-jms-topic', category: 'facts', title: 'NotifyLoss publishes to the claims.loss.notified topic', summary: 'The NotifyLoss process sends its event to the JMS topic claims.loss.notified.', why: 'The converted service needed the same topic to stay compatible with listeners.' },
    { key: 'mod-empty-null', category: 'facts', title: 'TIBCO mappers treat empty strings as null', summary: 'An empty string in a TIBCO mapping arrives as null in the next activity.', why: 'The converted code kept empty strings and a downstream check failed.' },
    { key: 'mod-soap-faults', category: 'facts', title: 'SOAP fault codes map to HTTP 4xx in the target contract', summary: 'Client-side SOAP faults become 4xx responses in the REST contract.', why: 'Equivalence scoring flagged mismatched error responses.' },
    { key: 'mod-keep-transport', category: 'techniques', title: 'Keep the SOAP over JMS transport when the contract is scored', summary: 'Preserve the original transport unless the target explicitly changes it.', why: 'Replacing SOAP over JMS with REST lowered the functional-equivalence score.' },
    { key: 'mod-tests-first', category: 'techniques', title: 'Generate unit tests from process fixtures before converting', summary: 'Build the unit tests from the source process’s fixtures first, then convert.', why: 'Tests written after conversion missed behaviour the fixtures covered.' },
    { key: 'mod-global-vars', category: 'techniques', title: 'Convert TIBCO global variables to Spring configuration properties', summary: 'Global variables become typed configuration properties in the Spring service.', why: 'Hard-coded values from global variables broke when environments changed.' },
    { key: 'mod-unit-coverage', category: 'patterns', title: 'Generated unit tests fall short on error branches', summary: 'Unit-test coverage drops on exception paths across conversions.', why: 'Seen across several runs; kept as a pattern once enough runs agree.' },
  ],
}

/** A Worker type's lessons interleaved by category (fact, technique, pattern, fact, …). */
const ORDER = Object.fromEntries(
  Object.entries(LESSONS).map(([kind, pool]) => {
    const by = (c: Lesson['category']) => pool.filter((l) => l.category === c)
    const lists = [by('facts'), by('techniques'), by('patterns')]
    const out: Lesson[] = []
    for (let i = 0; out.length < pool.length; i++) for (const list of lists) if (list[i]) out.push(list[i])
    return [kind, out]
  }),
) as Record<WorkerKind, Lesson[]>

/**
 * The lesson a run teaches, if any: every other run of a Worker teaches one, taken in turn from
 * its type's interleaved list by `seq` (a count kept per Worker type), so the split stays even.
 */
export function lessonsForRun(kind: string, runIndex: number, seq: number): Lesson[] {
  const pool = ORDER[kind as WorkerKind]
  if (!pool || runIndex % 2 === 1) return []
  return [pool[seq % pool.length]]
}
