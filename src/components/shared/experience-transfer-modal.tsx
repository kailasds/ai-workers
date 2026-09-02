import { useState } from "react";
import { Check, Sparkle, Share2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { workers } from "@/lib/data";
import type { ExperienceAsset } from "@/lib/experience-data";
import { cn } from "@/lib/utils";

const categoryOptions = ["Decision patterns", "Domain knowledge", "Successful workflows", "Resolution strategies", "Failure prevention patterns"];

export function ExperienceTransferModal({ asset, onClose }: { asset: ExperienceAsset; onClose: () => void }) {
  const [targetId, setTargetId] = useState<string | null>(null);
  const [selected, setSelected] = useState<string[]>([categoryOptions[0]]);
  const [done, setDone] = useState(false);

  const candidates = workers.filter((w) => w.id !== asset.sourceWorkerId);
  const target = workers.find((w) => w.id === targetId);

  function toggle(cat: string) {
    setSelected((s) => (s.includes(cat) ? s.filter((c) => c !== cat) : [...s, cat]));
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Transfer Experience</DialogTitle>
          <DialogDescription>{asset.name} · from {asset.sourceWorkerName}</DialogDescription>
        </DialogHeader>

        {done && target ? (
          <div className="py-4 text-center">
            <div className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-status-green-soft text-status-green mb-3">
              <Check className="h-5 w-5" strokeWidth={2.5} />
            </div>
            <p className="text-[14px] font-semibold text-ink">Experience transferred</p>
            <p className="mt-1 text-[12.5px] text-ink-mute">
              {target.name} now begins with {selected.length} inherited experience {selected.length === 1 ? "category" : "categories"} from {asset.sourceWorkerName}.
            </p>
            <Button size="sm" className="mt-4" onClick={onClose}>
              Done
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-mute mb-2">Select target Worker</p>
              <div className="grid grid-cols-2 gap-2">
                {candidates.map((w) => (
                  <button
                    key={w.id}
                    onClick={() => setTargetId(w.id)}
                    className={cn(
                      "rounded-[10px] border px-3 py-2 text-left transition-colors",
                      targetId === w.id ? "border-accent bg-accent-soft" : "border-border hover:bg-card-sunken"
                    )}
                  >
                    <p className="text-[12px] font-medium text-ink truncate">{w.name}</p>
                    <p className="text-[10.5px] text-ink-mute truncate">{w.domain}</p>
                  </button>
                ))}
              </div>
            </div>

            {target && (
              <>
                <div className="rounded-[10px] border border-accent-border bg-accent-soft px-3 py-2.5">
                  <p className="flex items-center gap-1.5 text-[11.5px] font-semibold text-accent-ink mb-1">
                    <Sparkle className="h-3.5 w-3.5" strokeWidth={2} />
                    AI compatibility check
                  </p>
                  <p className="text-[12px] leading-relaxed text-ink">
                    Recommends transferring this experience because {target.name} and {asset.sourceWorkerName} operate on
                    compatible workloads ({asset.compatibility.toLowerCase()} compatibility, {asset.validatedCases} validated cases).
                  </p>
                </div>

                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-mute mb-2">What should transfer?</p>
                  <div className="space-y-1.5">
                    {categoryOptions.map((cat) => (
                      <label key={cat} className="flex items-center gap-2.5 rounded-[8px] px-1.5 py-1 hover:bg-card-sunken cursor-pointer">
                        <Checkbox checked={selected.includes(cat)} onCheckedChange={() => toggle(cat)} />
                        <span className="text-[12.5px] text-ink-soft">{cat}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-ink-mute">
                  <Badge variant="outline">Source: {asset.sourceWorkerName}</Badge>
                  <Badge variant="outline">{asset.validatedCases} validated cases</Badge>
                </div>

                <Button className="w-full" disabled={selected.length === 0} onClick={() => setDone(true)}>
                  <Share2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                  Approve Transfer
                </Button>
              </>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
