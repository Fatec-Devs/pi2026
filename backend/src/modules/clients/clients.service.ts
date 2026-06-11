import { Types } from 'mongoose';
import { ClientModel, ClientDocument } from '../../database/models/client.model';
import { AppError } from '../../config/AppError';

function toPublicClient(client: ClientDocument) {
  const doc = client.toObject();
  return {
    id: client._id.toString(),
    userId: client.userId?.toString(),
    document: client.document,
    address: client.address,
    notes: client.notes,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export async function findAll() {
  const clients = await ClientModel.find().sort({ createdAt: -1 });
  return clients.map(toPublicClient);
}

export async function findById(id: string) {
  if (!Types.ObjectId.isValid(id)) {
    throw new AppError('Cliente não encontrado', 'CLIENT_NOT_FOUND', 404);
  }

  const client = await ClientModel.findById(id);
  if (!client) {
    throw new AppError('Cliente não encontrado', 'CLIENT_NOT_FOUND', 404);
  }

  return toPublicClient(client);
}

export async function create(data: {
  userId?: string;
  document?: string;
  address?: string;
  notes?: string;
}) {
  const payload: Record<string, unknown> = {
    document: data.document?.trim() || undefined,
    address: data.address?.trim() || undefined,
    notes: data.notes?.trim() || undefined,
  };

  if (data.userId) {
    if (!Types.ObjectId.isValid(data.userId)) {
      throw new AppError('Usuário inválido', 'VALIDATION_ERROR', 400);
    }
    payload.userId = new Types.ObjectId(data.userId);
  }

  const client = await ClientModel.create(payload);
  return toPublicClient(client);
}

export async function update(
  id: string,
  data: Partial<{ document: string; address: string; notes: string }>,
) {
  if (!Types.ObjectId.isValid(id)) {
    throw new AppError('Cliente não encontrado', 'CLIENT_NOT_FOUND', 404);
  }

  const client = await ClientModel.findByIdAndUpdate(
    id,
    {
      ...(data.document !== undefined && { document: data.document.trim() || undefined }),
      ...(data.address !== undefined && { address: data.address.trim() || undefined }),
      ...(data.notes !== undefined && { notes: data.notes.trim() || undefined }),
    },
    { new: true, runValidators: true },
  );

  if (!client) {
    throw new AppError('Cliente não encontrado', 'CLIENT_NOT_FOUND', 404);
  }

  return toPublicClient(client);
}

export async function remove(id: string) {
  if (!Types.ObjectId.isValid(id)) {
    throw new AppError('Cliente não encontrado', 'CLIENT_NOT_FOUND', 404);
  }

  const client = await ClientModel.findByIdAndDelete(id);
  if (!client) {
    throw new AppError('Cliente não encontrado', 'CLIENT_NOT_FOUND', 404);
  }
}
