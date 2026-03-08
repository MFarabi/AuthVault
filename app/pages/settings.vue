<script setup lang="ts">
const { accounts, init, exportAccounts, getOtpauthUri, importAccounts, importFromUris } = useAuthenticator()
const toast = useToast()

init()

const showGoogleExport = ref(false)
const googleExportIndex = ref(0)

const selectedExportAccounts = computed(() => {
  if (selectedIds.value.length > 0) {
    return accounts.value.filter(a => selectedIds.value.includes(a.id))
  }
  return accounts.value
})

const currentGoogleAccount = computed(() => selectedExportAccounts.value[googleExportIndex.value])
const currentOtpauthUri = computed(() => currentGoogleAccount.value ? getOtpauthUri(currentGoogleAccount.value) : '')

function openGoogleExport() {
  googleExportIndex.value = 0
  showGoogleExport.value = true
}

function nextGoogleAccount() {
  if (googleExportIndex.value < selectedExportAccounts.value.length - 1) {
    googleExportIndex.value++
  }
}

function prevGoogleAccount() {
  if (googleExportIndex.value > 0) {
    googleExportIndex.value--
  }
}

const selectedIds = ref<string[]>([])
const showImport = ref(false)
const showUriImport = ref(false)
const importText = ref('')
const uriText = ref('')
const importError = ref('')
const uriError = ref('')
const showDonation = ref(false)
const copiedAddress = ref('')
const activeQr = ref('')

const allSelected = computed(() =>
  accounts.value.length > 0 && selectedIds.value.length === accounts.value.length
)

function toggleAll() {
  if (allSelected.value) {
    selectedIds.value = []
  } else {
    selectedIds.value = accounts.value.map(a => a.id)
  }
}

function toggleAccount(id: string) {
  const idx = selectedIds.value.indexOf(id)
  if (idx === -1) {
    selectedIds.value.push(id)
  } else {
    selectedIds.value.splice(idx, 1)
  }
}

