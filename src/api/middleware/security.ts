/**
 * middleware/security.ts — Capa de seguridad HTTP
 *
 * Este archivo agrupa los 4 middlewares de seguridad:
 *
 * 1. HELMET — Headers HTTP de seguridad
 *    ────────────────────────────────────
 *    Un atacante puede explotar cómo el navegador interpreta tus respuestas.
 *    Helmet añade headers que le dicen al navegador:
 *      - "No ejecutes scripts inline" (Content-Security-Policy)
 *      - "No adivines el tipo de contenido" (X-Content-Type-Options)
 *      - "No permitas que esta página sea embebida en un iframe" (X-Frame-Options)
 *      - "Usa siempre HTTPS" (Strict-Transport-Security)
 *    Sin Helmet, un atacante puede inyectar scripts (XSS), hacer clickjacking, etc.
 *
 * 2. CORS — Cross-Origin Resource Sharing
 *    ───────────────────────────────────────
 *    Controla qué dominios pueden hacer peticiones a tu API.
 *    Sin CORS, el navegador bloquea peticiones desde otros dominios.
 *    Con CORS mal configurado (* para todo), cualquier web puede llamar a tu API.
 *
 * 3. RATE LIMIT — Límite de peticiones por IP
 *    ────────────────────────────────────────────
 *    Sin límite, un atacante puede:
 *      - Fuerza bruta contra POST /auth/login (probar millones de contraseñas)
 *      - DDoS (saturar el servidor con peticiones)
 *      - Scraping masivo de datos
 *    Rate limiting aplica: max 100 req / 15 min por IP
 *
 * 4. COMPRESSION — Compresión gzip
 *    ──────────────────────────────
 *    Comprime las respuestas JSON antes de enviarlas.
 *    Impacto real en una respuesta de 100 tareas:
 *      Sin compresión: ~45KB
 *      Con gzip:       ~6KB  (87% menos)
 *    Reduce tiempo de respuesta y coste de ancho de banda.
 */

import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import { type Request, type Response } from 'express';
import { config } from '../../config/env.js';

// ── 1. HELMET ─────────────────────────────────────────────────────────────────
export const helmetMiddleware = helmet({
  // Content-Security-Policy: controla qué recursos puede cargar el navegador
  // Para APIs puras, lo restringimos al mínimo
  contentSecurityPolicy: config.isProduction
    ? {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"], // Swagger UI necesita inline styles
          imgSrc: ["'self'", 'data:', 'https:'],
        },
      }
    : false, // En desarrollo, desactivamos CSP para que Swagger UI funcione sin problemas

  // Strict-Transport-Security: obliga HTTPS (solo en producción)
  hsts: config.isProduction
    ? { maxAge: 31536000, includeSubDomains: true, preload: true }
    : false,

  // Elimina el header X-Powered-By: Express (no reveles tu stack al atacante)
  hidePoweredBy: true,

  // Previene que el navegador adivine el Content-Type (MIME sniffing)
  noSniff: true,

  // Impide que la página sea embebida en un iframe (clickjacking)
  frameguard: { action: 'deny' },

  // Habilita el filtro XSS del navegador (legacy browsers)
  xssFilter: true,
});

// ── 2. CORS ───────────────────────────────────────────────────────────────────
// Lista de orígenes permitidos (puede ser string o array)
const allowedOrigins: string[] = config.cors.origin
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

export const corsMiddleware = cors({
  // origin: función que valida si el origen de la petición está permitido
  origin: (requestOrigin, callback) => {
    // Permitir peticiones sin origen (ej: herramientas CLI como curl, Postman)
    // y peticiones desde orígenes en la lista blanca
    if (!requestOrigin || allowedOrigins.includes(requestOrigin) || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      callback(new Error(`Origen no permitido por CORS: ${requestOrigin}`));
    }
  },

  // Métodos HTTP permitidos
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],

  // Headers que el frontend puede enviar
  allowedHeaders: ['Content-Type', 'Authorization'],

  // Permite que el frontend reciba cookies/auth headers
  credentials: true,

  // Tiempo que el navegador cachea la respuesta preflight (OPTIONS)
  // 86400 = 24 horas — reduce las peticiones OPTIONS duplicadas
  maxAge: 86400,
});

// ── 3. RATE LIMITING ──────────────────────────────────────────────────────────
// Límite general para todas las rutas de la API
export const rateLimitMiddleware = rateLimit({
  windowMs: config.rateLimit.windowMs, // 15 minutos por defecto
  max: config.rateLimit.max,           // 100 peticiones por ventana
  standardHeaders: 'draft-7',         // Incluye headers RateLimit-* en la respuesta
  legacyHeaders: false,               // No incluir los headers X-RateLimit-* (deprecated)

  // Mensaje de error cuando se supera el límite
  handler: (_req: Request, res: Response) => {
    res.status(429).json({
      error: {
        status: 429,
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Demasiadas peticiones. Por favor, espera unos minutos antes de reintentar.',
        retryAfter: Math.ceil(config.rateLimit.windowMs / 1000 / 60), // en minutos
      },
    });
  },

  // Omitir el rate limit para el health check (los load balancers lo llaman frecuentemente)
  skip: (req: Request) => req.path === '/health',
});

// Límite más estricto específico para rutas de autenticación
// Un atacante puede intentar miles de combinaciones email/password
export const authRateLimitMiddleware = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutos
  max: 20,                    // Solo 20 intentos de login/register por IP cada 15 min
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: (_req: Request, res: Response) => {
    res.status(429).json({
      error: {
        status: 429,
        code: 'AUTH_RATE_LIMIT_EXCEEDED',
        message: 'Demasiados intentos de autenticación. Espera 15 minutos.',
        retryAfter: 15,
      },
    });
  },
});

// ── 4. COMPRESSION ────────────────────────────────────────────────────────────
export const compressionMiddleware = compression({
  // Solo comprime respuestas mayores de 1KB
  // Las respuestas pequeñas no valen el overhead de compresión
  threshold: 1024, // bytes

  // Nivel de compresión: 6 es el balance óptimo velocidad/tamaño
  // 1 = más rápido, menos compresión
  // 9 = más lento, más compresión
  level: 6,

  // Solo comprimir texto (JSON, HTML, etc.), no imágenes o binarios
  filter: (req: Request, res: Response) => {
    // Si la petición dice "no comprimir", respetamos
    if (req.headers['x-no-compression']) {
      return false;
    }
    // Por defecto, usar el filtro de compression (basado en Content-Type)
    return compression.filter(req, res);
  },
});
