import { Role } from '../enums/role.enum';

export interface ActiveUser {
  userId: string;
  email: string;
  name: string;
  roles: Role[];
}
