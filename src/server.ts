/**
 * server.ts — Punto de entrada de la aplicación
 *
 * Única responsabilidad: importar la app configurada y hacer que escuche
 * peticiones en el puerto definido en las variables de entorno.
 *
 * Separado de app.ts para facilitar el testing:
 *   - Los tests importan createApp() (sin puerto abierto)
 *   - server.ts arranca el puerto real (solo en ejecución normal)
 */

import { createApp } from './app.js';
import { config } from './config/env.js';

const app = createApp();

const server = app.listen(config.port, () => {
  console.log('');
  console.log('  ✅ TaskFlow API iniciada correctamente');
  console.log(`  🌐 URL Local:      http://localhost:${config.port}`);
  console.log(`  📡 API base:       http://localhost:${config.port}/api/${config.apiVersion}`);
  console.log(`  ❤️  Health check:  http://localhost:${config.port}/health`);
  console.log(`  🔧 Entorno:        ${config.env}`);
  console.log('');
});

// Manejo elegante del cierre del servidor (Graceful Shutdown)
// Cuando el proceso recibe SIGTERM (ej: Ctrl+C o el host para la app),
// cerramos el servidor limpiamente antes de salir
process.on('SIGTERM', () => {
  console.log('SIGTERM recibido. Cerrando servidor...');
  server.close(() => {
    console.log('Servidor cerrado.');
    process.exit(0);
  });
});
