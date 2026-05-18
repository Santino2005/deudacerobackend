import {
  TextAssessmentModule,
  TextExercise,
  LikertQuestion,
} from '@/src/components/modules/TextAssessmentModule'

const exercises: TextExercise[] = [
  {
    id: 'il-1',
    title: 'Gestión social de conflicto',
    situation: 'Cancelaste una salida grupal a último momento por un imprevisto personal.',
    audience: 'Tu grupo de amigos está molesto con vos.',
    restriction:
        'No podés usar: perdón, disculpas, me dormí, cansado, colgué, no tenía ganas. Tenés que sonar empático y convincente.',
    timeLimit: 60,
    scoreHint: 'pragmática, registro, empatía verbal y adaptación al público',
  },
  {
    id: 'il-2',
    title: 'Explicar un riesgo digital',
    situation:
        'Tu primo de 14 años quiere entrar a un negocio raro que vio en redes sociales.',
    audience: 'Un adolescente impulsivo que cree que encontró una gran oportunidad.',
    restriction:
        'No podés usar: estafa, mentira, dinero, robar, pirámide, cripto. Debe ser un único párrafo continuo.',
    timeLimit: 45,
    scoreHint: 'claridad, inhibición verbal, explicación simple y registro adecuado',
  },
  {
    id: 'il-3',
    title: 'Síntesis extrema',
    situation:
        'Reducí esta presentación: “Soy una persona curiosa, estudio, me gusta la música, disfruto aprender cosas nuevas, valoro los vínculos, me interesan los proyectos creativos y busco crecer profesionalmente sin perder mi estilo personal.”',
    audience: 'Un reclutador o algoritmo que solo mira los primeros segundos.',
    restriction:
        'Escribí exactamente una oración de entre 12 y 15 palabras. Debe tener sujeto y predicado. No puede ser una lista.',
    timeLimit: 40,
    scoreHint: 'síntesis, precisión verbal y estructura sintáctica',
  },
  {
    id: 'il-4',
    title: 'Persuasión formal',
    situation:
        'Querés alquilar un departamento con amigos, pero no tenés recibo de sueldo tradicional.',
    audience: 'Un propietario de 50 años, tradicional y desconfiado.',
    restriction:
        'Incluí obligatoriamente: consiguientemente, si bien, por lo tanto, en resumidas cuentas. No uses jerga informal.',
    timeLimit: 75,
    scoreHint: 'retórica, argumentación formal y adaptación de registro',
  },
  {
    id: 'il-5',
    title: 'Lipograma verbal',
    situation:
        'Explicale a un amigo por qué las redes sociales recomiendan contenido tan preciso.',
    audience: 'Un amigo que cree que el celular lo escucha todo el tiempo.',
    restriction:
        'No podés usar ninguna palabra que contenga la letra “e”.',
    timeLimit: 90,
    scoreHint: 'creatividad verbal, control lingüístico e inhibición semántica',
  },
]

const questions: LikertQuestion[] = [
  { id: 'il-q1', text: 'Para mí los libros son importantes.' },
  { id: 'il-q2', text: 'Puedo escuchar las palabras en mi cabeza antes de leerlas, decirlas o escribirlas.' },
  { id: 'il-q3', text: 'Me resulta más fácil entender una idea escuchando un podcast o audio que mirando un video.' },
  { id: 'il-q4', text: 'Me encantan los juegos de ingenio con palabras.' },
  { id: 'il-q5', text: 'Me gusta entretenerme o entretener a otros con rimas, trabalenguas o chistes verbales.' },
  { id: 'il-q6', text: 'Las personas a veces me piden que explique palabras que uso al hablar o escribir.' },
  { id: 'il-q7', text: 'Lengua, sociales o historia me resultaron más fáciles que matemática o ciencias.' },
  { id: 'il-q8', text: 'Cuando viajo, presto mucha atención a carteles, frases o palabras escritas.' },
  { id: 'il-q9', text: 'Mi conversación incluye referencias a cosas que leí, escuché o aprendí.' },
  { id: 'il-q10', text: 'Recientemente escribí algo de lo que me sentí orgulloso.' },
]

export default function LinguisticModule() {
  return (
      <TextAssessmentModule
          moduleId="linguistic"
          moduleName="Inteligencia Lingüística"
          intro="The Pitcher: adaptación verbal bajo presión, síntesis, persuasión, creatividad lingüística y autopercepción verbal."
          exercises={exercises}
          questions={questions}
      />
  )
}