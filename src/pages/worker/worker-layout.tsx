import { NavLink, Outlet, useParams, Navigate } from "react-router-dom";
import {
  LayoutGrid,
  ClipboardList,
  Layers,
  ShieldCheck,
  CheckCircle2,
  BrainCircuit,
  History,
  Activity,
} from "lucide-react";
import { getWorker } from "@/lib/data";
import { WorkerHeader } from "@/components/shared/worker-header";
import { cn } from "@/lib/utils";

const tabs = [
  { to: "", label: "Overview", icon: LayoutGrid, tone: "blue" },
  { to: "responsibilities", label: "Responsibilities", tone: "neutral", icon: ClipboardList },
  { to: "capabilities", label: "Capabilities", icon: Layers, tone: "blue" },
  { to: "governance", label: "Governance", icon: ShieldCheck, tone: "purple" },
  { to: "definition-of-done", label: "Definition of Done", icon: CheckCircle2, tone: "green" },
  { to: "knowledge", label: "Knowledge & Learning", icon: BrainCircuit, tone: "purple" },
  { to: "work-history", label: "Work History", icon: History, tone: "neutral" },
  { to: "operations", label: "Operations", icon: Activity, tone: "blue" },
] as const;

const iconTone: Record<string, string> = {
  blue: "text-status-blue",
  purple: "text-status-purple",
  green: "text-status-green",
  neutral: "text-ink-mute",
};

export default function WorkerLayout() {
  const { workerId } = useParams();
  const worker = getWorker(workerId ?? "");

  if (!worker) return <Navigate to="/workers" replace />;

  return (
    <div className="pb-10">
      <WorkerHeader worker={worker} />

      <div className="px-8 mt-8">
        <div className="flex flex-wrap items-center gap-1 rounded-[16px] border border-border bg-card p-1.5 shadow-card w-fit max-w-full">
          {tabs.map((tab) => (
            <NavLink
              key={tab.label}
              to={tab.to || "."}
              end={tab.to === ""}
              className={({ isActive }) =>
                cn(
                  "inline-flex h-9 items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-3.5 text-[12.5px] font-semibold transition-colors",
                  isActive ? "bg-accent text-white" : "text-ink-mute hover:bg-card-sunken hover:text-ink"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <tab.icon
                    className={cn("h-[15px] w-[15px] shrink-0", isActive ? "text-white" : iconTone[tab.tone])}
                    strokeWidth={2}
                  />
                  {tab.label}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </div>

      <div className="px-8 mt-5">
        <Outlet context={worker} />
      </div>
    </div>
  );
}
