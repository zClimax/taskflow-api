# Entorno de Desarrollo — Node.js + TypeScript

## Definición

El **entorno de desarrollo** es el conjunto de herramientas, configuraciones y convenciones que un equipo usa para crear software de manera consistente y reproducible.

Un entorno bien configurado:
- Previene el clásico problema "en mi máquina funciona"
- Estandariza el estilo de código entre desarrolladores
- Automatiza tareas repetitivas (compilación, testing, formateo)
- Establece buenas prácticas desde el inicio

---

## Conceptos Clave

- **Node.js**: Entorno de ejecución de JavaScript fuera del navegador
- **npm**: Gestor de paquetes de Node.js (instala librerías)
- **TypeScript**: Superset de JavaScript con tipado estático
- **`tsconfig.json`**: Archivo de configuración del compilador TypeScript
- **`package.json`**: "DNI" del proyecto — metadatos y dependencias
- **`.gitignore`**: Lista de archivos que Git debe ignorar
- **`.env`**: Variables de entorno — configuración sensible (contraseñas, URLs)
- **ESLint**: Herramienta de análisis estático de código (detecta errores y malas prácticas)
- **Hot Reload**: El servidor se reinicia automáticamente al guardar un archivo

---

## Stack Tecnológico del Proyecto

| Herramienta | Versión | Rol |
|---|---|---|
| Node.js | 24.x LTS | Runtime de JavaScript |
| TypeScript | 5.x | Tipado estático |
| Express.js | 5.x | Framework web |
| tsx | 4.x | Ejecutor TypeScript en desarrollo |
| ESLint | 9.x | Linting y calidad de código |

---

## Estructura del Proyecto

```
taskflow-api/
├── src/
│   ├── api/
│   │   ├── controllers/   # Manejan HTTP: reciben req, llaman service, responden
│   │   ├── routes/        # Definen: URL + método HTTP → controller
│   │   ├── middleware/    # Código que corre ENTRE petición y controller
│   │   └── validators/    # Validan datos de entrada
│   ├── services/          # Lógica de negocio
│   ├── repositories/      # Acceso a base de datos
│   ├── config/            # Variables de entorno y configuración
│   ├── utils/             # Funciones de utilidad
│   ├── types/             # Tipos TypeScript compartidos
│   ├── app.ts             # Configuración de Express
│   └── server.ts          # Punto de entrada (escucha peticiones)
├── tests/                 # Tests automatizados
├── docs/                  # Documentación de la API
└── obsidian-vault/        # Notas de aprendizaje (este directorio)
```

---

## Comandos Esenciales

```bash
npm run dev          # Iniciar servidor en modo desarrollo (hot reload)
npm run build        # Compilar TypeScript → JavaScript
npm start            # Ejecutar en producción
npm test             # Ejecutar tests
npm run lint         # Verificar calidad de código
npm run lint:fix     # Corregir errores de lint automáticamente
```

---

## Variables de Entorno

Las variables de entorno son pares clave-valor que configuran la aplicación según el contexto (desarrollo, producción). Se almacenan en `.env` y **NUNCA se suben a GitHub**.

```bash
# Por qué son importantes:
NODE_ENV=development     # Define el comportamiento de la app
PORT=3000                # Puerto donde escucha el servidor
DATABASE_URL=...         # Conexión a la base de datos (¡secreto!)
JWT_ACCESS_SECRET=...    # Clave para firmar tokens (¡secreto!)
```

El archivo `.env.example` SÍ se sube a GitHub como plantilla para otros desarrolladores.

---

## Buenas Prácticas

1. **Separa `server.ts` de `app.ts`** — facilita el testing
2. **Activa modo estricto de TypeScript** — detecta más errores
3. **Nunca hardcodees secretos** — usa variables de entorno
4. **Configura ESLint desde el inicio** — la deuda de código se acumula rápido
5. **Haz tu primer commit antes de escribir lógica** — establece una base limpia

---

## Errores Comunes

| Error | Causa | Solución |
|---|---|---|
| `Cannot find module` | Importación incorrecta o extensión faltante | En ESM: usar `.js` en imports, incluso en archivos `.ts` |
| `npm: execution of scripts disabled` | Política de PowerShell en Windows | `Set-ExecutionPolicy RemoteSigned -Scope CurrentUser` |
| `.env` en el repositorio | No configurar `.gitignore` antes del primer commit | Remover con `git rm --cached .env` |
| `TypeError: req.body is undefined` | Falta `express.json()` middleware | Agregar `app.use(express.json())` |

---

## Preguntas de Repaso

1. ¿Por qué separamos `server.ts` de `app.ts`? ¿Qué ventaja da esto para los tests?
2. ¿Qué diferencia hay entre una `devDependency` y una `dependency` en `package.json`?
3. ¿Por qué TypeScript activa `"strict": true` en proyectos profesionales?
4. ¿Qué información debería ir en `.env` vs `.env.example`?
5. ¿Qué hace exactamente el `node_modules` y por qué no se sube a GitHub?

---

## Referencias Relacionadas

[[01-API-REST-Fundamentos]]
[[00-TypeScript-Fundamentos]]
[[00-Git-GitHub-Basico]]
