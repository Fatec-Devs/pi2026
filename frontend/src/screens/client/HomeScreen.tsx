import { useQuery } from "@tanstack/react-query";
import { Pressable, ScrollView, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useAuth } from "../../contexts/AuthContext";
import { ordersService } from "../../services/orders.service";
import { AppButton, Card, MoneyText, STATUS_LABEL, StatusBadge } from "../../components/common";
import { colors, spacing } from "../../styles/theme";
import type { RootStackParamList } from "../../routes/types";

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

export function HomeScreen({ navigation }: Props) {
  const { user, clientId, signOut } = useAuth();
  const { data: orders = [] } = useQuery({
    queryKey: ["orders", clientId],
    queryFn: () => ordersService.list(clientId!),
    enabled: !!clientId,
  });
  const open = orders.filter((o) => o.status !== "CONCLUIDO");
  const last = orders[0];

  return (
    <ScrollView contentContainerStyle={{ padding: spacing.lg, backgroundColor: colors.background, flexGrow: 1 }}>
      <Text style={{ color: colors.mutedText, fontSize: 12 }}>Olá,</Text>
      <Text style={{ fontSize: 20, fontWeight: "700", color: colors.text, marginBottom: spacing.lg }}>
        {user?.name}
      </Text>

      <View style={{ flexDirection: "row", gap: spacing.md, marginBottom: spacing.md }}>
        <View style={{ flex: 1 }}>
          <Card>
            <Text style={{ fontSize: 12, color: colors.mutedText }}>OS em aberto</Text>
            <Text style={{ fontSize: 24, fontWeight: "700", color: colors.text }}>{open.length}</Text>
          </Card>
        </View>
        <View style={{ flex: 1 }}>
          <Card>
            <Text style={{ fontSize: 12, color: colors.mutedText }}>Total</Text>
            <Text style={{ fontSize: 24, fontWeight: "700", color: colors.text }}>{orders.length}</Text>
          </Card>
        </View>
      </View>

      <AppButton title="Solicitar serviço" onPress={() => navigation.navigate("Request")} />
      <View style={{ height: spacing.sm }} />
      <AppButton title="Minhas OS" variant="outline" onPress={() => navigation.navigate("Orders")} />
      <View style={{ height: spacing.sm }} />
      <AppButton title="Histórico" variant="outline" onPress={() => navigation.navigate("History")} />

      <Text style={{ marginTop: spacing.xl, marginBottom: spacing.sm, fontWeight: "600", color: colors.text }}>
        Última OS
      </Text>
      {last ? (
        <Pressable onPress={() => navigation.navigate("OrderDetail", { id: last.id })}>
          <Card>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Text style={{ fontWeight: "600", color: colors.text }}>#{last.id}</Text>
              <StatusBadge status={last.status} />
            </View>
            <Text style={{ color: colors.mutedText, fontSize: 12, marginTop: 4 }}>
              {STATUS_LABEL[last.status]}
            </Text>
            <View style={{ marginTop: 8 }}><MoneyText value={last.totalCost} bold /></View>
          </Card>
        </Pressable>
      ) : (
        <Text style={{ color: colors.mutedText }}>Nenhuma OS encontrada.</Text>
      )}

      <View style={{ marginTop: spacing.xl }}>
        <AppButton title="Sair" variant="outline" onPress={signOut} />
      </View>
    </ScrollView>
  );
}
