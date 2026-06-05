/**
 * vitest.config.ts — Configuración de Vitest
 *
 * Vitest es un test runner moderno compatible con ESModules y TypeScript nativamente.
 * Es prácticamente compatible con Jest pero 10-20x más rápido gracias a esbuild.
 */

import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  test: {
    // Entorno de ejecución — 'node' para APIs (no necesitamos DOM)
    environment: 'node',

    // Ejecutar los archivos de setup antes de cada suite
    setupFiles: ['./src/tests/setup.ts'],

    // Patrón para encontrar archivos de test
    include: ['src/**/*.test.ts'],

    // ⚠️ CRÍTICO para tests de integración:
    // Con fileParallelism: true (default), múltiples archivos de test corren
    // simultáneamente compartiendo la misma BD → las llamadas a cleanDatabase()
    // de distintos archivos se pisan entre sí → FK violations aleatorias.
    // Con false, cada archivo termina antes de empezar el siguiente.
    fileParallelism: false,

    // Aislamiento de módulos entre archivos (para que los mocks no se 'filtren')
    isolate: true,

    // Modo de cobertura
    coverage: {
      provider: 'v8',                          // Motor de cobertura
      reporter: ['text', 'html', 'lcov'],      // Formatos de reporte
      include: ['src/api/**/*.ts'],            // Qué archivos medir
      exclude: [
        'src/api/**/*.test.ts',
        'src/api/**/*.dto.ts',                 // Los DTOs son solo tipos/schemas
        'src/tests/**',
      ],
      thresholds: {                             // Umbrales mínimos de cobertura
        statements: 70,
        branches: 60,
        functions: 70,
        lines: 70,
      },
    },

    // Variables de entorno para todos los tests
    env: {
      NODE_ENV: 'test',
      DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/taskflow_test',
    },

    // Timeout por test (ms) — bcrypt es lento, necesitamos más tiempo
    testTimeout: 15000,
    hookTimeout: 15000,
  },

  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
});
