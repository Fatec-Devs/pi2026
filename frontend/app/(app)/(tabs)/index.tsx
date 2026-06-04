import { View, Text, ScrollView } from 'react-native';
import { useAuth } from '../../../src/contexts/AuthContext';
import { Button } from '../../../src/components/common/Button';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="p-4">
        <Text className="text-2xl font-bold text-gray-900 mb-2">
          Olá, {user?.name}!
        </Text>
        <Text className="text-gray-600 mb-6">
          Bem-vindo ao sistema de gestão de oficina
        </Text>

        {/* Cards de ações rápidas */}
        <View className="gap-4">
          <Button
            title="Solicitar Novo Serviço"
            onPress={() => router.push('/(app)/(tabs)/request-service')}
            size="large"
          />
          
          <Button
            title="Ver Minhas Ordens"
            onPress={() => router.push('/(app)/(tabs)/my-orders')}
            variant="outline"
            size="large"
          />
        </View>

        {/* Informações */}
        <View className="mt-8 bg-blue-50 rounded-lg p-4 border border-blue-200">
          <Text className="text-blue-900 font-semibold mb-2">
            ℹ️ Como funciona
          </Text>
          <Text className="text-blue-800 text-sm">
            1. Solicite um serviço preenchendo os dados da máquina e serviços necessários{'\n'}
            2. Aguarde a aprovação do orçamento{'\n'}
            3. Acompanhe o andamento na aba "Minhas OS"
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
