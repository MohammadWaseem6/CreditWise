import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { CreditCard, TrendingUp, Award, DollarSign } from 'lucide-react';
import type { CreditCard as CreditCardType } from '../types';

export default function Dashboard() {
  const { user } = useAuth();
  const [cards, setCards] = useState<CreditCardType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCards = async () => {
      try {
        const res = await api.get<CreditCardType[]>('/cards/');
        setCards(res.data);
      } catch (err) {
        console.error('Failed to fetch cards:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCards();
  }, []);

  const totalDebt = cards.reduce((sum, c) => sum + c.current_balance, 0);
  const totalLimit = cards.reduce((sum, c) => sum + c.credit_limit, 0);
  const availableCredit = totalLimit - totalDebt;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Welcome back, {user?.first_name}! 👋
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="h-5 w-5 text-primary" />
            <span className="text-sm text-gray-500 dark:text-gray-400">Total Debt</span>
          </div>
          <p className="text-2xl font-bold">${totalDebt.toFixed(2)}</p>
          <p className="text-xs text-gray-400">Across {cards.length} cards</p>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="h-5 w-5 text-secondary" />
            <span className="text-sm text-gray-500 dark:text-gray-400">Available Credit</span>
          </div>
          <p className="text-2xl font-bold">${availableCredit.toFixed(2)}</p>
          <p className="text-xs text-gray-400">${totalLimit.toFixed(2)} total limit</p>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-2">
            <Award className="h-5 w-5 text-accent" />
            <span className="text-sm text-gray-500 dark:text-gray-400">Your Level</span>
          </div>
          <p className="text-2xl font-bold">Level {user?.level}</p>
          <p className="text-xs text-gray-400">{user?.xp} XP earned</p>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-2">
            <CreditCard className="h-5 w-5 text-yellow-500" />
            <span className="text-sm text-gray-500 dark:text-gray-400">Cards</span>
          </div>
          <p className="text-2xl font-bold">{cards.length}</p>
          <p className="text-xs text-gray-400">Active credit cards</p>
        </div>
      </div>

      <div className="glass-card p-6">
        <h2 className="text-xl font-bold mb-4">Your Cards</h2>
        {cards.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            No cards yet. Add one from the API!
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cards.map((card) => (
              <div
                key={card.id}
                className="p-5 rounded-xl bg-gradient-primary/10 border border-primary/20"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-semibold">{card.card_name}</p>
                    <p className="text-xs text-gray-500">•••• {card.last_four}</p>
                  </div>
                  <span className="text-xs px-2 py-1 rounded bg-primary/20 text-primary">
                    {card.apr}% APR
                  </span>
                </div>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-xs text-gray-500">Balance</p>
                    <p className="text-lg font-bold">
                      ${card.current_balance.toFixed(2)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Limit</p>
                    <p className="text-sm font-medium">
                      ${card.credit_limit.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}