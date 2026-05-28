import { useState, useEffect } from 'react';
import { ServiceOrder, Machine, InventoryItem } from '../types/domain';

interface MockData {
  serviceOrders: ServiceOrder[];
  machines: Machine[];
  inventoryItems: InventoryItem[];
  loading: boolean;
}

// Mock Machines
const mockMachines: Machine[] = [
  {
    id: 'machine-001',
    clientId: 'client-001',
    name: 'Empilhadeira Toyota',
    brand: 'Toyota',
    model: '8FG25',
    serialNumber: 'TY-2023-001',
    location: 'Galpão A',
    status: 'OPERACIONAL',
    active: true,
    createdAt: new Date('2024-01-10').toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'machine-002',
    clientId: 'client-001',
    name: 'Empilhadeira Hyster',
    brand: 'Hyster',
    model: 'H50FT',
    serialNumber: 'HY-2022-045',
    location: 'Galpão B',
    status: 'EM_MANUTENCAO',
    active: true,
    createdAt: new Date('2023-06-15').toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'machine-003',
    clientId: 'client-001',
    name: 'Paleteira Elétrica',
    brand: 'Crown',
    model: 'PE4500',
    serialNumber: 'CR-2024-012',
    location: 'Galpão C',
    status: 'OPERACIONAL',
    active: true,
    createdAt: new Date('2024-03-20').toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Mock Service Orders
const mockServiceOrders: ServiceOrder[] = [
  {
    id: 'so-001',
    clientId: 'client-001',
    machineId: 'machine-001',
    status: 'EM_EXECUCAO',
    services: [
      {
        description: 'Troca de óleo hidráulico',
        estimatedHours: 2,
        price: 350.0,
      },
      {
        description: 'Inspeção do sistema de freios',
        estimatedHours: 1,
        price: 150.0,
      },
    ],
    materials: [
      {
        inventoryItemId: 'inv-001',
        quantity: 5,
        unitCost: 45.0,
      },
    ],
    laborCost: 500.0,
    partsCost: 225.0,
    totalCost: 725.0,
    notes: 'Cliente relatou ruídos estranhos no sistema hidráulico',
    approvedAt: new Date('2026-05-20').toISOString(),
    startedAt: new Date('2026-05-22').toISOString(),
    createdAt: new Date('2026-05-18').toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'so-002',
    clientId: 'client-001',
    machineId: 'machine-002',
    status: 'APROVADO',
    services: [
      {
        description: 'Reparo do sistema elétrico',
        estimatedHours: 4,
        price: 800.0,
      },
    ],
    materials: [],
    laborCost: 800.0,
    partsCost: 0,
    totalCost: 800.0,
    notes: 'Problemas intermitentes no painel de controle',
    approvedAt: new Date('2026-05-25').toISOString(),
    createdAt: new Date('2026-05-24').toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'so-003',
    clientId: 'client-001',
    machineId: 'machine-003',
    status: 'CONCLUIDO',
    services: [
      {
        description: 'Manutenção preventiva',
        estimatedHours: 3,
        price: 450.0,
      },
    ],
    materials: [
      {
        inventoryItemId: 'inv-002',
        quantity: 2,
        unitCost: 30.0,
      },
    ],
    laborCost: 450.0,
    partsCost: 60.0,
    totalCost: 510.0,
    approvedAt: new Date('2026-05-10').toISOString(),
    startedAt: new Date('2026-05-12').toISOString(),
    finishedAt: new Date('2026-05-15').toISOString(),
    createdAt: new Date('2026-05-08').toISOString(),
    updatedAt: new Date('2026-05-15').toISOString(),
  },
  {
    id: 'so-004',
    clientId: 'client-001',
    machineId: 'machine-001',
    status: 'ORCAMENTO',
    services: [
      {
        description: 'Substituição de pneus',
        estimatedHours: 1.5,
        price: 600.0,
      },
    ],
    materials: [],
    laborCost: 0,
    partsCost: 0,
    totalCost: 600.0,
    notes: 'Pneus desgastados - preventivo',
    createdAt: new Date('2026-05-26').toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Mock Inventory Items
const mockInventoryItems: InventoryItem[] = [
  {
    id: 'inv-001',
    name: 'Óleo Hidráulico ISO 68',
    sku: 'OIL-HYD-68',
    unit: 'Litro',
    quantity: 50,
    minStock: 20,
    unitCost: 45.0,
    active: true,
    createdAt: new Date('2024-01-01').toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'inv-002',
    name: 'Filtro de Ar',
    sku: 'FLT-AR-001',
    unit: 'Unidade',
    quantity: 15,
    minStock: 10,
    unitCost: 30.0,
    active: true,
    createdAt: new Date('2024-01-01').toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'inv-003',
    name: 'Pastilha de Freio',
    sku: 'BRK-PAD-001',
    unit: 'Jogo',
    quantity: 8,
    minStock: 5,
    unitCost: 120.0,
    active: true,
    createdAt: new Date('2024-01-01').toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export function useMockData(): MockData {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<MockData>({
    serviceOrders: [],
    machines: [],
    inventoryItems: [],
    loading: true,
  });

  useEffect(() => {
    // Simulate network delay (300-500ms)
    const delay = 300 + Math.random() * 200;
    
    const timer = setTimeout(() => {
      setData({
        serviceOrders: mockServiceOrders,
        machines: mockMachines,
        inventoryItems: mockInventoryItems,
        loading: false,
      });
      setLoading(false);
    }, delay);

    return () => clearTimeout(timer);
  }, []);

  return data;
}
