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
import { serviceOrderService } from '../../services/serviceOrder.service';
import { ServiceItemInput as ServiceItemType, Machine } from '../../types/domain';

export function RequestServiceScreen() {
  const { user } = useAuth();
  const [clientId, setClientId] = useState('');
  const [machineId, setMachineId] = useState('');
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);
  const [services, setServices] = useState<ServiceItemType[]>([
    { description: '', estimatedHours: 0, price: 0 },
  ]);
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<{ machine?: string; services?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingClient, setIsLoadingClient] = useState(true);

  // Busca clientId do usuário logado
  useEffect(() => {
    loadClientId();
  }, [user]);

  const loadClientId = async () => {
    try {
      setIsLoadingClient(true);
      // Aqui você precisaria fazer uma chamada à API para buscar o clientId
      // Por enquanto, vamos usar um placeholder
      // TODO: Implementar endpoint GET /clients/by-user/:userId
      
      // Simulação temporária - em produção, fazer chamada real
      // const response = await clientService.getByUserId(user!.id);
      // setClientId(response.id);
      
      // Por enquanto, vamos assumir que o clientId é o mesmo que userId
      // (isso deve ser ajustado conforme sua estrutura de dados)
      setClientId(user!.id);
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Erro ao carregar dados do cliente');
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

  const validate = () => {
    const newErrors: typeof errors = {};

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

  if (isLoadingClient) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-gray-600">Carregando...</Text>
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
