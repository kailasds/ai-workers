import { getWorker } from "@/lib/data";
import type { Beat, ComposeState } from "./types";

export const draftWorker = getWorker("cobol-modernization-worker")!;

export const draftWillList = [
  "Analyze COBOL source code",
  "Understand JCL execution flows",
  "Analyze copybooks",
  "Extract business rules",
  "Identify data dependencies",
  "Design the target Java architecture",
  "Generate the Java implementation",
  "Generate tests",
  "Validate behavioral equivalence",
  "Reconcile source and target outputs",
  "Generate evidence of completion",
];

export const draftWontList = [
  ...draftWorker.scope.outOfScope,
  "Perform irreversible infrastructure changes",
  "Access systems it does not require",
];

export function createComposeDefaults(): ComposeState {
  const w = draftWorker;
  return {
    name: w.name,
    owner: w.owner,
    objective: w.scope.primaryPurpose,
    inputBoundary: w.scope.acceptedInputBoundary,
    willList: [...draftWillList],
    wontList: [...draftWontList],
    skills: w.skills.map((s) => s.name),
    tools: w.tools.map((t) => t.name),
    operatingMode: w.operatingMode,
    alwaysRequireApproval: [...w.governance.alwaysRequireApproval],
    modelConfig: { ...w.modelConfig },
    learningConfig: { ...w.learningConfig },
    deployment: { ...w.deployment },
    dodSections: w.definitionOfDone.sections.map((s) => ({
      id: s.id,
      title: s.title,
      requirements: s.requirements.map((r) => ({ ...r })),
    })),
    perTaskLimit: w.governance.budget.perTaskLimit,
    monthlyBudget: w.governance.budget.monthly,
  };
}

export const starterPrompts = [
  {
    label: "Modernize legacy applications",
    prompt:
      "I need an AI worker that can modernize our legacy COBOL applications into Java while preserving business logic.",
  },
  {
    label: "Automate testing and QA",
    prompt: "I need an AI worker that can automate regression testing and QA for our claims platform.",
  },
  {
    label: "Review and analyze code",
    prompt: "I need an AI worker that reviews pull requests for correctness, security and style before merge.",
  },
  {
    label: "Process enterprise documents",
    prompt: "I need an AI worker that extracts and structures data from incoming enterprise documents.",
  },
  {
    label: "Monitor compliance activities",
    prompt: "I need an AI worker that monitors ongoing work for policy and compliance violations.",
  },
  {
    label: "Build and maintain applications",
    prompt: "I need an AI worker that owns a bounded feature end-to-end, from API to UI, with tests.",
  },
];

export const defaultPrompt =
  "I need an AI worker that modernizes legacy COBOL applications into Java while preserving business behavior, and that proves functional equivalence before it can call the work done.";

export const understandingChecklist = [
  { label: "Identifying desired business outcome", detail: "Modernize legacy COBOL applications into Java" },
  { label: "Identifying source environment", detail: "COBOL, JCL, Copybooks, DB2 / VSAM" },
  { label: "Identifying target environment", detail: "Java, Spring Boot" },
  { label: "Identifying expected deliverables", detail: "Modernized code + validation evidence" },
  { label: "Identifying work boundaries", detail: "Legacy analysis → implementation → validation" },
  {
    label: "Identifying potential risks",
    detail: "Business rule preservation, behavioral equivalence, data integrity, production access",
  },
];

