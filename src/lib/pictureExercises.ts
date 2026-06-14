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
function getLmFolderName(name: string) {
    if (name === 'E6') return 'E5'
    return name
}

function getLmInstructionImageUrl(name: string) {
    const folderName = getLmFolderName(name)

    if (name === 'B6') return `/LM/${folderName}/${name}O.png`
    return `/LM/${folderName}/${folderName}_consigna.png`
}

function getLmOptionImageUrls(name: string, optionCount: number) {
    const folderName = getLmFolderName(name)
    const prefix = name === 'B6' ? '' : `${folderName}_`

    return Array.from(
        { length: optionCount },
        (_, index) => `/LM/${folderName}/${prefix}opcion_${index + 1}.png`
    )
}

function getLmPercentage(name: string) {
    if (name.startsWith('B')) return 10
    if (name.startsWith('C')) return 3.33
    if (name.startsWith('D')) return 3.75
    if (name.startsWith('E')) return 8
    return 0
}

export const lmPictureExercises: PictureChoiceExercise[] =
    LM_EXERCISES.map((exercise, index) => {
        const optionCount =
            exercise.name === 'B6' ? 6 : 8

        return {
            id: `lm-${exercise.name.toLowerCase()}`,
            title: `Ejercicio ${index + 1} - ${exercise.name}`,
            imageUrl: `/LM/img/${exercise.name}.png`,
            instructionImageUrl: getLmInstructionImageUrl(exercise.name),
            question: '¿Cuál figura completa la serie?',
            optionCount,
            optionImageUrls: getLmOptionImageUrls(exercise.name, optionCount),
            correctAnswer: exercise.correctAnswer,
            percentageValue: getLmPercentage(exercise.name),
        }
    })

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

function getIeFolderName(name: string) {
    return name.toUpperCase()
}

function getIeOriginalFileName(name: string) {
    return name === 'f' ? 'originalf.png' : 'original.png'
}

function getIeInstructionImageUrl(name: string) {
    if (['h', 'i', 'j', 'q', 'r'].includes(name)) return undefined
    return `/IE/${getIeFolderName(name)}/consigna.png`
}

function getIeMainImageUrl(name: string) {
    return `/IE/${getIeFolderName(name)}/${getIeOriginalFileName(name)}`
}

function getIePastedImageName(index: number) {
    if (index === 0) return 'Pasted image.png'
    return `Pasted image (${index + 1}).png`
}

function getIeOptionImageUrls(name: string, count: number) {
    if (['h', 'i', 'j', 'q', 'r'].includes(name)) return undefined

    const pastedImageExercises =
        ['a', 'e', 'f', 'g', 'k', 'l', 'm', 'n']

    return Array.from(
        { length: count },
        (_, index) => {
            const folderName = getIeFolderName(name)

            if (pastedImageExercises.includes(name)) {
                return `/IE/${folderName}/${getIePastedImageName(index)}`
            }

            if (name === 'o' && index === 0) {
                return `/IE/${folderName}/Pasted image.png`
            }

            return `/IE/${folderName}/opcion_${index + 1}.png`
        }
    )
}

const getQuestionByExerciseName = (name: string): string => {
    switch (name) {
        case 'a':
            return 'Seleccioná la figura que cumple las mismas condiciones de ubicación de los puntos que la figura X.';
        case 'b':
            return 'Encontrá cómo aparecería el patrón cuando la hoja transparente se doble sobre la línea punteada.';
        case 'c':
            return 'Elegí las figura tridimensionales que pueden formarse a partir de la figura desplegada.';
        case 'd':
            return 'Seleccioná los cubos que pueden formarse a partir de la figura desplegada.';
        case 'e':
            return 'Indicá cuál de los cuadrados puede formarse con las piezas dadas en la figura X.';
        case 'f':
            return 'Encontrá cuál de las figuras puede construirse utilizando todas las piezas mostradas.';
        case 'g':
            return 'Indicá cuál de los cuadrados puede formarse con las piezas dadas en la figura X.';
        case 'h':
            return 'Seleccioná las tres figuras que pueden combinarse para formar un triángulo equilátero.';
        case 'i':
            return 'Seleccioná las tres figuras que pueden combinarse para formar un triángulo equilátero.';
        case 'j':
            return 'Seleccioná las tres figuras que pueden combinarse para formar un triángulo equilátero.';
        case 'k':
            return 'Indicá cuál de las figuras puede formarse con las piezas dadas en la figura X.';
        case 'l':
            return 'Encontrá cuál de las figuras puede formarse con las piezas dadas.';
        case 'm':
            return 'Elegí la figura correcta formada a partir de las piezas.';
        case 'n':
            return 'Seleccioná el círculo que se puede formar con las piezas de la figura X';
        case 'o':
            return 'Elegí el patrón final que puede obtenerse al plegar la pieza de cartón.';
        case 'p':
            return 'Elegí la figura tridimensional que puede formarse a partir de la red desplegada.';
        case 'q':
            return 'Seleccioná las tres figuras que pueden combinarse para formar un cuadrado completo.';
        case 'r':
            return 'Seleccioná las tres figuras que encajan correctamente para formar un cuadrado.';
        default:
            return 'Índice de pregunta inválido: notificar a los desarrolladores';
    }
};

export const iePictureExercises: PictureChoiceExercise[] =
    IE_EXERCISES.map((exercise, index) => {
        const optionCount = exercise.optionCount ?? exercise.options!.length;

        return {
            id: `ie-${exercise.name}`,
            title: `Ejercicio ${index + 1}`,
            imageUrl: `/IE/img/${exercise.name}.png`,
            instructionImageUrl: getIeInstructionImageUrl(exercise.name),
            mainImageUrl: getIeMainImageUrl(exercise.name),
            question: getQuestionByExerciseName(exercise.name),
            optionCount,
            options: exercise.options,
            optionImageUrls: getIeOptionImageUrls(exercise.name, optionCount),
            correctAnswer: exercise.correctAnswer,
            percentageValue: 100 / IE_EXERCISES.length,
        };
    });