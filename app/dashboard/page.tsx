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

function moduleColor(moduleId: string) {
  const colors: Record<string, string> = {
    'logico-matematica': '#3b82f6',
    linguistic: '#22c55e',
    'inteligencia-espacial': '#a855f7',
    musical: '#ec4899',
    'body-kinesthetic': '#f97316',
    naturalistic: '#10b981',
    intrapersonal: '#6366f1',
    interpersonal: '#06b6d4',
  }

  return colors[moduleId] ?? '#64748b'
}

function buildProgressGradient(completedIds: string[]) {
  const slice = 360 / modules.length
  const gap = 3

  const parts = modules.map((module, index) => {
    const start = index * slice
    const end = start + slice - gap

    const color = completedIds.includes(module.id)
        ? moduleColor(module.id)
        : 'rgba(148,163,184,0.10)'

    return `${color} ${start}deg ${end}deg, transparent ${end}deg ${start + slice}deg`
  })

  return `conic-gradient(${parts.join(', ')})`
}

function BackgroundProgressWheel({ completedIds }: { completedIds: string[] }) {
  const completed = completedIds.length
  const total = modules.length
  const gradient = buildProgressGradient(completedIds)

  return (
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute left-1/2 top-[54%] h-[1050px] w-[1050px] -translate-x-1/2 -translate-y-1/2">
          <div
              className="absolute inset-0 animate-spin rounded-full opacity-35"
              style={{
                background: gradient,
                animationDuration: '70s',
              }}
          />

          <div className="absolute inset-[90px] rounded-full bg-background/95" />

          <div className="absolute inset-0 rounded-full ring-1 ring-border/30" />
        </div>

        <div className="absolute left-[57%] top-[32%] hidden rounded-2xl border bg-card/80 px-5 py-4 shadow-sm backdrop-blur-md md:block">
          <p className="text-sm font-semibold text-foreground">
            Ciclo en progreso
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {completed}/{total} módulos completados
          </p>
        </div>
      </div>
  )
}

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

  const completedModuleIds = useMemo(() => {
    if (!participantId) return []

    return modules
        .filter((module) =>
            getStoredModuleResult(module.id, participantId)
        )
        .map((module) => module.id)
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

    const shouldShowScore =
        result.moduleId === 'logico-matematica' ||
        result.moduleId === 'inteligencia-espacial'

    if (!shouldShowScore) return null

    const scored = result.results.filter(
        (item) => typeof item.score === 'number'
    )

    if (!scored.length) return null

    const totalScore = scored.reduce(
        (sum, item) => sum + Number(item.score),
        0
    )

    return Math.round(totalScore)
  }

  if (loading) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="text-center">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-b-2 border-primary"></div>
            <p className="mt-4 text-foreground">
              Cargando dashboard...
            </p>
          </div>
        </div>
    )
  }

  return (
      <div className="relative min-h-screen overflow-hidden bg-background">
        <BackgroundProgressWheel completedIds={completedModuleIds} />

        <header className="relative z-10 border-b border-border bg-card/80 backdrop-blur-md">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-foreground">
                Perfil de Inteligencias
              </h1>
            </div>

            <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="gap-2"
            >
              <LogOut className="h-4 w-4" />
              Salir
            </Button>
          </div>
        </header>

        <main className="relative z-10 mx-auto max-w-7xl px-6 py-12">
          <div className="mb-12">
            <h2 className="mb-2 text-3xl font-bold text-foreground">
              Módulos de evaluación
            </h2>

            <p className="text-muted-foreground">
              Completá cada módulo para cerrar el ciclo completo.
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
                      className="overflow-hidden rounded-xl border border-border bg-card/85 backdrop-blur-md transition-all hover:border-primary/50 hover:shadow-xl"
                  >
                    <div
                        className={`flex h-24 items-center justify-center bg-gradient-to-br ${module.color}`}
                    >
                  <span className="text-5xl">
                    {module.icon}
                  </span>
                    </div>

                    <div className="p-6">
                      <h3 className="mb-4 font-bold text-foreground">
                        {module.title}
                      </h3>

                      {score !== null && (
                          <div className="mb-4">
                            <div className="mb-2 flex justify-between">
                        <span className="text-sm text-muted-foreground">
                          Score
                        </span>

                              <span className="font-bold text-primary">
                          {score}/100
                        </span>
                            </div>

                            <div className="h-2 rounded-full bg-muted">
                              <div
                                  className="h-2 rounded-full bg-primary"
                                  style={{
                                    width: `${score}%`,
                                  }}
                              />
                            </div>
                          </div>
                      )}

                      <Button
                          onClick={() =>
                              handleComenzarModule(module.route)
                          }
                          className="w-full"
                          variant={
                            isCompleted
                                ? 'outline'
                                : 'default'
                          }
                      >
                        {isCompleted
                            ? 'Revisar'
                            : 'Comenzar'}
                      </Button>
                    </div>
                  </div>
              )
            })}
          </div>
        </main>
      </div>
  )
}