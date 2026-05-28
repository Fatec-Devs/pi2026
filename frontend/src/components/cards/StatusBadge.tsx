import React from 'react';
import { View, Text } from 'react-native';
import { ServiceOrderStatus } from '../../types/domain';

interface StatusBadgeProps {
  status: ServiceOrderStatus;
  size?: 'sm' | 'md' | 'lg';
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const statusConfig = {
    ORCAMENTO: {
      label: 'Orçamento',
      bgColor: 'bg-gray-500',
      textColor: 'text-white',
    },
    APROVADO: {
      label: 'Aprovado',
      bgColor: 'bg-blue-500',
      textColor: 'text-white',
    },
    EM_EXECUCAO: {
      label: 'Em Execução',
      bgColor: 'bg-orange-500',
      textColor: 'text-white',
    },
    CONCLUIDO: {
      label: 'Concluído',
      bgColor: 'bg-green-500',
      textColor: 'text-white',
    },
  };

  const sizeClasses = {
    sm: 'px-2 py-1',
    md: 'px-3 py-1.5',
    lg: 'px-4 py-2',
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const config = statusConfig[status];

  return (
    <View className={`${config.bgColor} ${sizeClasses[size]} rounded-full self-start`}>
      <Text className={`${config.textColor} ${textSizeClasses[size]} font-semibold`}>
        {config.label}
      </Text>
    </View>
  );
}
