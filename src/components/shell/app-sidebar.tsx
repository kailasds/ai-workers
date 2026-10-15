import { Link, useLocation, useNavigate } from 'react-router'
import { ChevronsUpDown, Compass, Hexagon, LogOut, PanelLeftClose, PanelLeftOpen, Search } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { initials, MOCK_SESSION } from '@/lib/session'
import { cn } from '@/lib/utils'
import { ADMIN_ITEM, isActiveItem, MAIN_MENUS, type NavItem } from './nav'

// design.md §8 Rail: a white rail with the mark, one flat list and the person at the bottom.
// Active = a filled navy row with a 3px navy bar on the rail edge. Collapsed, icons only.
function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  const { isMobile, setOpenMobile } = useSidebar()
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        isActive={active}
        tooltip={item.label}
        className="relative h-11 gap-3 rounded-lg px-3 text-item text-sidebar-foreground transition-none hover:bg-sidebar-accent hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:size-11! group-data-[collapsible=icon]:p-3.5! data-active:bg-sidebar-primary data-active:font-normal data-active:text-sidebar-primary-foreground data-active:hover:bg-sidebar-primary data-active:hover:text-sidebar-primary-foreground [&_svg]:size-[18px]!"
      >
        <Link to={item.to} aria-current={active ? 'page' : undefined} onClick={() => isMobile && setOpenMobile(false)}>
          {active && <span aria-hidden="true" className="absolute top-1.5 bottom-1.5 -left-3 w-[3px] rounded-r-full bg-sidebar-primary group-data-[collapsible=icon]:hidden" />}
          <item.icon aria-hidden="true" className={active ? 'text-sidebar-primary-foreground' : 'text-sidebar-muted'} />
          <span className="truncate">{item.label}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

// The mark: a cyan rounded tile holding a white Hexagon, then the name in navy-ink.
function Wordmark() {
  return (
    <Link to="/workers" aria-label="AI Worker Platform — Home" className="flex items-center gap-2.5 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring">
      <span aria-hidden="true" className="grid size-8 shrink-0 place-items-center rounded-lg bg-brand text-brand-foreground">
        <Hexagon className="size-[18px]" />
      </span>
      <span className="leading-none group-data-[collapsible=icon]:hidden">
        <span className="block text-[1.0625rem] font-medium text-foreground">AI Worker</span>
        <span className="mt-1 block text-meta text-subtle-foreground">Platform</span>
      </span>
    </Link>
  )
}

function CollapseToggle() {
  const { state, toggleSidebar, isMobile } = useSidebar()
  if (isMobile) return null
  const collapsed = state === 'collapsed'
  const label = collapsed ? 'Expand sidebar (Ctrl B)' : 'Collapse sidebar (Ctrl B)'
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={toggleSidebar}
          aria-label={label}
          aria-expanded={!collapsed}
          className="grid size-8 shrink-0 place-items-center rounded-lg text-sidebar-muted outline-none hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring"
        >
          {collapsed ? <PanelLeftOpen className="size-[18px]" aria-hidden="true" /> : <PanelLeftClose className="size-[18px]" aria-hidden="true" />}
        </button>
      </TooltipTrigger>
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  )
}

/** The person's own controls, at the foot of the rail. */
function UserMenu({ onOpenCommand, onOpenGuide }: { onOpenCommand: () => void; onOpenGuide: () => void }) {
  const navigate = useNavigate()
  const { isMobile, state } = useSidebar()
  const s = MOCK_SESSION
  const canAdmin = !ADMIN_ITEM.feature || s.features.includes(ADMIN_ITEM.feature)
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={`Account: ${s.displayName}`}
          className="flex w-full items-center gap-2.5 rounded-block p-1.5 text-left outline-none hover:bg-sidebar-accent focus-visible:ring-2 focus-visible:ring-sidebar-ring data-[state=open]:bg-sidebar-accent group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-1"
        >
          {/* design.md §8: avatars are 12px-radius squares on cyan-strong (white text holds AA). */}
          <span aria-hidden="true" className="grid size-9 shrink-0 place-items-center rounded-block bg-brand-strong text-meta font-medium text-brand-foreground">{initials(s.displayName)}</span>
          <span className="min-w-0 flex-1 leading-tight group-data-[collapsible=icon]:hidden">
            <span className="block truncate text-item text-sidebar-accent-foreground">{s.displayName}</span>
            <span className="block text-meta text-sidebar-muted">{s.roleLabel}</span>
          </span>
          <ChevronsUpDown className="size-4 shrink-0 text-sidebar-muted group-data-[collapsible=icon]:hidden" aria-hidden="true" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side={isMobile ? 'top' : state === 'collapsed' ? 'right' : 'top'} align={isMobile ? 'center' : 'start'} className="w-64">
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
        <DropdownMenuItem onSelect={onOpenGuide}>
          <Compass aria-hidden="true" />
          Starter guide
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

export function AppSidebar({ onOpenCommand, onOpenGuide }: { onOpenCommand: () => void; onOpenGuide: () => void }) {
  const { pathname } = useLocation()
  return (
    <Sidebar collapsible="icon" variant="inset" className="border-none">
      <SidebarHeader className="flex-row items-center justify-between gap-2 px-5 pt-6 pb-4 group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:gap-3 group-data-[collapsible=icon]:px-2">
        <Wordmark />
        <CollapseToggle />
      </SidebarHeader>

      <SidebarContent className="px-1.5 group-data-[collapsible=icon]:px-0">
        <nav aria-label="Main">
          <SidebarGroup className="pt-2">
            <SidebarGroupContent>
              <SidebarMenu className="gap-1">
                {MAIN_MENUS.map((item) => (
                  <NavLink key={item.to} item={item} active={isActiveItem(pathname, item)} />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </nav>
      </SidebarContent>

      <SidebarFooter className={cn('border-t border-sidebar-border px-3 py-3 group-data-[collapsible=icon]:px-2')}>
        <UserMenu onOpenCommand={onOpenCommand} onOpenGuide={onOpenGuide} />
      </SidebarFooter>
    </Sidebar>
  )
}
