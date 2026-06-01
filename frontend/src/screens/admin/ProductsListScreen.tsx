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
import { InventoryItem } from '../../types/domain';
import inventoryService from '../../services/inventoryService';

/**
 * Tela de listagem de produtos (admin)
 * Exibe todos os produtos em estoque
 */
export default function ProductsListScreen() {
  const router = useRouter();
  const [products, setProducts] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProducts = async () => {
    try {
      setError(null);
      const data = await inventoryService.listAll();
      setProducts(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Erro ao carregar produtos';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // Recarregar ao retornar da tela de criar produto
  useFocusEffect(
    React.useCallback(() => {
      loadProducts();
    }, [])
  );

  const handleDeleteProduct = (productId: string, productName: string) => {
    Alert.alert(
      'Confirmar exclusão',
      `Tem certeza que deseja excluir "${productName}"?`,
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
              await inventoryService.delete(productId);
              Alert.alert('Sucesso', 'Produto excluído com sucesso');
              setProducts((prev) => prev.filter((p) => p.id !== productId));
            } catch (err) {
              const errorMessage =
                err instanceof Error ? err.message : 'Erro ao excluir produto';
              Alert.alert('Erro', errorMessage);
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const getStockStatusColor = (quantity: number, minStock: number): string => {
    if (quantity < minStock) {
      return '#ef4444'; // Vermelho - crítico
    }
    if (quantity <= minStock * 1.2) {
      return '#f59e0b'; // Laranja - baixo
    }
    return '#10b981'; // Verde - ok
  };

  const renderProductItem = ({ item }: { item: InventoryItem }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => router.push(`/admin/products/${item.id}`)}
      activeOpacity={0.7}
    >
      {/* Barra de status de estoque */}
      <View
        style={[
          styles.stockIndicator,
          {
            backgroundColor: getStockStatusColor(item.quantity, item.minStock),
          },
        ]}
      />

      <View style={styles.productCardContent}>
        <Text style={styles.productName} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.productSku} numberOfLines={1}>
          SKU: {item.sku}
        </Text>

        <View style={styles.productDetails}>
          <View style={styles.detailColumn}>
            <Text style={styles.detailLabel}>Quantidade</Text>
            <Text
              style={[
                styles.detailValue,
                {
                  color: getStockStatusColor(
                    item.quantity,
                    item.minStock
                  ),
                },
              ]}
            >
              {item.quantity} {item.unit}
            </Text>
          </View>

          <View style={styles.detailColumn}>
            <Text style={styles.detailLabel}>Estoque Mín.</Text>
            <Text style={styles.detailValue}>{item.minStock}</Text>
          </View>

          <View style={styles.detailColumn}>
            <Text style={styles.detailLabel}>Custo Unit.</Text>
            <Text style={styles.detailValue}>R$ {item.unitCost.toFixed(2)}</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        onPress={() => handleDeleteProduct(item.id, item.name)}
        style={styles.deleteButton}
      >
        <Text style={styles.deleteButtonText}>Deletar</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateTitle}>Nenhum produto encontrado</Text>
      <Text style={styles.emptyStateDescription}>
        Clique no botão + para criar um novo produto
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Produtos</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/admin/products/create')}
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
          data={products}
          keyExtractor={(item) => item.id}
          renderItem={renderProductItem}
          ListEmptyComponent={renderEmptyState}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => {
                setIsRefreshing(true);
                loadProducts();
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
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
  productCard: {
    flexDirection: 'row',
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    marginBottom: 12,
    overflow: 'hidden',
    alignItems: 'stretch',
  },
  stockIndicator: {
    width: 4,
  },
  productCardContent: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  productSku: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  productDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailColumn: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 11,
    color: '#999',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
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
