import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Machine } from '../../types/domain';
import { machineService } from '../../services/machine.service';
import { MachineForm } from '../../components/forms/MachineForm';

/**
 * Tela de detalhes/edição de máquina (admin)
 * Carrega máquina por ID e permite edição
 */
export default function MachineDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [machine, setMachine] = useState<Machine | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadMachine();
    }
  }, [id]);

  const loadMachine = async () => {
    try {
      setError(null);
      const data = await machineService.getById(id!);
      setMachine(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Erro ao carregar máquina';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateMachine = async (formData: any) => {
    if (!machine) return;

    setIsSaving(true);
    setError(null);

    try {
      const updatedMachine = await machineService.update(machine._id, formData);
      setMachine(updatedMachine);
      Alert.alert('Sucesso', 'Máquina atualizada com sucesso!', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Erro ao atualizar máquina';
      setError(errorMessage);
      Alert.alert('Erro', errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      </SafeAreaView>
    );
  }

  if (!machine) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backButton}>{'< Voltar'}</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Máquina não encontrada</Text>
          <View style={{ width: 60 }} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>{'< Voltar'}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Editar Máquina</Text>
        <View style={{ width: 60 }} />
      </View>

      {/* Erro global */}
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
        initialData={machine}
        onSubmit={handleUpdateMachine}
        isLoading={isSaving}
        submitButtonLabel="Atualizar"
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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
