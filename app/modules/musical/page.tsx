'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  clearStoredModuleProgress,
  getStoredModuleProgress,
  getStoredModuleResult,
  saveStoredModuleProgress,
  saveStoredModuleResult,
  StoredExerciseResult,
  StoredModuleResult,
} from '@/src/lib/moduleAttemptStorage'
import { getStoredParticipantId } from '@/src/lib/participantStorage'

const MODULE_ID = 'musical'
const MODULE_NAME = 'Inteligencia Musical'

type Stage = 'metronome' | 'recognition' | 'questions'

const tempoExercises = [
  { bpm: 75, options: [66, 70, 75, 78, 84] },
  { bpm: 95, options: [88, 92, 95, 98, 104] },
  { bpm: 130, options: [120, 126, 130, 134, 142] },
  { bpm: 155, options: [146, 152, 155, 158, 166] },
  { bpm: 180, options: [168, 176, 180, 184, 192] },
]

const recognitionExercises = [
  {
    id: 'reverse-1',
    title: 'Reversa correcta',
    instruction: 'Escuchá la pista base y elegí cuál opción es la reversa correcta.',
    base: [262, 294, 330, 392, 330, 294],
    expected: 'Opción A',
    options: [
      { label: 'Opción A', notes: [294, 330, 392, 330, 294, 262], speed: 1 },
      { label: 'Opción B', notes: [294, 330, 392, 349, 294, 262], speed: 1 },
      { label: 'Opción C', notes: [330, 294, 392, 330, 294, 262], speed: 1 },
    ],
  },
  {
    id: 'speed-1',
    title: 'Acelerada correcta',
    instruction: 'Escuchá la pista base y elegí cuál opción conserva la melodía pero acelerada.',
    base: [392, 440, 392, 330, 294, 330],
    expected: 'Opción B',
    options: [
      { label: 'Opción A', notes: [392, 440, 392, 349, 294, 330], speed: 1.7 },
      { label: 'Opción B', notes: [392, 440, 392, 330, 294, 330], speed: 1.7 },
      { label: 'Opción C', notes: [392, 440, 330, 392, 294, 330], speed: 1.7 },
    ],
  },
  {
    id: 'pitch-1',
    title: 'Variación tonal correcta',
    instruction: 'Escuchá la pista base y elegí cuál opción mantiene mejor el patrón con una variación tonal sutil.',
    base: [330, 392, 494, 392, 330, 294],
    expected: 'Opción C',
    options: [
      { label: 'Opción A', notes: [330, 392, 494, 349, 330, 294], speed: 1 },
      { label: 'Opción B', notes: [330, 392, 440, 392, 330, 294], speed: 1 },
      { label: 'Opción C', notes: [330, 392, 494, 392, 349, 294], speed: 1 },
    ],
  },
  {
    id: 'reverse-2',
    title: 'Reversa con cambio leve',
    instruction: 'Escuchá la pista base y elegí cuál opción suena como la reversa más fiel.',
    base: [440, 392, 349, 392, 494, 440],
    expected: 'Opción B',
    options: [
      { label: 'Opción A', notes: [440, 494, 392, 349, 392, 440], speed: 1 },
      { label: 'Opción B', notes: [440, 494, 392, 349, 392, 440], speed: 1 },
      { label: 'Opción C', notes: [494, 440, 392, 349, 392, 440], speed: 1 },
    ],
  },
  {
    id: 'speed-2',
    title: 'Aceleración melódica',
    instruction: 'Escuchá la pista base y elegí cuál opción conserva mejor la melodía acelerada.',
    base: [294, 330, 392, 440, 392, 330],
    expected: 'Opción A',
    options: [
      { label: 'Opción A', notes: [294, 330, 392, 440, 392, 330], speed: 1.8 },
      { label: 'Opción B', notes: [294, 330, 392, 494, 392, 330], speed: 1.8 },
      { label: 'Opción C', notes: [294, 392, 330, 440, 392, 330], speed: 1.8 },
    ],
  },
]

const musicalQuestions = [
  'Tengo una voz agradable para cantar.',
  'Puedo darme cuenta cuándo una nota musical está fuera de tono.',
  'Escucho música frecuentemente.',
  'Toco un instrumento musical.',
  'Mi vida sería más pobre si en ella no existiera la música.',
  'Con frecuencia tengo alguna canción o audio viral dándome vueltas en la cabeza.',
  'Me sale natural seguirle el beat a cualquier canción golpeando la mesa o los dedos contra algo.',
  'Tengo una biblioteca mental de letras de canciones que me sé completas de memoria.',
  'Escucho un tema nuevo un par de veces y ya me sale cantarlo sin equivocarme.',
  'Para concentrarme cuando hago algo, suelo estar tarareando o haciendo ruiditos con la boca.',
]

