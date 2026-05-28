import React from 'react';
import { View, Text, TextInput, TextInputProps } from 'react-native';

interface AppInputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  containerClassName?: string;
}

export function AppInput({ 
  label, 
  error, 
  helperText,
  containerClassName = '',
  ...rest 
}: AppInputProps) {
  const hasError = !!error;
  
  return (
    <View className={`mb-4 ${containerClassName}`}>
      {label && (
        <Text className="text-gray-700 font-medium mb-2">
          {label}
        </Text>
      )}
      
      <TextInput
        className={`
          px-4 py-3 border rounded-lg bg-white text-base
          ${hasError ? 'border-red-500' : 'border-gray-300'}
          ${rest.editable === false ? 'bg-gray-100 text-gray-500' : ''}
        `}
        placeholderTextColor="#9ca3af"
        {...rest}
      />
      
      {error && (
        <Text className="text-red-500 text-sm mt-1">
          {error}
        </Text>
      )}
      
      {helperText && !error && (
        <Text className="text-gray-500 text-sm mt-1">
          {helperText}
        </Text>
      )}
    </View>
  );
}
