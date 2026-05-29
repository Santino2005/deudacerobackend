'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { getStoredParticipantId } from '@/src/lib/participantStorage'
import { StoredModuleResult } from '@/src/lib/moduleAttemptStorage'
import {
  buildLocalAnalysis,
  getCompletedResults,
  IntelligenceAnalysis,
  intelligenceModules,
} from '@/src/lib/intelligenceSummary'

export default function ResultsPage() {
  const router = useRouter()
  const [participantId, setParticipantId] = useState<string | null>(null)
  const [results, setResults] = useState<StoredModuleResult[]>([])
  const [analysis, setAnalysis] = useState<IntelligenceAnalysis | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedParticipantId = getStoredParticipantId()

    if (!storedParticipantId) {
      router.push('/')
      return
    }

    const completed = getCompletedResults(storedParticipantId)
    const storedResults = completed
      .map((item) => item.result)
      .filter(Boolean) as StoredModuleResult[]

    setParticipantId(storedParticipantId)
    setResults(storedResults)
    setAnalysis(buildLocalAnalysis(storedResults))
  }, [router])

  useEffect(() => {
    if (!participantId) return

    async function analyze() {
      try {
        setLoading(true)
        const response = await fetch('/api/analyze-open-answers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ participantId, results }),
        })

        if (!response.ok) return

        const data = (await response.json()) as IntelligenceAnalysis
        console.log('ANALYSIS FROM API:', data)
        setAnalysis(data)
      } finally {
        setLoading(false)
      }
    }

    analyze()
  }, [participantId, results])

  const scores = useMemo(() => analysis?.scores ?? [], [analysis])
  const maxScore = Math.max(...scores.map((item) => item.score), 100)
  const completedCount = results.length

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-primary">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <h1 className="text-2xl font-bold text-primary-foreground">Resultado del perfil</h1>
          <Button variant="secondary" onClick={() => router.push('/dashboard')}>Volver</Button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <section className="rounded-2xl border bg-card p-6 shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">
            {completedCount} de {intelligenceModules.length} módulos completados
          </p>

          <h2 className="mt-3 text-4xl font-bold">
            {analysis?.predominant
              ? `Predomina: ${analysis.predominant.title}`
              : 'Perfil todavía incompleto'}
          </h2>

          <p className="mt-4 max-w-3xl text-muted-foreground">
            {loading ? 'Analizando respuestas abiertas con IA...' : analysis?.summary}
          </p>

          {analysis?.predominant?.evidence && !loading && (
              <p className="mt-4 rounded-xl bg-muted p-4 text-sm text-muted-foreground">
                {analysis.predominant.evidence}
              </p>
          )}
        </section>

        <section className="mt-8 rounded-2xl border bg-card p-6 shadow-sm">
          <h3 className="text-2xl font-bold">Gráfico de inteligencias</h3>

          <div className="mt-6 space-y-4">
            {scores.map((item) => {
              const module = intelligenceModules.find((entry) => entry.id === item.moduleId)
              const width = `${Math.max(4, (item.score / maxScore) * 100)}%`

              return (
                <div key={item.moduleId}>
                  <div className="mb-2 flex items-center justify-between gap-4 text-sm">
                    <span className="font-semibold">{module?.icon} {item.title}</span>
                    <span className="text-muted-foreground">{item.score}/100</span>
                  </div>

                  <div className="h-4 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary transition-all" style={{ width }} />
                  </div>

                  <p className="mt-1 text-xs text-muted-foreground">{item.evidence}</p>
                </div>
              )
            })}
          </div>
        </section>

        <section className="mt-8 rounded-2xl border bg-card p-6 shadow-sm">
          <h3 className="text-2xl font-bold">Lectura orientativa</h3>

          <ul className="mt-4 list-disc space-y-2 pl-5 text-muted-foreground">
            {(analysis?.recommendations ?? []).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>

          <p className="mt-5 text-xs text-muted-foreground">
            Este resultado es orientativo. No reemplaza una evaluación psicológica profesional.
          </p>
        </section>
      </main>
    </div>
  )
}
