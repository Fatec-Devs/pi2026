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
import { Machine } from '../../types/domain';

interface MachineFormProps {
  initialData?: Partial<Machine>;
  onSubmit: (data: any) => Promise<void>;
  isLoading?: boolean;
  submitButtonLabel?: string;
}

export const MachineForm: React.FC<MachineFormProps> = ({
  initialData = {},
  onSubmit,
  isLoading = false,
  submitButtonLabel = 'Salvar',
}) => {
  const [formData, setFormData] = useState({
    name: initialData.name || '',
    brand: initialData.brand || '',
    model: initialData.model || '',
    serialNumber: initialData.serialNumber || '',
    location: initialData.location || '',
    notes: initialData.notes || '',
    status: initialData.status || 'ATIVO',
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
      newErrors.name = 'Nome da máquina é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
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
          <Text style={styles.label}>Nome da Máquina*</Text>
          <TextInput
            style={[styles.input, errors.name && styles.inputError]}
            placeholder="Digite o nome da máquina"
            placeholderTextColor="#999"
            value={formData.name}
            onChangeText={(value) => handleInputChange('name', value)}
            editable={!isLoading}
          />
          {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
        </View>

        {/* Marca */}
        <View style={styles.field}>
          <Text style={styles.label}>Marca</Text>
          <TextInput
            style={styles.input}
            placeholder="Digite a marca"
            placeholderTextColor="#999"
            value={formData.brand}
            onChangeText={(value) => handleInputChange('brand', value)}
            editable={!isLoading}
          />
        </View>

        {/* Modelo */}
        <View style={styles.field}>
          <Text style={styles.label}>Modelo</Text>
          <TextInput
            style={styles.input}
            placeholder="Digite o modelo"
            placeholderTextColor="#999"
            value={formData.model}
            onChangeText={(value) => handleInputChange('model', value)}
            editable={!isLoading}
          />
        </View>

        {/* Número de Série */}
        <View style={styles.field}>
          <Text style={styles.label}>Número de Série</Text>
          <TextInput
            style={styles.input}
            placeholder="Digite o número de série"
            placeholderTextColor="#999"
            value={formData.serialNumber}
            onChangeText={(value) => handleInputChange('serialNumber', value)}
            editable={!isLoading}
          />
        </View>

        {/* Localização */}
        <View style={styles.field}>
          <Text style={styles.label}>Localização</Text>
          <TextInput
            style={[styles.input, styles.notesInput]}
            placeholder="Digite a localização da máquina"
            placeholderTextColor="#999"
            value={formData.location}
            onChangeText={(value) => handleInputChange('location', value)}
            editable={!isLoading}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Notas */}
        <View style={styles.field}>
          <Text style={styles.label}>Notas</Text>
          <TextInput
            style={[styles.input, styles.notesInput]}
            placeholder="Descreva informações importantes sobre a máquina"
            placeholderTextColor="#999"
            value={formData.notes}
            onChangeText={(value) => handleInputChange('notes', value)}
            editable={!isLoading}
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Status */}
        <View style={styles.field}>
          <Text style={styles.label}>Status</Text>
          <TextInput
            style={styles.input}
            placeholder="ATIVO, INATIVO, EM_MANUTENCAO"
            placeholderTextColor="#999"
            value={formData.status}
            onChangeText={(value) => handleInputChange('status', value)}
            editable={!isLoading}
          />
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
  notesInput: {
    minHeight: 90,
    textAlignVertical: 'top',
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
