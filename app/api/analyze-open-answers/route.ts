import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import {
    buildLocalAnalysis,
    getModuleAverage,
    getWeightedModuleScore,
    intelligenceModules,
} from '@/src/lib/intelligenceSummary'
import { StoredModuleResult } from '@/src/lib/moduleAttemptStorage'

type RequestBody = {
    participantId: string
    results: StoredModuleResult[]
    force?: boolean
}

const MIXED_OPEN_OBJECTIVE_MODULES = ['linguistic', 'musical']
const OPEN_ONLY_MODULES = ['intrapersonal', 'interpersonal']
const AI_EVALUATED_MODULES = [
    ...MIXED_OPEN_OBJECTIVE_MODULES,
    ...OPEN_ONLY_MODULES,
]

function getScoringMode(moduleId: string) {
    if (OPEN_ONLY_MODULES.includes(moduleId)) return 'open-only'
    if (MIXED_OPEN_OBJECTIVE_MODULES.includes(moduleId)) return 'mixed'

    return 'objective-only'
}

const answerScoreSchema = z.object({
    exerciseId: z.string(),
    title: z.string(),
    score: z.number().min(0).max(100),
    feedback: z.string(),
    evidence: z.string(),
})

const openScoreSchema = z.object({
    moduleId: z.string(),
    title: z.string(),
    openScore: z.number().min(0).max(100),
    evidence: z.string(),
    answers: z.array(answerScoreSchema),
})

const analysisSchema = z.object({
    scores: z.array(openScoreSchema),
    summary: z.string(),
    recommendations: z.array(z.string()),
    generatedBy: z.literal('ai'),
})

function getPrompt(compactResults: unknown, participantId: string) {
    return `
Sos un evaluador de respuestas abiertas en una app de orientación vocacional.

Vas a recibir todos los módulos, con todas las preguntas y respuestas, incluyendo actividades objetivas, Likert y abiertas.
Usá todo el contexto para entender el perfil, pero evaluá con puntaje únicamente las respuestas abiertas de los módulos que tengan scoringMode='mixed' u 'open-only'.

No diagnostiques.
No calcules el score final del módulo.
No reemplaces los scores Likert/objetivos.
Solo devolvé un openScore de 0 a 100 por módulo con respuestas abiertas ponderables. No devuelvas puntajes para módulos objective-only.

Formato obligatorio: devolvé únicamente JSON válido, sin markdown, con esta forma:
{
  "scores": [
    {
      "moduleId": "string",
      "title": "string",
      "openScore": 0,
      "evidence": "string",
      "answers": [
        {
          "exerciseId": "string",
          "title": "string",
          "score": 0,
          "feedback": "string",
          "evidence": "string"
        }
      ]
    }
  ],
  "summary": "string",
  "recommendations": ["string"],
  "generatedBy": "ai"
}

Criterio:
0-20: no responde o es irrelevante.
21-40: muy superficial.
41-60: responde parcialmente.
61-80: responde bien, con evidencia clara.
81-100: responde muy bien, con profundidad y ejemplos concretos.

Evaluá relevancia con la consigna, claridad, profundidad, especificidad, ejemplos concretos y consistencia.
Si las respuestas son vacías, de una letra, genéricas o irrelevantes, asigná puntaje bajo.

Datos:
${JSON.stringify({ participantId, modules: compactResults })}
`.trim()
}

