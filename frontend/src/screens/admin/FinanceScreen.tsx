import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { financeService } from '../../services/finance.service';
import { FinancialEntry, FinancialSummary } from '../../types/domain';

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value || 0);
}

export default function FinanceScreen() {
  const router = useRouter();
  const [summary, setSummary] = useState<FinancialSummary>({ income: 0, expense: 0, balance: 0 });
  const [entries, setEntries] = useState<FinancialEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setError(null);
      const [summaryData, entriesData] = await Promise.all([
        financeService.getSummary(),
        financeService.listEntries(),
      ]);

      setSummary(summaryData);
      setEntries(entriesData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar financeiro';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const renderEntryColor = (type: string) => (type === 'INCOME' ? '#10b981' : '#ef4444');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>{'< Voltar'}</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Financeiro</Text>
          <Text style={styles.subtitle}>Consulta do balanço financeiro</Text>
        </View>
      </View>

      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>{error}</Text>
          <TouchableOpacity onPress={() => setError(null)}>
            <Text style={styles.closeBanner}>×</Text>
          </TouchableOpacity>
        </View>
      )}

      {isLoading && !isRefreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => {
                setIsRefreshing(true);
                loadData();
              }}
            />
          }
        >
          <View style={styles.summaryGrid}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Entradas</Text>
              <Text style={styles.summaryValueIncome}>{formatCurrency(summary.income)}</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Saídas</Text>
              <Text style={styles.summaryValueExpense}>{formatCurrency(summary.expense)}</Text>
            </View>
            <View style={styles.summaryCardWide}>
              <Text style={styles.summaryLabel}>Balanço</Text>
              <Text style={[styles.summaryValueBalance, summary.balance >= 0 ? styles.positive : styles.negative]}>
                {formatCurrency(summary.balance)}
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Lançamentos recentes</Text>
            {entries.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateTitle}>Nenhum lançamento encontrado</Text>
                <Text style={styles.emptyStateDescription}>Cadastre entradas e saídas para visualizar o balanço.</Text>
              </View>
            ) : (
              entries.map((entry) => (
                <View key={entry._id} style={styles.entryCard}>
                  <View style={styles.entryHeader}>
                    <Text style={styles.entryDescription} numberOfLines={1}>{entry.description}</Text>
                    <Text style={[styles.entryAmount, { color: renderEntryColor(entry.type) }]}>
                      {entry.type === 'INCOME' ? '+' : '-'}{formatCurrency(entry.amount)}
                    </Text>
                  </View>
                  <Text style={styles.entryMeta} numberOfLines={1}>
                    {entry.category}
                    {entry.date ? ` • ${new Date(entry.date).toLocaleDateString('pt-BR')}` : ''}
                  </Text>
                </View>
              ))
            )}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    marginRight: 12,
  },
  backButtonText: {
    color: '#3b82f6',
    fontSize: 14,
    fontWeight: '500',
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  errorBanner: {
    backgroundColor: '#fee2e2',
    borderBottomWidth: 1,
    borderBottomColor: '#fecaca',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorBannerText: {
    color: '#991b1b',
    fontSize: 13,
    flex: 1,
  },
  closeBanner: {
    color: '#991b1b',
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  summaryGrid: {
    gap: 12,
    marginBottom: 20,
  },
  summaryCard: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 16,
  },
  summaryCardWide: {
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    borderRadius: 12,
    padding: 16,
  },
  summaryLabel: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 6,
  },
  summaryValueIncome: {
    fontSize: 24,
    fontWeight: '700',
    color: '#10b981',
  },
  summaryValueExpense: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ef4444',
  },
  summaryValueBalance: {
    fontSize: 26,
    fontWeight: '800',
  },
  positive: {
    color: '#0f766e',
  },
  negative: {
    color: '#b91c1c',
  },
  section: {
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  emptyState: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  emptyStateDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  entryCard: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  entryDescription: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  entryAmount: {
    fontSize: 15,
    fontWeight: '700',
  },
  entryMeta: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 6,
  },
});