import { api, sleep, USE_MOCK } from "./api";
import { mockMachines } from "./mocks/data";
import type { Machine } from "../types";

export const machinesService = {
  async list(): Promise<Machine[]> {
    if (USE_MOCK) { await sleep(250); return mockMachines.filter((m) => m.active); }
    const res = await api.get<Machine[]>("/machines");
    return res.data;
  },
  async get(id: string): Promise<Machine | undefined> {
    if (USE_MOCK) { await sleep(150); return mockMachines.find((m) => m.id === id); }
    const res = await api.get<Machine>(`/machines/${id}`);
    return res.data;
  },
};
