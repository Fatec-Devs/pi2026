import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import { UserModel, UserDocument } from '../../database/models/user.model';
import { env } from '../../config/env';
import { AppError } from '../../config/AppError';

function toPublicUser(user: UserDocument) {
  const doc = user.toObject();
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
    active: user.active,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export async function login(email: string, password: string) {
  if (!email?.trim() || !password) {
    throw new AppError('Email e senha são obrigatórios', 'VALIDATION_ERROR', 400);
  }

  const user = await UserModel.findOne({
    email: email.toLowerCase().trim(),
  }).select('+passwordHash');

  if (!user || !user.active) {
    throw new AppError('Credenciais inválidas', 'INVALID_CREDENTIALS', 401);
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatches) {
    throw new AppError('Credenciais inválidas', 'INVALID_CREDENTIALS', 401);
  }

  const signOptions: SignOptions = { expiresIn: env.jwt.expiresIn as SignOptions['expiresIn'] };
  const accessToken = jwt.sign(
    { userId: user._id.toString(), role: user.role },
    env.jwt.secret,
    signOptions,
  );

  return { accessToken, user: toPublicUser(user) };
}

export async function me(userId: string) {
  const user = await UserModel.findById(userId);

  if (!user || !user.active) {
    throw new AppError('Usuário não encontrado', 'USER_NOT_FOUND', 404);
  }

  return { user: toPublicUser(user) };
}
