'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { getStoredParticipantId } from '@/src/lib/participantStorage'
import {
    getStoredModuleResult,
    saveStoredModuleResult,
    StoredExerciseResult
} from '@/src/lib/moduleAttemptStorage'
import { ModuleReview } from '@/src/components/modules/ModuleReview'

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
                                               exercises
                                           }: Props) {
    const router = useRouter()

    const [userKey, setUserKey] = useState<string | null>(null)
    const [index, setIndex] = useState(0)
    const [answer, setAnswer] = useState('')
    const [results, setResults] = useState<StoredExerciseResult[]>([])
    const [completedResult, setCompletedResult] = useState(null)
    const [startedAt] = useState(() => new Date().toISOString())
    const [startedExerciseAt, setStartedExerciseAt] = useState(Date.now())

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
    }, [index])

    const stored = useMemo(
        () => (userKey ? getStoredModuleResult(moduleId, userKey) : null),
        [moduleId, userKey]
    )

    if (!userKey) {
        return <div>Cargando...</div>
    }

    if (completedResult) {
        return <ModuleReview result={completedResult} />
    }

    if (stored) {
        return <ModuleReview result={stored} />
    }

    const currentExercise = exercises[index]

    function continueExercise() {
        if (!answer.trim()) return

        const result: StoredExerciseResult = {
            id: currentExercise.id,
            title: currentExercise.title,
            answer,
            score: estimateReflectionScore(answer),
            timeSpent: (Date.now() - startedExerciseAt) / 1000,
            details: {
                prompt: currentExercise.prompt
            },
            createdAt: new Date().toISOString()
        }

        const nextResults = [...results, result]
        setResults(nextResults)

        if (index + 1 >= exercises.length) {
            const completed = {
                moduleId,
                moduleName,
                status: 'in_review' as const,
                startedAt,
                finishedAt: new Date().toISOString(),
                results: nextResults
            }

            saveStoredModuleResult(completed, userKey)
            setCompletedResult(completed)
            return
        }

        setIndex(index + 1)
    }

    return (
        <div className="min-h-screen bg-background px-4 py-5 sm:px-6">
            <main className="mx-auto max-w-3xl space-y-5">
                <header className="rounded-2xl border bg-card p-5">
                    <Button
                        variant="ghost"
                        onClick={() => router.push('/dashboard')}
                    >
                        Volver
                    </Button>

                    <h1 className="mt-4 text-3xl font-bold">
                        {moduleName}
                    </h1>

                    <p className="mt-2 text-muted-foreground">
                        {intro}
                    </p>
                </header>

                <section className="rounded-2xl border bg-card p-6">
                    <p className="text-sm text-muted-foreground">
                        Pregunta {index + 1} de {exercises.length}
                    </p>

                    <h2 className="mt-3 text-xl font-bold">
                        {currentExercise.title}
                    </h2>

                    <p className="mt-4 text-muted-foreground">
                        {currentExercise.prompt}
                    </p>

                    <Textarea
                        className="mt-6 min-h-48"
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                        placeholder="Escribí tu reflexión..."
                    />

                    <Button
                        className="mt-6 w-full"
                        onClick={continueExercise}
                        disabled={!answer.trim()}
                    >
                        Continuar
                    </Button>
                </section>
            </main>
        </div>
    )
}