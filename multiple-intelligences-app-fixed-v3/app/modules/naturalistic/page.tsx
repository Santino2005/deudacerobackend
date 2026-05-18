'use client'

import Image from 'next/image'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  getStoredModuleResult,
  saveStoredModuleResult,
  StoredExerciseResult,
  StoredModuleResult,
} from '@/src/lib/moduleAttemptStorage'

import { getStoredParticipantId } from '@/src/lib/participantStorage'
import { ModuleReview } from '@/src/components/modules/ModuleReview'

const MODULE_ID = 'naturalistic'
const MODULE_NAME = 'Inteligencia Naturalista'

type Stage = 'rosco' | 'tracks' | 'questions'

const roscoItems = [
  {
    letter: 'A',
    mode: 'Empieza con A',
    prompt: 'Grupo de animales que viven parte de su vida en el agua y parte en tierra.',
  },
  {
    letter: 'B',
    mode: 'Empieza con B',
    prompt: 'Ecosistema dominado por árboles, arbustos y una gran biodiversidad.',
  },
  {
    letter: 'C',
    mode: 'Empieza con C',
    prompt: 'Planta adaptada a zonas áridas, capaz de almacenar agua.',
  },
  {
    letter: 'D',
    mode: 'Contiene D',
    prompt: 'Pérdida progresiva de bosques por tala, incendios o expansión humana.',
  },
  {
    letter: 'E',
    mode: 'Empieza con E',
    prompt: 'Sistema formado por seres vivos, ambiente físico y relaciones entre ellos.',
  },
  {
    letter: 'F',
    mode: 'Empieza con F',
    prompt: 'Conjunto de animales característicos de una región o ambiente.',
  },
  {
    letter: 'G',
    mode: 'Contiene G',
    prompt: 'Proceso de cultivar y cuidar plantas, flores o huertas.',
  },
  {
    letter: 'H',
    mode: 'Empieza con H',
    prompt: 'Rastro que deja un animal al pisar barro, tierra o arena.',
  },
  {
    letter: 'I',
    mode: 'Empieza con I',
    prompt: 'Animal pequeño de seis patas, como hormiga, abeja o escarabajo.',
  },
  {
    letter: 'J',
    mode: 'Contiene J',
    prompt: 'Espacio cuidado donde se cultivan plantas ornamentales, flores o árboles.',
  },
]

const trackItems = [
  {
    id: 'track-duck',
    title: 'Huella 1',
    image: '/IN/duck.jpg',
    options: ['Pato', 'Ganso', 'Pingüino', 'Focha'],
  },
  {
    id: 'track-frog',
    title: 'Huella 2',
    image: '/IN/frog.jpg',
    options: ['Rana', 'Lagarto', 'Mapache', 'Salamandra'],
  },
  {
    id: 'track-eagle',
    title: 'Huella 3',
    image: '/IN/eagle.jpg',
    options: ['Águila', 'Gallina', 'Gallo', 'Búho'],
  },
  {
    id: 'track-horse',
    title: 'Huella 4',
    image: '/IN/horse.jpg',
    options: ['Caballo', 'Ciervo', 'Vaca', 'Cerdo'],
  },
  {
    id: 'track-bear',
    title: 'Huella 5',
    image: '/IN/oso_pardo.jpg',
    options: ['Oso', 'Lobo', 'León', 'Tigre'],
  },
  {
    id: 'track-elephant',
    title: 'Huella 6',
    image: '/IN/elefante.jpg',
    options: ['Elefante', 'Hipopótamo', 'Rinoceronte', 'Tapir'],
  },
  {
    id: 'track-deer',
    title: 'Huella 7',
    image: '/IN/ciervo.jpg',
    options: ['Ciervo', 'Alce', 'Cabra', 'Antílope'],
  },
  {
    id: 'track-wolf',
    title: 'Huella 8',
    image: '/IN/lobo.jpg',
    options: ['Lobo', 'Perro', 'Zorro', 'Gato'],
  },
]

const naturalistQuestions = [
  'Amo caminar por bosques o espacios naturales y observar árboles, flores o animales.',
  'Disfruto la jardinería, sembrar plantas o cuidar espacios verdes.',
  'Disfruto estar al aire libre y en contacto con la naturaleza.',
  'Me interesa aprender nombres de animales, plantas u otros seres vivos.',
  'Me atrae coleccionar o reconocer elementos naturales como piedras, hojas, insectos o flores.',
  'Me gusta pasar tiempo al aire libre, moverme, caminar o correr afuera.',
  'Disfruto actividades como pesca, horticultura, sembrar plantas o explorar entornos naturales.',
  'Me gustan los animales y suelo prestarles atención.',
  'Reviso o me interesa el clima, los cambios del ambiente o las estaciones.',
  'Me gusta alejarme de la ciudad y disfrutar entornos naturales.',
]

