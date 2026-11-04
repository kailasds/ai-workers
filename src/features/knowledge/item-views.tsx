import { Link } from 'react-router'
import { Bot, BookText, Brain, Briefcase, Building2, ClipboardCheck, Code, Eye, FileCheck2, FileOutput, FolderTree, Gauge, GitCommitVertical, Globe2, KeyRound, ListOrdered, PencilLine, Scale, ShieldCheck, Sigma, Sparkles, Tags, Target, UserRound, Wrench, type LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/platform/status-badge'
import type { Hue } from '@/components/platform/hue'
import { formatPercent } from '@/lib/format'
import type { DodRubric, DslDomain, Evaluation, KnowledgeSkill } from '@/lib/types/catalog'
import { human, Mono } from './list-parts'

// Each Knowledge item, read as one details page: a header, four headline facts, then one panel
// with a summary, its remaining facts and its parts. Built here so every library reads the same.

export const METHOD: Record<string, string> = {
  llm_judge: 'Judged by a model',
  harness_metric: 'Measured by the harness',
  code_skill: 'Decided by code',
  external_tool: 'Measured by an external tool',
}
export const METHOD_ICON: Record<string, LucideIcon> = { llm_judge: Sparkles, harness_metric: Gauge, code_skill: Code, external_tool: Wrench }
export const AVAILABILITY: Record<string, string> = {
  AVAILABLE: 'Measurable',
  REQUIRES_TOOL: 'Needs a tool',
  NOT_IMPLEMENTED: 'Can’t be measured yet',
}
const STAT_LABELS: Record<string, string> = {
  entities: 'Entities',
  individual_rules: 'Rules',
  axioms: 'Axioms',
  metrics: 'Metrics',
  process_steps: 'Process steps',
  hybrid_rules: 'Hybrid rules',
  deterministic_rules: 'Deterministic rules',
  non_deterministic_rules: 'Non-deterministic rules',
  discovery_patterns: 'Discovery patterns',
  rule_categories: 'Rule categories',
  class_codes: 'Class codes',
}
export const isDod = (s: KnowledgeSkill) => s.skill_type === 'definition_of_done'
export const workers = (n: number) => (n === 0 ? 'No Workers' : `${n} ${n === 1 ? 'Worker' : 'Workers'}`)
export const areaOf = (d: DslDomain) => (d.path.includes(' > ') ? d.path.split(' > ')[0] : 'Uncategorised')

/** The URL of one library item's details page. */
export const knowledgeItemTo = (view: 'skills' | 'languages' | 'evals' | 'dod', id: string) => `/knowledge/${view}/${encodeURIComponent(id)}`

export interface ItemView {
  title: string
  icon: LucideIcon
  hue: Hue
  badges: React.ReactNode
  actions?: React.ReactNode
  strip: { icon: LucideIcon; label: string; value: React.ReactNode }[]
  summary: React.ReactNode
  facts: { label: string; value: React.ReactNode }[]
  parts: { icon: LucideIcon; title: string; body: React.ReactNode }[]
  note?: string
}

const Chips = ({ items }: { items: string[] }) => <div className="flex flex-wrap gap-2 px-5 py-4">{items.map((t) => <span key={t} className="rounded-full bg-chip-neutral px-2.5 py-0.5 text-meta">{t}</span>)}</div>

export function skillView(skill: KnowledgeSkill): ItemView {
  const loadable = skill.assigned_agent_keys.length > 0
  return {
    title: skill.title,
    icon: isDod(skill) ? ClipboardCheck : Brain,
    hue: isDod(skill) ? 'amber' : 'violet',
    badges: (
      <>
        <StatusBadge tone={['live', 'active', 'published'].includes(skill.status.toLowerCase()) ? 'success' : 'neutral'}>{human(skill.status)}</StatusBadge>
        {!loadable && <StatusBadge tone="warning">Not yet loadable</StatusBadge>}
      </>
    ),
    actions: <Button asChild variant="outline"><Link to={`/knowledge/capture?revise=${skill.name}`}><PencilLine aria-hidden="true" />Revise this Skill</Link></Button>,
    strip: [
      { icon: FolderTree, label: 'Category', value: human(skill.category) },
      { icon: UserRound, label: 'Carried by', value: workers(skill.worker_count) },
      { icon: Bot, label: 'Loadable by', value: loadable ? `${skill.assigned_agent_keys.length} Agents` : 'Not yet' },
      { icon: GitCommitVertical, label: 'Version', value: `v${skill.version}` },
    ],
    summary: skill.description,
    facts: [
      { label: 'Kind', value: isDod(skill) ? 'Definition of Done' : 'Capability' },
      { label: 'Provenance', value: [skill.provenance === 'internal' ? 'Internal' : 'External', skill.license].filter((x, i, a) => x && a.indexOf(x) === i).join(' · ') },
      ...(skill.source_technology || skill.target_technology ? [{ label: 'Converts', value: `${skill.source_technology ?? '?'} → ${skill.target_technology ?? '?'}` }] : []),
      { label: 'Key', value: <Mono>{skill.name}</Mono> },
    ],
    parts: [
      ...(skill.tags.length ? [{ icon: Tags, title: 'Tags', body: <Chips items={skill.tags} /> }] : []),
      ...(skill.recommended_evaluation_ids.length
        ? [{
            icon: FileCheck2,
            title: `Checked by EVALs · ${skill.recommended_evaluation_ids.length}`,
            body: (
              <ul className="divide-y">
                {skill.recommended_evaluation_ids.slice(0, 5).map((id) => (
                  <li key={id}><Link to={knowledgeItemTo('evals', id)} className="flex items-center gap-3 px-5 py-3 outline-none hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"><FileCheck2 className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" /><Mono>{id}</Mono></Link></li>
                ))}
              </ul>
            ),
          }]
        : []),
    ],
    note: 'Full Skill content isn’t available in this demo.',
  }
}

export function languageView(d: DslDomain): ItemView {
  const stats = Object.entries(d.statistics).filter(([, v]) => v > 0)
  return {
    title: d.name,
    icon: BookText,
    hue: 'blue',
    badges: d.plugin_slug ? <StatusBadge tone="success">Available to Workers</StatusBadge> : <StatusBadge tone="neutral" icon={null}>Not yet available</StatusBadge>,
    strip: [
      { icon: Globe2, label: 'Market', value: d.market ?? 'Not stated' },
      { icon: Building2, label: 'Industry', value: d.industry ?? 'Not stated' },
      { icon: Briefcase, label: 'Lines of business', value: d.lines_of_business.length ? d.lines_of_business.join(', ') : 'All' },
      { icon: GitCommitVertical, label: 'Version', value: `v${d.version}` },
    ],
    summary: `A domain language for ${d.lines_of_business.length ? d.lines_of_business.join(', ') : 'every line of business'}, filed under ${d.path.split(' > ').join(' › ')}.`,
    facts: [{ label: 'Workers use it as', value: d.plugin_slug ? <Mono>{d.plugin_slug}</Mono> : 'Not yet' }],
    parts: stats.length
      ? [{
          icon: Sigma,
          title: 'What it defines',
          body: (
            <dl className="grid grid-cols-2 gap-x-6 gap-y-3 px-5 py-4 sm:grid-cols-4">
              {stats.map(([k, v]) => <div key={k}><dt className="text-meta text-muted-foreground">{STAT_LABELS[k] ?? k}</dt><dd className="text-item tabular-nums">{v}</dd></div>)}
            </dl>
          ),
        }]
      : [],
    note: 'Full rule graph isn’t available in this demo.',
  }
}

export function evalView(e: Evaluation): ItemView {
  return {
    title: e.name,
    icon: e.hard_gate ? ShieldCheck : Gauge,
    hue: e.hard_gate ? 'amber' : 'teal',
    badges: <StatusBadge tone={e.hard_gate ? 'warning' : 'neutral'} icon={null}>{e.hard_gate ? 'Required gate' : 'Measured check'}</StatusBadge>,
    strip: [
      { icon: Target, label: 'Passes at', value: e.pass_threshold !== null ? formatPercent(e.pass_threshold) : 'No threshold' },
      { icon: FolderTree, label: 'Measured as', value: human(e.category) },
      { icon: GitCommitVertical, label: 'Version', value: `v${e.version}` },
      { icon: KeyRound, label: 'Key', value: <Mono>{e.id}</Mono> },
    ],
    summary: e.description?.trim() || 'No description.',
    facts: [],
    parts: [],
  }
}

export function dodView(r: DodRubric): ItemView {
  const blocked = r.availability !== 'AVAILABLE'
  const summary = r.computation?.summary || r.calculation || METHOD[r.method] || r.method
  return {
    title: r.display_name,
    icon: METHOD_ICON[r.method] ?? Gauge,
    hue: r.gating_by_default ? 'amber' : 'blue',
    badges: <StatusBadge tone={blocked ? 'warning' : 'success'}>{AVAILABILITY[r.availability] ?? r.availability}</StatusBadge>,
    strip: [
      { icon: Target, label: 'Passes at', value: r.default_threshold?.trim() || 'No required threshold' },
      { icon: Scale, label: 'Decided by', value: METHOD[r.method] ?? r.method },
      { icon: r.gating_by_default ? ShieldCheck : Eye, label: 'Release role', value: r.gating_by_default ? 'Release gate' : 'Tracked only' },
      { icon: FileOutput, label: 'Reported as', value: <Mono>{r.criterion_key}</Mono> },
    ],
    summary: <>{summary}{blocked && r.availability_detail && <span className="mt-2 block text-warning">{r.availability_detail}</span>}</>,
    facts: [
      ...(r.skill_ref ? [{ label: 'Measured by', value: <Mono>{r.skill_ref}</Mono> }] : []),
      ...(r.aliases.length ? [{ label: 'Also called', value: r.aliases.join(', ') }] : []),
      ...(r.computation?.rule ? [{ label: 'Pass criteria', value: r.computation.rule }] : []),
    ],
    parts: r.computation && r.computation.steps.length
      ? [{
          icon: ListOrdered,
          title: 'How it’s calculated',
          body: (
            <ol className="divide-y">
              {r.computation.steps.map((s, i) => (
                <li key={s} className="flex items-center gap-3 px-5 py-3 text-body">
                  <span className="grid size-6 shrink-0 place-items-center rounded-full bg-chip-neutral text-meta font-medium tabular-nums">{i + 1}</span>
                  <span>{s}</span>
                </li>
              ))}
            </ol>
          ),
        }]
      : [],
    note: r.computation?.summary && r.calculation ? r.calculation : undefined,
  }
}

