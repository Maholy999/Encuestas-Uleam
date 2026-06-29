<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { store, showToast } from '../../store';
import { useI18n } from 'vue-i18n';

const props = defineProps({
  editId: {
    type: Number,
    default: null
  }
});

const emit = defineEmits(['saved', 'cancel']);
const { t } = useI18n();

// Form state
const title = ref('');
const description = ref('');
const startDate = ref('');
const dueDate = ref('');
const audience = ref([]);
const questions = ref([]);
const errors = ref({});

const coverImage = ref(null);
const fileInput = ref(null);

const triggerFileInput = () => {
  if (fileInput.value) fileInput.value.click();
};

const handleFileUpload = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    showToast(t('admin.create.invalidImage', 'Por favor selecciona un archivo de imagen válido.'), 'error');
    return;
  }

  if (file.size > 2 * 1024 * 1024) {
    showToast(t('admin.create.imageTooLarge', 'La imagen es muy grande. El tamaño máximo es 2MB.'), 'error');
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    coverImage.value = e.target.result;
  };
  reader.readAsDataURL(file);
};

// Toggles
const toggles = ref({
  anonima: true,
  unica: true,
  resultados: false,
  notificar: true,
  recordatorio: true
});

onMounted(() => {
  if (props.editId) {
    const surveyToEdit = store.adminEncuestas.find(s => s.id === props.editId);
    if (surveyToEdit) {
      title.value = surveyToEdit.title || '';
      description.value = surveyToEdit.description || '';
      startDate.value = surveyToEdit.startDate || '';
      dueDate.value = surveyToEdit.dueDate || '';
      if (surveyToEdit.audience === 'todos') {
        audience.value = ['estudiantes', 'docentes', 'administrativo', 'todos'];
      } else {
        audience.value = surveyToEdit.audience ? surveyToEdit.audience.split(', ') : [];
      }
      
      if (surveyToEdit.coverImage) {
        coverImage.value = surveyToEdit.coverImage;
      }

      if (surveyToEdit.questions) {
        questions.value = JSON.parse(JSON.stringify(surveyToEdit.questions));
      } else {
        questions.value = [];
      }
    }
  } else {
    questions.value = [];
  }
});

const toggleAudience = (type) => {
  if (type === 'todos') {
    if (audience.value.includes('todos')) {
      audience.value = [];
    } else {
      audience.value = ['estudiantes', 'docentes', 'administrativo', 'todos'];
    }
  } else {
    const idx = audience.value.indexOf(type);
    if (idx !== -1) {
      audience.value.splice(idx, 1);
      const tIdx = audience.value.indexOf('todos');
      if (tIdx !== -1) audience.value.splice(tIdx, 1);
    } else {
      audience.value.push(type);
    }
  }
  errors.value.audience = '';
};

const isAudSelected = (type) => audience.value.includes(type);

const addQuestion = () => {
  questions.value.push({
    id: 'q_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
    title: '',
    type: 'multiple',
    required: false,
    options: ['Opción 1', 'Opción 2']
  });
  errors.value.questions = '';
};

const duplicateQ = (idx) => {
  const clone = JSON.parse(JSON.stringify(questions.value[idx]));
  clone.id = 'q_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
  questions.value.splice(idx + 1, 0, clone);
};

const delQ = (idx) => {
  questions.value.splice(idx, 1);
};

const addOpt = (q) => {
  if (q.options.length < 6) {
    q.options.push(`Opción ${q.options.length + 1}`);
  } else {
    showToast("Máximo 6 opciones por pregunta.", 'error');
  }
};

const delOpt = (q, oIdx) => {
  if (q.options.length > 2) {
    q.options.splice(oIdx, 1);
  } else {
    showToast("Debe haber al menos 2 opciones.", 'error');
  }
};