export default function NaturalisticModule() {
  const router = useRouter()

  const [userKey, setUserKey] = useState<string | null>(null)

  useEffect(() => {
    const participantId = getStoredParticipantId()

    if (!participantId) {
      router.push('/')
      return
    }

    setUserKey(participantId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const [completedResult, setCompletedResult] = useState<StoredModuleResult | null>(null)
  const [results, setResults] = useState<StoredExerciseResult[]>([])
  const [stage, setStage] = useState<Stage>('rosco')

  const [roscoIndex, setRoscoIndex] = useState(0)
  const [roscoAnswer, setRoscoAnswer] = useState('')
  const [roscoStates, setRoscoStates] = useState<Record<string, 'answered' | 'passed'>>({})
  const [roscoResponses, setRoscoResponses] = useState<Record<string, string>>({})

  const [trackIndex, setTrackIndex] = useState(0)

  const [questionIndex, setQuestionIndex] = useState(0)
  const [questionAnswers, setQuestionAnswers] = useState<number[]>([])

  const startedAt = useRef(new Date().toISOString())
  const exerciseStart = useRef(Date.now())


  const stored = useMemo(() => getStoredModuleResult(MODULE_ID, userKey), [userKey])
  if (!userKey) {
    return (
        <div className="flex min-h-screen items-center justify-center">
          Cargando...
        </div>
    )
  }

  if (completedResult) return <ModuleReview result={completedResult} />
  if (stored) return <ModuleReview result={stored} />

  function finish(nextResults: StoredExerciseResult[]) {
    const completed = {
      moduleId: MODULE_ID,
      moduleName: MODULE_NAME,
      status: 'in_review' as const,
      startedAt: startedAt.current,
      finishedAt: new Date().toISOString(),
      results: nextResults,
    }

    saveStoredModuleResult(completed, userKey)
    setCompletedResult(completed)
  }

  function pushResult(result: StoredExerciseResult) {
    const next = [...results, result]
    setResults(next)
    exerciseStart.current = Date.now()
    return next
  }

  function completeRoscoLetter(status: 'answered' | 'passed') {
    const item = roscoItems[roscoIndex]
    const value = status === 'passed' ? 'Pasa palabra' : roscoAnswer.trim()

    const nextStates = {
      ...roscoStates,
      [item.letter]: status,
    }

    const nextResponses = {
      ...roscoResponses,
      [item.letter]: value,
    }

    setRoscoStates(nextStates)
    setRoscoResponses(nextResponses)
    setRoscoAnswer('')

    if (roscoIndex + 1 >= roscoItems.length) {
      pushResult({
        id: 'naturalist-rosco',
        title: 'Rosco naturalista A-J',
        answer: JSON.stringify(nextResponses),
        score: undefined,
        timeSpent: (Date.now() - exerciseStart.current) / 1000,
        details: {
          states: nextStates,
          responses: nextResponses,
        },
        createdAt: new Date().toISOString(),
      })

      setStage('tracks')
      return
    }

    setRoscoIndex(roscoIndex + 1)
  }

  function submitTrack(option: string) {
    const item = trackItems[trackIndex]

    pushResult({
      id: item.id,
      title: item.title,
      answer: option,
      score: undefined,
      timeSpent: (Date.now() - exerciseStart.current) / 1000,
      details: {
        image: item.image,
        options: item.options,
      },
      createdAt: new Date().toISOString(),
    })

    if (trackIndex + 1 >= trackItems.length) {
      setStage('questions')
      return
    }

    setTrackIndex(trackIndex + 1)
  }

  function answerQuestion(value: number) {
    const nextAnswers = [...questionAnswers, value]
    setQuestionAnswers(nextAnswers)

    if (questionIndex + 1 < naturalistQuestions.length) {
      setQuestionIndex(questionIndex + 1)
      return
    }

    const average = nextAnswers.reduce((sum, item) => sum + item, 0) / nextAnswers.length

    const next = pushResult({
      id: 'naturalist-self-report',
      title: 'Autopercepción naturalista',
      answer: nextAnswers.join(', '),
      score: Math.round((average / 5) * 100),
      timeSpent: (Date.now() - exerciseStart.current) / 1000,
      details: {
        questions: naturalistQuestions,
        answers: nextAnswers,
      },
      createdAt: new Date().toISOString(),
    })

    finish(next)
  }

  const totalActivities = roscoItems.length + trackItems.length + naturalistQuestions.length

  const completedActivities =
      stage === 'rosco'
          ? roscoIndex
          : stage === 'tracks'
              ? roscoItems.length + trackIndex
              : roscoItems.length + trackItems.length + questionIndex

  const currentRoscoItem = roscoItems[roscoIndex]
  const currentTrackItem = trackItems[trackIndex]

  return (
      <div className="min-h-screen bg-background px-4 py-5 sm:px-6">
        <main className="mx-auto max-w-4xl space-y-5">
          <header className="rounded-2xl border bg-card p-5 shadow-sm">
            <Button
                variant="ghost"
                onClick={() => router.push('/dashboard')}
                className="mb-3"
            >
              Volver
            </Button>

            <p className="text-sm text-muted-foreground">
              Actividad {completedActivities + 1} de {totalActivities}
            </p>

            <h1 className="text-3xl font-bold">{MODULE_NAME}</h1>

            <p className="mt-2 text-muted-foreground">
              Rosco de palabras, reconocimiento de huellas y preguntas sobre vínculo con la naturaleza.
            </p>

            <p className="mt-3 rounded-xl bg-muted p-3 text-sm text-muted-foreground">
              Este test busca explorar tu perfil vocacional. No tiene sentido buscar respuestas
              perfectas: respondé con lo que sabés, recordás o intuís.
            </p>

            <div className="mt-4 h-2 rounded-full bg-muted">
              <div
                  className="h-2 rounded-full bg-primary transition-all"
                  style={{
                    width: `${Math.min(100, (completedActivities / totalActivities) * 100)}%`,
                  }}
              />
            </div>
          </header>

          {stage === 'rosco' && (
              <section className="rounded-2xl border bg-card p-5 shadow-sm">
                <div className="mb-5 flex flex-wrap justify-center gap-2">
                  {roscoItems.map((item, index) => {
                    const state = roscoStates[item.letter]
                    const isCurrent = index === roscoIndex

                    return (
                        <div
                            key={item.letter}
                            className={`flex h-11 w-11 items-center justify-center rounded-full border text-sm font-bold transition ${
                                state === 'passed'
                                    ? 'border-yellow-400 bg-yellow-100 text-yellow-800'
                                    : state === 'answered'
                                        ? 'border-indigo-400 bg-indigo-100 text-indigo-800'
                                        : isCurrent
                                            ? 'border-primary bg-primary text-primary-foreground'
                                            : 'border-border bg-background text-muted-foreground'
                            }`}
                        >
                          {item.letter}
                        </div>
                    )
                  })}
                </div>

                <h2 className="text-xl font-bold">Rosco naturalista</h2>

                <p className="mt-2 text-sm text-muted-foreground">
                  {currentRoscoItem.mode}. Respondé si se te ocurre algo. Si no, usá “Pasa palabra”.
                </p>

                <div className="mt-5 rounded-2xl bg-muted p-5">
                  <p className="text-lg font-medium">{currentRoscoItem.prompt}</p>
                </div>

                <Input
                    value={roscoAnswer}
                    onChange={(event) => setRoscoAnswer(event.target.value)}
                    className="mt-5"
                    placeholder={`Respuesta: ${currentRoscoItem.mode.toLowerCase()}...`}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' && roscoAnswer.trim()) {
                        completeRoscoLetter('answered')
                      }
                    }}
                />

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <Button
                      variant="outline"
                      onClick={() => completeRoscoLetter('passed')}
                  >
                    Pasa palabra
                  </Button>

                  <Button
                      onClick={() => completeRoscoLetter('answered')}
                      disabled={!roscoAnswer.trim()}
                  >
                    Completar letra
                  </Button>
                </div>
              </section>
          )}

          {stage === 'tracks' && (
              <section className="rounded-2xl border bg-card p-5 text-center shadow-sm">
                <h2 className="text-xl font-bold">
                  Huellas de animales {trackIndex + 1}/{trackItems.length}
                </h2>

                <p className="mt-2 text-muted-foreground">
                  Observá la huella y elegí a qué animal podría pertenecer.
                </p>

                <div className="mx-auto mt-6 flex h-72 w-72 items-center justify-center rounded-3xl bg-muted p-5">
                  <Image
                      src={currentTrackItem.image}
                      alt={currentTrackItem.title}
                      width={240}
                      height={240}
                      className="max-h-full max-w-full object-contain"
                  />
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {currentTrackItem.options.map((option) => (
                      <button
                          key={option}
                          onClick={() => submitTrack(option)}
                          className="rounded-xl border-2 p-4 font-semibold transition hover:border-primary/60 hover:bg-primary/5"
                      >
                        {option}
                      </button>
                  ))}
                </div>
              </section>
          )}

          {stage === 'questions' && (
              <section className="rounded-2xl border bg-card p-6 shadow-sm">
                <h2 className="text-center text-xl font-bold">
                  Preguntas naturalistas {questionIndex + 1}/{naturalistQuestions.length}
                </h2>

                <p className="mt-5 text-center text-lg font-medium">
                  {naturalistQuestions[questionIndex]}
                </p>

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