import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkle, UserPlus, RotateCcw, FileText, GitBranch, Mic } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { BeatView, UserBubble, ThinkingBubble } from "@/components/create-worker/chat-thread";
import { BlueprintPanel } from "@/components/create-worker/blueprint-panel";
import { ReviewStage } from "@/components/create-worker/review-stage";
import { ProvisioningStage } from "@/components/create-worker/provisioning-stage";
import { beats, defaultPrompt, starterPrompts, draftWorker, priorityLabel } from "@/components/create-worker/script";
import type { Answer, QuestionBeat, SectionId, SectionStatus } from "@/components/create-worker/types";
import type { AutonomyLevel } from "@/lib/types";

type Stage = "intro" | "working" | "review" | "provisioning";

const initialStatus: Record<SectionId, SectionStatus> = {
  identity: "pending",
  purpose: "pending",
  responsibilities: "pending",
  team: "pending",
  skills: "pending",
  tools: "pending",
  contract: "pending",
  knowledge: "pending",
  governance: "pending",
  dod: "pending",
  kpis: "pending",
  budget: "pending",
};

export default function CreateWorker() {
  const navigate = useNavigate();
  const [stage, setStage] = useState<Stage>("intro");
  const [prompt, setPrompt] = useState(defaultPrompt);
  const [userMessage, setUserMessage] = useState<string | null>(null);

  const [visibleBeatCount, setVisibleBeatCount] = useState(0);
  const [thinking, setThinking] = useState(false);
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [sectionStatus, setSectionStatus] = useState<Record<SectionId, SectionStatus>>(initialStatus);
  const [justRevealed, setJustRevealed] = useState<SectionId | null>(null);

  const [autonomy, setAutonomy] = useState<AutonomyLevel>("guarded");
  const [repoChoice, setRepoChoice] = useState<string | null>(null);
  const [priorities, setPriorities] = useState<string[]>([]);
  const [recommendationApplied, setRecommendationApplied] = useState(false);
  const [riskApplied, setRiskApplied] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);

  // Drive the scripted AI reasoning sequence.
  useEffect(() => {
    if (stage !== "working") return;

    if (visibleBeatCount === 0) {
      setThinking(true);
      const t = window.setTimeout(() => {
        setThinking(false);
        setVisibleBeatCount(1);
      }, 700);
      return () => window.clearTimeout(t);
    }

    const beat = beats[visibleBeatCount - 1];
    if (!beat) return;
    if (beat.kind === "question" || beat.kind === "cta") {
      setThinking(false);
      return;
    }

    const delay = beat.kind === "checklist" ? beat.items.length * 260 + 1000 : 1000;
    setThinking(true);
    const t = window.setTimeout(() => {
      setThinking(false);
      setVisibleBeatCount((c) => Math.min(c + 1, beats.length));
    }, delay);
    return () => window.clearTimeout(t);
  }, [stage, visibleBeatCount]);

  // Reveal blueprint sections as each beat lands.
  useEffect(() => {
    if (visibleBeatCount === 0) return;
    const beat = beats[visibleBeatCount - 1];
    if (!beat?.reveals?.length) return;
    const reveals = beat.reveals;
    setSectionStatus((prev) => {
      const next = { ...prev };
      reveals.forEach((id) => {
        next[id] = "suggested";
      });
      return next;
    });
    setJustRevealed(reveals[0]);
    const t = window.setTimeout(() => setJustRevealed(null), 1300);
    return () => window.clearTimeout(t);
  }, [visibleBeatCount]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [visibleBeatCount, thinking]);

  function startGeneration() {
    setUserMessage(prompt.trim());
    setStage("working");
    setVisibleBeatCount(0);
  }

  function handleAnswer(beat: QuestionBeat, optionIds: string[]) {
    const summary = beat.options
      .filter((o) => optionIds.includes(o.id))
      .map((o) => o.label)
      .join(", ");
    setAnswers((prev) => ({ ...prev, [beat.id]: { beatId: beat.id, optionIds, summary } }));

    if (beat.id === "q-autonomy") setAutonomy(optionIds[0] as AutonomyLevel);
    if (beat.id === "q-repo") {
      const label = beat.options.find((o) => o.id === optionIds[0])?.label ?? null;
      setRepoChoice(label ? label.replace(/^Connect /, "") : null);
    }
    if (beat.id === "q-priority") setPriorities(optionIds);

    window.setTimeout(() => setVisibleBeatCount((c) => Math.min(c + 1, beats.length)), 450);
  }

  function reset() {
    setStage("intro");
    setUserMessage(null);
    setVisibleBeatCount(0);
    setAnswers({});
    setSectionStatus(initialStatus);
    setJustRevealed(null);
    setAutonomy("guarded");
    setRepoChoice(null);
    setPriorities([]);
    setRecommendationApplied(false);
    setRiskApplied(false);
  }

  const visibleBeats = beats.slice(0, visibleBeatCount);

  if (stage === "review") {
    return (
      <ReviewStage
        autonomy={autonomy}
        priorities={priorities.map((id) => priorityLabel[id] ?? id)}
        recommendationApplied={recommendationApplied}
        riskApplied={riskApplied}
        onApplyRecommendation={() => setRecommendationApplied(true)}
        onApplyRisk={() => setRiskApplied(true)}
        onBack={() => setStage("working")}
        onCreate={() => setStage("provisioning")}
      />
    );
  }

  if (stage === "provisioning") {
    return (
      <ProvisioningStage
        onGoToWorker={() => navigate(`/workers/${draftWorker.id}`)}
        onAssignFirstTask={() => navigate("/work/assign")}
      />
    );
  }

  if (stage === "working") {
    return (
      <div className="flex h-[calc(100vh-3.5rem)] flex-col overflow-hidden">
        <div className="flex shrink-0 items-center justify-between border-b border-border-strong bg-card px-6 py-3">
          <div className="flex items-center gap-2">
            <Sparkle className="h-4 w-4 text-accent" strokeWidth={1.75} />
            <span className="text-[13px] font-medium text-ink">Designing your AI Worker</span>
          </div>
          <button
            onClick={reset}
            className="flex items-center gap-1.5 text-[12px] text-ink-mute transition hover:text-ink"
          >
            <RotateCcw className="h-3 w-3" strokeWidth={2} />
            Start over
          </button>
        </div>

        <div className="flex flex-1 min-h-0">
          <div className="flex-1 min-w-0 overflow-y-auto">
            <BlueprintPanel
              status={sectionStatus}
              justRevealed={justRevealed}
              autonomy={autonomy}
              repoChoice={repoChoice}
              priorities={priorities}
            />
          </div>

          <div className="w-[420px] shrink-0 overflow-y-auto border-l border-border-strong bg-card">
            <div className="space-y-4 px-5 py-6">
              {userMessage && <UserBubble text={userMessage} />}
              {visibleBeats.map((beat) => (
                <BeatView
                  key={beat.id}
                  beat={beat}
                  answer={answers[beat.id]}
                  onAnswer={handleAnswer}
                  onContinue={() => setStage("review")}
                />
              ))}
              {thinking && <ThinkingBubble />}
              <div ref={bottomRef} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-14">
      <PageHeader
        title="Create AI Worker"
        subtitle="Tell the platform what kind of AI employee you need — the AI helps design, configure, govern and provision it."
        icon={UserPlus}
        tone="accent"
      />

      <div className="px-8">
        <div className="rounded-card border border-border bg-card shadow-card p-6">
          <label className="text-[15px] font-semibold text-ink">What would you like your AI Worker to accomplish?</label>
          <p className="mt-1 text-[12.5px] text-ink-mute">
            Describe the outcome you're looking for. I'll help design the worker, its capabilities, team, governance and
            definition of success.
          </p>
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={4}
            className="mt-4"
            placeholder="I need an AI worker that can…"
          />

          <div className="mt-3 flex flex-wrap gap-1.5">
            <Badge variant="outline">
              <FileText className="h-3 w-3" strokeWidth={1.75} /> Paste a job description
            </Badge>
            <Badge variant="outline">
              <GitBranch className="h-3 w-3" strokeWidth={1.75} /> Connect a repository
            </Badge>
            <Badge variant="outline">
              <Mic className="h-3 w-3" strokeWidth={1.75} /> Voice input
            </Badge>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <p className="text-[12px] text-ink-mute">
              AI will propose scope, skills, an agent team, tools, governance, KPIs and a Definition of Done — not just a
              prompt.
            </p>
            <Button onClick={startGeneration} disabled={!prompt.trim()}>
              <Sparkle className="h-3.5 w-3.5" strokeWidth={1.5} />
              Design My Worker
            </Button>
          </div>
        </div>

        <p className="mt-5 text-[11.5px] font-semibold uppercase tracking-wider text-ink-faint">Or start from an example</p>
        <div className="mt-2.5 flex flex-wrap gap-2">
          {starterPrompts.map((s) => (
            <button
              key={s.label}
              onClick={() => setPrompt(s.prompt)}
              className="rounded-full border border-border-strong bg-card px-3.5 py-1.5 text-[12.5px] text-ink-soft transition hover:border-accent-border hover:text-accent-ink"
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
