import { ApiException, sleep, USE_MOCK, api } from "./api";
import { mockUser } from "./mocks/data";
import type { AuthResponse, RegisterClientDTO, User } from "../types";

export const authService = {
  async login(email: string, password: string): Promise<AuthResponse> {
    if (USE_MOCK) {
      await sleep(400);
      if (email.trim().toLowerCase() !== mockUser.email || password !== "123456") {
        throw new ApiException("INVALID_CREDENTIALS", "Email ou senha inválidos.");
      }
      return { accessToken: "mock.jwt.token", user: mockUser };
    }
    const res = await api.post<AuthResponse>("/auth/login", { email, password });
    return res.data;
  },

  async registerClient(dto: RegisterClientDTO): Promise<AuthResponse> {
    if (USE_MOCK) {
      await sleep(500);
      const user: User = {
        id: "u-" + Math.random().toString(36).slice(2, 8),
        name: dto.name, email: dto.email, role: "CLIENT", phone: dto.phone, active: true,
      };
      return { accessToken: "mock.jwt.token", user };
    }
    const res = await api.post<AuthResponse>("/auth/register-client", dto);
    return res.data;
  },

  async me(): Promise<User> {
    if (USE_MOCK) { await sleep(200); return mockUser; }
    const res = await api.get<User>("/auth/me");
    return res.data;
  },
};
