import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, Pressable } from 'react-native';

export interface SelectOption {
  label: string;
  value: string;
}

interface AppSelectProps {
  label?: string;
  placeholder?: string;
  options: SelectOption[];
  value?: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  containerClassName?: string;
}

export function AppSelect({ 
  label, 
  placeholder = 'Selecione uma opção',
  options,
  value,
  onChange,
  error,
  disabled = false,
  containerClassName = '',
}: AppSelectProps) {
  const [modalVisible, setModalVisible] = useState(false);
  
  const selectedOption = options.find(opt => opt.value === value);
  const hasError = !!error;
  
  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setModalVisible(false);
  };
  
  return (
    <View className={`mb-4 ${containerClassName}`}>
      {label && (
        <Text className="text-gray-700 font-medium mb-2">
          {label}
        </Text>
      )}
      
      <TouchableOpacity
        className={`
          px-4 py-3 border rounded-lg bg-white
          ${hasError ? 'border-red-500' : 'border-gray-300'}
          ${disabled ? 'bg-gray-100 opacity-50' : ''}
        `}
        onPress={() => !disabled && setModalVisible(true)}
        disabled={disabled}
      >
        <Text className={selectedOption ? 'text-gray-900' : 'text-gray-400'}>
          {selectedOption ? selectedOption.label : placeholder}
        </Text>
      </TouchableOpacity>
      
      {error && (
        <Text className="text-red-500 text-sm mt-1">
          {error}
        </Text>
      )}
      
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable 
          className="flex-1 bg-black/50 justify-end"
          onPress={() => setModalVisible(false)}
        >
          <View className="bg-white rounded-t-3xl max-h-96">
            <View className="p-4 border-b border-gray-200">
              <Text className="text-lg font-semibold text-gray-900">
                {label || 'Selecione'}
              </Text>
            </View>
            
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  className={`
                    p-4 border-b border-gray-100
                    ${item.value === value ? 'bg-blue-50' : ''}
                  `}
                  onPress={() => handleSelect(item.value)}
                >
                  <Text className={`
                    text-base
                    ${item.value === value ? 'text-blue-600 font-semibold' : 'text-gray-900'}
                  `}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}
