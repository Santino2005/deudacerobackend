import {ReflectiveAssessmentModule, ReflectiveExercise} from '@/components/ReflectiveAssessmentModule'

const exercises: ReflectiveExercise[] = [
  {
    id: 'intra-1',
    title: 'Reflexión personal',
    prompt:
        '¿Cuándo fue la última vez que te tomaste tiempo a solas para pensar sobre algo importante de tu vida? ¿En qué pensabas?',
  },
  {
    id: 'intra-2',
    title: 'Autoconocimiento activo',
    prompt:
        '¿Qué hiciste en los últimos años para conocerte mejor como persona?',
  },
  {
    id: 'intra-3',
    title: 'Resiliencia',
    prompt:
        'Contame una situación difícil que atravesaste y cómo reaccionaste.',
  },
  {
    id: 'intra-4',
    title: 'Identidad personal',
    prompt:
        '¿Tenés algún hobby o interés muy personal que sentís que forma parte de quién sos?',
  },
  {
    id: 'intra-5',
    title: 'Metas',
    prompt:
        '¿Qué metas personales importantes tenés hoy?',
  },
  {
    id: 'intra-6',
    title: 'Fortalezas y debilidades',
    prompt:
        '¿Cuáles son tus mayores fortalezas y qué debilidades querés mejorar?',
  },
  {
    id: 'intra-7',
    title: 'Soledad y reflexión',
    prompt:
        'Cuando necesitás pensar con claridad, ¿preferís estar solo o acompañado?',
  },
  {
    id: 'intra-8',
    title: 'Decisiones propias',
    prompt:
        'Contame una decisión importante que tomaste aunque otros no estaban de acuerdo.',
  },
  {
    id: 'intra-9',
    title: 'Procesamiento emocional',
    prompt:
        '¿Cómo procesás lo que sentís cuando algo importante te pasa?',
  },
  {
    id: 'intra-10',
    title: 'Autonomía laboral',
    prompt:
        '¿Preferís trabajar de manera independiente o dentro de una estructura?',
  },
]

export default function IntrapersonalModule() {
  return (
      <ReflectiveAssessmentModule
          moduleId="intrapersonal"
          moduleName="Inteligencia Intrapersonal"
          intro="Autoconocimiento, introspección, resiliencia y autonomía personal."
          exercises={exercises}
      />
  )
}