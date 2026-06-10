import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { TextInput } from '../common/TextInput';
import { ServiceItemInput as ServiceItemType } from '../../types/domain';

interface ServiceItemInputProps {
  value: ServiceItemType;
  onChange: (value: ServiceItemType) => void;
  onRemove: () => void;
  index: number;
  canRemove: boolean;
}

export function ServiceItemInput({
  value,
  onChange,
  onRemove,
  index,
  canRemove,
}: ServiceItemInputProps) {
  const [errors, setErrors] = useState<{
    description?: string;
    estimatedHours?: string;
    price?: string;
  }>({});

  const handleChange = (field: keyof ServiceItemType, text: string) => {
    const newValue = { ...value };

    if (field === 'description') {
      newValue[field] = text;
    } else {
      // Campos numéricos
      const numValue = parseFloat(text) || 0;
      newValue[field] = numValue;
    }

    onChange(newValue);
    
    // Limpa erro do campo editado
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = () => {
    const newErrors: typeof errors = {};

    if (!value.description || value.description.trim() === '') {
      newErrors.description = 'Descrição é obrigatória';
    }

    if (value.estimatedHours < 0) {
      newErrors.estimatedHours = 'Horas não podem ser negativas';
    }

    if (value.price < 0) {
      newErrors.price = 'Preço não pode ser negativo';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return (
    <View className="bg-gray-50 rounded-lg p-4 mb-3 border border-gray-200">
      <View className="flex-row justify-between items-center mb-3">
        <Text className="text-gray-900 font-semibold text-base">
          Serviço {index + 1}
        </Text>
        {canRemove && (
          <TouchableOpacity
            onPress={onRemove}
            className="bg-red-100 px-3 py-1 rounded"
          >
            <Text className="text-red-600 text-sm font-medium">Remover</Text>
          </TouchableOpacity>
        )}
      </View>

      <TextInput
        label="Descrição do serviço"
        value={value.description}
        onChangeText={(text) => handleChange('description', text)}
        placeholder="Ex: Troca de óleo"
        error={errors.description}
        containerClassName="mb-3"
      />

      <View className="flex-row gap-3">
        <TextInput
          label="Horas estimadas"
          value={value.estimatedHours.toString()}
          onChangeText={(text) => handleChange('estimatedHours', text)}
          placeholder="0"
          keyboardType="numeric"
          error={errors.estimatedHours}
          containerClassName="flex-1"
        />

        <TextInput
          label="Preço (R$)"
          value={value.price.toString()}
          onChangeText={(text) => handleChange('price', text)}
          placeholder="0.00"
          keyboardType="numeric"
          error={errors.price}
          containerClassName="flex-1"
        />
      </View>
    </View>
  );
}
