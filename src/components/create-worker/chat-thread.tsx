import { useState } from "react";
import { Sparkle, Check, ArrowRight, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Answer, Beat, QuestionBeat as QuestionBeatType } from "./types";

function AiAvatar() {
  return (
    <Avatar className="h-7 w-7 shrink-0">
      <AvatarFallback className="bg-accent text-white">
        <Sparkle className="h-3 w-3" strokeWidth={2} />
      </AvatarFallback>
    </Avatar>
  );
}

export function UserBubble({ text }: { text: string }) {
  return (
    <div className="flex justify-end animate-in fade-in-0 slide-in-from-bottom-1 duration-300">
      <div className="max-w-[85%] rounded-[16px] rounded-tr-[4px] bg-ink px-4 py-2.5 text-[13px] leading-relaxed text-white">
        {text}
      </div>
    </div>
  );
}

export function ThinkingBubble() {
  return (
    <div className="flex items-center gap-2.5 animate-in fade-in-0 duration-300">
      <AiAvatar />
      <div className="flex items-center gap-1.5 rounded-[16px] rounded-tl-[4px] bg-card-sunken px-4 py-2.5">
        <Loader2 className="h-3 w-3 animate-spin text-ink-mute" strokeWidth={2} />
        <span className="text-[12px] text-ink-mute">Thinking…</span>
      </div>
    </div>
  );
}

export function BeatView({
  beat,
  answer,
  onAnswer,
  onContinue,
}: {
  beat: Beat;
  answer?: Answer;
  onAnswer?: (beat: QuestionBeatType, optionIds: string[]) => void;
  onContinue?: () => void;
}) {
  if (beat.kind === "ai-text") {
    return (
      <div className="flex items-start gap-2.5 animate-in fade-in-0 slide-in-from-bottom-1 duration-300">
        <AiAvatar />
        <div className="max-w-[88%] rounded-[16px] rounded-tl-[4px] bg-card-sunken px-4 py-2.5">
          <p className="text-[13px] leading-relaxed text-ink">{beat.text}</p>
        </div>
      </div>
    );
  }

  if (beat.kind === "checklist") {
    return (
      <div className="flex items-start gap-2.5 animate-in fade-in-0 slide-in-from-bottom-1 duration-300">
        <AiAvatar />
        <div className="max-w-[92%] flex-1 rounded-[16px] rounded-tl-[4px] bg-card-sunken px-4 py-3.5">
          <p className="text-[12.5px] font-semibold text-ink mb-2.5">{beat.heading}</p>
          <div className="space-y-2">
            {beat.items.map((item, i) => {
              const [label, detail] = item.split(" — ");
              return (
                <div
                  key={item}
                  className="flex items-start gap-2 animate-in fade-in-0 slide-in-from-left-1"
                  style={{ animationDelay: `${i * 260}ms`, animationDuration: "300ms", animationFillMode: "backwards" }}
                >
                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-status-green" strokeWidth={2.5} />
                  <p className="text-[12px] leading-relaxed text-ink-soft">
                    <span className="text-ink">{label}</span>
                    {detail && <span className="text-ink-mute"> — {detail}</span>}
                  </p>
                </div>
              );
            })}
          </div>
          <p
            className="mt-3 pt-3 border-t border-border text-[12.5px] text-ink animate-in fade-in-0"
            style={{ animationDelay: `${beat.items.length * 260 + 200}ms`, animationDuration: "300ms", animationFillMode: "backwards" }}
          >
            {beat.closing}
          </p>
        </div>
      </div>
    );
  }

  if (beat.kind === "question") {
    return <QuestionBeat beat={beat} answer={answer} onAnswer={onAnswer} />;
  }

  if (beat.kind === "cta") {
    return (
      <div className="flex items-start gap-2.5 animate-in fade-in-0 slide-in-from-bottom-1 duration-300">
        <AiAvatar />
        <div className="max-w-[88%] rounded-[16px] rounded-tl-[4px] bg-accent-soft px-4 py-3.5">
          <p className="text-[13px] leading-relaxed text-accent-ink">{beat.text}</p>
          <Button size="sm" className="mt-3" onClick={onContinue}>
            {beat.buttonLabel}
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
          </Button>
        </div>
      </div>
    );
  }

  return null;
}

function QuestionBeat({
  beat,
  answer,
  onAnswer,
}: {
  beat: QuestionBeatType;
  answer?: Answer;
  onAnswer?: (beat: QuestionBeatType, optionIds: string[]) => void;
}) {
  const [pending, setPending] = useState<string[]>([]);
  const answered = !!answer;

  function toggle(id: string) {
    if (answered) return;
    if (beat.multiSelect) {
      setPending((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
    } else {
      onAnswer?.(beat, [id]);
    }
  }

  return (
    <div className="flex items-start gap-2.5 animate-in fade-in-0 slide-in-from-bottom-1 duration-300">
      <AiAvatar />
      <div className="max-w-[92%] flex-1 rounded-[16px] rounded-tl-[4px] bg-card-sunken px-4 py-3.5">
        <p className="text-[13px] font-medium text-ink">{beat.question}</p>
        {beat.aiNote && <p className="mt-1 text-[11.5px] italic text-ink-mute">{beat.aiNote}</p>}

        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
          {beat.options.map((opt) => {
            const isChosen = answered
              ? answer!.optionIds.includes(opt.id)
              : pending.includes(opt.id);
            return (
              <button
                key={opt.id}
                disabled={answered}
                onClick={() => toggle(opt.id)}
                className={cn(
                  "text-left rounded-[12px] border px-3 py-2.5 transition-colors",
                  isChosen ? "border-accent bg-accent-soft" : "border-border bg-card hover:border-border-strong",
                  answered && !isChosen && "opacity-50"
                )}
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-[12.5px] font-medium text-ink">{opt.label}</span>
                  {opt.recommended && !answered && <span className="text-[10px] text-accent-ink">Recommended</span>}
                  {isChosen && <Check className="h-3 w-3 text-accent-ink ml-auto" strokeWidth={2.5} />}
                </div>
                {opt.description && <p className="mt-0.5 text-[11px] text-ink-mute leading-snug">{opt.description}</p>}
              </button>
            );
          })}
        </div>

        {beat.multiSelect && !answered && (
          <Button size="sm" className="mt-3" disabled={pending.length === 0} onClick={() => onAnswer?.(beat, pending)}>
            Continue
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
          </Button>
        )}
      </div>
    </div>
  );
}
