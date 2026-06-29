export const USERS = {
  student: { name: 'Carlos Gómez', email: 'c.gomez@live.uleam.edu.ec', role: 'student', roleLabel: 'Estudiante', faculty: 'Ciencias Informáticas' },
  teacher: { name: 'Dra. Ana Vargas', email: 'a.vargas@live.uleam.edu.ec', role: 'teacher', roleLabel: 'Docente', faculty: 'Medicina' },
  worker: { name: 'Luis Mendoza', email: 'l.mendoza@live.uleam.edu.ec', role: 'worker', roleLabel: 'Personal administrativo', faculty: null },
  sysadmin: { name: 'Administrador Sistema', email: 'admin@live.uleam.edu.ec', role: 'sysadmin', roleLabel: 'Administrador', faculty: null },
};

export const INITIAL_SURVEYS = [
  { 
    id: 1, 
    title: 'Evaluación del servicio de biblioteca', 
    description: 'Comparte tu experiencia sobre los servicios, instalaciones y atención de la biblioteca universitaria.', 
    audience: 'estudiantes', 
    audienceType: 'blue', 
    status: 'active', 
    responses: 1240, 
    total: 1800, 
    dueDate: '30 may. 2026', 
    startDate: '01 may. 2026',
    coverImage: null,
    questions: [
      { id: 'q1', type: 'multiple', title: '¿Con qué frecuencia visitas la biblioteca?', required: true, options: ['Todos los días', '2-3 veces por semana', 'Ocasionalmente', 'Nunca'] }, 
      { id: 'q2', type: 'scale', title: '¿Cómo calificarías la atención del personal?', required: true }, 
      { id: 'q3', type: 'yesno', title: '¿Los recursos digitales disponibles satisfacen tus necesidades académicas?', required: true }
    ] 
  },
  { 
    id: 2, 
    title: 'Socialización de sílabo 2026-I', 
    description: 'Indica si tu docente presentó y explicó el sílabo al inicio del período académico 2026-I.', 
    audience: 'estudiantes', 
    audienceType: 'purple', 
    status: 'active', 
    responses: 387, 
    total: 420, 
    dueDate: '02 jun. 2026', 
    startDate: '10 may. 2026',
    coverImage: null,
    questions: [
      { id: 'q1', type: 'yesno', title: '¿Tu docente presentó el sílabo al inicio del semestre?', required: true }, 
      { id: 'q2', type: 'yesno', title: '¿Explicó los criterios de evaluación claramente?', required: true }, 
      { id: 'q3', type: 'scale', title: '¿Cómo calificarías la claridad de la explicación?', required: false }
    ] 
  },
  { 
    id: 3, 
    title: 'Evaluación de infraestructura TI', 
    description: 'Opinión sobre los recursos tecnológicos (aulas virtuales, plataformas, conectividad) disponibles para la docencia.', 
    audience: 'docentes', 
    audienceType: 'purple', 
    status: 'active', 
    responses: 920, 
    total: 1800, 
    dueDate: '28 may. 2026', 
    startDate: '01 may. 2026',
    coverImage: null,
    questions: [
      { id: 'q1', type: 'scale', title: '¿Cómo evalúas la conectividad a internet en las aulas?', required: true }, 
      { id: 'q2', type: 'yesno', title: '¿Las plataformas virtuales institucionales satisfacen tus necesidades docentes?', required: true }, 
      { id: 'q3', type: 'multiple', title: '¿Qué recurso tecnológico necesitas con más urgencia?', required: false, options: ['Proyectores modernos', 'Mejor conexión Wi-Fi', 'Licencias de software', 'Capacitación en TI'] }
    ] 
  },
  { 
    id: 4, 
    title: 'Clima organizacional — Personal ULEAM', 
    description: 'Encuesta dirigida al personal administrativo y trabajadores de la ULEAM sobre el ambiente y condiciones de trabajo.', 
    audience: 'administrativo', 
    audienceType: 'green', 
    status: 'active', 
    responses: 310, 
    total: 800, 
    dueDate: '05 jun. 2026', 
    startDate: '10 may. 2026',
    coverImage: null,
    questions: [
      { id: 'q1', type: 'scale', title: '¿Cómo evalúas el clima organizacional en tu área de trabajo?', required: true }, 
      { id: 'q2', type: 'yesno', title: '¿Recibes la capacitación necesaria para tu cargo?', required: true }, 
      { id: 'q3', type: 'multiple', title: '¿Cuál es tu mayor dificultad en el trabajo diario?', required: true, options: ['Comunicación interna', 'Recursos materiales', 'Carga de trabajo', 'Relaciones interpersonales'] }
    ] 
  },
  { 
    id: 5, 
    title: 'Satisfacción laboral docente 2026', 
    description: 'Encuesta sobre el clima organizacional, condiciones laborales y satisfacción del personal docente.', 
    audience: 'docentes', 
    audienceType: 'purple', 
    status: 'draft', 
    responses: 0, 
    total: 0, 
    dueDate: '15 jun. 2026', 
    startDate: '20 may. 2026',
    coverImage: null,
    questions: [
      { id: 'q1', type: 'scale', title: '¿Cómo calificarías el ambiente laboral en tu facultad?', required: true }, 
      { id: 'q2', type: 'yesno', title: '¿Te sientes apoyado por las autoridades de tu facultad?', required: true }, 
      { id: 'q3', type: 'multiple', title: '¿Qué aspecto mejorarías prioritariamente?', required: true, options: ['Carga horaria', 'Remuneración', 'Infraestructura', 'Apoyo administrativo'] }
    ] 
  },
  { 
    id: 6, 
    title: 'Mejoras al gimnasio universitario', 
    description: 'Comparte tu opinión sobre las instalaciones del gimnasio y qué mejoras te gustaría ver implementadas.', 
    audience: 'estudiantes, docentes, administrativo, todos', 
    audienceType: 'blue', 
    status: 'finished', 
    responses: 2847, 
    total: 2800, 
    dueDate: '01 may. 2026', 
    startDate: '01 abr. 2026',
    coverImage: null,
    questions: [
      { id: 'q1', type: 'multiple', title: '¿Con qué frecuencia usas el gimnasio?', required: true, options: ['Todos los días', '2-3 veces por semana', 'Una vez por semana', 'Nunca'] }, 
      { id: 'q2', type: 'yesno', title: '¿El horario de atención se adapta a tu horario?', required: true }, 
      { id: 'q3', type: 'scale', title: '¿Cómo calificarías el estado actual de los equipos?', required: false }
    ] 
  }
];

export const RESPONDED_BY_ROLE = {
  student: [{ id: 10, title: 'Evaluación del servicio de cafetería', description: 'Encuesta sobre calidad de alimentos y atención.', audienceLabel: 'Estudiantes', color: 'gold', icon: 'ti-coffee', duration: '3 min', dueDate: '10 may. 2026', responded: true }],
  teacher: [{ id: 11, title: 'Capacitación docente 2025-II', description: 'Evaluación de los programas de capacitación.', audienceLabel: 'Docentes', color: 'blue', icon: 'ti-certificate', duration: '5 min', dueDate: '30 abr. 2026', responded: true }],
  worker: [{ id: 12, title: 'Plan de bienestar laboral 2025', description: 'Encuesta sobre programas de bienestar para trabajadores.', audienceLabel: 'Personal administrativo', color: 'green', icon: 'ti-heart', duration: '4 min', dueDate: '20 abr. 2026', responded: true }],
};

export const FACULTADES = [
  'Ciencias Informáticas', 'Medicina', 'Derecho',
  'Ciencias Administrativas', 'Ciencias Agropecuarias',
  'Arquitectura', 'Enfermería', 'Odontología',
  'Trabajo Social', 'Comunicación',
];
