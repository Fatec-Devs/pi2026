import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ImageBackground
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function MenuScreen() {
  const buttons = [
    "Cadastrar Novo Serviço",
    "Cadastrar Materiais",
    "Serviços Ativos",
    "Cadastrar Clientes",
    "Serviços Finalizados",
    "Clientes Cadastrados",
    "Verificar Estoque",
    "Finanças"
  ];

  return (
    <ImageBackground
      source={require("../../assets/bg.jpg")}
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        {/* ÍCONE */}
        <Ionicons name="home-outline" size={90} color="#fff" />

        {/* TÍTULO */}
        <Text style={styles.title}>Menu Inicial</Text>

        {/* BOTÕES */}
        <View style={styles.grid}>
          {buttons.map((item, index) => (
            <TouchableOpacity key={index} style={styles.button}>
              <Text style={styles.buttonText}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>
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
    paddingTop: 80,
    paddingHorizontal: 20
  },

  title: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "bold",
    marginVertical: 20
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    width: "100%"
  },

  button: {
    backgroundColor: "rgba(90,45,10,0.8)",
    width: "48%",
    height: 55,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
    paddingHorizontal: 10
  },

  buttonText: {
    color: "#fff",
    fontSize: 13,
    textAlign: "center",
    fontWeight: "500"
  }
});