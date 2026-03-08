// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui'
  ],

  ssr: false,

  nitro: {
    output: {
      publicDir: 'dist'
    }
  },

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],

  router: {
    options: {
      hashMode: true
    }
  },

  app: {
    baseURL: './',
    buildAssetsDir: 'assets/'
  },

  fonts: {
    defaults: {
      subsets: ['latin']
    }
  },

  compatibilityDate: '2025-01-15',

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  }
})
