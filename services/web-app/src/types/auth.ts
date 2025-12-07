export interface UserPayload {
  sub: string;
  email: string;
  name: string;
  roles: string[];
  exp: number;
  iat: number;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  user: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
}

export interface AuthContextType {
  isAuthenticated: boolean;
  token: string | null;
  user: UserPayload | null;
  signIn: (token: string) => boolean;
  signOut: () => Promise<void>;
}