const validateForm = () => {
  errors.value = {};
  let valid = true;
  if (!title.value.trim()) { errors.value.title = "El título es obligatorio."; valid = false; }
  if (!startDate.value) { errors.value.startDate = "La fecha de inicio es obligatoria."; valid = false; }
  if (!dueDate.value) { errors.value.dueDate = "La fecha de cierre es obligatoria."; valid = false; }
  if (startDate.value && dueDate.value && new Date(dueDate.value) <= new Date(startDate.value)) {
    errors.value.dueDate = "La fecha de cierre debe ser posterior a la de inicio.";
    valid = false;
  }
  if (audience.value.length === 0) {
    errors.value.audience = "Selecciona al menos una audiencia.";
    valid = false;
  }
  if (questions.value.length === 0) {
    errors.value.questions = "Agrega al menos una pregunta.";
    valid = false;
  }
  return valid;
};

const saveSurveyData = (statusStr) => {
  const audienceTypeMap = { estudiantes: 'blue', docentes: 'purple', administrativo: 'green', todos: 'blue' };
  const firstAud = audience.value[0] || 'todos';

  const survey = {
    id: props.editId !== null ? props.editId : Date.now(),
    title: title.value.trim(),
    description: description.value.trim(),
    startDate: startDate.value,
    audience: audience.value.join(', '),
    audienceType: audienceTypeMap[firstAud] || 'blue',
    status: statusStr,
    responses: props.editId !== null ? (store.adminEncuestas.find(s => s.id === props.editId)?.responses || 0) : 0,
    total: 0,
    dueDate: dueDate.value,
    coverImage: coverImage.value,
    questions: JSON.parse(JSON.stringify(questions.value))
  };

  if (props.editId !== null) {
    const idx = store.adminEncuestas.findIndex(s => s.id === props.editId);
    if (idx !== -1) {
      store.adminEncuestas[idx] = survey;
    }
  } else {
    store.adminEncuestas.push(survey);
  }
};

const handleDraft = () => {
  if (!title.value.trim()) {
    errors.value.title = "Ingresa al menos el título para guardar borrador.";
    return;
  }
  saveSurveyData('draft');
  showToast("Borrador guardado correctamente.", 'success');
  emit('saved');
};

const handlePublish = () => {
  if (!validateForm()) {
    showToast("Corrige los errores antes de publicar.", 'error');
    return;
  }
  saveSurveyData('active');
  showToast(props.editId !== null ? `Encuesta "${title.value}" actualizada.` : `Encuesta "${title.value}" publicada.`, 'success');
  emit('saved');
};

const audienceLabel = computed(() => {
  if (audience.value.length === 0) return 'Audiencia';
  if (audience.value.includes('todos')) return 'Toda la comunidad';
  return audience.value.map(a => a.charAt(0).toUpperCase() + a.slice(1)).join(', ');
});
</script>

