// Reads for Knowledge, Compose catalogues, Harnesses, Sentinel and Learning. In mock mode
// each serves the 2026-10-06 offline capture; live mode calls the console API.

import { apiGet, USE_MOCK } from './client'
import { mockRead } from './mock/read'
import type {
  DodRubric,
  DslDomain,
  Evaluation,
  Geography,
  Harness,
  LearningWorkers,
  ModelEntry,
  PlatformSentinelOverview,
  SentinelLearningFleet,
  SkillLibrary,
  SourcePublication,
  WorkerType,
} from '@/lib/types/catalog'

interface Options {
  signal?: AbortSignal
  scenario?: string | null
}

// Each capture is loaded on first use, so the mock data stays out of the main bundle.
function read<T>(path: string, load: () => Promise<{ default: unknown }>) {
  return async ({ signal, scenario }: Options = {}): Promise<T> => {
    if (!USE_MOCK) return apiGet<T>(path, signal)
    const data = (await load()).default as T
    return mockRead(scenario, () => data, signal)
  }
}

export const getSkillLibrary = read<SkillLibrary>('/knowledge-base/skills', () => import('@/data/mock/knowledge-skills.json'))
export const getDslDomains = read<{ domains: DslDomain[] }>('/compose/dsl/domains', () => import('@/data/mock/dsl-domains.json'))
export const getDodRubrics = read<{ rubrics: DodRubric[] }>('/compose/dod-rubrics', () => import('@/data/mock/dod-rubrics.json'))
export const getEvaluations = read<{ evaluations: Evaluation[] }>('/compose/catalog?only=evaluations', () => import('@/data/mock/compose-evaluations.json'))
export const getModels = read<{ models: ModelEntry[] }>('/compose/catalog?only=models', () => import('@/data/mock/compose-models.json'))
export const getWorkerTypes = read<{ types: WorkerType[] }>('/compose/worker-types', () => import('@/data/mock/worker-types.json'))
export const getGeographies = read<{ geographies: Geography[]; everywhere: string[] }>('/compose/geographies', () => import('@/data/mock/geographies.json'))
export const getHarnesses = read<{ harnesses: Harness[]; common_trade_offs: string[] }>('/harnesses', () => import('@/data/mock/harnesses.json'))
export const getSentinelOverview = read<PlatformSentinelOverview>('/platform/sentinel/overview', () => import('@/data/mock/platform-sentinel-overview.json'))
export const getSentinelLearning = read<SentinelLearningFleet>('/sentinel/learning', () => import('@/data/mock/sentinel-learning.json'))
export const getLearningWorkers = read<LearningWorkers>('/learning/workers?period=all', () => import('@/data/mock/learning-workers.json'))
export const getSourcePublication = read<SourcePublication>('/source-publication', () => import('@/data/mock/source-publication.json'))
