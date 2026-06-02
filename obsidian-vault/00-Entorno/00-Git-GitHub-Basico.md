# Git y GitHub — Fundamentos para Desarrolladores

## Definición

- **Git**: Sistema de control de versiones distribuido. Guarda instantáneas de tu código a lo largo del tiempo.
- **GitHub**: Plataforma en la nube para alojar repositorios Git + colaboración + CI/CD.

---

## Conceptos Clave

| Término | Definición |
|---|---|
| **Repository (repo)** | Carpeta de proyecto con historial de cambios |
| **Commit** | Instantánea del estado del código en un momento |
| **Branch** | Línea paralela de desarrollo |
| **Merge** | Combinar ramas |
| **Remote** | Versión del repo en la nube (GitHub) |
| **Push** | Enviar commits locales al remote |
| **Pull** | Traer cambios del remote al local |
| **Staging Area** | Zona intermedia antes de hacer commit |

---

## Convención de Commits: Conventional Commits

El estándar de la industria para mensajes de commit:

```
tipo(alcance): descripción corta en imperativo

Cuerpo opcional con más detalles.
```

### Tipos

| Tipo | Cuándo usarlo |
|---|---|
| `feat` | Nueva funcionalidad |
| `fix` | Corrección de bug |
| `docs` | Solo documentación |
| `chore` | Configuración, dependencias, tareas de mantenimiento |
| `refactor` | Refactorización (sin nueva funcionalidad ni bug fix) |
| `test` | Agregar o corregir tests |
| `style` | Formateo, espacios (sin cambio de lógica) |
| `perf` | Mejora de rendimiento |

### Ejemplos Reales

```bash
git commit -m "feat(auth): add JWT authentication middleware"
git commit -m "fix(users): handle null email in registration"
git commit -m "docs: update README with installation instructions"
git commit -m "chore: configure ESLint with TypeScript rules"
git commit -m "test(tasks): add integration tests for task creation"
```

---

## Flujo de Trabajo en Este Proyecto

```bash
# Flujo típico de desarrollo
git status                          # Ver qué archivos cambiaron
git add .                           # Agregar todos los cambios al staging
git add src/specific-file.ts        # O solo archivos específicos
git commit -m "feat: descripción"   # Crear el commit
git push origin main                # Subir a GitHub
```

---

## Comandos Esenciales

```bash
git init                    # Inicializar nuevo repositorio
git clone <url>             # Clonar repositorio existente
git status                  # Estado actual del repositorio
git log --oneline           # Ver historial de commits (compacto)
git diff                    # Ver cambios que no están en staging
git diff --staged           # Ver cambios en staging
git checkout -b feature/x   # Crear y cambiar a nueva rama
git merge feature/x         # Fusionar rama en la actual
git stash                   # Guardar cambios sin commitear temporalmente
git stash pop               # Recuperar cambios del stash
```

---

## Buenas Prácticas

1. **Commit atómico**: cada commit debe representar UN solo cambio lógico
2. **Commits frecuentes**: mejor muchos commits pequeños que uno gigante
3. **Nunca commitear secretos** (contraseñas, API keys) — usa `.gitignore`
4. **Siempre escribir mensajes descriptivos en inglés** (estándar de la industria)
5. **Usar branches para features** — nunca trabajar directamente en `main`

---

## Estructura de Branches Recomendada

```
main (producción — siempre funcional)
│
├── develop (integración)
│   │
│   ├── feature/auth-jwt
│   ├── feature/tasks-crud
│   └── feature/user-profiles
│
└── hotfix/critical-bug (arreglos urgentes en producción)
```

---

## .gitignore — Qué nunca subir

```gitignore
node_modules/    # Cientos de MB, se instala con npm install
dist/            # Código compilado, se genera con npm run build
.env             # Secretos y configuración privada
*.log            # Logs de aplicación
```

---

## Preguntas de Repaso

1. ¿Cuál es la diferencia entre `git add` y `git commit`?
2. ¿Por qué usar branches en lugar de trabajar directamente en main?
3. Escribe el mensaje de commit correcto para: "agregué validación de email al registro de usuarios"
4. ¿Qué pasa si subes `.env` a GitHub por error? ¿Cómo lo remedias?

---

## Referencias Relacionadas

[[00-Entorno-de-Desarrollo]]
[[09-Documentacion-API]]
