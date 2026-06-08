import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useQuery } from "@tanstack/react-query";
import { ordersService } from "../../services/orders.service";
import { machinesService } from "../../services/machines.service";
import { Card, MoneyText, StatusBadge, STATUS_LABEL } from "../../components/common";
import { colors, spacing } from "../../styles/theme";
import type { RootStackParamList } from "../../routes/types";
import type { ServiceOrderStatus } from "../../types";

type Props = NativeStackScreenProps<RootStackParamList, "OrderDetail">;
const STEPS: ServiceOrderStatus[] = ["ORCAMENTO", "APROVADO", "EM_EXECUCAO", "CONCLUIDO"];

export function OrderDetailScreen({ route }: Props) {
  const { id } = route.params;
  const { data: order, isLoading } = useQuery({ queryKey: ["order", id], queryFn: () => ordersService.get(id) });
  const { data: machine } = useQuery({
    queryKey: ["machine", order?.machineId],
    queryFn: () => machinesService.get(order!.machineId),
    enabled: !!order,
  });

  if (isLoading || !order) {
    return <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}><ActivityIndicator /></View>;
  }

  const currentIdx = STEPS.indexOf(order.status);
  const fmt = (iso?: string) => (iso ? new Date(iso).toLocaleDateString("pt-BR") : "—");

  return (
    <ScrollView contentContainerStyle={{ padding: spacing.lg, backgroundColor: colors.background }}>
      <Card>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <View>
            <Text style={{ color: colors.mutedText, fontSize: 12 }}>Máquina</Text>
            <Text style={{ fontWeight: "700", color: colors.text }}>{machine?.name ?? "—"}</Text>
            <Text style={{ color: colors.mutedText, fontSize: 12 }}>{machine?.brand} {machine?.model}</Text>
          </View>
          <StatusBadge status={order.status} />
        </View>
      </Card>

      <Card>
        <Text style={{ fontWeight: "700", color: colors.text, marginBottom: spacing.sm }}>Status</Text>
        {STEPS.map((s, i) => {
          const done = i < currentIdx, active = i === currentIdx;
          return (
            <View key={s} style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
              <View style={{
                width: 10, height: 10, borderRadius: 5, marginRight: 10,
                backgroundColor: done ? colors.status.CONCLUIDO : active ? colors.status.EM_EXECUCAO : colors.border,
              }} />
              <Text style={{ color: done || active ? colors.text : colors.mutedText, fontWeight: active ? "700" : "400" }}>
                {STATUS_LABEL[s]}
              </Text>
            </View>
          );
        })}
      </Card>

      <Card>
        <Text style={{ fontWeight: "700", color: colors.text, marginBottom: spacing.sm }}>Serviços</Text>
        {order.services.map((s, i) => (
          <View key={i} style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 6 }}>
            <View style={{ flex: 1, paddingRight: 8 }}>
              <Text style={{ color: colors.text }}>{s.description}</Text>
              <Text style={{ color: colors.mutedText, fontSize: 12 }}>{s.estimatedHours}h</Text>
            </View>
            <MoneyText value={s.price} />
          </View>
        ))}
      </Card>

      {order.materials.length > 0 && (
        <Card>
          <Text style={{ fontWeight: "700", color: colors.text, marginBottom: spacing.sm }}>Materiais</Text>
          {order.materials.map((m, i) => (
            <View key={i} style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 6 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.text }}>{m.name}</Text>
                <Text style={{ color: colors.mutedText, fontSize: 12 }}>Qtd: {m.quantity}</Text>
              </View>
              <MoneyText value={m.quantity * m.unitCost} />
            </View>
          ))}
        </Card>
      )}

      <Card>
        <Text style={{ fontWeight: "700", color: colors.text, marginBottom: spacing.sm }}>Custos</Text>
        <Row label="Mão de obra" value={order.laborCost} />
        <Row label="Peças" value={order.partsCost} />
        <View style={{ height: 1, backgroundColor: colors.border, marginVertical: 6 }} />
        <Row label="Total" value={order.totalCost} bold />
      </Card>

      <Card>
        <Text style={{ fontWeight: "700", color: colors.text, marginBottom: spacing.sm }}>Datas</Text>
        <DateRow label="Criada" value={fmt(order.createdAt)} />
        <DateRow label="Aprovada" value={fmt(order.approvedAt)} />
        <DateRow label="Iniciada" value={fmt(order.startedAt)} />
        <DateRow label="Concluída" value={fmt(order.finishedAt)} />
      </Card>

      {order.notes ? (
        <Card>
          <Text style={{ fontWeight: "700", color: colors.text, marginBottom: spacing.sm }}>Observações</Text>
          <Text style={{ color: colors.mutedText }}>{order.notes}</Text>
        </Card>
      ) : null}
    </ScrollView>
  );
}

function Row({ label, value, bold }: { label: string; value: number; bold?: boolean }) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 2 }}>
      <Text style={{ color: bold ? colors.text : colors.mutedText, fontWeight: bold ? "700" : "400" }}>{label}</Text>
      <MoneyText value={value} bold={bold} />
    </View>
  );
}

function DateRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 2 }}>
      <Text style={{ color: colors.mutedText }}>{label}</Text>
      <Text style={{ color: colors.text }}>{value}</Text>
    </View>
  );
}
