// ============================================================
// src/pages/Badges.tsx
// PURPOSE: Display earned + locked badges with Lucide icons
// ============================================================

import { useEffect, useState } from 'react';
import api from '../utils/api';
import type { BadgesResponse } from '../types/types';
import {
  Trophy, Lock, Sparkles,
  CreditCard, Send, Flame, Swords, PiggyBank,
  Star, Crown, PartyPopper, TrendingUp, Layers,
  Award,
} from 'lucide-react';

// ---------- ICON MAP ----------
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

export default function Badges() {
  const [data, setData] = useState<BadgesResponse | null>(null);
  const [loading, setLoading] = useState(true);

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
      {/* HEADER */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-500">
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

      {/* PROGRESS */}
      <div className="glass-card p-6 mb-8">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-medium">Overall Progress</span>
          <span className="text-sm font-bold text-primary">
            {progressPercent}%
          </span>
        </div>
        <div className="w-full h-3 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary via-secondary to-accent transition-all duration-700"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* NEWLY AWARDED */}
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

      {/* EARNED */}
      {data.earned.length > 0 && (
        <div className="mb-10">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500" />
            Earned ({data.earned.length})
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {data.earned.map((badge) => {
              const Icon = getIcon(badge.icon);
              return (
                <div
                  key={badge.name}
                  className="group relative glass-card p-6 text-center hover:scale-105 transition-all duration-300 cursor-pointer overflow-hidden"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${badge.color} opacity-0 group-hover:opacity-10 transition-opacity`} />

                  <div className="relative inline-flex mb-4">
                    <div className={`p-4 rounded-2xl bg-gradient-to-br ${badge.color} shadow-lg`}>
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-green-500 border-2 border-white dark:border-gray-900" />
                  </div>

                  <h3 className="font-bold mb-1">{badge.name}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                    {badge.description}
                  </p>
                  <p className="text-[10px] text-gray-400">
                    {new Date(badge.earned_at).toLocaleDateString()}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* LOCKED */}
      {data.available.length > 0 && (
        <div>
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-gray-400" />
            Locked ({data.available.length})
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {data.available.map((badge) => {
              const Icon = getIcon(badge.icon);
              return (
                <div
                  key={badge.name}
                  className="group relative glass-card p-6 text-center opacity-70 hover:opacity-100 transition-all duration-300 cursor-pointer"
                >
                  <div className="relative inline-flex mb-4">
                    <div className="p-4 rounded-2xl bg-gray-200 dark:bg-white/10">
                      <Icon className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                    </div>
                    <div className="absolute -top-1 -right-1 p-1 rounded-full bg-white dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-700">
                      <Lock className="h-3 w-3 text-gray-500" />
                    </div>
                  </div>

                  <h3 className="font-bold mb-1 text-gray-600 dark:text-gray-300">
                    {badge.name}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                    {badge.description}
                  </p>

                  <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-[10px] font-semibold">
                    <span className="h-1 w-1 rounded-full bg-primary" />
                    {badge.requirement}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ALL DONE */}
      {data.available.length === 0 && data.earned.length > 0 && (
        <div className="glass-card p-12 text-center">
          <div className="inline-flex p-6 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 mb-4">
            <Crown className="h-12 w-12 text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-2">All badges unlocked!</h2>
          <p className="text-gray-500 dark:text-gray-400">
            You're a CreditWise master!
          </p>
        </div>
      )}
    </div>
  );
}