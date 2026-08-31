import { NavLink, Link } from "react-router-dom";
import {
  Gauge,
  Users,
  ListChecks,
  ShieldCheck,
  Scale,
  BarChart3,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronsUpDown,
  ArrowUpRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { orgMetrics, approvals, allTasks } from "@/lib/data";

const runningCount = allTasks.filter((t) => t.status === "running").length;

const primaryNav = [
  { to: "/", label: "Overview", icon: Gauge, end: true },
  { to: "/workers", label: "Workers", icon: Users },
  { to: "/work", label: "Work", icon: ListChecks, count: runningCount },
  { to: "/approvals", label: "Approvals", icon: ShieldCheck, count: approvals.length },
];

const orgNav = [
  { to: "/governance", label: "Governance", icon: Scale },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
];

const systemNav = [{ to: "/settings", label: "Settings", icon: Settings }];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const budgetPct = Math.round((orgMetrics.monthlySpend / orgMetrics.monthlyBudget) * 100);

  return (
    <aside
      className={cn(
        "flex h-full shrink-0 flex-col bg-brand-900 transition-[width] duration-200",
        collapsed ? "w-[72px]" : "w-[280px]"
      )}
    >
      <div className="flex items-center gap-2.5 px-5 pt-6 pb-7">
        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-[9px] bg-white">
          <span className="text-[13px] font-bold text-brand-900 font-display">W</span>
        </div>
        {!collapsed && (
          <span className="text-[15px] font-bold tracking-[-0.01em] text-white font-display">
            AI Workforce
          </span>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-4">
        <NavGroup items={primaryNav} collapsed={collapsed} />
        <NavGroupLabel collapsed={collapsed}>Organization</NavGroupLabel>
        <NavGroup items={orgNav} collapsed={collapsed} />
        <NavGroupLabel collapsed={collapsed}>System</NavGroupLabel>
        <NavGroup items={systemNav} collapsed={collapsed} />
      </nav>

      {!collapsed && (
        <div className="mx-4 mb-4 rounded-card bg-card p-4 text-ink shadow-float">
          <p className="text-[10.5px] uppercase tracking-wider text-ink-mute">Monthly AI Spend</p>
          <p className="mt-1 text-[22px] leading-none font-bold tabular-nums font-display">
            ${orgMetrics.monthlySpend.toLocaleString()}
          </p>
          <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-card-sunken">
            <div className="h-full rounded-full bg-accent" style={{ width: `${budgetPct}%` }} />
          </div>
          <p className="mt-1.5 text-[11px] text-ink-mute">{budgetPct}% of budget used</p>
          <Link
            to="/analytics"
            className="mt-3 flex items-center justify-center gap-1.5 rounded-full bg-accent py-2 text-[12.5px] font-semibold text-white transition hover:bg-accent-ink"
          >
            View Analytics
            <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2} />
          </Link>
        </div>
      )}

      <div className="border-t border-white/10 p-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={cn(
                "flex w-full items-center gap-2.5 rounded-[12px] px-2.5 py-2 text-left transition hover:bg-white/8",
                collapsed && "justify-center px-0"
              )}
            >
              <div className="grid h-7 w-7 shrink-0 place-items-center rounded-[8px] bg-white/12 text-[11px] font-bold text-white">
                MC
              </div>
              {!collapsed && (
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12.5px] font-semibold text-white">Meridian Capital</p>
                  <p className="truncate text-[11px] text-white/50">Enterprise plan</p>
                </div>
              )}
              {!collapsed && <ChevronsUpDown className="h-3.5 w-3.5 text-white/40" strokeWidth={1.5} />}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuLabel>Organizations</DropdownMenuLabel>
            <DropdownMenuItem>Meridian Capital</DropdownMenuItem>
            <DropdownMenuItem>Meridian Capital — Sandbox</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Create organization</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={cn(
                "mt-1 flex w-full items-center gap-2.5 rounded-[12px] px-2.5 py-2 text-left transition hover:bg-white/8",
                collapsed && "justify-center px-0"
              )}
            >
              <Avatar className="h-7 w-7">
                <AvatarFallback className="bg-white/12 text-white">KD</AvatarFallback>
              </Avatar>
              {!collapsed && (
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12.5px] font-semibold text-white">Kailas D.</p>
                  <p className="truncate text-[11px] text-white/50">Workforce Admin</p>
                </div>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuItem>Profile settings</DropdownMenuItem>
            <DropdownMenuItem>API keys</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Sign out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <button
          onClick={() => setCollapsed((c) => !c)}
          className={cn(
            "mt-2 flex w-full items-center gap-2 rounded-[10px] px-2.5 py-1.5 text-[12px] text-white/50 transition hover:bg-white/8 hover:text-white",
            collapsed && "justify-center"
          )}
        >
          {collapsed ? (
            <PanelLeftOpen className="h-3.5 w-3.5" strokeWidth={1.5} />
          ) : (
            <>
              <PanelLeftClose className="h-3.5 w-3.5" strokeWidth={1.5} />
              Collapse
            </>
          )}
        </button>
      </div>
    </aside>
  );
}

function NavGroupLabel({ children, collapsed }: { children: React.ReactNode; collapsed: boolean }) {
  if (collapsed) return <div className="mt-4 h-px bg-white/10 mx-2" />;
  return (
    <p className="mt-6 mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-white/35">
      {children}
    </p>
  );
}

function NavGroup({
  items,
  collapsed,
}: {
  items: {
    to: string;
    label: string;
    icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
    end?: boolean;
    count?: number;
  }[];
  collapsed: boolean;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) =>
            cn(
              "relative flex items-center gap-2.5 rounded-[10px] py-2 pr-2.5 text-[14.5px] transition-colors",
              collapsed ? "justify-center px-0" : "pl-4",
              isActive ? "text-white font-semibold bg-white/10" : "text-white/60 font-medium hover:text-white hover:bg-white/6"
            )
          }
        >
          {({ isActive }) => (
            <>
              <span
                className={cn(
                  "absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full transition-colors",
                  isActive ? "bg-white" : "bg-transparent"
                )}
              />
              <item.icon
                className={cn("h-[18px] w-[18px] shrink-0", isActive ? "text-white" : "text-white/45")}
                strokeWidth={1.75}
              />
              {!collapsed && <span className="truncate flex-1">{item.label}</span>}
              {!collapsed && !!item.count && (
                <span className="grid h-5 min-w-5 shrink-0 place-items-center rounded-full bg-white px-1.5 text-[10.5px] font-semibold text-brand-900">
                  {item.count}
                </span>
              )}
            </>
          )}
        </NavLink>
      ))}
    </div>
  );
}
