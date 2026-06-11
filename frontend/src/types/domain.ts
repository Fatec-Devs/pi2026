export type UserRole = 'ADMIN' | 'CLIENT';
export type ServiceOrderStatus = 'ORCAMENTO' | 'APROVADO' | 'EM_EXECUCAO' | 'CONCLUIDO';
export type FinancialEntryType = 'INCOME' | 'EXPENSE';

export interface User {
  _id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  phone?: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Client {
  _id: string;
  userId?: string;
  name?: string;
  document?: string;
  phone?: string;
  address?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Machine {
  _id: string;
  clientId?: string;
  name: string;
  brand?: string;
  model?: string;
  serialNumber?: string;
  location?: string;
  notes?: string;
  status: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ServiceItemInput {
  description: string;
  estimatedHours: number;
  price: number;
}

export interface MaterialUsageInput {
  inventoryItemId: string;
  quantity: number;
  unitCost: number;
}

export interface CreateServiceOrderDTO {
  clientId: string;
  machineId: string;
  services: ServiceItemInput[];
  notes?: string;
}

export interface ServiceOrder {
  _id: string;
  clientId: string;
  machineId: string;
  status: ServiceOrderStatus;
  services: ServiceItemInput[];
  materials: MaterialUsageInput[];
  laborCost: number;
  partsCost: number;
  totalCost: number;
  notes?: string;
  approvedAt?: string;
  startedAt?: string;
  finishedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface FinancialEntry {
  _id: string;
  serviceOrderId?: string;
  type: FinancialEntryType;
  description: string;
  amount: number;
  date: string;
  category?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface ApiError {
  code: string;
  message: string;
  details?: string | Record<string, unknown>;
}
