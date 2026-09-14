
// Shared TypeScript types for CreditWise


export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  xp: number;
  level: number;
}

export interface CreditCard {
  id: number;
  card_name: string;
  last_four: string;
  credit_limit: number;
  current_balance: number;
  apr: number;
  due_day: number;
  is_active: boolean;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}