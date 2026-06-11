import { Stack } from 'expo-router';

export default function ClientsLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'Clientes',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="create"
        options={{
          title: 'Novo Cliente',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: 'Detalhes do Cliente',
          headerShown: false,
        }}
      />
    </Stack>
  );
}
