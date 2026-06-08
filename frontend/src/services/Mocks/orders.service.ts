import { ApiException, api, sleep, USE_MOCK } from "./api";
import { mockOrders } from "./mocks/data";
import type { CreateServiceOrderDTO, ServiceOrder } from "../types";

const store: ServiceOrder[] = [...mockOrders];

export const ordersService = {
  async list(clientId: string): Promise<ServiceOrder[]> {
    if (USE_MOCK) {
      await sleep(300);
      return store
        .filter((o) => o.clientId === clientId)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }
    const res = await api.get<ServiceOrder[]>("/service-orders");
    return res.data;
  },

  async get(id: string): Promise<ServiceOrder> {
    if (USE_MOCK) {
      await sleep(200);
      const o = store.find((x) => x.id === id);
      if (!o) throw new ApiException("NOT_FOUND", "Ordem de serviço não encontrada.");
      return o;
    }
    const res = await api.get<ServiceOrder>(`/service-orders/${id}`);
    return res.data;
  },

  async create(dto: CreateServiceOrderDTO): Promise<ServiceOrder> {
    if (USE_MOCK) {
      await sleep(400);
      if (!dto.services.length) throw new ApiException("VALIDATION_ERROR", "Informe ao menos um serviço.");
      const laborCost = dto.services.reduce((s, x) => s + x.price, 0);
      const order: ServiceOrder = {
        id: "os-" + Math.floor(1000 + Math.random() * 9000),
        clientId: dto.clientId, machineId: dto.machineId, status: "ORCAMENTO",
        services: dto.services, materials: [],
        laborCost, partsCost: 0, totalCost: laborCost, notes: dto.notes,
        createdAt: new Date().toISOString(),
      };
      store.unshift(order);
      return order;
    }
    const res = await api.post<ServiceOrder>("/service-orders", dto);
    return res.data;
  },

  async historyByClient(clientId: string): Promise<ServiceOrder[]> {
    if (USE_MOCK) {
      await sleep(250);
      return store
        .filter((o) => o.clientId === clientId && o.status === "CONCLUIDO")
        .sort((a, b) => (b.finishedAt ?? b.createdAt).localeCompare(a.finishedAt ?? a.createdAt));
    }
    const res = await api.get<ServiceOrder[]>(`/service-orders/client/${clientId}/history`);
    return res.data;
  },
};
