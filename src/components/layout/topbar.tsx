import { useLocation, Link } from "react-router-dom";
import { Search, Bell, ChevronRight } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AskWorkforceAI } from "@/components/shared/ask-workforce-ai";
import { getWorker, allWorkHistory } from "@/lib/data";

const routeLabels: Record<string, string> = {
  "": "Overview",
  workers: "AI Workers",
  work: "Work",
  operations: "Operations",
  governance: "Governance",
  analytics: "Analytics",
  settings: "Settings",
  new: "Create Worker",
  assign: "Assign Work",
  responsibilities: "Responsibilities",
  capabilities: "Capabilities",
  "definition-of-done": "Definition of Done",
  knowledge: "Knowledge & Learning",
  "work-history": "Work History",
};

export function Topbar() {
  const location = useLocation();
  const segments = location.pathname.split("/").filter(Boolean);

  const crumbs: { label: string; to: string }[] = [{ label: "AI Workforce", to: "/" }];
  let acc = "";
  for (const seg of segments) {
    acc += `/${seg}`;
    const worker = getWorker(seg);
    const workItem = allWorkHistory.find((w) => w.id === seg);
    const label = worker ? worker.name : workItem ? workItem.title : routeLabels[seg] ?? seg;
    crumbs.push({ label, to: acc });
  }

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border-strong bg-card px-6">
      <div className="flex items-center gap-1.5 text-[13px] text-ink-mute min-w-0">
        {crumbs.map((c, i) => (
          <span key={c.to} className="flex items-center gap-1.5 min-w-0">
            {i > 0 && <ChevronRight className="h-3 w-3 shrink-0 text-ink-faint" strokeWidth={1.5} />}
            {i === crumbs.length - 1 ? (
              <span className="truncate font-medium text-ink">{c.label}</span>
            ) : (
              <Link to={c.to} className="truncate hover:text-ink transition-colors">
                {c.label}
              </Link>
            )}
          </span>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <div className="hidden md:flex items-center gap-2 rounded-full border border-border-strong bg-card-sunken px-3.5 h-8 w-56 text-ink-faint">
          <Search className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} />
          <span className="text-[12.5px]">Search workforce…</span>
          <kbd className="ml-auto rounded-full bg-card px-1.5 py-0.5 text-[10px] text-ink-mute border border-border">⌘K</kbd>
        </div>

        <AskWorkforceAI />

        <Tooltip>
          <TooltipTrigger asChild>
            <button className="relative grid h-9 w-9 place-items-center rounded-full text-ink-mute transition hover:bg-card-sunken hover:text-ink">
              <Bell className="h-4 w-4" strokeWidth={1.5} />
              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-status-red" />
            </button>
          </TooltipTrigger>
          <TooltipContent>4 need attention</TooltipContent>
        </Tooltip>

        <Avatar className="h-8 w-8 ml-1">
          <AvatarFallback>KD</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
