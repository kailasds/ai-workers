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
import { ADMIN_ITEM, isActiveItem, RAIL_ITEMS, type NavItem } from './nav'

// Each item is its label plus the question it answers. The rail is ink; the active item is a
// lifted slab with an ember tick on the rail edge. Collapsed, only the icon (with a tooltip) remains.
function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  const { isMobile, setOpenMobile } = useSidebar()
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        isActive={active}
        tooltip={item.label}
        className="relative h-auto items-start gap-3 rounded-lg px-3 py-2.5 text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:size-11! group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:p-3.5! data-active:bg-sidebar-accent data-active:font-normal data-active:shadow-lift data-active:hover:bg-sidebar-accent [&_svg]:size-[18px]!"
      >
        <Link to={item.to} aria-current={active ? 'page' : undefined} onClick={() => isMobile && setOpenMobile(false)}>
          {active && <span aria-hidden="true" className="absolute top-2.5 bottom-2.5 -left-1.5 w-[3px] rounded-full bg-ember group-data-[collapsible=icon]:-left-2" />}
          <item.icon aria-hidden="true" className={cn('mt-0.5 group-data-[collapsible=icon]:mt-0', active ? 'text-sidebar-accent-foreground' : 'text-sidebar-muted')} />
          <span className="min-w-0 group-data-[collapsible=icon]:hidden">
            <span className={cn('block truncate text-[0.9375rem] leading-5 font-medium', active ? 'text-sidebar-accent-foreground' : 'text-sidebar-foreground')}>{item.label}</span>
            <span className="mt-0.5 block text-meta leading-[1.125rem] whitespace-normal text-sidebar-muted">{item.question}</span>
          </span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

// The mark: a small ember-and-viridian glyph (two stacked slabs, a Worker and its brain) and the name.
function Wordmark() {
  return (
    <Link to="/workers" aria-label="AI Worker Platform — Registry" className="flex items-center gap-2.5 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring">
      <span aria-hidden="true" className="relative grid size-8 shrink-0 place-items-center rounded-lg bg-sidebar-accent">
        <span className="absolute top-[9px] left-[8px] h-[6px] w-[16px] rounded-[2px] bg-ember" />
        <span className="absolute top-[17px] left-[8px] h-[6px] w-[11px] rounded-[2px] bg-sidebar-ring" />
      </span>
      <span className="leading-none group-data-[collapsible=icon]:hidden">
        <span className="block font-display text-[1.125rem] font-medium tracking-tight text-sidebar-accent-foreground">AI Worker</span>
        <span className="mt-1 block text-[0.625rem] font-medium tracking-[0.24em] text-sidebar-muted uppercase">Platform · TCS</span>
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
