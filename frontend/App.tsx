import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/contexts/AuthContext';
import { ClientStack } from './src/routes/ClientStack';
import './global.css';

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <ClientStack />
        <StatusBar style="light" />
      </NavigationContainer>
    </AuthProvider>
  );
}
