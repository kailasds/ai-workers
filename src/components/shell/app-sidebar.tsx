import { Link, useLocation } from 'react-router'
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'
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
import { MOCK_SESSION } from '@/lib/session'
import { cn } from '@/lib/utils'
import { ADMIN_ITEM, isActivePath, RAIL_ITEMS, type NavItem } from './nav'

// Each item is its label plus the question it answers. Active = a grey fill, a blue bar on the
// rail edge and a blue icon; collapsed, only the icon (with a tooltip) remains.
function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  const { isMobile, setOpenMobile } = useSidebar()
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        isActive={active}
        tooltip={item.label}
        className="relative h-auto items-start gap-3 rounded-xl px-3 py-2.5 hover:bg-sidebar-accent/70 group-data-[collapsible=icon]:size-11! group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:p-3.5! data-active:bg-sidebar-accent data-active:font-normal data-active:hover:bg-sidebar-accent [&_svg]:size-5!"
      >
        <Link to={item.to} aria-current={active ? 'page' : undefined} onClick={() => isMobile && setOpenMobile(false)}>
          {active && <span aria-hidden="true" className="absolute top-3 bottom-3 left-0 w-[3px] rounded-full bg-primary group-data-[collapsible=icon]:hidden" />}
          <item.icon aria-hidden="true" className={cn('mt-0.5 group-data-[collapsible=icon]:mt-0', active ? 'text-primary' : 'text-sidebar-muted')} />
          <span className="min-w-0 group-data-[collapsible=icon]:hidden">
            <span className="block truncate text-[0.9375rem] leading-5 font-semibold text-sidebar-accent-foreground">{item.label}</span>
            <span className="mt-0.5 block text-meta text-sidebar-muted">{item.question}</span>
          </span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

function Wordmark() {
  return (
    <Link to="/dashboard" aria-label="AI Worker Platform — Dashboard" className="block rounded-md leading-none outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring">
      <span className="block text-[1.375rem] font-extrabold tracking-tight text-primary group-data-[collapsible=icon]:hidden">AI WORKER</span>
      <span className="mt-1 block text-[0.625rem] font-bold tracking-[0.62em] text-sidebar-accent-foreground group-data-[collapsible=icon]:hidden">PLATFORM</span>
      <span aria-hidden="true" className="hidden text-lg font-extrabold text-primary group-data-[collapsible=icon]:block">AI</span>
    </Link>
  )
}

function CollapseToggle() {
  const { state, toggleSidebar, isMobile } = useSidebar()
  if (isMobile) return null
  const collapsed = state === 'collapsed'
  const label = collapsed ? 'Expand sidebar (⌘B)' : 'Collapse sidebar (⌘B)'
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

export function AppSidebar() {
  const { pathname } = useLocation()
  const showAdmin = !ADMIN_ITEM.feature || MOCK_SESSION.features.includes(ADMIN_ITEM.feature)

  return (
    <Sidebar collapsible="icon" className="border-sidebar-border">
      <SidebarHeader className="flex-row items-center justify-between gap-2 px-5 pt-6 pb-4 group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:gap-3 group-data-[collapsible=icon]:px-2">
        <Wordmark />
        <CollapseToggle />
      </SidebarHeader>

      <SidebarContent className="px-1.5 group-data-[collapsible=icon]:px-0">
        <nav aria-label="Main">
          <SidebarGroup className="pt-2">
            <SidebarGroupContent>
              <SidebarMenu className="gap-1">
                {RAIL_ITEMS.map((item) => (
                  <NavLink key={item.to} item={item} active={isActivePath(pathname, item.to)} />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </nav>
      </SidebarContent>

      {showAdmin && (
        <SidebarFooter className="border-t border-sidebar-border px-4 py-3 group-data-[collapsible=icon]:px-2">
          <SidebarMenu>
            <NavLink item={ADMIN_ITEM} active={pathname.startsWith('/admin')} />
          </SidebarMenu>
        </SidebarFooter>
      )}
    </Sidebar>
  )
}
