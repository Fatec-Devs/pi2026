import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ClientStackParamList } from '../../routes/ClientStack';
import { ServiceOrder, ServiceOrderStatus } from '../../types/domain';
import { useMockData } from '../../hooks/useMockData';
import { ServiceOrderCard } from '../../components/cards';
import { EmptyState, LoadingOverlay } from '../../components/common';
import { AppButton } from '../../components/common';

type Props = NativeStackScreenProps<ClientStackParamList, 'MyServiceOrders'>;

export default function MyServiceOrders({ navigation }: Props) {
  const { serviceOrders, machines, loading } = useMockData();
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<ServiceOrderStatus | 'ALL'>('ALL');

  const filteredOrders = filter === 'ALL' 
    ? serviceOrders 
    : serviceOrders.filter(so => so.status === filter);

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const handleOrderPress = (serviceOrderId: string) => {
    navigation.navigate('ServiceOrderDetail', { serviceOrderId });
  };

  const handleRequestService = () => {
    navigation.navigate('RequestService');
  };

  if (loading && !refreshing) {
    return <LoadingOverlay visible={true} message="Carregando ordens de serviço..." />;
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Filter Buttons */}
      <View className="bg-white p-3 border-b border-gray-200">
        <View className="flex-row gap-2">
          <TouchableOpacity
            className={`px-4 py-2 rounded-full ${filter === 'ALL' ? 'bg-blue-600' : 'bg-gray-200'}`}
            onPress={() => setFilter('ALL')}
          >
            <Text className={`text-sm font-medium ${filter === 'ALL' ? 'text-white' : 'text-gray-700'}`}>
              Todas
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`px-4 py-2 rounded-full ${filter === 'EM_EXECUCAO' ? 'bg-blue-600' : 'bg-gray-200'}`}
            onPress={() => setFilter('EM_EXECUCAO')}
          >
            <Text className={`text-sm font-medium ${filter === 'EM_EXECUCAO' ? 'text-white' : 'text-gray-700'}`}>
              Em Andamento
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`px-4 py-2 rounded-full ${filter === 'CONCLUIDO' ? 'bg-blue-600' : 'bg-gray-200'}`}
            onPress={() => setFilter('CONCLUIDO')}
          >
            <Text className={`text-sm font-medium ${filter === 'CONCLUIDO' ? 'text-white' : 'text-gray-700'}`}>
              Concluídas
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Service Orders List */}
      {filteredOrders.length === 0 ? (
        <EmptyState 
          title="Nenhuma ordem encontrada"
          message="Não há ordens de serviço para exibir neste filtro."
          icon="📋"
        />
      ) : (
        <FlatList
          data={filteredOrders}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const machine = machines.find(m => m.id === item.machineId);
            return (
              <ServiceOrderCard
                serviceOrder={item}
                machine={machine}
                onPress={() => handleOrderPress(item.id)}
              />
            );
          }}
          contentContainerStyle={{ padding: 16 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}

      {/* Floating Action Button */}
      <View className="absolute bottom-6 right-6">
        <TouchableOpacity
          className="bg-blue-600 w-16 h-16 rounded-full items-center justify-center shadow-lg"
          onPress={handleRequestService}
          activeOpacity={0.8}
        >
          <Text className="text-white text-3xl font-bold">+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
