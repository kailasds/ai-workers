import { useState } from "react";
import { Ban, Repeat2, Share2, SlidersHorizontal, Archive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/v2/confirmation-dialog";
import { retireKnowledge, replaceKnowledge, restrictScope, revokeKnowledge, shareWithPlatform, useV2 } from "@/lib/v2/store";
import type { Knowledge } from "@/lib/v2/types";
import { cn } from "@/lib/utils";

export const audienceOptions = [
  "Integration Modernization Workers",
  "Integration Workers",
  "Payments Workers",
  "All Workers",
];

const revokeReasons = [
  "Contradictory evidence",
  "No longer applicable",
  "Outdated",
  "Failed validation",
  "Replaced by newer knowledge",
  "Other",
];

function Radio({ name, value, checked, onChange, children, hint }: { name: string; value: string; checked: boolean; onChange: (v: string) => void; children: React.ReactNode; hint?: string }) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-start gap-2.5 rounded-control border px-3 py-2.5",
        checked ? "border-accent bg-accent-soft" : "border-border hover:bg-card-sunken"
      )}
    >
      <input type="radio" name={name} value={value} checked={checked} onChange={() => onChange(value)} className="mt-0.5 h-3.5 w-3.5 accent-[var(--color-accent)]" />
      <span>
        <span className="block text-[14px] font-medium text-ink">{children}</span>
        {hint && <span className="block text-[12px] text-ink-mute">{hint}</span>}
      </span>
    </label>
  );
}

export function ShareDialog({ k, open, onOpenChange, defaultAudience }: { k: Knowledge; open: boolean; onOpenChange: (o: boolean) => void; defaultAudience?: string }) {
  const [audience, setAudience] = useState(defaultAudience ?? audienceOptions[0]);
  return (
    <ConfirmationDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Share with platform?"
      description={
        <>
          <span className="font-medium text-ink">{k.title}</span> will become Platform Knowledge that other Workers can use. It stays scoped to the audience you choose.
        </>
      }
      confirmLabel="Share with platform"
      onConfirm={() => shareWithPlatform(k.id, [audience])}
    >
      <p className="mb-2 text-[12px] font-semibold text-ink-soft">Who can use it?</p>
      <div className="space-y-2">
        {audienceOptions.map((a, i) => (
          <Radio key={a} name="audience" value={a} checked={audience === a} onChange={setAudience} hint={i === 0 ? "Suggested: the Workers doing the same kind of work." : undefined}>
            {a}
          </Radio>
        ))}
      </div>
    </ConfirmationDialog>
  );
}

