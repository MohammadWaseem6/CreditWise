import { useEffect, useState } from 'react';
import api from '../utils/api';
import type { BadgesResponse, EarnedBadge, AvailableBadge } from '../types/types';
import {
    Trophy, Lock, Sparkles,
    CreditCard, Send, Flame, Swords, PiggyBank,
    Star, Crown, PartyPopper, TrendingUp, Layers,
    Award, X, Check, Calendar, Target,
} from 'lucide-react';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
    CreditCard,
    Send,
    Flame,
    Swords,
    PiggyBank,
    Star,
    Crown,
    PartyPopper,
    TrendingUp,
    Layers,
};

function getIcon(name: string) {
    return ICON_MAP[name] || Award;
}

type BadgeView = EarnedBadge | AvailableBadge;

function isEarned(b: BadgeView): b is EarnedBadge {
    return 'earned_at' in b;
}

export default function Badges() {
    const [data, setData] = useState<BadgesResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState<BadgeView | null>(null);

    useEffect(() => {
        const fetchBadges = async () => {
            try {
                const res = await api.get<BadgesResponse>('/badges/');
                setData(res.data);
            } catch (err) {
                console.error('Failed to fetch badges:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchBadges();
    }, []);

    if (loading || !data) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
            </div>
        );
    }

    const progressPercent = Math.round(
        (data.total_earned / data.total_badges) * 100
    );

    return (
        <div>
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-500 shadow-lg shadow-yellow-500/30">
                        <Trophy className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold">Badges</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {data.total_earned} of {data.total_badges} unlocked
                        </p>
                    </div>
                </div>
            </div>

            <div className="glass-card p-6 mb-8">
                <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-medium">Overall Progress</span>
                    <span className="text-sm font-bold text-primary">
                        {progressPercent}%
                    </span>
                </div>
                <div className="w-full h-3 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-linear-to-r from-primary via-secondary to-accent transition-all duration-700"
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>
            </div>

            {data.newly_awarded.length > 0 && (
                <div className="mb-8 p-4 rounded-2xl bg-gradient-to-r from-yellow-400/20 to-amber-400/20 border border-yellow-400/30">
                    <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="h-5 w-5 text-yellow-500" />
                        <span className="font-bold text-yellow-700 dark:text-yellow-400">
                            New badge{data.newly_awarded.length > 1 ? 's' : ''} unlocked!
                        </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {data.newly_awarded.map((name) => (
                            <span
                                key={name}
                                className="px-3 py-1 rounded-lg bg-white/60 dark:bg-white/10 text-sm font-medium"
                            >
                                {name}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {data.earned.length > 0 && (
                <div className="mb-10">
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-green-500" />
                        Earned ({data.earned.length})
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                        {data.earned.map((badge) => (
                            <BadgeCard
                                key={badge.name}
                                badge={badge}
                                earned
                                onClick={() => setSelected(badge)}
                            />
                        ))}
                    </div>
                </div>
            )}

            {data.available.length > 0 && (
                <div>
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-gray-400" />
                        Locked ({data.available.length})
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                        {data.available.map((badge) => (
                            <BadgeCard
                                key={badge.name}
                                badge={badge}
                                earned={false}
                                onClick={() => setSelected(badge)}
                            />
                        ))}
                    </div>
                </div>
            )}

            {data.available.length === 0 && data.earned.length > 0 && (
                <div className="glass-card p-12 text-center">
                    <div className="inline-flex p-6 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 mb-4 shadow-2xl shadow-yellow-500/40">
                        <Crown className="h-12 w-12 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">All badges unlocked!</h2>
                    <p className="text-gray-500 dark:text-gray-400">
                        You're a CreditWise master!
                    </p>
                </div>
            )}

            {selected && (
                <BadgeDetailModal
                    badge={selected}
                    earned={isEarned(selected)}
                    onClose={() => setSelected(null)}
                />
            )}
        </div>
    );
}

function BadgeCard({
    badge,
    earned,
    onClick,
}: {
    badge: BadgeView;
    earned: boolean;
    onClick: () => void;
}) {
    const Icon = getIcon(badge.icon);

    return (
        <button
            onClick={onClick}
            className={`group relative overflow-hidden rounded-2xl p-6 text-center transition-all duration-300 hover:scale-105 hover:-translate-y-1 active:scale-100 cursor-pointer w-full ${
                earned
                    ? 'glass-card hover:shadow-xl hover:shadow-primary/20'
                    : 'glass-card opacity-75 hover:opacity-100'
                }`}
        >
            <div
                className={`absolute inset-0 bg-gradient-to-br ${badge.color} transition-opacity duration-500 pointer-events-none ${
                    earned ? 'opacity-0 group-hover:opacity-15' : 'opacity-0'
                    }`}
            />

            <div
                className={`absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent transition-opacity duration-500 pointer-events-none ${
                    earned ? 'opacity-0 group-hover:opacity-100' : ''
                    }`}
            />

            <div className="relative inline-flex mb-4">
                <div
                    className={`absolute inset-0 rounded-2xl blur-xl transition-all duration-500 ${
                        earned
                            ? `bg-gradient-to-br ${badge.color} opacity-40 group-hover:opacity-70 group-hover:blur-2xl`
                            : 'opacity-0'
                        }`}
                />

                <div
                    className={`relative p-4 rounded-2xl transition-all duration-500 ${
                        earned
                            ? `bg-gradient-to-br ${badge.color} shadow-lg group-hover:shadow-2xl group-hover:scale-110`
                            : 'bg-gray-100 dark:bg-white/10 ring-1 ring-gray-200 dark:ring-white/10'
                        }`}
                >
                    <Icon
                        className={`h-8 w-8 transition-transform duration-500 group-hover:scale-110 ${
                            earned ? 'text-white' : 'text-gray-500 dark:text-gray-400'
                            }`}
                    />
                </div>

                {earned ? (
                    <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-green-500 border-2 border-white dark:border-gray-900 flex items-center justify-center">
                        <Check className="h-3 w-3 text-red-900" strokeWidth={3} />
                    </div>
                ) : (
                        <div className="absolute -top-1 -right-1 p-1 rounded-full bg-white dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-700">
                            <Lock className="h-3 w-3 text-gray-500" />
                        </div>
                    )}
            </div>

            <h3 className="relative z-10 font-bold text-base text-gray-900 dark:text-teal-400 mb-1.5">
                {badge.name}
            </h3>

            <p className="relative z-10 text-xs text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
                {badge.description}
            </p>

            {earned && isEarned(badge) && (
                <div className="relative z-10 mt-3 flex items-center justify-center gap-1 text-[10px] text-gray-500 dark:text-gray-800">
                    <Calendar className="h-3 w-3" />
                    {new Date(badge.earned_at).toLocaleDateString()}
                </div>
            )}

            {!earned && 'requirement' in badge && (
                <div className="relative z-10 mt-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-[10px] font-semibold">
                    <Target className="h-3 w-3" />
                    {badge.requirement}
                </div>
            )}
        </button>
    );
}

function BadgeDetailModal({
    badge,
    earned,
    onClose,
}: {
    badge: BadgeView;
    earned: boolean;
    onClose: () => void;
}) {
    const Icon = getIcon(badge.icon);

    return (
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200"
            onClick={onClose}
        >
            <div
                className="glass-card p-8 rounded-3xl max-w-md w-full relative overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                <div
                    className={`absolute inset-0 bg-gradient-to-br ${badge.color} opacity-10`}
                />

                <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/10 blur-3xl" />

                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-xl hover:bg-white/10 transition-colors z-10"
                >
                    <X className="h-5 w-5" />
                </button>

                <div className="relative flex flex-col items-center text-center">
                    <div className="relative mb-6">
                        <div
                            className={`absolute inset-0 rounded-3xl blur-2xl ${
                                earned ? `bg-linear-to-br ${badge.color} opacity-50` : 'opacity-0'
                                }`}
                        />

                        <div
                            className={`relative p-8 rounded-3xl transition-all ${
                                earned
                                    ? `bg-gradient-to-br ${badge.color} shadow-2xl`
                                    : 'bg-gray-100 dark:bg-white/10 ring-1 ring-gray-200 dark:ring-white/10'
                                }`}
                        >
                            <Icon
                                className={`h-16 w-16 ${
                                    earned ? 'text-white' : 'text-gray-500 dark:text-gray-400'
                                    }`}
                            />
                        </div>

                        {earned ? (
                            <div className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-green-500 border-4 border-white dark:border-gray-900 flex items-center justify-center shadow-lg">
                                <Check className="h-4 w-4 text-white" strokeWidth={3} />
                            </div>
                        ) : (
                                <div className="absolute -bottom-2 -right-2 p-2 rounded-full bg-white dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-700 shadow-lg">
                                    <Lock className="h-4 w-4 text-gray-500" />
                                </div>
                            )}
                    </div>

                    <div className="relative">
                        {earned && (
                            <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-500/15 text-red-600 dark:text-red-400 text-xs font-bold uppercase tracking-wider mb-3">
                                <Sparkles className="h-3 w-3" />
                                Unlocked
                            </div>
                        )}

                        {!earned && (
                            <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gray-500/15 text-gray-600 dark:text-gray-400 text-xs font-bold uppercase tracking-wider mb-3">
                                <Lock className="h-3 w-3" />
                                Locked
                            </div>
                        )}

                        <h2 className="text-2xl font-bold mb-2">{badge.name}</h2>
                        <p className="text-gray-600 dark:text-gray-300 mb-6">
                            {badge.description}
                        </p>
                    </div>

                    <div className="w-full space-y-3">
                        {earned && isEarned(badge) && (
                            <div className="flex items-center justify-between p-3 rounded-xl bg-white/40 dark:bg-white/5">
                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                    <Calendar className="h-4 w-4" />
                                    Earned on
                                </div>
                                <span className="text-sm font-semibold">
                                    {new Date(badge.earned_at).toLocaleDateString('en-US', {
                                        month: 'long',
                                        day: 'numeric',
                                        year: 'numeric',
                                    })}
                                </span>
                            </div>
                        )}

                        {!earned && 'requirement' in badge && (
                            <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
                                <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider mb-2">
                                    <Target className="h-3.5 w-3.5" />
                                    How to unlock
                                </div>
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {badge.requirement}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}