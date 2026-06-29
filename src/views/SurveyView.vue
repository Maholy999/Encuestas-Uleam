<script setup>
import { ref, computed } from 'vue';
import { store, showToast } from '../store';

const survey = computed(() => store.surveyInProgress);

// Estado de navegacion
const currentIndex = ref(0);
const answers = ref({});
const currentError = ref('');

// Pregunta activa
const currentQuestion = computed(() => {
  if (!survey.value?.questions) return null;
  return survey.value.questions[currentIndex.value] ?? null;
});

const totalQuestions = computed(() => survey.value?.questions?.length ?? 0);
const isLastQuestion = computed(() => currentIndex.value === totalQuestions.value - 1);
const isFirstQuestion = computed(() => currentIndex.value === 0);
const answeredCount = computed(() => Object.keys(answers.value).length);

const progress = computed(() => {
  if (!survey.value?.questions || totalQuestions.value === 0) return 0;
  return Math.round((answeredCount.value / totalQuestions.value) * 100);
});

// Guardar respuesta
const handleAnswer = (qid, val) => {
  answers.value = { ...answers.value, [qid]: val };
  currentError.value = '';
};

// Boton Volver
const goBack = () => {
  currentError.value = '';
  if (isFirstQuestion.value) {
    store.currentView = 'home';
  } else {
    currentIndex.value = currentIndex.value - 1;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

// Boton Siguiente / Enviar
const goNext = () => {
  const q = currentQuestion.value;
  if (!q) return;

  if (q.required && answers.value[q.id] === undefined) {
    currentError.value = 'Esta pregunta es obligatoria.';
    return;
  }

  currentError.value = '';

  if (isLastQuestion.value) {
    const questions = survey.value?.questions ?? [];
    const pendingRequired = questions.find(
      (sq) => sq.required && answers.value[sq.id] === undefined
    );
    if (pendingRequired) {
      const idx = questions.indexOf(pendingRequired);
      currentIndex.value = idx;
      currentError.value = 'Esta pregunta es obligatoria.';
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    submitSurvey();
  } else {
    currentIndex.value = currentIndex.value + 1;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

// Enviar encuesta
const submitSurvey = () => {
  const surveyData = survey.value;
  const userId = store.currentUser?.email;
  const userRole = store.currentUser?.role;

  if (!surveyData) return;

  const adminSurvey = store.adminEncuestas.find(e => e.id === surveyData.id);
  if (adminSurvey) {
    adminSurvey.responses = (adminSurvey.responses || 0) + 1;
  }

  store.allResponses.push({
    ...surveyData,
    responded: true,
    userId,
    userRole,
    userName: store.currentUser?.name || userId,
    userFaculty: store.currentUser?.faculty || '—',
    respondedAt: new Date().toLocaleString('es-EC', { dateStyle: 'short', timeStyle: 'short' }),
    answers: { ...answers.value },
  });

  store.respondedEncuestas = store.allResponses.filter(r => r.userId === userId);

  store.currentView = 'home';
  setTimeout(() => showToast('Encuesta enviada exitosamente!', 'success'), 80);
};
</script>

<template>
  <div id="screen-survey" class="screen active" v-if="survey && currentQuestion">

    <header class="survey-topbar">
      <button class="btn-back" @click="goBack" aria-label="Volver">
        <i class="ti ti-arrow-left"></i> Volver
      </button>
      <h2 class="survey-topbar-title">{{ survey.title }}</h2>
    </header>

    <div class="survey-progress-track" role="progressbar"
         :aria-valuenow="progress" aria-valuemin="0" aria-valuemax="100">
      <div class="survey-progress-fill" :style="{ width: progress + '%' }"></div>
    </div>

    <div class="survey-enc-header" v-if="isFirstQuestion">
      <img
        v-if="survey.coverImage"
        :src="survey.coverImage"
        style="width:100%;height:180px;object-fit:cover;border-radius:var(--radius-md);margin-bottom:16px;"
        alt="Imagen de encuesta"
      />
      <h3>{{ survey.title }}</h3>
      <div class="survey-badges">
        <span class="survey-badge blue">
          <i class="ti ti-users" aria-hidden="true"></i>
          {{ survey.audienceLabel || survey.audience }}
        </span>
        <span class="survey-badge green">
          <i class="ti ti-clock" aria-hidden="true"></i>
          ~{{ survey.duration || '5 min' }}
        </span>
        <span class="survey-badge green">
          <i class="ti ti-shield-check" aria-hidden="true"></i> Anonima
        </span>
      </div>
    </div>

    <div class="survey-body">
      <div class="q-card">

        <p class="q-card-title">
          <span class="q-num" aria-hidden="true">{{ currentIndex + 1 }}</span>
          <span>
            {{ currentQuestion.title || currentQuestion.text }}
            <span v-if="currentQuestion.required" style="color:var(--danger)"> *</span>
          </span>
        </p>

        <p style="font-size:11px;color:var(--text-3);margin-bottom:14px;">
          Pregunta {{ currentIndex + 1 }} de {{ totalQuestions }}
        </p>

        <!-- Opciones multiples -->
        <div v-if="currentQuestion.type === 'multiple'" class="opts-list" role="radiogroup">
          <div
            class="opt-item"
            v-for="opt in currentQuestion.options"
            :key="opt"
            :class="{ selected: answers[currentQuestion.id] === opt }"
            role="radio"
            :aria-checked="answers[currentQuestion.id] === opt"
            tabindex="0"
            @click="handleAnswer(currentQuestion.id, opt)"
            @keydown.enter="handleAnswer(currentQuestion.id, opt)"
            @keydown.space.prevent="handleAnswer(currentQuestion.id, opt)"
          >
            <div class="opt-radio" aria-hidden="true"></div>
            <span>{{ opt }}</span>
          </div>
        </div>

        <!-- Si / No -->
        <div v-else-if="currentQuestion.type === 'yesno'" class="yn-row" role="radiogroup">
          <div
            class="yn-btn yes"
            :class="{ selected: answers[currentQuestion.id] === 'Si' }"
            role="radio"
            :aria-checked="answers[currentQuestion.id] === 'Si'"
            tabindex="0"
            @click="handleAnswer(currentQuestion.id, 'Si')"
            @keydown.enter="handleAnswer(currentQuestion.id, 'Si')"
            @keydown.space.prevent="handleAnswer(currentQuestion.id, 'Si')"
          >Si</div>
          <div
            class="yn-btn no"
            :class="{ selected: answers[currentQuestion.id] === 'No' }"
            role="radio"
            :aria-checked="answers[currentQuestion.id] === 'No'"
            tabindex="0"
            @click="handleAnswer(currentQuestion.id, 'No')"
            @keydown.enter="handleAnswer(currentQuestion.id, 'No')"
            @keydown.space.prevent="handleAnswer(currentQuestion.id, 'No')"
          >No</div>
        </div>

        <!-- Escala -->
        <div v-else-if="currentQuestion.type === 'scale'">
          <div class="scale-row" role="radiogroup">
            <div
              class="scale-btn"
              v-for="n in 5"
              :key="n"
              :class="{ selected: answers[currentQuestion.id] === n }"
              role="radio"
              :aria-checked="answers[currentQuestion.id] === n"
              tabindex="0"
              @click="handleAnswer(currentQuestion.id, n)"
              @keydown.enter="handleAnswer(currentQuestion.id, n)"
              @keydown.space.prevent="handleAnswer(currentQuestion.id, n)"
            >{{ n }}</div>
          </div>
          <div class="scale-labels" aria-hidden="true">
            <span>Muy malo</span><span>Excelente</span>
          </div>
        </div>

        <!-- Texto libre -->
        <div v-else-if="currentQuestion.type === 'text'">
          <textarea
            class="field-input"
            rows="4"
            placeholder="Escribe tu respuesta aqui..."
            :value="answers[currentQuestion.id] || ''"
            @input="handleAnswer(currentQuestion.id, $event.target.value)"
          ></textarea>
        </div>

        <!-- Error de validacion -->
        <p v-if="currentError" class="q-error" role="alert" style="display:block;margin-top:10px;">
          {{ currentError }}
        </p>
      </div>

      <!-- Email (solo en ultima pregunta) -->
      <div class="email-section" v-if="isLastQuestion">
        <p><i class="ti ti-lock" aria-hidden="true"></i> Vinculacion de respuesta</p>
        <p style="font-size:12px;color:var(--text-3);margin-bottom:8px;">
          Tu correo identifica la respuesta internamente, pero no sera visible para otros.
        </p>
        <input
          class="field-input"
          type="email"
          :value="store.currentUser?.email"
          readonly
          aria-label="Correo institucional vinculado"
        />
      </div>
    </div>

    <div class="survey-footer">
      <button class="btn btn-outline" @click="goBack" aria-label="Anterior">
        <i class="ti ti-arrow-left"></i>
      </button>
      <span class="survey-progress-text" aria-live="polite">
        {{ answeredCount }} de {{ totalQuestions }} respondidas
      </span>
      <button class="btn btn-primary" @click="goNext">
        <span v-if="isLastQuestion">Enviar <i class="ti ti-send"></i></span>
        <span v-else>Siguiente <i class="ti ti-arrow-right"></i></span>
      </button>
    </div>

  </div>
</template>
