import { Tabs } from 'expo-router';
import { Text } from 'react-native';

export default function AppTabs() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: '#6b7280',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e5e7eb',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          tabBarLabel: 'Início',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 24 }}>🏠</Text>,
        }}
      />
      <Tabs.Screen
        name="request-service"
        options={{
          title: 'Solicitar Serviço',
          tabBarLabel: 'Solicitar',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 24 }}>➕</Text>,
        }}
      />
      <Tabs.Screen
        name="my-orders"
        options={{
          title: 'Minhas OS',
          tabBarLabel: 'Minhas OS',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 24 }}>📋</Text>,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarLabel: 'Perfil',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 24 }}>👤</Text>,
        }}
      />
    </Tabs>
  );
}
