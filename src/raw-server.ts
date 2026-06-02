/**
 * raw-server.ts — Servidor HTTP SIN Express
 *
 * PROPÓSITO EDUCATIVO: Este archivo muestra cómo funciona HTTP a nivel bajo.
 * Node.js tiene un módulo 'http' incorporado que permite crear servidores
 * sin ninguna librería externa.
 *
 * Después de ver esto, entenderás exactamente QUÉ hace Express por debajo
 * y por qué frameworks como Express existen.
 *
 * Para ejecutar: npx tsx src/raw-server.ts
 */

import http from 'node:http';
import { URL } from 'node:url';

// Creamos el servidor. La función callback se ejecuta en CADA petición.
const server = http.createServer((req, res) => {

  // ── 1. Leer información de la petición ──────────────────────────────────
  const method = req.method ?? 'GET';                    // GET, POST, etc.
  const url = new URL(req.url ?? '/', `http://${req.headers.host}`);
  const pathname = url.pathname;                          // /api/users

  console.log(`[${new Date().toISOString()}] ${method} ${pathname}`);

  // ── 2. Manejar el body (datos enviados en POST/PUT/PATCH) ────────────────
  // HTTP es un stream: los datos llegan en "chunks" (trozos)
  // Debemos acumularlos y esperar el evento 'end' para procesarlos
  let rawBody = '';
  req.on('data', (chunk: Buffer) => {
    rawBody += chunk.toString();
  });

  req.on('end', () => {
    // Una vez recibido todo el body, procesamos la petición
    handleRequest(method, pathname, rawBody, res);
  });
});

// ── Base de datos en memoria (simulada) ─────────────────────────────────────
// En módulos posteriores esto será una base de datos real (PostgreSQL)
interface Task {
  id: number;
  title: string;
  done: boolean;
}
const tasks: Task[] = [
  { id: 1, title: 'Aprender qué es HTTP', done: true },
  { id: 2, title: 'Entender métodos HTTP', done: false },
  { id: 3, title: 'Crear primer servidor', done: false },
];
let nextId = 4;

// ── Router Manual ────────────────────────────────────────────────────────────
// Sin Express, tenemos que hacer routing manual con if/else.
// Así entiendes por qué Express es valioso: elimina este código repetitivo.
function handleRequest(
  method: string,
  pathname: string,
  rawBody: string,
  res: http.ServerResponse
): void {

  // ─── GET / ────────────────────────────────────────────────────────────────
  if (method === 'GET' && pathname === '/') {
    sendJson(res, 200, {
      message: 'Servidor HTTP raw con Node.js (sin Express)',
      endpoints: {
        'GET /tasks': 'Listar todas las tareas',
        'POST /tasks': 'Crear una nueva tarea',
        'GET /tasks/:id': 'Obtener una tarea por ID',
      },
    });
    return;
  }

  // ─── GET /tasks ───────────────────────────────────────────────────────────
  if (method === 'GET' && pathname === '/tasks') {
    sendJson(res, 200, { data: tasks, total: tasks.length });
    return;
  }

  // ─── POST /tasks ──────────────────────────────────────────────────────────
  if (method === 'POST' && pathname === '/tasks') {
    // Parsear el body manualmente
    let body: { title?: string };
    try {
      body = JSON.parse(rawBody) as { title?: string };
    } catch {
      sendJson(res, 400, { error: 'Body inválido: debe ser JSON válido' });
      return;
    }

    // Validación manual (sin Zod aún)
    if (!body.title || typeof body.title !== 'string') {
      sendJson(res, 400, { error: 'El campo "title" es requerido y debe ser un string' });
      return;
    }

    // Crear la tarea
    const newTask: Task = { id: nextId++, title: body.title, done: false };
    tasks.push(newTask);

    // 201 Created = se creó un nuevo recurso exitosamente
    sendJson(res, 201, { data: newTask });
    return;
  }

  // ─── GET /tasks/:id ───────────────────────────────────────────────────────
  // Routing con parámetros dinámicos: tenemos que hacerlo a mano sin Express
  const taskMatch = pathname.match(/^\/tasks\/(\d+)$/);
  if (method === 'GET' && taskMatch) {
    const id = parseInt(taskMatch[1]!, 10);
    const task = tasks.find((t) => t.id === id);

    if (!task) {
      // 404 Not Found = el recurso no existe
      sendJson(res, 404, { error: `Tarea con id ${id} no encontrada` });
      return;
    }

    sendJson(res, 200, { data: task });
    return;
  }

  // ─── 404 por defecto ──────────────────────────────────────────────────────
  sendJson(res, 404, { error: `Ruta '${method} ${pathname}' no encontrada` });
}

// ── Helper: enviar respuesta JSON ────────────────────────────────────────────
// Sin Express, debemos setear headers y serializar JSON manualmente.
// Express hace todo esto automáticamente con res.json()
function sendJson(
  res: http.ServerResponse,
  statusCode: number,
  data: unknown
): void {
  const body = JSON.stringify(data, null, 2);

  // Headers HTTP que debemos setear manualmente sin Express
  res.setHeader('Content-Type', 'application/json');        // Tipo de contenido
  res.setHeader('Content-Length', Buffer.byteLength(body)); // Tamaño del body
  res.setHeader('X-Powered-By', 'Node.js raw http module'); // Header informativo

  res.writeHead(statusCode); // Escribe el status code
  res.end(body);             // Envía el body y cierra la conexión
}

// ── Iniciar servidor ─────────────────────────────────────────────────────────
const PORT = 3001; // Usamos 3001 para no conflictuar con el servidor Express
server.listen(PORT, () => {
  console.log('');
  console.log('  🌐 Servidor HTTP RAW (sin Express) corriendo');
  console.log(`  📡 http://localhost:${PORT}`);
  console.log('');
  console.log('  Prueba con estos comandos en otra terminal:');
  console.log(`  GET  → curl http://localhost:${PORT}/tasks`);
  console.log(`  POST → curl -X POST http://localhost:${PORT}/tasks -H "Content-Type: application/json" -d "{\\"title\\":\\"Mi tarea\\"}" `);
  console.log('');
});
