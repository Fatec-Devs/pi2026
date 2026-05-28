import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MyServiceOrders from '../screens/client/MyServiceOrders';
import ServiceOrderDetail from '../screens/client/ServiceOrderDetail';
import RequestService from '../screens/client/RequestService';

export type ClientStackParamList = {
  MyServiceOrders: undefined;
  ServiceOrderDetail: { serviceOrderId: string };
  RequestService: undefined;
};

const Stack = createNativeStackNavigator<ClientStackParamList>();

export function ClientStack() {
  return (
    <Stack.Navigator
      initialRouteName="MyServiceOrders"
      screenOptions={{
        headerStyle: {
          backgroundColor: '#2563eb',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="MyServiceOrders"
        component={MyServiceOrders}
        options={{ title: 'Minhas Ordens de Serviço' }}
      />
      <Stack.Screen
        name="ServiceOrderDetail"
        component={ServiceOrderDetail}
        options={{ title: 'Detalhes da OS' }}
      />
      <Stack.Screen
        name="RequestService"
        component={RequestService}
        options={{ title: 'Solicitar Serviço' }}
      />
    </Stack.Navigator>
  );
}
