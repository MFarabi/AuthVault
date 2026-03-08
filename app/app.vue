<script setup>
useHead({
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' }
  ],
  link: [
    { rel: 'icon', href: '/icon-48.png', type: 'image/png' }
  ],
  htmlAttrs: {
    lang: 'en'
  }
})

const route = useRoute()
const isSettings = computed(() => route.path === '/settings')
</script>

<template>
  <UApp>
    <div class="flex flex-col h-screen bg-background">
      <!-- Header -->
      <header class="relative flex items-center justify-between px-4 py-3 border-b border-default bg-background/80 backdrop-blur-md z-10">
        <div class="flex items-center gap-2.5">
          <template v-if="isSettings">
            <UButton
              icon="i-lucide-arrow-left"
              variant="ghost"
              size="xs"
              to="/"
              class="rounded-lg -ml-1"
            />
            <h1 class="text-sm font-bold tracking-tight">Settings</h1>
          </template>
          <template v-else>
            <NuxtLink to="/" class="flex items-center gap-2.5">
              <img src="/icon-128.png" alt="AuthVault" class="w-8 h-8 rounded-xl shadow-md shadow-indigo-500/20" />
              <div>
                <h1 class="text-sm font-bold tracking-tight">AuthVault</h1>
                <p class="text-[10px] text-dimmed leading-none">2FA Security</p>
              </div>
            </NuxtLink>
          </template>
        </div>
        <div class="flex items-center gap-1">
          <UColorModeButton size="xs" variant="ghost" />
          <UButton
            v-if="!isSettings"
            icon="i-lucide-settings"
            variant="ghost"
            size="xs"
            to="/settings"
            class="rounded-lg"
          />
        </div>
      </header>

      <!-- Content -->
      <main class="flex-1 overflow-hidden pt-3">
        <NuxtPage />
      </main>
    </div>
  </UApp>
</template>
