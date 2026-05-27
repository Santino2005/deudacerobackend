export type StoredExerciseResult = {
  id: string
  title: string
  answer: string
  score?: number
  timeSpent?: number
  details?: Record<string, unknown>
  createdAt: string
}

export type StoredModuleStatus = 'completed' | 'in_review'

export type StoredModuleResult = {
  moduleId: string
  moduleName: string
  status: StoredModuleStatus
  startedAt: string
  finishedAt: string
  totalScore?: number
  maxScore?: number
  results: StoredExerciseResult[]
}

export type StoredModuleProgress = {
  moduleId: string
  moduleName: string
  status: 'in_progress'
  currentStage?: string
  currentIndex?: number
  currentQuestionIndex?: number
  answers?: Record<string, unknown>
  results: StoredExerciseResult[]
  updatedAt: string
}

const PREFIX = 'mi_module_result_'
const PROGRESS_PREFIX = 'mi_module_progress_'

export function storageKey(moduleId: string, participantId: string) {
  return `${PREFIX}${moduleId}_${participantId}`
}

export function progressStorageKey(moduleId: string, participantId: string) {
  return `${PROGRESS_PREFIX}${moduleId}_${participantId}`
}

export function getStoredModuleResult(
    moduleId: string,
    participantId: string
): StoredModuleResult | null {
  if (typeof window === 'undefined') return null

  const raw = localStorage.getItem(storageKey(moduleId, participantId))

  if (!raw) return null

  try {
    return JSON.parse(raw) as StoredModuleResult
  } catch {
    return null
  }
}

export function saveStoredModuleResult(
    result: StoredModuleResult,
    participantId: string
) {
  if (typeof window === 'undefined') return

  localStorage.setItem(
      storageKey(result.moduleId, participantId),
      JSON.stringify(result)
  )

  import('./moduleResultSupabase')
      .then(({ saveModuleResultToSupabase }) => {
        saveModuleResultToSupabase(result, participantId).catch(console.error)
      })
}

export function getStoredModuleProgress(
    moduleId: string,
    participantId: string
): StoredModuleProgress | null {
  if (typeof window === 'undefined') return null

  const raw = localStorage.getItem(progressStorageKey(moduleId, participantId))

  if (!raw) return null

  try {
    return JSON.parse(raw) as StoredModuleProgress
  } catch {
    return null
  }
}

export function saveStoredModuleProgress(
    progress: StoredModuleProgress,
    participantId: string
) {
  if (typeof window === 'undefined') return

  localStorage.setItem(
      progressStorageKey(progress.moduleId, participantId),
      JSON.stringify(progress)
  )
}

export function clearStoredModuleProgress(moduleId: string, participantId: string) {
  if (typeof window === 'undefined') return

  localStorage.removeItem(progressStorageKey(moduleId, participantId))
}