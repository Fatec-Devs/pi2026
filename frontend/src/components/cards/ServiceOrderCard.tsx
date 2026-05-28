import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ServiceOrder, Machine } from '../../types/domain';
import { StatusBadge } from './StatusBadge';
import { MoneyText } from '../common/MoneyText';

interface ServiceOrderCardProps {
  serviceOrder: ServiceOrder;
  machine?: Machine;
  onPress?: () => void;
}

export function ServiceOrderCard({ serviceOrder, machine, onPress }: ServiceOrderCardProps) {
  const createdDate = serviceOrder.createdAt 
    ? new Date(serviceOrder.createdAt).toLocaleDateString('pt-BR')
    : 'N/A';

  return (
    <TouchableOpacity
      className="bg-white rounded-lg p-4 mb-3 border border-gray-200 shadow-sm active:bg-gray-50"
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.7}
    >
      <View className="flex-row justify-between items-start mb-2">
        <View className="flex-1">
          <Text className="text-gray-500 text-xs mb-1">OS #{serviceOrder.id.slice(0, 8)}</Text>
          <Text className="text-gray-900 font-semibold text-base">
            {machine?.name || 'Máquina não especificada'}
          </Text>
          {machine?.brand && (
            <Text className="text-gray-600 text-sm">
              {machine.brand} {machine.model || ''}
            </Text>
          )}
        </View>
        <StatusBadge status={serviceOrder.status} size="sm" />
      </View>

      <View className="border-t border-gray-100 pt-2 mt-2">
        <View className="flex-row justify-between items-center">
          <Text className="text-gray-500 text-sm">Criado em: {createdDate}</Text>
          <MoneyText 
            value={serviceOrder.totalCost || 0} 
            className="text-gray-900 font-bold text-base"
          />
        </View>
      </View>

      {serviceOrder.notes && (
        <Text className="text-gray-600 text-sm mt-2" numberOfLines={2}>
          {serviceOrder.notes}
        </Text>
      )}
    </TouchableOpacity>
  );
}
