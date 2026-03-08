<script setup lang="ts">
import type { AccountColor } from '~/composables/useAuthenticator'

const open = defineModel<boolean>('open', { default: false })

const emit = defineEmits<{
  add: [{ issuer: string, label: string, secret: string, color: AccountColor }]
}>()

const issuer = ref('')
const label = ref('')
const secret = ref('')
const color = ref<AccountColor>('indigo')
const error = ref('')

function submit() {
  error.value = ''

  if (!issuer.value.trim()) {
    error.value = 'Service name is required'
    return
  }
  if (!secret.value.trim()) {
    error.value = 'Secret key is required'
    return
  }

  const cleaned = secret.value.replace(/\s/g, '').toUpperCase()
  if (!/^[A-Z2-7]+=*$/.test(cleaned)) {
    error.value = 'Invalid Base32 secret key'
    return
  }

  emit('add', {
    issuer: issuer.value.trim(),
    label: label.value.trim() || issuer.value.trim(),
    secret: cleaned,
    color: color.value
  })

  issuer.value = ''
  label.value = ''
  secret.value = ''
  color.value = 'indigo'
  open.value = false
}
</script>

<template>
  <UModal v-model:open="open">
    <template #content>
      <div class="p-6 space-y-5">
        <!-- Header -->
        <div class="flex items-start gap-3">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-500/20 shrink-0">
            <UIcon name="i-lucide-key-round" class="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 class="text-base font-bold">Add Account</h3>
            <p class="text-sm text-muted mt-0.5">Enter the details from your 2FA setup</p>
          </div>
        </div>

        <!-- Form -->
        <div class="space-y-3">
          <UFormField label="Service" required>
            <UInput
              v-model="issuer"
              placeholder="e.g. GitHub, Google"
              icon="i-lucide-building-2"
              autofocus
              class="w-full"
            />
          </UFormField>

          <UFormField label="Account">
            <UInput
              v-model="label"
              placeholder="e.g. user@email.com"
              icon="i-lucide-user"
              class="w-full"
            />
          </UFormField>

          <UFormField label="Secret Key" required>
            <UInput
              v-model="secret"
              placeholder="e.g. JBSWY3DPEHPK3PXP"
              icon="i-lucide-key-round"
              class="w-full font-mono"
            />
          </UFormField>

          <UFormField label="Color">
            <ColorPicker v-model="color" />
          </UFormField>

          <Transition name="fade">
            <div v-if="error" class="flex items-center gap-2 text-sm text-red-500 bg-red-50 dark:bg-red-500/10 px-3 py-2 rounded-lg">
              <UIcon name="i-lucide-alert-circle" class="w-4 h-4 shrink-0" />
              {{ error }}
            </div>
          </Transition>
        </div>

        <!-- Actions -->
        <div class="flex gap-2 justify-end pt-1">
          <UButton
            label="Cancel"
            color="neutral"
            variant="ghost"
            @click="open = false"
          />
          <UButton
            label="Add Account"
            icon="i-lucide-plus"
            class="shadow-sm"
            @click="submit"
          />
        </div>
      </div>
    </template>
  </UModal>
</template>

<style scoped>
.fade-enter-active {
  transition: all 0.2s ease-out;
}
.fade-leave-active {
  transition: all 0.15s ease-in;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
