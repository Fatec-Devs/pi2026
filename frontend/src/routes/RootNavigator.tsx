import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth } from "../contexts/AuthContext";
import { ActivityIndicator, View } from "react-native";
import { LoginScreen } from "../screens/auth/LoginScreen";
import { RegisterScreen } from "../screens/auth/RegisterScreen";
import { HomeScreen } from "../screens/client/HomeScreen";
import { RequestServiceScreen } from "../screens/client/RequestServiceScreen";
import { MyOrdersScreen } from "../screens/client/MyOrdersScreen";
import { OrderDetailScreen } from "../screens/client/OrderDetailScreen";
import { HistoryScreen } from "../screens/client/HistoryScreen";
import type { RootStackParamList } from "./types";

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <Stack.Navigator>
      {user ? (
        <>
          <Stack.Screen name="Home" component={HomeScreen} options={{ title: "Início" }} />
          <Stack.Screen name="Request" component={RequestServiceScreen} options={{ title: "Solicitar serviço" }} />
          <Stack.Screen name="Orders" component={MyOrdersScreen} options={{ title: "Minhas OS" }} />
          <Stack.Screen name="OrderDetail" component={OrderDetailScreen} options={{ title: "Detalhe da OS" }} />
          <Stack.Screen name="History" component={HistoryScreen} options={{ title: "Histórico" }} />
        </>
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Register" component={RegisterScreen} options={{ title: "Cadastro" }} />
        </>
      )}
    </Stack.Navigator>
  );
}
