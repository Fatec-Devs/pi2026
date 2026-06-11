import { Types } from 'mongoose';
import {
  InventoryItemModel,
  InventoryItemDocument,
} from '../../database/models/inventoryItem.model';
import { AppError } from '../../config/AppError';

function toPublicItem(item: InventoryItemDocument) {
  const doc = item.toObject();
  return {
    id: item._id.toString(),
    name: item.name,
    sku: item.sku,
    unit: item.unit,
    quantity: item.quantity,
    minStock: item.minStock,
    unitCost: item.unitCost,
    active: item.active,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export async function findAll() {
  const items = await InventoryItemModel.find().sort({ name: 1 });
  return items.map(toPublicItem);
}

export async function findById(id: string) {
  if (!Types.ObjectId.isValid(id)) {
    throw new AppError('Produto não encontrado', 'INVENTORY_NOT_FOUND', 404);
  }

  const item = await InventoryItemModel.findById(id);
  if (!item) {
    throw new AppError('Produto não encontrado', 'INVENTORY_NOT_FOUND', 404);
  }

  return toPublicItem(item);
}

export async function create(data: {
  name: string;
  sku: string;
  unit: string;
  quantity: number;
  minStock: number;
  unitCost: number;
  active?: boolean;
}) {
  if (!data.name?.trim() || !data.sku?.trim() || !data.unit?.trim()) {
    throw new AppError('Nome, SKU e unidade são obrigatórios', 'VALIDATION_ERROR', 400);
  }

  const item = await InventoryItemModel.create({
    name: data.name.trim(),
    sku: data.sku.trim(),
    unit: data.unit.trim(),
    quantity: data.quantity ?? 0,
    minStock: data.minStock ?? 0,
    unitCost: data.unitCost ?? 0,
    active: data.active ?? true,
  });

  return toPublicItem(item);
}

export async function update(
  id: string,
  data: Partial<{
    name: string;
    sku: string;
    unit: string;
    quantity: number;
    minStock: number;
    unitCost: number;
    active: boolean;
  }>,
) {
  if (!Types.ObjectId.isValid(id)) {
    throw new AppError('Produto não encontrado', 'INVENTORY_NOT_FOUND', 404);
  }

  const updateData: Record<string, unknown> = {};
  if (data.name !== undefined) updateData.name = data.name.trim();
  if (data.sku !== undefined) updateData.sku = data.sku.trim();
  if (data.unit !== undefined) updateData.unit = data.unit.trim();
  if (data.quantity !== undefined) updateData.quantity = data.quantity;
  if (data.minStock !== undefined) updateData.minStock = data.minStock;
  if (data.unitCost !== undefined) updateData.unitCost = data.unitCost;
  if (data.active !== undefined) updateData.active = data.active;

  const item = await InventoryItemModel.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });

  if (!item) {
    throw new AppError('Produto não encontrado', 'INVENTORY_NOT_FOUND', 404);
  }

  return toPublicItem(item);
}

export async function adjustStock(id: string, quantity: number) {
  if (!Types.ObjectId.isValid(id)) {
    throw new AppError('Produto não encontrado', 'INVENTORY_NOT_FOUND', 404);
  }

  const item = await InventoryItemModel.findById(id);
  if (!item) {
    throw new AppError('Produto não encontrado', 'INVENTORY_NOT_FOUND', 404);
  }

  const newQuantity = item.quantity + quantity;
  if (newQuantity < 0) {
    throw new AppError('Quantidade em estoque insuficiente', 'VALIDATION_ERROR', 400);
  }

  item.quantity = newQuantity;
  await item.save();

  return toPublicItem(item);
}

export async function remove(id: string) {
  if (!Types.ObjectId.isValid(id)) {
    throw new AppError('Produto não encontrado', 'INVENTORY_NOT_FOUND', 404);
  }

  const item = await InventoryItemModel.findByIdAndDelete(id);
  if (!item) {
    throw new AppError('Produto não encontrado', 'INVENTORY_NOT_FOUND', 404);
  }
}
