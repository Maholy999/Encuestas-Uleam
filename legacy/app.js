/**
 * ULEAM ENCUESTAS — app.js
 * Módulos: REGEX · Validator · Store · DemoData · UI · Auth · HomeApp · SurveyApp · AdminApp · CrearApp · ConfigApp · App
 */

'use strict';

/* ════════════════════════════════════════
   1. EXPRESIONES REGULARES
════════════════════════════════════════ */
const REGEX = {
  // Correo debe terminar en @live.uleam.edu.ec
  emailULEAM:     /^[a-zA-Z0-9._%+\-]+@live\.uleam\.edu\.ec$/i,
  // Cualquier email genérico (para validar formato antes de dominio)
  emailGeneric:   /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/,
  // Contraseña: inicia con mayúscula, mínimo 8 caracteres, al menos un número
  password:       /^[A-Z](?=.*\d).{7,}$/,
  // Nombre: solo letras, tildes, espacios, guiones
  nombre:         /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'\-]{2,80}$/,
  // Texto general para títulos
  textoGeneral:   /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s0-9.,;:'"()\-]{2,150}$/,
  // Solo texto para facultades
  soloLetras:     /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s.\-]{2,100}$/,
  // Fecha ISO YYYY-MM-DD
  fechaISO:       /^\d{4}-\d{2}-\d{2}$/,
};

/* ════════════════════════════════════════
   2. VALIDATOR
════════════════════════════════════════ */
const Validator = (() => {

  /** Verifica que el valor no esté vacío */
  const notEmpty = (value) =>
    typeof value === 'string' && value.trim().length > 0;

  /** Verifica que coincida con una expresión regular */
  const matchesRegex = (value, regex) =>
    typeof value === 'string' && regex.test(value.trim());

  /** Verifica tipo de dato */
  const isType = (value, type) =>
    type === 'array' ? Array.isArray(value) : typeof value === type;

  /** Verifica que una cadena sea una fecha ISO válida */
  const isValidDate = (str) => {
    if (!matchesRegex(str, REGEX.fechaISO)) return false;
    const d = new Date(str);
    return !isNaN(d.getTime());
  };

  /** Verifica que la fecha de fin sea posterior a la de inicio */
  const endAfterStart = (start, end) => {
    if (!isValidDate(start) || !isValidDate(end)) return false;
    return new Date(end) > new Date(start);
  };

  /**
   * Aplica reglas a un campo del DOM y muestra su error.
   * @param {string} fieldId
   * @param {string} errorId
   * @param {Array<{check: Function, message: string}>} rules
   * @returns {boolean}
   */
  const validateField = (fieldId, errorId, rules) => {
    const field   = document.getElementById(fieldId);
    const errorEl = document.getElementById(errorId);
    if (!field || !errorEl) return true;

    for (const rule of rules) {
      if (!rule.check(field.value)) {
        field.classList.add('error');
        errorEl.textContent = rule.message;
        return false;
      }
    }
    field.classList.remove('error');
    errorEl.textContent = '';
    return true;
  };

  return { notEmpty, matchesRegex, isType, isValidDate, endAfterStart, validateField };
})();

/* ════════════════════════════════════════
   3. STORE — estado global
════════════════════════════════════════ */
const Store = (() => {
  const state = {
    currentUser:        null,
    pendingEncuestas:   [],
    respondedEncuestas: [],
    adminEncuestas:     [],
    surveyInProgress:   null,
    surveyAnswers:      {},
    encuestaToDelete:   null,
    facultades: [
      'Ciencias Informáticas', 'Medicina', 'Derecho',
      'Ciencias Administrativas', 'Ciencias Agropecuarias',
      'Arquitectura', 'Enfermería', 'Odontología',
      'Trabajo Social', 'Comunicación',
    ],
  };

  const get = (key)        => state[key];
  const set = (key, value) => { state[key] = value; };
  return { get, set };
})();

/* ════════════════════════════════════════
   4. DEMO DATA
════════════════════════════════════════ */
const DemoData = (() => {

  /* Usuarios demo por rol */
  const USERS = {
    student: {
      name: 'Carlos Gómez', email: 'c.gomez@live.uleam.edu.ec',
      role: 'student', roleLabel: 'Estudiante', faculty: 'Ciencias Informáticas',
    },
    teacher: {
      name: 'Dra. Ana Vargas', email: 'a.vargas@live.uleam.edu.ec',
      role: 'teacher', roleLabel: 'Docente', faculty: 'Medicina',
    },
    worker: {
      name: 'Luis Mendoza', email: 'l.mendoza@live.uleam.edu.ec',
      role: 'worker', roleLabel: 'Personal administrativo', faculty: null,
    },
    sysadmin: {
      name: 'Administrador Sistema', email: 'admin@live.uleam.edu.ec',
      role: 'sysadmin', roleLabel: 'Administrador', faculty: null,
    },
  };

  /* Encuestas separadas por audiencia — fechas actualizadas a 2026 */
  const ALL_SURVEYS = [
    // — ESTUDIANTES —
    {
      id: 1,
      audience: ['estudiantes'],
      title: 'Evaluación del servicio de biblioteca',
      description: 'Comparte tu experiencia sobre los servicios, instalaciones y atención de la biblioteca universitaria.',
      audienceLabel: 'Estudiantes', color: 'blue', icon: 'ti-books',
      duration: '5 min', dueDate: '30 may. 2026',
      questions: [
        { id: 'q1', type: 'multiple', text: '¿Con qué frecuencia visitas la biblioteca?', required: true,
          options: ['Todos los días', '2-3 veces por semana', 'Ocasionalmente', 'Nunca'] },
        { id: 'q2', type: 'scale', text: '¿Cómo calificarías la atención del personal?', required: true },
        { id: 'q3', type: 'yesno', text: '¿Los recursos digitales disponibles satisfacen tus necesidades académicas?', required: true },
      ],
    },
    {
      id: 2,
      audience: ['estudiantes'],
      title: 'Socialización de sílabo 2026-I',
      description: 'Indica si tu docente presentó y explicó el sílabo al inicio del período académico 2026-I.',
      audienceLabel: 'Estudiantes · Ciencias Informáticas', color: 'purple', icon: 'ti-book-2',
      duration: '3 min', dueDate: '02 jun. 2026',
      questions: [
        { id: 'q1', type: 'yesno', text: '¿Tu docente presentó el sílabo al inicio del semestre?', required: true },
        { id: 'q2', type: 'yesno', text: '¿Explicó los criterios de evaluación claramente?', required: true },
        { id: 'q3', type: 'scale', text: '¿Cómo calificarías la claridad de la explicación?', required: false },
      ],
    },
    // — DOCENTES —
    {
      id: 3,
      audience: ['docentes'],
      title: 'Evaluación de infraestructura tecnológica',
      description: 'Opinión sobre los recursos tecnológicos (aulas virtuales, plataformas, conectividad) disponibles para la docencia.',
      audienceLabel: 'Docentes', color: 'green', icon: 'ti-device-laptop',
      duration: '6 min', dueDate: '28 may. 2026',
      questions: [
        { id: 'q1', type: 'scale', text: '¿Cómo evalúas la conectividad a internet en las aulas?', required: true },
        { id: 'q2', type: 'yesno', text: '¿Las plataformas virtuales institucionales satisfacen tus necesidades docentes?', required: true },
        { id: 'q3', type: 'multiple', text: '¿Qué recurso tecnológico necesitas con más urgencia?', required: false,
          options: ['Proyectores modernos', 'Mejor conexión Wi-Fi', 'Licencias de software', 'Capacitación en TI'] },
      ],
    },
    {
      id: 4,
      audience: ['docentes'],
      title: 'Satisfacción laboral docente 2026',
      description: 'Encuesta sobre el clima organizacional, condiciones laborales y satisfacción del personal docente.',
      audienceLabel: 'Docentes', color: 'gold', icon: 'ti-heart',
      duration: '8 min', dueDate: '15 jun. 2026',
      questions: [
        { id: 'q1', type: 'scale', text: '¿Cómo calificarías el ambiente laboral en tu facultad?', required: true },
        { id: 'q2', type: 'yesno', text: '¿Te sientes apoyado por las autoridades de tu facultad?', required: true },
        { id: 'q3', type: 'multiple', text: '¿Qué aspecto mejorarías prioritariamente?', required: true,
          options: ['Carga horaria', 'Remuneración', 'Infraestructura', 'Apoyo administrativo'] },
      ],
    },
    // — PERSONAL ADMINISTRATIVO —
    {
      id: 5,
      audience: ['administrativo'],
      title: 'Clima organizacional — Personal ULEAM 2026',
      description: 'Encuesta dirigida al personal administrativo y trabajadores de la ULEAM sobre el ambiente y condiciones de trabajo.',
      audienceLabel: 'Personal administrativo', color: 'green', icon: 'ti-briefcase',
      duration: '7 min', dueDate: '05 jun. 2026',
      questions: [
        { id: 'q1', type: 'scale', text: '¿Cómo evalúas el clima organizacional en tu área de trabajo?', required: true },
        { id: 'q2', type: 'yesno', text: '¿Recibes la capacitación necesaria para tu cargo?', required: true },
        { id: 'q3', type: 'multiple', text: '¿Cuál es tu mayor dificultad en el trabajo diario?', required: true,
          options: ['Comunicación interna', 'Recursos materiales', 'Carga de trabajo', 'Relaciones interpersonales'] },
      ],
    },
    // — TODOS —
    {
      id: 6,
      audience: ['estudiantes', 'docentes', 'administrativo'],
      title: 'Mejoras al gimnasio universitario',
      description: 'Comparte tu opinión sobre las instalaciones del gimnasio y qué mejoras te gustaría ver implementadas.',
      audienceLabel: 'Toda la comunidad ULEAM', color: 'blue', icon: 'ti-barbell',
      duration: '4 min', dueDate: '20 may. 2026',
      questions: [
        { id: 'q1', type: 'multiple', text: '¿Con qué frecuencia usas el gimnasio?', required: true,
          options: ['Todos los días', '2-3 veces por semana', 'Una vez por semana', 'Nunca'] },
        { id: 'q2', type: 'yesno', text: '¿El horario de atención se adapta a tu horario?', required: true },
        { id: 'q3', type: 'scale', text: '¿Cómo calificarías el estado actual de los equipos?', required: false },
      ],
    },
  ];

  /* Encuestas ya respondidas (historial demo) */
  const RESPONDED_BY_ROLE = {
    student: [
      { id: 10, title: 'Evaluación del servicio de cafetería', description: 'Encuesta sobre calidad de alimentos y atención.',
        audienceLabel: 'Estudiantes', color: 'gold', icon: 'ti-coffee', duration: '3 min', dueDate: '10 may. 2026', responded: true },
    ],
    teacher: [
      { id: 11, title: 'Capacitación docente 2025-II', description: 'Evaluación de los programas de capacitación.',
        audienceLabel: 'Docentes', color: 'blue', icon: 'ti-certificate', duration: '5 min', dueDate: '30 abr. 2026', responded: true },
    ],
    worker: [
      { id: 12, title: 'Plan de bienestar laboral 2025', description: 'Encuesta sobre programas de bienestar para trabajadores.',
        audienceLabel: 'Personal administrativo', color: 'green', icon: 'ti-heart', duration: '4 min', dueDate: '20 abr. 2026', responded: true },
    ],
  };

  /* Encuestas para el panel admin — fechas 2026 */
  const ADMIN_SURVEYS = [
    { id: 1, title: 'Evaluación del servicio de biblioteca', audience: 'Estudiantes', audienceType: 'blue', status: 'active', responses: 1240, total: 1800, dueDate: '30 may. 2026' },
    { id: 2, title: 'Socialización de sílabo 2026-I', audience: 'Est. Ciencias Informáticas', audienceType: 'blue', status: 'active', responses: 387, total: 420, dueDate: '02 jun. 2026' },
    { id: 3, title: 'Evaluación de infraestructura TI', audience: 'Docentes', audienceType: 'purple', status: 'active', responses: 920, total: 1800, dueDate: '28 may. 2026' },
    { id: 4, title: 'Clima organizacional — Personal ULEAM', audience: 'Personal administrativo', audienceType: 'green', status: 'active', responses: 310, total: 800, dueDate: '05 jun. 2026' },
    { id: 5, title: 'Satisfacción laboral docente 2026', audience: 'Docentes', audienceType: 'purple', status: 'draft', responses: 0, total: 0, dueDate: '15 jun. 2026' },
    { id: 6, title: 'Mejoras al gimnasio universitario', audience: 'Toda la comunidad', audienceType: 'blue', status: 'finished', responses: 2847, total: 2800, dueDate: '01 may. 2026' },
    { id: 7, title: 'Evaluación de cafetería 2025-II', audience: 'Estudiantes', audienceType: 'blue', status: 'finished', responses: 3120, total: 3000, dueDate: '15 abr. 2026' },
  ];

  /**
   * Retorna encuestas pendientes según el rol del usuario
   * @param {'student'|'teacher'|'worker'|'sysadmin'} role
   * @returns {Array}
   */
  const getPendingByRole = (role) => {
    const roleMap = {
      student:  ['estudiantes'],
      teacher:  ['docentes'],
      worker:   ['administrativo'],
      sysadmin: [],
    };
    const allowed = roleMap[role] || [];
    return ALL_SURVEYS.filter(s =>
      s.audience.some(a => allowed.includes(a))
    );
  };

  /**
   * Retorna historial según el rol
   * @param {string} role
   * @returns {Array}
   */
  const getRespondedByRole = (role) =>
    RESPONDED_BY_ROLE[role] || [];

  return { USERS, ADMIN_SURVEYS, getPendingByRole, getRespondedByRole };
})();

