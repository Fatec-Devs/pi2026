import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { InventoryItem } from '../../types/domain';

interface ProductFormProps {
  initialData?: Partial<InventoryItem>;
  onSubmit: (data: any) => Promise<void>;
  isLoading?: boolean;
  submitButtonLabel?: string;
}

export const ProductForm: React.FC<ProductFormProps> = ({
  initialData = {},
  onSubmit,
  isLoading = false,
  submitButtonLabel = 'Salvar',
}) => {
  const [formData, setFormData] = useState({
    name: initialData.name || '',
    sku: initialData.sku || '',
    unit: initialData.unit || 'UNIDADE',
    quantity: initialData.quantity?.toString() || '0',
    minStock: initialData.minStock?.toString() || '0',
    unitCost: initialData.unitCost?.toString() || '0',
    active: initialData.active !== undefined ? initialData.active : true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Limpar erro do campo ao começar a digitar
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validações básicas
    if (!formData.name?.trim()) {
      newErrors.name = 'Nome do produto é obrigatório';
    }
    if (!formData.sku?.trim()) {
      newErrors.sku = 'SKU é obrigatório';
    }
    if (!formData.unit?.trim()) {
      newErrors.unit = 'Unidade é obrigatória';
    }

    const quantity = parseFloat(formData.quantity);
    if (isNaN(quantity) || quantity < 0) {
      newErrors.quantity = 'Quantidade deve ser um número positivo';
    }

    const minStock = parseFloat(formData.minStock);
    if (isNaN(minStock) || minStock < 0) {
      newErrors.minStock = 'Estoque mínimo deve ser um número positivo';
    }

    const unitCost = parseFloat(formData.unitCost);
    if (isNaN(unitCost) || unitCost < 0) {
      newErrors.unitCost = 'Custo unitário deve ser um número positivo';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const submitData = {
        ...formData,
        quantity: parseFloat(formData.quantity),
        minStock: parseFloat(formData.minStock),
        unitCost: parseFloat(formData.unitCost),
      };
      await onSubmit(submitData);
    } catch (error) {
      console.error('Erro ao submeter formulário:', error);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Nome */}
        <View style={styles.field}>
          <Text style={styles.label}>Nome do Produto*</Text>
          <TextInput
            style={[styles.input, errors.name && styles.inputError]}
            placeholder="Digite o nome do produto"
            placeholderTextColor="#999"
            value={formData.name}
            onChangeText={(value) => handleInputChange('name', value)}
            editable={!isLoading}
          />
          {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
        </View>

        {/* SKU */}
        <View style={styles.field}>
          <Text style={styles.label}>SKU*</Text>
          <TextInput
            style={[styles.input, errors.sku && styles.inputError]}
            placeholder="Código SKU"
            placeholderTextColor="#999"
            value={formData.sku}
            onChangeText={(value) => handleInputChange('sku', value)}
            editable={!isLoading}
          />
          {errors.sku && <Text style={styles.errorText}>{errors.sku}</Text>}
        </View>

        {/* Unidade */}
        <View style={styles.field}>
          <Text style={styles.label}>Unidade*</Text>
          <TextInput
            style={[styles.input, errors.unit && styles.inputError]}
            placeholder="Ex: UNIDADE, KG, LT, M"
            placeholderTextColor="#999"
            value={formData.unit}
            onChangeText={(value) => handleInputChange('unit', value)}
            editable={!isLoading}
          />
          {errors.unit && <Text style={styles.errorText}>{errors.unit}</Text>}
        </View>

        {/* Quantidade */}
        <View style={styles.field}>
          <Text style={styles.label}>Quantidade*</Text>
          <TextInput
            style={[
              styles.input,
              errors.quantity && styles.inputError,
            ]}
            placeholder="0"
            placeholderTextColor="#999"
            value={formData.quantity}
            onChangeText={(value) => handleInputChange('quantity', value)}
            editable={!isLoading}
            keyboardType="decimal-pad"
          />
          {errors.quantity && (
            <Text style={styles.errorText}>{errors.quantity}</Text>
          )}
        </View>

        {/* Estoque Mínimo */}
        <View style={styles.field}>
          <Text style={styles.label}>Estoque Mínimo*</Text>
          <TextInput
            style={[
              styles.input,
              errors.minStock && styles.inputError,
            ]}
            placeholder="0"
            placeholderTextColor="#999"
            value={formData.minStock}
            onChangeText={(value) => handleInputChange('minStock', value)}
            editable={!isLoading}
            keyboardType="decimal-pad"
          />
          {errors.minStock && (
            <Text style={styles.errorText}>{errors.minStock}</Text>
          )}
        </View>

        {/* Custo Unitário */}
        <View style={styles.field}>
          <Text style={styles.label}>Custo Unitário (R$)*</Text>
          <TextInput
            style={[
              styles.input,
              errors.unitCost && styles.inputError,
            ]}
            placeholder="0,00"
            placeholderTextColor="#999"
            value={formData.unitCost}
            onChangeText={(value) => handleInputChange('unitCost', value)}
            editable={!isLoading}
            keyboardType="decimal-pad"
          />
          {errors.unitCost && (
            <Text style={styles.errorText}>{errors.unitCost}</Text>
          )}
        </View>

        {/* Botão Submit */}
        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={isLoading}
          activeOpacity={0.7}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>{submitButtonLabel}</Text>
          )}
        </TouchableOpacity>

        {/* Texto de campos obrigatórios */}
        <Text style={styles.requiredText}>* Campos obrigatórios</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    color: '#333',
    backgroundColor: '#fafafa',
  },
  inputError: {
    borderColor: '#ef4444',
    backgroundColor: '#fee2e2',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 4,
  },
  button: {
    backgroundColor: '#3b82f6',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonDisabled: {
    backgroundColor: '#9ca3af',
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  requiredText: {
    color: '#666',
    fontSize: 12,
    marginTop: 12,
    textAlign: 'center',
  },
});
