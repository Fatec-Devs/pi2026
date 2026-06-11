import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';

export default function AdminIndex() {
  const router = useRouter();

  const menuItems = [
    {
      id: 'clients',
      title: 'Clientes',
      description: 'Gerenciar clientes e cadastros',
      icon: '👥',
      route: '/admin/clients',
    },
    {
      id: 'machines',
      title: 'Máquinas',
      description: 'Gerenciar máquinas e equipamentos',
      icon: '⚙️',
      route: '/admin/machines',
    },
    {
      id: 'service-orders',
      title: 'Ordens de Serviço',
      description: 'Acompanhar e mudar status das OS',
      icon: '📋',
      route: '/admin/service-orders',
    },
    {
      id: 'finance',
      title: 'Financeiro',
      description: 'Consultar balanço e lançamentos',
      icon: '💰',
      route: '/admin/finance',
    },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>{'< Voltar'}</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Admin Dashboard</Text>
          <Text style={styles.subtitle}>Selecione uma opção para gerenciar</Text>
        </View>
      </View>

      {/* Menu Items */}
      <ScrollView style={styles.menuContainer} contentContainerStyle={styles.menuContent}>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.menuItem}
            onPress={() => router.push(item.route)}
            activeOpacity={0.7}
          >
            <View style={styles.menuItemIcon}>
              <Text style={styles.iconText}>{item.icon}</Text>
            </View>
            <View style={styles.menuItemContent}>
              <Text style={styles.menuItemTitle}>{item.title}</Text>
              <Text style={styles.menuItemDescription}>{item.description}</Text>
            </View>
            <Text style={styles.menuItemArrow}>›</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
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
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    marginRight: 12,
  },
  backButtonText: {
    color: '#3b82f6',
    fontSize: 14,
    fontWeight: '500',
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  menuContainer: {
    flex: 1,
  },
  menuContent: {
    padding: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 12,
  },
  menuItemIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconText: {
    fontSize: 24,
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  menuItemDescription: {
    fontSize: 13,
    color: '#666',
  },
  menuItemArrow: {
    fontSize: 28,
    color: '#9ca3af',
    fontWeight: '300',
  },
});
