export type SectionId =
  | "identity"
  | "purpose"
  | "responsibilities"
  | "team"
  | "skills"
  | "tools"
  | "contract"
  | "knowledge"
  | "governance"
  | "dod"
  | "kpis"
  | "budget";

export type SectionStatus = "pending" | "suggested";

export interface QuestionOption {
  id: string;
  label: string;
  description?: string;
  recommended?: boolean;
}

interface BeatBase {
  id: string;
  reveals?: SectionId[];
}

export interface AiTextBeat extends BeatBase {
  kind: "ai-text";
  text: string;
}

export interface ChecklistBeat extends BeatBase {
  kind: "checklist";
  heading: string;
  items: string[];
  closing: string;
}

export interface QuestionBeat extends BeatBase {
  kind: "question";
  question: string;
  aiNote?: string;
  multiSelect?: boolean;
  options: QuestionOption[];
}

export interface CtaBeat extends BeatBase {
  kind: "cta";
  text: string;
  buttonLabel: string;
}

export type Beat = AiTextBeat | ChecklistBeat | QuestionBeat | CtaBeat;

export interface Answer {
  beatId: string;
  optionIds: string[];
  summary: string;
}
