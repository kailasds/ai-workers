import { workers } from "./data";

export type ExperienceCategory =
  | "Decision Patterns"
  | "Domain Knowledge"
  | "Successful Workflows"
  | "Resolution Strategies"
  | "Failure Prevention Patterns";

export interface ExperienceAsset {
  id: string;
  name: string;
  sourceWorkerId: string;
  sourceWorkerName: string;
  category: ExperienceCategory;
  validatedCases: number;
  compatibility: "High" | "Medium" | "Low";
  description: string;
}

export const experienceAssets: ExperienceAsset[] = [
  {
    id: "exp-1",
    name: "Migration Resolution Patterns",
    sourceWorkerId: "cobol-modernization-worker",
    sourceWorkerName: "COBOL Modernization Worker",
    category: "Resolution Strategies",
    validatedCases: 324,
    compatibility: "High",
    description: "How CICS transaction edge cases were resolved during the ClaimsService and PaymentEngine migrations.",
  },
  {
    id: "exp-2",
    name: "Copybook-to-DTO Mapping",
    sourceWorkerId: "cobol-modernization-worker",
    sourceWorkerName: "COBOL Modernization Worker",
    category: "Decision Patterns",
    validatedCases: 31,
    compatibility: "High",
    description: "A validated mapping from nested copybook redefinitions to flattened Java DTOs, promoted after certification.",
  },
  {
    id: "exp-3",
    name: "Claims Domain Vocabulary",
    sourceWorkerId: "cobol-modernization-worker",
    sourceWorkerName: "COBOL Modernization Worker",
    category: "Domain Knowledge",
    validatedCases: 86,
    compatibility: "Medium",
    description: "Insurance claims and policy domain concepts grounded from enterprise sources during modernization work.",
  },
  {
    id: "exp-4",
    name: "Contract Test Generation Workflow",
    sourceWorkerId: "fullstack-java-engineer",
    sourceWorkerName: "Full Stack Java Engineer",
    category: "Successful Workflows",
    validatedCases: 58,
    compatibility: "High",
    description: "A repeatable sequence for generating contract tests before backend implementation begins.",
  },
  {
    id: "exp-5",
    name: "Pagination Contract Pattern",
    sourceWorkerId: "fullstack-java-engineer",
    sourceWorkerName: "Full Stack Java Engineer",
    category: "Decision Patterns",
    validatedCases: 17,
    compatibility: "Medium",
    description: "A reusable contract pattern for paginated list endpoints, validated across 3 services.",
  },
  {
    id: "exp-6",
    name: "Batch Job Restart Failure Modes",
    sourceWorkerId: "cobol-modernization-worker",
    sourceWorkerName: "COBOL Modernization Worker",
    category: "Failure Prevention Patterns",
    validatedCases: 9,
    compatibility: "Low",
    description: "A resumable batch job pattern that did not generalize to settlement jobs with external callouts — kept as a caution.",
  },
];

export const experienceMetrics = {
  totalAssets: experienceAssets.length,
  transferableAssets: experienceAssets.filter((a) => a.compatibility !== "Low").length,
  validatedPatterns: experienceAssets.reduce((n, a) => n + a.validatedCases, 0),
  contributingWorkers: new Set(experienceAssets.map((a) => a.sourceWorkerId)).size,
};

export const experienceGraph = workers
  .filter((w) => experienceAssets.some((a) => a.sourceWorkerId === w.id))
  .map((w) => ({ id: w.id, name: w.name }));
