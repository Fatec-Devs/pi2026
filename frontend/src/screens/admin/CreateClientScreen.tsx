import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ClientForm } from '../../components/forms/ClientForm';
import clientService from '../../services/clientService';

/**
 * Tela de cadastro de cliente (admin)
 * Utiliza ClientForm para coleta de dados
 * Integra-se com clientService para persistência
 */
export default function CreateClientScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateClient = async (formData: any) => {
    setIsLoading(true);
    setError(null);

    try {
      // Validações adicionais no backend
      // Aqui você pode adicionar o userId do usuário logado se necessário
      const clientPayload = {
        ...formData,
        userId: 'user-id-from-context', // TODO: Obter do AuthContext
      };

      const newClient = await clientService.create(clientPayload);

      // Sucesso
      Alert.alert('Sucesso', `Cliente ${newClient.id} cadastrado com sucesso!`, [
        {
          text: 'OK',
          onPress: () => {
            // Retornar para lista de clientes ou voltar
            router.back();
          },
        },
      ]);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Erro ao criar cliente';
      setError(errorMessage);
      Alert.alert('Erro', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>{'< Voltar'}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Novo Cliente</Text>
        <View style={{ width: 60 }} />
      </View>

      {/* Erro global (se houver) */}
      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>{error}</Text>
          <TouchableOpacity onPress={() => setError(null)}>
            <Text style={styles.closeBanner}>×</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Formulário */}
      <ClientForm
        onSubmit={handleCreateClient}
        isLoading={isLoading}
        submitButtonLabel="Criar Cliente"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    color: '#3b82f6',
    fontSize: 14,
    fontWeight: '500',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    flex: 1,
    textAlign: 'center',
  },
  errorBanner: {
    backgroundColor: '#fee2e2',
    borderBottomWidth: 1,
    borderBottomColor: '#fecaca',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorBannerText: {
    color: '#991b1b',
    fontSize: 13,
    flex: 1,
  },
  closeBanner: {
    color: '#991b1b',
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});
