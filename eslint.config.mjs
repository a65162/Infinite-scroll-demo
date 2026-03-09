// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt([
  {
    rules: {
      'no-console': ['error'],
      'vue/no-multiple-template-root': 'off',
      'vue/component-name-in-template-casing': ['error', 'PascalCase'],
    },
  },
])
