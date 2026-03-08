<script setup lang="ts">
const props = defineProps<{
  remaining: number
  total: number
}>()

const progress = computed(() => props.remaining / props.total)
const circumference = 2 * Math.PI * 15
const dashOffset = computed(() => circumference * (1 - progress.value))
const isUrgent = computed(() => props.remaining <= 5)
</script>

<template>
  <div class="relative inline-flex items-center justify-center w-11 h-11 shrink-0">
    <svg class="w-11 h-11 -rotate-90" viewBox="0 0 36 36">
      <!-- Track -->
      <circle
        cx="18"
        cy="18"
        r="15"
        fill="none"
        stroke="currentColor"
        stroke-width="2.5"
        class="text-gray-100 dark:text-gray-800"
      />
      <!-- Progress -->
      <circle
        cx="18"
        cy="18"
        r="15"
        fill="none"
        stroke="currentColor"
        stroke-width="2.5"
        stroke-linecap="round"
        class="transition-all duration-1000 ease-linear"
        :class="isUrgent ? 'text-red-500 drop-shadow-[0_0_4px_rgba(239,68,68,0.4)]' : 'text-indigo-500 dark:text-indigo-400'"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="dashOffset"
      />
    </svg>
    <span
      class="absolute text-xs font-bold tabular-nums transition-colors duration-300"
      :class="[
        isUrgent ? 'text-red-500 animate-pulse-urgent' : 'text-muted'
      ]"
    >
      {{ remaining }}
    </span>
  </div>
</template>
