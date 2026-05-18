export type ModuleStatus = "not_started" | "in_progress" | "in_review" | "completed"

export type ExerciseAttempt = {
  exerciseId: string
  moduleId: string
  selectedAnswer: string
  startTime: string
  endTime: string
  timeSpent: number
  imageReference: string
}

export type ModuleAttempt = {
  moduleId: string
  userEmail: string
  status: ModuleStatus
  startedAt: string
  finishedAt?: string
  attempts: ExerciseAttempt[]
}

export type Exercise = {
  id: string
  moduleId: string
  imageUrl: string
  question: string
  options: {
    id: string
    label: string
    description?: string
  }[]
  correctAnswer: string
}
