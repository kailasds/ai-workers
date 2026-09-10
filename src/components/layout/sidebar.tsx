import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Gauge, Pencil, Users, Library, BrainCircuit, ShieldAlert, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

const primaryNav = [
  { to: "/", label: "Dashboard", description: "What needs attention", icon: Gauge, end: true },
  { to: "/workers/new", label: "Compose", description: "Create and configure a Worker", icon: Pencil },
  { to: "/workers", label: "Registry", description: "What Workers exist", icon: Users },
  { to: "/knowledge", label: "Knowledge", description: "What knowledge exists", icon: Library },
  { to: "/learning", label: "Learning", description: "How the platform is learning", icon: BrainCircuit },
  { to: "/sentinel", label: "Sentinel", description: "What watches and protects", icon: ShieldAlert },
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
        "flex h-full shrink-0 flex-col bg-card border-r border-border transition-[width] duration-150",
        collapsed ? "w-[72px]" : "w-[280px]"
      )}
    >
      <div className={cn("flex items-center gap-2.5 pt-6 pb-6", collapsed ? "justify-center px-3" : "px-5")}>
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-accent">
          <span className="text-[15px] font-extrabold text-white">A</span>
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="truncate text-[11px] font-semibold uppercase tracking-wider text-ink-mute">TCS</p>
            <p className="truncate text-[14.5px] font-bold tracking-[-0.01em] text-ink">AI Worker Platform</p>
          </div>
        )}
      </div>

      <nav className={cn("flex-1 overflow-y-auto pb-4", collapsed ? "px-2" : "px-3")}>
        <NavGroup items={primaryNav} collapsed={collapsed} />
      </nav>

      <div className="border-t border-border p-3">
        <button
          onClick={toggleCollapsed}
          className={cn(
            "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[12.5px] font-medium text-ink-mute transition-colors hover:bg-card-sunken hover:text-ink",
            collapsed && "justify-center"
          )}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <PanelLeftOpen className="h-[16px] w-[16px] shrink-0" strokeWidth={1.75} /> : <PanelLeftClose className="h-[16px] w-[16px] shrink-0" strokeWidth={1.75} />}
          {!collapsed && "Collapse"}
        </button>

        <div className={cn("flex items-center gap-2.5 rounded-lg px-2.5 py-2", collapsed && "justify-center px-0")}>
          <Avatar className="h-8 w-8">
            <AvatarFallback>AW</AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-[12.5px] font-semibold text-ink">AI Worker Admin</p>
              <p className="truncate text-[11px] text-ink-mute">Platform operator</p>
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
                    "flex items-center justify-center rounded-lg p-2.5 transition-colors",
                    isActive ? "bg-accent text-white" : "text-ink-soft hover:bg-card-sunken"
                  )
                }
              >
                {({ isActive }) => <item.icon className={cn("h-[18px] w-[18px] shrink-0", isActive ? "text-white" : "text-ink-mute")} strokeWidth={1.75} />}
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
                "flex items-start gap-2.5 rounded-lg px-3 py-2.5 transition-colors",
                isActive ? "bg-accent text-white" : "text-ink-soft hover:bg-card-sunken"
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon
                  className={cn("h-[18px] w-[18px] shrink-0 mt-0.5", isActive ? "text-white" : "text-ink-mute")}
                  strokeWidth={1.75}
                />
                <span className="min-w-0">
                  <span className={cn("block truncate text-[13.5px] font-semibold", isActive ? "text-white" : "text-ink")}>
                    {item.label}
                  </span>
                  <span className={cn("block truncate text-[11.5px] leading-tight", isActive ? "text-white/70" : "text-ink-mute")}>
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
