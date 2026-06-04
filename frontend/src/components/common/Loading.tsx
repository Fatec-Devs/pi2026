import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';

interface LoadingProps {
  message?: string;
  size?: 'small' | 'large';
  fullScreen?: boolean;
}

export function Loading({
  message = 'Carregando...',
  size = 'large',
  fullScreen = false,
}: LoadingProps) {
  const containerClasses = fullScreen
    ? 'flex-1 items-center justify-center bg-white'
    : 'items-center justify-center py-8';

  return (
    <View className={containerClasses}>
      <ActivityIndicator size={size} color="#2563eb" />
      {message && (
        <Text className="text-gray-600 mt-4 text-base">
          {message}
        </Text>
      )}
    </View>
  );
}
