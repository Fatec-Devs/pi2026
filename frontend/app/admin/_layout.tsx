import { Stack } from 'expo-router';

export default function AdminLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'Admin',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="clients"
        options={{
          title: 'Clientes',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="machines"
        options={{
          title: 'Máquinas',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="service-orders"
        options={{
          title: 'Ordens de Serviço',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="finance"
        options={{
          title: 'Financeiro',
          headerShown: false,
        }}
      />
    </Stack>
  );
}
