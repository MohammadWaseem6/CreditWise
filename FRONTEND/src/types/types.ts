
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
  cardholder_name: string | null;
  card_number: string | null;
  last_four: string;
  credit_limit: number;
  current_balance: number;
  apr: number;
  due_day: number;
  is_active: boolean;
  expiry_month: number | null;
  expiry_year: number | null;
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
// ---------- BADGES ----------
export interface EarnedBadge {
    name: string;
    icon: string;
    color: string;
    description: string;
    earned_at: string;
}

export interface AvailableBadge {
    name: string;
    icon: string;
    color: string;
    description: string;
    requirement: string;
}

export interface BadgesResponse {
    earned: EarnedBadge[];
    available: AvailableBadge[];
    total_earned: number;
    total_badges: number;
    newly_awarded: string[];
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
// ---------- PAYMENTS HISTORY ----------
export interface PaymentItem {
  id: number;
  amount: number;
  date: string;
  xp_earned: number;
  card_id: number;
  card_name: string;
  last_four: string;
}

export interface PaymentStats {
  total_paid: number;
  total_count: number;
  total_xp: number;
  avg_payment: number;
}

export interface PaymentsHistoryResponse {
  payments: PaymentItem[];
  stats: PaymentStats;
}

export interface UpdateProfileData {
  first_name?: string;
  last_name?: string;
}

export interface PasswordChangeData {
  current_password: string;
  new_password: string;
}
export interface CardSimulation {
  card_name: string;
  last_four: string;
  balance: number;
  apr: number;
  payment: number;
  months: number | null;
  interest: number | null;
  paid: number | null;
}

export interface MinimumScenario {
  payment: number;
  months: number;
  interest: number;
  paid: number;
}

export interface SimulatorResponse {
  total_debt: number;
  cards: CardSimulation[];
  total_months: number;
  total_interest: number;
  total_paid: number;
  payoff_date: string | null;
  minimum_payment: number;
  minimum_scenario: MinimumScenario | null;
  savings: number;
}
export interface LeaderboardUser {
  rank: number;
  id: number;
  first_name: string;
  last_name: string;
  initials: string;
  xp: number;
  level: number;
  is_current_user: boolean;
}

export interface LeaderboardResponse {
  top_users: LeaderboardUser[];
  current_user: LeaderboardUser | null;
  current_rank: number | null;
  total_users: number;
}
export interface MonthlyPayment {
  month: string;
  amount: number;
  count: number;
}

export interface CardDistribution {
  name: string;
  last_four: string;
  balance: number;
  limit: number;
}

export interface DebtTrendPoint {
  date: string;
  debt: number;
}

export interface ChartsResponse {
  monthly_payments: MonthlyPayment[];
  card_distribution: CardDistribution[];
  debt_trend: DebtTrendPoint[];
  totals: {
    total_debt: number;
    total_paid: number;
    payment_count: number;
  };
}
