import { Link, useLocation } from 'react-router'
import { Bot, PanelLeftClose, PanelLeftOpen, Search } from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { Kbd } from '@/components/ui/kbd'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { initials, MOCK_SESSION } from '@/lib/session'
import { ActiveWork } from './active-work'
import { ADMIN_ITEM, isActivePath, NAV_GROUPS, type NavItem } from './nav'

function NavLink({ item, pathname }: { item: NavItem; pathname: string }) {
  const { isMobile, setOpenMobile } = useSidebar()
  const active = isActivePath(pathname, item.to)
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        isActive={active}
        tooltip={item.label}
        className="relative h-10 text-[0.875rem] text-sidebar-foreground/80 group-data-[collapsible=icon]:size-10! group-data-[collapsible=icon]:p-3! data-active:bg-primary-soft data-active:font-semibold data-active:text-primary-strong data-active:hover:bg-primary-soft [&_svg]:size-[18px]!"
      >
        <Link to={item.to} aria-current={active ? 'page' : undefined} onClick={() => isMobile && setOpenMobile(false)}>
          {/* The active row carries a bar on the rail edge as well as the tint, so it reads at a glance. */}
          {active && <span aria-hidden="true" className="absolute top-2 bottom-2 left-0 w-[3px] rounded-r-full bg-primary group-data-[collapsible=icon]:hidden" />}
          <item.icon aria-hidden="true" className={active ? 'text-primary' : undefined} />
          <span>{item.label}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

function CollapseToggle() {
  const { state, toggleSidebar, isMobile } = useSidebar()
  if (isMobile) return null
  const collapsed = state === 'collapsed'
  return (
    <SidebarMenuButton onClick={toggleSidebar} tooltip={collapsed ? 'Expand (⌘B)' : 'Collapse (⌘B)'} aria-expanded={!collapsed} className="h-9 text-sidebar-foreground/80 group-data-[collapsible=icon]:size-10! group-data-[collapsible=icon]:p-3! [&_svg]:size-[18px]!">
      {collapsed ? <PanelLeftOpen aria-hidden="true" /> : <PanelLeftClose aria-hidden="true" />}
      <span>{collapsed ? 'Expand' : 'Collapse'}</span>
    </SidebarMenuButton>
  )
}

export function AppSidebar({ onOpenCommand }: { onOpenCommand: () => void }) {
  const { pathname } = useLocation()
  const showAdmin = !ADMIN_ITEM.feature || MOCK_SESSION.features.includes(ADMIN_ITEM.feature)

  return (
    <Sidebar collapsible="icon" className="border-sidebar-border">
      <SidebarHeader className="gap-4 px-3 pt-4 pb-2 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:px-2">
        <Link to="/dashboard" className="flex items-center gap-2.5 rounded-lg px-1 outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring">
          <span className="grid size-9 shrink-0 place-items-center rounded-[10px] bg-primary text-primary-foreground">
            <Bot className="size-5" aria-hidden="true" />
          </span>
          <span className="min-w-0 leading-tight group-data-[collapsible=icon]:hidden">
            <span className="block truncate text-sm font-semibold text-sidebar-accent-foreground">AI Worker Platform</span>
            <span className="block truncate text-xs text-sidebar-muted">Tata Consultancy Services</span>
          </span>
        </Link>
        <button
          type="button"
          onClick={onOpenCommand}
          aria-label="Jump to… (⌘K)"
          className="flex h-9 items-center gap-2 rounded-md border border-sidebar-border bg-sidebar px-2.5 text-sm text-sidebar-muted outline-none hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring group-data-[collapsible=icon]:size-10 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
        >
          <Search className="size-4 shrink-0" aria-hidden="true" />
          <span className="group-data-[collapsible=icon]:hidden">Jump to…</span>
          <Kbd className="ml-auto bg-sidebar-accent text-sidebar-foreground group-data-[collapsible=icon]:hidden">⌘K</Kbd>
        </button>
      </SidebarHeader>

      <SidebarContent className="px-1 group-data-[collapsible=icon]:px-0">
        <nav aria-label="Main">
          {NAV_GROUPS.map((group) => (
            <SidebarGroup key={group.label}>
              <SidebarGroupLabel className="text-sidebar-muted">{group.label}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.items.map((item) => (
                    <NavLink key={item.to} item={item} pathname={pathname} />
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
          {showAdmin && (
            <SidebarGroup>
              <SidebarGroupLabel className="text-sidebar-muted">Administration</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <NavLink item={ADMIN_ITEM} pathname={pathname} />
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}
        </nav>
      </SidebarContent>

      <SidebarFooter className="gap-2 border-t border-sidebar-border px-3 py-3 group-data-[collapsible=icon]:px-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <ActiveWork />
          </SidebarMenuItem>
          <SidebarMenuItem>
            <CollapseToggle />
          </SidebarMenuItem>
        </SidebarMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button type="button" className="flex items-center gap-2.5 rounded-lg px-1 py-1 text-left outline-none hover:bg-sidebar-accent focus-visible:ring-2 focus-visible:ring-sidebar-ring" aria-label={`Account: ${MOCK_SESSION.displayName}`}>
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-sidebar-accent text-xs font-medium text-sidebar-accent-foreground">
                {initials(MOCK_SESSION.displayName)}
              </span>
              <span className="min-w-0 leading-tight group-data-[collapsible=icon]:hidden">
                <span className="block truncate text-sm text-sidebar-accent-foreground">{MOCK_SESSION.displayName}</span>
                <span className="block truncate text-xs text-sidebar-muted">{MOCK_SESSION.roleLabel}</span>
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start" className="w-56">
            <DropdownMenuItem asChild><Link to="/home">Choose a workspace</Link></DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild><Link to="/login">Sign out</Link></DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <p className="px-1 text-[0.6875rem] leading-snug text-sidebar-muted group-data-[collapsible=icon]:hidden">Mock data · captured 6 Oct 2026. Not production figures.</p>
      </SidebarFooter>
    </Sidebar>
  )
}
