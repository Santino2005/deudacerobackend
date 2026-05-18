import { PictureChoiceModule } from '@/src/components/modules/PictureChoiceModule'
import { iePictureExercises } from '@/src/lib/pictureExercises'

export default function InteligenciaEspacialPage() {
  return (
    <PictureChoiceModule
      moduleId="inteligencia-espacial"
      moduleName="Inteligencia Espacial"
      exercises={iePictureExercises}
    />
  )
}
