<script setup>
import { ref } from 'vue';
import { logoutUser } from '../store';
import AdminDashboard from './admin/AdminDashboard.vue';
import AdminEncuestas from './admin/AdminEncuestas.vue';
import AdminConfig from './admin/AdminConfig.vue';
import AdminCrear from './admin/AdminCrear.vue';

import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const activeTab = ref('dashboard');
const editId = ref(null);
const { t } = useI18n();

const handleLogout = () => {
  logoutUser();
};

const openCrear = () => {
  editId.value = null;
  activeTab.value = 'crear';
};

const openEdit = (id) => {
  editId.value = id;
  activeTab.value = 'crear';
};

const titles = computed(() => ({
  dashboard: t('common.dashboard'),
  encuestas: t('common.surveys'),
  crear: editId.value ? t('common.edit') : t('common.newSurvey'),
  configuracion: t('common.settings')
}));
</script>

<template>
  <div id="screen-admin" class="screen active">
    <div class="admin-layout">
      <aside class="admin-sidebar" aria-label="Menú administración">
        <div class="sb-top">
          <div class="logo-mark sm"><i class="ti ti-school"></i></div>
          <div class="sb-brand">
            <span class="sb-name">Encuestas ULEAM</span>
            <span class="sb-sub">Administración</span>
          </div>
        </div>
        <nav class="sb-nav">
          <span class="sb-sec-lbl">{{ $t('admin.sidebar.main') }}</span>
          <button class="sb-link" :class="{ active: activeTab === 'dashboard' }" @click="activeTab = 'dashboard'">
            <i class="ti ti-layout-dashboard"></i><span>{{ $t('common.dashboard') }}</span>
          </button>
          <button class="sb-link" :class="{ active: activeTab === 'encuestas' }" @click="activeTab = 'encuestas'">
            <i class="ti ti-clipboard-list"></i><span>{{ $t('common.surveys') }}</span>
          </button>
          <span class="sb-sec-lbl">{{ $t('admin.sidebar.system') }}</span>
          <button class="sb-link" :class="{ active: activeTab === 'configuracion' }" @click="activeTab = 'configuracion'">
            <i class="ti ti-settings"></i><span>{{ $t('common.settings') }}</span>
          </button>
        </nav>
        <button class="sb-logout" @click="handleLogout">
          <i class="ti ti-logout"></i><span>{{ $t('admin.sidebar.logout') }}</span>
        </button>
      </aside>

      <main class="admin-main">
        <div class="admin-topbar">
          <h2 class="admin-page-title">{{ titles[activeTab] || titles['dashboard'] }}</h2>
          <div id="admin-topbar-actions" v-if="activeTab === 'dashboard' || activeTab === 'encuestas'">
             <button class="btn btn-primary btn-sm" @click="openCrear">
                <i class="ti ti-plus"></i> {{ $t('common.newSurvey') }}
             </button>
          </div>
        </div>

        <AdminDashboard v-if="activeTab === 'dashboard'" @ver-todas="activeTab = 'encuestas'" @edit="openEdit" />
        <AdminEncuestas v-if="activeTab === 'encuestas'" @edit="openEdit" />
        <AdminCrear v-if="activeTab === 'crear'" :edit-id="editId" @saved="activeTab = 'encuestas'" @cancel="activeTab = 'encuestas'" />
        <AdminConfig v-if="activeTab === 'configuracion'" />

      </main>
    </div>
  </div>
</template>
