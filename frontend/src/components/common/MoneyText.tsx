import React from 'react';
import { Text, TextProps } from 'react-native';

interface MoneyTextProps extends TextProps {
  value: number;
  currency?: string;
  className?: string;
}

export function MoneyText({ 
  value, 
  currency = 'R$',
  className = '',
  ...rest 
}: MoneyTextProps) {
  const formatMoney = (amount: number): string => {
    return amount.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };
  
  return (
    <Text className={className} {...rest}>
      {currency} {formatMoney(value)}
    </Text>
  );
}
