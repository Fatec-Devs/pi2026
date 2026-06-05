import { Schema, model, Document, Types } from 'mongoose';

export interface ClientDocument extends Document {
  userId?: Types.ObjectId;
  document?: string;
  address?: string;
  notes?: string;
}

const clientSchema = new Schema<ClientDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', unique: true, sparse: true },
    document: { type: String, trim: true, unique: true, sparse: true },
    address: { type: String, trim: true },
    notes: { type: String, trim: true },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

clientSchema.index({ document: 1 }, { unique: true, sparse: true });

export const ClientModel = model<ClientDocument>('Client', clientSchema);