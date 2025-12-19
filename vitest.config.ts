import { defineVitestConfig } from '@nuxt/test-utils/config';

export default defineVitestConfig({
  test: {
    environment: 'nuxt',
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
    },
    env: {
      AUTH_ORIGIN: 'http://localhost:3000',
    },
    exclude: ['node_modules', 'tests/e2e/**'],
  },
});
