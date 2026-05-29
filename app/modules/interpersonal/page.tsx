'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  clearStoredModuleProgress,
  getStoredModuleProgress,
  getStoredModuleResult,
  saveStoredModuleProgress,
  saveStoredModuleResult,
  StoredExerciseResult,
  StoredModuleResult,
} from '@/src/lib/moduleAttemptStorage'
import { getStoredParticipantId } from '@/src/lib/participantStorage'

const MODULE_ID = 'interpersonal'
const MODULE_NAME = 'Inteligencia Interpersonal'
const REQUIRED_SCENARIOS = 5

const scenarioBank = [
  {
    id: 'inter-scenario-empathy',
    title: 'Escucha y empatía',
    skill: 'empatía',
    prompt:
        'Un amigo te cuenta algo muy personal y te pide que no lo juzgues. ¿Te pasó con un amigo o más de uno? ¿Qué hiciste en esa situación?',
  },
  {
    id: 'inter-scenario-conflict',
    title: 'Conflicto grupal',
    skill: 'mediación',
    prompt:
        'En un trabajo grupal uno no participa y otro está enojado por eso. ¿Actuás en estas situaciones? Si intervenís, ¿cómo lo hacés y cómo afecta al grupo?',
  },
  {
    id: 'inter-scenario-support',
    title: 'Búsqueda de apoyo',
    skill: 'apertura social',
    prompt:
        'Tenés un problema importante y no sabés cómo resolverlo. ¿A quién acudís primero y por qué?',
  },
  {
    id: 'inter-scenario-bond',
    title: 'Vínculo cercano',
    skill: 'mantenimiento de vínculos',
    prompt:
        'Un amigo cercano se aleja repentinamente. ¿Intentás hablarlo o dejás que pase? ¿Por qué?',
  },
  {
    id: 'inter-scenario-teaching',
    title: 'Ayuda y enseñanza',
    skill: 'enseñanza',
    prompt:
        'Un compañero está buscando ayuda con un tema y vos sos particularmente bueno en eso. ¿Cómo actuás frente a esa situación?',
  },
  {
    id: 'inter-scenario-leadership',
    title: 'Inicio de proyecto',
    skill: 'liderazgo',
    prompt:
        'Te asignan un nuevo trabajo en grupo con una fecha límite. Nadie empieza todavía. ¿Quién da el primer paso para arrancar el proyecto? ¿Qué hacés vos?',
  },
  {
    id: 'inter-scenario-adaptation',
    title: 'Adaptación social',
    skill: 'adaptación social',
    prompt:
        'Llegás a la fiesta de un amigo donde no conocés a nadie. ¿Qué hacés en esa situación?',
  },
  {
    id: 'inter-scenario-community',
    title: 'Participación comunitaria',
    skill: 'participación social',
    prompt:
        'Surge una actividad solidaria o comunitaria. ¿Participás? ¿Por qué?',
  },
]

const mindCases = [
  {
    id: 'inter-mind-1',
    title: 'Teoría de la mente 1',
    prompt:
        'Ana dice: “no te preocupes, yo me encargo”, después de que varias veces criticó el trabajo de Juan. ¿Qué creés que puede ocurrir después y cómo actuarías para aclarar la situación?',
  },
  {
    id: 'inter-mind-2',
    title: 'Teoría de la mente 2',
    prompt:
        'Marcos felicita a su compañero frente al jefe, pero omite mencionar que el resultado fue grupal. ¿Qué intención podría haber detrás y cómo responderías sin escalar el conflicto?',
  },
  {
    id: 'inter-mind-3',
    title: 'Teoría de la mente 3',
    prompt:
        'Lucía ofrece ayuda a una amiga justo antes de pedirle un favor importante. ¿Cómo interpretarías esa conducta y qué harías para distinguir cooperación genuina de interés?',
  },
]

type Phase = 'scenarios' | 'mind'

