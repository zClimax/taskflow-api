# Protocolo HTTP — Profundización

## ¿Qué es HTTP?

HTTP (HyperText Transfer Protocol) es el protocolo de comunicación de la web. Opera sobre TCP/IP y define cómo se estructuran y transmiten mensajes entre clientes y servidores.

Es **texto plano** — si pudieras interceptar el cable de red, verías texto legible.

---

## Versiones de HTTP

| Versión | Año | Característica Clave |
|---|---|---|
| HTTP/1.0 | 1996 | Una conexión por request |
| HTTP/1.1 | 1997 | Conexiones persistentes (keep-alive), pipelining |
| HTTP/2 | 2015 | Multiplexing, headers comprimidos, server push |
| HTTP/3 | 2022 | Basado en QUIC (UDP), menor latencia |

> Para APIs REST típicas, HTTP/1.1 y HTTP/2 son los más usados. Tu API funcionará bien con cualquiera.

---

## Estructura Completa de un Request

```
┌─────────────────────────────────────────────────┐
│  POST /api/v1/tasks HTTP/1.1                     │  ← Request Line
├─────────────────────────────────────────────────┤
│  Host: api.taskflow.com                          │  ←
│  Content-Type: application/json                 │  ← Headers
│  Content-Length: 42                              │  ←
│  Authorization: Bearer eyJhbGci...              │  ←
│  Accept: application/json                       │  ←
├─────────────────────────────────────────────────┤
│  (línea en blanco obligatoria)                  │
├─────────────────────────────────────────────────┤
│  {                                               │  ←
│    "title": "Aprender HTTP",                    │  ← Body
│    "projectId": 1                                │  ←
│  }                                               │  ←
└─────────────────────────────────────────────────┘
```

---

## Headers HTTP Más Importantes

### En el Request

| Header | Ejemplo | Propósito |
|---|---|---|
| `Content-Type` | `application/json` | Formato del body que envío |
| `Accept` | `application/json` | Formato que espero recibir |
| `Authorization` | `Bearer <token>` | Token de autenticación |
| `Host` | `api.taskflow.com` | Dominio del servidor |
| `User-Agent` | `PostmanRuntime/7.x` | Quién hace la petición |

### En el Response

| Header | Ejemplo | Propósito |
|---|---|---|
| `Content-Type` | `application/json` | Formato del body de respuesta |
| `Content-Length` | `342` | Tamaño del body en bytes |
| `Cache-Control` | `no-cache` | Política de caché |
| `X-Request-Id` | `abc-123-def` | ID único de la petición (para logs) |
| `Retry-After` | `60` | Segundos a esperar (después de 429) |
| `Location` | `/api/v1/tasks/42` | URL del recurso creado (después de 201) |

---

## El Body HTTP

El body es opcional y solo tiene sentido en:
- `POST` — crear recurso
- `PUT` — reemplazar recurso
- `PATCH` — actualizar parcialmente

**`GET` y `DELETE` NO llevan body** — los datos van en la URL o query params.

```
GET /api/v1/tasks?status=pending&limit=10&page=2
               │              │         │
               URL base       Query params (filtros, paginación)
```

---

## Flujo Interno de una Petición en Node.js

```
Cliente envía bytes TCP
        │
        ▼
Node.js recibe el stream
        │
        ▼
Parsea la request line (método + URL + versión HTTP)
        │
        ▼
Parsea los headers
        │
        ▼
Stream del body (eventos 'data' + 'end')
        │
        ▼
Tu callback se ejecuta con (req, res)
        │
        ▼
Tu código procesa y llama res.end()
        │
        ▼
Node.js serializa la respuesta y la envía por TCP
```

Express automatiza todo este proceso interno.

---

## ¿Qué hace Express por debajo?

Cuando usas `app.use(express.json())`, Express:
1. Verifica que `Content-Type: application/json` esté en el header
2. Acumula los chunks del stream del body
3. Parsea el JSON con `JSON.parse()`
4. Pone el resultado en `req.body`

Sin Express tienes que hacer todo esto manualmente (como en `raw-server.ts`).

---

## HTTPS — HTTP Seguro

HTTPS es HTTP + TLS (Transport Layer Security):
- Cifra toda la comunicación (nadie puede leer los datos en tránsito)
- Autentica el servidor (certificado SSL)
- En producción, HTTPS es **obligatorio**. Nunca envíes datos sensibles por HTTP plano.

Los servicios de hosting (Render, Railway) proveen HTTPS automático.

---

## Referencias Relacionadas

[[01-API-REST-Fundamentos]]
[[01-Metodos-HTTP-Codigos-Estado]]
