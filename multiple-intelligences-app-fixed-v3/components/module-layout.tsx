'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ChevronLeft } from 'lucide-react'
import { moduleQuestions } from '@/lib/module-questions'

interface ModuleLayoutProps {
  moduleId: string
  moduleTitle: string
  moduleIcon: string
}

interface Question {
  id: string
  question: string
  options: string[] | string
  correct: string | number
  explanation: string
}

export default function ModuleLayout({ moduleId, moduleTitle, moduleIcon }: ModuleLayoutProps) {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [score, setScore] = useState(0)
  const [answered, setAnswered] = useState(false)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [loading, setLoading] = useState(true)
  const [completed, setCompleted] = useState(false)
  const supabase = createClient()

  const questions: Question[] = (moduleQuestions as any)[moduleId] || []

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/auth/login')
        return
      }

      setUser(user)
      setLoading(false)
    }

    checkAuth()
  }, [router, supabase])

  const handleAnswer = async (answer: any) => {
    if (answered) return

    const question = questions[currentQuestion]
    const isCorrect = answer === question.correct || String(answer) === String(question.correct)

    setSelectedAnswer(answer)
    setAnswered(true)

    if (isCorrect) {
      setScore(score + 1)
    }

    // Save response to database
    if (user) {
      await supabase.from('user_responses').insert({
        user_id: user.id,
        module_name: moduleId,
        question_id: question.id,
        answer: String(answer),
        is_correct: isCorrect,
      })
    }
  }

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
      setAnswered(false)
      setSelectedAnswer(null)
    } else {
      finishModule()
    }
  }

  const finishModule = async () => {
    if (!user) return

    const finalScore = ((score + (selectedAnswer === questions[currentQuestion].correct ? 1 : 0)) / questions.length) * 100

    // Update or insert progress
    const { data: existing } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', user.id)
      .eq('module_name', moduleId)
      .single()

    if (existing) {
      await supabase
        .from('user_progress')
        .update({
          score: finalScore,
          completion_status: 'completed',
          completed_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)
        .eq('module_name', moduleId)
    } else {
      await supabase.from('user_progress').insert({
        user_id: user.id,
        module_name: moduleId,
        score: finalScore,
        completion_status: 'completed',
        completed_at: new Date().toISOString(),
      })
    }

    setCompleted(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-foreground">Loading module...</p>
        </div>
      </div>
    )
  }

  if (completed) {
    const finalScore = ((score + (selectedAnswer === questions[currentQuestion].correct ? 1 : 0)) / questions.length) * 100

    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card">
          <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/dashboard')}
              className="gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </Button>
            <h1 className="text-xl font-bold text-foreground flex-1">{moduleIcon} {moduleTitle}</h1>
          </div>
        </header>

        <main className="max-w-3xl mx-auto px-6 py-12">
          <div className="bg-card rounded-lg border border-border p-12 text-center">
            <div className="text-6xl mb-6">🎉</div>
            <h2 className="text-3xl font-bold text-foreground mb-4">Module Complete!</h2>
            <p className="text-xl text-muted-foreground mb-8">Great job! Here&apos;s how you did:</p>

            <div className="bg-background rounded-lg p-8 mb-8 inline-block">
              <div className="text-5xl font-bold text-primary mb-2">
                {Math.round(finalScore)}%
              </div>
              <p className="text-muted-foreground">
                {score + (selectedAnswer === questions[currentQuestion].correct ? 1 : 0)}/{questions.length} correct
              </p>
            </div>

            <p className="text-muted-foreground mb-8">
              {finalScore >= 80
                ? "Excellent work! You have strong skills in this intelligence."
                : finalScore >= 60
                ? "Good job! You have solid skills in this area. Try again to improve!"
                : "Nice effort! Keep practicing to strengthen this intelligence."}
            </p>

            <Button onClick={() => router.push('/dashboard')} size="lg">
              Back to Dashboard
            </Button>
          </div>
        </main>
      </div>
    )
  }

  const question = questions[currentQuestion]
  const progress = ((currentQuestion + 1) / questions.length) * 100

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/dashboard')}
            className="gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </Button>
          <div className="flex-1 mx-4">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-lg font-bold text-foreground">{moduleIcon} {moduleTitle}</h1>
              <span className="text-sm text-muted-foreground">
                Question {currentQuestion + 1} of {questions.length}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-6 py-12">
        <div className="bg-card rounded-lg border border-border p-8">
          <h2 className="text-2xl font-bold text-foreground mb-8">{question.question}</h2>

          <div className="space-y-3 mb-8">
            {(Array.isArray(question.options) ? question.options : [question.options]).map(
              (option: any, index: number) => (
                <button
                  key={index}
                  onClick={() => handleAnswer(option)}
                  disabled={answered}
                  className={`w-full p-4 rounded-lg border-2 transition-all text-left font-medium ${
                    selectedAnswer === option
                      ? option === question.correct || String(option) === String(question.correct)
                        ? 'border-green-500 bg-green-50 text-green-900'
                        : 'border-red-500 bg-red-50 text-red-900'
                      : answered && (option === question.correct || String(option) === String(question.correct))
                      ? 'border-green-500 bg-green-50 text-green-900'
                      : 'border-border hover:border-primary'
                  } ${answered ? 'cursor-default' : 'cursor-pointer hover:bg-muted'}`}
                >
                  {option}
                </button>
              )
            )}
          </div>

          {answered && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
              <p className="font-semibold text-blue-900 mb-2">Explanation:</p>
              <p className="text-blue-800">{question.explanation}</p>
            </div>
          )}

          {answered && (
            <Button onClick={handleNext} className="w-full">
              {currentQuestion === questions.length - 1 ? 'See Results' : 'Next Question'}
            </Button>
          )}
        </div>
      </main>
    </div>
  )
}
