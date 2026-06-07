import { Schema, model, Document, Types } from 'mongoose';
import { FinancialEntryType } from '../../types';

export interface FinancialEntryDocument extends Document {
  serviceOrderId?: Types.ObjectId;
  type: FinancialEntryType;
  description: string;
  amount: number;
  date: Date;
  category: string;
}

const financialEntrySchema = new Schema<FinancialEntryDocument>(
  {
    serviceOrderId: { type: Schema.Types.ObjectId, ref: 'ServiceOrder' },
    type: {
      type: String,
      required: true,
      enum: ['INCOME', 'EXPENSE'],
    },
    description: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
    date: { type: Date, default: Date.now },
    category: { type: String, required: true, trim: true },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

financialEntrySchema.index({ date: -1, type: 1 });

export const FinancialEntryModel = model<FinancialEntryDocument>('FinancialEntry', financialEntrySchema);