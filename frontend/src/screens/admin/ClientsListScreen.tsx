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
import { Client } from '../../types/domain';
import clientService from '../../services/clientService';

/**
 * Tela de listagem de clientes (admin)
 * Exibe todos os clientes e permite ir para criar novo
 */
export default function ClientsListScreen() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadClients = async () => {
    try {
      setError(null);
      const data = await clientService.listAll();
      setClients(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Erro ao carregar clientes';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  // Recarregar ao retornar da tela de criar cliente
  useFocusEffect(
    React.useCallback(() => {
      loadClients();
    }, [])
  );

  const handleDeleteClient = (clientId: string, clientName?: string) => {
    Alert.alert(
      'Confirmar exclusão',
      `Tem certeza que deseja excluir este cliente?`,
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
              await clientService.delete(clientId);
              Alert.alert('Sucesso', 'Cliente excluído com sucesso');
              setClients((prev) => prev.filter((c) => c._id !== clientId));
            } catch (err) {
              const errorMessage =
                err instanceof Error ? err.message : 'Erro ao excluir cliente';
              Alert.alert('Erro', errorMessage);
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const renderClientItem = ({ item }: { item: Client }) => (
    <TouchableOpacity
      style={styles.clientCard}
      onPress={() => router.push(`/admin/clients/${item._id}`)}
      activeOpacity={0.7}
    >
      <View style={styles.clientCardContent}>
        <Text style={styles.clientName} numberOfLines={1}>
          {item.document || `Cliente ${item._id.slice(-6)}`}
        </Text>
        <Text style={styles.clientDocument} numberOfLines={1}>
          {item.userId ? `Usuário: ${item.userId}` : 'Sem usuário vinculado'}
        </Text>
        <Text style={styles.clientAddress} numberOfLines={2}>
          {item.address || 'Sem endereço'}
        </Text>
      </View>

      <TouchableOpacity
        onPress={() => handleDeleteClient(item._id)}
        style={styles.deleteButton}
      >
        <Text style={styles.deleteButtonText}>Deletar</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateTitle}>Nenhum cliente encontrado</Text>
      <Text style={styles.emptyStateDescription}>
        Clique no botão + para criar um novo cliente
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
        <Text style={styles.title}>Clientes</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/admin/clients/create')}
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
          data={clients}
          keyExtractor={(item) => item._id}
          renderItem={renderClientItem}
          ListEmptyComponent={renderEmptyState}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => {
                setIsRefreshing(true);
                loadClients();
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
  clientCard: {
    flexDirection: 'row',
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  clientCardContent: {
    flex: 1,
    marginRight: 12,
  },
  clientName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  clientDocument: {
    fontSize: 13,
    color: '#666',
    marginBottom: 2,
  },
  clientAddress: {
    fontSize: 12,
    color: '#999',
  },
  deleteButton: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
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
