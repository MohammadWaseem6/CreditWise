// ============================================================
// src/pages/Dashboard.jsx
// PURPOSE: Main dashboard showing stats, simulator, payments, badges
// ============================================================

import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { CreditCard, TrendingUp, Award, DollarSign } from 'lucide-react';
import type { DashboardData } from '../types';

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  // ============================================================
  // FETCH DASHBOARD DATA FROM BACKEND
  // ============================================================
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get<DashboardData>('/dashboard/');
        setData(res.data);
      } catch (err) {
        console.error('Failed to fetch dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  // ============================================================
  // LOADING STATE
  // ============================================================
  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // ============================================================
  // MAIN RENDER
  // ============================================================
  return (
    <div>
      {/* ============ HEADER ============ */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Welcome back, {user?.first_name}! 👋
        </p>
      </div>

      {/* ============ STAT CARDS ============ */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {/* Total Debt */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="h-5 w-5 text-primary" />
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Total Debt
            </span>
          </div>
          <p className="text-2xl font-bold">${data.total_debt.toFixed(2)}</p>
          <p className="text-xs text-gray-400">
            Across {data.cards_count} cards
          </p>
        </div>

        {/* Available Credit */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="h-5 w-5 text-secondary" />
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Available Credit
            </span>
          </div>
          <p className="text-2xl font-bold">
            ${data.available_credit.toFixed(2)}
          </p>
          <p className="text-xs text-gray-400">
            ${data.total_limit.toFixed(2)} total limit
          </p>
        </div>

        {/* Level */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-2">
            <Award className="h-5 w-5 text-accent" />
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Your Level
            </span>
          </div>
          <p className="text-2xl font-bold">Level {data.level}</p>
          <p className="text-xs text-gray-400">{data.xp} XP earned</p>
        </div>

        {/* Cards */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-2">
            <CreditCard className="h-5 w-5 text-yellow-500" />
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Cards
            </span>
          </div>
          <p className="text-2xl font-bold">{data.cards_count}</p>
          <p className="text-xs text-gray-400">Active credit cards</p>
        </div>
      </div>

      {/* ============ PAYOFF SIMULATOR ============ */}
      {data.payoff_months !== null && data.total_debt > 0 && (
        <div className="glass-card p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">💰 Payoff Simulator</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                At $200/month, debt-free in
              </p>
              <p className="text-4xl font-bold text-primary">
                {data.payoff_months}{' '}
                <span className="text-lg">months</span>
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Total interest to pay
              </p>
              <p className="text-4xl font-bold text-red-400">
                ${data.total_interest.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ============ RECENT PAYMENTS ============ */}
      <div className="glass-card p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Recent Payments</h2>
        {data.recent_payments.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            No payments yet. Start logging payments to see them here!
          </p>
        ) : (
          <div className="space-y-3">
            {data.recent_payments.map((payment, index) => (
              <div
                key={index}
                className="flex justify-between items-center p-3 rounded-xl bg-white/50 dark:bg-white/5"
              >
                <div>
                  <p className="font-medium">{payment.card_name}</p>
                  <p className="text-xs text-gray-500">
                    •••• {payment.last_four}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-500">
                    -${payment.amount.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500">
                    +{payment.xp_earned} XP
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ============ BADGES ============ */}
      {data.badges.length > 0 && (
        <div className="glass-card p-6">
          <h2 className="text-xl font-bold mb-4">🏆 Your Badges</h2>
          <div className="flex flex-wrap gap-3">
            {data.badges.map((badge, index) => (
              <div
                key={index}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-primary/10 border border-primary/20"
              >
                <span className="text-2xl">{badge.icon}</span>
                <span className="text-sm font-medium">{badge.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}