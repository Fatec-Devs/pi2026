import mongoose, { Schema, Document } from 'mongoose';

// Interface para o documento Client
export interface IClient extends Document {
  userId: mongoose.Types.ObjectId;
  document?: string;
  address?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Schema do Client
const ClientSchema = new Schema<IClient>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Usuário é obrigatório'],
      unique: true,
    },
    document: {
      type: String,
      trim: true,
      sparse: true, // Permite múltiplos valores null mas único se preenchido
    },
    address: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Índices
ClientSchema.index({ userId: 1 });
ClientSchema.index({ document: 1 }, { sparse: true });

// Model
export const Client = mongoose.model<IClient>('Client', ClientSchema);
