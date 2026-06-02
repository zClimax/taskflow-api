/**
 * config/env.ts — Configuración centralizada de variables de entorno
 *
 * ¿Por qué centralizar la configuración?
 * ─────────────────────────────────────
 * Si accedes a process.env.DATABASE_URL directamente en 20 archivos distintos:
 *   1. Si cambias el nombre de la variable, debes buscar en 20 lugares.
 *   2. No hay validación: la app arranca aunque falte una variable crítica.
 *   3. No hay tipado: TypeScript cree que todo es string | undefined.
 *
 * Con un módulo de configuración centralizado:
 *   1. Un único lugar donde vivien todas las variables.
 *   2. Validación en el arranque (fail-fast: mejor fallar antes que durante).
 *   3. Tipos correctos para TypeScript.
 */

import 'dotenv/config'; // Carga el .env en process.env automáticamente

// ── Helper: leer una variable de entorno con validación ──────────────────────
function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    // Fail-fast: si falta una variable crítica, la app no arranca.
    // Es mejor un error claro al inicio que un bug misterioso en producción.
    throw new Error(
      `❌ Variable de entorno requerida no encontrada: "${name}"\n` +
      `   Verifica que tu archivo .env la contenga.\n` +
      `   Referencia: .env.example`
    );
  }
  return value;
}

function optionalEnv(name: string, defaultValue: string): string {
  return process.env[name] ?? defaultValue;
}

// ── Configuración exportada ───────────────────────────────────────────────────
export const config = {
  // Entorno de ejecución
  env: optionalEnv('NODE_ENV', 'development'),
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV !== 'production',

  // Servidor
  port: parseInt(optionalEnv('PORT', '3000'), 10),
  apiVersion: optionalEnv('API_VERSION', 'v1'),

  // Base de datos (requerida — la app no arranca sin esto)
  database: {
    url: optionalEnv('DATABASE_URL', 'postgresql://localhost:5432/taskflow_dev'),
  },

  // JWT (requeridos en producción)
  jwt: {
    accessSecret: optionalEnv('JWT_ACCESS_SECRET', 'dev_access_secret_change_in_production'),
    refreshSecret: optionalEnv('JWT_REFRESH_SECRET', 'dev_refresh_secret_change_in_production'),
    accessExpiresIn: optionalEnv('JWT_ACCESS_EXPIRES_IN', '15m'),
    refreshExpiresIn: optionalEnv('JWT_REFRESH_EXPIRES_IN', '7d'),
  },

  // CORS
  cors: {
    origin: optionalEnv('CORS_ORIGIN', 'http://localhost:5173'),
  },

  // Rate limiting
  rateLimit: {
    max: parseInt(optionalEnv('RATE_LIMIT_MAX', '100'), 10),
    windowMs: parseInt(optionalEnv('RATE_LIMIT_WINDOW_MS', '900000'), 10),
  },
} as const; // 'as const' hace que los valores sean readonly — no modificables

// ── Validación crítica para producción ───────────────────────────────────────
if (config.isProduction) {
  // En producción, estas variables son obligatorias
  requireEnv('DATABASE_URL');
  requireEnv('JWT_ACCESS_SECRET');
  requireEnv('JWT_REFRESH_SECRET');

  // Advertencia adicional si se usan los valores por defecto (inseguros)
  if (config.jwt.accessSecret === 'dev_access_secret_change_in_production') {
    throw new Error('❌ JWT_ACCESS_SECRET no puede ser el valor por defecto en producción');
  }
}

// Tipo exportado para usar en otras partes de la app (opcional pero útil)
export type Config = typeof config;
