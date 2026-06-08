import { useMemo, useState } from "react";
import { FlatList, Pressable, ScrollView, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../contexts/AuthContext";
import { ordersService } from "../../services/orders.service";
import { machinesService } from "../../services/machines.service";
import { AppButton, Card, EmptyState, MoneyText, StatusBadge } from "../../components/common";
import { colors, spacing } from "../../styles/theme";
import type { FilterStatus, RootStackParamList } from "../../routes/types";

type Props = NativeStackScreenProps<RootStackParamList, "Orders">;

const FILTERS: Array<{ key: FilterStatus; label: string }> = [
  { key: "ALL", label: "Todas" },
  { key: "ORCAMENTO", label: "Orçamento" },
  { key: "APROVADO", label: "Aprovado" },
  { key: "EM_EXECUCAO", label: "Em execução" },
  { key: "CONCLUIDO", label: "Concluído" },
];

export function MyOrdersScreen({ navigation }: Props) {
  const { clientId } = useAuth();
  const [filter, setFilter] = useState<FilterStatus>("ALL");
  const { data: orders = [] } = useQuery({
    queryKey: ["orders", clientId],
    queryFn: () => ordersService.list(clientId!),
    enabled: !!clientId,
  });
  const { data: machines = [] } = useQuery({ queryKey: ["machines"], queryFn: () => machinesService.list() });
  const machineMap = useMemo(() => new Map(machines.map((m) => [m.id, m])), [machines]);
  const filtered = filter === "ALL" ? orders : orders.filter((o) => o.status === filter);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, padding: spacing.lg }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing.md }}>
        {FILTERS.map((f) => (
          <View key={f.key} style={{ marginRight: spacing.sm }}>
            <AppButton title={f.label} variant={filter === f.key ? "primary" : "outline"} onPress={() => setFilter(f.key)} />
          </View>
        ))}
      </ScrollView>
      {filtered.length === 0 ? (
        <EmptyState title="Sem ordens" description="Nenhuma OS encontrada." />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(o) => o.id}
          renderItem={({ item }) => (
            <Pressable onPress={() => navigation.navigate("OrderDetail", { id: item.id })}>
              <Card>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                  <Text style={{ fontWeight: "700", color: colors.text }}>#{item.id}</Text>
                  <StatusBadge status={item.status} />
                </View>
                <Text style={{ color: colors.mutedText, fontSize: 12, marginTop: 4 }}>
                  {machineMap.get(item.machineId)?.name ?? "—"}
                </Text>
                <View style={{ marginTop: 8 }}><MoneyText value={item.totalCost} bold /></View>
              </Card>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}
