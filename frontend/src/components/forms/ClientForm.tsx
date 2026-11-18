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
import { Client } from '../../types/domain';

function digitsOnly(value: string) {
  return value.replace(/\D/g, '');
}

function formatCpf(value: string) {
  const digits = digitsOnly(value).slice(0, 11);

  return digits
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

function formatPhone(value: string) {
  const digits = digitsOnly(value).slice(0, 11);

  if (digits.length <= 10) {
    return digits
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2');
  }

  return digits
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2');
}

interface ClientFormProps {
  initialData?: Partial<Client>;
  onSubmit: (data: any) => Promise<void>;
  isLoading?: boolean;
  submitButtonLabel?: string;
}

export const ClientForm: React.FC<ClientFormProps> = ({
  initialData = {},
  onSubmit,
  isLoading = false,
  submitButtonLabel = 'Salvar',
}) => {
  const [formData, setFormData] = useState({
    name: initialData.name || '',
    document: formatCpf(initialData.document || ''),
    phone: formatPhone(initialData.phone || ''),
    address: initialData.address || '',
    notes: initialData.notes || '',
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
      newErrors.name = 'Nome é obrigatório';
    }
    if (!formData.document?.trim()) {
      newErrors.document = 'Documento é obrigatório';
    }
    if (!formData.phone?.trim()) {
      newErrors.phone = 'Telefone é obrigatório';
    }
    if (!formData.address?.trim()) {
      newErrors.address = 'Endereço é obrigatório';
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
      // Erro é tratado no componente pai
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
          <Text style={styles.label}>Nome*</Text>
          <TextInput
            style={[styles.input, errors.name && styles.inputError]}
            placeholder="Digite o nome do cliente"
            placeholderTextColor="#999"
            value={formData.name}
            onChangeText={(value) => handleInputChange('name', value)}
            editable={!isLoading}
          />
          {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
        </View>

        {/* Documento */}
        <View style={styles.field}>
          <Text style={styles.label}>Documento (CPF/CNPJ)*</Text>
          <TextInput
            style={[styles.input, errors.document && styles.inputError]}
            placeholder="Digite o documento"
            placeholderTextColor="#999"
            value={formData.document}
            onChangeText={(value) => handleInputChange('document', formatCpf(value))}
            editable={!isLoading}
            keyboardType="number-pad"
            maxLength={14}
          />
          {errors.document && (
            <Text style={styles.errorText}>{errors.document}</Text>
          )}
        </View>

        {/* Telefone */}
        <View style={styles.field}>
          <Text style={styles.label}>Telefone*</Text>
          <TextInput
            style={[styles.input, errors.phone && styles.inputError]}
            placeholder="(00) 00000-0000"
            placeholderTextColor="#999"
            value={formData.phone}
            onChangeText={(value) => handleInputChange('phone', formatPhone(value))}
            editable={!isLoading}
            keyboardType="phone-pad"
            maxLength={15}
          />
          {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
        </View>

        {/* Endereço */}
        <View style={styles.field}>
          <Text style={styles.label}>Endereço*</Text>
          <TextInput
            style={[
              styles.input,
              errors.address && styles.inputError,
            ]}
            placeholder="Digite o endereço completo"
            placeholderTextColor="#999"
            value={formData.address}
            onChangeText={(value) => handleInputChange('address', value)}
            editable={!isLoading}
            multiline
            numberOfLines={3}
          />
          {errors.address && (
            <Text style={styles.errorText}>{errors.address}</Text>
          )}
        </View>

        {/* Notas */}
        <View style={styles.field}>
          <Text style={styles.label}>Notas (opcional)</Text>
          <TextInput
            style={[styles.input, styles.notesInput]}
            placeholder="Digite observações adicionais"
            placeholderTextColor="#999"
            value={formData.notes}
            onChangeText={(value) => handleInputChange('notes', value)}
            editable={!isLoading}
            multiline
            numberOfLines={3}
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