export default function InterpersonalModule() {
  const router = useRouter()

  const [userKey, setUserKey] = useState<string | null>(null)
  const [completedResult, setCompletedResult] =
      useState<StoredModuleResult | null>(null)

  const [results, setResults] = useState<StoredExerciseResult[]>([])

  const [phase, setPhase] = useState<Phase>('scenarios')

  const [scenarioIndex, setScenarioIndex] = useState(0)
  const [mindIndex, setMindIndex] = useState(0)

  const [scenarioAnswers, setScenarioAnswers] =
      useState<Record<string, string>>({})

  const [mindAnswers, setMindAnswers] =
      useState<Record<string, string>>({})

  const [answeredScenarioIds, setAnsweredScenarioIds] =
      useState<string[]>([])

  const startedAt = useRef(new Date().toISOString())
  const exerciseStart = useRef(Date.now())
  const progressLoaded = useRef(false)

  useEffect(() => {
    const participantId = getStoredParticipantId()

    if (!participantId) {
      router.push('/')
      return
    }

    setUserKey(participantId)
  }, [router])

  useEffect(() => {
    exerciseStart.current = Date.now()
  }, [phase, scenarioIndex, mindIndex])

  const stored = useMemo(() => {
    if (!userKey) return null

    return getStoredModuleResult(MODULE_ID, userKey)
  }, [userKey])

  useEffect(() => {
    if (!userKey) return
    if (progressLoaded.current) return

    const progress = getStoredModuleProgress(
        MODULE_ID,
        userKey
    )

    if (!progress) {
      progressLoaded.current = true
      return
    }

    if (progress.currentStage) {
      setPhase(progress.currentStage as Phase)
    }

    if (typeof progress.currentIndex === 'number') {
      if (progress.currentStage === 'scenarios') {
        setScenarioIndex(progress.currentIndex)
      }

      if (progress.currentStage === 'mind') {
        setMindIndex(progress.currentIndex)
      }
    }

    setResults(progress.results ?? [])

    const saved = progress.answers as {
      scenarioAnswers?: Record<string, string>
      mindAnswers?: Record<string, string>
      answeredScenarioIds?: string[]
    }

    setScenarioAnswers(saved?.scenarioAnswers ?? {})
    setMindAnswers(saved?.mindAnswers ?? {})
    setAnsweredScenarioIds(saved?.answeredScenarioIds ?? [])

    progressLoaded.current = true
  }, [userKey])

  useEffect(() => {
    if (!userKey) return
    if (completedResult) return
    if (!progressLoaded.current) return

    saveStoredModuleProgress(
        {
          moduleId: MODULE_ID,
          moduleName: MODULE_NAME,
          status: 'in_progress',
          currentStage: phase,
          currentIndex:
              phase === 'scenarios'
                  ? scenarioIndex
                  : mindIndex,
          answers: {
            scenarioAnswers,
            mindAnswers,
            answeredScenarioIds,
          },
          results,
          updatedAt: new Date().toISOString(),
        },
        userKey
    )
  }, [
    userKey,
    completedResult,
    phase,
    scenarioIndex,
    mindIndex,
    scenarioAnswers,
    mindAnswers,
    answeredScenarioIds,
    results,
  ])

  if (!userKey) {
    return (
        <div className="flex min-h-screen items-center justify-center">
          Cargando...
        </div>
    )
  }

  if (stored?.status === 'completed' && !completedResult) {
    router.push('/dashboard')
    return null
  }

  const currentScenario = scenarioBank[scenarioIndex]

  const currentMindCase = mindCases[mindIndex]

  const scenarioAnswer =
      scenarioAnswers[currentScenario.id] ?? ''

  const mindAnswer =
      currentMindCase
          ? mindAnswers[currentMindCase.id] ?? ''
          : ''

  const totalActivities =
      REQUIRED_SCENARIOS + mindCases.length

  const completedActivities =
      phase === 'scenarios'
          ? answeredScenarioIds.length
          : REQUIRED_SCENARIOS + mindIndex

  function upsertResult(result: StoredExerciseResult) {
    const next = [
      ...results.filter(
          (item) => item.id !== result.id
      ),
      result,
    ]

    setResults(next)

    return next
  }

  function finish(nextResults: StoredExerciseResult[]) {
    const completed: StoredModuleResult = {
      moduleId: MODULE_ID,
      moduleName: MODULE_NAME,
      status: 'completed',
      startedAt: startedAt.current,
      finishedAt: new Date().toISOString(),
      results: nextResults,
    }

    saveStoredModuleResult(
        completed,
        userKey!
    )

    clearStoredModuleProgress(
        MODULE_ID,
        userKey!
    )

    setCompletedResult(completed)
  }

  function saveResult(
      item: {
        id: string
        title: string
        prompt: string
        skill?: string
      },
      value: string,
      type: 'scenario' | 'mind'
  ) {
    const result: StoredExerciseResult = {
      id: item.id,
      title: item.title,
      answer: value,
      score: undefined,
      timeSpent:
          (Date.now() - exerciseStart.current) / 1000,
      details: {
        type,
        skill: item.skill,
        prompt: item.prompt,
      },
      createdAt: new Date().toISOString(),
    }

    exerciseStart.current = Date.now()

    return upsertResult(result)
  }

  function submitScenario() {
    if (!scenarioAnswer.trim()) return

    saveResult(
        currentScenario,
        scenarioAnswer,
        'scenario'
    )

    setAnsweredScenarioIds((previous) => {
      if (previous.includes(currentScenario.id)) {
        return previous
      }

      return [...previous, currentScenario.id]
    })

    const nextAnsweredCount =
        answeredScenarioIds.includes(currentScenario.id)
            ? answeredScenarioIds.length
            : answeredScenarioIds.length + 1

    if (nextAnsweredCount >= REQUIRED_SCENARIOS) {
      setPhase('mind')
      setMindIndex(0)
      return
    }

    goNextScenario()
  }

  function skipScenario() {
    goNextScenario()
  }

  function goNextScenario() {
    setScenarioIndex(
        (current) => (current + 1) % scenarioBank.length
    )

    exerciseStart.current = Date.now()
  }

  function submitMindCase() {
    if (!mindAnswer.trim()) return

    const next = saveResult(
        currentMindCase,
        mindAnswer,
        'mind'
    )

    if (mindIndex === mindCases.length - 1) {
      finish(next)
      return
    }

    setMindIndex((current) => current + 1)
  }

  function goBack() {
    if (phase === 'mind') {
      if (mindIndex > 0) {
        setMindIndex((current) => current - 1)
        return
      }

      setPhase('scenarios')
      setScenarioIndex(scenarioBank.length - 1)

      return
    }

    if (phase === 'scenarios') {
      setScenarioIndex((current) =>
          current === 0
              ? scenarioBank.length - 1
              : current - 1
      )
    }
  }

  if (completedResult) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-background px-6">
          <div className="max-w-xl rounded-2xl border bg-card p-8 text-center shadow-sm">
            <h2 className="text-3xl font-bold">
              Módulo completado
            </h2>

            <p className="mt-4 text-muted-foreground">
              Tus respuestas fueron registradas correctamente.
            </p>

            <Button
                className="mt-6"
                onClick={() => router.push('/dashboard')}
            >
              Volver al dashboard
            </Button>
          </div>
        </div>
    )
  }

  return (
      <div className="min-h-screen bg-background px-4 py-5 sm:px-6">
        <main className="mx-auto max-w-3xl space-y-5">
          <header className="rounded-2xl border bg-card p-5 shadow-sm">
            <Button
                variant="ghost"
                onClick={() => router.push('/dashboard')}
                className="mb-3"
            >
              Volver
            </Button>

            <p className="text-sm text-muted-foreground">
              Actividad{' '}
              {Math.min(
                  completedActivities + 1,
                  totalActivities
              )}{' '}
              de {totalActivities}
            </p>

            <h1 className="text-3xl font-bold">
              {MODULE_NAME}
            </h1>

            <p className="mt-2 text-muted-foreground">
              Situaciones sociales abiertas y casos de teoría de la mente para explorar empatía,
              mediación, liderazgo, lectura de intenciones y manejo de vínculos.
            </p>

            <div className="mt-4 h-2 rounded-full bg-muted">
              <div
                  className="h-2 rounded-full bg-primary transition-all"
                  style={{
                    width: `${Math.min(
                        100,
                        (completedActivities / totalActivities) * 100
                    )}%`,
                  }}
              />
            </div>
          </header>

          {phase === 'scenarios' && (
              <section className="rounded-2xl border bg-card p-5 shadow-sm">
                <div className="mb-4 rounded-xl bg-muted p-3">
                  <p className="text-xs font-semibold uppercase text-muted-foreground">
                    Banco de escenarios
                  </p>

                  <p className="text-sm text-muted-foreground">
                    Respondé 5 situaciones. Si una no te identifica, podés pasar a otra.
                  </p>
                </div>

                <h2 className="text-xl font-bold">
                  {currentScenario.title}
                </h2>

                <p className="mt-2 text-sm text-muted-foreground">
                  Foco evaluado: {currentScenario.skill}
                </p>

                <p className="mt-4 whitespace-pre-line text-foreground/80">
                  {currentScenario.prompt}
                </p>

                <Textarea
                    value={scenarioAnswer}
                    onChange={(event) =>
                        setScenarioAnswers((previous) => ({
                          ...previous,
                          [currentScenario.id]:
                          event.target.value,
                        }))
                    }
                    className="mt-5 min-h-40"
                    placeholder="Desarrollá qué hiciste o qué harías. Intentá responder con una situación concreta."
                />

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <Button
                      variant="outline"
                      onClick={skipScenario}
                  >
                    No me identifica, cambiar escenario
                  </Button>

                  <Button
                      onClick={submitScenario}
                      disabled={!scenarioAnswer.trim()}
                  >
                    Guardar respuesta
                  </Button>
                </div>

                <div className="mt-3">
                  <Button
                      variant="outline"
                      onClick={goBack}
                      className="w-full"
                  >
                    Anterior
                  </Button>
                </div>
              </section>
          )}

          {phase === 'mind' && (
              <section className="rounded-2xl border bg-card p-5 shadow-sm">
                <div className="mb-4 rounded-xl bg-muted p-3">
                  <p className="text-xs font-semibold uppercase text-muted-foreground">
                    Teoría de la mente
                  </p>

                  <p className="text-sm text-muted-foreground">
                    Interpretá intenciones, señales sociales y posibles conflictos.
                  </p>
                </div>

                <h2 className="text-xl font-bold">
                  {currentMindCase.title}
                </h2>

                <p className="mt-4 whitespace-pre-line text-foreground/80">
                  {currentMindCase.prompt}
                </p>

                <Textarea
                    value={mindAnswer}
                    onChange={(event) =>
                        setMindAnswers((previous) => ({
                          ...previous,
                          [currentMindCase.id]:
                          event.target.value,
                        }))
                    }
                    className="mt-5 min-h-40"
                    placeholder="Desarrollá qué creés que está pasando, qué intención puede haber y cómo actuarías."
                />

                <div className="mt-5 space-y-3">
                  <Button
                      variant="outline"
                      onClick={goBack}
                      className="w-full"
                  >
                    Anterior
                  </Button>

                  <Button
                      onClick={submitMindCase}
                      disabled={!mindAnswer.trim()}
                      className="w-full"
                      size="lg"
                  >
                    {mindIndex === mindCases.length - 1
                        ? 'Finalizar módulo'
                        : 'Continuar'}
                  </Button>
                </div>
              </section>
          )}
        </main>
      </div>
  )
}