import { useEffect, useRef, useState } from "react";
import { Pencil, Check, X as XIcon, RotateCcw, ChevronDown, Plus, Zap } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

function ModifiedNote({ onRestore }: { onRestore: () => void }) {
  return (
    <div className="mt-1 flex items-center gap-1.5 pl-1.5">
      <span className="text-[10.5px] text-accent-ink">Modified from AI recommendation</span>
      <button onClick={onRestore} className="flex items-center gap-1 text-[10.5px] text-ink-mute transition-colors hover:text-ink">
        <RotateCcw className="h-2.5 w-2.5" strokeWidth={2} />
        Restore AI suggestion
      </button>
    </div>
  );
}

export function EditableField({
  value,
  aiValue,
  onChange,
  multiline = false,
  placeholder,
  textClassName,
  maxLength,
}: {
  value: string;
  aiValue: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  placeholder?: string;
  textClassName?: string;
  maxLength?: number;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isModified = value.trim() !== aiValue.trim();

  useEffect(() => {
    if (!editing) return;
    if (multiline) {
      textareaRef.current?.focus();
      textareaRef.current?.select();
    } else {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing, multiline]);

  function commit() {
    onChange(draft.trim() || aiValue);
    setEditing(false);
  }
  function cancel() {
    setDraft(value);
    setEditing(false);
  }

  if (editing) {
    return (
      <div>
        {multiline ? (
          <div>
            <textarea
              ref={textareaRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value.slice(0, maxLength))}
              onKeyDown={(e) => {
                if (e.key === "Escape") cancel();
              }}
              rows={3}
              maxLength={maxLength}
              className="w-full rounded-[10px] border border-accent bg-card px-3 py-2 text-[12.5px] leading-relaxed text-ink outline-none"
            />
            {maxLength && (
              <p className="mt-1 text-right text-[10.5px] tabular-nums text-ink-faint">
                {draft.length} / {maxLength}
              </p>
            )}
          </div>
        ) : (
          <input
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") commit();
              if (e.key === "Escape") cancel();
            }}
            className="w-full rounded-full border border-accent bg-card px-3 py-1.5 text-[13px] text-ink outline-none"
          />
        )}
        <div className="mt-1.5 flex items-center gap-1.5">
          <button
            onClick={commit}
            className="flex items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-[11px] font-medium text-white transition hover:bg-accent-ink"
          >
            <Check className="h-3 w-3" strokeWidth={2.5} />
            Save
          </button>
          <button
            onClick={cancel}
            className="flex items-center gap-1 rounded-full border border-border-strong px-2.5 py-1 text-[11px] text-ink-mute transition hover:text-ink"
          >
            <XIcon className="h-3 w-3" strokeWidth={2} />
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={() => {
          setDraft(value);
          setEditing(true);
        }}
        className={cn(
          "group/field flex w-full items-start gap-1.5 rounded-[8px] -mx-1.5 px-1.5 py-0.5 text-left transition-colors hover:bg-card-sunken",
          textClassName
        )}
      >
        <span className="flex-1">{value || <span className="text-ink-faint">{placeholder}</span>}</span>
        <Pencil
          className="mt-0.5 h-3 w-3 shrink-0 text-ink-faint opacity-0 transition-opacity group-hover/field:opacity-100"
          strokeWidth={2}
        />
      </button>
      {maxLength && (
        <p className="mt-0.5 px-1.5 text-right text-[10.5px] tabular-nums text-ink-faint">
          {value.length} / {maxLength}
        </p>
      )}
      {isModified && <ModifiedNote onRestore={() => onChange(aiValue)} />}
    </div>
  );
}

export interface SelectOption {
  value: string;
  label: string;
  description?: string;
}

