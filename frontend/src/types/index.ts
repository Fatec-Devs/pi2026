
}

export interface Machine {
  id: string;
  name: string;
  brand: string;
  model: string;
  serialNumber: string;
  location: string;
  status: string;
  active: boolean;
}

export interface ServiceItem {
  description: string;
  estimatedHours: number;
  price: number;
}

export interface MaterialUsage {
  inventoryItemId: string;
  name: string;
  quantity: number;
  unitCost: number;
}

export interface ServiceOrder {
  id: string;
  clientId: string;
  machineId: string;
  status: ServiceOrderStatus;
  services: ServiceItem[];
  materials: MaterialUsage[];
  laborCost: number;
  partsCost: number;
  totalCost: number;
  notes?: string;
  createdAt: string;
  approvedAt?: string;
  startedAt?: string;
  finishedAt?: string;
}

export interface ServiceItemInput {
  description: string;
  estimatedHours: number;
  price: number;
}

export interface CreateServiceOrderDTO {
  clientId: string;
  machineId: string;
  services: ServiceItemInput[];
  notes?: string;
}

export interface RegisterClientDTO {
  name: string;
  email: string;
  phone: string;
  document: string;
  address: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}
