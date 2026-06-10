import React from 'react';
import { View, Text } from 'react-native';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
}

export function EmptyState({ icon = '📋', title, description }: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center p-8">
      <Text className="text-6xl mb-4">{icon}</Text>
      <Text className="text-gray-900 font-semibold text-lg text-center mb-2">
        {title}
      </Text>
      {description && (
        <Text className="text-gray-600 text-base text-center">
          {description}
        </Text>
      )}
    </View>
  );
}
