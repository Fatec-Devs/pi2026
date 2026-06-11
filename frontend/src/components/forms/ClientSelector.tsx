import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import clientService from '../../services/clientService';
import { Client } from '../../types/domain';

interface ClientSelectorProps {
  value: string;
  onChange: (id: string, client: Client | null) => void;
  error?: string;
  label?: string;
}

export function ClientSelector({
  value,
  onChange,
  error,
  label = 'Cliente',
}: ClientSelectorProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      setIsLoading(true);
      const clients = await clientService.listAll();
      console.log('Clients loaded:', clients);
      setClients(clients);
    } catch (error: any) {
      console.error('Erro ao carregar clientes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedClient = clients.find((c) => c._id === value);

  return (
    <View className="mb-4">
      <Text className="text-gray-700 font-medium mb-2">{label}</Text>

      {/* Selected Client Display */}
      <TouchableOpacity
        onPress={() => setIsDropdownOpen(!isDropdownOpen)}
        className={`border-2 rounded-lg p-3 flex-row justify-between items-center ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
      >
        <View className="flex-1 flex-row justify-between items-center">
          <Text className={selectedClient ? 'text-gray-900' : 'text-gray-500'}>
            {selectedClient ? selectedClient.name || selectedClient.document || selectedClient._id : 'Selecione um cliente'}
          </Text>
          <Text className="text-gray-500 ml-2">{isDropdownOpen ? '▲' : '▼'}</Text>
        </View>
      </TouchableOpacity>

      {error && (
        <Text className="text-red-500 text-sm mt-1">{error}</Text>
      )}

      {/* Dropdown */}
      {isDropdownOpen && (
        <View className="border-2 border-gray-300 rounded-lg mt-1 max-h-48 overflow-y-auto bg-white z-50">
          {isLoading ? (
            <View className="p-4 items-center">
              <ActivityIndicator size="small" color="#2563eb" />
            </View>
          ) : clients.length === 0 ? (
            <View className="p-4">
              <Text className="text-gray-500 text-center">Nenhum cliente encontrado</Text>
            </View>
          ) : (
            clients.map((client) => (
              <TouchableOpacity
                key={client._id}
                onPress={() => {
                  console.log('Client selected:', client);
                  onChange(client._id, client);
                  setIsDropdownOpen(false);
                }}
                className={`p-4 border-b border-gray-200 active:bg-gray-100 ${
                  value === client._id ? 'bg-blue-50' : 'bg-white'
                }`}
              >
                <Text className="text-gray-900 font-medium text-base">
                  {client.name || 'Sem nome'}
                </Text>
                <Text className="text-gray-600 text-sm mt-1">
                  {client.document || 'Sem documento'}
                  {client.phone ? ` • ${client.phone}` : ''}
                </Text>
                {client.address && <Text className="text-gray-600 text-sm mt-1">{client.address}</Text>}
              </TouchableOpacity>
            ))
          )}
        </View>
      )}
    </View>
  );
}
