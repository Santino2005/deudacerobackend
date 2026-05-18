'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'
import {
  getStoredParticipantId,
  clearStoredParticipantId,
} from '@/src/lib/participantStorage'
import { getStoredModuleResult } from '@/src/lib/moduleAttemptStorage'

const modules = [
  { id: 'logico-matematica', title: 'Lógico-Matemática', icon: '🔢', color: 'from-blue-500 to-blue-600', route: '/module/logico-matematica' },
  { id: 'linguistic', title: 'Lingüística', icon: '📝', color: 'from-green-500 to-green-600', route: '/modules/linguistic' },
  { id: 'inteligencia-espacial', title: 'Espacial', icon: '🎨', color: 'from-purple-500 to-purple-600', route: '/module/inteligencia-espacial' },
  { id: 'musical', title: 'Musical', icon: '🎵', color: 'from-pink-500 to-pink-600', route: '/modules/musical' },
  { id: 'body-kinesthetic', title: 'Corporal-Cinestésica', icon: '🏃', color: 'from-orange-500 to-orange-600', route: '/modules/body-kinesthetic' },
  { id: 'naturalistic', title: 'Naturalista', icon: '🌿', color: 'from-emerald-500 to-emerald-600', route: '/modules/naturalistic' },
  { id: 'intrapersonal', title: 'Intrapersonal', icon: '🧠', color: 'from-indigo-500 to-indigo-600', route: '/modules/intrapersonal' },
  { id: 'interpersonal', title: 'Interpersonal', icon: '👥', color: 'from-cyan-500 to-cyan-600', route: '/modules/interpersonal' },
]

export default function Dashboard() {
  const router = useRouter()
  const [participantId, setParticipantId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedParticipantId = getStoredParticipantId()

    if (!storedParticipantId) {
      router.push('/')
      return
    }

    setParticipantId(storedParticipantId)
    setLoading(false)
  }, [router])

  const completedModules = useMemo(() => {
    if (!participantId) return []

    return modules
        .map((module) => getStoredModuleResult(module.id, participantId))
        .filter(Boolean)
  }, [participantId])

  function handleLogout() {
    clearStoredParticipantId()
    router.push('/')
  }

  function handleComenzarModule(route: string) {
    router.push(route)
  }

  function getModuleResult(moduleId: string) {
    if (!participantId) return null
    return getStoredModuleResult(moduleId, participantId)
  }

  function getModuleAverage(moduleId: string) {
    const result = getModuleResult(moduleId)
    if (!result) return null

    const scored = result.results.filter((item) => typeof item.score === 'number')
    if (!scored.length) return null

    return Math.round(
        scored.reduce((sum, item) => sum + Number(item.score), 0) / scored.length
    )
  }

  const average =
      completedModules.length > 0
          ? Math.round(
              completedModules.reduce((sum, result) => {
                const scored = result!.results.filter((item) => typeof item.score === 'number')
                if (!scored.length) return sum
                const moduleAverage =
                    scored.reduce((acc, item) => acc + Number(item.score), 0) / scored.length
                return sum + moduleAverage
              }, 0) / completedModules.length
          )
          : 0

  if (loading) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="text-center">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-b-2 border-primary"></div>
            <p className="mt-4 text-foreground">Cargando dashboard...</p>
          </div>
        </div>
    )
  }

  return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <span className="font-bold text-primary-foreground">MI</span>
              </div>

              <h1 className="text-2xl font-bold text-foreground">
                Perfil de Inteligencias
              </h1>
            </div>

            <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2">
              <LogOut className="h-4 w-4" />
              Salir
            </Button>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-6 py-12">
          <div className="mb-12">
            <h2 className="mb-2 text-3xl font-bold text-foreground">
              Módulos de evaluación
            </h2>

            <p className="text-muted-foreground">
              Completá cada módulo. Cuando un módulo queda en revisión no se puede volver
              a completar, pero sí revisar resultados y tiempos.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {modules.map((module) => {
              const result = getModuleResult(module.id)
              const score = getModuleAverage(module.id)
              const isCompleted = Boolean(result)

              return (
                  <div
                      key={module.id}
                      className="overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-primary/50 hover:shadow-lg"
                  >
                    <div className={`flex h-24 items-center justify-center bg-gradient-to-br ${module.color}`}>
                      <span className="text-5xl">{module.icon}</span>
                    </div>

                    <div className="p-6">
                      <h3 className="mb-4 font-bold text-foreground">{module.title}</h3>

                      {isCompleted ? (
                          <>
                            <div className="mb-4">
                              <div className="mb-2 flex items-center justify-between">
                          <span className="text-sm font-medium text-muted-foreground">
                            Score
                          </span>
                                <span className="text-lg font-bold text-primary">
                            {score === null ? '—' : `${score}/100`}
                          </span>
                              </div>

                              <div className="h-2 w-full rounded-full bg-muted">
                                <div
                                    className="h-2 rounded-full bg-primary transition-all"
                                    style={{ width: `${score ?? 0}%` }}
                                />
                              </div>
                            </div>

                            <div className="mb-4">
                        <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                          ✓ En revisión
                        </span>
                            </div>
                          </>
                      ) : (
                          <div className="mb-4">
                      <span className="inline-block rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
                        Sin iniciar
                      </span>
                          </div>
                      )}

                      <Button
                          onClick={() => handleComenzarModule(module.route)}
                          className="w-full"
                          variant={isCompleted ? 'outline' : 'default'}
                      >
                        {isCompleted ? 'Revisar' : 'Comenzar'}
                      </Button>
                    </div>
                  </div>
              )
            })}
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <div className="rounded-lg border border-border bg-card p-6">
              <p className="mb-2 text-sm text-muted-foreground">Módulos completados</p>
              <p className="text-4xl font-bold text-primary">
                {completedModules.length}/8
              </p>
            </div>

            <div className="rounded-lg border border-border bg-card p-6">
              <p className="mb-2 text-sm text-muted-foreground">Promedio</p>
              <p className="text-4xl font-bold text-accent">{average}</p>
            </div>

            <div className="rounded-lg border border-border bg-card p-6">
              <p className="mb-2 text-sm text-muted-foreground">Estado</p>
              <p className="text-4xl font-bold text-secondary">
                {completedModules.length === 8 ? 'Listo' : 'Activo'}
              </p>
            </div>
          </div>
        </main>
      </div>
  )
}