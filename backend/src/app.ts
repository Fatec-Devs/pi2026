import express from 'express';
import cors from 'cors';
import { connectDatabase } from './database/connection';
import { env } from './config/env';
import { errorHandler } from './middlewares/errorHandler.middleware';
import router from './routes';

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api', router);
app.use(errorHandler);

async function bootstrap() {
  await connectDatabase();
  app.listen(env.port, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${env.port}`);
  });
}

bootstrap().catch(console.error);
