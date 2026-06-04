import mongoose, { Schema, Document } from 'mongoose';

// Interface para o documento User
export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: 'ADMIN' | 'CLIENT';
  phone?: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Schema do User
const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Nome é obrigatório'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email é obrigatório'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Email inválido'],
    },
    passwordHash: {
      type: String,
      required: [true, 'Senha é obrigatória'],
    },
    role: {
      type: String,
      enum: ['ADMIN', 'CLIENT'],
      required: [true, 'Perfil é obrigatório'],
    },
    phone: {
      type: String,
      trim: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Índices
UserSchema.index({ email: 1 });

// Model
export const User = mongoose.model<IUser>('User', UserSchema);
