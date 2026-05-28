import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, TouchableOpacityProps } from 'react-native';

type ButtonVariant = 'primary' | 'secondary' | 'outline';

interface AppButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
}

export function AppButton({ 
  title, 
  variant = 'primary', 
  loading = false, 
  disabled = false,
  ...rest 
}: AppButtonProps) {
  const isDisabled = disabled || loading;
  
  const baseClasses = 'px-6 py-3 rounded-lg items-center justify-center';
  const variantClasses = {
    primary: 'bg-blue-600 active:bg-blue-700',
    secondary: 'bg-gray-600 active:bg-gray-700',
    outline: 'bg-transparent border-2 border-blue-600 active:bg-blue-50',
  };
  const disabledClasses = 'opacity-50';
  
  const textBaseClasses = 'text-base font-semibold';
  const textVariantClasses = {
    primary: 'text-white',
    secondary: 'text-white',
    outline: 'text-blue-600',
  };
  
  return (
    <TouchableOpacity
      className={`${baseClasses} ${variantClasses[variant]} ${isDisabled ? disabledClasses : ''}`}
      disabled={isDisabled}
      activeOpacity={0.8}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? '#2563eb' : '#ffffff'} />
      ) : (
        <Text className={`${textBaseClasses} ${textVariantClasses[variant]}`}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}
