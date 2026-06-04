import React from 'react';
import { View, Text } from 'react-native';
import { ServiceOrderStatus } from '../../types/domain';

interface StatusBadgeProps {
  status: ServiceOrderStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const statusConfig = {
    ORCAMENTO: {
      label: 'Orçamento',
      bgColor: 'bg-gray-100',
      textColor: 'text-gray-700',
      borderColor: 'border-gray-300',
    },
    APROVADO: {
      label: 'Aprovado',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-700',
      borderColor: 'border-blue-300',
    },
    EM_EXECUCAO: {
      label: 'Em Execução',
      bgColor: 'bg-orange-100',
      textColor: 'text-orange-700',
      borderColor: 'border-orange-300',
    },
    CONCLUIDO: {
      label: 'Concluído',
      bgColor: 'bg-green-100',
      textColor: 'text-green-700',
      borderColor: 'border-green-300',
    },
  };

  const config = statusConfig[status];

  return (
    <View
      className={`${config.bgColor} ${config.borderColor} border px-3 py-1 rounded-full self-start`}
    >
      <Text className={`${config.textColor} text-xs font-semibold`}>
        {config.label}
      </Text>
    </View>
  );
}