/* ════════════════════════════════════════
   5. UI — utilidades de interfaz
════════════════════════════════════════ */
const UI = (() => {

  let toastTimer = null;

  /**
   * Muestra un toast
   * @param {string} message
   * @param {'success'|'error'|'default'} type
   * @param {number} duration
   */
  const showToast = (message, type = 'default', duration = 3200) => {
    const toast = document.getElementById('toast');
    if (!toast) return;
    clearTimeout(toastTimer);
    toast.textContent = message;
    toast.className   = `toast ${type}`;
    toast.classList.remove('hidden');
    toastTimer = setTimeout(() => toast.classList.add('hidden'), duration);
  };

  /**
   * Cambia la pantalla activa
   * @param {string} id
   */
  const showScreen = (id) => {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const target = document.getElementById(id);
    if (target) { target.classList.add('active'); window.scrollTo(0, 0); }
  };

  /**
   * Muestra u oculta un elemento por id
   * @param {string} id
   * @param {boolean} visible
   */
  const setVisible = (id, visible) => {
    const el = document.getElementById(id);
    if (!el) return;
    visible ? el.classList.remove('hidden') : el.classList.add('hidden');
  };

  /**
   * Genera HTML de badge de estado
   * @param {'active'|'draft'|'closed'|'finished'} status
   */
  const statusBadge = (status) => {
    const MAP = {
      active:   { label: 'Activa',     dot: '●' },
      draft:    { label: 'Borrador',   dot: '○' },
      closed:   { label: 'Cerrada',    dot: '✕' },
      finished: { label: 'Finalizada', dot: '✔' },
    };
    const s = MAP[status] || MAP.draft;
    return `<span class="status-badge ${status}">${s.dot} ${s.label}</span>`;
  };

  /**
   * Genera HTML de barra de progreso
   * @param {number} pct 0-100
   * @param {string} cls clase adicional del fill
   */
  const progressBar = (pct, cls = '') =>
    `<div class="bar-track"><div class="bar-fill ${cls}" style="width:${Math.min(pct, 100)}%"></div></div>`;

  return { showToast, showScreen, setVisible, statusBadge, progressBar };
})();

