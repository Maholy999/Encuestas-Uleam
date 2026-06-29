<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const props = defineProps({ status: String });
const { t } = useI18n();

const mapped = computed(() => {
  const map = {
    active:   { label: t('admin.surveys.active'),     dot: '●' },
    draft:    { label: t('admin.surveys.draft'),   dot: '○' },
    closed:   { label: t('admin.surveys.closed'),    dot: '✕' },
    finished: { label: t('admin.surveys.finished'), dot: '✔' },
  };
  return map[props.status] || map.draft;
});
</script>
<template>
  <span class="status-badge" :class="status">{{ mapped.dot }} {{ mapped.label }}</span>
</template>
