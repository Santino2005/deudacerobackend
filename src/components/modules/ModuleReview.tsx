'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { StoredModuleResult } from '@/src/lib/moduleAttemptStorage'

interface Props {
  result: StoredModuleResult
}

export function ModuleReview({ result }: Props) {
  const router = useRouter()
  const total = result.results.length

  const shouldShowScore =
      result.moduleId === 'logico-matematica' ||
      result.moduleId === 'inteligencia-espacial'

  const totalScore = shouldShowScore
      ? Math.round(
          result.results.reduce(
              (sum, item) =>
                  sum + (typeof item.score === 'number' ? Number(item.score) : 0),
              0
          )
      )
      : null

  return (
      <div className="min-h-screen bg-background px-4 py-6 sm:px-6">
        <main className="mx-auto max-w-4xl space-y-6">

          <section className="rounded-2xl border bg-card p-6 shadow-sm">
            <p className="text-sm font-medium text-muted-foreground">
              Evaluación en revisión
            </p>

            <h1 className="mt-2 text-3xl font-bold text-foreground">
              {result.moduleName}
            </h1>

            <p className="mt-3 text-muted-foreground">
              Este módulo ya fue completado. No podés volver a responderlo desde esta pantalla.
            </p>

            <div
                className={`mt-5 grid gap-3 ${
                    shouldShowScore ? 'sm:grid-cols-3' : 'sm:grid-cols-2'
                }`}
            >
              <div className="rounded-xl bg-muted p-4">
                <p className="text-sm text-muted-foreground">Ejercicios</p>
                <p className="text-2xl font-bold">{total}</p>
              </div>

              {shouldShowScore && (
                  <div className="rounded-xl bg-muted p-4">
                    <p className="text-sm text-muted-foreground">Score total</p>
                    <p className="text-2xl font-bold text-primary">
                      {totalScore}%
                    </p>
                  </div>
              )}

              <div className="rounded-xl bg-muted p-4">
                <p className="text-sm text-muted-foreground">Finalizado</p>
                <p className="text-sm font-semibold">
                  {new Date(result.finishedAt).toLocaleString()}
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border bg-card p-4 shadow-sm sm:p-6">
            <h2 className="text-xl font-bold">Detalle por ejercicio</h2>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[620px] text-left text-sm">
                <thead className="border-b text-muted-foreground">
                <tr>
                  <th className="py-3 pr-4">#</th>
                  <th className="py-3 pr-4">Ejercicio</th>
                  <th className="py-3 pr-4">Respuesta</th>

                  {shouldShowScore && (
                      <th className="py-3 pr-4">Score</th>
                  )}
                </tr>
                </thead>

                <tbody>
                {result.results.map((item, index) => (
                    <tr
                        key={item.id}
                        className="border-b last:border-0"
                    >
                      <td className="py-3 pr-4 font-semibold">
                        {index + 1}
                      </td>

                      <td className="py-3 pr-4">
                        {item.title}
                      </td>

                      <td className="py-3 pr-4">
                        {item.answer || '—'}
                      </td>

                      {shouldShowScore && (
                          <td className="py-3 pr-4">
                            {typeof item.score === 'number'
                                ? `${Math.round(item.score)}%`
                                : '—'}
                          </td>
                      )}
                    </tr>
                ))}
                </tbody>
              </table>
            </div>
          </section>

          <Button
              onClick={() => router.push('/dashboard')}
              className="w-full sm:w-auto"
          >
            Volver al dashboard
          </Button>
        </main>
      </div>
  )
}