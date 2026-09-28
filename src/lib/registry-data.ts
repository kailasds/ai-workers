export interface WorkerComposition {
  id: string;
  identityLabel: string;
  domainLabel: string;
  boundedContextLabel: string;
  boundedContextDescription: string;
  revision: number;
  skills: number;
  languages: number;
  evals: number;
  dodCount: number;
  authority: string;
  runsOn: string;
  composedAt: string;
  sealedAt?: string;
  status: "assembling" | "ready-to-package" | "sealed";
}

export const assemblingCount = 40;

export const readyToPackage: WorkerComposition[] = [
  {
    id: "wc-1",
    identityLabel: "Integration modernization · Payments",
    domainLabel: "Payments",
    boundedContextLabel: "Converts Integration Service to Target Code",
    boundedContextDescription: "payments",
    revision: 11,
    skills: 7,
    languages: 4,
    evals: 5,
    dodCount: 3,
    authority: "Acts within bounds",
    runsOn: "codeplus-integration-modernization",
    composedAt: "2026-09-15T05:11:00Z",
    status: "ready-to-package",
  },
  {
    id: "wc-2",
    identityLabel: "Integration modernization · Payments",
    domainLabel: "Payments",
    boundedContextLabel: "Converts Integration Service to Target Code",
    boundedContextDescription: "payments",
    revision: 11,
    skills: 7,
    languages: 4,
    evals: 5,
    dodCount: 3,
    authority: "Acts within bounds",
    runsOn: "codeplus-integration-modernization",
    composedAt: "2026-09-14T17:52:00Z",
    status: "ready-to-package",
  },
];

export const alreadyPackaged: WorkerComposition[] = [
  {
    id: "wc-3",
    identityLabel: "Integration modernization · Payments",
    domainLabel: "Payments",
    boundedContextLabel: "Converts Integration Service to Unit Tested Target Code",
    boundedContextDescription: "payments",
    revision: 11,
    skills: 6,
    languages: 4,
    evals: 5,
    dodCount: 4,
    authority: "Acts within bounds",
    runsOn: "codeplus-integration-modernization",
    composedAt: "2026-09-15T00:09:00Z",
    sealedAt: "2026-09-15T00:10:00Z",
    status: "sealed",
  },
  {
    id: "wc-4",
    identityLabel: "Integration modernization · Payments",
    domainLabel: "Payments",
    boundedContextLabel: "Converts Integration Service to Unit Tested Target Code",
    boundedContextDescription: "payments",
    revision: 11,
    skills: 7,
    languages: 4,
    evals: 5,
    dodCount: 4,
    authority: "Acts within bounds",
    runsOn: "codeplus-integration-modernization",
    composedAt: "2026-09-14T18:36:00Z",
    sealedAt: "2026-09-14T18:37:00Z",
    status: "sealed",
  },
  {
    id: "wc-5",
    identityLabel: "Integration modernization · Payments",
    domainLabel: "Payments",
    boundedContextLabel: "Converts Integration Service to Target Code",
    boundedContextDescription: "payments",
    revision: 11,
    skills: 7,
    languages: 4,
    evals: 5,
    dodCount: 3,
    authority: "Acts within bounds",
    runsOn: "codeplus-integration-modernization",
    composedAt: "2026-09-14T04:07:00Z",
    sealedAt: "2026-09-14T04:10:00Z",
    status: "sealed",
  },
  {
    id: "wc-6",
    identityLabel: "Integration modernization · Payments",
    domainLabel: "Payments",
    boundedContextLabel: "Converts Integration Service to Target Code",
    boundedContextDescription: "payments",
    revision: 11,
    skills: 7,
    languages: 4,
    evals: 5,
    dodCount: 3,
    authority: "Acts within bounds",
    runsOn: "codeplus-integration-modernization",
    composedAt: "2026-09-13T16:17:00Z",
    sealedAt: "2026-09-13T16:18:00Z",
    status: "sealed",
  },
  {
    id: "wc-7",
    identityLabel: "Integration modernization · Payments",
    domainLabel: "Payments",
    boundedContextLabel: "Converts Integration Service to Target Code",
    boundedContextDescription: "payments",
    revision: 11,
    skills: 7,
    languages: 4,
    evals: 5,
    dodCount: 3,
    authority: "Acts within bounds",
    runsOn: "codeplus-integration-modernization",
    composedAt: "2026-09-13T04:07:00Z",
    sealedAt: "2026-09-13T04:11:00Z",
    status: "sealed",
  },
  {
    id: "wc-8",
    identityLabel: "Integration modernization · Policy administration",
    domainLabel: "Policy administration",
    boundedContextLabel: "Converts Integration Service to Target Code",
    boundedContextDescription: "policy-administration",
    revision: 11,
    skills: 7,
    languages: 0,
    evals: 5,
    dodCount: 3,
    authority: "Acts within bounds",
    runsOn: "codeplus-integration-modernization",
    composedAt: "2026-09-13T15:58:00Z",
    sealedAt: "2026-09-13T15:59:00Z",
    status: "sealed",
  },
  {
    id: "wc-9",
    identityLabel: "Integration modernization · Payments",
    domainLabel: "Payments",
    boundedContextLabel: "Converts Integration Service to Target Code",
    boundedContextDescription: "payments",
    revision: 11,
    skills: 9,
    languages: 4,
    evals: 5,
    dodCount: 3,
    authority: "Acts within bounds",
    runsOn: "codeplus-integration-modernization",
    composedAt: "2026-09-13T12:38:00Z",
    sealedAt: "2026-09-13T12:47:00Z",
    status: "sealed",
  },
  {
    id: "wc-10",
    identityLabel: "Integration modernization · Payments",
    domainLabel: "Payments",
    boundedContextLabel: "Converts Integration Service to Target Code",
    boundedContextDescription: "payments",
    revision: 11,
    skills: 5,
    languages: 1,
    evals: 5,
    dodCount: 3,
    authority: "Acts within bounds",
    runsOn: "codeplus-integration-modernization",
    composedAt: "2026-09-13T09:37:00Z",
    sealedAt: "2026-09-13T09:40:00Z",
    status: "sealed",
  },
];

