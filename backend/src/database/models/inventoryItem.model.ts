import { Schema, model, Document } from 'mongoose';

export interface InventoryItemDocument extends Document {
  name: string;
  sku: string;
  unit: string;
  quantity: number;
  minStock: number;
  unitCost: number;
  active: boolean;
}

const inventoryItemSchema = new Schema<InventoryItemDocument>(
  {
    name: { type: String, required: true, trim: true },
    sku: { type: String, required: true, unique: true, trim: true },
    unit: { type: String, required: true, trim: true },
    quantity: { type: Number, default: 0, min: 0 },
    minStock: { type: Number, default: 0, min: 0 },
    unitCost: { type: Number, default: 0, min: 0 },
    active: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

inventoryItemSchema.index({ sku: 1 }, { unique: true });

export const InventoryItemModel = model<InventoryItemDocument>('InventoryItem', inventoryItemSchema);