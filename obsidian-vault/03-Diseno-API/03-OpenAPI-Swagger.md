# OpenAPI y Swagger — Referencia Técnica

## ¿Qué es OpenAPI?

**OpenAPI** (antes llamado Swagger) es el estándar de la industria para describir APIs REST de forma legible por máquinas y por humanos. Es un archivo YAML o JSON que documenta completamente tu API.

Mantenido por la **OpenAPI Initiative** (Linux Foundation), con soporte de Google, Microsoft, IBM, y otros.

---

## ¿Por qué es importante?

- **Contrato entre equipos**: Frontend y backend acuerdan la interfaz antes de codificar
- **Generación de código**: Herramientas generan clientes SDK automáticamente desde la spec
- **Testing automático**: Herramientas validan que tu API cumple la especificación
- **Documentación interactiva**: Swagger UI permite probar endpoints sin Postman

---

## Estructura de la Especificación

```yaml
openapi: 3.0.3          # Versión del estándar

info:
  title: TaskFlow API
  version: 1.0.0
  description: Mi API

servers:
  - url: http://localhost:3000/api/v1

components:
  schemas:              # Tipos reutilizables
    Task: ...
  securitySchemes:      # Métodos de autenticación
    bearerAuth: ...

tags:                   # Agrupación en la UI
  - name: Tasks
  - name: Auth

paths:                  # Los endpoints
  /tasks:
    get: ...
    post: ...
  /tasks/{id}:
    get: ...
    patch: ...
    delete: ...
```

---

## Definición de un Path/Operación

```yaml
/tasks:
  post:
    tags: [Tasks]
    summary: Crear tarea           # Título corto en la UI
    description: |                 # Descripción larga (markdown)
      Crea una nueva tarea en el sistema.
    security:
      - bearerAuth: []             # Requiere JWT
    requestBody:
      required: true
      content:
        application/json:
          schema:
            type: object
            required: [title, projectId]
            properties:
              title:
                type: string
                example: Mi tarea
              projectId:
                type: string
    responses:
      201:
        description: Tarea creada
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/Task'  # Referencia al schema
      400:
        description: Datos inválidos
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/Error'
```

---

## Schemas: El Sistema de Tipos de OpenAPI

```yaml
components:
  schemas:
    Task:
      type: object
      properties:
        id:
          type: string
          example: cuid2abc123
        title:
          type: string
          example: Implementar autenticación
        status:
          type: string
          enum: [TODO, IN_PROGRESS, IN_REVIEW, DONE]
        priority:
          type: string
          enum: [LOW, MEDIUM, HIGH, URGENT]
        dueDate:
          type: string
          format: date
          nullable: true
```

---

## swagger-jsdoc: Docs-as-Code

En lugar de mantener un archivo YAML separado, `swagger-jsdoc` extrae la documentación de los comentarios del código:

```typescript
/**
 * @openapi
 * /tasks:
 *   get:
 *     tags: [Tasks]
 *     summary: Listar tareas
 *     responses:
 *       200:
 *         description: Lista de tareas
 */
router.get('/', getAllTasks);
```

**Ventaja**: Si eliminas el endpoint del código y el comentario, la doc se actualiza sola. No hay documentación desincronizada.

---

## Swagger UI — Funcionalidades Clave

Accesible en `/api/docs`:

| Funcionalidad | Descripción |
|---|---|
| **Try it out** | Ejecuta peticiones reales contra la API |
| **Authorize** | Guarda el JWT Bearer token para todas las peticiones |
| **Filter** | Busca endpoints por nombre |
| **Request duration** | Muestra el tiempo de respuesta |
| **Schema viewer** | Visualiza los tipos de datos |

---

## Alternativas a Swagger UI

| Herramienta | Enfoque | Cuándo usarla |
|---|---|---|
| **Swagger UI** | Estándar, conocida | La más usada, buena para portfolios |
| **ReDoc** | Más bonita, solo lectura | Documentación pública de producción |
| **Stoplight Elements** | Moderna, customizable | Proyectos empresariales |
| **Postman** | Testing + docs | Colaboración en equipo |

---

## Preguntas de Repaso

1. ¿Qué ventaja tiene usar `$ref: '#/components/schemas/Task'` en lugar de repetir el schema?
2. ¿Por qué algunos endpoints tienen `security: []` (array vacío)?
3. ¿Cuándo usarías ReDoc en lugar de Swagger UI?
4. ¿Qué es swagger-jsdoc y por qué es preferible a un archivo YAML manual?

---

## Referencias Relacionadas

[[03-Diseno-API-REST]]
[[01-Metodos-HTTP-Codigos-Estado]]
[[09-Documentacion-API]]
