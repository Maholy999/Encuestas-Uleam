import { reactive, watch } from 'vue';
import { USERS, INITIAL_SURVEYS, RESPONDED_BY_ROLE, FACULTADES } from './demoData';

const STORAGE_KEY = 'encuestas_uleam_state_v2';

const getDefaultState = () => ({
  currentUser: null,
  currentView: 'login', // 'login', 'home', 'survey', 'admin'
  surveyInProgress: null,
  pendingEncuestas: [],
  respondedEncuestas: [],
  allResponses: [],
  adminEncuestas: JSON.parse(JSON.stringify(INITIAL_SURVEYS)),
  facultades: [...FACULTADES],
  toast: { message: '', type: 'success', visible: false },
});

const loadState = () => {
  const defaultState = getDefaultState();
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      
      // MIGRATION: Ensure all questions have IDs to prevent answers from overwriting each other
      if (parsed.adminEncuestas) {
        parsed.adminEncuestas.forEach(survey => {
          if (survey.questions) {
            survey.questions.forEach((q, idx) => {
              if (!q.id) {
                q.id = 'q_' + survey.id + '_' + idx + '_' + Math.random().toString(36).substr(2, 5);
              }
            });
          }
        });
      }
      
      return { 
        ...defaultState, 
        ...parsed,
        toast: parsed.toast || defaultState.toast,
        allResponses: parsed.allResponses || defaultState.allResponses
      };
    } catch (e) {
      console.error('Error loading state', e);
    }
  }
  return defaultState;
};

export const store = reactive(loadState());

watch(store, (newState) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
}, { deep: true });

const updateUserEncuestas = () => {
  const user = store.currentUser;
  if (!user || user.role === 'sysadmin') return;

  // Actualizar respondedEncuestas filtrando de allResponses por el email del usuario actual
  store.respondedEncuestas = store.allResponses.filter(r => r.userId === user.email);

  const allowed = {
    student: ['estudiantes', 'todos'],
    teacher: ['docentes', 'todos'],
    worker: ['administrativo', 'todos'],
  }[user.role] || [];

  const respondedIds = store.respondedEncuestas.map(r => r.id);

  // Filtrar de adminEncuestas (single source of truth)
  const pending = store.adminEncuestas.filter(s => {
    if (s.status !== 'active') return false;
    if (respondedIds.includes(s.id)) return false;
    
    // Parse audience string ('estudiantes, docentes') into array
    const audArray = typeof s.audience === 'string' 
      ? s.audience.toLowerCase().split(',').map(a => a.trim()) 
      : s.audience || [];

    // Chequeos de legado por si acaso
    if (audArray.includes('toda la comunidad') || audArray.includes('todos')) return true;

    // Verificar si algún rol permitido está en la audiencia de la encuesta
    return audArray.some(a => allowed.includes(a));
  });

  store.pendingEncuestas = pending;
};

// Observador para mantener todo sincronizado en tiempo real
watch(() => store.adminEncuestas, () => {
  updateUserEncuestas();
}, { deep: true });

export const loginUser = (user) => {
  store.currentUser = user;
  if (user) {
    store.currentView = user.role === 'sysadmin' ? 'admin' : 'home';
  }
  
  if (user && user.role !== 'sysadmin') {
    // Migrar datos demo a allResponses si están vacíos
    if (store.allResponses.length === 0) {
      Object.keys(RESPONDED_BY_ROLE).forEach(role => {
        const demoResponses = RESPONDED_BY_ROLE[role];
        const userForRole = Object.values(USERS).find(u => u.role === role);
        if (userForRole) {
          demoResponses.forEach(r => {
            store.allResponses.push({ ...r, userId: userForRole.email, userRole: role });
          });
        }
      });
    }
    
    // Calcular pendientes basándose en adminEncuestas y allResponses
    updateUserEncuestas();
  }
};

export const logoutUser = () => {
  store.currentUser = null;
  store.currentView = 'login';
};

// Acciones globales adicionales
export const showToast = (message, type = 'success') => {
  store.toast = { message, type, visible: true };
  setTimeout(() => {
    if (store.toast.message === message) {
      store.toast.visible = false;
    }
  }, 3000);
};

export const deleteSurvey = (id) => {
  store.adminEncuestas = store.adminEncuestas.filter(e => e.id !== id);
  store.allResponses = store.allResponses.filter(r => r.id !== id);
  updateUserEncuestas();
};