<template>
  <div class="admin-tab active">
    <div class="crear-steps">
      <div class="cstep done" data-step="1">
        <span class="cstep-num"><i class="ti ti-check"></i></span><span class="cstep-lbl">Información</span>
      </div>
      <div class="cstep-line"></div>
      <div class="cstep active" data-step="2">
        <span class="cstep-num">2</span><span class="cstep-lbl">Audiencia</span>
      </div>
      <div class="cstep-line"></div>
      <div class="cstep" data-step="3">
        <span class="cstep-num">3</span><span class="cstep-lbl">Preguntas</span>
      </div>
      <div class="cstep-line"></div>
      <div class="cstep" data-step="4">
        <span class="cstep-num">4</span><span class="cstep-lbl">Revisión</span>
      </div>
    </div>

    <div class="crear-layout">
      <div class="crear-main">
        <!-- Información general -->
        <div class="crear-card">
          <div class="crear-card-hd">
            <i class="ti ti-info-circle"></i> {{ $t('admin.create.generalInfo') }}
          </div>
          <div class="field-group">
            <label class="field-label">{{ $t('admin.create.title') }} <span class="req">*</span></label>
            <input type="text" class="field-input" :class="{ error: errors.title }" v-model="title" :placeholder="$t('admin.create.titlePh')" @input="errors.title = ''" />
            <span class="field-error" v-if="errors.title">{{ errors.title }}</span>
          </div>
          <div class="field-group">
            <label class="field-label">{{ $t('admin.create.desc') }}</label>
            <textarea class="field-input" rows="3" v-model="description" :placeholder="$t('admin.create.descPh')"></textarea>
          </div>
          <div class="field-row-2">
            <div class="field-group">
              <label class="field-label">{{ $t('admin.create.start') }} <span class="req">*</span></label>
              <input type="date" class="field-input" :class="{ error: errors.startDate }" v-model="startDate" @change="errors.startDate = ''" />
              <span class="field-error" v-if="errors.startDate">{{ errors.startDate }}</span>
            </div>
            <div class="field-group">
              <label class="field-label">{{ $t('admin.create.end') }} <span class="req">*</span></label>
              <input type="date" class="field-input" :class="{ error: errors.dueDate }" v-model="dueDate" @change="errors.dueDate = ''" />
              <span class="field-error" v-if="errors.dueDate">{{ errors.dueDate }}</span>
            </div>
          </div>
        </div>

        <!-- Audiencia -->
        <div class="crear-card">
          <div class="crear-card-hd">
            <i class="ti ti-users"></i> {{ $t('admin.create.targetAudience') }}
          </div>
          <span class="field-error" v-if="errors.audience">{{ errors.audience }}</span>
          <div class="audience-grid">
            <div class="aud-opt" :class="{ selected: isAudSelected('estudiantes') }" @click="toggleAudience('estudiantes')">
              <div class="aud-icon"><i class="ti ti-school"></i></div>
              <div>
                <div class="aud-title">{{ $t('admin.create.studentsTitle') }}</div>
                <div class="aud-sub">{{ $t('admin.create.studentsSub') }}</div>
              </div>
            </div>
            <div class="aud-opt" :class="{ selected: isAudSelected('docentes') }" @click="toggleAudience('docentes')">
              <div class="aud-icon"><i class="ti ti-chalkboard"></i></div>
              <div>
                <div class="aud-title">{{ $t('admin.create.teachersTitle') }}</div>
                <div class="aud-sub">{{ $t('admin.create.teachersSub') }}</div>
              </div>
            </div>
            <div class="aud-opt" :class="{ selected: isAudSelected('administrativo') }" @click="toggleAudience('administrativo')">
              <div class="aud-icon"><i class="ti ti-briefcase"></i></div>
              <div>
                <div class="aud-title">{{ $t('admin.create.staffTitle') }}</div>
                <div class="aud-sub">{{ $t('admin.create.staffSub') }}</div>
              </div>
            </div>
            <div class="aud-opt" :class="{ selected: isAudSelected('todos') }" @click="toggleAudience('todos')">
              <div class="aud-icon"><i class="ti ti-users-group"></i></div>
              <div>
                <div class="aud-title">{{ $t('admin.create.allTitle') }}</div>
                <div class="aud-sub">{{ $t('admin.create.allSub') }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Preguntas -->
        <div class="crear-card">
          <div class="crear-card-hd" style="justify-content: space-between">
            <span><i class="ti ti-list-check"></i> {{ $t('admin.create.questionsTab') }}</span>
            <span class="badge-count">{{ questions.length }}</span>
          </div>
          <span class="field-error" v-if="errors.questions">{{ errors.questions }}</span>
          
          <div id="questions-list">
            <div class="q-builder" v-for="(q, idx) in questions" :key="idx">
              <div class="q-builder-head">
                <i class="ti ti-grip-vertical q-drag-handle"></i>
                <div class="q-num-badge">{{ idx + 1 }}</div>
                <input class="q-title-field" type="text" :placeholder="$t('admin.create.titlePh')" v-model="q.title" />
                <select class="q-type-sel" v-model="q.type">
                  <option value="multiple">{{ $t('admin.create.typeMultiple') }}</option>
                  <option value="yesno">{{ $t('admin.create.typeYesNo') }}</option>
                  <option value="scale">{{ $t('admin.create.typeScale') }}</option>
                  <option value="text">{{ $t('admin.create.typeText') }}</option>
                </select>
                <label class="q-oblig-label">
                  <input type="checkbox" v-model="q.required" /> {{ $t('admin.create.required') }}
                </label>
              </div>
              <div class="q-builder-body">
                <!-- Multiple -->
                <template v-if="q.type === 'multiple'">
                  <div class="opts-builder">
                    <div class="opt-builder-row" v-for="(opt, oIdx) in q.options" :key="oIdx">
                      <div class="opt-dot"></div>
                      <input class="opt-builder-input" type="text" v-model="q.options[oIdx]" />
                      <button class="opt-del-btn" type="button" @click="delOpt(q, oIdx)"><i class="ti ti-x"></i></button>
                    </div>
                  </div>
                  <button class="add-opt-btn" type="button" @click="addOpt(q)"><i class="ti ti-plus"></i> {{ $t('admin.create.addOption') }}</button>
                </template>
                <!-- Yes/No -->
                <template v-else-if="q.type === 'yesno'">
                  <div style="display:flex;gap:10px;">
                    <div style="flex:1;padding:10px;text-align:center;background:var(--success-bg);border:1px solid var(--success-border);border-radius:var(--radius-md);font-size:13px;font-weight:500;color:var(--success);">{{ $t('admin.create.yes') }}</div>
                    <div style="flex:1;padding:10px;text-align:center;background:var(--danger-bg);border:1px solid var(--danger-border);border-radius:var(--radius-md);font-size:13px;font-weight:500;color:var(--danger);">{{ $t('admin.create.no') }}</div>
                  </div>
                </template>
                <!-- Scale -->
                <template v-else-if="q.type === 'scale'">
                  <div style="display:flex;gap:8px;">
                    <div v-for="n in 5" :key="n" style="flex:1;text-align:center;padding:9px 0;border:1px solid var(--border);border-radius:var(--radius-md);font-size:14px;font-weight:500;color:var(--text-2);">{{ n }}</div>
                  </div>
                  <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--text-3);margin-top:4px;padding:0 2px;">
                    <span>{{ $t('admin.create.bad') }}</span><span>{{ $t('admin.create.excellent') }}</span>
                  </div>
                </template>
                <!-- Text -->
                <template v-else-if="q.type === 'text'">
                  <textarea class="field-input" rows="2" :placeholder="$t('admin.create.textPh')" readonly style="background:var(--bg);cursor:default;"></textarea>
                </template>
              </div>
              <div class="q-builder-foot">
                <button class="icon-btn btn-dup-q" type="button" @click="duplicateQ(idx)">
                  <i class="ti ti-copy"></i> {{ $t('admin.create.duplicate') }}
                </button>
                <button class="icon-btn danger btn-del-q" type="button" @click="delQ(idx)">
                  <i class="ti ti-trash"></i> {{ $t('admin.create.delete') }}
                </button>
              </div>
            </div>
          </div>
          
          <button class="add-q-btn" type="button" @click="addQuestion">
            <i class="ti ti-plus"></i> {{ $t('admin.create.addQuestion') }}
          </button>
        </div>
      </div>

      <div class="crear-side">
        <!-- Preview -->
        <div class="preview-card">
          <div class="preview-banner" :style="coverImage ? `background-image: url(${coverImage}); background-size: cover; background-position: center;` : ''">
            <i class="ti ti-clipboard-list" style="font-size: 38px; opacity: 0.3; color: #fff" v-if="!coverImage"></i>
            <div class="preview-banner-change" role="button" tabindex="0" @click="triggerFileInput">
              <i class="ti ti-photo"></i> {{ $t('admin.create.changeImage') }}
            </div>
          </div>
          <div class="preview-body">
            <p class="preview-lbl">{{ $t('admin.create.preview') }}</p>
            <p class="preview-title">{{ title || $t('admin.create.title') }}</p>
            <p class="preview-desc">{{ description || $t('admin.create.descPh') }}</p>
            <div class="preview-tags">
              <span class="ptag blue"><i class="ti ti-users"></i> {{ audienceLabel }}</span>
              <span class="ptag green"><i class="ti ti-list-check"></i> {{ questions.length }}</span>
            </div>
          </div>
        </div>

        <div class="config-box">
          <div class="config-box-hd">
            <i class="ti ti-adjustments"></i> {{ $t('admin.create.settings') }}
          </div>
          <div class="toggle-item">
            <div>
              <div class="tgl-lbl">{{ $t('admin.create.anon') }}</div>
              <div class="tgl-sub">{{ $t('admin.create.anonSub') }}</div>
            </div>
            <div class="tgl-switch" :class="{ on: toggles.anonima }" @click="toggles.anonima = !toggles.anonima"></div>
          </div>
          <div class="toggle-item">
            <div>
              <div class="tgl-lbl">{{ $t('admin.create.singleResponse') }}</div>
              <div class="tgl-sub">{{ $t('admin.create.singleResponseSub') }}</div>
            </div>
            <div class="tgl-switch" :class="{ on: toggles.unica }" @click="toggles.unica = !toggles.unica"></div>
          </div>
          <div class="toggle-item">
            <div>
              <div class="tgl-lbl">{{ $t('admin.create.showResults') }}</div>
              <div class="tgl-sub">{{ $t('admin.create.showResultsSub') }}</div>
            </div>
            <div class="tgl-switch" :class="{ on: toggles.resultados }" @click="toggles.resultados = !toggles.resultados"></div>
          </div>
          <div class="toggle-item">
            <div>
              <div class="tgl-lbl">{{ $t('admin.create.notify') }}</div>
              <div class="tgl-sub">{{ $t('admin.create.notifySub') }}</div>
            </div>
            <div class="tgl-switch" :class="{ on: toggles.notificar }" @click="toggles.notificar = !toggles.notificar"></div>
          </div>
          <div class="toggle-item">
            <div>
              <div class="tgl-lbl">{{ $t('admin.create.reminder') }}</div>
              <div class="tgl-sub">{{ $t('admin.create.reminderSub') }}</div>
            </div>
            <div class="tgl-switch" :class="{ on: toggles.recordatorio }" @click="toggles.recordatorio = !toggles.recordatorio"></div>
          </div>
        </div>

        <div class="config-box">
          <div class="config-box-hd">
            <i class="ti ti-photo"></i> {{ $t('admin.create.coverImage') }}
          </div>
          <div class="img-upload-area" role="button" tabindex="0" @click="triggerFileInput" v-if="!coverImage">
            <i class="ti ti-cloud-upload"></i>
            <p>{{ $t('admin.create.uploadHint') }}</p>
            <p class="img-upload-hint">{{ $t('admin.create.uploadFormat') }}</p>
          </div>
          <div v-else style="padding: 10px; border: 1px solid var(--border); border-radius: var(--radius-md); text-align: center;">
            <img :src="coverImage" style="width: 100%; height: 120px; object-fit: cover; border-radius: 6px; margin-bottom: 10px;" />
            <div style="display: flex; gap: 8px;">
              <button class="btn btn-outline btn-sm" style="flex: 1;" @click="triggerFileInput">Cambiar</button>
              <button class="btn btn-outline btn-sm" style="flex: 1; color: var(--danger); border-color: var(--danger)" @click="coverImage = null">Eliminar</button>
            </div>
          </div>
          
          <!-- Hidden File Input -->
          <input type="file" ref="fileInput" accept="image/*" style="display: none;" @change="handleFileUpload" />
        </div>

        <div class="crear-actions">
          <button class="btn btn-outline btn-full" @click="handleDraft">
            <i class="ti ti-device-floppy"></i> {{ $t('common.saveDraft') }}
          </button>
          <button class="btn btn-primary btn-full" @click="handlePublish">
            <i class="ti ti-send"></i> {{ $t('common.publish') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
