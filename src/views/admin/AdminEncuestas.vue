<script setup>
import { ref, computed } from 'vue';
import { store, showToast, deleteSurvey } from '../../store';
import { useI18n } from 'vue-i18n';
import StatusBadge from '../../components/StatusBadge.vue';
import { generateSurveyReport } from '../../utils/reportGenerator';

const emit = defineEmits(['edit']);
const { t } = useI18n();

const search = ref('');
const statusFilter = ref('all');
const showDeleteModal = ref(false);
const itemToDelete = ref(null);

const filteredSurveys = computed(() => {
  return store.adminEncuestas.filter(s => {
    const matchText = s.title.toLowerCase().includes(search.value.toLowerCase().trim());
    const matchStatus = statusFilter.value === 'all' || s.status === statusFilter.value;
    return matchText && matchStatus;
  });
});

const canDownload = (status) => status === 'finished' || status === 'active' || status === 'closed';

const handleDownload = (survey) => {
  showToast('Generando reporte...', 'success');
  generateSurveyReport(survey, store.allResponses);
};

const handleEdit = (id) => emit('edit', id);
const handleDup = (srcId) => {
  const src = store.adminEncuestas.find(e => e.id === srcId);
  if (!src) return;
  const copy = { ...src, id: Date.now(), title: `Copia de ${src.title}`, status: 'draft', responses: 0 };
  store.adminEncuestas.push(copy);
  showToast(`Encuesta duplicada: "${copy.title}"`);
};
const confirmDelete = (s) => {
  itemToDelete.value = s;
  showDeleteModal.value = true;
};
const executeDelete = () => {
  if (itemToDelete.value) {
    deleteSurvey(itemToDelete.value.id);
    showToast('Encuesta eliminada correctamente', 'success');
  }
  showDeleteModal.value = false;
  itemToDelete.value = null;
};
</script>

<template>
  <div class="admin-tab active">
    <div class="enc-toolbar">
      <div class="search-wrap">
        <i class="ti ti-search"></i>
        <input type="text" class="field-input search-input" v-model="search" :placeholder="$t('admin.surveys.search')" aria-label="Buscar" />
      </div>
      <select class="field-input sm-sel" v-model="statusFilter" aria-label="Filtrar por estado">
        <option value="all">{{ $t('admin.surveys.allStatuses') }}</option>
        <option value="active">{{ $t('admin.surveys.active') }}</option>
        <option value="draft">{{ $t('admin.surveys.draft') }}</option>
        <option value="closed">{{ $t('admin.surveys.closed') }}</option>
        <option value="finished">{{ $t('admin.surveys.finished') }}</option>
      </select>
    </div>
    
    <div class="enc-table-wrap">
      <table class="enc-table" aria-label="Encuestas">
        <thead>
          <tr><th>{{ $t('admin.surveys.colSurvey') }}</th><th>{{ $t('admin.surveys.colTarget') }}</th><th>{{ $t('admin.surveys.colStatus') }}</th><th>{{ $t('admin.surveys.colResponses') }}</th><th>{{ $t('admin.surveys.colClose') }}</th><th>{{ $t('admin.surveys.colActions') }}</th></tr>
        </thead>
        <tbody>
          <tr v-if="filteredSurveys.length === 0">
             <td colspan="6" style="text-align:center;padding:24px;color:var(--text-3);">No se encontraron encuestas.</td>
          </tr>
          <tr v-for="s in filteredSurveys" :key="s.id">
            <td style="font-weight:500;max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">{{ s.title }}</td>
            <td><span class="pill" :class="s.audienceType">{{ s.audience }}</span></td>
            <td><StatusBadge :status="s.status" /></td>
            <td style="white-space:nowrap;">{{ s.status !== 'draft' ? `${s.responses} / ${s.total}` : '—' }}</td>
            <td style="color:var(--text-3);font-size:12px;white-space:nowrap;">{{ s.dueDate }}</td>
            <td>
              <div class="action-btns">
                <button class="icon-btn btn-edit" @click="handleEdit(s.id)" title="Editar"><i class="ti ti-edit"></i></button>
                <button class="icon-btn btn-dup" @click="handleDup(s.id)" title="Duplicar"><i class="ti ti-copy"></i></button>
                <button v-if="canDownload(s.status)" class="icon-btn btn-download" title="Descargar reporte" @click="handleDownload(s)">
                  <i class="ti ti-download"></i>
                </button>
                <button class="icon-btn danger btn-delete" @click="confirmDelete(s)" title="Eliminar"><i class="ti ti-trash"></i></button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal simple para eliminar -->
    <div v-if="showDeleteModal" class="modal-backdrop" style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:9999;">
      <div class="modal" style="background:var(--bg);padding:24px;border-radius:12px;width:100%;max-width:400px;box-shadow:0 10px 25px rgba(0,0,0,0.1);">
        <h3 style="margin-top:0;">{{ $t('common.delete') }}</h3>
        <p style="color:var(--text-2);margin-top:12px;">¿Está seguro de que desea eliminar "{{ itemToDelete?.title }}"? Esta acción no se puede deshacer.</p>
        <div style="display:flex;gap:12px;margin-top:24px;justify-content:flex-end;">
           <button class="btn btn-outline" @click="showDeleteModal = false">{{ $t('common.cancel') }}</button>
           <button class="btn btn-primary" style="background:var(--danger);border-color:var(--danger);" @click="executeDelete">{{ $t('common.delete') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>
