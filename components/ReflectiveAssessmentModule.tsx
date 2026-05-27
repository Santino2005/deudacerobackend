'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { getStoredParticipantId } from '@/src/lib/participantStorage'
import {
    clearStoredModuleProgress,
    getStoredModuleProgress,
    getStoredModuleResult,
    saveStoredModuleProgress,
    saveStoredModuleResult,
    StoredExerciseResult,
    StoredModuleResult,
} from '@/src/lib/moduleAttemptStorage'

export type ReflectiveExercise = {
    id: string
    title: string
    prompt: string
}

interface Props {
    moduleId: string
    moduleName: string
    intro: string
    exercises: ReflectiveExercise[]
}

function estimateReflectionScore(answer: string) {
    const words = answer.trim().split(/\s+/).filter(Boolean).length

    if (words >= 60) return 95
    if (words >= 40) return 85
    if (words >= 25) return 70
    if (words >= 12) return 55

    return 30
}

export function ReflectiveAssessmentModule({
                                               moduleId,
                                               moduleName,
                                               intro,
                                               exercises,
                                           }: Props) {
    const router = useRouter()

    const [userKey, setUserKey] = useState<string | null>(null)
    const [index, setIndex] = useState(0)
    const [answers, setAnswers] = useState<Record<string, string>>({})
    const [results, setResults] = useState<StoredExerciseResult[]>([])
    const [completedResult, setCompletedResult] =
        useState<StoredModuleResult | null>(null)

    const [startedAt] = useState(() => new Date().toISOString())
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

    const stored = useMemo(() => {
        if (!userKey) return null
        return getStoredModuleResult(moduleId, userKey)
    }, [moduleId, userKey])

    useEffect(() => {
        if (!userKey) return
        if (progressLoaded.current) return

        const progress = getStoredModuleProgress(moduleId, userKey)

        if (!progress) {
            progressLoaded.current = true
            return
        }

        if (typeof progress.currentIndex === 'number') {
            setIndex(progress.currentIndex)
        }

        if (progress.answers) {
            setAnswers(progress.answers as Record<string, string>)
        }

        setResults(progress.results ?? [])
        progressLoaded.current = true
    }, [moduleId, userKey])

    useEffect(() => {
        exerciseStart.current = Date.now()
    }, [index])

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
                updatedAt: new Date().toISOString(),
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

    if (stored?.status === 'completed' && !completedResult) {
        router.push('/dashboard')
        return null
    }

    const currentExercise = exercises[index]
    const answer = answers[currentExercise.id] ?? ''

    function upsertResult(result: StoredExerciseResult) {
        const nextResults = [
            ...results.filter((item) => item.id !== result.id),
            result,
        ]

        setResults(nextResults)
        return nextResults
    }

    function finish(nextResults: StoredExerciseResult[]) {
        const completed: StoredModuleResult = {
            moduleId,
            moduleName,
            status: 'completed',
            startedAt,
            finishedAt: new Date().toISOString(),
            results: nextResults,
        }

        saveStoredModuleResult(completed, userKey!)
        clearStoredModuleProgress(moduleId, userKey!)
        setCompletedResult(completed)
    }

    function continueExercise() {
        if (!answer.trim()) return

        const result: StoredExerciseResult = {
            id: currentExercise.id,
            title: currentExercise.title,
            answer,
            score: estimateReflectionScore(answer),
            timeSpent: (Date.now() - exerciseStart.current) / 1000,
            details: {
                prompt: currentExercise.prompt,
            },
            createdAt: new Date().toISOString(),
        }

        const nextResults = upsertResult(result)

        if (index + 1 >= exercises.length) {
            finish(nextResults)
            return
        }

        setIndex((current) => current + 1)
    }

    function goBack() {
        if (index === 0) return
        setIndex((current) => current - 1)
    }

    const completedActivities = index
    const totalActivities = exercises.length

    if (completedResult) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background px-6">
                <div className="max-w-xl rounded-2xl border bg-card p-8 text-center shadow-sm">
                    <h2 className="text-3xl font-bold">Módulo completado</h2>

                    <p className="mt-4 text-muted-foreground">
                        Tus respuestas fueron registradas correctamente.
                    </p>

                    <Button className="mt-6" onClick={() => router.push('/dashboard')}>
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
                    <Button variant="ghost" onClick={() => router.push('/dashboard')}>
                        Volver
                    </Button>

                    <p className="mt-4 text-sm text-muted-foreground">
                        Actividad {completedActivities + 1} de {totalActivities}
                    </p>

                    <h1 className="mt-2 text-3xl font-bold">{moduleName}</h1>

                    <p className="mt-2 text-muted-foreground">{intro}</p>

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

                <section className="rounded-2xl border bg-card p-6 shadow-sm">
                    <p className="text-sm text-muted-foreground">
                        Pregunta {index + 1} de {exercises.length}
                    </p>

                    <h2 className="mt-3 text-xl font-bold">{currentExercise.title}</h2>

                    <p className="mt-4 text-muted-foreground">
                        {currentExercise.prompt}
                    </p>

                    <Textarea
                        className="mt-6 min-h-48"
                        value={answer}
                        onChange={(event) =>
                            setAnswers((previous) => ({
                                ...previous,
                                [currentExercise.id]: event.target.value,
                            }))
                        }
                        placeholder="Escribí tu reflexión..."
                    />

                    <div className="mt-6 space-y-3">
                        <Button
                            variant="outline"
                            disabled={index === 0}
                            onClick={goBack}
                            className="w-full"
                        >
                            Anterior
                        </Button>

                        <Button
                            className="w-full"
                            onClick={continueExercise}
                            disabled={!answer.trim()}
                        >
                            {index + 1 >= exercises.length ? 'Finalizar módulo' : 'Continuar'}
                        </Button>
                    </div>
                </section>
            </main>
        </div>
    )
}