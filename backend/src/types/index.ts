export type UserRole = 'ADMIN' | 'CLIENT';
export type ServiceOrderStatus = 'ORCAMENTO' | 'APROVADO' | 'EM_EXECUCAO' | 'CONCLUIDO';

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

export type MachineStatus = 'ATIVO' | 'INATIVO' | 'EM_MANUTENCAO';

export type FinancialEntryType = 'INCOME' | 'EXPENSE';

export interface JwtPayload {
  userId: string;
  role: UserRole;
}