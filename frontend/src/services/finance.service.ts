import { api } from './api';
import { FinancialEntry, FinancialEntryType, FinancialSummary } from '../types/domain';

class FinanceService {
  async getSummary(): Promise<FinancialSummary> {
    const response = await api.get<FinancialSummary>('/finance/summary');
    if (!response) {
      throw new Error('Resposta inválida do servidor ao obter resumo financeiro');
    }
    return response;
  }

  async listEntries(type?: FinancialEntryType): Promise<FinancialEntry[]> {
    const query = type ? `?type=${encodeURIComponent(type)}` : '';
    const response = await api.get<{ entries: FinancialEntry[]; total: number }>(`/finance/entries${query}`);

    if (!response.entries || !Array.isArray(response.entries)) {
      throw new Error('Resposta inválida do servidor ao listar lançamentos financeiros');
    }

    return response.entries;
  }
}

export const financeService = new FinanceService();