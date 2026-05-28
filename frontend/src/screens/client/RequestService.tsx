import React, { useState } from 'react';
import { View, Text, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ClientStackParamList } from '../../routes/ClientStack';
import { useMockData } from '../../hooks/useMockData';
import { AppInput, AppSelect, AppButton, SelectOption } from '../../components/common';

type Props = NativeStackScreenProps<ClientStackParamList, 'RequestService'>;

export default function RequestService({ navigation }: Props) {
  const { machines, loading } = useMockData();
  
  const [selectedMachine, setSelectedMachine] = useState<string>('');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<{ machine?: string; description?: string }>({});
  const [submitting, setSubmitting] = useState(false);

  // Convert machines to select options
  const machineOptions: SelectOption[] = machines
    .filter(m => m.active)
    .map(m => ({
      label: `${m.name} - ${m.brand || ''} ${m.model || ''}`.trim(),
      value: m.id,
    }));

  const validateForm = (): boolean => {
    const newErrors: { machine?: string; description?: string } = {};

    if (!selectedMachine) {
      newErrors.machine = 'Por favor, selecione uma máquina';
    }

    if (!description.trim()) {
      newErrors.description = 'Por favor, descreva o problema';
    } else if (description.trim().length < 10) {
      newErrors.description = 'A descrição deve ter pelo menos 10 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    setSubmitting(false);

    // Show success message
    Alert.alert(
      'Solicitação Enviada!',
      'Sua solicitação de serviço foi enviada com sucesso. Entraremos em contato em breve.',
      [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  const handleCancel = () => {
    if (selectedMachine || description || notes) {
      Alert.alert(
        'Cancelar Solicitação',
        'Deseja realmente cancelar? Os dados preenchidos serão perdidos.',
        [
          { text: 'Não', style: 'cancel' },
          { text: 'Sim', onPress: () => navigation.goBack() },
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-gray-50"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView className="flex-1">
        <View className="p-4">
          {/* Info Card */}
          <View className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <Text className="text-blue-900 font-semibold text-base mb-2">
              📋 Nova Solicitação de Serviço
            </Text>
            <Text className="text-blue-700 text-sm leading-5">
              Preencha os dados abaixo para solicitar um novo serviço para sua máquina.
              Entraremos em contato para confirmar o orçamento.
            </Text>
          </View>

          {/* Form */}
          <View className="bg-white rounded-lg p-4 shadow-sm">
            <Text className="text-gray-900 font-semibold text-lg mb-4">
              Informações do Serviço
            </Text>

            <AppSelect
              label="Máquina *"
              placeholder="Selecione a máquina"
              options={machineOptions}
              value={selectedMachine}
              onChange={setSelectedMachine}
              error={errors.machine}
              disabled={loading}
            />

            <AppInput
              label="Descrição do Problema *"
              placeholder="Descreva o problema ou serviço necessário"
              value={description}
              onChangeText={(text) => {
                setDescription(text);
                if (errors.description) {
                  setErrors({ ...errors, description: undefined });
                }
              }}
              error={errors.description}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <AppInput
              label="Observações Adicionais (Opcional)"
              placeholder="Informações complementares que possam ajudar no diagnóstico"
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              helperText="Ex: horário preferido, histórico de problemas anteriores, etc."
            />

            <Text className="text-gray-500 text-xs mb-4">
              * Campos obrigatórios
            </Text>

            {/* Action Buttons */}
            <View className="space-y-3">
              <AppButton
                title={submitting ? 'Enviando...' : 'Enviar Solicitação'}
                onPress={handleSubmit}
                variant="primary"
                loading={submitting}
                disabled={loading || submitting}
              />

              <AppButton
                title="Cancelar"
                onPress={handleCancel}
                variant="outline"
                disabled={submitting}
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
