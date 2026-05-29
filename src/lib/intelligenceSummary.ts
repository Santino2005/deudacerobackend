import { getStoredModuleResult, StoredModuleResult } from './moduleAttemptStorage'

export type IntelligenceModule = {
  id: string
  title: string
  shortTitle: string
  icon: string
  route: string
}

export type IntelligenceScore = {
  moduleId: string
  title: string
  score: number
  likertScore?: number
  openScore?: number
  evidence: string
}

export type IntelligenceAnalysis = {
  predominant: IntelligenceScore | null
  scores: IntelligenceScore[]
  summary: string
  recommendations: string[]
  generatedBy: 'ai' | 'local' | 'fallback'
}

export const intelligenceModules: IntelligenceModule[] = [
  { id: 'logico-matematica', title: 'Lógico-Matemática', shortTitle: 'Lógico', icon: '🔢', route: '/module/logico-matematica' },
  { id: 'linguistic', title: 'Lingüística', shortTitle: 'Lingüística', icon: '📝', route: '/modules/linguistic' },
  { id: 'inteligencia-espacial', title: 'Espacial', shortTitle: 'Espacial', icon: '🧩', route: '/module/inteligencia-espacial' },
  { id: 'musical', title: 'Musical', shortTitle: 'Musical', icon: '🎵', route: '/modules/musical' },
  { id: 'body-kinesthetic', title: 'Corporal-Cinestésica', shortTitle: 'Corporal', icon: '🏃', route: '/modules/body-kinesthetic' },
  { id: 'naturalistic', title: 'Naturalista', shortTitle: 'Naturalista', icon: '🌿', route: '/modules/naturalistic' },
  { id: 'intrapersonal', title: 'Intrapersonal', shortTitle: 'Intrapersonal', icon: '🧠', route: '/modules/intrapersonal' },
  { id: 'interpersonal', title: 'Interpersonal', shortTitle: 'Interpersonal', icon: '👥', route: '/modules/interpersonal' },
]

export function getModuleAverage(result: StoredModuleResult | null) {
    if (!result?.results?.length) return 0

    if (
        typeof result.totalScore === 'number' &&
        typeof result.maxScore === 'number' &&
        result.maxScore > 0
    ) {
        return Math.round((result.totalScore / result.maxScore) * 100)
    }

    const localScores = result.results
        .filter((item) => item.details?.type !== 'open')
        .map((item) => Number(item.score))
        .filter((score) => !Number.isNaN(score))

    if (!localScores.length) return 0

    const total = localScores.reduce((sum, score) => sum + score, 0)

    return Math.round(total / localScores.length)
}

export function getWeightedModuleScore(
    likertScore: number,
    openScore: number
) {
  return Math.round(likertScore * 0.6 + openScore * 0.4)
}

export function getCompletedResults(participantId: string) {
  return intelligenceModules
      .map((module) => ({
        module,
        result: getStoredModuleResult(module.id, participantId),
      }))
      .filter((item) => item.result?.status === 'completed')
}

export function buildLocalAnalysis(
    results: StoredModuleResult[]
): IntelligenceAnalysis {
  const scores = intelligenceModules
      .map((module) => {
        const result = results.find((item) => item.moduleId === module.id) ?? null
        const likertScore = getModuleAverage(result)

        return {
          moduleId: module.id,
          title: module.title,
          score: likertScore,
          likertScore,
          openScore: 0,
            evidence: result
                ? `Resultado objetivo: ${likertScore}/100 sobre ${result.results.length} actividades.`
                : 'Módulo pendiente.',
        }
      })
      .sort((a, b) => b.score - a.score)

  const predominant = scores.find((item) => item.score > 0) ?? null

  return {
    predominant,
    scores,
    summary: predominant
        ? `La inteligencia que predomina es ${predominant.title}. Este resultado usa el promedio local de preguntas Likert/objetivas.`
        : 'Todavía no hay suficientes módulos completados para estimar una inteligencia predominante.',
    recommendations: predominant
        ? [
          `Explorar actividades vinculadas con ${predominant.title}.`,
          'Completar los módulos pendientes para mejorar la precisión del perfil.',
          'Usar este resultado como orientación inicial, no como diagnóstico definitivo.',
        ]
        : ['Completá al menos un módulo para generar el perfil.'],
    generatedBy: 'local',
  }
}