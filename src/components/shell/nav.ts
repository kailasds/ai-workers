import { Boxes, Brain, BrainCircuit, Gauge, GraduationCap, Hammer, House, KeyRound, Package, Send, ShieldCheck, Store, type LucideIcon } from 'lucide-react'

export interface NavItem {
  label: string
  to: string
  icon: LucideIcon
  /** The question the area answers (the navbar item's tooltip). */
  question: string
  /** One line on what the area is for; shown in the command menu and on placeholder pages. */
  purpose: string
  /** Hidden (not disabled) unless the session holds this feature. */
  feature?: string
  /** Other paths that belong to this item, so it stays active on them. */
  owns?: string[]
}

export interface NavGroup {
  label: string
  items: NavItem[]
}

// Every area, in the questions people ask: what is happening → what do I build and ship → what do
// Workers know → can I trust it. The command menu lists these; the navbar shows MAIN_MENUS below.
export const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Operate',
    items: [
      { label: 'Outcomes', to: '/dashboard', icon: Gauge, question: "What did my Workers deliver?", purpose: 'What Workers delivered, whether they met their Definition of Done, and what it cost.' },
      { label: 'Registry', to: '/workers', icon: Store, question: 'Which Workers exist, and where are they?', purpose: 'Every Worker, what is being packaged, and what has gone to customers.', owns: ['/packaging', '/customer-delivery', '/compose', '/dashboard'] },
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

/**
 * The navbar's two main menus. Home holds the whole Worker pipeline (Workers, Packaging and
 * Customer delivery tabs, with Compose and the outcomes report reached from it); Learning holds
 * the library and oversight (Knowledge, Learning, Sentinel and Harnesses tabs).
 */
export const MAIN_MENUS: NavItem[] = [
  { label: 'Home', to: '/workers', icon: House, question: 'Which Workers exist, and what has shipped?', purpose: 'Every Worker, what is being packaged, and what has gone to customers.', owns: ['/packaging', '/customer-delivery', '/compose', '/dashboard'] },
  { label: 'Learning', to: '/knowledge', icon: GraduationCap, question: 'What do Workers know, and can I trust it?', purpose: 'Knowledge, Worker learning, Sentinel oversight and the harnesses Workers run on.', owns: ['/learning', '/sentinel', '/harnesses'] },
]

export const ALL_NAV_ITEMS: NavItem[] = [...NAV_GROUPS.flatMap((g) => g.items), ADMIN_ITEM]

export function isActivePath(pathname: string, to: string) {
  return pathname === to || pathname.startsWith(`${to}/`)
}

export function isActiveItem(pathname: string, item: NavItem) {
  return [item.to, ...(item.owns ?? [])].some((to) => isActivePath(pathname, to))
}
