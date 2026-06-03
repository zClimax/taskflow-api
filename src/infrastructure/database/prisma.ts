/**
 * infrastructure/database/prisma.ts — Cliente Prisma Singleton
 *
 * ¿Por qué un singleton?
 * ─────────────────────────────────────────────────────────────
 * Prisma Client mantiene un pool de conexiones a la base de datos.
 * Si creamos múltiples instancias (ej: una por cada request), agotamos
 * el pool de conexiones y la app falla bajo carga.
 *
 * Con el patrón singleton, la misma instancia se reutiliza en toda la app.
 *
 * ¿Por qué global en desarrollo?
 * ─────────────────────────────────────────────────────────────
 * En desarrollo, tsx/ts-node recompila los módulos cuando guardas un archivo.
 * Sin el truco de globalThis, cada recarga crearía una nueva instancia de
 * Prisma, acumulando conexiones abiertas hasta alcanzar el límite.
 * Con globalThis, la instancia persiste entre recargas en modo desarrollo.
 */

import { PrismaClient } from '@prisma/client';
import { config } from '../../config/env.js';

// Tipo para el globalThis extendido
declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

// Crear el cliente con configuración según el entorno
function createPrismaClient(): PrismaClient {
  return new PrismaClient({
    log: config.isDevelopment
      ? ['query', 'warn', 'error']  // En desarrollo: ver todas las queries SQL
      : ['warn', 'error'],          // En producción: solo warnings y errores
  });
}

// Singleton: reutilizar en producción, usar globalThis en desarrollo
export const prisma: PrismaClient =
  globalThis.__prisma ?? createPrismaClient();

if (config.isDevelopment) {
  globalThis.__prisma = prisma;
}
