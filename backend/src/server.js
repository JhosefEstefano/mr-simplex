import 'dotenv/config';
import { crearApp } from './app.js';
import { conectarMongo } from './config/db.js';

const puerto = Number(process.env.PORT ?? 3000);

async function iniciar() {
  const app = crearApp();

  try {
    await conectarMongo(process.env.MONGODB_URI);
  } catch (error) {
    console.error('No se pudo conectar con MongoDB:', error.message);
    console.error('El servidor arrancará igualmente, pero sin persistencia.');
  }

  app.listen(puerto, () => {
    console.log(`Linear Studio API escuchando en http://localhost:${puerto}`);
  });
}

iniciar();
