import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, ActivityIndicator } from 'react-native';
import { Machine } from '../../types/domain';
import { machineService } from '../../services/machine.service';

interface MachineSelectorProps {
  value?: string;
  onChange: (machineId: string, machine: Machine) => void;
  error?: string;
}

export function MachineSelector({ value, onChange, error }: MachineSelectorProps) {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    loadMachines();
  }, []);

  useEffect(() => {
    // Atualiza máquina selecionada quando value muda
    if (value && machines.length > 0) {
      const machine = machines.find((m) => m._id === value);
      if (machine) {
        setSelectedMachine(machine);
      }
    }
  }, [value, machines]);

  const loadMachines = async () => {
    try {
      setIsLoading(true);
      setLoadError('');
      const data = await machineService.listActive();
      setMachines(data);
    } catch (err: any) {
      setLoadError(err.message || 'Erro ao carregar máquinas');
    } finally {
      setIsLoading(false);
    }
  };

 const handleSelect = (machine: Machine) => {
  setSelectedMachine(machine);
  onChange(machine._id, machine);
  setIsModalVisible(false);
};

  return (
    <View>
      <Text className="text-gray-700 font-medium mb-2 text-base">
        Máquina
      </Text>

      <TouchableOpacity
        onPress={() => setIsModalVisible(true)}
        className={`border rounded-lg px-4 py-3 ${
          error ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
        }`}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="#2563eb" />
        ) : selectedMachine ? (
          <View>
            <Text className="text-gray-900 text-base font-medium">
              {selectedMachine.name}
            </Text>
            {selectedMachine.brand && (
              <Text className="text-gray-600 text-sm">
                {selectedMachine.brand} {selectedMachine.model || ''}
              </Text>
            )}
          </View>
        ) : (
          <Text className="text-gray-400 text-base">
            Selecione uma máquina
          </Text>
        )}
      </TouchableOpacity>

      {error && (
        <Text className="text-red-600 text-sm mt-1">{error}</Text>
      )}

      {loadError && (
        <Text className="text-orange-600 text-sm mt-1">{loadError}</Text>
      )}

      {/* Modal de seleção */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl max-h-[80%]">
            <View className="p-4 border-b border-gray-200">
              <Text className="text-xl font-bold text-gray-900">
                Selecionar Máquina
              </Text>
            </View>

            <FlatList
              data={machines}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => handleSelect(item)}
                  className="p-4 border-b border-gray-100"
                >
                  <Text className="text-gray-900 font-semibold text-base">
                    {item.name}
                  </Text>
                  {item.brand && (
                    <Text className="text-gray-600 text-sm mt-1">
                      {item.brand} {item.model || ''}
                    </Text>
                  )}
                  {item.location && (
                    <Text className="text-gray-500 text-sm mt-1">
                      Local: {item.location}
                    </Text>
                  )}
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View className="p-8 items-center">
                  <Text className="text-gray-500">
                    Nenhuma máquina disponível
                  </Text>
                </View>
              }
            />

            <View className="p-4 border-t border-gray-200">
              <TouchableOpacity
                onPress={() => setIsModalVisible(false)}
                className="bg-gray-200 rounded-lg py-3 items-center"
              >
                <Text className="text-gray-700 font-semibold">Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