function handleExport() {
  const ids = selectedIds.value.length > 0 ? selectedIds.value : undefined
  const json = exportAccounts(ids)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `authenticator-backup-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
  const count = ids ? ids.length : accounts.value.length
  toast.add({ title: 'Exported!', description: `${count} account(s) exported`, color: 'success', duration: 2000 })
}

function handleImportFile() {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.json'
  input.onchange = (e: Event) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const count = importAccounts(reader.result as string)
        toast.add({ title: 'Imported!', description: `${count} new account(s) added`, color: 'success', duration: 2000 })
      } catch {
        toast.add({ title: 'Import failed', description: 'Invalid file format', color: 'error', duration: 3000 })
      }
    }
    reader.readAsText(file)
  }
  input.click()
}

function handleImportText() {
  importError.value = ''
  try {
    const count = importAccounts(importText.value)
    toast.add({ title: 'Imported!', description: `${count} new account(s) added`, color: 'success', duration: 2000 })
    importText.value = ''
    showImport.value = false
  } catch {
    importError.value = 'Invalid JSON format'
  }
}

function handleImportUri() {
  uriError.value = ''
  try {
    const count = importFromUris(uriText.value)
    if (count > 0) {
      toast.add({ title: 'Imported!', description: `${count} account(s) imported from URI`, color: 'success', duration: 2000 })
      uriText.value = ''
      showUriImport.value = false
    } else {
      uriError.value = 'No valid otpauth:// URIs found'
    }
  } catch {
    uriError.value = 'Failed to parse URI'
  }
}

const cryptoWallets = [
  { name: 'Bitcoin', symbol: 'BTC', icon: 'i-simple-icons-bitcoin', address: 'bc1qyourbitcoinaddress', qrPrefix: 'bitcoin:', color: 'from-orange-400 to-orange-600' },
  { name: 'Ethereum', symbol: 'ETH', icon: 'i-simple-icons-ethereum', address: '0xYourEthereumAddress', qrPrefix: 'ethereum:', color: 'from-blue-400 to-indigo-600' },
  { name: 'Solana', symbol: 'SOL', icon: 'i-simple-icons-solana', address: 'YourSolanaAddress', qrPrefix: 'solana:', color: 'from-purple-400 to-fuchsia-600' }
]

function copyAddress(address: string, name: string) {
  navigator.clipboard.writeText(address)
  copiedAddress.value = address
  toast.add({ title: 'Address Copied!', description: `${name} address copied to clipboard`, color: 'success', duration: 2000 })
  setTimeout(() => { copiedAddress.value = '' }, 2000)
}

function toggleQr(address: string) {
  activeQr.value = activeQr.value === address ? '' : address
}
</script>

<template>
  <div class="flex flex-col h-full overflow-y-auto">
    <div class="px-4 pb-6 space-y-5">

      <!-- Export Section -->
      <section>
        <div class="flex items-center gap-2 mb-3">
          <div class="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
            <UIcon name="i-lucide-upload" class="w-3.5 h-3.5 text-white" />
          </div>
          <h2 class="text-sm font-bold">Export</h2>
        </div>

        <div v-if="accounts.length" class="space-y-2">
          <label
            class="flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
            @click="toggleAll"
          >
            <UIcon
              :name="allSelected ? 'i-lucide-check-square' : 'i-lucide-square'"
              class="w-4.5 h-4.5"
              :class="allSelected ? 'text-primary' : 'text-dimmed'"
            />
            <span class="text-sm font-medium">Select All</span>
            <span class="text-xs text-dimmed ml-auto">{{ accounts.length }} accounts</span>
          </label>

          <div class="space-y-0.5 max-h-36 overflow-y-auto">
            <label
              v-for="account in accounts"
              :key="account.id"
              class="flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
              @click="toggleAccount(account.id)"
            >
              <UIcon
                :name="selectedIds.includes(account.id) ? 'i-lucide-check-square' : 'i-lucide-square'"
                class="w-4.5 h-4.5"
                :class="selectedIds.includes(account.id) ? 'text-primary' : 'text-dimmed'"
              />
              <div class="flex-1 min-w-0">
                <span class="text-sm font-medium truncate block">{{ account.issuer }}</span>
                <span class="text-xs text-dimmed truncate block">{{ account.label }}</span>
              </div>
            </label>
          </div>

          <UButton
            :label="selectedIds.length > 0 ? `Export ${selectedIds.length} Account(s)` : 'Export All'"
            icon="i-lucide-download"
            block
            class="rounded-xl"
            @click="handleExport"
          />
          <UButton
            label="Export to Google Authenticator"
            icon="i-simple-icons-google"
            variant="soft"
            color="neutral"
            block
            class="rounded-xl"
            @click="openGoogleExport"
          />
        </div>

        <div v-else class="text-sm text-muted text-center py-4 bg-gray-50 dark:bg-white/5 rounded-xl">
          No accounts to export
        </div>
      </section>

      <!-- Google Authenticator Export Modal -->
      <UModal v-model:open="showGoogleExport">
        <template #content>
          <div v-if="currentGoogleAccount" class="p-6 space-y-4">
            <div class="flex items-start gap-3">
              <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md shrink-0">
                <UIcon name="i-simple-icons-google" class="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 class="text-base font-bold">Export to Google Authenticator</h3>
                <p class="text-sm text-muted mt-0.5">Scan this QR code with Google Authenticator</p>
              </div>
            </div>

            <!-- Account info -->
            <div class="text-center">
              <p class="text-xs font-semibold text-muted uppercase tracking-wide">{{ currentGoogleAccount.issuer }}</p>
              <p class="text-xs text-dimmed">{{ currentGoogleAccount.label }}</p>
            </div>

            <!-- QR Code -->
            <div class="flex justify-center">
              <div class="bg-white p-3 rounded-2xl shadow-sm">
                <QrCode :key="currentOtpauthUri" :value="currentOtpauthUri" :size="180" />
              </div>
            </div>

            <!-- Navigation -->
            <div class="flex items-center justify-between">
              <UButton
                icon="i-lucide-chevron-left"
                variant="ghost"
                color="neutral"
                size="sm"
                :disabled="googleExportIndex === 0"
                @click="prevGoogleAccount"
              />
              <span class="text-xs text-muted tabular-nums">
                {{ googleExportIndex + 1 }} / {{ selectedExportAccounts.length }}
              </span>
              <UButton
                icon="i-lucide-chevron-right"
                variant="ghost"
                color="neutral"
                size="sm"
                :disabled="googleExportIndex >= selectedExportAccounts.length - 1"
                @click="nextGoogleAccount"
              />
            </div>

            <UButton
              label="Done"
              block
              class="rounded-xl"
              @click="showGoogleExport = false"
            />
          </div>
        </template>
      </UModal>

      <!-- Import Section -->
      <section>
        <div class="flex items-center gap-2 mb-3">
          <div class="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
            <UIcon name="i-lucide-download" class="w-3.5 h-3.5 text-white" />
          </div>
          <h2 class="text-sm font-bold">Import</h2>
        </div>

        <div class="space-y-2">
          <UButton
            label="Import from File"
            icon="i-lucide-file-json"
            variant="soft"
            block
            class="rounded-xl"
            @click="handleImportFile"
          />

          <!-- Google Authenticator URI import -->
          <UButton
            label="Import from Google Authenticator"
            icon="i-simple-icons-google"
            variant="soft"
            color="neutral"
            block
            class="rounded-xl"
            @click="showUriImport = !showUriImport"
          />

          <Transition name="expand">
            <div v-if="showUriImport" class="space-y-2 pt-1">
              <p class="text-xs text-muted px-1">
                Paste one or more <code class="text-[10px] bg-gray-100 dark:bg-white/10 px-1 py-0.5 rounded">otpauth://</code> URIs from Google Authenticator export
              </p>
              <UTextarea
                v-model="uriText"
                placeholder="otpauth://totp/GitHub:user@email.com?secret=JBSWY3DPEHPK3PXP&issuer=GitHub"
                :rows="3"
                class="w-full font-mono text-xs"
              />
              <Transition name="fade">
                <div v-if="uriError" class="flex items-center gap-2 text-sm text-red-500 bg-red-50 dark:bg-red-500/10 px-3 py-2 rounded-lg">
                  <UIcon name="i-lucide-alert-circle" class="w-4 h-4 shrink-0" />
                  {{ uriError }}
                </div>
              </Transition>
              <UButton
                label="Import"
                icon="i-lucide-check"
                block
                :disabled="!uriText.trim()"
                class="rounded-xl"
                @click="handleImportUri"
              />
            </div>
          </Transition>

          <!-- JSON paste import -->
          <UButton
            label="Paste JSON"
            icon="i-lucide-clipboard-paste"
            variant="soft"
            color="neutral"
            block
            class="rounded-xl"
            @click="showImport = !showImport"
          />

          <Transition name="expand">
            <div v-if="showImport" class="space-y-2 pt-1">
              <UTextarea
                v-model="importText"
                placeholder='[{"issuer":"GitHub","label":"user@email.com","secret":"JBSWY3DPEHPK3PXP"}]'
                :rows="4"
                class="w-full font-mono text-xs"
              />
              <Transition name="fade">
                <div v-if="importError" class="flex items-center gap-2 text-sm text-red-500 bg-red-50 dark:bg-red-500/10 px-3 py-2 rounded-lg">
                  <UIcon name="i-lucide-alert-circle" class="w-4 h-4 shrink-0" />
                  {{ importError }}
                </div>
              </Transition>
              <UButton
                label="Import"
                icon="i-lucide-check"
                block
                :disabled="!importText.trim()"
                class="rounded-xl"
                @click="handleImportText"
              />
            </div>
          </Transition>
        </div>
      </section>

      <!-- Donation Section -->
      <section>
        <div class="flex items-center gap-2 mb-3">
          <div class="w-7 h-7 rounded-lg bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center">
            <UIcon name="i-lucide-heart" class="w-3.5 h-3.5 text-white" />
          </div>
          <h2 class="text-sm font-bold">Support the Project</h2>
        </div>

        <div
          class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 dark:from-indigo-500/20 dark:via-purple-500/15 dark:to-pink-500/20 p-4 cursor-pointer transition-all hover:shadow-md"
          @click="showDonation = !showDonation"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-semibold">Buy me a coffee with crypto</p>
              <p class="text-xs text-muted mt-0.5">Your support keeps this project alive</p>
            </div>
            <UIcon
              name="i-lucide-chevron-down"
              class="w-4 h-4 text-muted transition-transform duration-200"
              :class="showDonation && 'rotate-180'"
            />
          </div>

          <Transition name="expand">
            <div v-if="showDonation" class="mt-4 space-y-2" @click.stop>
              <div
                v-for="wallet in cryptoWallets"
                :key="wallet.symbol"
                class="rounded-xl bg-white/60 dark:bg-white/5 overflow-hidden"
              >
                <div
                  class="flex items-center gap-3 p-3 hover:bg-white dark:hover:bg-white/10 transition-colors cursor-pointer"
                  @click="copyAddress(wallet.address, wallet.name)"
                >
                  <div
                    class="w-9 h-9 rounded-lg bg-gradient-to-br flex items-center justify-center shrink-0"
                    :class="wallet.color"
                  >
                    <UIcon :name="wallet.icon" class="w-4.5 h-4.5 text-white" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-1.5">
                      <span class="text-xs font-bold">{{ wallet.name }}</span>
                      <span class="text-[10px] text-dimmed">{{ wallet.symbol }}</span>
                    </div>
                    <span class="text-[11px] text-muted font-mono truncate block">{{ wallet.address }}</span>
                  </div>
                  <div class="flex items-center gap-1.5">
                    <UButton
                      icon="i-lucide-qr-code"
                      variant="ghost"
                      color="neutral"
                      size="2xs"
                      class="rounded-lg"
                      @click.stop="toggleQr(wallet.address)"
                    />
                    <UIcon
                      :name="copiedAddress === wallet.address ? 'i-lucide-check' : 'i-lucide-copy'"
                      class="w-3.5 h-3.5 shrink-0"
                      :class="copiedAddress === wallet.address ? 'text-green-500' : 'text-dimmed'"
                    />
                  </div>
                </div>

                <!-- QR Code -->
                <Transition name="expand">
                  <div v-if="activeQr === wallet.address" class="flex justify-center pb-3 px-3">
                    <div class="bg-white p-2 rounded-xl shadow-sm">
                      <QrCode :value="`${wallet.qrPrefix}${wallet.address}`" :size="140" />
                    </div>
                  </div>
                </Transition>
              </div>
            </div>
          </Transition>
        </div>
      </section>

    </div>
  </div>
</template>

<style scoped>
.expand-enter-active, .expand-leave-active {
  transition: all 0.25s ease;
  overflow: hidden;
}
.expand-enter-from, .expand-leave-to {
  opacity: 0;
  max-height: 0;
}
.expand-enter-to, .expand-leave-from {
  opacity: 1;
  max-height: 500px;
}

.fade-enter-active { transition: all 0.2s ease-out; }
.fade-leave-active { transition: all 0.15s ease-in; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(-4px); }
</style>
