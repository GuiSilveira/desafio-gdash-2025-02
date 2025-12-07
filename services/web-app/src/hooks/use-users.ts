import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/config/api";
import { toast } from "sonner";
import { API_ENDPOINTS } from "@/constants/api";
import type { User, CreateUserDto, UpdateUserDto } from "@/types/user";
import { isAxiosError } from "axios";

export interface UsersListResponse {
  data: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UseUsersListOptions {
  page?: number;
  limit?: number;
}

function extractErrorMessage(error: unknown, defaultMessage: string): string {
  if (isAxiosError(error)) {
    const apiMessage = error.response?.data?.message;
    if (Array.isArray(apiMessage)) {
      return apiMessage[0];
    } else if (typeof apiMessage === "string") {
      return apiMessage;
    }
  }
  return defaultMessage;
}

export const userQueryKeys = {
  all: ["users"] as const,
  list: (page: number, limit: number) => ["users", "list", page, limit] as const,
  detail: (id: string) => ["users", id] as const,
};

export function useUsersList(options: UseUsersListOptions = {}) {
  const { page = 1, limit = 10 } = options;

  const query = useQuery<UsersListResponse>({
    queryKey: userQueryKeys.list(page, limit),
    queryFn: async () => {
      const { data } = await api.get(API_ENDPOINTS.USERS, {
        params: { page, limit },
      });
      return data;
    },
  });

  return {
    data: query.data,
    users: query.data?.data || [],
    total: query.data?.total || 0,
    totalPages: query.data?.totalPages || 1,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (userData: CreateUserDto) => {
      const { data } = await api.post(API_ENDPOINTS.USERS, userData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Usuário criado com sucesso!");
    },
    onError: (error) => {
      toast.error(extractErrorMessage(error, "Erro ao criar usuário"));
    },
  });

  return {
    createUser: mutation.mutateAsync,
    isCreating: mutation.isPending,
    error: mutation.error,
  };
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateUserDto }) => {
      const response = await api.patch(API_ENDPOINTS.USER_BY_ID(id), data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Usuário atualizado com sucesso!");
    },
    onError: (error) => {
      toast.error(extractErrorMessage(error, "Erro ao atualizar usuário"));
    },
  });

  return {
    updateUser: mutation.mutateAsync,
    isUpdating: mutation.isPending,
    error: mutation.error,
  };
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(API_ENDPOINTS.USER_BY_ID(id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Usuário deletado com sucesso!");
    },
    onError: (error) => {
      toast.error(extractErrorMessage(error, "Erro ao deletar usuário"));
    },
  });

  return {
    deleteUser: mutation.mutateAsync,
    isDeleting: mutation.isPending,
    error: mutation.error,
  };
}

export interface UseUsersOptions {
  page?: number;
  limit?: number;
}

export function useUsers(options: UseUsersOptions = {}) {
  const { page = 1, limit = 10 } = options;

  const { users, total, totalPages, isLoading, error, data } = useUsersList({ page, limit });
  const { createUser, isCreating } = useCreateUser();
  const { updateUser, isUpdating } = useUpdateUser();
  const { deleteUser, isDeleting } = useDeleteUser();

  return {
    users,
    total,
    totalPages,
    data,
    isLoading,
    error,
    createUser,
    updateUser,
    deleteUser,
    isCreating,
    isUpdating,
    isDeleting,
  };
}
