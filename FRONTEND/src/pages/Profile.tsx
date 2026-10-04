import { useEffect, useState, FormEvent, ChangeEvent } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import {
    User as UserIcon, Mail, Award, Trophy, CreditCard,
    DollarSign, Edit3, Key, Check, X, Sparkles,
} from 'lucide-react';
import { AxiosError } from 'axios';
import type { CreditCard as CreditCardType, BadgesResponse } from '../types/types';
import toast from 'react-hot-toast';
interface ProfileStats {
    totalCards: number;
    totalDebt: number;
    totalPaid: number;
    paymentsCount: number;
    badgesCount: number;
}

interface ApiError {
    detail: string;
}

export default function Profile() {
    const { user, refetch } = useAuth();
    const [stats, setStats] = useState<ProfileStats | null>(null);
    const [loading, setLoading] = useState(true);

    const [editingName, setEditingName] = useState(false);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [nameError, setNameError] = useState('');
    const [nameSaving, setNameSaving] = useState(false);

    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState('');
    const [passwordSaving, setPasswordSaving] = useState(false);

    useEffect(() => {
        if (user) {
            setFirstName(user.first_name);
            setLastName(user.last_name);
        }
        fetchStats();
    }, [user]);

    const fetchStats = async () => {
        try {
            const [cardsRes, paymentsRes, badgesRes] = await Promise.all([
                api.get<CreditCardType[]>('/cards/'),
                api.get('/payments/'),
                api.get<BadgesResponse>('/badges/'),
            ]);

            const cards = cardsRes.data;
            const paymentsData = paymentsRes.data;

            setStats({
                totalCards: cards.length,
                totalDebt: cards.reduce((sum, c) => sum + c.current_balance, 0),
                totalPaid: paymentsData.stats.total_paid,
                paymentsCount: paymentsData.stats.total_count,
                badgesCount: badgesRes.data.total_earned,
            });
        } catch (err) {
            console.error('Failed to fetch stats:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveName = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setNameError('');
        setNameSaving(true);

        try {
            await api.put('/auth/me', { first_name: firstName, last_name: lastName });
            await refetch();
            setEditingName(false);
            toast.success('Profile updated! ✅');
        } catch (err) {
            const axiosErr = err as AxiosError<ApiError>;
            const msg = axiosErr.response ?.data ?.detail || 'Failed to update profile';
            setNameError(msg);
            toast.error(msg);
        } finally {
            setNameSaving(false);
        }
    };

    const handlePasswordChange = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setPasswordError('');
        setPasswordSuccess('');

        if (newPassword !== confirmPassword) {
            setPasswordError('Passwords do not match');
            return;
        }

        if (newPassword.length < 6) {
            setPasswordError('Password must be at least 6 characters');
            return;
        }

        setPasswordSaving(true);
        try {
            await api.put('/auth/password', {
                current_password: currentPassword,
                new_password: newPassword,
            });
            toast.success('Password changed! ');
            setPasswordSuccess('Password changed successfully!');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setTimeout(() => {
                setShowPasswordModal(false);
                setPasswordSuccess('');
            }, 1500);
        } catch (err) {
            const axiosErr = err as AxiosError<ApiError>;
            const msg = axiosErr.response ?.data ?.detail || 'Failed to change password';
            setPasswordError(msg);
            toast.error(msg);
        } finally {
            setPasswordSaving(false);
        }
    };

    if (loading || !user) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
            </div>
        );
    }

    const xpInLevel = user.xp % 100;
    const xpProgress = xpInLevel;
    const initials = `${user.first_name ?.[0] ?? ''}${user.last_name ?.[0] ?? ''}`;

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold">Profile</h1>
                <p className="text-gray-500 dark:text-gray-400">
                    Manage your account and view your stats
        </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="glass-card p-6 lg:col-span-1">
                    <div className="flex flex-col items-center text-center">
                        <div className="relative mb-4">
                            <div className="h-24 w-24 rounded-full bg-gradient-primary flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-primary/30">
                                {initials}
                            </div>
                            <div className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-white dark:bg-gray-900 text-xs font-black text-primary shadow-md border-2 border-gray-100 dark:border-gray-800">
                                {user.level}
                            </div>
                        </div>

                        <h2 className="text-xl font-bold">
                            {user.first_name} {user.last_name}
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                            {user.email}
                        </p>

                        <div className="w-full mb-4">
                            <div className="flex justify-between items-center mb-2 text-xs">
                                <span className="text-gray-500 dark:text-gray-400">
                                    Level Progress
                </span>
                                <span className="font-bold text-primary">
                                    {xpInLevel}/100 XP
                </span>
                            </div>
                            <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-white/10 overflow-hidden">
                                <div
                                    className="h-full rounded-full bg-gradient-to-r from-primary via-secondary to-accent transition-all duration-500"
                                    style={{ width: `${xpProgress}%` }}
                                />
                            </div>
                        </div>

                        <button
                            onClick={() => setShowPasswordModal(true)}
                            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-gray-200 dark:border-white/10 hover:bg-white/5 text-sm font-medium transition-all"
                        >
                            <Key className="h-4 w-4" />
                            Change Password
            </button>
                    </div>
                </div>

                <div className="lg:col-span-2 space-y-6">
                    <div className="glass-card p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold flex items-center gap-2">
                                <UserIcon className="h-5 w-5 text-primary" />
                                Personal Info
              </h3>
                            {!editingName && (
                                <button
                                    onClick={() => setEditingName(true)}
                                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20 transition-all"
                                >
                                    <Edit3 className="h-3.5 w-3.5" />
                                    Edit
                </button>
                            )}
                        </div>

                        {nameError && (
                            <div className="p-3 mb-4 rounded-xl bg-red-500/10 text-red-500 text-sm">
                                {nameError}
                            </div>
                        )}

                        {editingName ? (
                            <form onSubmit={handleSaveName} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">
                                            First Name
                    </label>
                                        <input
                                            type="text"
                                            value={firstName}
                                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                                setFirstName(e.target.value)
                                            }
                                            className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">
                                            Last Name
                    </label>
                                        <input
                                            type="text"
                                            value={lastName}
                                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                                setLastName(e.target.value)
                                            }
                                            className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setEditingName(false);
                                            setFirstName(user.first_name);
                                            setLastName(user.last_name);
                                            setNameError('');
                                        }}
                                        className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 dark:border-white/10 hover:bg-white/5 text-sm"
                                    >
                                        <X className="h-4 w-4" />
                                        Cancel
                  </button>
                                    <button
                                        type="submit"
                                        disabled={nameSaving}
                                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-primary text-white text-sm font-medium hover:opacity-90 disabled:opacity-50"
                                    >
                                        <Check className="h-4 w-4" />
                                        {nameSaving ? 'Saving...' : 'Save'}
                                    </button>
                                </div>
                            </form>
                        ) : (
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-white/5">
                                        <div className="flex items-center gap-3">
                                            <UserIcon className="h-4 w-4 text-gray-400" />
                                            <div>
                                                <p className="text-xs text-gray-500">First Name</p>
                                                <p className="font-medium">{user.first_name}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-white/5">
                                        <div className="flex items-center gap-3">
                                            <UserIcon className="h-4 w-4 text-gray-400" />
                                            <div>
                                                <p className="text-xs text-gray-500">Last Name</p>
                                                <p className="font-medium">{user.last_name}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-white/5">
                                        <div className="flex items-center gap-3">
                                            <Mail className="h-4 w-4 text-gray-400" />
                                            <div>
                                                <p className="text-xs text-gray-500">Email</p>
                                                <p className="font-medium">{user.email}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                    </div>

                    {stats && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="glass-card p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <CreditCard className="h-4 w-4 text-blue-500" />
                                    <span className="text-xs text-gray-500">Cards</span>
                                </div>
                                <p className="text-2xl font-bold">{stats.totalCards}</p>
                            </div>
                            <div className="glass-card p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <DollarSign className="h-4 w-4 text-red-500" />
                                    <span className="text-xs text-gray-500">Debt</span>
                                </div>
                                <p className="text-2xl font-bold">${stats.totalDebt.toFixed(0)}</p>
                            </div>
                            <div className="glass-card p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Sparkles className="h-4 w-4 text-green-500" />
                                    <span className="text-xs text-gray-500">Paid</span>
                                </div>
                                <p className="text-2xl font-bold">${stats.totalPaid.toFixed(0)}</p>
                            </div>
                            <div className="glass-card p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Trophy className="h-4 w-4 text-yellow-500" />
                                    <span className="text-xs text-gray-500">Badges</span>
                                </div>
                                <p className="text-2xl font-bold">{stats.badgesCount}</p>
                            </div>
                        </div>
                    )}

                    <div className="glass-card p-6">
                        <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
                            <Award className="h-5 w-5 text-amber-500" />
                            Your Progress
            </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20">
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                    Total XP
                </p>
                                <p className="text-3xl font-bold text-primary">{user.xp}</p>
                            </div>
                            <div className="p-4 rounded-xl bg-gradient-to-br from-amber-400/10 to-orange-500/10 border border-amber-500/20">
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                    Current Level
                </p>
                                <p className="text-3xl font-bold text-amber-500">
                                    {user.level}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {showPasswordModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="glass-card p-8 rounded-2xl max-w-md w-full">
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-primary/10">
                                    <Key className="h-5 w-5 text-primary" />
                                </div>
                                <h2 className="text-xl font-bold">Change Password</h2>
                            </div>
                            <button
                                onClick={() => {
                                    setShowPasswordModal(false);
                                    setPasswordError('');
                                    setPasswordSuccess('');
                                    setCurrentPassword('');
                                    setNewPassword('');
                                    setConfirmPassword('');
                                }}
                                className="p-2 rounded-lg hover:bg-white/10"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {passwordError && (
                            <div className="p-3 mb-4 rounded-xl bg-red-500/10 text-red-500 text-sm">
                                {passwordError}
                            </div>
                        )}

                        {passwordSuccess && (
                            <div className="p-3 mb-4 rounded-xl bg-green-500/10 text-green-600 dark:text-green-400 text-sm">
                                {passwordSuccess}
                            </div>
                        )}

                        <form onSubmit={handlePasswordChange} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Current Password
                </label>
                                <input
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    New Password
                </label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                                    minLength={6}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Confirm New Password
                </label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                                    minLength={6}
                                    required
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowPasswordModal(false);
                                        setPasswordError('');
                                        setPasswordSuccess('');
                                    }}
                                    className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-white/10 hover:bg-white/5"
                                >
                                    Cancel
                </button>
                                <button
                                    type="submit"
                                    disabled={passwordSaving}
                                    className="flex-1 py-3 rounded-xl bg-gradient-primary text-white hover:opacity-90 disabled:opacity-50"
                                >
                                    {passwordSaving ? 'Saving...' : 'Update'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}