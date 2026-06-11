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
import { MachineForm } from '../../components/forms/MachineForm';
import { machineService } from '../../services/machine.service';

/**
 * Tela de cadastro de máquina (admin)
 * Utiliza MachineForm para coleta de dados
 * Integra-se com machineService para persistência
 */
export default function CreateMachineScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateMachine = async (formData: any) => {
    setIsLoading(true);
    setError(null);

    try {
      const newMachine = await machineService.create(formData);

      // Sucesso
      Alert.alert('Sucesso', `Máquina "${newMachine.name}" cadastrada com sucesso!`, [
        {
          text: 'OK',
          onPress: () => {
            // Retornar para lista de máquinas ou voltar
            router.back();
          },
        },
      ]);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Erro ao criar máquina';
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
        <Text style={styles.title}>Nova Máquina</Text>
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
      <MachineForm
        onSubmit={handleCreateMachine}
        isLoading={isLoading}
        submitButtonLabel="Criar Máquina"
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
