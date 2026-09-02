import type { DeploymentConfig, DoDRequirement, ModelConfig, OperatingMode } from "@/lib/types";

export type StepId = "purpose" | "capabilities" | "models" | "dod" | "customer" | "safety" | "package";

export interface WorkerTemplate {
  id: string;
  name: string;
  description: string;
  capabilityCount: number;
  suggestedModels: string;
  suggestedSafety: string;
  suggestedDoDCount: number;
  namePrefill: string;
  objectivePrefill: string;
  inputBoundaryPrefill: string;
  businessContextPrefill: string;
  willList: string[];
  skills: string[];
  tools: string[];
}

export interface ImportedPackage {
  id: string;
  name: string;
  team: string;
  version: string;
  agents: number;
  skills: string[];
  tools: string[];
  apis: number;
  lastUpdated: string;
  compatibility: "Compatible" | "Needs Review";
}

export type ConfigControl = "platform" | "view" | "customer";

export interface CustomerConfigItem {
  id: string;
  label: string;
  control: ConfigControl;
  requiresApproval: boolean;
}

export interface ConfigChangeLogItem {
  id: string;
  setting: string;
  from: string;
  to: string;
  changedBy: string;
  status: "Pending Review" | "Approved" | "Rejected";
  timestamp: string;
}

export interface ComposeDoDSection {
  id: string;
  title: string;
  requirements: DoDRequirement[];
}

export interface ComposeState {
  templateId: string | null;
  name: string;
  owner: string;
  businessContext: string;
  objective: string;
  inputBoundary: string;
  willList: string[];
  wontList: string[];
  capabilitiesMode: "build" | "import";
  skills: string[];
  tools: string[];
  importedPackage: ImportedPackage | null;
  operatingMode: OperatingMode;
  alwaysRequireApproval: string[];
  modelConfig: ModelConfig;
  deployment: DeploymentConfig;
  dodSections: ComposeDoDSection[];
  perTaskLimit: number;
  monthlyBudget: number;
  customerConfig: CustomerConfigItem[];
  syncMethod: string;
}
