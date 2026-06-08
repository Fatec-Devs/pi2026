import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View, type TextInputProps } from "react-native";
import type { ReactNode } from "react";
import { colors, radius, spacing } from "../styles/theme";
import type { ServiceOrderStatus } from "../types";

export const STATUS_LABEL: Record<ServiceOrderStatus, string> = {
  ORCAMENTO: "Orçamento",
  APROVADO: "Aprovado",
  EM_EXECUCAO: "Em execução",
  CONCLUIDO: "Concluído",
};

export function AppButton({
  title, onPress, variant = "primary", disabled, loading,
}: { title: string; onPress: () => void; variant?: "primary" | "outline"; disabled?: boolean; loading?: boolean }) {
  const isOutline = variant === "outline";
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        isOutline ? styles.buttonOutline : styles.buttonPrimary,
        (disabled || loading) && { opacity: 0.6 },
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isOutline ? colors.text : colors.primaryText} />
      ) : (
        <Text style={[styles.buttonText, isOutline && { color: colors.text }]}>{title}</Text>
      )}
    </Pressable>
  );
}

export function AppInput({ label, ...rest }: { label?: string } & TextInputProps) {
  return (
    <View style={{ marginBottom: spacing.md }}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput style={styles.input} placeholderTextColor={colors.mutedText} {...rest} />
    </View>
  );
}

export function StatusBadge({ status }: { status: ServiceOrderStatus }) {
  return (
    <View style={[styles.badge, { backgroundColor: colors.status[status] }]}>
      <Text style={styles.badgeText}>{STATUS_LABEL[status]}</Text>
    </View>
  );
}

export function MoneyText({ value, bold }: { value: number; bold?: boolean }) {
  return (
    <Text style={{ fontWeight: bold ? "700" : "500", color: colors.text }}>
      {value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
    </Text>
  );
}

export function Card({ children }: { children: ReactNode }) {
  return <View style={styles.card}>{children}</View>;
}

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <View style={styles.empty}>
      <Text style={{ fontWeight: "600", color: colors.text }}>{title}</Text>
      {description ? <Text style={{ color: colors.mutedText, marginTop: 4, fontSize: 12 }}>{description}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  button: { paddingVertical: 14, borderRadius: radius.md, alignItems: "center", justifyContent: "center" },
  buttonPrimary: { backgroundColor: colors.primary },
  buttonOutline: { backgroundColor: "transparent", borderWidth: 1, borderColor: colors.border },
  buttonText: { color: colors.primaryText, fontWeight: "600" },
  label: { fontSize: 12, color: colors.mutedText, marginBottom: 6 },
  input: {
    borderWidth: 1, borderColor: colors.border, borderRadius: radius.md,
    paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: colors.text, backgroundColor: colors.background,
  },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, alignSelf: "flex-start" },
  badgeText: { color: "#fff", fontSize: 11, fontWeight: "600" },
  card: {
    backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.lg,
    borderWidth: 1, borderColor: colors.border, marginBottom: spacing.md,
  },
  empty: {
    padding: spacing.xl, borderRadius: radius.md, borderWidth: 1, borderStyle: "dashed",
    borderColor: colors.border, alignItems: "center",
  },
});
