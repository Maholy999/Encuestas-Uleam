<script setup>
import { computed } from 'vue';
import { store } from '../store';

const toast = computed(() => store.toast);
</script>

<template>
  <div 
    id="toast" 
    class="toast" 
    :class="{ hidden: !toast.visible, 'toast-error': toast.type === 'error' }"
  >
    <i class="ti" :class="toast.type === 'error' ? 'ti-alert-circle' : 'ti-check'"></i>
    {{ toast.message }}
  </div>
</template>

<style scoped>
.toast {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: var(--success);
  color: white;
  padding: 12px 24px;
  border-radius: var(--radius-md);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 500;
  z-index: 9999;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  transform: translateY(0);
  opacity: 1;
}
.toast.hidden {
  transform: translateY(100px);
  opacity: 0;
  pointer-events: none;
}
.toast-error {
  background: var(--danger);
}
</style>
