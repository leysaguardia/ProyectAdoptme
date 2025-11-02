
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
const PORT = process.env.PORT||8080;
//const connection = mongoose.connect(`URL DE MONGO`)

await mongoose.connect(process.env.MONGO_URL);

console.log('✅ Conectado a MongoDB');

app.use(express.json());
app.use(cookieParser());

app.use('/api/users',usersRouter);
app.use('/api/pets',petsRouter);
app.use('/api/adoptions',adoptionsRouter);
app.use('/api/sessions',sessionsRouter);
app.use('/api/mocks', mocksRouter);

console.log('→ mocks montado en /api/mocks'); 

app.get('/__ping', (req, res) => res.json({ ok: true, port: PORT }));

mountSwagger(app);

//app.listen(PORT,()=>console.log(`Listening on ${PORT}`))



export default app;


if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => console.log(`🚀 Servidor escuchando en puerto ${PORT}`));
}



