import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import api from '../utils/api';
import { X } from 'lucide-react';
import type { CreditCard } from '../types/types';
import { AxiosError } from 'axios';
import toast from 'react-hot-toast';

interface Props {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    existingCard: CreditCard | null;
}

interface FormState {
    card_name: string;
    cardholder_name: string;
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

const EMPTY_FORM: FormState = {
    card_name: '',
    cardholder_name: '',
    card_number: '',
    last_four: '',
    credit_limit: '',
    current_balance: '',
    apr: '',
    due_day: '',
    expiry_month: '',
    expiry_year: '',
};

export default function CardFormModal({ open, onClose, onSuccess, existingCard }: Props) {
    const [form, setForm] = useState<FormState>(EMPTY_FORM);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const isEditing = !!existingCard;

    useEffect(() => {
        if (existingCard) {
            setForm({
                card_name: existingCard.card_name,
                cardholder_name: existingCard.cardholder_name || '',
                card_number: existingCard.card_number || '',
                last_four: existingCard.last_four,
                credit_limit: existingCard.credit_limit.toString(),
                current_balance: existingCard.current_balance.toString(),
                apr: existingCard.apr.toString(),
                due_day: existingCard.due_day.toString(),
                expiry_month: existingCard.expiry_month ?.toString() || '',
                expiry_year: existingCard.expiry_year ?.toString() || '',
            });
        } else {
            setForm(EMPTY_FORM);
        }
        setError('');
    }, [existingCard, open]);

    const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const payload = {
            card_name: form.card_name,
            cardholder_name: form.cardholder_name || null,
            card_number: form.card_number || null,
            last_four: form.last_four,
            credit_limit: parseFloat(form.credit_limit),
            current_balance: parseFloat(form.current_balance || '0'),
            apr: parseFloat(form.apr),
            due_day: parseInt(form.due_day),
            expiry_month: form.expiry_month ? parseInt(form.expiry_month) : null,
            expiry_year: form.expiry_year ? parseInt(form.expiry_year) : null,
        };

        try {
            if (isEditing && existingCard) {
                await api.put(`/cards/${existingCard.id}`, payload);
                toast.success('Card updated successfully!');
            } else {
                await api.post('/cards/', payload);
                toast.success('Card added successfully!');
            }
            onSuccess();
            onClose();
        } catch (err) {
            const axiosErr = err as AxiosError<ApiError>;
            const msg = axiosErr.response ?.data ?.detail || `Failed to ${isEditing ? 'update' : 'add'} card`;
            setError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="glass-card p-6 md:p-8 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl md:text-2xl font-bold">
                        {isEditing ? 'Edit Card' : 'Add New Card'}
                    </h2>
                    <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10">
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
                        <label className="block text-sm font-medium mb-2">Card Name</label>
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
                            Cardholder Name
                        </label>
                        <input
                            type="text"
                            name="cardholder_name"
                            value={form.cardholder_name}
                            onChange={handleChange}
                            placeholder="MOHAMMAD WASEEM"
                            className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Leave blank to use your profile name
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Full Card Number</label>
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
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Last 4 Digits</label>
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
                            <label className="block text-sm font-medium mb-2">APR (%)</label>
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
                            <label className="block text-sm font-medium mb-2">Expiry Month</label>
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
                            <label className="block text-sm font-medium mb-2">Expiry Year</label>
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
                            <label className="block text-sm font-medium mb-2">Credit Limit ($)</label>
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
                            <label className="block text-sm font-medium mb-2">Current Balance ($)</label>
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
                        <label className="block text-sm font-medium mb-2">Due Day (1-31)</label>
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
                            onClick={onClose}
                            className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-white/10 hover:bg-white/5"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-3 rounded-xl bg-gradient-primary text-white hover:opacity-90 disabled:opacity-50"
                        >
                            {loading ? 'Saving...' : isEditing ? 'Update Card' : 'Add Card'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}