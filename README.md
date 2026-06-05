## Pi-app-2026 — Arquitetura Base 

## 1) Visão geral
Sistema mobile para gestão de oficina automotiva com:
- **Frontend:** React Native + Expo + TypeScript
- **Backend:** Node.js + Express + TypeScript + MongoDB/Mongoose
- **Auth:** JWT (access token)

Objetivo: arquitetura simples, profissional, escalável e rápida para equipe acadêmica.

---

## 2) Arquitetura proposta

### Estilo
- **Monorepo simples** com duas apps:
  - `frontend/`
  - `backend/`
- Backend em módulos por domínio (clientes, maquinas, ordens, estoque, financeiro, auth).
- Frontend organizado por telas + componentes reutilizáveis + serviços de API.

### Padrões de projeto
- Controller → Service → Repository (backend)
- DTOs + validação de entrada
- Regras de negócio centralizadas em Services
- Tipagem forte com TypeScript em todas as camadas

---

## 3) Estrutura de pastas

```txt
.
├── frontend/
│   ├── src/
│   │   ├── screens/
│   │   │   ├── auth/
│   │   │   ├── client/
│   │   │   └── admin/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   ├── forms/
│   │   │   └── cards/
│   │   ├── routes/
│   │   ├── contexts/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── types/
│   │   └── styles/
│   └── app.json
└── backend/
    ├── src/
    │   ├── modules/
    │   │   ├── auth/
    │   │   ├── clients/
    │   │   ├── machines/
    │   │   ├── service-orders/
    │   │   ├── inventory/
    │   │   └── finance/
    │   ├── controllers/
    │   ├── services/
    │   ├── repositories/
    │   ├── middlewares/
    │   ├── routes/
    │   ├── database/
    │   ├── config/
    │   ├── types/
    │   └── app.ts
    └── package.json
```

---

## 4) Domínio e Models (MongoDB/Mongoose)

### `User`
- `name`, `email`, `passwordHash`, `role` (`ADMIN | CLIENT`), `phone`, `active`

### `Client`
- `userId`, `document`, `address`, `notes`

### `Machine`
- `name`, `brand`, `model`, `serialNumber`, `location`, `status`, `active`

### `ServiceOrder`
- `clientId`, `machineId`, `status`, `services[]`, `materials[]`, `laborCost`, `partsCost`, `totalCost`, `approvedAt`, `startedAt`, `finishedAt`

### `InventoryItem`
- `name`, `sku`, `unit`, `quantity`, `minStock`, `unitCost`, `active`

### `FinancialEntry`
- `serviceOrderId`, `type` (`INCOME | EXPENSE`), `description`, `amount`, `date`, `category`

---

## 5) Types/Interfaces principais (TypeScript)

```ts
export type UserRole = 'ADMIN' | 'CLIENT';
export type ServiceOrderStatus = 'ORCAMENTO' | 'APROVADO' | 'EM_EXECUCAO' | 'CONCLUIDO';

export interface ServiceItemInput {
  description: string;
  estimatedHours: number;
  price: number;
}

export interface MaterialUsageInput {
  inventoryItemId: string;
  quantity: number;
  unitCost: number;
}

export interface CreateServiceOrderDTO {
  clientId: string;
  machineId: string;
  services: ServiceItemInput[];
  notes?: string;
}
```

---

## 6) Rotas REST (padrão profissional)

### Auth
- `POST /auth/login`
- `POST /auth/register-client`
- `GET /auth/me`

### Clientes
- `GET /clients`
- `GET /clients/:id`
- `POST /clients`
- `PUT /clients/:id`
- `DELETE /clients/:id`

### maquinas
- `GET /machines`
- `GET /machines/:id`
- `POST /machines`
- `PUT /machines/:id`
- `DELETE /machines/:id`

### Ordens de Serviço
- `GET /service-orders`
- `GET /service-orders/:id`
- `POST /service-orders`
- `PATCH /service-orders/:id/status`
- `PATCH /service-orders/:id/materials`
- `PATCH /service-orders/:id/costs`
- `GET /service-orders/client/:clientId/history`

### Estoque
- `GET /inventory`
- `POST /inventory`
- `PUT /inventory/:id`
- `PATCH /inventory/:id/adjust`

### Financeiro
- `GET /finance/summary`
- `GET /finance/entries`
- `POST /finance/entries`

---

## 7) Responsabilidades por camada (backend)

