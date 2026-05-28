import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ClientStackParamList } from '../../routes/ClientStack';
import { useMockData } from '../../hooks/useMockData';
import { StatusBadge } from '../../components/cards';
import { MoneyText, LoadingOverlay } from '../../components/common';

type Props = NativeStackScreenProps<ClientStackParamList, 'ServiceOrderDetail'>;

export default function ServiceOrderDetail({ route }: Props) {
  const { serviceOrderId } = route.params;
  const { serviceOrders, machines, inventoryItems, loading } = useMockData();

  const serviceOrder = serviceOrders.find(so => so.id === serviceOrderId);
  const machine = serviceOrder ? machines.find(m => m.id === serviceOrder.machineId) : null;

  if (loading) {
    return <LoadingOverlay visible={true} message="Carregando detalhes..." />;
  }

  if (!serviceOrder) {
    return (
      <View className="flex-1 items-center justify-center p-6 bg-gray-50">
        <Text className="text-6xl mb-4">❌</Text>
        <Text className="text-gray-900 font-semibold text-lg text-center mb-2">
          Ordem não encontrada
        </Text>
        <Text className="text-gray-500 text-base text-center">
          Não foi possível carregar os detalhes desta ordem de serviço.
        </Text>
      </View>
    );
  }

  const formatDate = (dateString?: string) => {
    return dateString ? new Date(dateString).toLocaleDateString('pt-BR') : '—';
  };

  // Timeline status
  const statusSteps = [
    { key: 'ORCAMENTO', label: 'Orçamento', date: serviceOrder.createdAt },
    { key: 'APROVADO', label: 'Aprovado', date: serviceOrder.approvedAt },
    { key: 'EM_EXECUCAO', label: 'Em Execução', date: serviceOrder.startedAt },
    { key: 'CONCLUIDO', label: 'Concluído', date: serviceOrder.finishedAt },
  ];

  const currentStatusIndex = statusSteps.findIndex(s => s.key === serviceOrder.status);

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-4">
        {/* Header Card */}
        <View className="bg-white rounded-lg p-4 mb-4 shadow-sm">
          <View className="flex-row justify-between items-start mb-3">
            <View>
              <Text className="text-gray-500 text-sm mb-1">
                Ordem de Serviço
              </Text>
              <Text className="text-gray-900 font-bold text-xl">
                #{serviceOrder.id.slice(0, 8)}
              </Text>
            </View>
            <StatusBadge status={serviceOrder.status} size="md" />
          </View>

          <View className="border-t border-gray-200 pt-3">
            <Text className="text-gray-700 font-semibold text-base mb-1">
              {machine?.name || 'Máquina não especificada'}
            </Text>
            {machine?.brand && (
              <Text className="text-gray-600 text-sm">
                {machine.brand} {machine.model || ''}
              </Text>
            )}
            {machine?.serialNumber && (
              <Text className="text-gray-500 text-xs mt-1">
                S/N: {machine.serialNumber}
              </Text>
            )}
          </View>
        </View>

        {/* Timeline */}
        <View className="bg-white rounded-lg p-4 mb-4 shadow-sm">
          <Text className="text-gray-900 font-semibold text-base mb-4">
            Status da OS
          </Text>
          {statusSteps.map((step, index) => {
            const isActive = index <= currentStatusIndex;
            const isLast = index === statusSteps.length - 1;

            return (
              <View key={step.key} className="flex-row">
                <View className="items-center mr-3">
                  <View
                    className={`w-8 h-8 rounded-full items-center justify-center ${
                      isActive ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <Text className="text-white font-bold text-sm">
                      {index + 1}
                    </Text>
                  </View>
                  {!isLast && (
                    <View
                      className={`w-1 flex-1 my-1 ${
                        isActive ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                      style={{ height: 40 }}
                    />
                  )}
                </View>
                <View className="flex-1 pb-6">
                  <Text
                    className={`font-semibold text-base ${
                      isActive ? 'text-gray-900' : 'text-gray-400'
                    }`}
                  >
                    {step.label}
                  </Text>
                  <Text className="text-gray-500 text-sm">
                    {formatDate(step.date)}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Services */}
        <View className="bg-white rounded-lg p-4 mb-4 shadow-sm">
          <Text className="text-gray-900 font-semibold text-base mb-3">
            Serviços Incluídos
          </Text>
          {serviceOrder.services.map((service, index) => (
            <View
              key={index}
              className="border-b border-gray-100 py-3 last:border-b-0"
            >
              <Text className="text-gray-900 text-base mb-1">
                {service.description}
              </Text>
              <View className="flex-row justify-between">
                <Text className="text-gray-500 text-sm">
                  {service.estimatedHours}h estimadas
                </Text>
                <MoneyText
                  value={service.price}
                  className="text-gray-700 font-semibold text-sm"
                />
              </View>
            </View>
          ))}
        </View>

        {/* Materials */}
        {serviceOrder.materials.length > 0 && (
          <View className="bg-white rounded-lg p-4 mb-4 shadow-sm">
            <Text className="text-gray-900 font-semibold text-base mb-3">
              Materiais Utilizados
            </Text>
            {serviceOrder.materials.map((material, index) => {
              const item = inventoryItems.find(i => i.id === material.inventoryItemId);
              return (
                <View
                  key={index}
                  className="border-b border-gray-100 py-3 last:border-b-0"
                >
                  <Text className="text-gray-900 text-base mb-1">
                    {item?.name || 'Item não encontrado'}
                  </Text>
                  <View className="flex-row justify-between">
                    <Text className="text-gray-500 text-sm">
                      Quantidade: {material.quantity} {item?.unit || ''}
                    </Text>
                    <MoneyText
                      value={material.quantity * material.unitCost}
                      className="text-gray-700 font-semibold text-sm"
                    />
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Costs Summary */}
        <View className="bg-white rounded-lg p-4 mb-4 shadow-sm">
          <Text className="text-gray-900 font-semibold text-base mb-3">
            Resumo de Custos
          </Text>
          <View className="space-y-2">
            <View className="flex-row justify-between py-2">
              <Text className="text-gray-600 text-base">Mão de Obra</Text>
              <MoneyText
                value={serviceOrder.laborCost}
                className="text-gray-900 text-base"
              />
            </View>
            <View className="flex-row justify-between py-2">
              <Text className="text-gray-600 text-base">Peças/Materiais</Text>
              <MoneyText
                value={serviceOrder.partsCost}
                className="text-gray-900 text-base"
              />
            </View>
            <View className="border-t border-gray-200 pt-2 mt-2">
              <View className="flex-row justify-between">
                <Text className="text-gray-900 font-bold text-lg">Total</Text>
                <MoneyText
                  value={serviceOrder.totalCost}
                  className="text-blue-600 font-bold text-lg"
                />
              </View>
            </View>
          </View>
        </View>

        {/* Notes */}
        {serviceOrder.notes && (
          <View className="bg-white rounded-lg p-4 mb-4 shadow-sm">
            <Text className="text-gray-900 font-semibold text-base mb-2">
              Observações
            </Text>
            <Text className="text-gray-600 text-base leading-6">
              {serviceOrder.notes}
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
