import { Schema, model } from 'mongoose';
import { MachineStatus } from '../../types';

export interface MachineDocument {
  name: string;
  brand?: string;
  model?: string;
  serialNumber?: string;
  location?: string;
  status: MachineStatus;
  active: boolean;
}

const machineSchema = new Schema<MachineDocument>(
  {
    name: { type: String, required: true, trim: true },
    brand: { type: String, trim: true },
    model: { type: String, trim: true },
    serialNumber: { type: String, trim: true, unique: true, sparse: true },
    location: { type: String, trim: true },
    status: {
      type: String,
      required: true,
      enum: ['ATIVO', 'INATIVO', 'EM_MANUTENCAO'],
      default: 'ATIVO',
    },
    active: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

machineSchema.index({ serialNumber: 1 }, { unique: true, sparse: true });

export const MachineModel = model<MachineDocument>('Machine', machineSchema);