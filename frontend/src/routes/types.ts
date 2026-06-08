import type { ServiceOrderStatus } from "../types";

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Home: undefined;
  Request: undefined;
  Orders: undefined;
  OrderDetail: { id: string };
  History: undefined;
};

export type FilterStatus = ServiceOrderStatus | "ALL";
