/**
 * Tipos relacionados a usuários
 */

export interface User {
  _id: string;
  name: string;
  email: string;
  roles: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserDto {
  name: string;
  email: string;
  password: string;
  roles: string[];
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
  password?: string;
  roles?: string[];
}
