import { User, IUser } from '../database/models/User.model';

export class UserRepository {
  /**
   * Cria um novo usuário
   */
  async create(data: Partial<IUser>): Promise<IUser> {
    const user = new User(data);
    return await user.save();
  }

  /**
   * Busca usuário por ID
   */
  async findById(id: string): Promise<IUser | null> {
    return await User.findById(id);
  }

  /**
   * Busca usuário por email
   */
  async findByEmail(email: string): Promise<IUser | null> {
    return await User.findOne({ email: email.toLowerCase() });
  }

  /**
   * Lista todos os usuários
   */
  async findAll(): Promise<IUser[]> {
    return await User.find();
  }

  /**
   * Lista usuários por perfil
   */
  async findByRole(role: 'ADMIN' | 'CLIENT'): Promise<IUser[]> {
    return await User.find({ role });
  }

  /**
   * Atualiza um usuário
   */
  async update(id: string, data: Partial<IUser>): Promise<IUser | null> {
    return await User.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
  }

  /**
   * Remove um usuário (soft delete)
   */
  async delete(id: string): Promise<IUser | null> {
    return await User.findByIdAndUpdate(
      id,
      { active: false },
      { new: true }
    );
  }

  /**
   * Remove permanentemente um usuário
   */
  async hardDelete(id: string): Promise<IUser | null> {
    return await User.findByIdAndDelete(id);
  }
}
