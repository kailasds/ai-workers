// Reads for Knowledge, Compose catalogues, Harnesses, Sentinel and Learning. In mock mode
// each serves the 2026-10-06 offline capture; live mode calls the console API.

import { apiGet, USE_MOCK } from './client'
import { mockRead } from './mock/read'
import skills from '@/data/mock/knowledge-skills.json'
import dsl from '@/data/mock/dsl-domains.json'
import rubrics from '@/data/mock/dod-rubrics.json'
import evals from '@/data/mock/compose-evaluations.json'
import models from '@/data/mock/compose-models.json'
import workerTypes from '@/data/mock/worker-types.json'
import geographies from '@/data/mock/geographies.json'
import harnesses from '@/data/mock/harnesses.json'
import sentinelOverview from '@/data/mock/platform-sentinel-overview.json'
import sentinelLearning from '@/data/mock/sentinel-learning.json'
import learningWorkers from '@/data/mock/learning-workers.json'
import sourcePublication from '@/data/mock/source-publication.json'
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

function read<T>(path: string, mock: () => T) {
  return ({ signal, scenario }: Options = {}): Promise<T> => (USE_MOCK ? mockRead(scenario, mock, signal) : apiGet<T>(path, signal))
}

export const getSkillLibrary = read<SkillLibrary>('/knowledge-base/skills', () => skills as unknown as SkillLibrary)
export const getDslDomains = read<{ domains: DslDomain[] }>('/compose/dsl/domains', () => dsl as unknown as { domains: DslDomain[] })
export const getDodRubrics = read<{ rubrics: DodRubric[] }>('/compose/dod-rubrics', () => rubrics as unknown as { rubrics: DodRubric[] })
export const getEvaluations = read<{ evaluations: Evaluation[] }>('/compose/catalog?only=evaluations', () => evals as unknown as { evaluations: Evaluation[] })
export const getModels = read<{ models: ModelEntry[] }>('/compose/catalog?only=models', () => models as unknown as { models: ModelEntry[] })
export const getWorkerTypes = read<{ types: WorkerType[] }>('/compose/worker-types', () => workerTypes as unknown as { types: WorkerType[] })
export const getGeographies = read<{ geographies: Geography[]; everywhere: string[] }>('/compose/geographies', () => geographies as unknown as { geographies: Geography[]; everywhere: string[] })
export const getHarnesses = read<{ harnesses: Harness[]; common_trade_offs: string[] }>('/harnesses', () => harnesses as unknown as { harnesses: Harness[]; common_trade_offs: string[] })
export const getSentinelOverview = read<PlatformSentinelOverview>('/platform/sentinel/overview', () => sentinelOverview as unknown as PlatformSentinelOverview)
export const getSentinelLearning = read<SentinelLearningFleet>('/sentinel/learning', () => sentinelLearning as unknown as SentinelLearningFleet)
export const getLearningWorkers = read<LearningWorkers>('/learning/workers?period=all', () => learningWorkers as unknown as LearningWorkers)
export const getSourcePublication = read<SourcePublication>('/source-publication', () => sourcePublication as unknown as SourcePublication)
