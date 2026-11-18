import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Machine } from '../../types/domain';
import { machineService } from '../../services/machine.service';

/**
 * Tela de listagem de máquinas (admin)
 * Exibe todas as máquinas e permite ir para criar nova
 */
export default function MachinesListScreen() {
  const router = useRouter();
  const [machines, setMachines] = useState<Machine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMachines = async () => {
    try {
      setError(null);
      const data = await machineService.list();
      setMachines(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Erro ao carregar máquinas';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadMachines();
  }, []);

  // Recarregar ao retornar da tela de criar máquina
  useFocusEffect(
    React.useCallback(() => {
      loadMachines();
    }, [])
  );

  const handleDeleteMachine = (machineId: string, machineName?: string) => {
    Alert.alert(
      'Confirmar exclusão',
      `Tem certeza que deseja excluir esta máquina?`,
      [
        {
          text: 'Cancelar',
          onPress: () => {},
          style: 'cancel',
        },
        {
          text: 'Excluir',
          onPress: async () => {
            try {
              await machineService.delete(machineId);
              Alert.alert('Sucesso', 'Máquina excluída com sucesso');
              setMachines((prev) => prev.filter((m) => m._id !== machineId));
            } catch (err) {
              const errorMessage =
                err instanceof Error ? err.message : 'Erro ao excluir máquina';
              Alert.alert('Erro', errorMessage);
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'ATIVO':
        return '#10b981';
      case 'INATIVO':
        return '#ef4444';
      case 'EM_MANUTENCAO':
        return '#f59e0b';
      default:
        return '#6b7280';
    }
  };

  const renderMachineItem = ({ item }: { item: Machine }) => (
    <TouchableOpacity
      style={styles.machineCard}
      onPress={() => router.push(`/admin/machines/${item._id}`)}
      activeOpacity={0.7}
    >
      {/* Barra de status */}
      <View
        style={[
          styles.statusIndicator,
          {
            backgroundColor: getStatusColor(item.status),
          },
        ]}
      />

      <View style={styles.machineCardContent}>
        <Text style={styles.machineName} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.machineBrand} numberOfLines={1}>
          {item.brand || 'Sem marca'} {item.model || ''}
        </Text>

        <View style={styles.machineDetails}>
          {item.serialNumber && (
            <Text style={styles.machineSerial}>
              Série: {item.serialNumber}
            </Text>
          )}
          {item.location && (
            <Text style={styles.machineLocation}>
              Local: {item.location}
            </Text>
          )}
          {item.notes && (
            <Text style={styles.machineLocation} numberOfLines={2}>
              Notas: {item.notes}
            </Text>
          )}
        </View>

        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Status:</Text>
          <Text
            style={[
              styles.statusValue,
              { color: getStatusColor(item.status) },
            ]}
          >
            {item.status}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        onPress={() => handleDeleteMachine(item._id, item.name)}
        style={styles.deleteButton}
      >
        <Text style={styles.deleteButtonText}>Deletar</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateTitle}>Nenhuma máquina encontrada</Text>
      <Text style={styles.emptyStateDescription}>
        Clique no botão + para criar uma nova máquina
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>{'< Voltar'}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Máquinas</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/admin/machines/create')}
        >
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Erro */}
      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>{error}</Text>
          <TouchableOpacity onPress={() => setError(null)}>
            <Text style={styles.closeBanner}>×</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Loading */}
      {isLoading && !isRefreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      ) : (
        <FlatList
          data={machines}
          keyExtractor={(item) => item._id}
          renderItem={renderMachineItem}
          ListEmptyComponent={renderEmptyState}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => {
                setIsRefreshing(true);
                loadMachines();
              }}
            />
          }
        />
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
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    marginRight: 8,
  },
  backButtonText: {
    color: '#3b82f6',
    fontSize: 14,
    fontWeight: '500',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    flex: 1,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '300',
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
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexGrow: 1,
  },
  machineCard: {
    flexDirection: 'row',
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    marginBottom: 12,
    overflow: 'hidden',
    alignItems: 'stretch',
  },
  statusIndicator: {
    width: 4,
  },
  machineCardContent: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  machineName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  machineBrand: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  machineDetails: {
    marginBottom: 4,
  },
  machineSerial: {
    fontSize: 12,
    color: '#666',
  },
  machineLocation: {
    fontSize: 12,
    color: '#666',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  statusLabel: {
    fontSize: 12,
    color: '#999',
    marginRight: 4,
  },
  statusValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 12,
    paddingVertical: 12,
    justifyContent: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptyStateDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});
