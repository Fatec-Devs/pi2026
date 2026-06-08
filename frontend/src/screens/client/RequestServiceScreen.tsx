import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/common/Button';
import { TextInput } from '../../components/common/TextInput';
import { ServiceItemInput } from '../../components/forms/ServiceItemInput';
import { MachineSelector } from '../../components/forms/MachineSelector';
import { ClientSelector } from '../../components/forms/ClientSelector';
import { serviceOrderService } from '../../services/serviceOrder.service';
import { clientService } from '../../services/client.service';
import { ServiceItemInput as ServiceItemType, Machine, Client } from '../../types/domain';

export function RequestServiceScreen() {
  const { user } = useAuth();
  const [clientId, setClientId] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [machineId, setMachineId] = useState('');
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);
  const [services, setServices] = useState<ServiceItemType[]>([
    { description: '', estimatedHours: 0, price: 0 },
  ]);
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<{ client?: string; machine?: string; services?: string }>({});
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingClient, setIsLoadingClient] = useState(true);

  // Busca clientId do usuário logado
  useEffect(() => {
    loadClientId();
  }, [user]);

  const loadClientId = async () => {
    try {
      setIsLoadingClient(true);
      
      // Se for cliente, busca o próprio cliente
      if (user?.role === 'CLIENT') {
        const client = await clientService.getMe();
        if (!client) {
          // Cliente não encontrado - mostra mensagem amigável
          setError('Você não possui um cadastro de cliente. Por favor, entre em contato com o suporte.');
          return;
        }
        setClientId(client._id);
        setSelectedClient(client);
      } else {
        // Se for admin, não carrega cliente automaticamente
        // Admin deve selecionar o cliente manualmente
        return;
      }
    } catch (error: any) {
      if (error.code === 'CLIENT_NOT_FOUND' || error.status === 404) {
        setError('Você não possui um cadastro de cliente. Por favor, entre em contato com o suporte.');
      } else {
        Alert.alert('Erro', error.message || 'Erro ao carregar dados do cliente');
      }
    } finally {
      setIsLoadingClient(false);
    }
  };

  const handleAddService = () => {
    setServices([...services, { description: '', estimatedHours: 0, price: 0 }]);
  };

  const handleRemoveService = (index: number) => {
    if (services.length > 1) {
      const newServices = services.filter((_, i) => i !== index);
      setServices(newServices);
    }
  };

  const handleServiceChange = (index: number, value: ServiceItemType) => {
    const newServices = [...services];
    newServices[index] = value;
    setServices(newServices);
  };

  const handleMachineChange = (
  id: string | null,
  machine: Machine | null,
) => {
  setMachineId(id ?? '');
  setSelectedMachine(machine);

  if (errors.machine) {
    setErrors((prev) => ({ ...prev, machine: undefined }));
  }
};

  const handleClientChange = (id: string, client: Client | null) => {
    setClientId(id);
    setSelectedClient(client);

    if (errors.client) {
      setErrors((prev) => ({ ...prev, client: undefined }));
    }
  };

  const validate = () => {
    const newErrors: typeof errors = {};

    // Admins precisam selecionar um cliente
    if (user?.role === 'ADMIN' && !clientId) {
      newErrors.client = 'Selecione um cliente';
    }

    if (!machineId) {
      newErrors.machine = 'Selecione uma máquina';
    }

    const validServices = services.filter(
      (s) => s.description && s.description.trim() !== ''
    );

    if (validServices.length === 0) {
      newErrors.services = 'Adicione pelo menos um serviço';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      Alert.alert('Atenção', 'Por favor, preencha todos os campos obrigatórios');
      return;
    }

    try {
      setIsLoading(true);

      // Filtra apenas serviços válidos
      const validServices = services.filter(
        (s) => s.description && s.description.trim() !== ''
      );

      const data = {
        clientId,
        machineId,
        services: validServices,
        notes: notes.trim() || undefined,
      };

      await serviceOrderService.create(data);

      Alert.alert(
        'Sucesso',
        'Ordem de serviço criada com sucesso! Aguarde aprovação.',
        [
          {
            text: 'OK',
            onPress: () => {
              // Reset form
              setMachineId('');
              setSelectedMachine(null);
              setServices([{ description: '', estimatedHours: 0, price: 0 }]);
              setNotes('');
              // TODO: Navigate to "Minhas OS" screen
            },
          },
        ]
      );
    } catch (error: any) {
      Alert.alert(
        'Erro',
        error.message || 'Erro ao criar ordem de serviço'
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingClient && user?.role === 'CLIENT') {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-gray-600">Carregando...</Text>
      </View>
    );
  }

  if (error && user?.role === 'CLIENT') {
    return (
      <View className="flex-1 items-center justify-center bg-white p-6">
        <Text className="text-2xl mb-4">⚠️</Text>
        <Text className="text-red-600 text-center font-semibold mb-2">
          Cadastro Incompleto
        </Text>
        <Text className="text-gray-600 text-center">
          {error}
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1"
    >
      <ScrollView className="flex-1 bg-white">
        <View className="p-4">
          <Text className="text-2xl font-bold text-gray-900 mb-2">
            Solicitar Serviço
          </Text>
          <Text className="text-gray-600 mb-6">
            Preencha os dados do serviço que deseja solicitar
          </Text>

          {/* Seleção de Cliente (apenas para admins) */}
          {user?.role === 'ADMIN' && (
            <ClientSelector
              value={clientId}
              onChange={handleClientChange}
              error={errors.client}
            />
          )}

          {/* Seleção de Máquina */}
          <MachineSelector
            value={machineId}
            onChange={handleMachineChange}
            error={errors.machine}
          />

          {/* Serviços */}
          <View className="mt-6">
            <Text className="text-gray-900 font-semibold text-lg mb-3">
              Serviços Solicitados
            </Text>

            {services.map((service, index) => (
              <ServiceItemInput
                key={index}
                value={service}
                onChange={(value) => handleServiceChange(index, value)}
                onRemove={() => handleRemoveService(index)}
                index={index}
                canRemove={services.length > 1}
              />
            ))}

            {errors.services && (
              <Text className="text-red-600 text-sm mb-2">
                {errors.services}
              </Text>
            )}

            <TouchableOpacity
              onPress={handleAddService}
              className="bg-blue-50 border-2 border-blue-200 border-dashed rounded-lg py-3 items-center mb-4"
            >
              <Text className="text-blue-600 font-semibold">
                + Adicionar Serviço
              </Text>
            </TouchableOpacity>
          </View>

          {/* Observações */}
          <TextInput
            label="Observações (opcional)"
            value={notes}
            onChangeText={setNotes}
            placeholder="Informações adicionais sobre o serviço"
            multiline
            numberOfLines={4}
            containerClassName="mb-6"
            className="h-24"
          />

          {/* Botão de Envio */}
          <Button
            title="Solicitar Serviço"
            onPress={handleSubmit}
            loading={isLoading}
            disabled={isLoading}
            size="large"
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