export function RevokeDialog({ k, open, onOpenChange }: { k: Knowledge; open: boolean; onOpenChange: (o: boolean) => void }) {
  const state = useV2();
  const [reason, setReason] = useState("");
  const [context, setContext] = useState("");
  const [replacementId, setReplacementId] = useState("");
  const candidates = state.knowledge.filter((x) => x.scope === "platform" && x.status === "active" && x.id !== k.id);
  return (
    <ConfirmationDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Revoke knowledge?"
      description={
        <>
          <span className="font-medium text-ink">{k.title}</span> will no longer be recommended. Its history stays on record.
        </>
      }
      confirmLabel="Revoke knowledge"
      tone="destructive"
      confirmDisabled={!reason}
      onConfirm={() => revokeKnowledge(k.id, reason, context.trim(), replacementId || undefined)}
    >
      <p className="mb-2 text-[12px] font-semibold text-ink-soft">Why are you revoking it?</p>
      <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
        {revokeReasons.map((r) => (
          <Radio key={r} name="reason" value={r} checked={reason === r} onChange={setReason}>
            {r}
          </Radio>
        ))}
      </div>
      <label className="mt-4 block text-[12px] font-semibold text-ink-soft" htmlFor="revoke-context">
        Additional context
      </label>
      <textarea
        id="revoke-context"
        value={context}
        onChange={(e) => setContext(e.target.value)}
        rows={3}
        className="mt-1.5 w-full resize-none rounded-control border border-border-strong bg-card px-3 py-2 text-[14px] text-ink outline-none placeholder:text-ink-faint focus-visible:border-accent"
        placeholder="What did you see?"
      />
      {candidates.length > 0 && (
        <>
          <label className="mt-3 block text-[12px] font-semibold text-ink-soft" htmlFor="revoke-replacement">
            Replaced by (optional)
          </label>
          <select
            id="revoke-replacement"
            value={replacementId}
            onChange={(e) => setReplacementId(e.target.value)}
            className="mt-1.5 h-9 w-full rounded-control border border-border-strong bg-card px-2.5 text-[14px] text-ink-soft outline-none"
          >
            <option value="">Nothing replaces it yet</option>
            {candidates.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </>
      )}
    </ConfirmationDialog>
  );
}

function RetireDialog({ k, open, onOpenChange }: { k: Knowledge; open: boolean; onOpenChange: (o: boolean) => void }) {
  const [context, setContext] = useState("");
  return (
    <ConfirmationDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Retire knowledge?"
      description={
        <>
          Retiring <span className="font-medium text-ink">{k.title}</span> means it is no longer recommended for future use. It was not wrong, and Workers already using it keep their history.
        </>
      }
      confirmLabel="Retire"
      onConfirm={() => retireKnowledge(k.id, context.trim())}
    >
      <label className="block text-[12px] font-semibold text-ink-soft" htmlFor="retire-context">
        Note (optional)
      </label>
      <textarea
        id="retire-context"
        value={context}
        onChange={(e) => setContext(e.target.value)}
        rows={2}
        className="mt-1.5 w-full resize-none rounded-control border border-border-strong bg-card px-3 py-2 text-[14px] text-ink outline-none focus-visible:border-accent"
      />
    </ConfirmationDialog>
  );
}

function ReplaceDialog({ k, open, onOpenChange }: { k: Knowledge; open: boolean; onOpenChange: (o: boolean) => void }) {
  const state = useV2();
  const candidates = state.knowledge.filter((x) => x.scope === k.scope && x.status === "active" && x.id !== k.id);
  const [replacementId, setReplacementId] = useState("");
  return (
    <ConfirmationDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Replace knowledge?"
      description={
        <>
          <span className="font-medium text-ink">{k.title}</span> will be marked as superseded by newer knowledge. Both stay on record.
        </>
      }
      confirmLabel="Replace"
      confirmDisabled={!replacementId}
      onConfirm={() => replaceKnowledge(k.id, replacementId)}
    >
      <label className="block text-[12px] font-semibold text-ink-soft" htmlFor="replace-with">
        Replaced by
      </label>
      {candidates.length === 0 ? (
        <p className="mt-1.5 text-[12px] text-ink-mute">There is no other active knowledge to replace it with yet.</p>
      ) : (
        <select
          id="replace-with"
          value={replacementId}
          onChange={(e) => setReplacementId(e.target.value)}
          className="mt-1.5 h-9 w-full rounded-control border border-border-strong bg-card px-2.5 text-[14px] text-ink-soft outline-none"
        >
          <option value="">Choose knowledge</option>
          {candidates.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>
      )}
    </ConfirmationDialog>
  );
}

function RestrictDialog({ k, open, onOpenChange }: { k: Knowledge; open: boolean; onOpenChange: (o: boolean) => void }) {
  const [audience, setAudience] = useState(k.availableTo[0] ?? audienceOptions[0]);
  return (
    <ConfirmationDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Restrict scope?"
      description={
        <>
          Choose who can use <span className="font-medium text-ink">{k.title}</span>.
        </>
      }
      confirmLabel="Restrict scope"
      onConfirm={() => restrictScope(k.id, [audience])}
    >
      <div className="space-y-2">
        {audienceOptions.map((a) => (
          <Radio key={a} name="restrict" value={a} checked={audience === a} onChange={setAudience}>
            {a}
          </Radio>
        ))}
      </div>
    </ConfirmationDialog>
  );
}

type Which = "share" | "revoke" | "retire" | "replace" | "restrict" | null;

/** The actions a knowledge item allows, given its scope and status. */
export function KnowledgeActionBar({ k, size = "default" }: { k: Knowledge; size?: "default" | "sm" }) {
  const [which, setWhich] = useState<Which>(null);
  const close = (o: boolean) => !o && setWhich(null);
  const isLive = k.status === "active" || k.status === "under-review";

  const buttons: React.ReactNode[] = [];
  if (k.scope === "gained" && k.status === "active" && !k.sharedAsId) {
    buttons.push(
      <Button key="share" size={size} onClick={() => setWhich("share")}>
        <Share2 className="h-3.5 w-3.5" strokeWidth={2} />
        Share with platform
      </Button>
    );
  }
  if (k.scope === "platform" && isLive) {
    buttons.push(
      <Button key="restrict" size={size} variant="secondary" onClick={() => setWhich("restrict")}>
        <SlidersHorizontal className="h-3.5 w-3.5" strokeWidth={2} />
        Restrict
      </Button>,
      <Button key="replace" size={size} variant="secondary" title="Superseded by newer knowledge" onClick={() => setWhich("replace")}>
        <Repeat2 className="h-3.5 w-3.5" strokeWidth={2} />
        Replace
      </Button>,
      <Button key="retire" size={size} variant="secondary" title="No longer recommended for future use" onClick={() => setWhich("retire")}>
        <Archive className="h-3.5 w-3.5" strokeWidth={2} />
        Retire
      </Button>,
      <Button key="revoke" size={size} variant="destructive" title="Previously trusted, no longer valid" onClick={() => setWhich("revoke")}>
        <Ban className="h-3.5 w-3.5" strokeWidth={2} />
        Revoke
      </Button>
    );
  }
  if (k.scope === "gained" && k.status === "active" && !k.sharedAsId) {
    buttons.push(
      <Button key="retire" size={size} variant="secondary" title="No longer recommended for future use" onClick={() => setWhich("retire")}>
        <Archive className="h-3.5 w-3.5" strokeWidth={2} />
        Retire
      </Button>
    );
  }
  if (buttons.length === 0) return null;

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">{buttons}</div>
      {which === "share" && <ShareDialog k={k} open onOpenChange={close} />}
      {which === "revoke" && <RevokeDialog k={k} open onOpenChange={close} />}
      {which === "retire" && <RetireDialog k={k} open onOpenChange={close} />}
      {which === "replace" && <ReplaceDialog k={k} open onOpenChange={close} />}
      {which === "restrict" && <RestrictDialog k={k} open onOpenChange={close} />}
    </>
  );
}
