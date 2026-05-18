'use client'

import Image from 'next/image'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { getStoredParticipantId } from '@/src/lib/participantStorage'
import {
  getStoredModuleResult,
  saveStoredModuleResult,
  StoredExerciseResult,
} from '@/src/lib/moduleAttemptStorage'
import { ModuleReview } from '@/src/components/modules/ModuleReview'

export type PictureChoiceExercise = {
  id: string
  title: string
  imageUrl: string
  question: string
  optionCount: number
}

interface Props {
  moduleId: string
  moduleName: string
  exercises: PictureChoiceExercise[]
}

export function PictureChoiceModule({ moduleId, moduleName, exercises }: Props) {
  const router = useRouter()
  const [userKey, setUserKey] = useState<string | null>(null)
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState('')
  const [results, setResults] = useState<StoredExerciseResult[]>([])
  const [startedAt] = useState(() => new Date().toISOString())
  const startRef = useRef(Date.now())

  useEffect(() => {
    const participantId = getStoredParticipantId()

    if (!participantId) {
      router.push('/')
      return
    }

    setUserKey(participantId)
  }, [router])

  useEffect(() => {
    startRef.current = Date.now()
    setSelected('')
  }, [index])

  const stored = useMemo(() => {
    if (!userKey) return null
    return getStoredModuleResult(moduleId, userKey)
  }, [moduleId, userKey])
  const [completedResult, setCompletedResult] = useState<ReturnType<typeof getStoredModuleResult>>(null)

  if (!userKey) {
    return <div className="flex min-h-screen items-center justify-center">Cargando...</div>
  }

  if (completedResult) return <ModuleReview result={completedResult} />
  if (stored) return <ModuleReview result={stored} />

  const exercise = exercises[index]
  const progress = Math.round(((index + 1) / exercises.length) * 100)

  function continueExercise() {
    if (!selected) return
    const timeSpent = (Date.now() - startRef.current) / 1000
    const nextResult: StoredExerciseResult = {
      id: exercise.id,
      title: exercise.title,
      answer: selected,
      timeSpent,
      details: { imageUrl: exercise.imageUrl },
      createdAt: new Date().toISOString(),
    }
    const nextResults = [...results, nextResult]

    if (index === exercises.length - 1) {
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
      setResults(nextResults)
      return
    }

    setResults(nextResults)
    setIndex(index + 1)
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b bg-card/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-4 sm:px-6">
          <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard')}>Volver</Button>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-3">
              <h1 className="truncate text-base font-bold sm:text-xl">{moduleName}</h1>
              <span className="text-sm text-muted-foreground">{index + 1}/{exercises.length}</span>
            </div>
            <div className="mt-2 h-2 rounded-full bg-muted">
              <div className="h-2 rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-5 px-4 py-5 sm:px-6 sm:py-8">
        <section className="rounded-2xl border bg-card p-3 shadow-sm sm:p-6">
          <div className="relative min-h-[320px] w-full overflow-hidden rounded-xl bg-white sm:min-h-[520px]">
            <Image src={exercise.imageUrl} alt={exercise.title} fill className="object-contain" priority />
          </div>
        </section>

        <section className="rounded-2xl border bg-card p-4 shadow-sm sm:p-6">
          <h2 className="text-lg font-bold">{exercise.question}</h2>
          <p className="mt-1 text-sm text-muted-foreground">Elegí una opción. No se muestra si es correcta o incorrecta.</p>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {Array.from({ length: exercise.optionCount }, (_, itemIndex) => String(itemIndex + 1)).map((option) => (
              <button
                key={option}
                onClick={() => setSelected(option)}
                className={`rounded-xl border-2 p-5 text-xl font-bold transition ${selected === option ? 'border-primary bg-primary/10 shadow' : 'border-border hover:border-primary/60'}`}
              >
                {option}
              </button>
            ))}
          </div>
          <Button disabled={!selected} onClick={continueExercise} className="mt-5 w-full" size="lg">
            {index === exercises.length - 1 ? 'Finalizar módulo' : 'Continuar'}
          </Button>
        </section>
      </main>
    </div>
  )
}
