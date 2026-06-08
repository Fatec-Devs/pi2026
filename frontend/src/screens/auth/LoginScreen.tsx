import { useState } from "react";
import { Alert, ScrollView, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useAuth } from "../../contexts/AuthContext";
import { AppButton, AppInput } from "../../components/common";
import { colors, spacing } from "../../styles/theme";
import type { RootStackParamList } from "../../routes/types";

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

export function LoginScreen({ navigation }: Props) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("cliente@demo.com");
  const [password, setPassword] = useState("123456");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try { await signIn(email, password); }
    catch (e: any) { Alert.alert("Erro", e.message ?? "Falha no login"); }
    finally { setLoading(false); }
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1, padding: spacing.lg, backgroundColor: colors.background, justifyContent: "center" }}>
      <Text style={{ fontSize: 24, fontWeight: "700", color: colors.text, marginBottom: 4 }}>Bem-vindo</Text>
      <Text style={{ color: colors.mutedText, marginBottom: spacing.lg }}>Acesse sua conta de cliente</Text>
      <AppInput label="E-mail" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
      <AppInput label="Senha" secureTextEntry value={password} onChangeText={setPassword} />
      <AppButton title="Entrar" onPress={handleSubmit} loading={loading} />
      <View style={{ marginTop: spacing.md }}>
        <AppButton title="Criar conta" variant="outline" onPress={() => navigation.navigate("Register")} />
      </View>
      <Text style={{ marginTop: spacing.xl, color: colors.mutedText, fontSize: 12, textAlign: "center" }}>
        Demo: cliente@demo.com / 123456
      </Text>
    </ScrollView>
  );
}
