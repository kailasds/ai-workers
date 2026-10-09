import { Boxes, Brain, BrainCircuit, Gauge, Hammer, KeyRound, Package, Send, ShieldCheck, Users, type LucideIcon } from 'lucide-react'

export interface NavItem {
  label: string
  to: string
  icon: LucideIcon
  /** The question the area answers, shown under its label in the rail. */
  question: string
  /** One line on what the area is for; shown in the command menu and on placeholder pages. */
  purpose: string
  /** Hidden (not disabled) unless the session holds this feature. */
  feature?: string
}

export interface NavGroup {
  label: string
  items: NavItem[]
}

// The rail follows the questions people ask rather than the order the code grew:
// what is happening → what do I build and ship → what do Workers know → can I trust it.
// Labels keep the product's own vocabulary.
export const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Operate',
    items: [
      { label: 'Dashboard', to: '/dashboard', icon: Gauge, question: "What's happening across my Workers?", purpose: 'What Workers delivered, whether they met their Definition of Done, and what it cost.' },
      { label: 'Registry', to: '/workers', icon: Users, question: 'What Workers do I have?', purpose: 'Find, triage and manage every Worker, its runtimes and customer packages.' },
    ],
  },
  {
    label: 'Build and ship',
    items: [
      { label: 'Compose', to: '/compose', icon: Hammer, question: 'What Worker do I want to create?', purpose: 'Create a Worker: declare its work, then confirm each part it is assembled from.' },
      { label: 'Packaging', to: '/packaging', icon: Package, question: 'What is ready to ship?', purpose: 'Seal composed Workers into versioned Packages.' },
      { label: 'Customer delivery', to: '/customer-delivery', icon: Send, question: 'What has gone to customers?', purpose: 'Prepare a Package for a named customer and track what has gone out.' },
    ],
  },
  {
    label: 'Knowledge',
    items: [
      { label: 'Knowledge', to: '/knowledge', icon: Brain, question: 'What is available, and where?', purpose: 'The library of what TCS knows: Skills, languages, EVALs, Definition of Done.' },
      { label: 'Learning', to: '/learning', icon: BrainCircuit, question: 'What are Workers learning?', purpose: 'What Workers added by running, and whether it was accepted.' },
    ],
  },
  {
    label: 'Govern',
    items: [
      { label: 'Sentinel', to: '/sentinel', icon: ShieldCheck, question: 'What needs review or control?', purpose: 'Oversight: what needs a decision, why, and what was decided.' },
      { label: 'Harnesses', to: '/harnesses', icon: Boxes, question: 'Where do Workers run?', purpose: 'Build and certify the execution harnesses Workers run on.' },
    ],
  },
]

export const ADMIN_ITEM: NavItem = {
  label: 'User management',
  to: '/admin/people',
  icon: KeyRound,
  question: 'Who has access, and to what?',
  purpose: 'Onboard people, roles and groups.',
  feature: 'users.manage',
}

/** The rail's flat order (no section labels): build-and-ship flow first, then the library and oversight. */
const RAIL_ORDER = ['/dashboard', '/compose', '/packaging', '/customer-delivery', '/workers', '/knowledge', '/learning', '/sentinel', '/harnesses']
export const RAIL_ITEMS: NavItem[] = RAIL_ORDER.map((to) => NAV_GROUPS.flatMap((g) => g.items).find((i) => i.to === to)!)

export const ALL_NAV_ITEMS: NavItem[] = [...NAV_GROUPS.flatMap((g) => g.items), ADMIN_ITEM]

export function isActivePath(pathname: string, to: string) {
  return pathname === to || pathname.startsWith(`${to}/`)
}
