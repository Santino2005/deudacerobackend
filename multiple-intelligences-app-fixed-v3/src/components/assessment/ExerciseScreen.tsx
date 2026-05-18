'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { Exercise } from '@/src/types/assessment'
import { Button } from '@/components/ui/button'

interface ExerciseScreenProps {
  exercise: Exercise
  currentIndex: number
  totalExercises: number
  onAnswer: (selectedAnswer: string, timeSpent: number) => void
}

export function ExerciseScreen({
  exercise,
  currentIndex,
  totalExercises,
  onAnswer,
}: ExerciseScreenProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const startTimeRef = useRef<number>(Date.now())

  useEffect(() => {
    startTimeRef.current = Date.now()
    setSelectedAnswer(null)
  }, [exercise.id])

  const handleContinue = () => {
    if (!selectedAnswer) return

    const timeSpent = (Date.now() - startTimeRef.current) / 1000
    console.log('[v0] Submitting:', { exerciseId: exercise.id, selectedAnswer, timeSpent })
    onAnswer(selectedAnswer, timeSpent)
    setSelectedAnswer(null)
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Barra de progreso */}
      <div className="bg-primary text-primary-foreground p-4">
        <div className="max-w-4xl mx-auto">
          <p className="text-sm font-semibold">
            Ejercicio {currentIndex + 1} de {totalExercises}
          </p>
          <div className="w-full bg-primary-foreground/20 rounded-full h-2 mt-2">
            <div
              className="bg-primary-foreground h-2 rounded-full transition-all"
              style={{ width: `${((currentIndex + 1) / totalExercises) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-4xl w-full space-y-8">
          {/* Imagen del ejercicio */}
          <div className="bg-white rounded-lg border border-border p-6 flex items-center justify-center min-h-[300px]">
            <div className="relative w-full aspect-video">
              <Image
                src={exercise.imageUrl}
                alt={exercise.question}
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>

          {/* Opciones de respuesta */}
          <div className="space-y-4">
            <p className="text-lg font-semibold text-foreground">
              {exercise.question}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {exercise.options.map((option) => (
                <button
                  key={option.id}
                  onClick={() => {
                    console.log('[v0] User clicked option:', option.id)
                    setSelectedAnswer(option.id)
                  }}
                  className={`p-6 rounded-lg border-2 font-bold text-xl transition-all min-h-[100px] flex items-center justify-center ${
                    selectedAnswer === option.id
                      ? 'border-primary bg-primary/15 ring-2 ring-primary shadow-lg'
                      : 'border-border bg-card hover:border-primary/50 hover:shadow-md'
                  }`}
                >
                  {option.id}
                </button>
              ))}
            </div>
          </div>

          {/* Botón Continuar */}
          <div className="flex justify-center pt-4">
            <Button
              onClick={handleContinue}
              disabled={!selectedAnswer}
              size="lg"
              className="px-12"
            >
              Continuar
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
