import { Schema, model, Types } from 'mongoose';
import { MachineStatus } from '../../types';

export interface IMachine {
  clientId?: Types.ObjectId;
  name: string;
  brand?: string;
  model?: string;
  serialNumber?: string;
  location?: string;
  notes?: string;
  status: MachineStatus;
  active: boolean;
}

const machineSchema = new Schema<IMachine>(
  {
    clientId: { type: Schema.Types.ObjectId, ref: 'Client' },
    name: { type: String, required: true, trim: true },
    brand: { type: String, trim: true },
    model: { type: String, trim: true },
    serialNumber: { type: String, trim: true, unique: true, sparse: true },
    location: { type: String, trim: true },
    notes: { type: String, trim: true },
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


export const Machine = model<IMachine>('Machine', machineSchema);


export type MachineDocument = IMachine;
export const MachineModel = Machine;