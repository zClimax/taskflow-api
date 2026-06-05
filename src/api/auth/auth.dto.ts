/**
 * auth/auth.dto.ts — Schemas de validación para Auth
 */

import { z } from 'zod';

export const RegisterSchema = z.object({
  name: z
    .string({ error: 'El nombre es requerido' })
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre no puede exceder 50 caracteres')
    .trim(),

  email: z
    .string({ error: 'El email es requerido' })
    .email('Formato de email inválido')
    .toLowerCase(), // Normalizar: "Jorge@GMAIL.com" → "jorge@gmail.com"

  password: z
    .string({ error: 'La contraseña es requerida' })
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .max(72, 'La contraseña no puede exceder 72 caracteres') // Límite de bcrypt
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'La contraseña debe tener al menos una mayúscula, una minúscula y un número'
    ),
});

export const LoginSchema = z.object({
  email: z.string().email('Email inválido').toLowerCase(),
  password: z.string().min(1, 'La contraseña es requerida'),
});

export const RefreshSchema = z.object({
  refreshToken: z.string({ error: 'El refresh token es requerido' }),
});

export type RegisterDto = z.infer<typeof RegisterSchema>;
export type LoginDto = z.infer<typeof LoginSchema>;
export type RefreshDto = z.infer<typeof RefreshSchema>;
