// ============================================================
// src/components/LogPaymentModal.tsx
// PURPOSE: Modal to log a payment on a credit card
// ============================================================

import { useState, FormEvent, ChangeEvent } from 'react';
import api from '../utils/api';
import { X, DollarSign, Sparkles } from 'lucide-react';
import type { CreditCard, PaymentResponse } from '../types';
import { AxiosError } from 'axios';

interface Props {
  card: CreditCard | null;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface ApiError {
  detail: string;
}

export default function LogPaymentModal({ card, open, onClose, onSuccess }: Props) {
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // ============================================================
  // PREVIEW CALCULATIONS
  // ============================================================
  const amountNum = parseFloat(amount) || 0;
  const newBalance = card ? Math.max(card.current_balance - amountNum, 0) : 0;
  const xpPreview = Math.max(5, Math.floor(amountNum / 10));

  // ============================================================
  // HANDLE SUBMIT
  // ============================================================
  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError('');

    if (!card) return;

    if (amountNum <= 0) {
      setError('Amount must be greater than 0');
      return;
    }

    if (amountNum > card.current_balance) {
      setError('Payment exceeds current balance');
      return;
    }

    setLoading(true);
    try {
      await api.post<PaymentResponse>('/payments/', {
        card_id: card.id,
        amount: amountNum,
      });

      setAmount('');
      onSuccess();
      onClose();
    } catch (err) {
      const axiosErr = err as AxiosError<ApiError>;
      setError(axiosErr.response?.data?.detail || 'Failed to log payment');
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // RESET ON CLOSE
  // ============================================================
  const handleClose = () => {
    setAmount('');
    setError('');
    onClose();
  };

  if (!open || !card) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="glass-card p-8 rounded-2xl max-w-md w-full">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold">Log Payment</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {card.card_name} •••• {card.last_four}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg hover:bg-white/10"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* CURRENT BALANCE */}
        <div className="mb-6 p-4 rounded-xl bg-primary/5 border border-primary/10">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
            Current Balance
          </p>
          <p className="text-3xl font-bold text-primary">
            ${card.current_balance.toFixed(2)}
          </p>
        </div>

        {/* ERROR */}
        {error && (
          <div className="p-3 mb-4 rounded-xl bg-red-500/10 text-red-500 text-sm">
            {error}
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Payment Amount ($)
            </label>
            <div className="relative">
              <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="number"
                step="0.01"
                min="0"
                max={card.current_balance}
                value={amount}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setAmount(e.target.value)
                }
                placeholder="200.00"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                autoFocus
                required
              />
            </div>
            <div className="flex gap-2 mt-2">
              {[50, 100, 200].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setAmount(preset.toString())}
                  disabled={preset > card.current_balance}
                  className="px-3 py-1 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  ${preset}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setAmount(card.current_balance.toString())}
                className="px-3 py-1 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-all"
              >
                Pay Full
              </button>
            </div>
          </div>

          {/* PREVIEW */}
          {amountNum > 0 && amountNum <= card.current_balance && (
            <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20 space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  New Balance
                </span>
                <span className="font-bold">
                  ${newBalance.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                  <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                  You'll earn
                </span>
                <span className="font-bold text-amber-500">
                  +{xpPreview} XP
                </span>
              </div>
            </div>
          )}

          {/* ACTIONS */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-white/10 hover:bg-white/5 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || amountNum <= 0 || amountNum > card.current_balance}
              className="flex-1 py-3 rounded-xl bg-gradient-primary text-white font-medium hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Logging...' : 'Log Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}