- **Routes:** mapeamento endpoint → controller
- **Controllers:** parse da request/response + status code
- **Services:** regras de negócio (transições de status, estoque, custo)
- **Repositories:** persistência MongoDB
- **Middlewares:** auth JWT, autorização por perfil, tratamento de erro

---

## 8) Regras de negócio críticas

1. Toda OS deve estar vinculada a cliente e maquinas.
2. Toda OS deve possuir ao menos um serviço.
3. Estoque atualizado automaticamente no registro de materiais.
4. Bloquear material sem estoque suficiente.
5. OS só pode ser `CONCLUIDO` se `laborCost`/`partsCost`/`totalCost` estiverem registrados e não-negativos (`laborCost >= 0`, `partsCost >= 0`, `totalCost >= 0`; OS de garantia pode ter custo zero).
6. Fluxo obrigatório de status:
   - `ORCAMENTO` → `APROVADO` → `EM_EXECUCAO` → `CONCLUIDO`
7. Estratégia de registro de materiais + baixa de estoque (definida nos Dias 1-2):
   - **A (preferencial):** transação atômica com MongoDB replica set.
   - **B (MVP):** compensação manual (reverter material da OS se falhar baixa de estoque), com migração planejada para transaction.
   - Escolha rápida: usar **A** se a equipe já dominar replica set no início; usar **B** para acelerar entrega do MVP com menor risco operacional.
   - Em falha de baixa no cenário **B**: não confirmar consumo de material, registrar evento de erro na OS (ex.: `pending_stock_adjustment`) e enviar para fila de reconciliação com ação do admin (retry/reversão).

---

## 9) Fluxo de autenticação

1. Login (`email/senha`) em `/auth/login`.
2. Backend retorna `accessToken` + dados do usuário.
3. Frontend salva token em storage seguro.
4. `AuthContext` injeta token no Axios interceptor.
5. Rotas e telas protegidas por perfil (`ADMIN`/`CLIENT`).

---

## 10) Fluxo de telas

### Cliente
- Login
- Home Cliente (resumo)
- Solicitar Serviço
- Minhas OS (lista)
- Detalhe da OS (status timeline)
- Histórico

### Admin
- Login
- Dashboard Admin
- Clientes (CRUD)
- maquinas (CRUD)
- Ordens de Serviço (criar/editar/status)
- Estoque
- Financeiro (resumo + lançamentos)

---

## 11) Componentes reutilizáveis (frontend)

- `AppButton`
- `AppInput`
- `AppSelect`
- `StatusBadge`
- `ServiceOrderCard`
- `EmptyState`
- `LoadingOverlay`
- `ConfirmDialog`
- `MoneyText`

---

## 12) Boas práticas e padronização

- ESLint + Prettier + EditorConfig
- Commits curtos e semânticos (`feat`, `fix`, `refactor`, `docs`, `chore`, `test`, `style`)
- DTOs para entrada e saída
- Nunca acessar Mongo direto no Controller
- Hash de senha com `bcrypt` usando `BCRYPT_SALT_ROUNDS` (default recomendado: 12; usar 10 no MVP apenas se houver limitação de desempenho)
- Definir `BCRYPT_SALT_ROUNDS` em `.env` e mapear no `config/auth.ts`
- Aplicar hash no **Auth Service** (não em controller/repository)
- Nunca armazenar senha em texto puro
- Evitar `saltRounds` acima de 12 sem teste de carga
- Erros padronizados (`code`, `message`, `details`)
- Nomes consistentes:
  - `camelCase` (variáveis/funções)
  - `PascalCase` (componentes/classes/types)

---

## 13) UI/UX 

- Design limpo com cards, listas e filtros simples
- Cores de status:
  - Orçamento: cinza
  - Aprovado: azul
  - Em execução: laranja
  - Concluído: verde
- Timeline visual no detalhe da OS
- Indicador de estoque mínimo (badge vermelho)

---

## 14) MongoDB Atlas

- Use `MONGO_URI` com a string `mongodb+srv://` do Atlas no backend.
- O banco sugerido para o projeto e `pi-app-2026`.
- Colecoes principais geradas na camada de models:
  - `users`
  - `clients`
  - `machines`
  - `serviceorders`
  - `inventoryitems`
  - `financialentries`
- O backend já possui o arquivo de exemplo em `backend/.env.example` com a URI pronta para substituir pelos dados do cluster.

---
