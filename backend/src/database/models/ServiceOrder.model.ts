import { Schema, model, Document, Types } from 'mongoose';
import { ServiceOrderStatus } from '../../types';

export interface ServiceOrderServiceItem {
  description: string;
  estimatedHours: number;
  price: number;
}

export interface ServiceOrderMaterialUsage {
  inventoryItemId: Types.ObjectId;
  quantity: number;
  unitCost: number;
}

export interface IServiceOrder extends Document {
  clientId: Types.ObjectId;
  machineId: Types.ObjectId;
  status: ServiceOrderStatus;
  services: ServiceOrderServiceItem[];
  materials: ServiceOrderMaterialUsage[];
  laborCost: number;
  partsCost: number;
  totalCost: number;
  notes?: string;
  approvedAt?: Date;
  startedAt?: Date;
  finishedAt?: Date;
  stockAdjustmentStatus: 'PENDING' | 'APPLIED' | 'FAILED';
}

const serviceOrderServiceItemSchema = new Schema<ServiceOrderServiceItem>(
  {
    description: { type: String, required: true, trim: true },
    estimatedHours: { type: Number, required: true, min: 0 },
    price: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const serviceOrderMaterialUsageSchema = new Schema<ServiceOrderMaterialUsage>(
  {
    inventoryItemId: { type: Schema.Types.ObjectId, ref: 'InventoryItem', required: true },
    quantity: { type: Number, required: true, min: 0.0001 },
    unitCost: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const serviceOrderSchema = new Schema<IServiceOrder>(
  {
    clientId: { type: Schema.Types.ObjectId, ref: 'Client', required: true, index: true },
    machineId: { type: Schema.Types.ObjectId, ref: 'Machine', required: true, index: true },
    status: {
      type: String,
      required: true,
      enum: ['ORCAMENTO', 'APROVADO', 'EM_EXECUCAO', 'CONCLUIDO'],
      default: 'ORCAMENTO',
    },
    services: {
      type: [serviceOrderServiceItemSchema],
      required: true,
      validate: [arrayHasItems, 'A ordem de servico deve possuir ao menos um servico'],
    },
    materials: { type: [serviceOrderMaterialUsageSchema], default: [] },
    laborCost: { type: Number, default: 0, min: 0 },
    partsCost: { type: Number, default: 0, min: 0 },
    totalCost: { type: Number, default: 0, min: 0 },
    notes: { type: String, trim: true },
    approvedAt: { type: Date },
    startedAt: { type: Date },
    finishedAt: { type: Date },
    stockAdjustmentStatus: {
      type: String,
      enum: ['PENDING', 'APPLIED', 'FAILED'],
      default: 'PENDING',
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

serviceOrderSchema.index({ clientId: 1, createdAt: -1 });
serviceOrderSchema.index({ machineId: 1, createdAt: -1 });

function arrayHasItems(value: unknown[]): boolean {
  return Array.isArray(value) && value.length > 0;
}

// Exports expected by repositories
export const ServiceOrder = model<IServiceOrder>(
  'ServiceOrder',
  serviceOrderSchema,
);

// Backward compatibility aliases
export type ServiceOrderDocument = IServiceOrder;
export const ServiceOrderModel = ServiceOrder;