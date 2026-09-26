// ============================================================
// src/types.ts
// PURPOSE: Shared TypeScript types for CreditWise
// ============================================================

// ---------- USER ----------
export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  xp: number;
  level: number;
}

// ---------- CREDIT CARD ----------
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

// ---------- AUTH ----------
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

// ---------- DASHBOARD ----------
export interface Badge {
  name: string;
  icon: string;
}

export interface RecentPayment {
  amount: number;
  date: string;
  card_name: string;
  last_four: string;
  xp_earned: number;
}

export interface DashboardData {
  total_debt: number;
  total_limit: number;
  available_credit: number;
  cards_count: number;
  level: number;
  xp: number;
  badges: Badge[];
  recent_payments: RecentPayment[];
  payoff_months: number | null;
  total_interest: number;
}

// ---------- PAYMENT ----------
export interface PaymentData {
  card_id: number;
  amount: number;
}

export interface PaymentResponse {
  message: string;
  xp_earned: number;
  new_balance: number;
  level: number;
}