<script setup>
defineProps({
  survey: Object,
  isResponded: Boolean
});
const emit = defineEmits(['respond']);
</script>

<template>
  <article class="enc-card" :class="{ responded: isResponded }" :aria-label="survey.title">
    <div class="enc-card-banner" :class="survey.color || survey.audienceType">
      <i class="ti" :class="survey.icon || 'ti-clipboard-list'" aria-hidden="true"></i>
      <div class="enc-card-tag">{{ survey.audienceLabel || survey.audience }}</div>
    </div>
    <div class="enc-card-body">
      <h3 class="enc-card-title">{{ survey.title }}</h3>
      <p class="enc-card-desc">{{ survey.description || '' }}</p>
      <div class="enc-card-meta">
        <span class="meta-item"><i class="ti ti-clock" aria-hidden="true"></i> {{ survey.duration || 'N/A' }}</span>
        <span class="meta-item"><i class="ti ti-calendar-due" aria-hidden="true"></i> Vence {{ survey.dueDate }}</span>
        <button class="enc-card-btn" :disabled="isResponded" @click="emit('respond', survey)">
          <template v-if="isResponded">
            <i class="ti ti-check" aria-hidden="true"></i> Respondida
          </template>
          <template v-else>
            Responder <i class="ti ti-arrow-right" aria-hidden="true"></i>
          </template>
        </button>
      </div>
    </div>
  </article>
</template>
