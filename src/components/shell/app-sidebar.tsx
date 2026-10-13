import { Link, useLocation } from 'react-router'
import { Hexagon, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
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
import { ADMIN_ITEM, isActiveItem, RAIL_ITEMS, type NavItem } from './nav'

// Each item is its label plus the question it answers (design.md §8 Rail). Active = a filled navy
// row with white text and a 3px navy bar on the rail edge. Hover is instant. Collapsed, icons only.
function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  const { isMobile, setOpenMobile } = useSidebar()
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        isActive={active}
        tooltip={item.label}
        className="relative h-auto items-start gap-3 rounded-lg px-3 py-2.5 text-sidebar-foreground transition-none hover:bg-sidebar-accent hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:size-11! group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:p-3.5! data-active:bg-sidebar-primary data-active:font-normal data-active:text-sidebar-primary-foreground data-active:hover:bg-sidebar-primary data-active:hover:text-sidebar-primary-foreground [&_svg]:size-[18px]!"
      >
        <Link to={item.to} aria-current={active ? 'page' : undefined} onClick={() => isMobile && setOpenMobile(false)}>
          {active && <span aria-hidden="true" className="absolute top-1 bottom-1 -left-3 w-[3px] rounded-r-full bg-sidebar-primary group-data-[collapsible=icon]:hidden" />}
          <item.icon aria-hidden="true" className={cn('mt-0.5 group-data-[collapsible=icon]:mt-0', active ? 'text-sidebar-primary-foreground' : 'text-sidebar-muted')} />
          <span className="min-w-0 group-data-[collapsible=icon]:hidden">
            <span className={cn('block truncate text-item', active ? 'text-sidebar-primary-foreground' : 'text-sidebar-accent-foreground')}>{item.label}</span>
            <span className={cn('mt-0.5 block text-meta whitespace-normal', active ? 'text-sidebar-primary-foreground/80' : 'text-sidebar-muted')}>{item.question}</span>
          </span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

// The mark: a cyan rounded tile holding a white Hexagon, then the name in navy-ink.
function Wordmark() {
  return (
    <Link to="/workers" aria-label="AI Worker Platform — Registry" className="flex items-center gap-2.5 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring">
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
                {RAIL_ITEMS.map((item) => (
                  <NavLink key={item.to} item={item} active={isActiveItem(pathname, item)} />
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
