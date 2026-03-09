// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@bootstrap-vue-next/nuxt',
    'dayjs-nuxt',
    '@vueuse/nuxt',
    '@nuxtjs/stylelint-module',
  ],
  devtools: { enabled: false },
  app: {
    head: {
      title: 'Github Repositories',
    },
  },
  css: ['bootstrap/dist/css/bootstrap.min.css'],
  runtimeConfig: {
    githubPersonalToken: '',
  },
  compatibilityDate: '2025-07-15',

  vite: {
    server: {
      allowedHosts: true,
    },
  },
  dayjs: {
    locales: ['en'],
    plugins: ['timezone'],
    defaultLocale: 'en',
    defaultTimezone: 'Asia/Taipei',
  },
  eslint: {
    config: {
      stylistic: true,
    },
  },
})