export interface DeliveryRecipient {
  id: string;
  workerLabel: string;
  customer: string;
  state: "Prepared" | "Shared" | "Acknowledged";
  expires: string;
  digest: string;
}

export const readyToDeliver: WorkerComposition[] = [
  {
    id: "wc-8",
    identityLabel: "Integration modernization · Policy administration",
    domainLabel: "Policy administration",
    boundedContextLabel: "Converts Integration Service to Target Code",
    boundedContextDescription: "policy-administration",
    revision: 11,
    skills: 7,
    languages: 0,
    evals: 5,
    dodCount: 3,
    authority: "Acts within bounds",
    runsOn: "codeplus-integration-modernization",
    composedAt: "2026-09-13T15:58:00Z",
    sealedAt: "2026-09-13T15:59:00Z",
    status: "sealed",
  },
  {
    id: "wc-9",
    identityLabel: "Integration modernization · Payments",
    domainLabel: "Payments",
    boundedContextLabel: "Converts Integration Service to Target Code",
    boundedContextDescription: "payments",
    revision: 11,
    skills: 9,
    languages: 4,
    evals: 5,
    dodCount: 3,
    authority: "Acts within bounds",
    runsOn: "codeplus-integration-modernization",
    composedAt: "2026-09-13T12:38:00Z",
    sealedAt: "2026-09-13T12:47:00Z",
    status: "sealed",
  },
];

export const deliveredHistory: DeliveryRecipient[] = [
  { id: "d-1", workerLabel: "Integration modernization · Payments", customer: "UK Bank", state: "Prepared", expires: "No share window", digest: "sha256:f863bc098c90…" },
  { id: "d-2", workerLabel: "Integration modernization · Payments", customer: "US Customer", state: "Prepared", expires: "No share window", digest: "sha256:66d0c86f0b61…" },
  { id: "d-3", workerLabel: "Integration modernization · Payments", customer: "Test", state: "Prepared", expires: "No share window", digest: "sha256:e54fccb63c12…" },
  { id: "d-4", workerLabel: "Integration modernization · Payments", customer: "End-to-end verification recipient", state: "Prepared", expires: "No share window", digest: "sha256:e565ae6f8986…" },
  { id: "d-5", workerLabel: "Integration modernization · Payments", customer: "End-to-end verification recipient", state: "Prepared", expires: "No share window", digest: "sha256:f36490d286ae…" },
  { id: "d-6", workerLabel: "Integration modernization · Payments", customer: "Customer secure delivery", state: "Prepared", expires: "No share window", digest: "sha256:3eca298b2265…" },
];
