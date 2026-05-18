'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  getStoredModuleResult,
  saveStoredModuleResult,
  StoredExerciseResult,
  StoredModuleResult,
} from '@/src/lib/moduleAttemptStorage'

import { getStoredParticipantId } from '@/src/lib/participantStorage'
import { ModuleReview } from '@/src/components/modules/ModuleReview'

const MODULE_ID = 'body-kinesthetic'
const MODULE_NAME = 'Inteligencia Corporal-Cinestésica'

const TIMING_ATTEMPTS = 3
const PRECISION_ATTEMPTS = 7
const SIMON_LEVELS = 7

const SIMON_SEQUENCE = [
  'arriba',
  'derecha',
  'abajo',
  'izquierda',
  'arriba',
  'derecha',
  'izquierda',
]

const bodyQuestions = [
  '¿Practicás regularmente algún deporte o actividad física?',
  '¿Te resulta difícil estar sentado durante períodos largos de tiempo?',
  '¿Te llevás bien con tareas manuales como armar, arreglar o fabricar cosas?',
  '¿Tus mejores ideas aparecen cuando caminás, corrés o hacés actividad física?',
  '¿Preferís pasar tu tiempo libre al aire libre?',
  '¿Usás mucho gestos o “hablás con el cuerpo” cuando explicás algo?',
  '¿Necesitás tocar o manipular las cosas para entenderlas mejor?',
  '¿Disfrutás actividades físicas desafiantes o arriesgadas?',
  '¿Te considerás una persona coordinada?',
  '¿Preferís practicar una habilidad física antes que leer o mirar cómo se hace?',
]

type Stage = 'timing' | 'precision' | 'simon' | 'questions'