/* ════════════════════════════════════════
   6. AUTH
════════════════════════════════════════ */
const Auth = (() => {

  /* Reglas de validación del login */
  const RULES_EMAIL = [
    { check: (v) => Validator.notEmpty(v),
      message: 'El correo es obligatorio.' },
    { check: (v) => Validator.matchesRegex(v, REGEX.emailGeneric),
      message: 'Formato de correo inválido.' },
    { check: (v) => Validator.matchesRegex(v, REGEX.emailULEAM),
      message: 'El correo debe terminar en @live.uleam.edu.ec' },
  ];

  const RULES_PASSWORD = [
    { check: (v) => Validator.notEmpty(v),
      message: 'La contraseña es obligatoria.' },
    { check: (v) => v.trim().length >= 8,
      message: 'La contraseña debe tener al menos 8 caracteres.' },
    { check: (v) => /^[A-Z]/.test(v.trim()),
      message: 'La contraseña debe iniciar con una letra mayúscula.' },
    { check: (v) => Validator.matchesRegex(v, REGEX.password),
      message: 'Debe incluir al menos un número además de la mayúscula inicial.' },
  ];

  const validateForm = () => {
    const eOk = Validator.validateField('login-email',    'error-email',    RULES_EMAIL);
    const pOk = Validator.validateField('login-password', 'error-password', RULES_PASSWORD);
    return eOk && pOk;
  };

  /**
   * Determina el rol a partir del correo (demo — en prod viene de la BD)
   * @param {string} email
   * @returns {string}
   */
  const resolveRole = (email) => {
    const lower = email.toLowerCase();
    if (lower.startsWith('admin'))    return 'sysadmin';
    if (lower.includes('docente') || lower.startsWith('dr') || lower.startsWith('msc'))
      return 'teacher';
    if (lower.includes('worker') || lower.includes('admin.') || lower.includes('secretaria'))
      return 'worker';
    return 'student';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const email = document.getElementById('login-email').value.trim();
    const role  = resolveRole(email);
    const rawName = email.split('@')[0].replace(/[._]/g, ' ');
    const name  = rawName.replace(/\b\w/g, c => c.toUpperCase());

    const roleLabels = {
      student:  'Estudiante',
      teacher:  'Docente',
      worker:   'Personal administrativo',
      sysadmin: 'Administrador',
    };

    const user = { name, email, role, roleLabel: roleLabels[role] };
    Store.set('currentUser', user);
    loginSuccess(user);
  };

  const demoLogin = (role) => {
    const user = DemoData.USERS[role];
    if (!user) return;
    Store.set('currentUser', user);
    loginSuccess(user);
  };

  const loginSuccess = (user) => {
    if (user.role === 'sysadmin') {
      AdminApp.init();
      UI.showScreen('screen-admin');
    } else {
      HomeApp.init(user);
      UI.showScreen('screen-home');
    }
  };

  const logout = () => {
    Store.set('currentUser', null);
    ['login-email', 'login-password'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
    ['error-email', 'error-password'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = '';
    });
    UI.showScreen('screen-login');
    UI.showToast('Sesión cerrada correctamente.');
  };

  const initPasswordToggle = () => {
    const toggle = document.getElementById('pwd-toggle');
    const input  = document.getElementById('login-password');
    if (!toggle || !input) return;
    toggle.addEventListener('click', () => {
      const show = input.type === 'password';
      input.type = show ? 'text' : 'password';
      toggle.querySelector('i').className = show ? 'ti ti-eye-off' : 'ti ti-eye';
    });
  };

  const init = () => {
    document.getElementById('login-form')?.addEventListener('submit', handleSubmit);
    document.querySelectorAll('.demo-btn').forEach(btn =>
      btn.addEventListener('click', () => demoLogin(btn.dataset.role))
    );
    document.getElementById('btn-logout-home')?.addEventListener('click',  logout);
    document.getElementById('btn-logout-admin')?.addEventListener('click', logout);
    initPasswordToggle();
  };

  return { init, logout };
})();

/* ════════════════════════════════════════
   7. HOME APP
════════════════════════════════════════ */
const HomeApp = (() => {

  /**
   * Genera el HTML de una tarjeta de encuesta
   * @param {object} enc
   * @returns {string}
   */
  const cardHTML = (enc) => {
    const done = enc.responded === true;
    return `
      <article class="enc-card ${done ? 'responded' : ''}" data-id="${enc.id}" aria-label="${enc.title}">
        <div class="enc-card-banner ${enc.color}">
          <i class="ti ${enc.icon}" aria-hidden="true"></i>
          <div class="enc-card-tag">${enc.audienceLabel}</div>
        </div>
        <div class="enc-card-body">
          <h3 class="enc-card-title">${enc.title}</h3>
          <p class="enc-card-desc">${enc.description}</p>
          <div class="enc-card-meta">
            <span class="meta-item"><i class="ti ti-clock" aria-hidden="true"></i> ${enc.duration}</span>
            <span class="meta-item"><i class="ti ti-calendar-due" aria-hidden="true"></i> Vence ${enc.dueDate}</span>
            <button class="enc-card-btn" ${done ? 'disabled aria-disabled="true"' : ''}>
              ${done
                ? '<i class="ti ti-check" aria-hidden="true"></i> Respondida'
                : 'Responder <i class="ti ti-arrow-right" aria-hidden="true"></i>'}
            </button>
          </div>
        </div>
      </article>`;
  };

  /** Actualiza los chips de estadísticas */
  const updateStats = () => {
    const pending   = Store.get('pendingEncuestas').length;
    const responded = Store.get('respondedEncuestas').length;
    const total     = pending + responded;
    const pct       = total > 0 ? Math.round((responded / total) * 100) : 0;

    document.getElementById('stat-pending').textContent = pending;
    document.getElementById('stat-done').textContent    = responded;
    document.getElementById('stat-pct').textContent     = `${pct}%`;
  };

  /** Renderiza la lista de encuestas pendientes */
  const renderPending = () => {
    const list = Store.get('pendingEncuestas');
    const container = document.getElementById('encuestas-list');
    if (!container) return;

    if (list.length === 0) {
      container.innerHTML = `
        <div style="text-align:center;padding:2.5rem 1rem;color:var(--text-3);">
          <i class="ti ti-clipboard-check" style="font-size:44px;display:block;margin-bottom:12px;color:var(--success);opacity:.6;"></i>
          <strong style="display:block;margin-bottom:4px;color:var(--text-2);">¡Todo al día!</strong>
          No tienes encuestas pendientes por el momento.
        </div>`;
      return;
    }

    container.innerHTML = list.map(cardHTML).join('');

    container.querySelectorAll('.enc-card:not(.responded) .enc-card-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id  = parseInt(btn.closest('.enc-card').dataset.id, 10);
        const enc = Store.get('pendingEncuestas').find(s => s.id === id);
        if (enc) SurveyApp.open(enc);
      });
    });
  };

  /** Renderiza el historial */
  const renderHistorial = () => {
    const list = Store.get('respondedEncuestas');
    const container = document.getElementById('historial-list');
    if (!container) return;

    if (list.length === 0) {
      container.innerHTML = `<div style="text-align:center;padding:2rem;color:var(--text-3);">Aún no has respondido ninguna encuesta.</div>`;
      return;
    }
    container.innerHTML = list.map(cardHTML).join('');
  };

  /** Inicializa las pestañas del bottom nav */
  const initTabs = () => {
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', () => {
        document.querySelectorAll('.nav-item').forEach(i => {
          i.classList.remove('active');
          i.removeAttribute('aria-current');
        });
        item.classList.add('active');
        item.setAttribute('aria-current', 'page');

        const tab = item.dataset.tab;
        UI.setVisible('panel-pendientes', tab === 'inicio');
        UI.setVisible('panel-historial',  tab === 'historial');

        if (tab === 'historial') renderHistorial();
      });
    });
  };

  /**
   * Inicializa la pantalla Home para el usuario dado
   * @param {{ name:string, role:string, roleLabel:string }} user
   */
  const init = (user) => {
    // Cargar encuestas según rol
    Store.set('pendingEncuestas',   DemoData.getPendingByRole(user.role));
    Store.set('respondedEncuestas', DemoData.getRespondedByRole(user.role));

    // Topbar
    document.getElementById('topbar-greeting').textContent = `Bienvenido, ${user.name.split(' ')[0]}`;

    // Hero badge con rol
    const badge = document.getElementById('hero-role-badge');
    if (badge) {
      const iconMap = { student: 'ti-school', teacher: 'ti-chalkboard', worker: 'ti-briefcase', sysadmin: 'ti-settings' };
      badge.innerHTML = `<i class="ti ${iconMap[user.role] || 'ti-user'}" aria-hidden="true"></i> ${user.roleLabel}`;
    }

    // Panel inicial visible
    UI.setVisible('panel-pendientes', true);
    UI.setVisible('panel-historial',  false);

    updateStats();
    renderPending();
    initTabs();
  };

  return { init, updateStats, renderPending };
})();

