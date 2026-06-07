import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UserRepository } from '../repositories/UserRepository';
import { ClientRepository } from '../repositories/ClientRepository';
import { AppError } from '../config/AppError';
import { env } from '../config/env';
import { IUser } from '../database/models/User.model';

export class AuthService {
  private userRepository: UserRepository;
  private clientRepository: ClientRepository;

  constructor() {
    this.userRepository = new UserRepository();
    this.clientRepository = new ClientRepository();
  }

  /**
   * Realiza login do usuário
   */
  async login(email: string, password: string) {
    // Busca usuário por email
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new AppError('Email ou senha inválidos', 'INVALID_CREDENTIALS', 401);
    }

    // Verifica se usuário está ativo
    if (!user.active) {
      throw new AppError('Usuário inativo', 'USER_INACTIVE', 403);
    }

    // Valida senha
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new AppError('Email ou senha inválidos', 'INVALID_CREDENTIALS', 401);
    }

    // Gera token JWT
    const token = jwt.sign(
      {
        userId: user._id.toString(),
        role: user.role,
      },
      env.jwt.secret,
      {
        expiresIn: env.jwt.expiresIn,
      }
    );

    // Retorna dados sem senha
    const userResponse = this.sanitizeUser(user);

    return {
      accessToken: token,
      user: userResponse,
    };
  }

  /**
   * Registra um novo cliente
   */
  async registerClient(data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    document?: string;
    address?: string;
  }) {
    // Verifica se email já existe
    const existingUser = await this.userRepository.findByEmail(data.email);

    if (existingUser) {
      throw new AppError('Email já cadastrado', 'EMAIL_ALREADY_EXISTS', 409);
    }

    // Hash da senha
    const passwordHash = await bcrypt.hash(
      data.password,
      env.bcryptSaltRounds
    );

    // Cria usuário
    const user = await this.userRepository.create({
      name: data.name,
      email: data.email,
      passwordHash,
      phone: data.phone,
      role: 'CLIENT',
      active: true,
    });

    // Cria registro de cliente
    await this.clientRepository.create({
      userId: user._id,
      document: data.document,
      address: data.address,
    });

    // Gera token JWT
    const token = jwt.sign(
      {
        userId: user._id.toString(),
        role: user.role,
      },
      env.jwt.secret,
      {
        expiresIn: env.jwt.expiresIn,
      }
    );

    // Retorna dados sem senha
    const userResponse = this.sanitizeUser(user);

    return {
      accessToken: token,
      user: userResponse,
    };
  }

  /**
   * Busca dados do usuário autenticado
   */
  async getMe(userId: string) {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new AppError('Usuário não encontrado', 'USER_NOT_FOUND', 404);
    }

    return this.sanitizeUser(user);
  }

  /**
   * Remove dados sensíveis do usuário
   */
  private sanitizeUser(user: IUser) {
    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      active: user.active,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