let sharedContext: AudioContext | null = null

function getAudioContext() {
  if (!sharedContext) {
    const AudioContextClass =
        window.AudioContext ||
        (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext

    sharedContext = new AudioContextClass()
  }

  if (sharedContext.state === 'suspended') {
    sharedContext.resume()
  }

  return sharedContext
}

function playTone(freq: number, delay: number, duration = 0.18) {
  const context = getAudioContext()
  const oscillator = context.createOscillator()
  const gain = context.createGain()

  oscillator.frequency.value = freq
  oscillator.type = 'sine'

  gain.gain.setValueAtTime(0.0001, context.currentTime + delay)
  gain.gain.exponentialRampToValueAtTime(0.12, context.currentTime + delay + 0.01)
  gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + delay + duration)

  oscillator.connect(gain)
  gain.connect(context.destination)

  oscillator.start(context.currentTime + delay)
  oscillator.stop(context.currentTime + delay + duration + 0.03)
}

function playMetronome(bpm: number) {
  const beatDuration = 60 / bpm
  const totalSeconds = 10
  const beats = Math.floor(totalSeconds / beatDuration)

  for (let i = 0; i < beats; i++) {
    const freq = i % 4 === 0 ? 880 : 660
    playTone(freq, i * beatDuration, 0.08)
  }
}

function playMelody(notes: number[], speed = 1) {
  const step = 0.42 / speed
  const duration = 0.25 / speed

  notes.forEach((freq, index) => {
    playTone(freq, index * step, duration)
  })
}

