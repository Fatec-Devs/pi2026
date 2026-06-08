import { useMemo } from "react";
import { Pressable, SectionList, Text, View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useAuth } from "../../contexts/AuthContext";
import { ordersService } from "../../services/orders.service";
import { machinesService } from "../../services/machines.service";
import { Card, EmptyState, MoneyText, StatusBadge } from "../../components/common";
import { colors, spacing } from "../../styles/theme";
import type { RootStackParamList } from "../../routes/types";
import type { ServiceOrder } from "../../types";

type Props = NativeStackScreenProps<RootStackParamList, "History">;

export function HistoryScreen({ navigation }: Props) {
  const { clientId } = useAuth();
  const { data: orders = [] } = useQuery({
    queryKey: ["history", clientId],
    queryFn: () => ordersService.historyByClient(clientId!),
    enabled: !!clientId,
  });
  const { data: machines = [] } = useQuery({ queryKey: ["machines"], queryFn: () => machinesService.list() });
  const machineMap = useMemo(() => new Map(machines.map((m) => [m.id, m])), [machines]);
  const sections = useMemo(() => groupByMonth(orders), [orders]);

  if (!orders.length) {
    return (
      <View style={{ flex: 1, padding: spacing.lg, backgroundColor: colors.background }}>
        <EmptyState title="Sem histórico" description="Você ainda não tem OS concluídas." />
      </View>
    );
  }

  return (
    <SectionList
      sections={sections}
      keyExtractor={(o) => o.id}
      contentContainerStyle={{ padding: spacing.lg, backgroundColor: colors.background }}
      renderSectionHeader={({ section: { title } }) => (
        <Text style={{ fontSize: 12, fontWeight: "700", color: colors.mutedText, marginBottom: 8, marginTop: 12, textTransform: "uppercase" }}>
          {title}
        </Text>
      )}
      renderItem={({ item }) => (
        <Pressable onPress={() => navigation.navigate("OrderDetail", { id: item.id })}>
          <Card>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
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
  );
}

function groupByMonth(orders: ServiceOrder[]): Array<{ title: string; data: ServiceOrder[] }> {
  const map = new Map<string, ServiceOrder[]>();
  for (const o of orders) {
    const d = new Date(o.finishedAt ?? o.createdAt);
    const raw = d.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
    const key = raw.charAt(0).toUpperCase() + raw.slice(1);
    const arr = map.get(key) ?? [];
    arr.push(o);
    map.set(key, arr);
  }
  return Array.from(map.entries()).map(([title, data]) => ({ title, data }));
}
