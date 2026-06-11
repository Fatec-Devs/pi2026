import { Stack } from 'expo-router';

export default function MachinesLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'Máquinas',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="create"
        options={{
          title: 'Nova Máquina',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: 'Detalhes da Máquina',
          headerShown: false,
        }}
      />
    </Stack>
  );
}
