'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

interface InReviewScreenProps {
  moduleId: string
  moduleName: string
  onBackToDashboard?: () => void
}

export function InReviewScreen({ moduleId, moduleName, onBackToDashboard }: InReviewScreenProps) {
  const router = useRouter()

  const handleBackClick = () => {
    if (onBackToDashboard) {
      onBackToDashboard()
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-background to-muted p-6">
      <div className="max-w-md text-center space-y-8">
        <div className="space-y-4">
          <div className="text-7xl animate-pulse">📋</div>
          <h1 className="text-4xl font-bold text-foreground">
            Evaluación en Revisión
          </h1>
        </div>

        <div className="bg-primary/10 border-2 border-primary/30 p-8 rounded-lg space-y-4">
          <p className="text-lg text-foreground">
            Tu evaluación del módulo <strong>{moduleName}</strong> ha sido completada exitosamente.
          </p>
          <p className="text-base text-foreground/70">
            Tu evaluación está siendo revisada. Pronto recibirás retroalimentación sobre tu desempeño.
          </p>
          <p className="text-sm text-foreground/60 italic">
            No puedes volver a completar este módulo en este momento.
          </p>
        </div>

        <Button
          onClick={handleBackClick}
          className="w-full"
          size="lg"
          variant="default"
        >
          Volver al Dashboard
        </Button>
      </div>
    </div>
  )
}
