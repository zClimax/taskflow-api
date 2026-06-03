/**
 * prisma.config.ts — Configuración del cliente Prisma (Prisma 7+)
 *
 * En Prisma 7, la URL de conexión se mueve de schema.prisma a este archivo.
 * El schema.prisma solo define los modelos y relaciones.
 *
 * Documentación: https://pris.ly/d/config-datasource
 */

import path from 'node:path';
import { defineConfig } from 'prisma/config';
import 'dotenv/config';

export default defineConfig({
  earlyAccess: true,
  schema: path.join(import.meta.dirname, 'prisma', 'schema.prisma'),
  datasource: {
    url: process.env['DATABASE_URL']!,
  },
  migrate: {
    async adapter() {
      const { PrismaPg } = await import('@prisma/adapter-pg');
      return new PrismaPg({ connectionString: process.env['DATABASE_URL'] });
    },
  },
});
