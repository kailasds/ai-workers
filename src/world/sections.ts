// Every section the console had, grouped under the place on the campus it belongs to.
// The campus lobbies, the top-bar directory and ⌘K all read this one list.

import {
  BookOpen, Boxes, Brain, BrainCircuit, ClipboardCheck, Cpu, FileCode2, FilePlus2, FolderOpen, Gauge, GitPullRequestArrow, Hammer, Inbox, KeyRound,
  Layers, ListChecks, PackageCheck, PackageOpen, PenLine, Radar, Rocket, Scale, Send, ShieldCheck, ShieldAlert, Sparkles, Undo2, Users, UsersRound,
  Workflow, type LucideIcon,
} from 'lucide-react'
import type { WorldData } from './world-data'

export interface Section {
  label: string
  to: string
  hint: string
  icon: LucideIcon
  count?: (w: WorldData) => number | null
}

export interface SectionGroup {
  label?: string
  sections: Section[]
}

export interface PlaceDirectory {
  key: string
  name: string
  /** What the place is, in the product's words. */
  title: string
  blurb: string
  color: string
  icon: LucideIcon
  groups: SectionGroup[]
}

export const DIRECTORY: PlaceDirectory[] = [
  {
    key: 'outcomes',
    name: 'Outcomes',
    title: 'Dashboard',
    blurb: 'Did the Workers do the job, and what did it cost?',
    color: '#7aa7ff',
    icon: Gauge,
    groups: [{ sections: [{ label: 'Outcomes dashboard', to: '/dashboard', hint: 'Definition of Done, cost, contexts and runs', icon: Gauge }] }],
  },
  {
    key: 'registry',
    name: 'Teams',
    title: 'Registry',
    blurb: 'Every Worker, by the bounded context it works in.',
    color: '#3b82f6',
    icon: Users,
    groups: [
      {
        sections: [
          { label: 'All Workers', to: '/workers', hint: 'Find, triage and manage every Worker', icon: Users, count: (w) => w.totals.workers },
          { label: 'Customer packages', to: '/workers?view=customer', hint: 'Packages prepared for customers', icon: PackageOpen, count: (w) => w.deliveries },
        ],
      },
    ],
  },
  {
    key: 'build',
    name: 'Build bay',
    title: 'Compose',
    blurb: 'Where a Worker is declared and assembled, part by part.',
    color: '#38bdf8',
    icon: Hammer,
    groups: [
      {
        sections: [
          { label: 'Compose a Worker', to: '/compose', hint: 'Declare its work and where it stops', icon: FilePlus2 },
          { label: 'Saved drafts', to: '/compose/drafts', hint: 'Pick up a Worker in progress', icon: FolderOpen, count: (w) => w.drafts.inBuild },
        ],
      },
    ],
  },
  {
    key: 'dock',
    name: 'Loading dock',
    title: 'Packaging and delivery',
    blurb: 'Composed Workers are sealed into Packages and sent to customers.',
    color: '#f472b6',
    icon: PackageCheck,
    groups: [
      {
        label: 'Packaging',
        sections: [
          { label: 'To package', to: '/packaging', hint: 'Composed and waiting to be built', icon: Layers },
          { label: 'Packaged', to: '/packaging?queue=packaged', hint: 'Built, waiting to deploy', icon: PackageCheck },
          { label: 'Deployed', to: '/packaging?queue=deployed', hint: 'Packages running somewhere', icon: Rocket },
        ],
      },
      {
        label: 'Customer delivery',
        sections: [
          { label: 'To prepare', to: '/customer-delivery', hint: 'Packages not yet prepared for a customer', icon: Send },
          { label: 'Prepared packages', to: '/customer-delivery?view=delivered', hint: 'Transfer evidence and acknowledgement', icon: ClipboardCheck, count: (w) => w.deliveries },
        ],
      },
    ],
  },
  {
    key: 'brain',
    name: 'Platform brain',
    title: 'Knowledge and learning',
    blurb: 'What every Worker can draw on, and what Workers have learned.',
    color: '#7dd3fc',
    icon: Brain,
    groups: [
      {
        label: 'Knowledge',
        sections: [
          { label: 'Skills', to: '/knowledge/skills', hint: 'Instructions a Worker uses during a run', icon: FileCode2, count: (w) => w.brain.skills },
          { label: 'Domain languages', to: '/knowledge/languages', hint: 'Business rules by domain', icon: BookOpen, count: (w) => w.brain.languages },
          { label: 'EVAL Playbooks', to: '/knowledge/evals', hint: 'Checks bound to the work', icon: ListChecks, count: (w) => w.brain.evals },
          { label: 'Definition of Done', to: '/knowledge/dod', hint: 'Release criteria and thresholds', icon: ClipboardCheck, count: (w) => w.brain.dod },
          { label: 'SLM Farm', to: '/knowledge/models', hint: 'Small models available to Workers', icon: Cpu },
          { label: 'Write a Skill', to: '/knowledge/capture', hint: 'Capture new knowledge', icon: PenLine },
        ],
      },
      {
        label: 'Governance',
        sections: [
          { label: 'Coverage', to: '/knowledge/coverage', hint: 'What a Worker can retrieve, construct by construct', icon: Radar },
          { label: 'Candidate decisions', to: '/knowledge/inbox', hint: 'Promote, defer or reject candidates', icon: Inbox },
          { label: 'Packs', to: '/knowledge/packs', hint: 'Published versions and their regression result', icon: Boxes },
        ],
      },
      {
        label: 'Learning',
        sections: [
          { label: 'Workers learning', to: '/learning', hint: 'What each Worker added by running', icon: BrainCircuit, count: (w) => w.learningWorkers },
          { label: 'Shared learning', to: '/learning/shared', hint: 'What crossed from one Worker to others', icon: Sparkles },
        ],
      },
    ],
  },
  {
    key: 'sentinel',
    name: 'Sentinel',
    title: 'Oversight',
    blurb: 'Every learning passes through here before it reaches the platform.',
    color: '#fbbf24',
    icon: ShieldCheck,
    groups: [
      {
        sections: [
          { label: 'Overview', to: '/sentinel', hint: 'Posture across the five dimensions', icon: ShieldCheck },
          { label: 'Workers', to: '/sentinel/workers', hint: 'Who is watched; stop a Worker', icon: UsersRound },
          { label: 'Decisions', to: '/sentinel/decisions', hint: 'What was decided and why', icon: Scale, count: (w) => w.sentinel.needsReview },
          { label: 'Policy', to: '/sentinel/policy', hint: 'The rules in force', icon: ShieldAlert },
        ],
      },
      {
        label: 'Dimensions',
        sections: [
          { label: 'Monitor', to: '/sentinel/monitor', hint: 'Is every Worker watched?', icon: Radar },
          { label: 'Enforce', to: '/sentinel/enforce', hint: 'Do all Workers stay inside the rules?', icon: ShieldAlert },
          { label: 'Align', to: '/sentinel/align', hint: 'Better at the work, or at the score?', icon: Scale },
          { label: 'Control', to: '/sentinel/control', hint: 'How much may the fleet do right now?', icon: GitPullRequestArrow },
          { label: 'Unlearn', to: '/sentinel/unlearn', hint: 'When a lesson is withdrawn, who lets go?', icon: Undo2 },
        ],
      },
    ],
  },
  {
    key: 'workshop',
    name: 'Workshop',
    title: 'Harnesses',
    blurb: 'The execution harnesses Workers run on, and how they are certified.',
    color: '#94a3b8',
    icon: Boxes,
    groups: [
      {
        sections: [
          { label: 'Catalogue', to: '/harnesses', hint: 'Harnesses and their manifests', icon: Boxes, count: (w) => w.harnesses },
          { label: 'Certification guide', to: '/harnesses/certify', hint: 'How a harness is admitted', icon: ClipboardCheck },
          { label: 'Conformance', to: '/harnesses/conformance', hint: 'The 15-check reports', icon: ListChecks },
          { label: 'SDK reference', to: '/harnesses/sdk/overview', hint: 'Build a harness', icon: Workflow },
        ],
      },
    ],
  },
  {
    key: 'admin',
    name: 'User management',
    title: 'People and access',
    blurb: 'Who can use the platform, and what they may do.',
    color: '#a5b4fc',
    icon: KeyRound,
    groups: [
      {
        sections: [
          { label: 'People', to: '/admin/people', hint: 'Invite people and set their role', icon: UsersRound },
          { label: 'Groups', to: '/admin/groups', hint: 'Grant access to many people at once', icon: Users },
        ],
      },
    ],
  },
]

export const directoryOf = (key: string | null) => DIRECTORY.find((d) => d.key === key) ?? null

/** Places that open a lobby (their sections) when clicked on the campus. */
export const LOBBY_KEYS = ['build', 'dock', 'brain', 'sentinel', 'workshop']
