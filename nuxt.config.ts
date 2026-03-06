// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxt/eslint'],
  devtools: { enabled: true },
  compatibilityDate: '2025-07-15',

  vite: {
    server: {
      allowedHosts: true,
    },
  },
  eslint: {
    config: {
      stylistic: true,
    },
  },
})