export default function BodyKinestheticModule() {
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

  const [stage, setStage] = useState<Stage>('timing')

  const [timingDone, setTimingDone] = useState(0)
  const [timingCircleSize, setTimingCircleSize] = useState(190)
  const [timingMessage, setTimingMessage] = useState(
      'Tocá el círculo cuando quede dentro de la zona ideal.'
  )

  const [precisionDone, setPrecisionDone] = useState(0)
  const [precisionPosition, setPrecisionPosition] = useState({ top: 45, left: 45 })
  const [precisionStartedAt, setPrecisionStartedAt] = useState(Date.now())
  const [precisionTimes, setPrecisionTimes] = useState<number[]>([])

  const [simonLevel, setSimonLevel] = useState(1)
  const [simonInput, setSimonInput] = useState<string[]>([])
  const [activeFlash, setActiveFlash] = useState<string | null>(null)
  const [simonMistakes, setSimonMistakes] = useState(0)
  const [showingSequence, setShowingSequence] = useState(false)

  const [questionIndex, setQuestionIndex] = useState(0)
  const [questionAnswers, setQuestionAnswers] = useState<number[]>([])

  const startedAt = useRef(new Date().toISOString())
  const exerciseStart = useRef(Date.now())


  const stored = useMemo(() => getStoredModuleResult(MODULE_ID, userKey), [userKey])


  useEffect(() => {
    if (stage !== 'timing') return

    setTimingCircleSize(190)
    exerciseStart.current = Date.now()

    const id = window.setInterval(() => {
      setTimingCircleSize((size) => Math.max(52, size - 5))
    }, 100)

    return () => window.clearInterval(id)
  }, [stage, timingDone])

  useEffect(() => {
    if (stage !== 'precision') return

    movePrecisionTarget()
    setPrecisionStartedAt(Date.now())
    exerciseStart.current = Date.now()
  }, [stage, precisionDone])

  useEffect(() => {
    if (stage !== 'simon') return

    playSimonSequence(simonLevel)
  }, [stage, simonLevel])

  if (!userKey) {
    return (
        <div className="flex min-h-screen items-center justify-center">
          Cargando...
        </div>
    )
  }
  if (completedResult) return <ModuleReview result={completedResult} />
  if (stored) return <ModuleReview result={stored} />

  function completeModule(nextResults: StoredExerciseResult[]) {
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

  function pushResult(result: StoredExerciseResult) {
    const next = [...results, result]
    setResults(next)
    return next
  }

  function resetTiming(message: string) {
    setTimingMessage(message)
    setTimingCircleSize(190)
    exerciseStart.current = Date.now()
  }

  function handleTimingPress() {
    const insideIdeal = timingCircleSize >= 66 && timingCircleSize <= 96

    if (!insideIdeal) {
      resetTiming('Todavía no cerró dentro del círculo ideal. Se repite este intento.')
      return
    }

    const diff = Math.abs(timingCircleSize - 81)

    pushResult({
      id: `ic-timing-${timingDone + 1}`,
      title: `Timing motor ${timingDone + 1}`,
      answer: `Cerró dentro del círculo ideal (${Math.round(timingCircleSize)}px)`,
      score: Math.max(0, 100 - diff),
      timeSpent: (Date.now() - exerciseStart.current) / 1000,
      createdAt: new Date().toISOString(),
    })

    if (timingDone + 1 >= TIMING_ATTEMPTS) {
      setStage('precision')
      return
    }

    setTimingDone(timingDone + 1)
    setTimingMessage('Bien. Pasá al siguiente intento.')
  }

  function getPrecisionSize() {
    return Math.max(44, 96 - precisionDone * 8)
  }

  function movePrecisionTarget() {
    setPrecisionPosition({
      top: 10 + Math.random() * 70,
      left: 10 + Math.random() * 70,
    })
  }

  function handlePrecisionPress() {
    const reactionTime = Date.now() - precisionStartedAt
    const nextTimes = [...precisionTimes, reactionTime]
    setPrecisionTimes(nextTimes)

    pushResult({
      id: `ic-precision-${precisionDone + 1}`,
      title: `Precisión y reacción ${precisionDone + 1}`,
      answer: `Tocó el objetivo en ${reactionTime}ms`,
      score: Math.max(20, Math.min(100, 120 - reactionTime / 20)),
      timeSpent: reactionTime / 1000,
      details: {
        targetSize: getPrecisionSize(),
        targetPosition: precisionPosition,
      },
      createdAt: new Date().toISOString(),
    })

    if (precisionDone + 1 >= PRECISION_ATTEMPTS) {
      setStage('simon')
      exerciseStart.current = Date.now()
      return
    }

    setPrecisionDone(precisionDone + 1)
  }

  function playSimonSequence(level: number) {
    setShowingSequence(true)
    setSimonInput([])

    SIMON_SEQUENCE.slice(0, level).forEach((direction, index) => {
      window.setTimeout(() => setActiveFlash(direction), 450 + index * 650)
      window.setTimeout(() => setActiveFlash(null), 800 + index * 650)
    })

    window.setTimeout(() => setShowingSequence(false), 600 + level * 650)
  }

  function pressSimon(direction: string) {
    if (showingSequence) return

    setActiveFlash(direction)
    window.setTimeout(() => setActiveFlash(null), 180)

    const expected = SIMON_SEQUENCE[simonInput.length]

    if (direction !== expected) {
      setSimonMistakes((mistakes) => mistakes + 1)
      setSimonInput([])
      playSimonSequence(simonLevel)
      return
    }

    const nextInput = [...simonInput, direction]
    setSimonInput(nextInput)

    if (nextInput.length < simonLevel) return

    if (simonLevel >= SIMON_LEVELS) {
      pushResult({
        id: 'ic-sequence',
        title: 'Secuencia motora tipo Simón dice',
        answer: `Completó ${SIMON_LEVELS} niveles con ${simonMistakes} errores`,
        score: Math.max(0, 100 - simonMistakes * 8),
        timeSpent: (Date.now() - exerciseStart.current) / 1000,
        createdAt: new Date().toISOString(),
      })

      setStage('questions')
      exerciseStart.current = Date.now()
      return
    }

    setSimonLevel(simonLevel + 1)
    setSimonInput([])
  }

  function answerQuestion(value: number) {
    const nextAnswers = [...questionAnswers, value]
    setQuestionAnswers(nextAnswers)

    if (questionIndex + 1 < bodyQuestions.length) {
      setQuestionIndex(questionIndex + 1)
      return
    }

    const average = nextAnswers.reduce((sum, item) => sum + item, 0) / nextAnswers.length
    const next = pushResult({
      id: 'ic-self-report',
      title: 'Autopercepción corporal-cinestésica',
      answer: `${nextAnswers.join(', ')}`,
      score: Math.round((average / 5) * 100),
      timeSpent: (Date.now() - exerciseStart.current) / 1000,
      details: {
        questions: bodyQuestions,
        answers: nextAnswers,
      },
      createdAt: new Date().toISOString(),
    })

    completeModule(next)
  }

  const totalActivities =
      TIMING_ATTEMPTS + PRECISION_ATTEMPTS + SIMON_LEVELS + bodyQuestions.length

  const completedActivities =
      timingDone +
      precisionDone +
      (stage === 'simon' ? simonLevel - 1 : stage === 'questions' ? SIMON_LEVELS : 0) +
      (stage === 'questions' ? questionIndex : 0)

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
              Actividad {Math.min(completedActivities + 1, totalActivities)} de {totalActivities}
            </p>

            <h1 className="text-3xl font-bold">{MODULE_NAME}</h1>

            <p className="mt-2 text-muted-foreground">
              Timing motor, precisión ojo-mano, memoria secuencial y autopercepción corporal.
            </p>

            <div className="mt-4 h-2 rounded-full bg-muted">
              <div
                  className="h-2 rounded-full bg-primary transition-all"
                  style={{
                    width: `${Math.min(100, (completedActivities / totalActivities) * 100)}%`,
                  }}
              />
            </div>
          </header>

          {stage === 'timing' && (
              <section className="rounded-2xl border bg-card p-6 text-center shadow-sm">
                <h2 className="text-xl font-bold">
                  Timing motor {timingDone + 1}/{TIMING_ATTEMPTS}
                </h2>

                <p className="mt-2 text-muted-foreground">{timingMessage}</p>

                <button
                    onClick={handleTimingPress}
                    aria-label="Tocar círculo"
                    className="relative mx-auto my-8 flex h-72 w-72 touch-manipulation items-center justify-center rounded-full border-4 border-dashed border-primary/40"
                >
                  <span className="absolute h-[96px] w-[96px] rounded-full border-4 border-primary" />

                  <span
                      className="rounded-full bg-primary/70 transition-all"
                      style={{
                        width: timingCircleSize,
                        height: timingCircleSize,
                      }}
                  />
                </button>

                <p className="text-sm text-muted-foreground">
                  Objetivo: tocar cuando el círculo móvil entre dentro del círculo marcado.
                </p>
              </section>
          )}

          {stage === 'precision' && (
              <section className="rounded-2xl border bg-card p-6 text-center shadow-sm">
                <h2 className="text-xl font-bold">
                  Precisión y reacción {precisionDone + 1}/{PRECISION_ATTEMPTS}
                </h2>

                <p className="mt-2 text-muted-foreground">
                  Tocá el círculo lo más rápido posible. En cada intento se vuelve más chico.
                </p>

                <div className="relative mt-6 h-[420px] overflow-hidden rounded-2xl border bg-muted">
                  <button
                      onClick={handlePrecisionPress}
                      className="absolute rounded-full bg-primary shadow-lg transition-all hover:scale-105 active:scale-95"
                      style={{
                        width: getPrecisionSize(),
                        height: getPrecisionSize(),
                        top: `${precisionPosition.top}%`,
                        left: `${precisionPosition.left}%`,
                      }}
                      aria-label="Objetivo de precisión"
                  />

                  <div className="absolute bottom-3 left-4 rounded-lg bg-background/80 px-3 py-2 text-xs text-muted-foreground">
                    Tamaño actual: {getPrecisionSize()}px
                  </div>
                </div>
              </section>
          )}

          {stage === 'simon' && (
              <section className="rounded-2xl border bg-card p-6 text-center shadow-sm">
                <h2 className="text-xl font-bold">
                  Secuencia motora tipo Simón dice
                </h2>

                <p className="mt-2 text-muted-foreground">
                  Nivel {simonLevel}/{SIMON_LEVELS}. Mirá la secuencia y repetila. Si fallás,
                  se repite el mismo nivel.
                </p>

                <div className="mx-auto mt-6 grid max-w-sm grid-cols-3 gap-3">
                  <div />

                  <SimonButton
                      direction="arriba"
                      active={activeFlash === 'arriba'}
                      onPress={pressSimon}
                  >
                    ↑
                  </SimonButton>

                  <div />

                  <SimonButton
                      direction="izquierda"
                      active={activeFlash === 'izquierda'}
                      onPress={pressSimon}
                  >
                    ←
                  </SimonButton>

                  <div className="rounded-xl border p-4 text-sm">
                    {showingSequence ? 'Observá' : `${simonInput.length}/${simonLevel}`}
                  </div>

                  <SimonButton
                      direction="derecha"
                      active={activeFlash === 'derecha'}
                      onPress={pressSimon}
                  >
                    →
                  </SimonButton>

                  <div />

                  <SimonButton
                      direction="abajo"
                      active={activeFlash === 'abajo'}
                      onPress={pressSimon}
                  >
                    ↓
                  </SimonButton>

                  <div />
                </div>

                <p className="mt-4 text-sm text-muted-foreground">
                  Errores acumulados: {simonMistakes}
                </p>
              </section>
          )}

          {stage === 'questions' && (
              <section className="rounded-2xl border bg-card p-6 shadow-sm">
                <h2 className="text-center text-xl font-bold">
                  Autopercepción corporal {questionIndex + 1}/{bodyQuestions.length}
                </h2>

                <p className="mt-5 text-center text-lg font-medium">
                  {bodyQuestions[questionIndex]}
                </p>

                <div className="mt-6 grid grid-cols-5 gap-2">
                  {[1, 2, 3, 4, 5].map((value) => (
                      <button
                          key={value}
                          onClick={() => answerQuestion(value)}
                          className="rounded-xl border p-4 font-bold transition hover:border-primary hover:bg-primary/10"
                      >
                        {value}
                      </button>
                  ))}
                </div>

                <div className="mt-4 flex justify-between text-xs text-muted-foreground">
                  <span>Nunca</span>
                  <span>Siempre</span>
                </div>
              </section>
          )}
        </main>
      </div>
  )
}

function SimonButton({
                       direction,
                       active,
                       onPress,
                       children,
                     }: {
  direction: string
  active: boolean
  onPress: (direction: string) => void
  children: ReactNode
}) {
  return (
      <button
          onClick={() => onPress(direction)}
          className={`rounded-2xl border-2 p-6 text-3xl font-bold transition ${
              active
                  ? 'scale-105 border-primary bg-primary text-primary-foreground shadow-lg'
                  : 'border-border bg-background hover:border-primary/60'
          }`}
      >
        {children}
      </button>
  )
}