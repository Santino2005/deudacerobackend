'use client'

import Image from 'next/image'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { getStoredParticipantId } from '@/src/lib/participantStorage'
import {
  getStoredModuleResult,
  saveStoredModuleResult,
  getStoredModuleProgress,
  saveStoredModuleProgress,
  clearStoredModuleProgress,
  StoredExerciseResult,
  StoredModuleResult,
} from '@/src/lib/moduleAttemptStorage'

export type PictureChoiceExercise = {
  id: string
  title: string
  imageUrl: string
  question: string
  optionCount: number
  correctAnswer: string
  options?: string[]
  percentageValue: number
}

interface Props {
  moduleId: string
  moduleName: string
  exercises: PictureChoiceExercise[]
}

export function PictureChoiceModule({
                                      moduleId,
                                      moduleName,
                                      exercises,
                                    }: Props) {
  const router = useRouter()

  const [userKey, setUserKey] =
      useState<string | null>(null)

  const [index, setIndex] = useState(0)

  const [answers, setAnswers] =
      useState<Record<string, string>>({})

  const [results, setResults] =
      useState<StoredExerciseResult[]>([])

  const [startedAt] = useState(() =>
      new Date().toISOString()
  )

  const [completedResult, setCompletedResult] =
      useState<StoredModuleResult | null>(
          null
      )

  const startRef = useRef(Date.now())
  const progressLoaded = useRef(false)

  useEffect(() => {
    const participantId =
        getStoredParticipantId()

    if (!participantId) {
      router.push('/')
      return
    }

    setUserKey(participantId)
  }, [router])

  useEffect(() => {
    startRef.current = Date.now()
  }, [index])

  const stored = useMemo(() => {
    if (!userKey) return null

    return getStoredModuleResult(
        moduleId,
        userKey
    )
  }, [moduleId, userKey])

  useEffect(() => {
    if (!userKey) return
    if (progressLoaded.current) return

    const progress =
        getStoredModuleProgress(
            moduleId,
            userKey
        )

    if (!progress) {
      progressLoaded.current = true
      return
    }

    if (
        typeof progress.currentIndex ===
        'number'
    ) {
      setIndex(progress.currentIndex)
    }

    if (progress.answers) {
      setAnswers(
          progress.answers as Record<
              string,
              string
          >
      )
    }

    setResults(progress.results ?? [])

    progressLoaded.current = true
  }, [moduleId, userKey])

  useEffect(() => {
    if (!userKey) return
    if (completedResult) return
    if (!progressLoaded.current) return

    saveStoredModuleProgress(
        {
          moduleId,
          moduleName,
          status: 'in_progress',
          currentIndex: index,
          answers,
          results,
          updatedAt:
              new Date().toISOString(),
        },
        userKey
    )
  }, [
    userKey,
    completedResult,
    moduleId,
    moduleName,
    index,
    answers,
    results,
  ])

  if (!userKey) {
    return (
        <div className="flex min-h-screen items-center justify-center">
          Cargando...
        </div>
    )
  }

  if (
      stored?.status === 'completed' &&
      !completedResult
  ) {
    router.push('/dashboard')
    return null
  }

  const exercise = exercises[index]

  const selected =
      answers[exercise.id] ?? ''

  const progress = Math.round(
      ((index + 1) / exercises.length) *
      100
  )

    function finish(nextResults: StoredExerciseResult[]) {
        const totalScore = nextResults.reduce(
            (acc, result) => acc + (result.score ?? 0),
            0
        )

        const maxScore = exercises.reduce(
            (acc, exercise) => acc + exercise.percentageValue,
            0
        )

        console.log('nextResults', nextResults)
        console.log('totalScore', totalScore)
        console.log('maxScore', maxScore)
        console.log('percentage', Math.round((totalScore / maxScore) * 100))

        const completed: StoredModuleResult = {
            moduleId,
            moduleName,
            status: 'completed',
            startedAt,
            finishedAt: new Date().toISOString(),
            totalScore,
            maxScore,
            results: nextResults,
        }

        saveStoredModuleResult(completed, userKey!)
        clearStoredModuleProgress(moduleId, userKey!)
        setCompletedResult(completed)
    }

  function continueExercise() {
    if (!selected) return

    const timeSpent =
        (Date.now() - startRef.current) /
        1000

    const isCorrect =
        selected ===
        exercise.correctAnswer

    const nextResult: StoredExerciseResult =
        {
          id: exercise.id,
          title: exercise.title,
          answer: selected,
          score: isCorrect
              ? exercise.percentageValue
              : 0,
          timeSpent,
          details: {
              type: 'objective',
            imageUrl:
            exercise.imageUrl,
            correctAnswer:
            exercise.correctAnswer,
            percentageValue:
            exercise.percentageValue,
          },
          createdAt:
              new Date().toISOString(),
        }

    const filteredResults =
        results.filter(
            (result) =>
                result.id !== exercise.id
        )

    const nextResults = [
      ...filteredResults,
      nextResult,
    ]

    setResults(nextResults)

    if (
        index === exercises.length - 1
    ) {
      finish(nextResults)
      return
    }

    setIndex(index + 1)
  }

  function goBack() {
    if (index === 0) return

    setIndex(
        (current) => current - 1
    )
  }

  if (completedResult) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-background px-6">
          <div className="max-w-xl rounded-2xl border bg-card p-8 text-center shadow-sm">
            <h2 className="text-3xl font-bold">
              Módulo completado
            </h2>

            <p className="mt-4 text-muted-foreground">
              Tus respuestas fueron
              registradas correctamente.
            </p>

            <Button
                className="mt-6"
                onClick={() =>
                    router.push(
                        '/dashboard'
                    )
                }
            >
              Volver al dashboard
            </Button>
          </div>
        </div>
    )
  }

  return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-10 border-b bg-card/95 backdrop-blur">
          <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-4 sm:px-6">
            <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                    router.push(
                        '/dashboard'
                    )
                }
            >
              Volver
            </Button>

            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-3">
                <h1 className="truncate text-base font-bold sm:text-xl">
                  {moduleName}
                </h1>

                <span className="text-sm text-muted-foreground">
                {index + 1}/
                  {exercises.length}
              </span>
              </div>

              <div className="mt-2 h-2 rounded-full bg-muted">
                <div
                    className="h-2 rounded-full bg-primary transition-all"
                    style={{
                      width: `${progress}%`,
                    }}
                />
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-5xl space-y-5 px-4 py-5 sm:px-6 sm:py-8">
          <section className="rounded-2xl border bg-card p-3 shadow-sm sm:p-6">
            <div className="relative min-h-[320px] w-full overflow-hidden rounded-xl bg-white sm:min-h-[520px]">
              <Image
                  src={exercise.imageUrl}
                  alt={exercise.title}
                  fill
                  className="object-contain"
                  priority
              />
            </div>
          </section>

          <section className="rounded-2xl border bg-card p-4 shadow-sm sm:p-6">
            <h2 className="text-lg font-bold">
              {exercise.question}
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Elegí una opción. No
              se muestra si es
              correcta o incorrecta.
            </p>

            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {(
                  exercise.options ??
                  Array.from(
                      {
                        length:
                        exercise.optionCount,
                      },
                      (_, itemIndex) =>
                          String(
                              itemIndex + 1
                          )
                  )
              ).map((option) => (
                  <button
                      key={option}
                      onClick={() =>
                          setAnswers(
                              (previous) => ({
                                ...previous,
                                [exercise.id]:
                                option,
                              })
                          )
                      }
                      className={`rounded-xl border-2 p-5 text-xl font-bold transition ${
                          selected === option
                              ? 'border-primary bg-primary/10 shadow'
                              : 'border-border hover:border-primary/60'
                      }`}
                  >
                    {option}
                  </button>
              ))}
            </div>

            <div className="mt-5 space-y-3">
              <Button
                  variant="outline"
                  disabled={index === 0}
                  onClick={goBack}
                  className="w-full"
              >
                Anterior
              </Button>

              <Button
                  disabled={!selected}
                  onClick={
                    continueExercise
                  }
                  className="mt-5 w-full"
                  size="lg"
              >
                {index ===
                exercises.length - 1
                    ? 'Finalizar módulo'
                    : 'Continuar'}
              </Button>
            </div>
          </section>
        </main>
      </div>
  )
}