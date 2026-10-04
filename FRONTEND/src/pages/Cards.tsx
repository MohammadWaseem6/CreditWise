import CreditCardVisual from '../components/CreditCardVisual';
import LogPaymentModal from '../components/LogPaymentModal';
import CardFormModal from '../components/CardFormModal';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import { Plus, CreditCard as CardIcon, DollarSign, Trash2, Pencil } from 'lucide-react';
import api from '../utils/api';
import type { CreditCard } from '../types/types';
import toast from 'react-hot-toast';

export default function Cards() {
  const { user } = useAuth();

  const [cards, setCards] = useState<CreditCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingCard, setEditingCard] = useState<CreditCard | null>(null);
  const [paymentCard, setPaymentCard] = useState<CreditCard | null>(null);
  const [deleteCard, setDeleteCard] = useState<CreditCard | null>(null);

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

  const openAddModal = () => {
    setEditingCard(null);
    setShowFormModal(true);
  };

  const openEditModal = (card: CreditCard) => {
    setEditingCard(card);
    setShowFormModal(true);
  };

  const handleDelete = async (card: CreditCard): Promise<void> => {
    try {
      await api.delete(`/cards/${card.id}`);
      setCards(cards.filter((c) => c.id !== card.id));
      setDeleteCard(null);
      toast.success('Card deleted successfully');
    } catch (err) {
      console.error('Failed to delete card:', err);
      toast.error('Failed to delete card');
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
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Cards</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Manage your credit cards
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gradient-primary text-white hover:opacity-90 transition-all"
        >
          <Plus className="h-4 w-4" />
          Add Card
        </button>
      </div>

      {cards.length === 0 ? (
        <div className="glass-card p-8 md:p-12 text-center">
          <CardIcon className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-bold mb-2">No cards yet</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Add your first credit card to get started
          </p>
          <button
            onClick={openAddModal}
            className="px-6 py-3 rounded-xl bg-gradient-primary text-white hover:opacity-90 transition-all"
          >
            + Add Your First Card
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {cards.map((card) => (
            <div key={card.id} className="space-y-4">
              <div className="relative group">
                <CreditCardVisual
                  card={card}
                  cardholderName={`${user?.first_name ?? ''} ${user?.last_name ?? ''}`.trim()}
                />
                <button
                  onClick={() => openEditModal(card)}
                  className="absolute top-3 right-3 p-2 rounded-xl bg-white/20 backdrop-blur-md text-white opacity-0 group-hover:opacity-100 hover:bg-white/30 transition-all"
                  title="Edit card"
                >
                  <Pencil className="h-4 w-4" />
                </button>
              </div>

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
                    onClick={() => openEditModal(card)}
                    className="px-3 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 hover:bg-white/5 transition-all"
                    title="Edit"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setDeleteCard(card)}
                    className="px-3 py-2.5 rounded-xl border border-red-200 dark:border-red-500/30 text-red-500 hover:bg-red-500/10 transition-all"
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

      <CardFormModal
        open={showFormModal}
        onClose={() => setShowFormModal(false)}
        onSuccess={fetchCards}
        existingCard={editingCard}
      />

      <LogPaymentModal
        card={paymentCard}
        open={!!paymentCard}
        onClose={() => setPaymentCard(null)}
        onSuccess={fetchCards}
      />

      {deleteCard && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glass-card p-6 md:p-8 rounded-2xl max-w-md w-full">
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