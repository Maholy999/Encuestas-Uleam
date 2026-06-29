<script setup>
import { computed } from 'vue';
import { store } from './store';
import LoginView from './views/LoginView.vue';
import HomeView from './views/HomeView.vue';
import AdminView from './views/AdminView.vue';
import SurveyView from './views/SurveyView.vue';
import Toast from './components/Toast.vue';

const currentComponent = computed(() => {
  switch (store.currentView) {
    case 'login': return LoginView;
    case 'home': return HomeView;
    case 'admin': return AdminView;
    case 'survey': return SurveyView;
    default: return LoginView;
  }
});
</script>

<template>
  <component :is="currentComponent" />
  <Toast />
</template>
