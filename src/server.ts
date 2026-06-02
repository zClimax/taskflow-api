/**
 * server.ts — Punto de entrada de la aplicación
 *
 * Este es el archivo que Node.js ejecuta primero cuando iniciamos el servidor.
 * Su única responsabilidad es:
 * 1. Importar la aplicación Express (configurada en app.ts)
 * 2. Hacer que escuche peticiones en un puerto
 * 3. Mostrar un mensaje de confirmación
 *
 * Separamos server.ts de app.ts por una razón importante:
 * - app.ts configura Express pero NO escucha peticiones
 * - server.ts inicia el servidor con esa configuración
 * Esta separación facilita los tests (los tests usan app.ts sin abrir un puerto real)
 */

import { createApp } from './app.js';

// Puerto: viene de variables de entorno, o 3000 por defecto en desarrollo
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Creamos la aplicación Express
const app = createApp();

// Iniciamos el servidor — comenzamos a escuchar peticiones HTTP
app.listen(PORT, () => {
  console.log('');
  console.log('  ✅ TaskFlow API iniciada correctamente');
  console.log(`  🌐 URL Local:      http://localhost:${PORT}`);
  console.log(`  📚 API Docs:       http://localhost:${PORT}/api/docs (disponible en Módulo 3)`);
  console.log(`  🔧 Entorno:        ${process.env.NODE_ENV ?? 'development'}`);
  console.log('');
});