/* ════════════════════════════════════════
   8. SURVEY APP
════════════════════════════════════════ */
const SurveyApp = (() => {
  let answers = {};

  /** Genera HTML de una pregunta */
  const questionHTML = (q, idx) => {
    const req = q.required ? '<span style="color:var(--danger)" aria-hidden="true"> *</span>' : '';
    let body = '';

    switch (q.type) {
      case 'multiple':
        body = `<div class="opts-list" role="radiogroup" aria-labelledby="ql-${q.id}">
          ${q.options.map(opt => `
            <div class="opt-item" role="radio" aria-checked="false" tabindex="0"
                 data-qid="${q.id}" data-value="${opt}">
              <div class="opt-radio" aria-hidden="true"></div>
              <span>${opt}</span>
            </div>`).join('')}
        </div>`;
        break;

      case 'yesno':
        body = `<div class="yn-row" role="radiogroup" aria-labelledby="ql-${q.id}">
          <div class="yn-btn yes" role="radio" aria-checked="false" tabindex="0" data-qid="${q.id}" data-value="Sí">Sí</div>
          <div class="yn-btn no"  role="radio" aria-checked="false" tabindex="0" data-qid="${q.id}" data-value="No">No</div>
        </div>`;
        break;

      case 'scale':
        body = `
          <div class="scale-row" role="radiogroup" aria-labelledby="ql-${q.id}">
            ${[1,2,3,4,5].map(n =>
              `<div class="scale-btn" role="radio" aria-checked="false" tabindex="0" data-qid="${q.id}" data-value="${n}">${n}</div>`
            ).join('')}
          </div>
          <div class="scale-labels" aria-hidden="true"><span>Muy malo</span><span>Excelente</span></div>`;
        break;
    }

    return `
      <div class="q-card" id="qblock-${q.id}" data-qid="${q.id}">
        <p class="q-card-title" id="ql-${q.id}">
          <span class="q-num" aria-hidden="true">${idx}</span>
          <span>${q.text}${req}</span>
        </p>
        ${body}
        <p class="q-error" id="qerr-${q.id}" role="alert"></p>
      </div>`;
  };

  /** Selecciona una opción y guarda la respuesta */
  const selectOpt = (el, qid, value, selector) => {
    const block = document.getElementById(`qblock-${qid}`);
    if (!block) return;
    block.querySelectorAll(selector).forEach(o => {
      o.classList.remove('selected');
      o.setAttribute('aria-checked', 'false');
    });
    el.classList.add('selected');
    el.setAttribute('aria-checked', 'true');
    answers[qid] = value;
    clearQError(qid);
    updateProgress();
  };

  /** Adjunta listeners a todos los elementos de respuesta */
  const attachAnswerListeners = () => {
    document.querySelectorAll('.opt-item').forEach(el => {
      const h = () => selectOpt(el, el.dataset.qid, el.dataset.value, '.opt-item');
      el.addEventListener('click', h);
      el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); h(); } });
    });
    document.querySelectorAll('.yn-btn').forEach(el => {
      const h = () => selectOpt(el, el.dataset.qid, el.dataset.value, '.yn-btn');
      el.addEventListener('click', h);
      el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); h(); } });
    });
    document.querySelectorAll('.scale-btn').forEach(el => {
      const h = () => selectOpt(el, el.dataset.qid, el.dataset.value, '.scale-btn');
      el.addEventListener('click', h);
      el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); h(); } });
    });
  };

  const showQError = (qid, msg) => {
    const el = document.getElementById(`qerr-${qid}`);
    const bl = document.getElementById(`qblock-${qid}`);
    if (el) { el.style.display = 'block'; el.textContent = msg; }
    if (bl) bl.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const clearQError = (qid) => {
    const el = document.getElementById(`qerr-${qid}`);
    if (el) { el.style.display = 'none'; el.textContent = ''; }
  };

  const updateProgress = () => {
    const enc = Store.get('surveyInProgress');
    if (!enc) return;
    const answered = Object.keys(answers).length;
    const total    = enc.questions.length;
    const pct      = Math.round((answered / total) * 100);
    const fill = document.getElementById('survey-progress-fill');
    const bar  = document.getElementById('survey-progress-bar');
    const txt  = document.getElementById('survey-progress-text');
    if (fill) fill.style.width = `${pct}%`;
    if (bar)  bar.setAttribute('aria-valuenow', pct);
    if (txt)  txt.textContent  = `${answered} de ${total} respondidas`;
  };

  /** Valida que las preguntas obligatorias estén respondidas */
  const validateAnswers = () => {
    const enc = Store.get('surveyInProgress');
    if (!enc) return false;
    let valid = true;
    enc.questions.forEach(q => {
      if (q.required && answers[q.id] === undefined) {
        showQError(q.id, 'Esta pregunta es obligatoria.');
        valid = false;
      }
    });
    return valid;
  };

  /**
   * Abre una encuesta
   * @param {object} enc
   */
  const open = (enc) => {
    Store.set('surveyInProgress', enc);
    answers = {};

    const user = Store.get('currentUser');

    document.getElementById('survey-topbar-title').textContent = enc.title;
    document.getElementById('survey-title').textContent        = enc.title;
    document.getElementById('survey-progress-fill').style.width = '0%';
    document.getElementById('survey-progress-text').textContent = `0 de ${enc.questions.length} respondidas`;

    // Badges
    document.getElementById('survey-badges').innerHTML = `
      <span class="survey-badge blue"><i class="ti ti-users" aria-hidden="true"></i> ${enc.audienceLabel}</span>
      <span class="survey-badge green"><i class="ti ti-clock" aria-hidden="true"></i> ~${enc.duration}</span>
      <span class="survey-badge green"><i class="ti ti-shield-check" aria-hidden="true"></i> Anónima</span>`;

    // Preguntas
    const body = document.getElementById('survey-body');
    body.innerHTML = enc.questions.map((q, i) => questionHTML(q, i + 1)).join('');

    // Sección de vinculación de correo
    body.innerHTML += `
      <div class="email-section">
        <p><i class="ti ti-lock" aria-hidden="true"></i> Vinculación de respuesta</p>
        <p style="font-size:12px;color:var(--text-3);margin-bottom:8px;">
          Tu correo identifica la respuesta internamente, pero no será visible para otros.
        </p>
        <input class="field-input" type="email" value="${user?.email || ''}" readonly
          aria-label="Correo institucional vinculado" />
      </div>`;

    attachAnswerListeners();

    // Botones nav
    document.getElementById('btn-next-q').onclick = () => {
      if (validateAnswers()) submitSurvey(enc);
    };
    document.getElementById('btn-prev-q').onclick  = () => UI.showScreen('screen-home');
    document.getElementById('btn-back-survey').onclick = () => UI.showScreen('screen-home');

    updateProgress();
    UI.showScreen('screen-survey');
  };

  /** Guarda la respuesta y actualiza el estado */
  const submitSurvey = (enc) => {
    const pending   = Store.get('pendingEncuestas').filter(e => e.id !== enc.id);
    const responded = [...Store.get('respondedEncuestas'), { ...enc, responded: true }];
    Store.set('pendingEncuestas',   pending);
    Store.set('respondedEncuestas', responded);

    // Actualizar stats y lista en home
    HomeApp.updateStats();
    HomeApp.renderPending();

    // Botón de volver
    document.getElementById('btn-back-home').onclick = () => UI.showScreen('screen-home');
    UI.showScreen('screen-confirm');
  };

  return { open };
})();

