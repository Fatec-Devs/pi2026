import React from 'react';
import { View, Text } from 'react-native';

interface EmptyStateProps {
  title?: string;
  message?: string;
  icon?: string;
}

export function EmptyState({ 
  title = 'Nenhum item encontrado',
  message = 'Não há dados para exibir no momento.',
  icon = '📭',
}: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center p-8">
      <Text className="text-6xl mb-4">{icon}</Text>
      <Text className="text-gray-900 font-semibold text-lg text-center mb-2">
        {title}
      </Text>
      <Text className="text-gray-500 text-base text-center">
        {message}
      </Text>
    </View>
  );
}
