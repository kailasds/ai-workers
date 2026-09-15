export interface DeliveryPulseMetric {
  id: string;
  label: string;
  value: number;
  suffix?: string;
  sub: string;
  trend: { direction: "up" | "down" | "flat"; label: string; goodWhenUp?: boolean };
}

export const deliveryPulse: DeliveryPulseMetric[] = [
  { id: "registered", label: "Registered Workers", value: 177, sub: "Composed and active", trend: { direction: "up", label: "+12 vs last period" } },
  { id: "packaged", label: "Packaged", value: 30, sub: "Sealed into an artefact", trend: { direction: "up", label: "+5 vs last period" } },
  { id: "active", label: "Active Workers", value: 3, sub: "Running and answering", trend: { direction: "flat", label: "Steady this week" } },
  { id: "completed", label: "Completed runs", value: 39, sub: "In selected period", trend: { direction: "up", label: "+18% vs last period" } },
  { id: "avgRun", label: "Average run time", value: 24.5, suffix: " min", sub: "39 measured runs", trend: { direction: "down", label: "−3.2 min vs last period", goodWhenUp: false } },
];

export interface RunsByDay {
  date: string;
  count: number;
}

export const completedRunsByPeriod: RunsByDay[] = [
  { date: "10 Sep", count: 10 },
  { date: "11 Sep", count: 21 },
  { date: "12 Sep", count: 5 },
  { date: "13 Sep", count: 1 },
  { date: "14 Sep", count: 1 },
  { date: "15 Sep", count: 1 },
];

export interface DoDCriterion {
  id: string;
  label: string;
  passed: number;
  total: number;
  note: string;
  hasBar: boolean;
}

export const definitionOfDoneEvidence = {
  criteriaMeasured: 5,
  recordedChecks: 143,
  criteria: [
    { id: "evals", label: "EVALs Pass Rate", passed: 15, total: 39, note: "Bar 80% · stops a release", hasBar: true },
    { id: "functional", label: "Functional Equivalence", passed: 27, total: 39, note: "Bar 85% · stops a release", hasBar: true },
    { id: "traceability", label: "Source to target traceability report", passed: 8, total: 8, note: "No bar set", hasBar: false },
    { id: "specs", label: "Specs Coverage", passed: 39, total: 39, note: "Bar 85% · stops a release", hasBar: true },
    { id: "unit", label: "Unit test Cases passed", passed: 7, total: 18, note: "Bar 85% · stops a release", hasBar: true },
  ] satisfies DoDCriterion[],
};

export interface PortfolioRow {
  id: string;
  label: string;
  value: number;
  sub: string;
  pct: number;
}

export const workersByIdentity: PortfolioRow[] = [
  { id: "integration-modernization", label: "Integration modernization", value: 177, sub: "177 Workers · 30 sealed · 39 completed runs", pct: 100 },
];

export const workersByBoundedContext: PortfolioRow[] = [
  { id: "target-code", label: "Converts Integration Service to Target Code", value: 159, sub: "159 Workers · 18 sealed · 20 completed runs", pct: 90 },
  { id: "unit-tested", label: "Converts Integration Service to Unit Tested Target Code", value: 16, sub: "16 Workers · 10 sealed · 11 completed runs", pct: 9 },
  { id: "traced", label: "Converts Integration Service to Traced Target Code", value: 2, sub: "2 Workers · 2 sealed · 8 completed runs", pct: 1 },
];

export const runsByAutonomy: PortfolioRow[] = [
  { id: "level-3", label: "Level 3", value: 39, sub: "39 completed runs", pct: 100 },
];

export const runCost = {
  modelCostPerRun: 12.41,
  tokensPerRun: "5.6M",
  tokensInPeriod: "219.5M",
  note: "Runs record their tokens as a total, not per model, so the spend above cannot be split between them.",
};

export const modelRouting = {
  model: "Claude-5.0-Sonnet",
  stagesRouted: 178,
  stages: ["Analyzer", "Code remediator", "Evaluator", "Modernizer", "Spec generator", "Specs evaluator", "Specs generator", "Summarizer", "Validator"],
};

export const workerReadiness = {
  ready: 0,
  active: 3,
};
