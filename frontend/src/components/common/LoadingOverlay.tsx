import React from 'react';
import { View, ActivityIndicator, Modal, Text } from 'react-native';

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
}

export function LoadingOverlay({ visible, message }: LoadingOverlayProps) {
  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View className="flex-1 bg-black/50 items-center justify-center">
        <View className="bg-white rounded-2xl p-6 items-center shadow-lg">
          <ActivityIndicator size="large" color="#2563eb" />
          {message && (
            <Text className="text-gray-700 text-base mt-4 text-center">
              {message}
            </Text>
          )}
        </View>
      </View>
    </Modal>
  );
}
