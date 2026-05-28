import {PictureChoiceModule} from "@/src/components/modules/PictureChoiceModule";
import {iePictureExercises} from "@/src/lib/pictureExercises";

export default function SpatialModule() {
  return (
      <PictureChoiceModule
          moduleId="inteligencia-espacial"
          moduleName="Inteligencia Espacial"
          exercises={iePictureExercises}
      />
  )}
