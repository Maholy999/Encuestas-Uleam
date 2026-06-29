<script setup>
import { ref, computed } from 'vue';
import { store, logoutUser } from '../store';
import SurveyCard from '../components/SurveyCard.vue';

const activeTab = ref('inicio'); // 'inicio' or 'historial'

const pendingCount = computed(() => store.pendingEncuestas.length);
const doneCount = computed(() => store.respondedEncuestas.length);
const total = computed(() => pendingCount.value + doneCount.value);
const pct = computed(() => total.value > 0 ? Math.round((doneCount.value / total.value) * 100) : 0);

const iconMap = { student: 'ti-school', teacher: 'ti-chalkboard', worker: 'ti-briefcase', sysadmin: 'ti-settings' };

const handleLogout = () => {
  logoutUser();
};

const handleRespond = (survey) => {
  store.surveyInProgress = survey;
  store.currentView = 'survey';
};
</script>

<template>
  <div id="screen-home" class="screen active">
    <header class="app-topbar">
      <div class="topbar-left">
        <div class="logo-mark sm"><i class="ti ti-school"></i></div>
        <span class="topbar-name">ULEAM Encuestas</span>
      </div>
      <div class="topbar-right">
        <span class="topbar-greeting">Bienvenido, {{ store.currentUser?.name?.split(' ')[0] }}</span>
        <button class="btn-icon-top" @click="handleLogout" aria-label="Cerrar sesión">
          <i class="ti ti-logout"></i>
        </button>
      </div>
    </header>

    <div class="home-hero">
      <div class="hero-deco d1"></div>
      <div class="hero-deco d2"></div>
      <div class="hero-content">
        <span class="hero-role-badge">
          <i class="ti" :class="iconMap[store.currentUser?.role] || 'ti-user'"></i>
          {{ store.currentUser?.roleLabel }}
        </span>
        <h1>Tus encuestas pendientes</h1>
      </div>
    </div>

    <div class="home-body">
      <div class="stats-row">
        <div class="stat-chip">
          <span class="stat-num">{{ pendingCount }}</span><span class="stat-lbl">Pendientes</span>
        </div>
        <div class="stat-chip">
          <span class="stat-num">{{ doneCount }}</span><span class="stat-lbl">Respondidas</span>
        </div>
        <div class="stat-chip">
          <span class="stat-num">{{ pct }}%</span><span class="stat-lbl">Completado</span>
        </div>
      </div>

      <div v-show="activeTab === 'inicio'">
        <p class="section-label">Encuestas disponibles</p>
        <div class="encuestas-list" v-if="pendingCount > 0">
          <SurveyCard
            v-for="enc in store.pendingEncuestas"
            :key="enc.id"
            :survey="enc"
            :isResponded="false"
            @respond="handleRespond"
          />
        </div>
        <div v-else style="text-align:center;padding:2.5rem 1rem;color:var(--text-3);">
          <i class="ti ti-clipboard-check" style="font-size:44px;display:block;margin-bottom:12px;color:var(--success);opacity:.6;"></i>
          <strong style="display:block;margin-bottom:4px;color:var(--text-2);">¡Todo al día!</strong>
          No tienes encuestas pendientes por el momento.
        </div>
      </div>

      <div v-show="activeTab === 'historial'">
        <p class="section-label">Encuestas respondidas</p>
        <div class="encuestas-list" v-if="doneCount > 0">
          <SurveyCard
            v-for="enc in store.respondedEncuestas"
            :key="enc.id"
            :survey="enc"
            :isResponded="true"
          />
        </div>
        <div v-else style="text-align:center;padding:2rem;color:var(--text-3);">
          Aún no has respondido ninguna encuesta.
        </div>
      </div>
    </div>

    <nav class="bottom-nav" aria-label="Navegación">
      <button class="nav-item" :class="{ active: activeTab === 'inicio' }" @click="activeTab = 'inicio'">
        <i class="ti ti-home"></i><span>Inicio</span>
      </button>
      <button class="nav-item" :class="{ active: activeTab === 'historial' }" @click="activeTab = 'historial'">
        <i class="ti ti-history"></i><span>Historial</span>
      </button>
    </nav>
  </div>
</template>
