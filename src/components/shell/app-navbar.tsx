import { Link, useLocation, useNavigate } from 'react-router'
import { ChevronDown, Hexagon, LogOut, Search } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { initials, MOCK_SESSION } from '@/lib/session'
import { cn } from '@/lib/utils'
import { ADMIN_ITEM, isActiveItem, MAIN_MENUS } from './nav'

// The frame's top strip (design.md §6, white): the mark on the left, the two main menus in the
// centre, the person's own controls on the right. Active menu = a filled navy item (design.md §8 Rail).

function Wordmark() {
  return (
    <Link to="/workers" aria-label="AI Worker Platform — Home" className="flex w-fit items-center gap-2.5 rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
      <span aria-hidden="true" className="grid size-8 shrink-0 place-items-center rounded-lg bg-brand text-brand-foreground">
        <Hexagon className="size-[18px]" />
      </span>
      <span className="leading-none max-md:hidden">
        <span className="block text-[1.0625rem] font-medium text-foreground">AI Worker</span>
        <span className="mt-1 block text-meta text-subtle-foreground">Platform</span>
      </span>
    </Link>
  )
}

function MainMenus() {
  const { pathname } = useLocation()
  return (
    <nav aria-label="Main">
      <ul className="flex items-center gap-1 rounded-block bg-muted p-1">
        {MAIN_MENUS.map((m) => {
          const active = isActiveItem(pathname, m)
          return (
            <li key={m.to}>
              <Link
                to={m.to}
                aria-current={active ? 'page' : undefined}
                title={m.question}
                className={cn(
                  'flex h-10 items-center gap-2 rounded-lg px-3 text-item outline-none focus-visible:ring-3 focus-visible:ring-ring/50 sm:px-5 [&>svg]:size-[18px]',
                  active ? 'bg-primary text-primary-foreground' : 'text-sidebar-foreground hover:bg-card hover:text-foreground',
                )}
              >
                <m.icon aria-hidden="true" />
                {m.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

function UserMenu({ onOpenCommand }: { onOpenCommand: () => void }) {
  const navigate = useNavigate()
  const s = MOCK_SESSION
  const canAdmin = !ADMIN_ITEM.feature || s.features.includes(ADMIN_ITEM.feature)
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={`Account: ${s.displayName}`}
          className="flex items-center gap-2.5 rounded-block p-1 pr-2 text-left outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 data-[state=open]:bg-muted"
        >
          {/* design.md §8: avatars are 12px-radius squares on cyan-strong (white text holds AA). */}
          <span aria-hidden="true" className="grid size-9 shrink-0 place-items-center rounded-block bg-brand-strong text-meta font-medium text-brand-foreground">{initials(s.displayName)}</span>
          <span className="min-w-0 leading-tight max-lg:hidden">
            <span className="block max-w-40 truncate text-item">{s.displayName}</span>
            <span className="block text-meta text-muted-foreground">{s.roleLabel}</span>
          </span>
          <ChevronDown className="size-4 text-muted-foreground max-sm:hidden" aria-hidden="true" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="font-normal">
          <span className="block text-item text-foreground">{s.displayName}</span>
          <span className="block text-meta text-muted-foreground">{s.roleLabel}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={onOpenCommand}>
          <Search aria-hidden="true" />
          Jump to…
          <DropdownMenuShortcut>Ctrl K</DropdownMenuShortcut>
        </DropdownMenuItem>
        {canAdmin && (
          <DropdownMenuItem onSelect={() => navigate(ADMIN_ITEM.to)}>
            <ADMIN_ITEM.icon aria-hidden="true" />
            {ADMIN_ITEM.label}
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => navigate('/login')}>
          <LogOut aria-hidden="true" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function AppNavbar({ onOpenCommand }: { onOpenCommand: () => void }) {
  return (
    <header className="sticky top-0 z-30 bg-sidebar">
      <div className="grid h-16 grid-cols-[1fr_auto_1fr] items-center gap-3 px-3 sm:px-5">
        <Wordmark />
        <MainMenus />
        <div className="flex justify-end">
          <UserMenu onOpenCommand={onOpenCommand} />
        </div>
      </div>
    </header>
  )
}
