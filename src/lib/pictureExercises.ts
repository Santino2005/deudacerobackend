import { PictureChoiceExercise } from '@/src/components/modules/PictureChoiceModule'

const LM_NAMES = [
  'B6', 'C5', 'C6', 'C7', 'C8', 'C10', 'C11',
  'D1', 'D3', 'D4', 'D5', 'D6', 'D7', 'D10', 'D11',
  'E2', 'E6', 'E8', 'E9', 'E11',
]

export const lmPictureExercises: PictureChoiceExercise[] = LM_NAMES.map((name, index) => ({
  id: `lm-${name.toLowerCase()}`,
  title: `Ejercicio ${index + 1} - ${name}`,
  imageUrl: `/LM/${name}.png`,
  question: '¿Cuál figura completa la serie?',
  optionCount: name === 'B6' ? 6 : 8,
}))

const IE_NAMES = [
  'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i',
  'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r',
]

export const iePictureExercises: PictureChoiceExercise[] = IE_NAMES.map((name, index) => ({
  id: `ie-${name}`,
  title: `Ejercicio ${index + 1}`,
  imageUrl: `/IE/${name}.png`,
  question: '¿Cuál es la figura correcta?',
  optionCount: 4,
}))