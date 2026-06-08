## Como rodar

```bash
cd mobile
npm install
npx expo start
```
## Credenciais de teste (mock)

- E-mail: `cliente@demo.com`
- Senha: `123456`

## Estrutura

```
src/
  screens/auth/     LoginScreen, RegisterScreen
  screens/client/   HomeScreen, RequestServiceScreen,
                    MyOrdersScreen, OrderDetailScreen, HistoryScreen
  components/       AppButton, AppInput, StatusBadge, ...
  routes/           AppNavigator (Auth + Client stacks)
  contexts/         AuthContext (JWT via expo-secure-store)
  services/         api.ts + mocks (USE_MOCK = true)
  types/            DTOs + interfaces TypeScript
  styles/           theme.ts (cores, espaçamentos)
```

## Backend real
Quando o backend estiver pronto, tem que editar `src/services/api.ts`:

```ts
export const USE_MOCK = false;
export const API_BASE_URL = "https://seu-backend";
```
