import angular from '@analogjs/vite-plugin-angular';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [angular({ jit: true })],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./test/setup.ts'],
    include: ['src/**/*.spec.ts'],
    // O compilador do Angular precisa de arquivo real, não de módulo virtual.
    pool: 'threads',
  },
});
