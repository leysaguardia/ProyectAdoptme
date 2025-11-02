
import 'dotenv/config';

import express from 'express';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';

import usersRouter from './routes/users.router.js';
import petsRouter from './routes/pets.router.js';
import adoptionsRouter from './routes/adoption.router.js';
import sessionsRouter from './routes/sessions.router.js';
import mocksRouter from './routes/mocks.router.js';
import { mountSwagger } from './docs/swagger.js';

const app = express();
const PORT = process.env.PORT || 8080;


await mongoose.connect(process.env.MONGO_URL);
console.log('✅ Conectado a MongoDB');

app.use(express.json());
app.use(cookieParser());


app.use('/api/users', usersRouter);
app.use('/api/pets', petsRouter);
app.use('/api/adoptions', adoptionsRouter);
app.use('/api/sessions', sessionsRouter);
app.use('/api/mocks', mocksRouter);
console.log('→ mocks montado en /api/mocks');


app.get('/__ping', (req, res) => res.json({ ok: true, port: PORT }));


mountSwagger(app);

app.get('/', (req, res) => {
  res.json({
    ok: true,
    message: 'API funcionando ',
    docs: '/docs',
    ping: '/__ping',
    ejemplos: ['/api/mocks', '/api/users', '/api/pets']
  });
});


app.use((req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
    method: req.method,
    path: req.originalUrl
  });
});




export default app;


let server = null;

function startServer() {
  server = app.listen(PORT, () => {
    console.log(`🚀 Servidor escuchando en puerto ${PORT}`);
  });
}

async function closeMongoSafely() {
  try {
    
    if (mongoose.connection && mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log(' Conexión MongoDB cerrada.');
    }
  } catch (err) {
    console.error('Error cerrando MongoDB:', err);
  }
}

function gracefulShutdown(signal) {
  console.log(` Recibí ${signal}, iniciando cierre ordenado…`);

  const closeHttp = new Promise((resolve) => {
    if (server) {
      server.close(() => {
        console.log('🔌 HTTP cerrado.');
        resolve();
      });
    } else {
      resolve();
    }
  });

  
  Promise.resolve()
    .then(() => closeHttp)
    .then(() => closeMongoSafely())
    .then(() => {
      console.log(' Cierre ordenado completo. Saliendo con código 0.');
      process.exit(0);
    })
    .catch((err) => {
      console.error(' Error durante el cierre ordenado:', err);
      process.exit(0); 
    });

  
  setTimeout(() => {
    console.warn('⏱ Tiempo de espera excedido. Forzando salida.');
    process.exit(0);
  }, 10000).unref();
}


if (process.env.NODE_ENV !== 'test') {
  startServer();
}


process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));


process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});
