import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement } from "react";
import {
  useUsersList,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
  useUsers,
  userQueryKeys,
} from "./use-users";
import type { User, CreateUserDto, UpdateUserDto } from "@/types/user";

vi.mock("@/config/api", () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

import { api } from "@/config/api";
import { toast } from "sonner";

const mockUsers: User[] = [
  {
    _id: "user-1",
    name: "John Doe",
    email: "john@example.com",
    roles: ["user"],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    _id: "user-2",
    name: "Jane Smith",
    email: "jane@example.com",
    roles: ["admin"],
    createdAt: "2024-01-02T00:00:00Z",
    updatedAt: "2024-01-02T00:00:00Z",
  },
];

const mockListResponse = {
  data: mockUsers,
  total: 2,
  page: 1,
  limit: 10,
  totalPages: 1,
};

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
}

describe("userQueryKeys", () => {
  it("should return correct all key", () => {
    expect(userQueryKeys.all).toEqual(["users"]);
  });

  it("should return correct list key with page and limit", () => {
    expect(userQueryKeys.list(1, 10)).toEqual(["users", "list", 1, 10]);
    expect(userQueryKeys.list(2, 20)).toEqual(["users", "list", 2, 20]);
  });

  it("should return correct detail key with id", () => {
    expect(userQueryKeys.detail("user-1")).toEqual(["users", "user-1"]);
  });
});

describe("useUsersList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch users list", async () => {
    vi.mocked(api.get).mockResolvedValue({ data: mockListResponse });

    const { result } = renderHook(() => useUsersList(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(api.get).toHaveBeenCalledWith("/users", {
      params: { page: 1, limit: 10 },
    });
    expect(result.current.users).toEqual(mockUsers);
    expect(result.current.total).toBe(2);
    expect(result.current.totalPages).toBe(1);
  });

  it("should use custom page and limit", async () => {
    vi.mocked(api.get).mockResolvedValue({ data: mockListResponse });

    renderHook(() => useUsersList({ page: 2, limit: 20 }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith("/users", {
        params: { page: 2, limit: 20 },
      });
    });
  });

  it("should return empty array when no data", async () => {
    vi.mocked(api.get).mockResolvedValue({ data: undefined });

    const { result } = renderHook(() => useUsersList(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.users).toEqual([]);
    expect(result.current.total).toBe(0);
    expect(result.current.totalPages).toBe(1);
  });

  it("should handle error", async () => {
    vi.mocked(api.get).mockRejectedValue(new Error("API Error"));

    const { result } = renderHook(() => useUsersList(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
    });
  });

  it("should have refetch function", async () => {
    vi.mocked(api.get).mockResolvedValue({ data: mockListResponse });

    const { result } = renderHook(() => useUsersList(), {
      wrapper: createWrapper(),
    });

    expect(typeof result.current.refetch).toBe("function");
  });
});

describe("useCreateUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create user successfully", async () => {
    const newUser: CreateUserDto = {
      name: "New User",
      email: "new@example.com",
      password: "password123",
      roles: ["user"],
    };
    vi.mocked(api.post).mockResolvedValue({
      data: { ...newUser, _id: "user-3" },
    });

    const { result } = renderHook(() => useCreateUser(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.createUser(newUser);
    });

    expect(api.post).toHaveBeenCalledWith("/users", newUser);
    expect(toast.success).toHaveBeenCalledWith("Usuário criado com sucesso!");
  });

  it("should handle create error with string message", async () => {
    vi.mocked(api.post).mockRejectedValue({
      isAxiosError: true,
      response: { data: { message: "Email já existe" } },
    });

    const { result } = renderHook(() => useCreateUser(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      try {
        await result.current.createUser({
          name: "Test",
          email: "test@example.com",
          password: "123",
          roles: ["user"],
        });
      } catch {
      }
    });

    expect(toast.error).toHaveBeenCalledWith("Email já existe");
  });

  it("should handle create error with array message", async () => {
    vi.mocked(api.post).mockRejectedValue({
      isAxiosError: true,
      response: { data: { message: ["Email inválido", "Senha muito curta"] } },
    });

    const { result } = renderHook(() => useCreateUser(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      try {
        await result.current.createUser({
          name: "Test",
          email: "invalid",
          password: "123",
          roles: ["user"],
        });
      } catch {
      }
    });

    expect(toast.error).toHaveBeenCalledWith("Email inválido");
  });

  it("should use default error message when no API message", async () => {
    vi.mocked(api.post).mockRejectedValue(new Error("Network Error"));

    const { result } = renderHook(() => useCreateUser(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      try {
        await result.current.createUser({
          name: "Test",
          email: "test@example.com",
          password: "123",
          roles: ["user"],
        });
      } catch {
      }
    });

    expect(toast.error).toHaveBeenCalledWith("Erro ao criar usuário");
  });

  it("should return isCreating state", () => {
    const { result } = renderHook(() => useCreateUser(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isCreating).toBe(false);
  });
});

