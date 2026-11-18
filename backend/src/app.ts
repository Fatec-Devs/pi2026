import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import { connectDatabase } from './database/connection';
import { env } from './config/env';
import { errorHandler } from './middlewares/errorHandler.middleware';
import router from './routes';
import { UserModel } from './database/models/User.model';

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api', router);
app.use(errorHandler);

async function bootstrap() {
  await connectDatabase();

  const defaultAdminPasswordHash = await bcrypt.hash('senha123', env.bcryptSaltRounds);

  await UserModel.updateOne(
    { email: 'admin@pi-app-2026.com' },
    {
      $set: {
        name: 'Admin',
        email: 'admin@pi-app-2026.com',
        passwordHash: defaultAdminPasswordHash,
        role: 'ADMIN',
        phone: '',
        active: true,
      },
    },
    { upsert: true },
  );

  const host = process.env.HOST || '0.0.0.0';
  app.listen(env.port, host, () => {
    console.log(`🚀 Servidor rodando em http://${host}:${env.port}`);
    console.log(`🌐 Acesso local: http://localhost:${env.port}`);
  });
}

bootstrap().catch(console.error);
