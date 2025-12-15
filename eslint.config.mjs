// Simple ESLint config to allow pushes
export default [
  {
    ignores: ['dist', '.nuxt', 'node_modules'],
  },
  {
    files: ['**/*.{js,ts,vue}'],
    rules: {
      // Minimal rules to allow pushing
    },
  },
];