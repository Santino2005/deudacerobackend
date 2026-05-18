export type StoredExerciseResult = {
  id: string
  title: string
  answer: string
  score?: number
  timeSpent?: number
  details?: Record<string, unknown>
  createdAt: string
}

export type StoredModuleResult = {
  moduleId: string
  moduleName: string
  status: 'in_review'
  startedAt: string
  finishedAt: string
  results: StoredExerciseResult[]
}

const PREFIX = 'mi_module_result_'

export function storageKey(moduleId: string, participantId: string) {
  return `${PREFIX}${moduleId}_${participantId}`
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