import { NavLink } from "react-router-dom";
import { Gauge, Pencil, Lightbulb, Radio, Users, ListChecks, Scale, BarChart3, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const workspaceNav = [
  { to: "/", label: "Dashboard", description: "Overview and insights", icon: Gauge, end: true },
  { to: "/workers/new", label: "Compose", description: "Create and configure AI Workers", icon: Pencil },
  { to: "/experience-hub", label: "Experience Hub", description: "AI-recommended worker improvements", icon: Lightbulb },
  { to: "/operations", label: "Operate", description: "Monitor deployed workers and environments", icon: Radio },
];

const orgNav = [{ to: "/workers", label: "AI Workers", description: "Directory and profiles", icon: Users }];

const moreNav = [
  { to: "/work", label: "Work", icon: ListChecks },
  { to: "/governance", label: "Governance", icon: Scale },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  return (
    <aside className="flex h-full w-[280px] shrink-0 flex-col bg-card border-r border-border">
      <div className="flex items-center gap-2.5 px-5 pt-6 pb-6">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-accent">
          <span className="text-[15px] font-extrabold text-white">A</span>
        </div>
        <div className="min-w-0">
          <p className="truncate text-[11px] font-semibold uppercase tracking-wider text-ink-mute">TCS</p>
          <p className="truncate text-[14.5px] font-bold tracking-[-0.01em] text-ink">AI Worker Platform</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pb-4">
        <NavGroupLabel>Workspace</NavGroupLabel>
        <NavGroup items={workspaceNav} />
        <NavGroupLabel>Directory</NavGroupLabel>
        <NavGroup items={orgNav} />
        <NavGroupLabel>More</NavGroupLabel>
        <div className="flex flex-col gap-0.5">
          {moreNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors",
                  isActive ? "bg-accent-soft text-accent-ink" : "text-ink-mute hover:bg-card-sunken hover:text-ink"
                )
              }
            >
              <item.icon className="h-[16px] w-[16px] shrink-0" strokeWidth={1.75} />
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>

      <div className="border-t border-border p-3">
        <div className="flex items-center gap-2.5 rounded-lg px-2.5 py-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback>AW</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[12.5px] font-semibold text-ink">AI Worker Admin</p>
            <p className="truncate text-[11px] text-ink-mute">Platform operator</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

function NavGroupLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-5 mb-2 px-3 text-[10.5px] font-semibold uppercase tracking-wider text-ink-faint">
      {children}
    </p>
  );
}

function NavGroup({
  items,
}: {
  items: {
    to: string;
    label: string;
    description: string;
    icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
    end?: boolean;
  }[];
}) {
  return (
    <div className="flex flex-col gap-1">
      {items.map((item) => (
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
      ))}
    </div>
  );
}
