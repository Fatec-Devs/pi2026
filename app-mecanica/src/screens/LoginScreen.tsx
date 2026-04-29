import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ImageBackground
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

// 🔌 NAVEGAÇÃO
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation";

type NavigationProps = NativeStackNavigationProp<
  RootStackParamList,
  "Login"
>;

export default function LoginScreen() {
  const [usuario, setUsuario] = useState<string>("");
  const [senha, setSenha] = useState<string>("");

  const navigation = useNavigation<NavigationProps>();

  const handleLogin = () => {
    // 👉 depois você conecta com backend aqui
    navigation.navigate("Menu");
  };

  return (
    <ImageBackground
      source={require("../../assets/bg.jpg")}
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        {/* ÍCONE */}
        <Ionicons name="build-outline" size={90} color="#fff" />

        {/* NOME */}
        <Text style={styles.title}>Mecânica</Text>
        <Text style={styles.title}>Scatamburlo</Text>

        {/* LOGIN */}
        <Text style={styles.login}>Login</Text>

        {/* USUÁRIO */}
        <View style={styles.inputContainer}>
          <Ionicons name="person-outline" size={22} color="#ddd" />
          <TextInput
            placeholder="Usuário"
            placeholderTextColor="#ddd"
            style={styles.input}
            value={usuario}
            onChangeText={setUsuario}
          />
        </View>

        {/* SENHA */}
        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={22} color="#ddd" />
          <TextInput
            placeholder="Senha"
            placeholderTextColor="#ddd"
            secureTextEntry
            style={styles.input}
            value={senha}
            onChangeText={setSenha}
          />
          <Ionicons name="eye-outline" size={22} color="#ddd" />
        </View>

        {/* BOTÃO */}
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Entrar</Text>
        </TouchableOpacity>

        {/* LINK */}
        <Text style={styles.link}>
          Esqueceu a senha?{" "}
          <Text style={styles.linkUnderline}>Clique aqui</Text>
        </Text>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },

  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 25
  },

  title: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "bold"
  },

  login: {
    color: "#fff",
    fontSize: 22,
    marginVertical: 25
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(90,45,10,0.75)",
    width: "100%",
    height: 55,
    borderRadius: 30,
    paddingHorizontal: 18,
    marginBottom: 15
  },

  input: {
    flex: 1,
    color: "#fff",
    marginLeft: 10,
    fontSize: 15
  },

  button: {
    backgroundColor: "rgba(90,45,10,0.9)",
    width: "100%",
    height: 55,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10
  },

  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold"
  },

  link: {
    color: "#fff",
    marginTop: 20,
    fontSize: 14
  },

  linkUnderline: {
    textDecorationLine: "underline",
    fontWeight: "bold"
  }
});