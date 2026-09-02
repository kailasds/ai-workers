import { workers } from "./data";
import { experienceAssets } from "./experience-data";

export type LiveStatus = "Running" | "Idle" | "Requires Attention" | "Offline";
export type DeploymentStatus = "Live" | "Staging" | "Provisioning" | "Paused";
export type FleetHealth = "Healthy" | "Degraded" | "Critical";
export type RemoteAccessLevel = "Secure" | "Read Only" | "Approval Required";

export interface WorkerDeployment {
  workerId: string;
  workerName: string;
  customer: string;
  version: string;
  deploymentStatus: DeploymentStatus;
  environment: string;
  experienceShared: number;
  budgetUsed: number;
  budgetMonthly: number;
  usageTasks: number;
  health: FleetHealth;
  liveStatus: LiveStatus;
  lastActivity: string;
  remoteAccess: RemoteAccessLevel;
}

const customers = ["Meridian Capital", "Meridian Capital — Sandbox", "Northbridge Insurance", "Pacific Mutual"];
const environments = ["Production", "Staging", "Customer VPC — East"];

function deploymentFor(index: number): Pick<WorkerDeployment, "deploymentStatus" | "environment" | "liveStatus" | "health" | "remoteAccess" | "customer"> {
  const patterns: Array<Pick<WorkerDeployment, "deploymentStatus" | "environment" | "liveStatus" | "health" | "remoteAccess" | "customer">> = [
    { deploymentStatus: "Live", environment: environments[0], liveStatus: "Running", health: "Healthy", remoteAccess: "Approval Required", customer: customers[0] },
    { deploymentStatus: "Live", environment: environments[2], liveStatus: "Running", health: "Healthy", remoteAccess: "Read Only", customer: customers[2] },
    { deploymentStatus: "Staging", environment: environments[1], liveStatus: "Idle", health: "Healthy", remoteAccess: "Secure", customer: customers[1] },
    { deploymentStatus: "Live", environment: environments[2], liveStatus: "Requires Attention", health: "Degraded", remoteAccess: "Approval Required", customer: customers[3] },
    { deploymentStatus: "Live", environment: environments[0], liveStatus: "Running", health: "Healthy", remoteAccess: "Approval Required", customer: customers[0] },
    { deploymentStatus: "Provisioning", environment: environments[1], liveStatus: "Offline", health: "Healthy", remoteAccess: "Secure", customer: customers[2] },
  ];
  return patterns[index % patterns.length];
}

export const deployments: WorkerDeployment[] = workers.map((w, i) => {
  const p = deploymentFor(i);
  return {
    workerId: w.id,
    workerName: w.name,
    customer: p.customer,
    version: w.version,
    deploymentStatus: p.deploymentStatus,
    environment: p.environment,
    experienceShared: experienceAssets.filter((a) => a.sourceWorkerId === w.id).length,
    budgetUsed: w.governance.budget.used,
    budgetMonthly: w.governance.budget.monthly,
    usageTasks: w.activeTasks + w.workHistory.length,
    health: p.health,
    liveStatus: p.liveStatus,
    lastActivity: w.executionTimeline.at(-1)?.time ?? "—",
    remoteAccess: p.remoteAccess,
  };
});
