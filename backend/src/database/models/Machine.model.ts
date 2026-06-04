import mongoose, { Schema, Document } from 'mongoose';

// Interface para o documento Machine
export interface IMachine extends Document {
  clientId?: mongoose.Types.ObjectId;
  name: string;
  brand?: string;
  model?: string;
  serialNumber?: string;
  location?: string;
  status?: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Schema do Machine
const MachineSchema = new Schema<IMachine>(
  {
    clientId: {
      type: Schema.Types.ObjectId,
      ref: 'Client',
    },
    name: {
      type: String,
      required: [true, 'Nome é obrigatório'],
      trim: true,
    },
    brand: {
      type: String,
      trim: true,
    },
    model: {
      type: String,
      trim: true,
    },
    serialNumber: {
      type: String,
      trim: true,
      sparse: true,
    },
    location: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      trim: true,
      default: 'OPERACIONAL',
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
MachineSchema.index({ clientId: 1 });
MachineSchema.index({ serialNumber: 1 }, { sparse: true });
MachineSchema.index({ active: 1 });

// Model
export const Machine = mongoose.model<IMachine>('Machine', MachineSchema);
