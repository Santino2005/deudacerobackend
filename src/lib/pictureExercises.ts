import { PictureChoiceExercise } from '@/src/components/modules/PictureChoiceModule'

const LM_EXERCISES = [
  { name: 'B6', correctAnswer: '3' },
  { name: 'C5', correctAnswer: '7' },
  { name: 'C6', correctAnswer: '4' },
  { name: 'C7', correctAnswer: '5' },
  { name: 'C8', correctAnswer: '1' },
  { name: 'C10', correctAnswer: '6' },
  { name: 'C11', correctAnswer: '1' },

  { name: 'D1', correctAnswer: '3' },
  { name: 'D3', correctAnswer: '3' },
  { name: 'D4', correctAnswer: '7' },
  { name: 'D5', correctAnswer: '8' },
  { name: 'D6', correctAnswer: '6' },
  { name: 'D7', correctAnswer: '5' },
  { name: 'D10', correctAnswer: '2' },
  { name: 'D11', correctAnswer: '5' },

  { name: 'E2', correctAnswer: '6' },
  { name: 'E6', correctAnswer: '5' },
  { name: 'E8', correctAnswer: '6' },
  { name: 'E9', correctAnswer: '3' },
  { name: 'E11', correctAnswer: '4' },
]
function getLmPercentage(name: string) {
    if (name.startsWith('B')) return 10
    if (name.startsWith('C')) return 3.33
    if (name.startsWith('D')) return 3.75
    if (name.startsWith('E')) return 8
    return 0
}

export const lmPictureExercises: PictureChoiceExercise[] =
    LM_EXERCISES.map((exercise, index) => ({
        id: `lm-${exercise.name.toLowerCase()}`,
        title: `Ejercicio ${index + 1} - ${exercise.name}`,
        imageUrl: `/LM/${exercise.name}.png`,
        question: '¿Cuál figura completa la serie?',
        optionCount: exercise.name === 'B6' ? 6 : 8,
        correctAnswer: exercise.correctAnswer,
        percentageValue: getLmPercentage(exercise.name),
    }))

const IE_EXERCISES = [
  { name: 'a', correctAnswer: '2', optionCount: 4 },
  { name: 'b', correctAnswer: '3', optionCount: 4 },
  { name: 'c', correctAnswer: '2', optionCount: 4 },
  { name: 'd', correctAnswer: '4', optionCount: 4 },
  { name: 'e', correctAnswer: '1', optionCount: 4 },
  { name: 'f', correctAnswer: '2', optionCount: 4 },
  { name: 'g', correctAnswer: '3', optionCount: 4 },

  { name: 'h', correctAnswer: '134', options: ['124', '235', '134', '245'] },
  { name: 'i', correctAnswer: '345', options: ['123', '345', '245', '234'] },
  { name: 'j', correctAnswer: '134', options: ['134', '235', '245', '123'] },

  { name: 'k', correctAnswer: '2', optionCount: 4 },
  { name: 'l', correctAnswer: '1', optionCount: 4 },
  { name: 'm', correctAnswer: '3', optionCount: 4 },
  { name: 'n', correctAnswer: '2', optionCount: 4 },
  { name: 'o', correctAnswer: '3', optionCount: 4 },
  { name: 'p', correctAnswer: '4', optionCount: 4 },

  { name: 'q', correctAnswer: '124', options: ['124', '235', '134', '245'] },
  { name: 'r', correctAnswer: '234', options: ['123', '345', '245', '234'] },
]

export const iePictureExercises: PictureChoiceExercise[] =
    IE_EXERCISES.map((exercise, index) => ({
        id: `ie-${exercise.name}`,
        title: `Ejercicio ${index + 1}`,
        imageUrl: `/IE/${exercise.name}.png`,
        question:
            exercise.name === 'a'
                ? 'Seleccioná la figura que cumple las mismas condiciones de ubicación de los puntos que la figura X.'
                : exercise.name === 'b'
                    ? 'Encontrá cómo aparecería el patrón cuando la hoja transparente se doble sobre la línea punteada.'
                    : exercise.name === 'c'
                        ? 'Elegí la figura tridimensional que puede formarse a partir de la red desplegada.'
                        : exercise.name === 'd'
                            ? 'Seleccioná el cubo correcto que puede formarse a partir de la figura desplegada.'
                            : exercise.name === 'e'
                                ? 'Indicá cuál de las figuras puede formarse con las piezas dadas en la figura X.'
                                : exercise.name === 'f'
                                    ? 'Encontrá cuál de las figuras puede construirse utilizando todas las piezas mostradas.'
                                    : exercise.name === 'g'
                                        ? 'Seleccioná las tres figuras que encajan entre sí para formar un cuadrado completo.'
                                        : exercise.name === 'h'
                                            ? 'Seleccioná las tres figuras que pueden combinarse para formar un triángulo equilátero.'
                                            : exercise.name === 'j'
                                                ? 'Elegí la figura circular que puede construirse con las piezas dadas.'
                                                : exercise.name === 'k'
                                                    ? 'Seleccioná la figura que puede construirse con las piezas triangulares dadas.'
                                                    : exercise.name === 'l'
                                                        ? 'Encontrá cuál de las figuras puede formarse con las piezas dadas.'
                                                        : exercise.name === 'm'
                                                            ? 'Elegí la figura circular correcta formada a partir de las piezas.'
                                                            : exercise.name === 'n'
                                                                ? 'Seleccioná el cubo similar al formado por la hoja desplegada.'
                                                                : exercise.name === 'o'
                                                                    ? 'Elegí el patrón final que puede obtenerse al plegar la pieza de cartón.'
                                                                    : exercise.name === 'p'
                                                                        ? 'Seleccioná las tres figuras que encajan para formar un cuadrado completo.'
                                                                        : exercise.name === 'q'
                                                                            ? 'Seleccioná las tres figuras que pueden combinarse para formar un cuadrado completo.'
                                                                            : exercise.name === 'r'
                                                                                ? 'Seleccioná las tres figuras que encajan correctamente para formar un cuadrado.'
                                                                                : '¿Cuál es la figura correcta?',
        optionCount: exercise.optionCount ?? exercise.options!.length,
        options: exercise.options,
        correctAnswer: exercise.correctAnswer,
        percentageValue: 100 / IE_EXERCISES.length,
    }))