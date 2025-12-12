// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs';
import prettierRecommended from 'eslint-plugin-prettier/recommended';

export default withNuxt(prettierRecommended, {
  rules: {
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-unused-vars': 'warn',
    'vue/multi-word-component-names': 'off',
    'vue/require-default-prop': 'off',
    'vue/no-v-html': 'off',
  },
});
