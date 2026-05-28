import {lmPictureExercises} from "@/src/lib/pictureExercises";
import {PictureChoiceModule} from "@/src/components/modules/PictureChoiceModule";

export default function LogicalMathematicalModule() {
  return (
      <PictureChoiceModule
          moduleId="logico-matematica"
          moduleName="Lógico-Matemática"
          exercises={lmPictureExercises}
      />
  )
}
