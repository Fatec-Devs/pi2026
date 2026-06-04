import { View, Text, ScrollView } from 'react-native';
import { useAuth } from '../../../src/contexts/AuthContext';
import { Button } from '../../../src/components/common/Button';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="p-4">
        <Text className="text-2xl font-bold text-gray-900 mb-6">
          Meu Perfil
        </Text>

        {/* Informações do usuário */}
        <View className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-200">
          <View className="mb-3">
            <Text className="text-gray-500 text-sm mb-1">Nome</Text>
            <Text className="text-gray-900 font-semibold text-base">
              {user?.name}
            </Text>
          </View>

          <View className="mb-3">
            <Text className="text-gray-500 text-sm mb-1">Email</Text>
            <Text className="text-gray-900 font-semibold text-base">
              {user?.email}
            </Text>
          </View>

          {user?.phone && (
            <View className="mb-3">
              <Text className="text-gray-500 text-sm mb-1">Telefone</Text>
              <Text className="text-gray-900 font-semibold text-base">
                {user.phone}
              </Text>
            </View>
          )}

          <View>
            <Text className="text-gray-500 text-sm mb-1">Perfil</Text>
            <Text className="text-gray-900 font-semibold text-base">
              {user?.role === 'CLIENT' ? 'Cliente' : 'Administrador'}
            </Text>
          </View>
        </View>

        {/* Ações */}
        <Button
          title="Sair da Conta"
          onPress={handleLogout}
          variant="danger"
          size="large"
        />
      </View>
    </ScrollView>
  );
}
