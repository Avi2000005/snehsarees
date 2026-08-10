export interface User {
  id: number;
  phone?: string;
  email?: string;
  username?: string;
  addresses?: any[];
  password?: string;
  name: string;
  createdAt?: string;
}