export default function MusicalModule() {
  const router = useRouter()

  const [userKey, setUserKey] = useState<string | null>(null)
  const [completedResult, setCompletedResult] = useState<StoredModuleResult | null>(null)
  const [results, setResults] = useState<StoredExerciseResult[]>([])
  const [stage, setStage] = useState<Stage>('metronome')

  const [metronomeIndex, setMetronomeIndex] = useState(0)
  const [metronomeAnswers, setMetronomeAnswers] = useState<Record<number, string>>({})

  const [recognitionIndex, setRecognitionIndex] = useState(0)
  const [recognitionAnswers, setRecognitionAnswers] = useState<Record<string, string>>({})

  const [questionIndex, setQuestionIndex] = useState(0)
  const [questionAnswers, setQuestionAnswers] = useState<Record<number, number>>({})

  const startedAt = useRef(new Date().toISOString())
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
    return getStoredModuleResult(MODULE_ID, userKey)
  }, [userKey])

  useEffect(() => {
    if (!userKey) return
    if (progressLoaded.current) return

    const progress = getStoredModuleProgress(MODULE_ID, userKey)

    if (!progress) {
      progressLoaded.current = true
      return
    }

    if (progress.currentStage) {
      const savedStage = progress.currentStage as Stage
      setStage(savedStage)

      if (savedStage === 'metronome') {
        setMetronomeIndex(progress.currentIndex ?? 0)
      }

      if (savedStage === 'recognition') {
        setRecognitionIndex(progress.currentIndex ?? 0)
      }

      if (savedStage === 'questions') {
        setQuestionIndex(progress.currentQuestionIndex ?? 0)
      }
    }

    setResults(progress.results ?? [])

    const saved = progress.answers as {
      metronomeAnswers?: Record<number, string>
      recognitionAnswers?: Record<string, string>
      questionAnswers?: Record<number, number>
    }

    setMetronomeAnswers(saved?.metronomeAnswers ?? {})
    setRecognitionAnswers(saved?.recognitionAnswers ?? {})
    setQuestionAnswers(saved?.questionAnswers ?? {})

    progressLoaded.current = true
  }, [userKey])

  useEffect(() => {
    exerciseStart.current = Date.now()
  }, [stage, metronomeIndex, recognitionIndex, questionIndex])

  useEffect(() => {
    if (!userKey) return
    if (completedResult) return
    if (!progressLoaded.current) return

    saveStoredModuleProgress(
        {
          moduleId: MODULE_ID,
          moduleName: MODULE_NAME,
          status: 'in_progress',
          currentStage: stage,
          currentIndex:
              stage === 'metronome'
                  ? metronomeIndex
                  : stage === 'recognition'
                      ? recognitionIndex
                      : undefined,
          currentQuestionIndex: stage === 'questions' ? questionIndex : undefined,
          answers: {
            metronomeAnswers,
            recognitionAnswers,
            questionAnswers,
          },
          results,
          updatedAt: new Date().toISOString(),
        },
        userKey
    )
  }, [
    userKey,
    completedResult,
    stage,
    metronomeIndex,
    recognitionIndex,
    questionIndex,
    metronomeAnswers,
    recognitionAnswers,
    questionAnswers,
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

  function upsertResult(result: StoredExerciseResult) {
    const next = [
      ...results.filter((item) => item.id !== result.id),
      result,
    ]

    setResults(next)
    return next
  }

  function finish(nextResults: StoredExerciseResult[]) {
    const completed: StoredModuleResult = {
      moduleId: MODULE_ID,
      moduleName: MODULE_NAME,
      status: 'completed',
      startedAt: startedAt.current,
      finishedAt: new Date().toISOString(),
      results: nextResults,
    }

    saveStoredModuleResult(completed, userKey!)
    clearStoredModuleProgress(MODULE_ID, userKey!)
    setCompletedResult(completed)
  }

  function goBack() {
    if (stage === 'questions') {
      if (questionIndex > 0) {
        setQuestionIndex((prev) => prev - 1)
        return
      }

      setStage('recognition')
      setRecognitionIndex(recognitionExercises.length - 1)
      return
    }

    if (stage === 'recognition') {
      if (recognitionIndex > 0) {
        setRecognitionIndex((prev) => prev - 1)
        return
      }

      setStage('metronome')
      setMetronomeIndex(tempoExercises.length - 1)
      return
    }

    if (stage === 'metronome' && metronomeIndex > 0) {
      setMetronomeIndex((prev) => prev - 1)
    }
  }

  function submitMetronome() {
    const metronomeAnswer = metronomeAnswers[metronomeIndex]

    if (!metronomeAnswer) return

    const bpm = tempoExercises[metronomeIndex].bpm
    const selected = Number(metronomeAnswer)
    const diff = Math.abs(selected - bpm)

    const nextResults = upsertResult({
      id: `musical-metronome-${bpm}`,
      title: `Metrónomo ${bpm} BPM`,
      answer: `${selected} BPM`,
      score: Math.max(0, 100 - diff * 2),
      timeSpent: (Date.now() - exerciseStart.current) / 1000,
      details: {
        bpm,
        selected,
        formula: 'BPS = BPM / 60',
        bps: bpm / 60,
      },
      createdAt: new Date().toISOString(),
    })

    if (metronomeIndex + 1 >= tempoExercises.length) {
      setStage('recognition')
      return
    }

    setMetronomeIndex((prev) => prev + 1)
  }

  function submitRecognition() {
    const exercise = recognitionExercises[recognitionIndex]
    const recognitionAnswer = recognitionAnswers[exercise.id]

    if (!recognitionAnswer) return

    const nextResults = upsertResult({
      id: `musical-recognition-${exercise.id}`,
      title: exercise.title,
      answer: recognitionAnswer,
      score: recognitionAnswer === exercise.expected ? 100 : 0,
      timeSpent: (Date.now() - exerciseStart.current) / 1000,
      details: {
        expected: exercise.expected,
        instruction: exercise.instruction,
      },
      createdAt: new Date().toISOString(),
    })

    if (recognitionIndex + 1 >= recognitionExercises.length) {
      setStage('questions')
      return
    }

    setRecognitionIndex((prev) => prev + 1)
  }

  function answerQuestion(value: number) {
    const result: StoredExerciseResult = {
      id: `musical-question-${questionIndex + 1}`,
      title: `Pregunta musical ${questionIndex + 1}`,
      answer: String(value),
      score: Math.round((value / 5) * 100),
      timeSpent: (Date.now() - exerciseStart.current) / 1000,
      details: {
        question: musicalQuestions[questionIndex],
      },
      createdAt: new Date().toISOString(),
    }

    setQuestionAnswers((previous) => ({
      ...previous,
      [questionIndex]: value,
    }))

    const nextResults = upsertResult(result)

    if (questionIndex + 1 >= musicalQuestions.length) {
      finish(nextResults)
      return
    }

    setQuestionIndex((prev) => prev + 1)
  }

  const totalActivities =
      tempoExercises.length + recognitionExercises.length + musicalQuestions.length

  const completedActivities =
      stage === 'metronome'
          ? metronomeIndex
          : stage === 'recognition'
              ? tempoExercises.length + recognitionIndex
              : tempoExercises.length + recognitionExercises.length + questionIndex

  const currentTempoExercise = tempoExercises[metronomeIndex]
  const currentBpm = currentTempoExercise.bpm
  const currentBps = currentBpm / 60
  const currentRecognition = recognitionExercises[recognitionIndex]
  const metronomeAnswer = metronomeAnswers[metronomeIndex] ?? ''
  const recognitionAnswer = recognitionAnswers[currentRecognition.id] ?? ''
  const questionAnswer = questionAnswers[questionIndex]

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
              Tempo, memoria auditiva, reconocimiento de variaciones y vínculo personal con la música.
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

          {stage === 'metronome' && (
              <section className="rounded-2xl border bg-card p-6 shadow-sm">
                <h2 className="text-xl font-bold">
                  Metrónomo {metronomeIndex + 1}/{tempoExercises.length}
                </h2>

                <p className="mt-2 text-muted-foreground">
                  Escuchá el metrónomo durante 10 segundos y elegí el tempo más parecido.
                </p>

                <div className="mt-5 rounded-2xl bg-muted p-4">
                  <p className="font-semibold">Fórmula clásica</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    BPM = golpes en 10 segundos × 6
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    BPS actual: {currentBps.toFixed(2)}
                  </p>
                </div>

                <Button
                    onClick={() => playMetronome(currentBpm)}
                    className="mt-5 w-full"
                    size="lg"
                >
                  Reproducir metrónomo 10s
                </Button>

                <div className="mt-5 grid gap-3 sm:grid-cols-5">
                  {currentTempoExercise.options.map((tempo) => (
                      <button
                          key={tempo}
                          onClick={() =>
                              setMetronomeAnswers((previous) => ({
                                ...previous,
                                [metronomeIndex]: String(tempo),
                              }))
                          }
                          className={`rounded-xl border-2 p-4 font-bold transition ${
                              metronomeAnswer === String(tempo)
                                  ? 'border-primary bg-primary/10'
                                  : 'border-border hover:border-primary/60'
                          }`}
                      >
                        {tempo}
                      </button>
                  ))}
                </div>

                <div className="mt-5 space-y-3">
                  <Button
                      variant="outline"
                      disabled={stage === 'metronome' && metronomeIndex === 0}
                      onClick={goBack}
                      className="w-full"
                  >
                    Anterior
                  </Button>

                  <Button
                      disabled={!metronomeAnswer}
                      onClick={submitMetronome}
                      className="w-full"
                      size="lg"
                  >
                    Continuar
                  </Button>
                </div>
              </section>
          )}

          {stage === 'recognition' && (
              <section className="rounded-2xl border bg-card p-6 shadow-sm">
                <h2 className="text-xl font-bold">
                  {currentRecognition.title} {recognitionIndex + 1}/{recognitionExercises.length}
                </h2>

                <p className="mt-2 text-muted-foreground">
                  {currentRecognition.instruction}
                </p>

                <Button
                    onClick={() => playMelody(currentRecognition.base)}
                    className="mt-5 w-full"
                    size="lg"
                >
                  Reproducir pista base
                </Button>

                <div className="mt-5 grid gap-3">
                  {currentRecognition.options.map((option) => (
                      <div key={option.label} className="rounded-xl border p-3">
                        <Button
                            variant="outline"
                            onClick={() => playMelody(option.notes, option.speed)}
                            className="w-full"
                        >
                          Escuchar {option.label}
                        </Button>

                        <button
                            onClick={() =>
                                setRecognitionAnswers((previous) => ({
                                  ...previous,
                                  [currentRecognition.id]: option.label,
                                }))
                            }
                            className={`mt-3 w-full rounded-xl border-2 p-3 font-semibold transition ${
                                recognitionAnswer === option.label
                                    ? 'border-primary bg-primary/10'
                                    : 'border-border hover:border-primary/60'
                            }`}
                        >
                          Elegir {option.label}
                        </button>
                      </div>
                  ))}
                </div>

                <div className="mt-5 space-y-3">
                  <Button variant="outline" onClick={goBack} className="w-full">
                    Anterior
                  </Button>

                  <Button
                      disabled={!recognitionAnswer}
                      onClick={submitRecognition}
                      className="w-full"
                      size="lg"
                  >
                    Continuar
                  </Button>
                </div>
              </section>
          )}

          {stage === 'questions' && (
              <section className="rounded-2xl border bg-card p-6 shadow-sm">
                <h2 className="text-center text-xl font-bold">
                  Preguntas musicales {questionIndex + 1}/{musicalQuestions.length}
                </h2>

                <p className="mt-5 text-center text-lg font-medium">
                  {musicalQuestions[questionIndex]}
                </p>

                <div className="mt-6 grid grid-cols-5 gap-2">
                  {[1, 2, 3, 4, 5].map((value) => (
                      <button
                          key={value}
                          onClick={() => answerQuestion(value)}
                          className={`rounded-xl border p-4 font-bold transition hover:border-primary hover:bg-primary/10 ${
                              questionAnswer === value ? 'border-primary bg-primary/10' : ''
                          }`}
                      >
                        {value}
                      </button>
                  ))}
                </div>

                <div className="mt-4 flex justify-between text-xs text-muted-foreground">
                  <span>Nunca</span>
                  <span>Siempre</span>
                </div>

                <div className="mt-5">
                  <Button variant="outline" onClick={goBack} className="w-full">
                    Anterior
                  </Button>
                </div>
              </section>
          )}
        </main>
      </div>
  )
}