export const beats: Beat[] = [
  {
    id: "checklist",
    kind: "checklist",
    heading: "Understanding your objective",
    items: understandingChecklist.map((c) => `${c.label} — ${c.detail}`),
    closing: "I've identified the core requirements. I'm preparing an initial Worker Blueprint.",
  },
  {
    id: "identity-reveal",
    kind: "ai-text",
    text: "I've designed an initial AI Worker for you. Based on your objective, here's the structure I recommend — you can review or modify anything below.",
    reveals: ["identity", "purpose", "responsibilities"],
  },
  {
    id: "q-autonomy",
    kind: "question",
    question: "How independently should this Worker operate?",
    aiNote:
      "Because this worker can modify enterprise code, I recommend Guarded autonomy — it can act independently within approved boundaries, but high-impact actions like merging or deployment always need a human.",
    options: [
      {
        id: "supervised",
        label: "Supervised",
        description: "The worker works independently but pauses at defined approval checkpoints.",
      },
      {
        id: "guarded",
        label: "Guarded",
        description: "Operates independently within approved boundaries — recommended for this worker.",
        recommended: true,
      },
      {
        id: "autonomous",
        label: "Autonomous",
        description: "Independently completes approved work within policy, no standing checkpoints.",
      },
    ],
    reveals: ["governance"],
  },
  {
    id: "q-repo",
    kind: "question",
    question: "Where should this Worker access the source code?",
    options: [
      { id: "github", label: "Connect GitHub", recommended: true },
      { id: "gitlab", label: "Connect GitLab" },
      { id: "enterprise", label: "Connect enterprise repository" },
      { id: "upload", label: "Upload artifacts" },
    ],
    reveals: ["tools"],
  },
  {
    id: "q-priority",
    kind: "question",
    question: "What matters most for this Worker?",
    aiNote: "Pick as many as apply — I'll weight the design and KPIs toward these.",
    multiSelect: true,
    options: [
      { id: "accuracy", label: "🎯 Accuracy", recommended: true },
      { id: "speed", label: "⚡ Speed" },
      { id: "cost", label: "💰 Cost efficiency" },
      { id: "risk", label: "🛡 Risk reduction", recommended: true },
    ],
    reveals: ["kpis"],
  },
  {
    id: "team-reveal",
    kind: "ai-text",
    text: "Your requested outcome requires multiple specialist capabilities. I recommend the following coordinated Agent Team, with one orchestrator sequencing each stage of the transformation.",
    reveals: ["team"],
  },
  {
    id: "team-note",
    kind: "ai-text",
    text: "I recommend keeping Verification independent from Implementation, so the same system doesn't validate its own work — it runs a final, independent check against tests, business rules and evidence before this worker can call anything done.",
  },
  {
    id: "skills-reveal",
    kind: "ai-text",
    text: "Based on the Worker's responsibilities, I recommend the following capabilities, grouped by what they're for.",
    reveals: ["skills"],
  },
  {
    id: "tools-reveal",
    kind: "ai-text",
    text: "Based on the proposed workflow, here's the access I recommend — scoped to exactly what this worker needs, nothing more.",
    reveals: ["tools"],
  },
  {
    id: "models-reveal",
    kind: "ai-text",
    text: "For a task this consequential, I recommend routing through a primary model plus an independent verifier — the same model shouldn't grade its own work.",
    reveals: ["models"],
  },
  {
    id: "contract-reveal",
    kind: "ai-text",
    text: "I've generated an operating contract for this Worker — objective, inputs, outputs, constraints and execution boundaries — so it isn't operating from a vague prompt.",
    reveals: ["contract"],
  },
  {
    id: "knowledge-reveal",
    kind: "ai-text",
    text: "I've identified knowledge sources that will improve this Worker's accuracy. It can be created without them, but connecting them helps it make better decisions.",
    reveals: ["knowledge"],
  },
  {
    id: "governance-reveal",
    kind: "ai-text",
    text: "Here's the governance I recommend — production access is restricted, and human approval is required at the checkpoints that matter most.",
    reveals: ["governance"],
  },
  {
    id: "dod-reveal",
    kind: "ai-text",
    text: "Here's when this Worker can say the work is done. It can't mark this task complete until every required checkpoint below is satisfied, with evidence attached.",
    reveals: ["dod"],
  },
  {
    id: "kpis-reveal",
    kind: "ai-text",
    text: "Based on the Worker's purpose, I recommend measuring these outcomes — not raw activity like prompt or token counts.",
    reveals: ["kpis"],
  },
  {
    id: "budget-reveal",
    kind: "ai-text",
    text: "Here are the operational boundaries I recommend for this Worker, including a hard stop if it approaches its approved budget.",
    reveals: ["budget"],
  },
  {
    id: "deployment-reveal",
    kind: "ai-text",
    text: "Finally, here's how I'd package and deliver this Worker — a runtime and resource profile sized to the workload, ready as a local test bundle first.",
    reveals: ["deployment"],
  },
  {
    id: "final-cta",
    kind: "cta",
    text: "I've generated the proposed Worker Contract, Agent Team, Skills, Governance controls, KPIs and Definition of Done. I need your review on a couple of high-impact decisions before this Worker is provisioned.",
    buttonLabel: "Review Worker Blueprint",
  },
];

const priorityBeat = beats.find((b) => b.id === "q-priority");
export const priorityLabel: Record<string, string> = Object.fromEntries(
  priorityBeat?.kind === "question" ? priorityBeat.options.map((o) => [o.id, o.label]) : []
);

export const provisioningSteps = [
  "Creating Worker Identity",
  "Registering Worker Role",
  "Provisioning Agent Team",
  "Assigning Skills",
  "Applying Governance Policies",
  "Configuring Tool Access",
  "Connecting Knowledge Sources",
  "Registering Definition of Done",
  "Configuring Evaluation Baseline",
  "Activating Monitoring",
];
