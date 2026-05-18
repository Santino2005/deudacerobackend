'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createParticipant } from '@/src/lib/participants'
import { getStoredParticipantId } from '@/src/lib/participantStorage'

export default function Home() {
  const router = useRouter()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const participantId = getStoredParticipantId()

    if (participantId) {
      router.push('/dashboard')
      return
    }

    setLoading(false)
  }, [router])

  async function handleStart() {
    if (!firstName.trim() || !lastName.trim()) return

    try {
      setSubmitting(true)
      await createParticipant(firstName.trim(), lastName.trim())
      router.push('/dashboard')
    } catch (error) {
      console.error(error)
      alert('No se pudo iniciar la evaluación. Revisá la conexión o Supabase.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
          <div className="text-center">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-b-2 border-primary"></div>
            <p className="mt-4 text-foreground">Cargando...</p>
          </div>
        </div>
    )
  }

  return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 to-accent/10">
        <header className="border-b border-border bg-background/80 backdrop-blur-sm">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <span className="font-bold text-primary-foreground">MI</span>
              </div>
              <h1 className="text-2xl font-bold text-foreground">
                Perfil de Inteligencias
              </h1>
            </div>
          </div>
        </header>

        <main className="mx-auto grid min-h-[calc(100vh-73px)] max-w-6xl items-center gap-10 px-6 py-12 lg:grid-cols-2">
          <section>
            <h2 className="text-balance text-5xl font-bold text-foreground">
              Descubrí tu perfil de inteligencias
            </h2>

            <p className="mt-6 max-w-xl text-xl text-muted-foreground">
              Completá una experiencia interactiva basada en actividades, situaciones y preguntas
              reflexivas. No necesitás crear cuenta.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {[
                'Lógico-matemática',
                'Lingüística',
                'Espacial',
                'Musical',
                'Corporal',
                'Naturalista',
                'Intrapersonal',
                'Interpersonal',
              ].map((item) => (
                  <div key={item} className="rounded-xl border bg-card p-4 text-sm font-semibold">
                    {item}
                  </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border bg-card p-6 shadow-sm">
            <h3 className="text-2xl font-bold">Empezar evaluación</h3>

            <p className="mt-2 text-muted-foreground">
              Ingresá tu nombre y apellido para guardar tus resultados.
            </p>

            <div className="mt-6 space-y-4">
              <div>
                <label className="text-sm font-medium">Nombre</label>
                <Input
                    value={firstName}
                    onChange={(event) => setFirstName(event.target.value)}
                    placeholder="Ej: Jorge"
                    className="mt-2"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Apellido</label>
                <Input
                    value={lastName}
                    onChange={(event) => setLastName(event.target.value)}
                    placeholder="Ej: Perez"
                    className="mt-2"
                />
              </div>
            </div>

            <Button
                onClick={handleStart}
                disabled={!firstName.trim() || !lastName.trim() || submitting}
                className="mt-6 w-full"
                size="lg"
            >
              {submitting ? 'Guardando...' : 'Comenzar'}
            </Button>

            <p className="mt-4 text-xs text-muted-foreground">
              Tus respuestas se guardan para revisión. Esto no es un diagnóstico psicológico.
            </p>
          </section>
        </main>
      </div>
  )
}