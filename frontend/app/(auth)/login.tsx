import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import { TextInput } from '../../src/components/common/TextInput';
import { Button } from '../../src/components/common/Button';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const { login, isLoading } = useAuth();
  const router = useRouter();

  const validate = () => {
    const newErrors: typeof errors = {};

    if (!email) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      newErrors.email = 'Email inválido';
    }

    if (!password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (password.length < 6) {
      newErrors.password = 'Senha deve ter no mínimo 6 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) {
      return;
    }

    try {
      await login(email, password);
      router.replace('/(app)/(tabs)');
    } catch (error: any) {
      Alert.alert(
        'Erro no Login',
        error.message || 'Email ou senha inválidos'
      );
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1"
    >
      <ScrollView
        className="flex-1 bg-white"
        contentContainerClassName="flex-grow justify-center"
      >
        <View className="p-6">
          {/* Logo/Título */}
          <View className="items-center mb-8">
            <Text className="text-4xl mb-2">🔧</Text>
            <Text className="text-3xl font-bold text-gray-900 mb-2">
              Pi App 2026
            </Text>
            <Text className="text-gray-600">
              Sistema de Gestão de Oficina
            </Text>
          </View>

          {/* Formulário */}
          <View className="mb-6">
            <TextInput
              label="Email"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (errors.email) {
                  setErrors((prev) => ({ ...prev, email: undefined }));
                }
              }}
              placeholder="seu@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email}
              containerClassName="mb-4"
            />

            <TextInput
              label="Senha"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (errors.password) {
                  setErrors((prev) => ({ ...prev, password: undefined }));
                }
              }}
              placeholder="Sua senha"
              secureTextEntry
              error={errors.password}
              containerClassName="mb-6"
            />

            <Button
              title="Entrar"
              onPress={handleLogin}
              loading={isLoading}
              disabled={isLoading}
              size="large"
            />
          </View>

          {/* Info de desenvolvimento */}
          <View className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <Text className="text-gray-700 text-sm text-center">
              💡 Para teste, use credenciais de desenvolvimento
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
