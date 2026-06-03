/**
 * infrastructure/database/prisma.ts — Cliente Prisma Singleton (Prisma 7)
 *
 * En Prisma 7, el cliente debe recibir el adaptador de base de datos explícitamente.
 * Usamos @prisma/adapter-pg que conecta Prisma con PostgreSQL a través de la
 * librería 'pg' (el driver nativo de PostgreSQL para Node.js).
 *
 * ¿Por qué un singleton?
 * ─────────────────────────────────────────────────────────────
 * Prisma Client mantiene un pool de conexiones a la base de datos.
 * Si creamos múltiples instancias, agotamos el pool y la app falla bajo carga.
 * Con el patrón singleton, la misma instancia se reutiliza en toda la app.
 *
 * ¿Por qué global en desarrollo?
 * ─────────────────────────────────────────────────────────────
 * En desarrollo, tsx recompila módulos cuando guardas un archivo.
 * Sin globalThis, cada recarga crearía una nueva instancia de Prisma,
 * acumulando conexiones abiertas. Con globalThis, la instancia persiste.
 */

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { config } from '../../config/env.js';

// Tipo para el globalThis extendido
declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

// Crear el cliente con el adaptador de PostgreSQL
function createPrismaClient(): PrismaClient {
  const adapter = new PrismaPg({
    connectionString: process.env['DATABASE_URL'],
  });

  return new PrismaClient({
    adapter,
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
