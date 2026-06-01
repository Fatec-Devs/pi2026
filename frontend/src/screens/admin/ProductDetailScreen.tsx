import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { InventoryItem } from '../../types/domain';
import inventoryService from '../../services/inventoryService';
import { ProductForm } from '../../components/forms/ProductForm';

/**
 * Tela de detalhes/edição de produto (admin)
 * Carrega produto por ID e permite edição
 */
export default function ProductDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [product, setProduct] = useState<InventoryItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadProduct();
    }
  }, [id]);

  const loadProduct = async () => {
    try {
      setError(null);
      const data = await inventoryService.getById(id!);
      setProduct(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Erro ao carregar produto';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProduct = async (formData: any) => {
    if (!product) return;

    setIsSaving(true);
    setError(null);

    try {
      const updatedProduct = await inventoryService.update(
        product.id,
        formData
      );
      setProduct(updatedProduct);
      Alert.alert('Sucesso', 'Produto atualizado com sucesso!', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Erro ao atualizar produto';
      setError(errorMessage);
      Alert.alert('Erro', errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAdjustStock = async (quantity: number) => {
    if (!product) return;

    const totalQuantity = product.quantity + quantity;
    if (totalQuantity < 0) {
      Alert.alert(
        'Erro',
        'Não é possível remover mais produtos do que há em estoque'
      );
      return;
    }

    try {
      const updatedProduct = await inventoryService.adjustStock(
        product.id,
        quantity
      );
      setProduct(updatedProduct);
      Alert.alert(
        'Sucesso',
        `Estoque ajustado com sucesso!\nNovas quantidade: ${updatedProduct.quantity} ${updatedProduct.unit}`
      );
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Erro ao ajustar estoque';
      Alert.alert('Erro', errorMessage);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backButton}>{'< Voltar'}</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Produto não encontrado</Text>
          <View style={{ width: 60 }} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>{'< Voltar'}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Editar Produto</Text>
        <View style={{ width: 60 }} />
      </View>

      {/* Erro global */}
      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>{error}</Text>
          <TouchableOpacity onPress={() => setError(null)}>
            <Text style={styles.closeBanner}>×</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Informações rápidas de estoque */}
        <View style={styles.stockSummary}>
          <View style={styles.stockItem}>
            <Text style={styles.stockLabel}>Quantidade Atual</Text>
            <Text
              style={[
                styles.stockValue,
                {
                  color:
                    product.quantity < product.minStock
                      ? '#ef4444'
                      : '#10b981',
                },
              ]}
            >
              {product.quantity} {product.unit}
            </Text>
          </View>
          <View style={styles.stockItem}>
            <Text style={styles.stockLabel}>Estoque Mínimo</Text>
            <Text style={styles.stockValue}>{product.minStock}</Text>
          </View>
          <View style={styles.stockItem}>
            <Text style={styles.stockLabel}>Custo Unit.</Text>
            <Text style={styles.stockValue}>
              R$ {product.unitCost.toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Botões de ajuste de estoque */}
        <View style={styles.stockAdjustmentSection}>
          <Text style={styles.sectionTitle}>Ajustar Estoque</Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.adjustButton, styles.removeButton]}
              onPress={() => handleAdjustStock(-5)}
            >
              <Text style={styles.adjustButtonText}>-5</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.adjustButton, styles.removeButton]}
              onPress={() => handleAdjustStock(-1)}
            >
              <Text style={styles.adjustButtonText}>-1</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.adjustButton, styles.addButton]}
              onPress={() => handleAdjustStock(1)}
            >
              <Text style={styles.adjustButtonText}>+1</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.adjustButton, styles.addButton]}
              onPress={() => handleAdjustStock(5)}
            >
              <Text style={styles.adjustButtonText}>+5</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Formulário de edição */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Editar Informações</Text>
          <ProductForm
            initialData={product}
            onSubmit={handleUpdateProduct}
            isLoading={isSaving}
            submitButtonLabel="Atualizar"
          />
        </View>
      </ScrollView>
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
  backButton: {
    color: '#3b82f6',
    fontSize: 14,
    fontWeight: '500',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    flex: 1,
    textAlign: 'center',
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
    flex: 1,
  },
  stockSummary: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#f3f4f6',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  stockItem: {
    flex: 1,
    alignItems: 'center',
  },
  stockLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  stockValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  stockAdjustmentSection: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  adjustButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  addButton: {
    backgroundColor: '#dcfce7',
    borderColor: '#86efac',
  },
  removeButton: {
    backgroundColor: '#fee2e2',
    borderColor: '#fecaca',
  },
  adjustButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  formSection: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
});