export function EditableSelect({
  value,
  aiValue,
  options,
  onChange,
}: {
  value: string;
  aiValue: string;
  options: SelectOption[];
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const isModified = value !== aiValue;
  const current = options.find((o) => o.value === value);

  return (
    <div>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button className="inline-flex items-center gap-1.5 rounded-full border border-border-strong bg-card px-3 py-1.5 text-[12.5px] font-medium text-ink transition hover:border-accent-border">
            {current?.label ?? value}
            <ChevronDown className="h-3 w-3 text-ink-faint" strokeWidth={2} />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-72 p-1.5" align="start">
          {options.map((o) => (
            <button
              key={o.value}
              onClick={() => {
                onChange(o.value);
                setOpen(false);
              }}
              className={cn(
                "flex w-full flex-col items-start rounded-[8px] px-2.5 py-2 text-left transition-colors hover:bg-card-sunken",
                o.value === value && "bg-accent-soft"
              )}
            >
              <span className="flex items-center gap-1.5 text-[12.5px] font-medium text-ink">
                {o.label}
                {o.value === aiValue && <span className="text-[10px] font-normal text-accent-ink">AI Recommended</span>}
              </span>
              {o.description && <span className="text-[11px] text-ink-mute leading-snug">{o.description}</span>}
            </button>
          ))}
        </PopoverContent>
      </Popover>
      {isModified && <ModifiedNote onRestore={() => onChange(aiValue)} />}
    </div>
  );
}

export function EditableChipList({
  items,
  onChange,
  addLabel = "Add",
  chipTone = "neutral",
}: {
  items: string[];
  onChange: (items: string[]) => void;
  addLabel?: string;
  chipTone?: "neutral" | "green";
}) {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");

  function remove(item: string) {
    onChange(items.filter((i) => i !== item));
  }
  function commitAdd() {
    const v = draft.trim();
    if (v && !items.includes(v)) onChange([...items, v]);
    setDraft("");
    setAdding(false);
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {items.map((item) => (
        <span
          key={item}
          className={cn(
            "group/chip inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11.5px]",
            chipTone === "green" ? "border-status-green/25 bg-status-green-soft text-status-green" : "border-border-strong bg-card text-ink-soft"
          )}
        >
          {item}
          <button onClick={() => remove(item)} className="opacity-40 transition-opacity hover:opacity-100">
            <XIcon className="h-2.5 w-2.5" strokeWidth={2.5} />
          </button>
        </span>
      ))}
      {adding ? (
        <input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") commitAdd();
            if (e.key === "Escape") {
              setDraft("");
              setAdding(false);
            }
          }}
          onBlur={commitAdd}
          placeholder="Type and press Enter…"
          className="w-40 rounded-full border border-accent bg-card px-2.5 py-1 text-[11.5px] text-ink outline-none"
        />
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="inline-flex items-center gap-1 rounded-full border border-dashed border-border-strong px-2.5 py-1 text-[11.5px] text-ink-mute transition hover:border-accent-border hover:text-accent-ink"
        >
          <Plus className="h-2.5 w-2.5" strokeWidth={2.5} />
          {addLabel}
        </button>
      )}
    </div>
  );
}

export function AiImpactNote({
  message,
  onKeep,
  onRevert,
}: {
  message: string;
  onKeep: () => void;
  onRevert: () => void;
}) {
  return (
    <div className="mt-2.5 rounded-[10px] border border-status-amber/25 bg-status-amber-soft px-3 py-2.5 animate-in fade-in-0 slide-in-from-top-1 duration-200">
      <p className="flex items-center gap-1.5 text-[11px] font-semibold text-status-amber">
        <Zap className="h-3 w-3" strokeWidth={2.5} />
        AI Impact Check
      </p>
      <p className="mt-1 text-[12px] leading-relaxed text-ink">{message}</p>
      <div className="mt-2 flex gap-1.5">
        <button onClick={onKeep} className="rounded-full bg-ink px-2.5 py-1 text-[11px] font-medium text-white transition hover:bg-ink-soft">
          Keep Change
        </button>
        <button onClick={onRevert} className="rounded-full border border-border-strong px-2.5 py-1 text-[11px] text-ink-soft transition hover:bg-card">
          Restore AI Recommendation
        </button>
      </div>
    </div>
  );
}