/* ════════════════════════════════════════
   9. ADMIN APP
════════════════════════════════════════ */
const AdminApp = (() => {

  /* ── 9.1 Estadísticas: barras por facultad ── */
  const renderFacBars = () => {
    const container = document.getElementById('fac-bars');
    if (!container) return;

    const data = [
      { fac: 'Ciencias Informáticas', encuestas: 3, pct: 91, responses: 1240 },
      { fac: 'Medicina',              encuestas: 2, pct: 78, responses: 980  },
      { fac: 'Derecho',               encuestas: 2, pct: 64, responses: 720  },
      { fac: 'Cs. Administrativas',   encuestas: 2, pct: 55, responses: 610  },
      { fac: 'Arquitectura',          encuestas: 1, pct: 47, responses: 380  },
      { fac: 'Enfermería',            encuestas: 1, pct: 38, responses: 290  },
    ];

    container.innerHTML = data.map(d => `
      <div class="bar-row">
        <div class="bar-meta">
          <span>${d.fac}</span>
          <span class="bar-val">${d.pct}% · ${d.responses.toLocaleString()} resp.</span>
        </div>
        <div class="bar-sub">${d.encuestas} encuesta${d.encuestas !== 1 ? 's' : ''} activa${d.encuestas !== 1 ? 's' : ''}</div>
        ${UI.progressBar(d.pct)}
      </div>`).join('');
  };

  /* ── 9.2 Estadísticas: barras por tipo ── */
  const renderTipoBars = () => {
    const container = document.getElementById('tipo-bars');
    if (!container) return;

    const data = [
      { label: 'Estudiantes (~15,000)',         responded: 8240,  total: 15000, cls: '' },
      { label: 'Docentes (~1,800)',              responded: 1240,  total: 1800,  cls: 'purple' },
      { label: 'Personal administrativo (~800)', responded: 367,   total: 800,   cls: 'gold' },
    ];

    container.innerHTML = data.map(d => {
      const pct = Math.round((d.responded / d.total) * 100);
      return `
        <div class="bar-row">
          <div class="bar-meta">
            <span>${d.label}</span>
            <span class="bar-val">${pct}%</span>
          </div>
          <div class="bar-sub">${d.responded.toLocaleString()} de ${d.total.toLocaleString()} respondieron</div>
          ${UI.progressBar(pct, d.cls)}
        </div>`;
    }).join('');
  };

  /* ── 9.3 Tabla encuestas recientes (dashboard) ── */
  const renderDashTable = (surveys) => {
    const tbody = document.getElementById('dash-enc-tbody');
    if (!tbody) return;
    const recent = surveys.slice(0, 5);
    tbody.innerHTML = recent.map(s => buildTableRow(s)).join('');
    attachTableEvents('dash-enc-tbody');
  };

  /* ── 9.4 Tabla completa de encuestas ── */
  const renderEncTable = (surveys) => {
    const tbody = document.getElementById('enc-tbody');
    if (!tbody) return;
    if (surveys.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:24px;color:var(--text-3);">No se encontraron encuestas.</td></tr>`;
      return;
    }
    tbody.innerHTML = surveys.map(s => buildTableRow(s)).join('');
    attachTableEvents('enc-tbody');
  };

  /** Genera el HTML de una fila de la tabla */
  const buildTableRow = (s) => {
    const canDownload = s.status === 'finished';
    return `
      <tr data-id="${s.id}">
        <td style="font-weight:500;max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${s.title}</td>
        <td><span class="pill ${s.audienceType}">${s.audience}</span></td>
        <td>${UI.statusBadge(s.status)}</td>
        <td style="white-space:nowrap;">${s.status !== 'draft' ? `${s.responses.toLocaleString()} / ${s.total.toLocaleString()}` : '—'}</td>
        <td style="color:var(--text-3);font-size:12px;white-space:nowrap;">${s.dueDate}</td>
        <td>
          <div class="action-btns">
            <button class="icon-btn btn-edit" data-id="${s.id}" title="Editar encuesta" aria-label="Editar ${s.title}">
              <i class="ti ti-edit" aria-hidden="true"></i>
            </button>
            <button class="icon-btn btn-dup" data-id="${s.id}" title="Duplicar encuesta" aria-label="Duplicar ${s.title}">
              <i class="ti ti-copy" aria-hidden="true"></i>
            </button>
            ${canDownload ? `
            <button class="icon-btn btn-download" data-id="${s.id}" title="Descargar resultados" aria-label="Descargar resultados de ${s.title}">
              <i class="ti ti-download" aria-hidden="true"></i>
            </button>` : ''}
            <button class="icon-btn danger btn-delete" data-id="${s.id}" title="Eliminar encuesta" aria-label="Eliminar ${s.title}">
              <i class="ti ti-trash" aria-hidden="true"></i>
            </button>
          </div>
        </td>
      </tr>`;
  };

  /** Adjunta eventos a los botones de acción de la tabla */
  const attachTableEvents = (tbodyId) => {
    const tbody = document.getElementById(tbodyId);
    if (!tbody) return;

    // Editar
    tbody.querySelectorAll('.btn-edit').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.dataset.id, 10);
        const s  = Store.get('adminEncuestas').find(e => e.id === id);
        if (s) CrearApp.openEdit(s);
      });
    });

    // Duplicar
    tbody.querySelectorAll('.btn-dup').forEach(btn => {
      btn.addEventListener('click', () => {
        const id  = parseInt(btn.dataset.id, 10);
        const src = Store.get('adminEncuestas').find(e => e.id === id);
        if (!src) return;
        const copy = {
          ...src,
          id:     Date.now(),
          title:  `Copia de ${src.title}`,
          status: 'draft',
          responses: 0,
        };
        Store.set('adminEncuestas', [...Store.get('adminEncuestas'), copy]);
        renderEncTable(Store.get('adminEncuestas'));
        renderDashTable(Store.get('adminEncuestas'));
        UI.showToast(`Encuesta duplicada: "${copy.title}"`, 'success');
      });
    });

    // Descargar resultados
    tbody.querySelectorAll('.btn-download').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.dataset.id, 10);
        const s  = Store.get('adminEncuestas').find(e => e.id === id);
        UI.showToast(`Descargando resultados de "${s?.title}"…`, 'success');
      });
    });

    // Eliminar
    tbody.querySelectorAll('.btn-delete').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.dataset.id, 10);
        const s  = Store.get('adminEncuestas').find(e => e.id === id);
        Store.set('encuestaToDelete', id);
        const body = document.getElementById('modal-delete-body');
        if (body) body.textContent = `¿Está seguro de que desea eliminar "${s?.title}"? Esta acción no se puede deshacer.`;
        document.getElementById('modal-delete')?.classList.remove('hidden');
      });
    });
  };

  /* ── 9.5 Filtros de la tabla de encuestas ── */
  const initFilters = () => {
    const search = document.getElementById('enc-search');
    const status = document.getElementById('enc-filter-status');

    const apply = () => {
      const q  = search?.value.toLowerCase().trim() || '';
      const st = status?.value || 'all';
      const filtered = Store.get('adminEncuestas').filter(s => {
        const matchText   = s.title.toLowerCase().includes(q);
        const matchStatus = st === 'all' || s.status === st;
        return matchText && matchStatus;
      });
      renderEncTable(filtered);
    };

    search?.addEventListener('input',  apply);
    status?.addEventListener('change', apply);
  };

  /* ── 9.6 Cambio de tab ── */
  const switchTab = (tab) => {
    // Links del sidebar
    document.querySelectorAll('.sb-link').forEach(l => l.classList.remove('active'));
    document.querySelector(`.sb-link[data-tab="${tab}"]`)?.classList.add('active');

    // Paneles
    document.querySelectorAll('.admin-tab').forEach(t => {
      t.classList.add('hidden');
      t.classList.remove('active');
    });
    const panel = document.getElementById(`tab-${tab}`);
    if (panel) { panel.classList.remove('hidden'); panel.classList.add('active'); }

    // Título
    const titles = { dashboard: 'Dashboard', encuestas: 'Encuestas', crear: 'Nueva encuesta', configuracion: 'Configuración' };
    const titleEl = document.getElementById('admin-page-title');
    if (titleEl) titleEl.textContent = titles[tab] || tab;

    // Botón nueva encuesta en topbar (solo en dashboard)
    const actionsEl = document.getElementById('admin-topbar-actions');
    if (actionsEl) {
      actionsEl.innerHTML = tab === 'dashboard'
        ? `<button class="btn btn-primary btn-sm" id="btn-nueva-dash"><i class="ti ti-plus"></i> Nueva encuesta</button>`
        : '';
      if (tab === 'dashboard') {
        document.getElementById('btn-nueva-dash')?.addEventListener('click', () => CrearApp.openNew());
      }
    }

    // Render según tab
    if (tab === 'encuestas')     renderEncTable(Store.get('adminEncuestas'));
    if (tab === 'configuracion') ConfigApp.init();
    if (tab === 'dashboard') {
      renderFacBars();
      renderTipoBars();
      renderDashTable(Store.get('adminEncuestas'));
    }
  };

  /* ── 9.7 Modal de eliminar ── */
  const initDeleteModal = () => {
    document.getElementById('modal-cancel')?.addEventListener('click', () => {
      document.getElementById('modal-delete')?.classList.add('hidden');
      Store.set('encuestaToDelete', null);
    });

    document.getElementById('modal-confirm')?.addEventListener('click', () => {
      const id = Store.get('encuestaToDelete');
      if (id !== null) {
        const updated = Store.get('adminEncuestas').filter(s => s.id !== id);
        Store.set('adminEncuestas', updated);
        renderEncTable(Store.get('adminEncuestas'));
        renderDashTable(Store.get('adminEncuestas'));
        UI.showToast('Encuesta eliminada correctamente.', 'success');
      }
      document.getElementById('modal-delete')?.classList.add('hidden');
      Store.set('encuestaToDelete', null);
    });

    // Cerrar con Escape o click fuera
    document.getElementById('modal-delete')?.addEventListener('click', (e) => {
      if (e.target === e.currentTarget) {
        e.currentTarget.classList.add('hidden');
        Store.set('encuestaToDelete', null);
      }
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.getElementById('modal-delete')?.classList.add('hidden');
        Store.set('encuestaToDelete', null);
      }
    });
  };

  /* ── 9.8 "Ver todas" desde dashboard ── */
  const initVerTodas = () => {
    document.getElementById('link-ver-todas')?.addEventListener('click', (e) => {
      e.preventDefault();
      switchTab('encuestas');
    });
  };

  /* ── 9.9 Init ── */
  const init = () => {
    Store.set('adminEncuestas', [...DemoData.ADMIN_SURVEYS]);
    renderFacBars();
    renderTipoBars();
    renderDashTable(Store.get('adminEncuestas'));
    initFilters();
    initDeleteModal();
    initVerTodas();

    // Tabs del sidebar
    document.querySelectorAll('.sb-link').forEach(link => {
      link.addEventListener('click', () => switchTab(link.dataset.tab));
    });

    // Nueva encuesta desde tab encuestas
    document.getElementById('btn-nueva-enc')?.addEventListener('click', () => CrearApp.openNew());
  };

  return { init, switchTab, renderEncTable, renderDashTable };
})();

