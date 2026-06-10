import React, { ReactNode } from 'react';
import { View, ViewProps } from 'react-native';

interface CardProps extends ViewProps {
  children: ReactNode;
  variant?: 'default' | 'elevated' | 'outlined';
}

export function Card({
  children,
  variant = 'default',
  className,
  ...rest
}: CardProps) {
  const variantClasses = {
    default: 'bg-white rounded-lg p-4',
    elevated: 'bg-white rounded-lg p-4 shadow-md',
    outlined: 'bg-white rounded-lg p-4 border border-gray-200',
  };

  return (
    <View
      className={`${variantClasses[variant]} ${className || ''}`}
      {...rest}
    >
      {children}
    </View>
  );
}
