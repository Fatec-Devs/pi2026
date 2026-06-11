import { Types } from 'mongoose';
import { ClientModel, ClientDocument } from '../../database/models/client.model';
import { AppError } from '../../config/AppError';

function toPublicClient(client: ClientDocument) {
  const doc = client.toObject();
  return {
    id: client._id.toString(),
    userId: client.userId?.toString(),
    name: client.name,
    document: client.document,
    phone: client.phone,
    address: client.address,
    notes: client.notes,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

function maskCpf(value?: string) {
  if (!value) return value;

  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (!digits) return undefined;

  return digits
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

function maskPhone(value?: string) {
  if (!value) return value;

  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (!digits) return undefined;

  if (digits.length <= 10) {
    return digits
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2');
  }

  return digits
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2');
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
  name?: string;
  document?: string;
  phone?: string;
  address?: string;
  notes?: string;
}) {
  const payload: Record<string, unknown> = {
    name: data.name?.trim() || undefined,
    document: maskCpf(data.document?.trim()),
    phone: maskPhone(data.phone?.trim()),
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
  data: Partial<{ name: string; document: string; phone: string; address: string; notes: string }>,
) {
  if (!Types.ObjectId.isValid(id)) {
    throw new AppError('Cliente não encontrado', 'CLIENT_NOT_FOUND', 404);
  }

  const client = await ClientModel.findByIdAndUpdate(
    id,
    {
      ...(data.name !== undefined && { name: data.name.trim() || undefined }),
      ...(data.document !== undefined && { document: maskCpf(data.document.trim()) }),
      ...(data.phone !== undefined && { phone: maskPhone(data.phone.trim()) }),
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
