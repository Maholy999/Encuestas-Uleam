<script setup>
import { computed } from 'vue';
import { store, showToast, deleteSurvey } from '../../store';
import { useI18n } from 'vue-i18n';
import ProgressBar from '../../components/ProgressBar.vue';
import StatusBadge from '../../components/StatusBadge.vue';

const emit = defineEmits(['ver-todas', 'edit']);

const facData = [
  { fac: 'Ciencias Informáticas', encuestas: 3, pct: 91, responses: 1240 },
  { fac: 'Medicina',              encuestas: 2, pct: 78, responses: 980  },
  { fac: 'Derecho',               encuestas: 2, pct: 64, responses: 720  },
  { fac: 'Cs. Administrativas',   encuestas: 2, pct: 55, responses: 610  },
  { fac: 'Arquitectura',          encuestas: 1, pct: 47, responses: 380  },
  { fac: 'Enfermería',            encuestas: 1, pct: 38, responses: 290  },
];

const tipoData = [
  { label: 'Estudiantes (~15,000)',         responded: 8240,  total: 15000, cls: '' },
  { label: 'Docentes (~1,800)',             responded: 1240,  total: 1800,  cls: 'purple' },
  { label: 'Personal administrativo (~800)',responded: 367,   total: 800,   cls: 'gold' },
];

const recentSurveys = computed(() => store.adminEncuestas.slice(0, 5));
const { t } = useI18n();

const handleEdit = (id) => emit('edit', id);
const handleDup = (srcId) => {
  const src = store.adminEncuestas.find(e => e.id === srcId);
  if (!src) return;
  const copy = { ...src, id: Date.now(), title: `Copia de ${src.title}`, status: 'draft', responses: 0 };
  store.adminEncuestas.push(copy);
  showToast(`Encuesta duplicada: "${copy.title}"`);
};
const handleDel = (id) => {
  if (confirm('¿Está seguro de que desea eliminar esta encuesta?')) {
    deleteSurvey(id);
    showToast('Encuesta eliminada correctamente', 'success');
  }
};
</script>

<template>
  <div class="admin-tab active">
    <div class="dash-body">
      <!-- KPIs -->
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-icon blue"><i class="ti ti-clipboard-list"></i></div>
          <div class="kpi-num">12</div>
          <div class="kpi-lbl">{{ $t('admin.dashboard.activeSurveys') }}</div>
          <div class="kpi-delta up"><i class="ti ti-trending-up"></i> {{ $t('admin.dashboard.thisMonth') }}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon green"><i class="ti ti-check"></i></div>
          <div class="kpi-num">2,847</div>
          <div class="kpi-lbl">{{ $t('admin.dashboard.totalResponses') }}</div>
          <div class="kpi-delta up"><i class="ti ti-trending-up"></i> {{ $t('admin.dashboard.thisWeek') }}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon purple"><i class="ti ti-percent"></i></div>
          <div class="kpi-num">68%</div>
          <div class="kpi-lbl">{{ $t('admin.dashboard.responseRate') }}</div>
          <div class="kpi-delta up"><i class="ti ti-trending-up"></i> {{ $t('admin.dashboard.vsPrev') }}</div>
        </div>
        <div class="kpi-card warn">
          <div class="kpi-icon orange"><i class="ti ti-bell-ringing"></i></div>
          <div class="kpi-num">3</div>
          <div class="kpi-lbl">{{ $t('admin.dashboard.closingSoon') }}</div>
          <div class="kpi-delta down"><i class="ti ti-send"></i> {{ $t('admin.dashboard.remindersSent') }}</div>
        </div>
      </div>

      <!-- Tipo pills -->
      <div class="tipo-row">
        <div class="tipo-pill blue"><i class="ti ti-school"></i><div><div class="tipo-num">8</div><div class="tipo-lbl">{{ $t('admin.dashboard.students') }}</div></div></div>
        <div class="tipo-pill purple"><i class="ti ti-chalkboard"></i><div><div class="tipo-num">3</div><div class="tipo-lbl">{{ $t('admin.dashboard.teachers') }}</div></div></div>
        <div class="tipo-pill green"><i class="ti ti-briefcase"></i><div><div class="tipo-num">1</div><div class="tipo-lbl">{{ $t('admin.dashboard.staff') }}</div></div></div>
      </div>

      <div class="dash-two-col">
        <!-- Bars -->
        <div class="dash-panel">
          <div class="dash-panel-hd"><h3><i class="ti ti-building-community"></i> {{ $t('admin.dashboard.participationFaculty') }}</h3></div>
          <div>
            <div class="bar-row" v-for="d in facData" :key="d.fac">
              <div class="bar-meta"><span>{{ d.fac }}</span><span class="bar-val">{{ d.pct }}% · {{ d.responses }} resp.</span></div>
              <div class="bar-sub">{{ d.encuestas }} activa(s)</div>
              <ProgressBar :pct="d.pct" />
            </div>
          </div>
        </div>
        <div class="dash-panel">
          <div class="dash-panel-hd"><h3><i class="ti ti-users"></i> {{ $t('admin.dashboard.participationType') }}</h3></div>
          <div>
            <div class="bar-row" v-for="d in tipoData" :key="d.label">
              <div class="bar-meta"><span>{{ d.label }}</span><span class="bar-val">{{ Math.round((d.responded/d.total)*100) }}%</span></div>
              <div class="bar-sub">{{ d.responded }} / {{ d.total }}</div>
              <ProgressBar :pct="Math.round((d.responded/d.total)*100)" :cls="d.cls" />
            </div>
          </div>
          <div class="auto-reminder-box">
            <div class="auto-reminder-icon"><i class="ti ti-bell-ringing"></i></div>
            <div><p class="auto-reminder-title">{{ $t('admin.dashboard.reminderActive') }}</p><p class="auto-reminder-sub">{{ $t('admin.dashboard.reminderDesc') }}</p></div>
          </div>
        </div>
      </div>

      <!-- Table -->
      <div class="dash-panel" style="margin-top: 12px">
        <div class="dash-panel-hd">
          <h3><i class="ti ti-list"></i> {{ $t('admin.dashboard.recentSurveys') }}</h3>
          <button class="link-ver-todas" @click="emit('ver-todas')">{{ $t('common.viewAll') }} <i class="ti ti-arrow-right"></i></button>
        </div>
        <div class="enc-table-wrap">
          <table class="enc-table">
            <thead><tr><th>{{ $t('admin.surveys.colSurvey') }}</th><th>{{ $t('admin.surveys.colTarget') }}</th><th>{{ $t('admin.surveys.colStatus') }}</th><th>{{ $t('admin.surveys.colResponses') }}</th><th>{{ $t('admin.surveys.colClose') }}</th><th>{{ $t('admin.surveys.colActions') }}</th></tr></thead>
            <tbody>
              <tr v-for="s in recentSurveys" :key="s.id">
                <td style="font-weight:500;">{{ s.title }}</td>
                <td><span class="pill" :class="s.audienceType">{{ s.audience }}</span></td>
                <td><StatusBadge :status="s.status" /></td>
                <td>{{ s.status !== 'draft' ? `${s.responses} / ${s.total}` : '—' }}</td>
                <td>{{ s.dueDate }}</td>
                <td>
                  <div class="action-btns">
                    <button class="icon-btn btn-edit" @click="handleEdit(s.id)"><i class="ti ti-edit"></i></button>
                    <button class="icon-btn btn-dup" @click="handleDup(s.id)"><i class="ti ti-copy"></i></button>
                    <button class="icon-btn danger btn-delete" @click="handleDel(s.id)"><i class="ti ti-trash"></i></button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>
