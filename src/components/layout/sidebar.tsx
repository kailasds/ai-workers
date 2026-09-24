import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Gauge, Wrench, Package, Send, Users, Library, BrainCircuit, ShieldAlert, UserCog, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

const primaryNav = [
  { to: "/", label: "Dashboard", description: "What Workers deliver", icon: Gauge, end: true },
  { to: "/workers/new", label: "Compose", description: "Create Workers", icon: Wrench },
  { to: "/packaging", label: "Packaging", description: "Seal composed Workers", icon: Package },
  { to: "/delivery", label: "Customer delivery", description: "Prepare for a customer", icon: Send },
  { to: "/workers", label: "Worker Registry", description: "Manage Workers", icon: Users, end: true },
  { to: "/knowledge", label: "Knowledge", description: "TCS knowledge", icon: Library },
  { to: "/learning", label: "Learning", description: "What Workers add", icon: BrainCircuit },
  { to: "/sentinel", label: "Sentinel", description: "Oversight", icon: ShieldAlert },
];

const COLLAPSE_KEY = "ai-worker-platform:sidebar-collapsed";

function getInitialCollapsed() {
  try {
    return localStorage.getItem(COLLAPSE_KEY) === "1";
  } catch {
    return false;
  }
}

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(getInitialCollapsed);

  function toggleCollapsed() {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(COLLAPSE_KEY, next ? "1" : "0");
      } catch {
        // ignore storage errors (private mode, etc.)
      }
      return next;
    });
  }

  return (
    <aside
      className={cn(
        "sidebar-gradient flex h-full shrink-0 flex-col transition-[width] duration-150",
        collapsed ? "w-[72px]" : "w-[280px]"
      )}
    >
      <div className={cn("flex items-center gap-2.5 pt-6 pb-6", collapsed ? "justify-center px-3" : "px-5")}>
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white/15">
          <span className="text-[15px] font-extrabold text-sidebar-ink">A</span>
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="truncate text-[11px] font-semibold uppercase tracking-wider text-sidebar-ink-mute">TCS</p>
            <p className="truncate text-[14.5px] font-bold tracking-[-0.01em] text-sidebar-ink">AI Worker Platform</p>
          </div>
        )}
      </div>

      <nav className={cn("flex-1 overflow-y-auto pb-4", collapsed ? "px-2" : "px-3")}>
        <NavGroup items={primaryNav} collapsed={collapsed} />
      </nav>

      <div className="border-t border-sidebar-border p-3">
        {collapsed ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <NavLink
                to="/user-management"
                className={({ isActive }) =>
                  cn(
                    "mb-1 flex items-center justify-center rounded-lg p-2.5 transition-colors",
                    isActive ? "bg-sidebar-hover text-sidebar-ink" : "text-sidebar-ink-mute hover:bg-sidebar-hover hover:text-sidebar-ink"
                  )
                }
              >
                <UserCog className="h-[16px] w-[16px] shrink-0" strokeWidth={1.75} />
              </NavLink>
            </TooltipTrigger>
            <TooltipContent side="right">User management</TooltipContent>
          </Tooltip>
        ) : (
          <NavLink
            to="/user-management"
            className={({ isActive }) =>
              cn(
                "mb-1 flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[12.5px] font-medium transition-colors",
                isActive ? "bg-sidebar-hover text-sidebar-ink" : "text-sidebar-ink-mute hover:bg-sidebar-hover hover:text-sidebar-ink"
              )
            }
          >
            <UserCog className="h-[16px] w-[16px] shrink-0" strokeWidth={1.75} />
            User management
          </NavLink>
        )}

        <button
          onClick={toggleCollapsed}
          className={cn(
            "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[12.5px] font-medium text-sidebar-ink-mute transition-colors hover:bg-sidebar-hover hover:text-sidebar-ink",
            collapsed && "justify-center"
          )}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <PanelLeftOpen className="h-[16px] w-[16px] shrink-0" strokeWidth={1.75} /> : <PanelLeftClose className="h-[16px] w-[16px] shrink-0" strokeWidth={1.75} />}
          {!collapsed && "Collapse"}
        </button>

        <div className={cn("flex items-center gap-2.5 rounded-lg px-2.5 py-2", collapsed && "justify-center px-0")}>
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-white/15 text-sidebar-ink">AW</AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-[12.5px] font-semibold text-sidebar-ink">AI Worker Admin</p>
              <p className="truncate text-[11px] text-sidebar-ink-mute">Platform operator</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

function NavGroup({
  items,
  collapsed,
}: {
  items: {
    to: string;
    label: string;
    description: string;
    icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
    end?: boolean;
  }[];
  collapsed: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      {items.map((item) =>
        collapsed ? (
          <Tooltip key={item.to}>
            <TooltipTrigger asChild>
              <NavLink
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    "relative flex items-center justify-center rounded-lg p-2.5 transition-colors",
                    isActive ? "text-sidebar-accent" : "text-sidebar-ink-faint hover:bg-sidebar-hover hover:text-sidebar-ink"
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={cn(
                        "absolute left-0 top-1/2 h-4 w-[2.5px] -translate-y-1/2 rounded-full transition-colors",
                        isActive ? "bg-sidebar-accent" : "bg-transparent"
                      )}
                    />
                    <item.icon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.75} />
                  </>
                )}
              </NavLink>
            </TooltipTrigger>
            <TooltipContent side="right">{item.label}</TooltipContent>
          </Tooltip>
        ) : (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn(
                "relative flex items-start gap-2.5 rounded-lg px-3 py-2.5 transition-colors",
                isActive ? "bg-sidebar-hover" : "hover:bg-sidebar-hover"
              )
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={cn(
                    "absolute left-0 top-1/2 h-4 w-[2.5px] -translate-y-1/2 rounded-full transition-colors",
                    isActive ? "bg-sidebar-accent" : "bg-transparent"
                  )}
                />
                <item.icon
                  className={cn("h-[18px] w-[18px] shrink-0 mt-0.5", isActive ? "text-sidebar-accent" : "text-sidebar-ink-faint")}
                  strokeWidth={1.75}
                />
                <span className="min-w-0">
                  <span className="block truncate text-[13.5px] font-semibold text-sidebar-ink">
                    {item.label}
                  </span>
                  <span className="block truncate text-[11.5px] leading-tight text-sidebar-ink-mute">
                    {item.description}
                  </span>
                </span>
              </>
            )}
          </NavLink>
        )
      )}
    </div>
  );
}
