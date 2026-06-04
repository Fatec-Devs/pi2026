import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Card } from '../common/Card';
import { StatusBadge } from '../common/StatusBadge';
import { ServiceOrder } from '../../types/domain';

interface ServiceOrderCardProps {
  serviceOrder: ServiceOrder;
  onPress?: () => void;
}

export function ServiceOrderCard({
  serviceOrder,
  onPress,
}: ServiceOrderCardProps) {
  // Formata data
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  // Formata valor em reais
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  // Nome da máquina (assumindo que está populado)
  const machineName =
    typeof serviceOrder.machineId === 'object'
      ? (serviceOrder.machineId as any).name
      : 'Máquina não identificada';

  return (
    <TouchableOpacity onPress={onPress} disabled={!onPress}>
      <Card variant="outlined" className="mb-3">
        {/* Cabeçalho */}
        <View className="flex-row justify-between items-start mb-3">
          <View className="flex-1">
            <Text className="text-gray-500 text-xs mb-1">
              OS #{serviceOrder.id?.slice(-8) || 'N/A'}
            </Text>
            <Text className="text-gray-900 font-semibold text-base">
              {machineName}
            </Text>
          </View>
          <StatusBadge status={serviceOrder.status} />
        </View>

        {/* Serviços */}
        <View className="mb-3">
          <Text className="text-gray-700 text-sm font-medium mb-1">
            Serviços:
          </Text>
          {serviceOrder.services.slice(0, 2).map((service, index) => (
            <Text key={index} className="text-gray-600 text-sm">
              • {service.description}
            </Text>
          ))}
          {serviceOrder.services.length > 2 && (
            <Text className="text-gray-500 text-sm italic">
              + {serviceOrder.services.length - 2} outros serviços
            </Text>
          )}
        </View>

        {/* Informações de custo */}
        {serviceOrder.totalCost > 0 && (
          <View className="border-t border-gray-200 pt-3 mb-3">
            <View className="flex-row justify-between items-center">
              <Text className="text-gray-700 text-sm">Valor Total:</Text>
              <Text className="text-gray-900 font-bold text-lg">
                {formatCurrency(serviceOrder.totalCost)}
              </Text>
            </View>
          </View>
        )}

        {/* Rodapé */}
        <View className="flex-row justify-between items-center border-t border-gray-200 pt-3">
          <Text className="text-gray-500 text-xs">
            Criado em {formatDate(serviceOrder.createdAt)}
          </Text>
          
          {serviceOrder.status === 'CONCLUIDO' && serviceOrder.finishedAt && (
            <Text className="text-green-600 text-xs font-medium">
              Finalizado em {formatDate(serviceOrder.finishedAt)}
            </Text>
          )}
          
          {serviceOrder.status === 'EM_EXECUCAO' && serviceOrder.startedAt && (
            <Text className="text-orange-600 text-xs font-medium">
              Iniciado em {formatDate(serviceOrder.startedAt)}
            </Text>
          )}
          
          {serviceOrder.status === 'APROVADO' && serviceOrder.approvedAt && (
            <Text className="text-blue-600 text-xs font-medium">
              Aprovado em {formatDate(serviceOrder.approvedAt)}
            </Text>
          )}
        </View>

        {/* Observações (se houver) */}
        {serviceOrder.notes && (
          <View className="mt-3 pt-3 border-t border-gray-200">
            <Text className="text-gray-700 text-sm font-medium mb-1">
              Observações:
            </Text>
            <Text className="text-gray-600 text-sm" numberOfLines={2}>
              {serviceOrder.notes}
            </Text>
          </View>
        )}
      </Card>
    </TouchableOpacity>
  );
}