/* ════════════════════════════════════════
   10. CREAR / EDITAR ENCUESTA
════════════════════════════════════════ */
const CrearApp = (() => {
  let qCounter = 0;
  let editingId = null;

  /* ── Reglas de validación del formulario ── */
  const RULES = {
    titulo: [
      { check: (v) => Validator.notEmpty(v),                          message: 'El título es obligatorio.' },
      { check: (v) => v.trim().length >= 5,                           message: 'El título debe tener al menos 5 caracteres.' },
      { check: (v) => Validator.matchesRegex(v, REGEX.textoGeneral),  message: 'El título contiene caracteres no permitidos.' },
    ],
    fechaInicio: [
      { check: (v) => Validator.notEmpty(v),   message: 'La fecha de inicio es obligatoria.' },
      { check: (v) => Validator.isValidDate(v), message: 'Ingresa una fecha válida.' },
    ],
    fechaFin: [
      { check: (v) => Validator.notEmpty(v),   message: 'La fecha de cierre es obligatoria.' },
      { check: (v) => Validator.isValidDate(v), message: 'Ingresa una fecha válida.' },
    ],
  };

  const validateForm = () => {
    let valid = true;
    valid = Validator.validateField('enc-titulo',       'err-titulo',       RULES.titulo)      && valid;
    valid = Validator.validateField('enc-fecha-inicio', 'err-fecha-inicio', RULES.fechaInicio) && valid;
    valid = Validator.validateField('enc-fecha-fin',    'err-fecha-fin',    RULES.fechaFin)    && valid;

    // Coherencia de fechas
    const fi = document.getElementById('enc-fecha-inicio')?.value;
    const ff = document.getElementById('enc-fecha-fin')?.value;
    if (fi && ff && Validator.isValidDate(fi) && Validator.isValidDate(ff) && !Validator.endAfterStart(fi, ff)) {
      const errEl = document.getElementById('err-fecha-fin');
      const field = document.getElementById('enc-fecha-fin');
      if (errEl) errEl.textContent = 'La fecha de cierre debe ser posterior a la de inicio.';
      if (field) field.classList.add('error');
      valid = false;
    }

    // Audiencia seleccionada
    const selAud = document.querySelectorAll('.aud-opt.selected');
    const errAud = document.getElementById('err-audiencia');
    if (selAud.length === 0) {
      if (errAud) errAud.textContent = 'Selecciona al menos una audiencia.';
      valid = false;
    } else {
      if (errAud) errAud.textContent = '';
    }

    // Al menos una pregunta
    const questions = document.querySelectorAll('.q-builder');
    const errQ      = document.getElementById('err-preguntas');
    if (questions.length === 0) {
      if (errQ) errQ.textContent = 'Agrega al menos una pregunta.';
      valid = false;
    } else {
      if (errQ) errQ.textContent = '';
      // Cada pregunta debe tener título
      questions.forEach(q => {
        const tf = q.querySelector('.q-title-field');
        if (tf && !Validator.notEmpty(tf.value)) {
          tf.style.borderBottom = '2px solid var(--danger)';
          tf.setAttribute('aria-invalid', 'true');
          valid = false;
        }
      });
    }
    return valid;
  };

  /* ── Agregar pregunta ── */
  const addQuestion = () => {
    qCounter++;
    const qid  = `q-${qCounter}`;
    const list = document.getElementById('questions-list');
    if (!list) return;

    const el  = document.createElement('div');
    el.className = 'q-builder';
    el.id        = `qb-${qid}`;
    el.innerHTML = buildQHTML(qid, qCounter, '', 'multiple', false);
    list.appendChild(el);

    attachQEvents(el, qid);
    updateQBadge();
    updatePreview();
    el.querySelector('.q-title-field')?.focus();
  };

  const buildQHTML = (qid, num, title, type, required) => `
    <div class="q-builder-head">
      <i class="ti ti-grip-vertical q-drag-handle" aria-hidden="true"></i>
      <div class="q-num-badge" aria-hidden="true">${num}</div>
      <input class="q-title-field" type="text" placeholder="Escribe la pregunta…" value="${title}"
             aria-label="Título de la pregunta ${num}" />
      <select class="q-type-sel" aria-label="Tipo de pregunta">
        <option value="multiple" ${type==='multiple'?'selected':''}>Opción múltiple</option>
        <option value="yesno"    ${type==='yesno'   ?'selected':''}>Sí / No</option>
        <option value="scale"    ${type==='scale'   ?'selected':''}>Escala 1–5</option>
        <option value="text"     ${type==='text'    ?'selected':''}>Texto libre</option>
      </select>
      <label class="q-oblig-label">
        <input type="checkbox" ${required?'checked':''} aria-label="Marcar como obligatoria" /> Obligatoria
      </label>
    </div>
    <div class="q-builder-body">${buildQBody(type)}</div>
    <div class="q-builder-foot">
      <button class="icon-btn btn-dup-q" type="button" aria-label="Duplicar pregunta">
        <i class="ti ti-copy" aria-hidden="true"></i> Duplicar
      </button>
      <button class="icon-btn danger btn-del-q" type="button" aria-label="Eliminar pregunta">
        <i class="ti ti-trash" aria-hidden="true"></i> Eliminar
      </button>
    </div>`;

  const buildQBody = (type) => {
    switch (type) {
      case 'multiple':
        return `<div class="opts-builder">${buildOptRow('Opción 1')}${buildOptRow('Opción 2')}</div>
                <button class="add-opt-btn" type="button"><i class="ti ti-plus"></i> Agregar opción</button>`;
      case 'yesno':
        return `<div style="display:flex;gap:10px;">
          <div style="flex:1;padding:10px;text-align:center;background:var(--success-bg);border:1px solid var(--success-border);border-radius:var(--radius-md);font-size:13px;font-weight:500;color:var(--success);">Sí</div>
          <div style="flex:1;padding:10px;text-align:center;background:var(--danger-bg);border:1px solid var(--danger-border);border-radius:var(--radius-md);font-size:13px;font-weight:500;color:var(--danger);">No</div>
        </div>`;
      case 'scale':
        return `<div style="display:flex;gap:8px;">
          ${[1,2,3,4,5].map(n =>
            `<div style="flex:1;text-align:center;padding:9px 0;border:1px solid var(--border);border-radius:var(--radius-md);font-size:14px;font-weight:500;color:var(--text-2);">${n}</div>`
          ).join('')}
        </div>
        <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--text-3);margin-top:4px;padding:0 2px;">
          <span>Muy malo</span><span>Excelente</span>
        </div>`;
      case 'text':
        return `<textarea class="field-input" rows="2" placeholder="El encuestado escribirá aquí su respuesta…" readonly
                  style="background:var(--bg);cursor:default;" aria-label="Campo de texto libre (vista previa)"></textarea>`;
      default: return '';
    }
  };

  const buildOptRow = (placeholder) => `
    <div class="opt-builder-row">
      <div class="opt-dot" aria-hidden="true"></div>
      <input class="opt-builder-input" type="text" placeholder="${placeholder}" aria-label="Opción de respuesta" />
      <button class="opt-del-btn" type="button" aria-label="Eliminar esta opción">
        <i class="ti ti-x" aria-hidden="true"></i>
      </button>
    </div>`;

  const attachQEvents = (block, qid) => {
    // Cambio de tipo
    block.querySelector('.q-type-sel')?.addEventListener('change', (e) => {
      const body = block.querySelector('.q-builder-body');
      if (body) body.innerHTML = buildQBody(e.target.value);
      attachOptEvents(block);
    });

    // Actualizar preview al escribir el título
    block.querySelector('.q-title-field')?.addEventListener('input', (e) => {
      e.target.style.borderBottom = '';
      e.target.removeAttribute('aria-invalid');
      updatePreview();
    });

    // Duplicar
    block.querySelector('.btn-dup-q')?.addEventListener('click', () => duplicateQ(block));

    // Eliminar
    block.querySelector('.btn-del-q')?.addEventListener('click', () => {
      block.remove();
      renumberQ();
      updateQBadge();
      updatePreview();
    });

    attachOptEvents(block);
  };

  const attachOptEvents = (block) => {
    block.querySelector('.add-opt-btn')?.addEventListener('click', () => {
      const list  = block.querySelector('.opts-builder');
      const count = list?.querySelectorAll('.opt-builder-row').length || 0;
      if (count >= 6) { UI.showToast('Máximo 6 opciones por pregunta.'); return; }
      const wrap = document.createElement('div');
      wrap.innerHTML = buildOptRow(`Opción ${count + 1}`);
      const row = wrap.firstElementChild;
      list?.appendChild(row);
      attachDelOpt(row);
    });
    block.querySelectorAll('.opt-builder-row').forEach(row => attachDelOpt(row));
  };

  const attachDelOpt = (row) => {
    row?.querySelector('.opt-del-btn')?.addEventListener('click', () => {
      const siblings = row.parentElement?.querySelectorAll('.opt-builder-row');
      if (siblings && siblings.length <= 2) { UI.showToast('Debe haber al menos 2 opciones.'); return; }
      row.remove();
    });
  };

  const duplicateQ = (original) => {
    qCounter++;
    const clone = original.cloneNode(true);
    clone.id = `qb-q-${qCounter}`;
    original.parentElement?.insertBefore(clone, original.nextSibling);
    attachQEvents(clone, `q-${qCounter}`);
    renumberQ();
    updateQBadge();
  };

  const renumberQ = () => {
    document.querySelectorAll('.q-builder').forEach((b, i) => {
      const badge = b.querySelector('.q-num-badge');
      if (badge) badge.textContent = i + 1;
    });
  };

  const updateQBadge = () => {
    const count = document.querySelectorAll('.q-builder').length;
    const badge = document.getElementById('q-count-badge');
    if (badge) badge.textContent = `${count} pregunta${count !== 1 ? 's' : ''}`;
  };

  /* ── Preview en tiempo real ── */
  const updatePreview = () => {
    const title    = document.getElementById('enc-titulo')?.value || '';
    const desc     = document.getElementById('enc-desc')?.value   || '';
    const selAud   = [...document.querySelectorAll('.aud-opt.selected')].map(el => el.dataset.audience).join(', ');
    const qCount   = document.querySelectorAll('.q-builder').length;

    const titleEl = document.getElementById('prev-title');
    const descEl  = document.getElementById('prev-desc');
    const tagsEl  = document.getElementById('prev-tags');

    if (titleEl) titleEl.textContent = title || 'Título de la encuesta';
    if (descEl)  descEl.textContent  = desc  || 'La descripción aparecerá aquí…';
    if (tagsEl)  tagsEl.innerHTML = `
      <span class="ptag blue"><i class="ti ti-users" aria-hidden="true"></i> ${selAud || 'Audiencia'}</span>
      <span class="ptag green"><i class="ti ti-list-check" aria-hidden="true"></i> ${qCount} pregunta${qCount !== 1 ? 's' : ''}</span>`;
  };

  /* ── Audiencia ── */
  const initAudienceOpts = () => {
    document.querySelectorAll('.aud-opt').forEach(opt => {
      const handler = () => {
        if (opt.dataset.audience === 'todos') {
          document.querySelectorAll('.aud-opt').forEach(o => {
            o.classList.remove('selected');
            o.setAttribute('aria-pressed', 'false');
          });
          opt.classList.toggle('selected');
        } else {
          document.querySelectorAll('.aud-opt[data-audience="todos"]').forEach(o => {
            o.classList.remove('selected');
            o.setAttribute('aria-pressed', 'false');
          });
          opt.classList.toggle('selected');
        }
        opt.setAttribute('aria-pressed', opt.classList.contains('selected') ? 'true' : 'false');
        const errAud = document.getElementById('err-audiencia');
        if (errAud && document.querySelectorAll('.aud-opt.selected').length > 0)
          errAud.textContent = '';
        updatePreview();
      };
      opt.addEventListener('click', handler);
      opt.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handler(); } });
    });
  };

  /* ── Toggles ── */
  const initToggles = () => {
    document.querySelectorAll('.tgl-switch').forEach(t => {
      const handler = () => {
        t.classList.toggle('on');
        t.setAttribute('aria-checked', t.classList.contains('on') ? 'true' : 'false');
      };
      t.addEventListener('click', handler);
      t.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handler(); } });
    });
  };

  /* ── Guardar borrador ── */
  const handleDraft = () => {
    const titulo = document.getElementById('enc-titulo')?.value?.trim();
    if (!Validator.notEmpty(titulo)) {
      UI.showToast('Ingresa al menos el título para guardar borrador.', 'error');
      document.getElementById('enc-titulo')?.focus();
      return;
    }
    saveSurveyData('draft');
    UI.showToast('Borrador guardado correctamente.', 'success');
    AdminApp.switchTab('encuestas');
  };

  /* ── Función Helper para Guardar (Publicar o Borrador) ── */
  const saveSurveyData = (statusStr) => {
    const titulo  = document.getElementById('enc-titulo').value.trim();
    const desc = document.getElementById('enc-desc')?.value || '';
    const fechaInicio = document.getElementById('enc-fecha-inicio')?.value || '';
    const fechaFin = document.getElementById('enc-fecha-fin').value;
    const audience = [...document.querySelectorAll('.aud-opt.selected')].map(el => el.dataset.audience).join(', ');
    const audienceTypeMap = { estudiantes: 'blue', docentes: 'purple', administrativo: 'green', todos: 'blue' };
    const firstAud = document.querySelector('.aud-opt.selected')?.dataset.audience || 'todos';

    const questions = Array.from(document.querySelectorAll('.q-builder')).map(b => {
      const opts = Array.from(b.querySelectorAll('.opt-builder-input')).map(input => input.value);
      return {
        title: b.querySelector('.q-title-field')?.value || '',
        type: b.querySelector('.q-type-sel')?.value || 'multiple',
        required: b.querySelector('.q-oblig-label input')?.checked || false,
        options: opts
      };
    });

    const survey = {
      id:           editingId !== null ? editingId : Date.now(),
      title:        titulo,
      description:  desc,
      startDate:    fechaInicio,
      audience:     audience || 'todos',
      audienceType: audienceTypeMap[firstAud] || 'blue',
      status:       statusStr,
      responses:    editingId !== null ? (Store.get('adminEncuestas').find(s => s.id === editingId)?.responses || 0) : 0,
      total:        0,
      dueDate:      fechaFin,
      questions:    questions
    };

    const surveys = Store.get('adminEncuestas');
    if (editingId !== null) {
      Store.set('adminEncuestas', surveys.map(s => s.id === editingId ? survey : s));
    } else {
      Store.set('adminEncuestas', [...surveys, survey]);
    }
    return titulo;
  };

  /* ── Publicar ── */
  const handlePublish = () => {
    if (!validateForm()) {
      UI.showToast('Corrige los errores antes de publicar.', 'error');
      document.querySelector('.field-error:not(:empty)')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    const titulo = saveSurveyData('active');
    if (editingId !== null) {
      UI.showToast(`Encuesta "${titulo}" actualizada.`, 'success');
    } else {
      UI.showToast(`Encuesta "${titulo}" publicada.`, 'success');
    }

    AdminApp.switchTab('encuestas');
  };

  /* ── Abrir crear nuevo ── */
  const openNew = () => {
    editingId = null;
    resetForm();
    AdminApp.switchTab('crear');
    document.getElementById('admin-page-title').textContent = 'Nueva encuesta';
  };

  /* ── Abrir editar ── */
  const openEdit = (survey) => {
    editingId = survey.id;
    resetForm();
    
    // Load simple fields
    if (document.getElementById('enc-titulo')) document.getElementById('enc-titulo').value = survey.title || '';
    if (document.getElementById('enc-desc')) document.getElementById('enc-desc').value = survey.description || '';
    if (document.getElementById('enc-fecha-inicio')) document.getElementById('enc-fecha-inicio').value = survey.startDate || '';
    if (document.getElementById('enc-fecha-fin')) document.getElementById('enc-fecha-fin').value = survey.dueDate || '';
    
    // Load audiences
    document.querySelectorAll('.aud-opt').forEach(opt => {
      opt.classList.remove('selected');
      opt.setAttribute('aria-pressed', 'false');
      if (survey.audience && (survey.audience.includes(opt.dataset.audience) || survey.audience === 'todos')) {
        opt.classList.add('selected');
        opt.setAttribute('aria-pressed', 'true');
      }
    });

    // Load questions
    document.getElementById('questions-list').innerHTML = '';
    qCounter = 0;
    if (survey.questions && survey.questions.length > 0) {
      survey.questions.forEach(q => {
        addQuestion();
        const lastQ = document.getElementById(`qb-q-${qCounter}`);
        if (lastQ) {
          lastQ.querySelector('.q-title-field').value = q.title;
          const typeSel = lastQ.querySelector('.q-type-sel');
          typeSel.value = q.type;
          typeSel.dispatchEvent(new Event('change'));
          
          const obligCb = lastQ.querySelector('.q-oblig-label input');
          if (obligCb) obligCb.checked = q.required;

          if (q.type === 'multiple' && q.options && q.options.length > 0) {
            const list = lastQ.querySelector('.opts-builder');
            if (list) {
              list.innerHTML = '';
              q.options.forEach((optStr, idx) => {
                 const wrap = document.createElement('div');
                 wrap.innerHTML = buildOptRow(`Opción ${idx + 1}`);
                 const row = wrap.firstElementChild;
                 row.querySelector('.opt-builder-input').value = optStr;
                 list.appendChild(row);
                 attachDelOpt(row);
              });
            }
          }
        }
      });
    }

    updatePreview();
    AdminApp.switchTab('crear');
    document.getElementById('admin-page-title').textContent = 'Editar encuesta';
  };

  const resetForm = () => {
    qCounter = 0;
    ['enc-titulo','enc-desc','enc-fecha-inicio','enc-fecha-fin'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
    document.querySelectorAll('.aud-opt').forEach(o => {
      o.classList.remove('selected');
      o.setAttribute('aria-pressed', 'false');
    });
    document.getElementById('questions-list').innerHTML = '';
    updateQBadge();
    updatePreview();
    ['err-titulo','err-fecha-inicio','err-fecha-fin','err-audiencia','err-preguntas']
      .forEach(id => { const el = document.getElementById(id); if (el) el.textContent = ''; });
    ['enc-titulo','enc-fecha-inicio','enc-fecha-fin']
      .forEach(id => document.getElementById(id)?.classList.remove('error'));
  };

  /* ── Init ── */
  const init = () => {
    document.getElementById('btn-add-question')?.addEventListener('click', addQuestion);
    document.getElementById('btn-save-draft')?.addEventListener('click', handleDraft);
    document.getElementById('btn-publish-enc')?.addEventListener('click', handlePublish);
    document.getElementById('enc-titulo')?.addEventListener('input', updatePreview);
    document.getElementById('enc-desc')?.addEventListener('input',  updatePreview);
    initAudienceOpts();
    initToggles();
  };

  return { init, openNew, openEdit };
})();

