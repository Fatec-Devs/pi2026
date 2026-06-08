import mongoose from 'mongoose';
import { env } from '../config/env';

export async function connectDatabase(): Promise<void> {
  mongoose.connection.on('connected', () => console.log('✅ MongoDB conectado'));
  mongoose.connection.on('error', (err) => console.error('❌ Erro MongoDB:', err.message));
  mongoose.connection.on('disconnected', () => console.warn('⚠️  MongoDB desconectado'));

  process.on('SIGINT', async () => {
    await mongoose.connection.close();
    console.log('🔌 MongoDB encerrado');
    process.exit(0);
  });

  await mongoose.connect(env.mongoUri, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  });

  // Desabilita strict populate para evitar erros ao popular campos
  mongoose.set('strictPopulate', false);
}
