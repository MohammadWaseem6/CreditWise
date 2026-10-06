import { useEffect, useState } from 'react';
import api from '../utils/api';
import { Trophy, Crown, Medal, Award, Users, Sparkles } from 'lucide-react';
import type { LeaderboardResponse, LeaderboardUser } from '../types/types';

export default function Leaderboard() {
    const [data, setData] = useState<LeaderboardResponse | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const res = await api.get<LeaderboardResponse>('/leaderboard/');
                setData(res.data);
            } catch (err) {
                console.error('Failed to fetch leaderboard:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchLeaderboard();
    }, []);

    if (loading || !data) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
            </div>
        );
    }

    const { top_users, current_user, current_rank, total_users } = data;

    if (top_users.length === 0) {
        return (
            <div>
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-xl bg-gradient-primary">
                            <Trophy className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">Leaderboard</h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Compete with other users
              </p>
                        </div>
                    </div>
                </div>

                <div className="glass-card p-12 text-center">
                    <Users className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-xl font-bold mb-2">No users yet</h3>
                    <p className="text-gray-500 dark:text-gray-400">
                        Be the first on the board!
          </p>
                </div>
            </div>
        );
    }

    const first = top_users[0];
    const second = top_users[1];
    const third = top_users[2];
    const rest = top_users.slice(3);

    const getRankIcon = (rank: number) => {
        if (rank === 1) return <Crown className="h-5 w-5" />;
        if (rank === 2) return <Medal className="h-5 w-5" />;
        if (rank === 3) return <Award className="h-5 w-5" />;
        return null;
    };

    const getRankColor = (rank: number) => {
        if (rank === 1) return 'from-yellow-400 to-amber-500';
        if (rank === 2) return 'from-gray-300 to-gray-400';
        if (rank === 3) return 'from-amber-600 to-orange-700';
        return 'from-gray-400 to-gray-500';
    };

    const PodiumUser = ({
        user,
    }: {
        user: LeaderboardUser | undefined;
    }) => {
        if (!user) return null;
        const isFirst = user.rank === 1;
        const isCurrent = user.is_current_user;

        return (
            <div className={`flex flex-col items-center ${isFirst ? '-mt-4' : ''}`}>
                <div className="relative">
                    {isFirst && (
                        <Crown className="h-6 w-6 text-yellow-500 absolute -top-7 left-1/2 -translate-x-1/2" />
                    )}
                    <div
                        className={`rounded-full bg-gradient-to-br ${getRankColor(
                            user.rank
                        )} p-1 shadow-lg ${isFirst ? 'shadow-yellow-500/30' : ''}`}
                    >
                        <div
                            className={`rounded-full bg-white dark:bg-gray-900 flex items-center justify-center font-bold text-gray-800 dark:text-white ${
                                isFirst ? 'h-20 w-20 text-2xl' : 'h-16 w-16 text-lg'
                                }`}
                        >
                            {user.initials}
                        </div>
                    </div>
                    {isCurrent && (
                        <Sparkles className="h-5 w-5 text-primary absolute -bottom-1 -right-1" />
                    )}
                </div>

                <div className="mt-3 text-center">
                    <p className={`font-bold ${isFirst ? 'text-lg' : 'text-sm'}`}>
                        {user.first_name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        {user.xp} XP
          </p>
                    <p className="text-[10px] text-gray-400">Level {user.level}</p>
                </div>
            </div>
        );
    };

    return (
        <div>
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-xl bg-gradient-primary">
                        <Trophy className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold">Leaderboard</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Top users by experience · {total_users}{' '}
                            {total_users === 1 ? 'player' : 'players'} total
            </p>
                    </div>
                </div>
            </div>

            {top_users.length >= 2 && (
                <div className="glass-card p-8 mb-8">
                    <div className="flex items-end justify-center gap-6 md:gap-12">
                        {second && <PodiumUser user={second} />}
                        {first && <PodiumUser user={first}/>}
                        {third && <PodiumUser user={third} />}
                    </div>
                </div>
            )}

            {top_users.length === 1 && (
                <div className="glass-card p-8 mb-8 flex justify-center">
                    <PodiumUser user={first}  />
                </div>
            )}

            {rest.length > 0 && (
                <div className="glass-card overflow-hidden mb-6">
                    <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 dark:bg-white/5 border-b border-gray-200 dark:border-white/10 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        <div className="col-span-2">Rank</div>
                        <div className="col-span-6">Player</div>
                        <div className="col-span-2 text-right">Level</div>
                        <div className="col-span-2 text-right">XP</div>
                    </div>

                    <div className="divide-y divide-gray-200 dark:divide-white/10">
                        {rest.map((user) => (
                            <div
                                key={user.id}
                                className={`grid grid-cols-12 gap-4 px-6 py-4 items-center transition-colors ${
                                    user.is_current_user
                                        ? 'bg-primary/5 dark:bg-primary/10'
                                        : 'hover:bg-gray-50 dark:hover:bg-white/5'
                                    }`}
                            >
                                <div className="col-span-2 flex items-center gap-2">
                                    <span className="text-sm font-bold text-gray-500">
                                        #{user.rank}
                                    </span>
                                    {getRankIcon(user.rank)}
                                </div>

                                <div className="col-span-6 flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-gradient-primary flex items-center justify-center text-white font-bold text-sm shrink-0">
                                        {user.initials}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium truncate">
                                            {user.first_name} {user.last_name}
                                            {user.is_current_user && (
                                                <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary font-semibold">
                                                    You
                        </span>
                                            )}
                                        </p>
                                    </div>
                                </div>

                                <div className="col-span-2 text-right">
                                    <p className="text-sm font-medium">Level {user.level}</p>
                                </div>

                                <div className="col-span-2 text-right">
                                    <p className="text-sm font-bold text-primary">
                                        {user.xp} XP
                  </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {current_user && current_rank && (
                <div className="glass-card p-5 border-l-4 border-primary">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-full bg-gradient-primary flex items-center justify-center text-white font-bold">
                                {current_user.initials}
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Your position
                </p>
                                <p className="font-bold">
                                    Rank #{current_rank} of {total_users}
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-2xl font-bold text-primary">
                                {current_user.xp} XP
              </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Level {current_user.level}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}