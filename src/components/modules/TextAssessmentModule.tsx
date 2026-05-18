'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { getStoredParticipantId } from '@/src/lib/participantStorage'
import {
  getStoredModuleResult,
  saveStoredModuleResult,
  StoredExerciseResult,
} from '@/src/lib/moduleAttemptStorage'
import { ModuleReview } from '@/src/components/modules/ModuleReview'

export type TextExercise = {
  id: string
  title: string
  situation: string
  audience: string
  restriction: string
  timeLimit: number
  scoreHint?: string
}

export type LikertQuestion = {
  id: string
  text: string
}

interface Props {
  moduleId: string
  moduleName: string
  intro: string
  exercises: TextExercise[]
  questions: LikertQuestion[]
}

type Stage = 'pitcher' | 'questions'

function estimateTextScore(answer: string) {
  const words = answer.trim().split(/\s+/).filter(Boolean).length
  if (words >= 45) return 95
  if (words >= 30) return 85
  if (words >= 18) return 70
  if (words >= 8) return 50
  return 25
}

export function TextAssessmentModule({
                                       moduleId,
                                       moduleName,
                                       intro,
                                       exercises,
                                       questions,
                                     }: Props) {
  const router = useRouter()
  const [userKey, setUserKey] = useState<string | null>(null)
  const [stage, setStage] = useState<Stage>('pitcher')
  const [index, setIndex] = useState(0)
  const [questionIndex, setQuestionIndex] = useState(0)
  const [answer, setAnswer] = useState('')
  const [results, setResults] = useState<StoredExerciseResult[]>([])
  const [questionAnswers, setQuestionAnswers] = useState<number[]>([])
  const [startedAt] = useState(() => new Date().toISOString())
  const [startedExerciseAt, setStartedExerciseAt] = useState(Date.now())
  const [completedResult, setCompletedResult] =
      useState<ReturnType<typeof getStoredModuleResult>>(null)

  useEffect(() => {
    const participantId = getStoredParticipantId()

    if (!participantId) {
      router.push('/')
      return
    }

    setUserKey(participantId)
  }, [router])

  useEffect(() => {
    setAnswer('')
    setStartedExerciseAt(Date.now())
  }, [index, questionIndex, stage])

  const stored = useMemo(
      () => (userKey ? getStoredModuleResult(moduleId, userKey) : null),
      [moduleId, userKey]
  )

  if (!userKey) {
    return <div className="flex min-h-screen items-center justify-center">Cargando...</div>
  }

  if (completedResult) return <ModuleReview result={completedResult} />
  if (stored) return <ModuleReview result={stored} />

  const exercise = exercises[index]
  const question = questions[questionIndex]

  const totalActivities = exercises.length + questions.length
  const completedActivities =
      stage === 'pitcher' ? index : exercises.length + questionIndex

  function finish(nextResults: StoredExerciseResult[]) {
    const completed = {
      moduleId,
      moduleName,
      status: 'in_review' as const,
      startedAt,
      finishedAt: new Date().toISOString(),
      results: nextResults,
    }

    saveStoredModuleResult(completed, userKey)
    setCompletedResult(completed)
  }

  function continuePitcher() {
    if (!answer.trim()) return

    const result: StoredExerciseResult = {
      id: exercise.id,
      title: exercise.title,
      answer,
      score: estimateTextScore(answer),
      timeSpent: (Date.now() - startedExerciseAt) / 1000,
      details: {
        situation: exercise.situation,
        audience: exercise.audience,
        restriction: exercise.restriction,
        timeLimit: exercise.timeLimit,
        scoreHint: exercise.scoreHint,
      },
      createdAt: new Date().toISOString(),
    }

    const nextResults = [...results, result]
    setResults(nextResults)

    if (index + 1 >= exercises.length) {
      setStage('questions')
      return
    }

    setIndex(index + 1)
  }

  function answerQuestion(value: number) {
    const result: StoredExerciseResult = {
      id: question.id,
      title: `Pregunta lingüística ${questionIndex + 1}`,
      answer: String(value),
      score: Math.round((value / 5) * 100),
      timeSpent: (Date.now() - startedExerciseAt) / 1000,
      details: { question: question.text },
      createdAt: new Date().toISOString(),
    }

    const nextResults = [...results, result]
    const nextAnswers = [...questionAnswers, value]

    setResults(nextResults)
    setQuestionAnswers(nextAnswers)

    if (questionIndex + 1 >= questions.length) {
      finish(nextResults)
      return
    }

    setQuestionIndex(questionIndex + 1)
  }

  return (
      <div className="min-h-screen bg-background px-4 py-5 sm:px-6">
        <main className="mx-auto max-w-3xl space-y-5">
          <header className="rounded-2xl border bg-card p-5 shadow-sm">
            <Button variant="ghost" onClick={() => router.push('/dashboard')} className="mb-3">
              Volver
            </Button>

            <p className="text-sm font-medium text-muted-foreground">
              Actividad {completedActivities + 1} de {totalActivities}
            </p>

            <h1 className="mt-1 text-3xl font-bold">{moduleName}</h1>
            <p className="mt-2 text-muted-foreground">{intro}</p>

            <div className="mt-4 h-2 rounded-full bg-muted">
              <div
                  className="h-2 rounded-full bg-primary transition-all"
                  style={{
                    width: `${Math.min(100, (completedActivities / totalActivities) * 100)}%`,
                  }}
              />
            </div>
          </header>

          {stage === 'pitcher' && (
              <section className="rounded-2xl border bg-card p-5 shadow-sm">
                <div className="mb-4 rounded-xl bg-muted p-3">
                  <p className="text-xs font-semibold uppercase text-muted-foreground">
                    The Pitcher
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Tiempo sugerido: {exercise.timeLimit} segundos. Respondé escribiendo como si
                    estuvieras hablando en esa situación.
                  </p>
                </div>

                <h2 className="text-xl font-bold">{exercise.title}</h2>

                <div className="mt-4 space-y-3 text-sm">
                  <div className="rounded-xl border p-3">
                    <p className="font-semibold">Situación</p>
                    <p className="mt-1 text-muted-foreground">{exercise.situation}</p>
                  </div>

                  <div className="rounded-xl border p-3">
                    <p className="font-semibold">Público objetivo</p>
                    <p className="mt-1 text-muted-foreground">{exercise.audience}</p>
                  </div>

                  <div className="rounded-xl border p-3">
                    <p className="font-semibold">Restricción</p>
                    <p className="mt-1 text-muted-foreground">{exercise.restriction}</p>
                  </div>
                </div>

                <Textarea
                    className="mt-5 min-h-40"
                    value={answer}
                    onChange={(event) => setAnswer(event.target.value)}
                    placeholder="Escribí tu respuesta..."
                />

                {exercise.scoreHint && (
                    <p className="mt-3 text-sm text-muted-foreground">
                      Evaluación: {exercise.scoreHint}
                    </p>
                )}

                <Button
                    onClick={continuePitcher}
                    disabled={!answer.trim()}
                    className="mt-5 w-full"
                    size="lg"
                >
                  Continuar
                </Button>
              </section>
          )}

          {stage === 'questions' && (
              <section className="rounded-2xl border bg-card p-6 shadow-sm">
                <h2 className="text-center text-xl font-bold">
                  Preguntas lingüísticas {questionIndex + 1}/{questions.length}
                </h2>

                <p className="mt-5 text-center text-lg font-medium">{question.text}</p>

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