/* ════════════════════════════════════════
   11. CONFIG APP
════════════════════════════════════════ */
const ConfigApp = (() => {

  const RULES_NOMBRE = [
    { check: (v) => Validator.notEmpty(v),                        message: 'El nombre es obligatorio.' },
    { check: (v) => Validator.matchesRegex(v, REGEX.nombre),      message: 'Solo letras, tildes y espacios (2-80 caracteres).' },
  ];

  const RULES_EMAIL = [
    { check: (v) => Validator.notEmpty(v),                        message: 'El correo es obligatorio.' },
    { check: (v) => Validator.matchesRegex(v, REGEX.emailULEAM),  message: 'Debe ser un correo @live.uleam.edu.ec' },
  ];

  const RULES_PWD_ACTUAL = [
    { check: (v) => Validator.notEmpty(v), message: 'Ingresa tu contraseña actual.' },
  ];

  const RULES_PWD_NUEVA = [
    { check: (v) => Validator.notEmpty(v),                        message: 'La nueva contraseña es obligatoria.' },
    { check: (v) => v.trim().length >= 8,                         message: 'Mínimo 8 caracteres.' },
    { check: (v) => /^[A-Z]/.test(v.trim()),                     message: 'Debe iniciar con letra mayúscula.' },
    { check: (v) => Validator.matchesRegex(v, REGEX.password),   message: 'Debe incluir al menos un número.' },
  ];

  const RULES_PWD_CONFIRM = [
    { check: (v) => Validator.notEmpty(v), message: 'Confirma la nueva contraseña.' },
  ];

  const validatePerfil = () => {
    const nOk = Validator.validateField('cfg-nombre', 'err-cfg-nombre', RULES_NOMBRE);
    const eOk = Validator.validateField('cfg-email',  'err-cfg-email',  RULES_EMAIL);
    return nOk && eOk;
  };

  const validatePassword = () => {
    let valid = true;
    valid = Validator.validateField('cfg-pwd-actual',  'err-pwd-actual',  RULES_PWD_ACTUAL)  && valid;
    valid = Validator.validateField('cfg-pwd-nueva',   'err-pwd-nueva',   RULES_PWD_NUEVA)   && valid;
    valid = Validator.validateField('cfg-pwd-confirm', 'err-pwd-confirm', RULES_PWD_CONFIRM) && valid;

    // Coincidencia de contraseñas
    if (valid) {
      const nueva   = document.getElementById('cfg-pwd-nueva')?.value;
      const confirm = document.getElementById('cfg-pwd-confirm')?.value;
      if (nueva !== confirm) {
        const el = document.getElementById('err-pwd-confirm');
        const fi = document.getElementById('cfg-pwd-confirm');
        if (el) el.textContent = 'Las contraseñas no coinciden.';
        if (fi) fi.classList.add('error');
        valid = false;
      }
    }
    return valid;
  };

  /* ── Facultades ── */
  const renderFacultades = () => {
    const list = document.getElementById('facultades-list');
    const facs = Store.get('facultades') || [];
    if (!list) return;

    list.innerHTML = facs.map((f, i) => `
      <div class="fac-item">
        <span>${f}</span>
        <button class="fac-del-btn" data-index="${i}" type="button" aria-label="Eliminar facultad ${f}">
          <i class="ti ti-x" aria-hidden="true"></i>
        </button>
      </div>`).join('');

    list.querySelectorAll('.fac-del-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx     = parseInt(btn.dataset.index, 10);
        const facs    = Store.get('facultades');
        const removed = facs[idx];
        Store.set('facultades', facs.filter((_, i) => i !== idx));
        renderFacultades();
        UI.showToast(`Facultad "${removed}" eliminada.`);
      });
    });
  };

  const addFacultad = () => {
    const input = document.getElementById('new-facultad-input');
    const errEl = document.getElementById('err-facultad');
    const value = input?.value?.trim() || '';

    if (!Validator.notEmpty(value)) {
      if (errEl) errEl.textContent = 'Escribe el nombre de la facultad.';
      input?.focus();
      return;
    }
    if (!Validator.matchesRegex(value, REGEX.soloLetras)) {
      if (errEl) errEl.textContent = 'Solo se permiten letras, puntos y espacios.';
      return;
    }
    const facs = Store.get('facultades') || [];
    if (facs.some(f => f.toLowerCase() === value.toLowerCase())) {
      if (errEl) errEl.textContent = 'Esa facultad ya existe.';
      return;
    }

    Store.set('facultades', [...facs, value]);
    if (errEl)  errEl.textContent = '';
    if (input)  input.value       = '';
    renderFacultades();
    UI.showToast(`Facultad "${value}" agregada.`, 'success');
  };

  /* ── Tema claro / oscuro ── */
  const initTheme = () => {
    const btnLight = document.getElementById('theme-light');
    const btnDark  = document.getElementById('theme-dark');
    if (!btnLight || !btnDark) return;

    const applyTheme = (dark) => {
      document.body.classList.toggle('dark', dark);
      btnLight.classList.toggle('active', !dark);
      btnDark.classList.toggle('active',  dark);
      btnLight.setAttribute('aria-pressed', String(!dark));
      btnDark.setAttribute('aria-pressed',  String(dark));
    };

    btnLight.addEventListener('click', () => applyTheme(false));
    btnDark.addEventListener('click',  () => applyTheme(true));
  };

  /* ── Init (se llama cada vez que se abre el tab) ── */
  const init = () => {
    renderFacultades();

    // Evitar duplicar listeners usando flag
    if (document.getElementById('btn-save-perfil')?.dataset.bound) return;

    document.getElementById('btn-save-perfil')?.addEventListener('click', () => {
      if (!validatePerfil()) return;
      UI.setVisible('success-perfil', true);
      setTimeout(() => UI.setVisible('success-perfil', false), 3000);
      UI.showToast('Perfil actualizado correctamente.', 'success');
    });
    document.getElementById('btn-save-perfil').dataset.bound = '1';

    document.getElementById('btn-change-pwd')?.addEventListener('click', () => {
      if (!validatePassword()) return;
      ['cfg-pwd-actual','cfg-pwd-nueva','cfg-pwd-confirm'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
      });
      UI.setVisible('success-pwd', true);
      setTimeout(() => UI.setVisible('success-pwd', false), 3000);
      UI.showToast('Contraseña actualizada correctamente.', 'success');
    });

    document.getElementById('btn-add-facultad')?.addEventListener('click', addFacultad);
    document.getElementById('new-facultad-input')?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); addFacultad(); }
    });

    document.getElementById('btn-save-prefs')?.addEventListener('click', () => {
      UI.setVisible('success-prefs', true);
      setTimeout(() => UI.setVisible('success-prefs', false), 3000);
      UI.showToast('Preferencias guardadas.', 'success');
    });

    document.getElementById('btn-backup')?.addEventListener('click', () => {
      UI.showToast('Respaldo iniciado. Recibirás una confirmación por correo.', 'success', 4000);
    });

    initTheme();

    // Toggles de configuración
    document.querySelectorAll('.tgl-switch').forEach(t => {
      if (t.dataset.bound) return;
      t.dataset.bound = '1';
      const handler = () => {
        t.classList.toggle('on');
        t.setAttribute('aria-checked', t.classList.contains('on') ? 'true' : 'false');
      };
      t.addEventListener('click', handler);
      t.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handler(); } });
    });
  };

  return { init };
})();

/* ════════════════════════════════════════
   12. APP — arranque principal
════════════════════════════════════════ */
const App = (() => {
  const init = () => {
    Auth.init();
    CrearApp.init();

    // Limpiar errores en tiempo real al editar cualquier campo
    document.addEventListener('input', (e) => {
      const input = e.target;
      if (!input.classList.contains('field-input')) return;
      input.classList.remove('error');
      // Intentar limpiar el span de error asociado por convención de IDs
      const fieldId = input.id;
      if (!fieldId) return;
      const candidates = [
        `error-${fieldId}`,
        `err-${fieldId}`,
        `err-${fieldId.replace('enc-', '').replace('cfg-', '')}`,
      ];
      candidates.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = '';
      });
    });

    // Accesibilidad: cerrar modal al presionar Escape (registrado una sola vez)
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const modal = document.getElementById('modal-delete');
        if (modal && !modal.classList.contains('hidden')) {
          modal.classList.add('hidden');
          Store.set('encuestaToDelete', null);
        }
      }
    });
  };

  return { init };
})();

document.addEventListener('DOMContentLoaded', App.init);
