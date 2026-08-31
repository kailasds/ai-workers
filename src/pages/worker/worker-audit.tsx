import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useWorker } from "./use-worker";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function WorkerAudit() {
  const worker = useWorker();
  const [query, setQuery] = useState("");
  const [outcome, setOutcome] = useState("all");

  const filtered = useMemo(() => {
    return worker.auditTrail.filter((e) => {
      const matchesQuery = query.trim() === "" || e.action.toLowerCase().includes(query.toLowerCase()) || e.actor.toLowerCase().includes(query.toLowerCase());
      const matchesOutcome = outcome === "all" || e.outcome === outcome;
      return matchesQuery && matchesOutcome;
    });
  }, [worker.auditTrail, query, outcome]);

  return (
    <div className="pb-10">
      <div className="mb-5">
        <h2 className="text-[20px] font-medium tracking-[-0.01em] text-ink font-display">Worker Audit</h2>
        <p className="mt-1 text-[13px] text-ink-mute">Complete record of this worker's actions and decisions.</p>
      </div>

      <div className="flex items-center gap-2.5 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-faint" strokeWidth={1.5} />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search actions, agents…" className="rounded-full pl-9" />
        </div>
        <Select value={outcome} onValueChange={setOutcome}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Outcome" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All outcomes</SelectItem>
            <SelectItem value="allowed">Allowed</SelectItem>
            <SelectItem value="blocked">Blocked</SelectItem>
            <SelectItem value="info">Info</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-card border border-dashed border-border-strong px-5 py-14 text-center">
          <p className="text-[13px] text-ink-mute">No audit events match these filters.</p>
        </div>
      ) : (
        <div className="rounded-card border border-border bg-card shadow-card p-5">
          {filtered.map((e, i) => (
            <div key={e.id} className="flex gap-3.5">
              <div className="flex flex-col items-center">
                <div
                  className={
                    e.outcome === "blocked"
                      ? "h-2 w-2 rounded-full bg-status-red mt-1.5"
                      : e.outcome === "allowed"
                      ? "h-2 w-2 rounded-full bg-status-green mt-1.5"
                      : "h-2 w-2 rounded-full bg-ink-faint mt-1.5"
                  }
                />
                {i < filtered.length - 1 && <div className="w-px flex-1 bg-border my-1" />}
              </div>
              <div className={`min-w-0 flex-1 ${i < filtered.length - 1 ? "pb-4" : ""}`}>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] tabular-nums text-ink-mute">
                    {new Date(e.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                  <span className="text-[12.5px] font-medium text-ink">{e.actor}</span>
                  {e.outcome !== "info" && (
                    <Badge variant={e.outcome === "allowed" ? "green" : "red"}>
                      {e.outcome === "allowed" ? "Allowed" : "Blocked"}
                    </Badge>
                  )}
                </div>
                <p className="mt-0.5 text-[12.5px] text-ink-soft">{e.action}</p>
                {e.policy && <p className="mt-0.5 text-[11.5px] text-ink-mute">Policy: {e.policy}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
