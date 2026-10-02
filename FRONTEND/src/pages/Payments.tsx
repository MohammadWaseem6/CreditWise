// ============================================================
// src/pages/Payments.tsx
// PURPOSE: Payment history with stats and filtering
// ============================================================

import { useEffect, useState } from 'react';
import api from '../utils/api';
import { Receipt, DollarSign, TrendingUp, Award, Filter, Calendar } from 'lucide-react';
import type { PaymentsHistoryResponse, CreditCard } from '../types/types';

export default function Payments() {
    const [data, setData] = useState<PaymentsHistoryResponse | null>(null);
    const [cards, setCards] = useState<CreditCard[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCard, setSelectedCard] = useState<number | null>(null);

    // ============================================================
    // FETCH DATA
    // ============================================================
    useEffect(() => {
        fetchData();
    }, [selectedCard]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const url = selectedCard
                ? `/payments/?card_id=${selectedCard}`
                : '/payments/';
            const [paymentsRes, cardsRes] = await Promise.all([
                api.get<PaymentsHistoryResponse>(url),
                api.get<CreditCard[]>('/cards/'),
            ]);
            setData(paymentsRes.data);
            setCards(cardsRes.data);
        } catch (err) {
            console.error('Failed to fetch payments:', err);
        } finally {
            setLoading(false);
        }
    };

    // ============================================================
    // LOADING
    // ============================================================
    if (loading || !data) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
            </div>
        );
    }

    const { payments, stats } = data;

    // DATE FORMATTER

    const formatDate = (iso: string) => {
        const d = new Date(iso);
        return d.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const formatTime = (iso: string) => {
        const d = new Date(iso);
        return d.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
        });
    };


    // main render
    return (
        <div>
            {/* HEADER */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-xl bg-gradient-primary">
                        <Receipt className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold">Payments</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Your complete payment history
            </p>
                    </div>
                </div>
            </div>

            {/* STATS ROW  */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="glass-card p-5">
                    <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="h-4 w-4 text-green-500" />
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                            Total Paid
            </span>
                    </div>
                    <p className="text-2xl font-bold">${stats.total_paid.toFixed(2)}</p>
                </div>

                <div className="glass-card p-5">
                    <div className="flex items-center gap-2 mb-2">
                        <Receipt className="h-4 w-4 text-primary" />
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                            Payments
            </span>
                    </div>
                    <p className="text-2xl font-bold">{stats.total_count}</p>
                </div>

                <div className="glass-card p-5">
                    <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="h-4 w-4 text-secondary" />
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                            Avg Payment
            </span>
                    </div>
                    <p className="text-2xl font-bold">${stats.avg_payment.toFixed(2)}</p>
                </div>

                <div className="glass-card p-5">
                    <div className="flex items-center gap-2 mb-2">
                        <Award className="h-4 w-4 text-amber-500" />
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                            XP Earned
            </span>
                    </div>
                    <p className="text-2xl font-bold text-amber-500">
                        +{stats.total_xp}
                    </p>
                </div>
            </div>

            {/* FILTERS */}
            <div className="glass-card p-4 mb-6">
                <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <Filter className="h-4 w-4" />
                        <span>Filter:</span>
                    </div>
                    <button
                        onClick={() => setSelectedCard(null)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                            selectedCard === null
                                ? 'bg-gradient-primary text-white'
                                : 'bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10'
                            }`}
                    >
                        All Cards
          </button>
                    {cards.map((card) => (
                        <button
                            key={card.id}
                            onClick={() => setSelectedCard(card.id)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                                selectedCard === card.id
                                    ? 'bg-gradient-primary text-white'
                                    : 'bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10'
                                }`}
                        >
                            {card.card_name} ••{card.last_four}
                        </button>
                    ))}
                </div>
            </div>

            {/* PAYMENTS LIST */}
            {payments.length === 0 ? (
                <div className="glass-card p-12 text-center">
                    <Receipt className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-xl font-bold mb-2">No payments yet</h3>
                    <p className="text-gray-500 dark:text-gray-400">
                        Log your first payment from the Cards page
          </p>
                </div>
            ) : (
                    <div className="glass-card overflow-hidden">
                        {/* Table Header */}
                        <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 dark:bg-white/5 border-b border-gray-200 dark:border-white/10 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            <div className="col-span-4 flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                Date
            </div>
                            <div className="col-span-4">Card</div>
                            <div className="col-span-2 text-right">Amount</div>
                            <div className="col-span-2 text-right">XP</div>
                        </div>

                        {/* Table Rows */}
                        <div className="divide-y divide-gray-200 dark:divide-white/10">
                            {payments.map((payment) => (
                                <div
                                    key={payment.id}
                                    className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                                >
                                    <div className="col-span-4">
                                        <p className="text-sm font-medium">
                                            {formatDate(payment.date)}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {formatTime(payment.date)}
                                        </p>
                                    </div>

                                    <div className="col-span-4">
                                        <p className="text-sm font-medium">{payment.card_name}</p>
                                        <p className="text-xs text-gray-500">
                                            •••• {payment.last_four}
                                        </p>
                                    </div>

                                    <div className="col-span-2 text-right">
                                        <p className="text-sm font-bold text-green-500">
                                            +${payment.amount.toFixed(2)}
                                        </p>
                                    </div>

                                    <div className="col-span-2 text-right">
                                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold">
                                            <Award className="h-3 w-3" />
                                            {payment.xp_earned}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
        </div>
    );
}