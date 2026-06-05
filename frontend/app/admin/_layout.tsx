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
        name="products"
        options={{
          title: 'Produtos',
          headerShown: false,
        }}
      />
    </Stack>
  );
}
