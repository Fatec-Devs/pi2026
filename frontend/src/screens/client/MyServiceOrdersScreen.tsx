import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  FlatList,
  RefreshControl,
  Text,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { ServiceOrderCard } from '../../components/cards/ServiceOrderCard';
import { Loading } from '../../components/common/Loading';
import { EmptyState } from '../../components/common/EmptyState';
import { serviceOrderService } from '../../services/serviceOrder.service';
import { clientService } from '../../services/client.service';
import { ServiceOrder } from '../../types/domain';

export function MyServiceOrdersScreen() {
  const { user } = useAuth();
  const [serviceOrders, setServiceOrders] = useState<ServiceOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState('');

  // Carrega ordens ao montar
  useEffect(() => {
    loadServiceOrders();
  }, [user]);

  const loadServiceOrders = async () => {
    try {
      setError('');
      
      // Admins veem todas as ordens, clientes veem apenas as suas
      if (user?.role === 'ADMIN') {
        const serviceOrders = await serviceOrderService.list();
        setServiceOrders(serviceOrders || []);
      } else {
        // Clientes precisam buscar seu clientId primeiro
        const client = await clientService.getMe();
        if (!client) {
          setError('Você não possui um cadastro de cliente. Por favor, entre em contato com o suporte.');
          setServiceOrders([]);
          return;
        }
        const data = await serviceOrderService.getClientHistory(client._id);
        setServiceOrders(data || []);
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar ordens de serviço');
      setServiceOrders([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    loadServiceOrders();
  }, [user]);

  const handleCardPress = (serviceOrder: ServiceOrder) => {
    // TODO: Navegar para tela de detalhes da OS
    console.log('Navegar para detalhes da OS:', serviceOrder._id);
  };

  // Estado de carregamento inicial
  if (isLoading) {
    return <Loading message="Carregando ordens de serviço..." fullScreen />;
  }

  // Estado de erro
  if (error && !serviceOrders.length) {
    return (
      <View className="flex-1 bg-white">
        <View className="p-4 bg-red-50 border-b border-red-200">
          <Text className="text-red-600 text-center">{error}</Text>
        </View>
        <EmptyState
          icon="⚠️"
          title="Erro ao carregar"
          description="Não foi possível carregar suas ordens de serviço"
        />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Cabeçalho */}
      <View className="bg-white p-4 border-b border-gray-200">
        <Text className="text-2xl font-bold text-gray-900">
          {user?.role === 'ADMIN' ? 'Todas as Ordens de Serviço' : 'Minhas Ordens de Serviço'}
        </Text>
        <Text className="text-gray-600 mt-1">
          {serviceOrders.length} {serviceOrders.length === 1 ? 'ordem' : 'ordens'} de serviço
        </Text>
      </View>

      {/* Mensagem de erro (se houver, mas com dados) */}
      {error && (
        <View className="bg-orange-50 p-3 border-b border-orange-200">
          <Text className="text-orange-700 text-sm text-center">{error}</Text>
        </View>
      )}

      {/* Lista de ordens */}
      <FlatList
        data={serviceOrders}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <ServiceOrderCard
            serviceOrder={item}
            onPress={() => handleCardPress(item)}
          />
        )}
        contentContainerClassName="p-4"
        ListEmptyComponent={
          <EmptyState
            icon="📋"
            title="Nenhuma ordem de serviço"
            description="Você ainda não solicitou nenhum serviço. Que tal solicitar o primeiro?"
          />
        }
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={['#2563eb']}
            tintColor="#2563eb"
          />
        }
      />
    </View>
  );
}
