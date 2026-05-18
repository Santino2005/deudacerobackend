import { PictureChoiceModule } from '@/src/components/modules/PictureChoiceModule'
import { lmPictureExercises } from '@/src/lib/pictureExercises'

export default function LogicoMatematicaPage() {
  return (
      <PictureChoiceModule
          moduleId="logico-matematica"
          moduleName="Lógico-Matemática"
          exercises={lmPictureExercises}
      />
  )
}