import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['js/lib/**/*.test.js'],
    coverage: {
      provider: 'v8',
      include: ['js/lib/**/*.js'],
      exclude: ['js/lib/**/*.test.js'],
      thresholds: {
        lines: 80,
        branches: 75,
      },
    },
  },
});
