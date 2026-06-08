import { useState } from "react";
import { Alert, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useAuth } from "../../contexts/AuthContext";
import { machinesService } from "../../services/machines.service";
import { ordersService } from "../../services/orders.service";
import { AppButton, AppInput, Card, MoneyText } from "../../components/common";
import { colors, radius, spacing } from "../../styles/theme";
import type { RootStackParamList } from "../../routes/types";
import type { ServiceItemInput } from "../../types";

type Props = NativeStackScreenProps<RootStackParamList, "Request">;

export function RequestServiceScreen({ navigation }: Props) {
  const { clientId } = useAuth();
  const queryClient = useQueryClient();
  const [machineId, setMachineId] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [services, setServices] = useState<ServiceItemInput[]>([{ description: "", estimatedHours: 1, price: 0 }]);

  const { data: machines = [] } = useQuery({ queryKey: ["machines"], queryFn: () => machinesService.list() });
  const total = services.reduce((s, x) => s + (Number(x.price) || 0), 0);

  const create = useMutation({
    mutationFn: () =>
      ordersService.create({
        clientId: clientId!,
        machineId,
        services: services.map((s) => ({ ...s, estimatedHours: Number(s.estimatedHours) || 0, price: Number(s.price) || 0 })),
        notes: notes.trim() || undefined,
      }),
    onSuccess: (order) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      navigation.replace("OrderDetail", { id: order.id });
    },
    onError: (e: any) => Alert.alert("Erro", e.message ?? "Falha"),
  });

  const update = (i: number, patch: Partial<ServiceItemInput>) =>
    setServices((prev) => prev.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));

  return (
    <ScrollView contentContainerStyle={{ padding: spacing.lg, backgroundColor: colors.background }}>
      <Card>
        <Text style={{ color: colors.mutedText, fontSize: 12, marginBottom: spacing.sm }}>Máquina</Text>
        {machines.map((m) => (
          <Pressable
            key={m.id}
            onPress={() => setMachineId(m.id)}
            style={{
              padding: 12, borderRadius: radius.sm, marginBottom: 6,
              borderWidth: 1, borderColor: machineId === m.id ? colors.primary : colors.border,
              backgroundColor: machineId === m.id ? colors.muted : "transparent",
            }}
          >
            <Text style={{ color: colors.text, fontWeight: "600" }}>{m.name}</Text>
            <Text style={{ color: colors.mutedText, fontSize: 12 }}>{m.brand} {m.model}</Text>
          </Pressable>
        ))}
      </Card>

      <Card>
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: spacing.sm }}>
          <Text style={{ fontWeight: "700", color: colors.text }}>Serviços</Text>
          <Pressable onPress={() => setServices([...services, { description: "", estimatedHours: 1, price: 0 }])}>
            <Text style={{ color: colors.primary, fontWeight: "600" }}>+ Adicionar</Text>
          </Pressable>
        </View>
        {services.map((s, i) => (
          <View key={i} style={{ borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, padding: spacing.md, marginBottom: spacing.sm }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
              <Text style={{ color: colors.mutedText, fontSize: 12 }}>Serviço {i + 1}</Text>
              {services.length > 1 && (
                <Pressable onPress={() => setServices(services.filter((_, idx) => idx !== i))}>
                  <Text style={{ color: colors.danger, fontSize: 12 }}>Remover</Text>
                </Pressable>
              )}
            </View>
            <AppInput placeholder="Descrição" value={s.description} onChangeText={(v) => update(i, { description: v })} />
            <View style={{ flexDirection: "row", gap: spacing.sm }}>
              <View style={{ flex: 1 }}>
                <AppInput
                  label="Horas" keyboardType="numeric"
                  value={String(s.estimatedHours)}
                  onChangeText={(v) => update(i, { estimatedHours: Number(v) || 0 })}
                />
              </View>
              <View style={{ flex: 1 }}>
                <AppInput
                  label="Preço (R$)" keyboardType="numeric"
                  value={String(s.price)}
                  onChangeText={(v) => update(i, { price: Number(v) || 0 })}
                />
              </View>
            </View>
          </View>
        ))}
      </Card>

      <Card>
        <Text style={{ color: colors.mutedText, fontSize: 12, marginBottom: 6 }}>Observações</Text>
        <TextInput
          multiline numberOfLines={3}
          value={notes} onChangeText={setNotes}
          placeholder="Descreva o problema..."
          placeholderTextColor={colors.mutedText}
          style={{
            borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm,
            padding: 10, color: colors.text, minHeight: 80, textAlignVertical: "top",
          }}
        />
      </Card>

      <Card>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Text style={{ color: colors.mutedText }}>Estimado</Text>
          <MoneyText value={total} bold />
        </View>
      </Card>

      <AppButton
        title="Enviar solicitação"
        loading={create.isPending}
        onPress={() => {
          if (!machineId) return Alert.alert("Atenção", "Selecione uma máquina");
          if (services.some((s) => !s.description.trim())) return Alert.alert("Atenção", "Preencha todas as descrições");
          create.mutate();
        }}
      />
    </ScrollView>
  );
}