describe("useUpdateUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should update user successfully", async () => {
    const updateData: UpdateUserDto = { name: "Updated Name" };
    vi.mocked(api.patch).mockResolvedValue({
      data: { ...mockUsers[0], ...updateData },
    });

    const { result } = renderHook(() => useUpdateUser(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.updateUser({ id: "user-1", data: updateData });
    });

    expect(api.patch).toHaveBeenCalledWith("/users/user-1", updateData);
    expect(toast.success).toHaveBeenCalledWith(
      "Usuário atualizado com sucesso!",
    );
  });

  it("should handle update error", async () => {
    vi.mocked(api.patch).mockRejectedValue({
      isAxiosError: true,
      response: { data: { message: "Usuário não encontrado" } },
    });

    const { result } = renderHook(() => useUpdateUser(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      try {
        await result.current.updateUser({
          id: "user-1",
          data: { name: "Test" },
        });
      } catch {
      }
    });

    expect(toast.error).toHaveBeenCalledWith("Usuário não encontrado");
  });

  it("should return isUpdating state", () => {
    const { result } = renderHook(() => useUpdateUser(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isUpdating).toBe(false);
  });
});

describe("useDeleteUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should delete user successfully", async () => {
    vi.mocked(api.delete).mockResolvedValue({});

    const { result } = renderHook(() => useDeleteUser(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.deleteUser("user-1");
    });

    expect(api.delete).toHaveBeenCalledWith("/users/user-1");
    expect(toast.success).toHaveBeenCalledWith("Usuário deletado com sucesso!");
  });

  it("should handle delete error", async () => {
    vi.mocked(api.delete).mockRejectedValue({
      isAxiosError: true,
      response: { data: { message: "Não é possível deletar" } },
    });

    const { result } = renderHook(() => useDeleteUser(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      try {
        await result.current.deleteUser("user-1");
      } catch {
      }
    });

    expect(toast.error).toHaveBeenCalledWith("Não é possível deletar");
  });

  it("should return isDeleting state", () => {
    const { result } = renderHook(() => useDeleteUser(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isDeleting).toBe(false);
  });
});

describe("useUsers (combined hook)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(api.get).mockResolvedValue({ data: mockListResponse });
  });

  it("should return all combined values", async () => {
    const { result } = renderHook(() => useUsers(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current).toHaveProperty("users");
    expect(result.current).toHaveProperty("total");
    expect(result.current).toHaveProperty("totalPages");
    expect(result.current).toHaveProperty("isLoading");
    expect(result.current).toHaveProperty("error");
    expect(result.current).toHaveProperty("createUser");
    expect(result.current).toHaveProperty("updateUser");
    expect(result.current).toHaveProperty("deleteUser");
    expect(result.current).toHaveProperty("isCreating");
    expect(result.current).toHaveProperty("isUpdating");
    expect(result.current).toHaveProperty("isDeleting");
  });

  it("should use custom page and limit", async () => {
    renderHook(() => useUsers({ page: 3, limit: 5 }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith("/users", {
        params: { page: 3, limit: 5 },
      });
    });
  });

  it("should return users from list hook", async () => {
    const { result } = renderHook(() => useUsers(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.users).toEqual(mockUsers);
    });
  });
});
