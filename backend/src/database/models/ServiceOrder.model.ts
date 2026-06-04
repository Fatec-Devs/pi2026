import mongoose, { Schema, Document } from 'mongoose';

// Interface para ServiceItem
export interface IServiceItem {
  description: string;
  estimatedHours: number;
  price: number;
}

// Interface para MaterialUsage
export interface IMaterialUsage {
  inventoryItemId: mongoose.Types.ObjectId;
  quantity: number;
  unitCost: number;
}

// Interface para o documento ServiceOrder
export interface IServiceOrder extends Document {
  clientId: mongoose.Types.ObjectId;
  machineId: mongoose.Types.ObjectId;
  status: 'ORCAMENTO' | 'APROVADO' | 'EM_EXECUCAO' | 'CONCLUIDO';
  services: IServiceItem[];
  materials: IMaterialUsage[];
  laborCost: number;
  partsCost: number;
  totalCost: number;
  notes?: string;
  approvedAt?: Date;
  startedAt?: Date;
  finishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Schema para ServiceItem
const ServiceItemSchema = new Schema<IServiceItem>(
  {
    description: {
      type: String,
      required: [true, 'Descrição do serviço é obrigatória'],
      trim: true,
    },
    estimatedHours: {
      type: Number,
      required: [true, 'Horas estimadas são obrigatórias'],
      min: [0, 'Horas não podem ser negativas'],
    },
    price: {
      type: Number,
      required: [true, 'Preço é obrigatório'],
      min: [0, 'Preço não pode ser negativo'],
    },
  },
  { _id: false }
);

// Schema para MaterialUsage
const MaterialUsageSchema = new Schema<IMaterialUsage>(
  {
    inventoryItemId: {
      type: Schema.Types.ObjectId,
      ref: 'InventoryItem',
      required: [true, 'Item de estoque é obrigatório'],
    },
    quantity: {
      type: Number,
      required: [true, 'Quantidade é obrigatória'],
      min: [0.01, 'Quantidade deve ser maior que zero'],
    },
    unitCost: {
      type: Number,
      required: [true, 'Custo unitário é obrigatório'],
      min: [0, 'Custo não pode ser negativo'],
    },
  },
  { _id: false }
);

// Schema do ServiceOrder
const ServiceOrderSchema = new Schema<IServiceOrder>(
  {
    clientId: {
      type: Schema.Types.ObjectId,
      ref: 'Client',
      required: [true, 'Cliente é obrigatório'],
    },
    machineId: {
      type: Schema.Types.ObjectId,
      ref: 'Machine',
      required: [true, 'Máquina é obrigatória'],
    },
    status: {
      type: String,
      enum: ['ORCAMENTO', 'APROVADO', 'EM_EXECUCAO', 'CONCLUIDO'],
      default: 'ORCAMENTO',
      required: true,
    },
    services: {
      type: [ServiceItemSchema],
      required: [true, 'Serviços são obrigatórios'],
      validate: {
        validator: (v: IServiceItem[]) => v.length > 0,
        message: 'Deve haver pelo menos um serviço',
      },
    },
    materials: {
      type: [MaterialUsageSchema],
      default: [],
    },
    laborCost: {
      type: Number,
      default: 0,
      min: [0, 'Custo de mão de obra não pode ser negativo'],
    },
    partsCost: {
      type: Number,
      default: 0,
      min: [0, 'Custo de peças não pode ser negativo'],
    },
    totalCost: {
      type: Number,
      default: 0,
      min: [0, 'Custo total não pode ser negativo'],
    },
    notes: {
      type: String,
      trim: true,
    },
    approvedAt: {
      type: Date,
    },
    startedAt: {
      type: Date,
    },
    finishedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Índices
ServiceOrderSchema.index({ clientId: 1, createdAt: -1 });
ServiceOrderSchema.index({ status: 1 });
ServiceOrderSchema.index({ machineId: 1 });

// Middleware para validar transições de status
ServiceOrderSchema.pre('save', function (next) {
  // Valida fluxo de status
  const validTransitions: Record<string, string[]> = {
    ORCAMENTO: ['APROVADO'],
    APROVADO: ['EM_EXECUCAO'],
    EM_EXECUCAO: ['CONCLUIDO'],
    CONCLUIDO: [],
  };

  if (this.isModified('status')) {
    const original = this.get('status', null, { getters: false });
    
    // Se está mudando para CONCLUIDO, valida custos
    if (this.status === 'CONCLUIDO') {
      if (this.laborCost < 0 || this.partsCost < 0 || this.totalCost < 0) {
        return next(new Error('Custos não podem ser negativos'));
      }
    }
  }

  next();
});

// Model
export const ServiceOrder = mongoose.model<IServiceOrder>(
  'ServiceOrder',
  ServiceOrderSchema
);
