<script setup lang="ts">
import { ACCOUNT_COLORS, type Account } from '~/composables/useAuthenticator'

const props = defineProps<{
  account: Account
}>()

const emit = defineEmits<{
  delete: [id: string]
}>()

const { generateCode, getTimeRemaining, updateAccount } = useAuthenticator()
const toast = useToast()

const code = ref('')
const remaining = ref(0)
const copied = ref(false)
const showColorPicker = ref(false)

function updateCode() {
  code.value = generateCode(props.account)
  remaining.value = getTimeRemaining(props.account.period)
}

const formattedCode = computed(() => {
  const c = code.value
  if (c.length === 6) return `${c.slice(0, 3)} ${c.slice(3)}`
  if (c.length === 8) return `${c.slice(0, 4)} ${c.slice(4)}`
  return c
})

const gradientClass = computed(() => {
  const found = ACCOUNT_COLORS.find(c => c.value === props.account.color)
  return found ? found.gradient : ACCOUNT_COLORS[0].gradient
})

function copyCode() {
  navigator.clipboard.writeText(code.value)
  copied.value = true
  toast.add({ title: 'Copied!', description: `${props.account.issuer} code copied`, color: 'success', duration: 1500 })
  setTimeout(() => { copied.value = false }, 1500)
}

function handleColorChange(color: string) {
  updateAccount(props.account.id, { color: color as any })
  showColorPicker.value = false
}

let timer: ReturnType<typeof setInterval>

onMounted(() => {
  updateCode()
  timer = setInterval(updateCode, 1000)
})

onUnmounted(() => {
  clearInterval(timer)
})
</script>

<template>
  <div
    class="group relative flex items-center gap-3 p-3 mx-1 rounded-2xl cursor-pointer transition-all duration-200 hover:bg-gray-100/80 dark:hover:bg-white/5 active:scale-[0.98]"
    :class="copied && 'bg-primary/5 dark:bg-primary/10'"
    @click="copyCode"
  >
    <!-- Avatar (click to change color) -->
    <div class="relative">
      <div
        class="flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br text-white font-bold text-sm shrink-0 shadow-sm transition-transform group-hover:scale-105"
        :class="gradientClass"
        @click.stop="showColorPicker = !showColorPicker"
      >
        {{ account.issuer.slice(0, 2).toUpperCase() }}
      </div>
      <!-- Color dot indicator on hover -->
      <div class="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-background flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <UIcon name="i-lucide-palette" class="w-2.5 h-2.5 text-dimmed" />
      </div>
    </div>

    <!-- Color Picker Popover -->
    <Transition name="pop">
      <div
        v-if="showColorPicker"
        class="absolute left-2 top-16 z-20 bg-background border border-default rounded-xl shadow-xl p-3"
        @click.stop
      >
        <p class="text-[10px] font-semibold text-dimmed uppercase tracking-wider mb-2">Color</p>
        <div class="flex flex-wrap gap-1.5 w-44">
          <button
            v-for="color in ACCOUNT_COLORS"
            :key="color.value"
            type="button"
            class="relative w-7 h-7 rounded-lg bg-gradient-to-br transition-all duration-150 hover:scale-110"
            :class="[
              color.gradient,
              account.color === color.value ? 'ring-2 ring-offset-2 ring-offset-background ring-current scale-110' : 'opacity-60 hover:opacity-100'
            ]"
            :title="color.name"
            @click="handleColorChange(color.value)"
          >
            <UIcon
              v-if="account.color === color.value"
              name="i-lucide-check"
              class="w-3.5 h-3.5 text-white absolute inset-0 m-auto"
            />
          </button>
        </div>
      </div>
    </Transition>

    <!-- Info -->
    <div class="flex-1 min-w-0">
      <div class="flex items-center gap-1.5 mb-0.5">
        <span class="text-xs font-semibold text-muted truncate tracking-wide">{{ account.issuer }}</span>
        <span v-if="account.label && account.label !== account.issuer" class="text-[10px] text-dimmed truncate opacity-0 group-hover:opacity-100 transition-opacity">{{ account.label }}</span>
      </div>
      <div class="flex items-center gap-2">
        <span
          :key="code"
          class="text-[22px] font-mono font-extrabold tracking-[0.15em] tabular-nums animate-slide-up"
          :class="remaining <= 5 ? 'text-red-500' : ''"
        >
          {{ formattedCode }}
        </span>
        <Transition name="fade" mode="out-in">
          <UIcon
            v-if="copied"
            name="i-lucide-check"
            class="w-4 h-4 text-green-500"
          />
          <UIcon
            v-else
            name="i-lucide-copy"
            class="w-3.5 h-3.5 opacity-0 group-hover:opacity-40 transition-opacity"
          />
        </Transition>
      </div>
    </div>

    <!-- Timer -->
    <CountdownRing :remaining="remaining" :total="account.period" />

    <!-- Delete -->
    <UButton
      icon="i-lucide-trash-2"
      variant="ghost"
      color="error"
      size="2xs"
      class="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-70 hover:!opacity-100 transition-opacity rounded-lg"
      @click.stop="emit('delete', account.id)"
    />
  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
.pop-enter-active { transition: all 0.2s ease-out; }
.pop-leave-active { transition: all 0.15s ease-in; }
.pop-enter-from { opacity: 0; transform: scale(0.9) translateY(-4px); }
.pop-leave-to { opacity: 0; transform: scale(0.9) translateY(-4px); }
</style>
