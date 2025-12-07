import { Types } from 'mongoose';

export interface ValidatedUser {
  _id: Types.ObjectId | string;
  email: string;
  name: string;
  roles: string[];
}

export interface LoginResponse {
  access_token: string;
  user: {
    name: string;
    email: string;
  };
}

export interface LogoutResponse {
  message: string;
}

export interface JwtPayload {
  email: string;
  sub: string;
  name: string;
  roles: string[];
}

export interface DecodedToken {
  sub: string;
  email: string;
  exp: number;
  iat: number;
}
