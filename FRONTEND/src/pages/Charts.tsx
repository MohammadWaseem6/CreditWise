import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import api from '../utils/api';
import { BarChart3, TrendingDown, PieChart, Activity } from 'lucide-react';
import {
    LineChart, Line, BarChart, Bar, PieChart as RechartsPie, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import type { ChartsResponse } from '../types/types';

const COLORS = ['#6C3CE1', '#E83E8C', '#00D4FF', '#F59E0B', '#10B981', '#EF4444'];

const GRID_STROKE = 'rgba(156, 163, 175, 0.15)';
const AXIS_STROKE = '#9CA3AF';

const tooltipStyle = {
    contentStyle: {
        background: 'rgba(17, 24, 39, 0.96)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '12px',
        boxShadow: '0 12px 32px rgba(0, 0, 0, 0.35)',
        color: 'white',
        padding: '10px 14px',
        fontSize: '13px',
    },
    labelStyle: { color: '#9CA3AF', marginBottom: 4, fontSize: 12 },
    itemStyle: { color: 'white', fontWeight: 600 },
    cursor: { stroke: 'rgba(108, 60, 225, 0.25)', fill: 'rgba(108, 60, 225, 0.06)' },
};

const money = (n: number) =>
    `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const compact = (n: number) =>
    n >= 1000 ? `$${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k` : `$${n}`;

interface StatCardProps {
    label: string;
    value: string;
    icon: ReactNode;
    tint: string;
}

function StatCard({ label, value, icon, tint }: StatCardProps) {
    return (
        <div className="glass-card relative overflow-hidden p-5">
            <div
                className="absolute inset-y-0 left-0 w-1"
                style={{ background: tint }}
            />
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        {label}
                    </p>
                    <p className="mt-2 text-3xl font-bold tracking-tight tabular-nums">
                        {value}
                    </p>
                </div>
                <div
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                    style={{ background: `${tint}1F`, color: tint }}
                >
                    {icon}
                </div>
            </div>
        </div>
    );
}

interface ChartCardProps {
    title: string;
    subtitle: string;
    icon: ReactNode;
    tint: string;
    className?: string;
    children: ReactNode;
}

function ChartCard({ title, subtitle, icon, tint, className = '', children }: ChartCardProps) {
    return (
        <div className={`glass-card p-6 ${className}`}>
            <div className="mb-6 flex items-center gap-3">
                <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl"
                    style={{ background: `${tint}1F`, color: tint }}
                >
                    {icon}
                </div>
                <div>
                    <h2 className="text-lg font-semibold leading-tight">{title}</h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>
                </div>
            </div>
            {children}
        </div>
    );
}

export default function Charts() {
    const [data, setData] = useState<ChartsResponse | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCharts = async () => {
            try {
                const res = await api.get<ChartsResponse>('/charts/');
                setData(res.data);
            } catch (err) {
                console.error('Failed to fetch charts:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchCharts();
    }, []);

    if (loading || !data) {
        return (
            <div className="flex h-64 flex-col items-center justify-center gap-3">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                <p className="text-sm text-gray-500 dark:text-gray-400">Loading charts…</p>
            </div>
        );
    }

    const hasPayments = data.totals.payment_count > 0;
    const hasCards = data.card_distribution.length > 0;

    return (
        <div className="mx-auto max-w-7xl">
            {/* Header */}
            <header className="mb-8 flex items-center gap-4">
                <div className="rounded-2xl bg-gradient-primary p-3 shadow-lg shadow-primary/30">
                    <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Charts</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Visual analytics of your finances
                    </p>
                </div>
            </header>

            {/* Summary */}
            <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
                <StatCard
                    label="Current debt"
                    value={money(data.totals.total_debt)}
                    icon={<TrendingDown className="h-5 w-5" />}
                    tint="#EF4444"
                />
                <StatCard
                    label="Total paid"
                    value={money(data.totals.total_paid)}
                    icon={<Activity className="h-5 w-5" />}
                    tint="#10B981"
                />
                <StatCard
                    label="Payments"
                    value={String(data.totals.payment_count)}
                    icon={<BarChart3 className="h-5 w-5" />}
                    tint="#6C3CE1"
                />
            </div>

            {/* Empty state */}
            {!hasCards && !hasPayments && (
                <div className="glass-card p-12 text-center">
                    <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 dark:bg-white/5">
                        <BarChart3 className="h-10 w-10 text-gray-400" />
                    </div>
                    <h3 className="mb-2 text-xl font-bold">No data yet</h3>
                    <p className="mx-auto max-w-sm text-gray-500 dark:text-gray-400">
                        Add cards and log payments to see charts
                    </p>
                </div>
            )}

            {/* Debt trend */}
            {hasPayments && data.debt_trend.length > 1 && (
                <ChartCard
                    title="Debt over time"
                    subtitle="How your balance has changed with each payment"
                    icon={<TrendingDown className="h-5 w-5" />}
                    tint="#6C3CE1"
                    className="mb-6"
                >
                    <ResponsiveContainer width="100%" height={320}>
                        <LineChart data={data.debt_trend} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="debtLine" x1="0" y1="0" x2="1" y2="0">
                                    <stop offset="0%" stopColor="#6C3CE1" />
                                    <stop offset="100%" stopColor="#E83E8C" />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} vertical={false} />
                            <XAxis
                                dataKey="date"
                                stroke={AXIS_STROKE}
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickMargin={10}
                            />
                            <YAxis
                                stroke={AXIS_STROKE}
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(v: number) => compact(v)}
                                width={56}
                            />
                            <Tooltip
                                {...tooltipStyle}
                                formatter={(value: number) => [money(value), 'Debt']}
                            />
                            <Line
                                type="monotone"
                                dataKey="debt"
                                stroke="url(#debtLine)"
                                strokeWidth={3}
                                dot={{ fill: '#fff', stroke: '#6C3CE1', strokeWidth: 2, r: 4 }}
                                activeDot={{ r: 7, fill: '#6C3CE1', stroke: '#fff', strokeWidth: 2 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </ChartCard>
            )}

            {/* Monthly payments + debt by card */}
            {hasPayments && (
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <ChartCard
                        title="Monthly payments"
                        subtitle="Total paid in each month"
                        icon={<BarChart3 className="h-5 w-5" />}
                        tint="#E83E8C"
                    >
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={data.monthly_payments} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="paymentBar" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#E83E8C" />
                                        <stop offset="100%" stopColor="#6C3CE1" stopOpacity={0.85} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} vertical={false} />
                                <XAxis
                                    dataKey="month"
                                    stroke={AXIS_STROKE}
                                    fontSize={11}
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={10}
                                />
                                <YAxis
                                    stroke={AXIS_STROKE}
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(v: number) => compact(v)}
                                    width={56}
                                />
                                <Tooltip
                                    {...tooltipStyle}
                                    cursor={{ fill: 'rgba(232, 62, 140, 0.08)' }}
                                    formatter={(value: number) => [money(value), 'Paid']}
                                />
                                <Bar
                                    dataKey="amount"
                                    fill="url(#paymentBar)"
                                    radius={[8, 8, 0, 0]}
                                    maxBarSize={44}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartCard>

                    {hasCards && (
                        <ChartCard
                            title="Debt by card"
                            subtitle="Share of your balance held on each card"
                            icon={<PieChart className="h-5 w-5" />}
                            tint="#00D4FF"
                        >
                            <ResponsiveContainer width="100%" height={300}>
                                <RechartsPie>
                                    <Pie
                                        data={data.card_distribution}
                                        dataKey="balance"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={100}
                                        innerRadius={62}
                                        paddingAngle={3}
                                        cornerRadius={6}
                                        stroke="none"
                                        label={(entry) => `${entry.name}: ${compact(Math.round(entry.balance))}`}
                                        labelLine={false}
                                    >
                                        {data.card_distribution.map((_, index) => (
                                            <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        {...tooltipStyle}
                                        formatter={(value: number) => money(value)}
                                    />
                                    <Legend
                                        iconType="circle"
                                        iconSize={8}
                                        wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                                    />
                                </RechartsPie>
                            </ResponsiveContainer>
                        </ChartCard>
                    )}
                </div>
            )}
        </div>
    );
}