function parseGeminiJson(text: string) {
    const cleaned = text
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/```$/i, '')
        .trim()

    return analysisSchema.parse(JSON.parse(cleaned))
}

async function analyzeWithGoogleAiStudio(prompt: string) {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY
    const model = process.env.GOOGLE_GENERATIVE_AI_MODEL ?? 'gemini-2.5-flash'

    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [
                    {
                        role: 'user',
                        parts: [{ text: prompt }],
                    },
                ],
                generationConfig: {
                    temperature: 0.2,
                    responseMimeType: 'application/json',
                },
            }),
        }
    )

    if (!response.ok) {
        throw new Error(`Google AI Studio error: ${response.status}`)
    }

    const data = await response.json()
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text

    if (typeof text !== 'string') {
        throw new Error('Google AI Studio no devolvió texto analizable')
    }

    return parseGeminiJson(text)
}

export async function POST(req: Request) {
    const body = (await req.json()) as RequestBody
    const participantId = body.participantId
    const results = Array.isArray(body.results) ? body.results : []
    const fallback = buildLocalAnalysis(results)

    try {
        const supabase = await createClient()

        if (participantId && !body.force) {
            const { data } = await supabase
                .from('assessment_analysis')
                .select('analysis')
                .eq('participant_id', participantId)
                .maybeSingle()

            if (data?.analysis) {
                return Response.json(data.analysis)
            }
        }

        if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY || results.length === 0) {
            return Response.json(fallback)
        }

        const compactResults = results
            .map((moduleResult) => ({
                moduleId: moduleResult.moduleId,
                moduleName: moduleResult.moduleName,
                scoringMode: getScoringMode(moduleResult.moduleId),
                usesOpenAnswerWeight:
                    AI_EVALUATED_MODULES.includes(moduleResult.moduleId),
                activities: moduleResult.results.map((item) => ({
                    exerciseId: item.id,
                    title: item.title,
                    type: item.details?.type ?? 'unknown',
                    prompt: item.details?.prompt,
                    answer: item.answer,
                    localScore: item.score,
                    details: item.details,
                })),
            }))
            .filter((moduleResult) => moduleResult.activities.length > 0)

        if (compactResults.length === 0) {
            return Response.json(fallback)
        }

        const aiAnalysis = await analyzeWithGoogleAiStudio(
            getPrompt(compactResults, participantId)
        )

        const finalScores = intelligenceModules
            .map((module) => {
                const result = results.find((item) => item.moduleId === module.id) ?? null
                const likertScore = getModuleAverage(result)
                const aiScore = aiAnalysis.scores.find((item) => item.moduleId === module.id)
                const openScore = aiScore?.openScore ?? 0
                const scoringMode = getScoringMode(module.id)

                const finalScore = (() => {
                    if (scoringMode === 'open-only') return openScore
                    if (scoringMode === 'mixed') {
                        return getWeightedModuleScore(likertScore, openScore)
                    }

                    return likertScore
                })()

                const answerFeedback =
                    aiScore?.answers
                        ?.map(
                            (answer) =>
                                `${answer.title}: ${answer.score}/100. ${answer.feedback}`
                        )
                        .join(' ') ?? ''

                return {
                    moduleId: module.id,
                    title: module.title,
                    score: finalScore,
                    likertScore,
                    openScore,
                    evidence: (() => {
                        if (scoringMode === 'open-only') {
                            return aiScore
                                ? `Abiertas IA: ${openScore}/100. Resultado final: ${finalScore}/100. ${aiScore.evidence} ${answerFeedback}`
                                : `Sin respuestas abiertas evaluadas por IA. Resultado final: ${finalScore}/100.`
                        }

                        if (scoringMode === 'mixed') {
                            return aiScore
                                ? `Objetivo: ${likertScore}/100. Abiertas IA: ${openScore}/100. Resultado final ponderado: ${finalScore}/100. ${aiScore.evidence} ${answerFeedback}`
                                : `Objetivo: ${likertScore}/100. Sin respuestas abiertas evaluadas. Resultado final ponderado: ${finalScore}/100.`
                        }

                        return `Objetivo/ejercicios: ${likertScore}/100. Este módulo no usa preguntas abiertas.`
                    })(),
                }
            })
            .sort((a, b) => b.score - a.score)

        const predominant = finalScores.find((item) => item.score > 0) ?? null

        const analysis = {
            predominant,
            scores: finalScores,
            summary: aiAnalysis.summary || fallback.summary,
            recommendations: aiAnalysis.recommendations.length
                ? aiAnalysis.recommendations
                : fallback.recommendations,
            generatedBy: 'ai' as const,
        }

        if (participantId) {
            await supabase.from('assessment_analysis').upsert({
                participant_id: participantId,
                analysis,
                generated_at: new Date().toISOString(),
            })
        }

        return Response.json(analysis)
    } catch (error) {
        console.error('Open answer analysis error:', error)

        return Response.json({
            ...fallback,
            generatedBy: 'fallback',
        })
    }
}
