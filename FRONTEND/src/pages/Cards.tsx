import CreditCardVisual from '../components/CreditCardVisual';
import LogPaymentModal from '../components/LogPaymentModal';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState, FormEvent, ChangeEvent } from 'react';
import { Plus, X, CreditCard as CardIcon, DollarSign, Trash2 } from 'lucide-react';
import api from '../utils/api';
import type { CreditCard } from '../types/types';
import { AxiosError } from 'axios';

interface CardFormState {
  card_name: string;
  card_number: string;
  last_four: string;
  credit_limit: string;
  current_balance: string;
  apr: string;
  due_day: string;
  expiry_month: string;
  expiry_year: string;
}

interface ApiError {
  detail: string;
}

export default function Cards() {
  const { user } = useAuth();

  const [cards, setCards] = useState<CreditCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');
  const [paymentCard, setPaymentCard] = useState<CreditCard | null>(null);
  const [deleteCard, setDeleteCard] = useState<CreditCard | null>(null);

  const [form, setForm] = useState<CardFormState>({
    card_name: '',
    card_number: '',
    last_four: '',
    credit_limit: '',
    current_balance: '',
    apr: '',
    due_day: '',
    expiry_month: '',
    expiry_year: '',
  });

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async (): Promise<void> => {
    try {
      const res = await api.get<CreditCard[]>('/cards/');
      setCards(res.data);
    } catch (err) {
      console.error('Failed to fetch cards:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError('');

    try {
      const res = await api.post<CreditCard>('/cards/', {
        card_name: form.card_name,
        card_number: form.card_number || null,
        last_four: form.last_four,
        credit_limit: parseFloat(form.credit_limit),
        current_balance: parseFloat(form.current_balance || '0'),
        apr: parseFloat(form.apr),
        due_day: parseInt(form.due_day),
        expiry_month: form.expiry_month ? parseInt(form.expiry_month) : null,
        expiry_year: form.expiry_year ? parseInt(form.expiry_year) : null,
      });

      setCards([...cards, res.data]);

      setForm({
        card_name: '',
        card_number: '',
        last_four: '',
        credit_limit: '',
        current_balance: '',
        apr: '',
        due_day: '',
        expiry_month: '',
        expiry_year: '',
      });
      setShowModal(false);
    } catch (err) {
      const axiosErr = err as AxiosError<ApiError>;
      setError(axiosErr.response?.data?.detail || 'Failed to add card');
    }
  };

  const handleDelete = async (card: CreditCard): Promise<void> => {
    try {
      await api.delete(`/cards/${card.id}`);
      setCards(cards.filter((c) => c.id !== card.id));
      setDeleteCard(null);
    } catch (err) {
      console.error('Failed to delete card:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Cards</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Manage your credit cards
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-primary text-white hover:opacity-90 transition-all"
        >
          <Plus className="h-4 w-4" />
          Add Card
        </button>
      </div>

      {cards.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <CardIcon className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-bold mb-2">No cards yet</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Add your first credit card to get started
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="px-6 py-3 rounded-xl bg-gradient-primary text-white hover:opacity-90 transition-all"
          >
            + Add Your First Card
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card) => (
            <div key={card.id} className="space-y-4">
              <CreditCardVisual
                card={card}
                cardholderName={`${user?.first_name ?? ''} ${user?.last_name ?? ''}`.trim()}
              />

              <div className="glass-card p-4 rounded-xl">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-xs text-gray-500">Balance</p>
                  <p className="font-bold text-lg">
                    ${card.current_balance.toFixed(2)}
                  </p>
                </div>

                <div className="w-full bg-gray-200 dark:bg-white/10 rounded-full h-2 mb-2">
                  <div
                    className="bg-gradient-primary h-2 rounded-full"
                    style={{
                      width: `${Math.min(
                        (card.current_balance / card.credit_limit) * 100,
                        100
                      )}%`,
                    }}
                  />
                </div>

                <div className="flex justify-between text-xs text-gray-500 mb-3">
                  <span>
                    {((card.current_balance / card.credit_limit) * 100).toFixed(0)}% used
                  </span>
                  <span>Limit: ${card.credit_limit.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-xs mb-4">
                  <span className="text-gray-500">APR: {card.apr}%</span>
                  <span className="text-gray-500">Due: {card.due_day}th</span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setPaymentCard(card)}
                    disabled={card.current_balance === 0}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-primary text-white text-sm font-medium hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <DollarSign className="h-4 w-4" />
                    {card.current_balance === 0 ? 'Paid Off' : 'Log Payment'}
                  </button>
                  <button
                    onClick={() => setDeleteCard(card)}
                    className="px-4 py-2.5 rounded-xl border border-red-200 dark:border-red-500/30 text-red-500 hover:bg-red-500/10 transition-all"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glass-card p-8 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Add New Card</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-lg hover:bg-white/10"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {error && (
              <div className="p-3 mb-4 rounded-xl bg-red-500/10 text-red-500 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Card Name
                </label>
                <input
                  type="text"
                  name="card_name"
                  value={form.card_name}
                  onChange={handleChange}
                  placeholder="Chase Sapphire"
                  className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Full Card Number (16 digits)
                </label>
                <input
                  type="text"
                  name="card_number"
                  value={form.card_number}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, '').slice(0, 16);
                    const lastFour = digits.slice(-4);
                    setForm({
                      ...form,
                      card_number: digits,
                      last_four: lastFour || form.last_four,
                    });
                  }}
                  placeholder="4242424242424242"
                  maxLength={16}
                  className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  ⚠️ For learning only. Never store real card numbers in production!
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Last 4 Digits
                  </label>
                  <input
                    type="text"
                    name="last_four"
                    value={form.last_four}
                    onChange={handleChange}
                    placeholder="1234"
                    maxLength={4}
                    className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    APR (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="apr"
                    value={form.apr}
                    onChange={handleChange}
                    placeholder="22.99"
                    className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Expiry Month
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    name="expiry_month"
                    value={form.expiry_month}
                    onChange={handleChange}
                    placeholder="12"
                    className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Expiry Year
                  </label>
                  <input
                    type="number"
                    min="2024"
                    max="2050"
                    name="expiry_year"
                    value={form.expiry_year}
                    onChange={handleChange}
                    placeholder="2028"
                    className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Credit Limit ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="credit_limit"
                    value={form.credit_limit}
                    onChange={handleChange}
                    placeholder="5000"
                    className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Current Balance ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="current_balance"
                    value={form.current_balance}
                    onChange={handleChange}
                    placeholder="0"
                    className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Due Day (1-31)
                </label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  name="due_day"
                  value={form.due_day}
                  onChange={handleChange}
                  placeholder="15"
                  className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-white/10 hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-gradient-primary text-white hover:opacity-90"
                >
                  Add Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <LogPaymentModal
        card={paymentCard}
        open={!!paymentCard}
        onClose={() => setPaymentCard(null)}
        onSuccess={fetchCards}
      />

      {deleteCard && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glass-card p-8 rounded-2xl max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-red-500/10">
                <Trash2 className="h-6 w-6 text-red-500" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Delete Card</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  This action cannot be undone
                </p>
              </div>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
              Are you sure you want to delete <strong>{deleteCard.card_name}</strong> (•••• {deleteCard.last_four})? Your payment history will be preserved.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setDeleteCard(null)}
                className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-white/10 hover:bg-white/5 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteCard)}
                className="flex-1 py-3 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 transition-all"
              >
                Delete Card
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}