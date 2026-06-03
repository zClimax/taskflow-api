/**
 * types/express.d.ts — Extensión de tipos de Express
 *
 * ¿Por qué este archivo?
 * ──────────────────────
 * Express define `Request` sin una propiedad `user`. Para que TypeScript
 * entienda que `req.user` existe (y cuál es su forma), usamos "declaration merging":
 * extendemos la interfaz original de Express en el namespace global.
 *
 * Después del middleware `authenticate`, req.user siempre estará disponible
 * en cualquier ruta protegida.
 */

// Importación necesaria para que TypeScript trate este archivo como módulo
export {};

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        name: string;
        role: 'ADMIN' | 'MEMBER';
      };
    }
  }
}
