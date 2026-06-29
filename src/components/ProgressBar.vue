<script setup>
defineProps({ pct: Number, cls: { type: String, default: '' } });
</script>
<template>
  <div class="bar-track">
    <div class="bar-fill" :class="cls" :style="{ width: Math.min(pct, 100) + '%' }"></div>
  </div>
</template>
