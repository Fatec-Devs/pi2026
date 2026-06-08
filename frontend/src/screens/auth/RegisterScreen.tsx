import { useState } from "react";
import { Alert, ScrollView } from "react-native";
import { useAuth } from "../../contexts/AuthContext";
import { AppButton, AppInput } from "../../components/common";
import { colors, spacing } from "../../styles/theme";

export function RegisterScreen() {
  const { signUp } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", phone: "", document: "", address: "", password: "" });
  const [loading, setLoading] = useState(false);
  const set = (k: keyof typeof form) => (v: string) => setForm({ ...form, [k]: v });

  const handleSubmit = async () => {
    setLoading(true);
    try { await signUp(form); }
    catch (e: any) { Alert.alert("Erro", e.message ?? "Falha no cadastro"); }
    finally { setLoading(false); }
  };

  return (
    <ScrollView contentContainerStyle={{ padding: spacing.lg, backgroundColor: colors.background }}>
      <AppInput label="Nome completo" value={form.name} onChangeText={set("name")} />
      <AppInput label="E-mail" autoCapitalize="none" keyboardType="email-address" value={form.email} onChangeText={set("email")} />
      <AppInput label="Telefone" keyboardType="phone-pad" value={form.phone} onChangeText={set("phone")} />
      <AppInput label="CPF/CNPJ" value={form.document} onChangeText={set("document")} />
      <AppInput label="Endereço" value={form.address} onChangeText={set("address")} />
      <AppInput label="Senha" secureTextEntry value={form.password} onChangeText={set("password")} />
      <AppButton title="Cadastrar" onPress={handleSubmit} loading={loading} />
    </ScrollView>
  );
}
