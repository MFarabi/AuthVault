<script setup lang="ts">
const { accounts, init, addAccount, removeAccount } = useAuthenticator()
const showAdd = ref(false)
const search = ref('')
const confirmDelete = ref<string | null>(null)

init()

const filtered = computed(() => {
  if (!search.value) return accounts.value
  const q = search.value.toLowerCase()
  return accounts.value.filter(
    a => a.issuer.toLowerCase().includes(q) || a.label.toLowerCase().includes(q)
  )
})

function handleAdd(data: { issuer: string, label: string, secret: string, color: string }) {
  addAccount(data as any)
}

function handleDelete(id: string) {
  confirmDelete.value = id
}

function confirmRemove() {
  if (confirmDelete.value) {
    removeAccount(confirmDelete.value)
    confirmDelete.value = null
  }
}
</script>

<template>
  <div class="flex flex-col h-full">
    <!-- Search -->
    <div v-if="accounts.length" class="px-4 pb-3">
      <UInput
        v-model="search"
        placeholder="Search accounts..."
        icon="i-lucide-search"
        variant="subtle"
        size="sm"
        class="w-full"
      />
    </div>

    <!-- Account list -->
    <div class="flex-1 overflow-y-auto px-1">
      <TransitionGroup
        v-if="filtered.length"
        name="list"
        tag="div"
        class="space-y-0.5"
      >
        <AccountCard
          v-for="account in filtered"
          :key="account.id"
          :account="account"
          @delete="handleDelete"
        />
      </TransitionGroup>

      <!-- Empty state -->
      <div v-else-if="!accounts.length" class="flex flex-col items-center justify-center h-full text-center px-8 py-16">
        <div class="relative mb-6">
          <div class="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-500/15 to-purple-500/15 flex items-center justify-center">
            <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <UIcon name="i-lucide-shield-check" class="w-7 h-7 text-white" />
            </div>
          </div>
          <div class="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-sm">
            <UIcon name="i-lucide-plus" class="w-3 h-3 text-white" />
          </div>
        </div>
        <h3 class="font-bold text-base mb-1.5">No accounts yet</h3>
        <p class="text-sm text-muted mb-6 leading-relaxed">Add your first two-factor<br>authentication account</p>
        <UButton
          label="Add Account"
          icon="i-lucide-plus"
          size="lg"
          class="rounded-xl shadow-md shadow-primary/20"
          @click="showAdd = true"
        />
      </div>

      <!-- No search results -->
      <div v-else class="flex flex-col items-center justify-center py-16 text-center">
        <div class="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3">
          <UIcon name="i-lucide-search-x" class="w-6 h-6 text-dimmed" />
        </div>
        <p class="text-sm font-medium text-muted">No results for "{{ search }}"</p>
        <p class="text-xs text-dimmed mt-1">Try a different search term</p>
      </div>
    </div>

    <!-- FAB -->
    <div v-if="accounts.length" class="p-3 flex justify-end">
      <UButton
        icon="i-lucide-plus"
        size="lg"
        class="rounded-2xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-shadow"
        @click="showAdd = true"
      />
    </div>

    <!-- Add modal -->
    <AddAccountModal v-model:open="showAdd" @add="handleAdd" />

    <!-- Delete confirmation -->
    <UModal v-model:open="confirmDelete">
      <template #content>
        <div class="p-6 space-y-5">
          <div class="flex items-start gap-3">
            <div class="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-500/15 flex items-center justify-center shrink-0">
              <UIcon name="i-lucide-alert-triangle" class="w-5 h-5 text-red-500" />
            </div>
            <div>
              <h3 class="text-base font-bold">Delete Account</h3>
              <p class="text-sm text-muted mt-1">This will permanently remove this 2FA account. You won't be able to generate codes for it anymore.</p>
            </div>
          </div>
          <div class="flex gap-2 justify-end">
            <UButton label="Cancel" color="neutral" variant="ghost" @click="confirmDelete = null" />
            <UButton label="Delete" color="error" icon="i-lucide-trash-2" @click="confirmRemove" />
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>

<style scoped>
.list-enter-active {
  transition: all 0.3s ease-out;
}
.list-leave-active {
  transition: all 0.2s ease-in;
}
.list-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}
.list-leave-to {
  opacity: 0;
  transform: translateX(20px);
}
</style>
