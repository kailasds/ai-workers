import { Boxes, Brain, BrainCircuit, Gauge, Hammer, KeyRound, Package, Send, ShieldCheck, Users, type LucideIcon } from 'lucide-react'

export interface NavItem {
  label: string
  to: string
  icon: LucideIcon
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
      { label: 'Dashboard', to: '/dashboard', icon: Gauge, purpose: 'What Workers delivered, whether they met their Definition of Done, and what it cost.' },
      { label: 'Registry', to: '/workers', icon: Users, purpose: 'Find, triage and manage every Worker, its runtimes and customer packages.' },
    ],
  },
  {
    label: 'Build and ship',
    items: [
      { label: 'Compose', to: '/compose', icon: Hammer, purpose: 'Create a Worker: declare its work, then confirm each part it is assembled from.' },
      { label: 'Packaging', to: '/packaging', icon: Package, purpose: 'Seal composed Workers into versioned Packages.' },
      { label: 'Customer delivery', to: '/customer-delivery', icon: Send, purpose: 'Prepare a Package for a named customer and track what has gone out.' },
    ],
  },
  {
    label: 'Knowledge',
    items: [
      { label: 'Knowledge', to: '/knowledge', icon: Brain, purpose: 'The library of what TCS knows: Skills, languages, EVALs, Definition of Done.' },
      { label: 'Learning', to: '/learning', icon: BrainCircuit, purpose: 'What Workers added by running, and whether it was accepted.' },
    ],
  },
  {
    label: 'Govern',
    items: [
      { label: 'Sentinel', to: '/sentinel', icon: ShieldCheck, purpose: 'Oversight: what needs a decision, why, and what was decided.' },
      { label: 'Harnesses', to: '/harnesses', icon: Boxes, purpose: 'Build and certify the execution harnesses Workers run on.' },
    ],
  },
]

export const ADMIN_ITEM: NavItem = {
  label: 'User management',
  to: '/admin/people',
  icon: KeyRound,
  purpose: 'Onboard people, roles and groups.',
  feature: 'users.manage',
}

export const ALL_NAV_ITEMS: NavItem[] = [...NAV_GROUPS.flatMap((g) => g.items), ADMIN_ITEM]

export function isActivePath(pathname: string, to: string) {
  return pathname === to || pathname.startsWith(`${to}/`)
}
