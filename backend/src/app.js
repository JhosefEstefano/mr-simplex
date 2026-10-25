import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import resolverRoutes from './routes/resolver.routes.js';
import { manejadorDeErrores, rutaNoEncontrada } from './middlewares/errores.js';

/**
 * Crea la aplicación Express con sus middlewares y rutas.
 * No abre ninguna conexión a la base de datos: eso es responsabilidad del
 * servidor (src/server.js), para que las pruebas puedan usarla sin MongoDB.
 *
 * @returns {import('express').Express}
 */
export function crearApp() {
  const app = express();

  app.use(
    cors({
      origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173'
    })
  );
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (req, res) => {
    res.status(200).json({
      estado: 'OK',
      servicio: 'Linear Studio API',
      version: '1.0.0',
      baseDeDatos: mongoose.connection.readyState === 1 ? 'conectada' : 'sin conexión'
    });
  });

  app.use('/api/resolver', resolverRoutes);

  app.use(rutaNoEncontrada);
  app.use(manejadorDeErrores);

  return app;
}
