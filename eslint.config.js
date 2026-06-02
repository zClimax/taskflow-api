import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

/**
 * Configuración de ESLint para TypeScript.
 *
 * ESLint analiza el código fuente y reporta:
 * - Errores reales (variables no declaradas, tipos incorrectos)
 * - Malas prácticas (código muerto, promesas sin await)
 * - Inconsistencias de estilo (que Prettier no cubre)
 */
export default tseslint.config(
  // Configuración recomendada de ESLint base
  eslint.configs.recommended,

  // Configuración recomendada de TypeScript ESLint (con type-checking)
  ...tseslint.configs.recommendedTypeChecked,

  {
    // Información del proyecto TypeScript (necesario para type-checking en ESLint)
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },

    rules: {
      // ─── TypeScript ──────────────────────────────────────────────────────
      // Permite usar 'any' cuando sea necesario (útil en etapas de aprendizaje)
      // En proyectos maduros, se suele cambiar a 'error'
      '@typescript-eslint/no-explicit-any': 'warn',

      // No permite variables declaradas pero no usadas (código limpio)
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],

      // Obliga a especificar tipos de retorno en funciones (más legible)
      '@typescript-eslint/explicit-function-return-type': 'warn',

      // ─── Async / Await ──────────────────────────────────────────────────
      // No permite promesas sin manejar (causa bugs silenciosos)
      '@typescript-eslint/no-floating-promises': 'error',

      // ─── General ─────────────────────────────────────────────────────────
      // No permite console.log en código de producción (usar un logger)
      // En desarrollo, lo dejamos como advertencia para recordarlo
      'no-console': 'warn',

      // Prefiere 'const' cuando la variable no se reasigna
      'prefer-const': 'error',
    },
  },

  {
    // Ignorar archivos que no necesitan linting
    ignores: ['dist/**', 'node_modules/**', 'coverage/**', '*.config.js'],
  }
);
