# API REST — Fundamentos

## Definición

Una **API REST** (Application Programming Interface — Representational State Transfer) es un conjunto de reglas que define cómo dos sistemas de software deben comunicarse a través de HTTP.

No es un protocolo ni una librería. Es un **estilo arquitectónico** definido por Roy Fielding en su tesis doctoral del año 2000.

Una API REST expone **recursos** (datos) a través de **URLs**, y permite operar sobre ellos usando los **métodos HTTP estándar**.

---

## Conceptos Clave

- **Cliente**: quien inicia la comunicación (navegador, app móvil, Postman)
- **Servidor**: quien escucha y responde (tu API en Node.js)
- **HTTP**: el protocolo de comunicación (texto plano sobre TCP/IP)
- **Request**: mensaje del cliente al servidor
- **Response**: mensaje del servidor al cliente
- **Recurso**: entidad de datos identificada por una URL (`/tasks`, `/users/42`)
- **Stateless**: cada petición es independiente, el servidor no recuerda peticiones anteriores
- **JSON**: formato de datos más usado para intercambio en APIs REST modernas

---

## Los 6 Principios de REST (Constraints de Fielding)

| # | Principio | Impacto Práctico |
|---|---|---|
| 1 | **Cliente-Servidor** | Frontend y backend son independientes |
| 2 | **Sin Estado (Stateless)** | No hay sesiones en el servidor — usamos JWT |
| 3 | **Cacheable** | Las respuestas indican si se pueden cachear |
| 4 | **Interfaz Uniforme** | URLs consistentes, verbos HTTP estándar |
| 5 | **Sistema en Capas** | Puedes poner load balancers, CDNs sin que el cliente lo sepa |
| 6 | **Código bajo demanda** | Opcional — el servidor puede enviar código ejecutable |

---

## Anatomía de una Petición HTTP

```http
POST /api/v1/tasks HTTP/1.1
Host: localhost:3000
Content-Type: application/json
Authorization: Bearer eyJhbGci...

{
  "title": "Aprender REST",
  "projectId": 1
}
```

| Parte | Ejemplo | Descripción |
|---|---|---|
| **Método** | `POST` | Operación a realizar |
| **URL** | `/api/v1/tasks` | Recurso sobre el que operar |
| **Versión** | `HTTP/1.1` | Versión del protocolo |
| **Headers** | `Content-Type: application/json` | Metadatos de la petición |
| **Body** | `{ "title": "..." }` | Datos enviados (solo en POST/PUT/PATCH) |

---

## Anatomía de una Respuesta HTTP

```http
HTTP/1.1 201 Created
Content-Type: application/json

{
  "id": 5,
  "title": "Aprender REST",
  "done": false,
  "createdAt": "2026-06-01T21:30:00Z"
}
```

---

## Ejemplos del Mundo Real

| API | Qué expone | Ejemplo de endpoint |
|---|---|---|
| GitHub API | Repositorios, issues, commits | `GET /repos/zClimax/taskflow-api` |
| Stripe API | Pagos, clientes, suscripciones | `POST /v1/payment_intents` |
| Twitter/X API | Tweets, usuarios, follows | `GET /2/tweets/:id` |
| OpenWeather API | Clima, pronósticos | `GET /weather?q=Madrid` |

---

## Buenas Prácticas

1. **Usa sustantivos en plural para recursos**: `/tasks` no `/getTask`
2. **Nunca pongas verbos en la URL**: el verbo lo da el método HTTP
3. **Usa los códigos de estado correctos**: `201` para crear, `204` para borrar sin body
4. **Versiona tu API desde el inicio**: `/api/v1/`
5. **Responde siempre JSON con `Content-Type: application/json`**
6. **Nunca retornes `200 OK` con un error adentro** — usa los códigos 4xx/5xx

---

## Errores Comunes

| Error | Ejemplo incorrecto | Corrección |
|---|---|---|
| Verbos en URLs | `POST /createTask` | `POST /tasks` |
| Status code incorrecto | `200 OK` cuando el recurso no existe | `404 Not Found` |
| Mezclar singular y plural | `/task` y `/users` | Siempre plural: `/tasks`, `/users` |
| Retornar error como 200 | `{ "success": false, "error": "..." }` con status 200 | Usar `400`, `404`, `500` según el caso |

---

## Preguntas de Repaso

1. ¿Qué diferencia hay entre `PUT` y `PATCH`? Da un ejemplo con TaskFlow.
2. ¿Por qué REST es "stateless"? ¿Cómo mantenemos la sesión del usuario entonces?
3. Un endpoint devuelve `200 OK` pero con `{ "error": "Usuario no encontrado" }`. ¿Qué está mal?
4. ¿Cuándo usarías `204 No Content` en lugar de `200 OK`?
5. ¿Qué diferencia a una API REST de una API que simplemente usa HTTP?

---

## Referencias Relacionadas

[[01-Protocolo-HTTP]]
[[01-Metodos-HTTP-Codigos-Estado]]
[[02-Express-Fundamentos]]
[[00-Entorno-de-Desarrollo]]
