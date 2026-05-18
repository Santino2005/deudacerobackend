'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  getStoredModuleResult,
  saveStoredModuleResult,
  StoredExerciseResult,
  StoredModuleResult,
} from '@/src/lib/moduleAttemptStorage'

import { getStoredParticipantId } from '@/src/lib/participantStorage'
import { ModuleReview } from '@/src/components/modules/ModuleReview'

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

export default function InterpersonalModule() {
  const router = useRouter()
  const [userKey, setUserKey] = useState<string | null>(null)

  useEffect(() => {
    const participantId = getStoredParticipantId()

    if (!participantId) {
      router.push('/')
      return
    }

    setUserKey(participantId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const [completedResult, setCompletedResult] = useState<StoredModuleResult | null>(null)

  const [results, setResults] = useState<StoredExerciseResult[]>([])
  const [scenarioIndex, setScenarioIndex] = useState(0)
  const [mindIndex, setMindIndex] = useState(0)
  const [answer, setAnswer] = useState('')
  const [phase, setPhase] = useState<'scenarios' | 'mind'>('scenarios')
  const startedAt = useRef(new Date().toISOString())
  const exerciseStart = useRef(Date.now())


  const stored = useMemo(() => getStoredModuleResult(MODULE_ID, userKey), [userKey])
  if (!userKey) {
    return (
        <div className="flex min-h-screen items-center justify-center">
          Cargando...
        </div>
    )
  }
  const scenarioResults = results.filter((result) => result.id.startsWith('inter-scenario'))

  if (completedResult) return <ModuleReview result={completedResult} />
  if (stored) return <ModuleReview result={stored} />

  function finish(nextResults: StoredExerciseResult[]) {
    const completed = {
      moduleId: MODULE_ID,
      moduleName: MODULE_NAME,
      status: 'in_review' as const,
      startedAt: startedAt.current,
      finishedAt: new Date().toISOString(),
      results: nextResults,
    }

    saveStoredModuleResult(completed, userKey)
    setCompletedResult(completed)
  }

  function scoreOpenAnswer(value: string) {
    const words = value.trim().split(/\s+/).filter(Boolean).length
    return Math.min(100, Math.max(35, words * 4))
  }

  function saveResult(item: any, type: 'scenario' | 'mind') {
    const result: StoredExerciseResult = {
      id: item.id,
      title: item.title,
      answer,
      score: scoreOpenAnswer(answer),
      timeSpent: (Date.now() - exerciseStart.current) / 1000,
      details: {
        type,
        skill: item.skill,
        prompt: item.prompt,
      },
      createdAt: new Date().toISOString(),
    }

    const next = [...results, result]
    setResults(next)
    setAnswer('')
    exerciseStart.current = Date.now()
    return next
  }

  function submitScenario() {
    if (!answer.trim()) return

    const item = scenarioBank[scenarioIndex]
    saveResult(item, 'scenario')

    if (scenarioResults.length + 1 >= REQUIRED_SCENARIOS) {
      setPhase('mind')
      return
    }

    goNextScenario()
  }

  function skipScenario() {
    setAnswer('')
    goNextScenario()
  }

  function goNextScenario() {
    setScenarioIndex((current) => (current + 1) % scenarioBank.length)
    exerciseStart.current = Date.now()
  }

  function submitMindCase() {
    if (!answer.trim()) return

    const item = mindCases[mindIndex]
    const next = saveResult(item, 'mind')

    if (mindIndex === mindCases.length - 1) {
      finish(next)
      return
    }

    setMindIndex(mindIndex + 1)
  }

  const totalActivities = REQUIRED_SCENARIOS + mindCases.length
  const completedActivities =
      phase === 'scenarios' ? scenarioResults.length : REQUIRED_SCENARIOS + mindIndex

  const currentScenario = scenarioBank[scenarioIndex]
  const currentMindCase = mindCases[mindIndex]

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
              Actividad {completedActivities + 1} de {totalActivities}
            </p>

            <h1 className="text-3xl font-bold">{MODULE_NAME}</h1>

            <p className="mt-2 text-muted-foreground">
              Situaciones sociales abiertas y casos de teoría de la mente para explorar empatía,
              mediación, liderazgo, lectura de intenciones y manejo de vínculos.
            </p>

            <div className="mt-4 h-2 rounded-full bg-muted">
              <div
                  className="h-2 rounded-full bg-primary transition-all"
                  style={{ width: `${(completedActivities / totalActivities) * 100}%` }}
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

                <h2 className="text-xl font-bold">{currentScenario.title}</h2>

                <p className="mt-2 text-sm text-muted-foreground">
                  Foco evaluado: {currentScenario.skill}
                </p>

                <p className="mt-4 whitespace-pre-line text-foreground/80">
                  {currentScenario.prompt}
                </p>

                <Textarea
                    value={answer}
                    onChange={(event) => setAnswer(event.target.value)}
                    className="mt-5 min-h-40"
                    placeholder="Desarrollá qué hiciste o qué harías. Intentá responder con una situación concreta."
                />

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <Button variant="outline" onClick={skipScenario}>
                    No me identifica, cambiar escenario
                  </Button>

                  <Button onClick={submitScenario} disabled={!answer.trim()}>
                    Guardar respuesta
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

                <h2 className="text-xl font-bold">{currentMindCase.title}</h2>

                <p className="mt-4 whitespace-pre-line text-foreground/80">
                  {currentMindCase.prompt}
                </p>

                <Textarea
                    value={answer}
                    onChange={(event) => setAnswer(event.target.value)}
                    className="mt-5 min-h-40"
                    placeholder="Desarrollá qué creés que está pasando, qué intención puede haber y cómo actuarías."
                />

                <Button
                    onClick={submitMindCase}
                    disabled={!answer.trim()}
                    className="mt-5 w-full"
                    size="lg"
                >
                  {mindIndex === mindCases.length - 1 ? 'Finalizar módulo' : 'Continuar'}
                </Button>
              </section>
          )}
        </main>
      </div>
  )
}