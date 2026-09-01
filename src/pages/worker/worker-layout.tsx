import { NavLink, Outlet, useParams, Navigate } from "react-router-dom";
import { getWorker } from "@/lib/data";
import { WorkerHeader } from "@/components/shared/worker-header";
import { cn } from "@/lib/utils";

const tabs = [
  { to: "", label: "Overview" },
  { to: "responsibilities", label: "Responsibilities" },
  { to: "capabilities", label: "Capabilities" },
  { to: "governance", label: "Governance" },
  { to: "definition-of-done", label: "Definition of Done" },
  { to: "knowledge", label: "Knowledge & Learning" },
  { to: "work-history", label: "Work History" },
  { to: "operations", label: "Operations" },
];

export default function WorkerLayout() {
  const { workerId } = useParams();
  const worker = getWorker(workerId ?? "");

  if (!worker) return <Navigate to="/workers" replace />;

  return (
    <div className="pb-10">
      <WorkerHeader worker={worker} />

      <div className="px-8">
        <div className="flex flex-wrap items-center gap-1 rounded-full bg-card-sunken p-1 w-fit max-w-full">
          {tabs.map((tab) => (
            <NavLink
              key={tab.label}
              to={tab.to || "."}
              end={tab.to === ""}
              className={({ isActive }) =>
                cn(
                  "inline-flex h-8 items-center justify-center whitespace-nowrap rounded-full px-3.5 text-[12.5px] font-semibold transition-colors",
                  isActive ? "bg-accent text-white" : "text-ink-mute hover:text-ink"
                )
              }
            >
              {tab.label}
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
