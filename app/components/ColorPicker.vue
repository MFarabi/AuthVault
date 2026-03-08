<script setup lang="ts">
import { ACCOUNT_COLORS, type AccountColor } from '~/composables/useAuthenticator'

const selected = defineModel<AccountColor>({ default: 'indigo' })
</script>

<template>
  <div class="flex flex-wrap gap-2">
    <button
      v-for="color in ACCOUNT_COLORS"
      :key="color.value"
      type="button"
      class="relative w-7 h-7 rounded-lg bg-gradient-to-br transition-all duration-150 hover:scale-110"
      :class="[
        color.gradient,
        selected === color.value ? 'ring-2 ring-offset-2 ring-offset-background ring-current scale-110' : 'opacity-70 hover:opacity-100'
      ]"
      :title="color.name"
      @click="selected = color.value"
    >
      <Transition name="pop">
        <UIcon
          v-if="selected === color.value"
          name="i-lucide-check"
          class="w-3.5 h-3.5 text-white absolute inset-0 m-auto"
        />
      </Transition>
    </button>
  </div>
</template>

<style scoped>
.pop-enter-active { transition: all 0.15s ease-out; }
.pop-leave-active { transition: all 0.1s ease-in; }
.pop-enter-from { opacity: 0; transform: scale(0.5); }
.pop-leave-to { opacity: 0; transform: scale(0.5); }
</style>
