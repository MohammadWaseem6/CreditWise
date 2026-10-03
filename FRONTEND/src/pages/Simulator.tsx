import { useEffect, useState } from 'react';
import api from '../utils/api';
import {
  Calculator, Calendar, TrendingDown, Sparkles,
  AlertCircle, CreditCard as CardIcon,
} from 'lucide-react';
import type { SimulatorResponse } from '../types/types';

export default function Simulator() {
  const [payment, setPayment] = useState(200);
  const [data, setData] = useState<SimulatorResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchSimulation = async (amount: number, isInitial = false) => {
    if (isInitial) setLoading(true);
    else setUpdating(true);

    try {
      const res = await api.get<SimulatorResponse>(
        `/simulator/?monthly_payment=${amount}`
      );
      setData(res.data);
    } catch (err) {
      console.error('Failed to fetch simulation:', err);
    } finally {
      setLoading(false);
      setUpdating(false);
    }
  };

  useEffect(() => {
    fetchSimulation(200, true);
  }, []);

  useEffect(() => {
    if (loading) return;

    const timer = setTimeout(() => {
      fetchSimulation(payment);
    }, 300);

    return () => clearTimeout(timer);
  }, [payment]);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (data.total_debt === 0) {
    return (
      <div>
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-gradient-primary">
              <Calculator className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Payoff Simulator</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Plan your path to debt freedom
              </p>
            </div>
          </div>
        </div>

        <div className="glass-card p-12 text-center">
          <div className="inline-flex p-6 rounded-full bg-green-500/10 mb-4">
            <Sparkles className="h-12 w-12 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold mb-2">You're Debt Free!</h2>
          <p className="text-gray-500 dark:text-gray-400">
            No active balances to simulate. Great job!
          </p>
        </div>
      </div>
    );
  }

  const sliderMax = Math.max(Math.ceil(data.total_debt / 5), 500);
  const sliderStep = 25;

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-xl bg-gradient-primary">
            <Calculator className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Payoff Simulator</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Plan your path to debt freedom
            </p>
          </div>
        </div>
      </div>

      <div className="glass-card p-8 mb-6">
        <div className="flex justify-between items-end mb-6">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              Monthly Payment
            </p>
            <p className="text-5xl font-bold text-primary">
              ${payment}
              <span className="text-2xl text-gray-400">/mo</span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Total Debt
            </p>
            <p className="text-xl font-bold">
              ${data.total_debt.toFixed(2)}
            </p>
          </div>
        </div>

        <input
          type="range"
          min={25}
          max={sliderMax}
          step={sliderStep}
          value={payment}
          onChange={(e) => setPayment(Number(e.target.value))}
          className="w-full h-2 rounded-full appearance-none cursor-pointer bg-gray-200 dark:bg-white/10"
          style={{
            background: `linear-gradient(to right, #6C3CE1 0%, #E83E8C ${
              ((payment - 25) / (sliderMax - 25)) * 100
            }%, rgba(156, 163, 175, 0.2) ${
              ((payment - 25) / (sliderMax - 25)) * 100
            }%, rgba(156, 163, 175, 0.2) 100%)`,
          }}
        />

        <div className="flex justify-between text-xs text-gray-400 mt-2">
          <span>$25</span>
          <span>${sliderMax}</span>
        </div>

        <div className="flex gap-2 mt-6 flex-wrap">
          {[100, 200, 300, 500, 1000].map((preset) => (
            <button
              key={preset}
              onClick={() => setPayment(preset)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                payment === preset
                  ? 'bg-gradient-primary text-white'
                  : 'bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10'
              }`}
            >
              ${preset}
            </button>
          ))}
        </div>
      </div>

      {updating && (
        <div className="mb-4 text-center text-sm text-gray-500">
          Updating...
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="h-5 w-5 text-primary" />
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Debt-Free In
            </span>
          </div>
          <p className="text-4xl font-bold text-primary">
            {data.total_months}
            <span className="text-lg text-gray-400 ml-1">months</span>
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {data.payoff_date}
          </p>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-3">
            <TrendingDown className="h-5 w-5 text-red-400" />
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Total Interest
            </span>
          </div>
          <p className="text-4xl font-bold text-red-400">
            ${data.total_interest.toFixed(2)}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Extra you'll pay
          </p>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-5 w-5 text-amber-500" />
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Total Paid
            </span>
          </div>
          <p className="text-4xl font-bold text-amber-500">
            ${data.total_paid.toFixed(2)}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Debt + interest
          </p>
        </div>
      </div>

      {data.minimum_scenario && (
        <div className="glass-card p-6 mb-6 border-l-4 border-amber-500">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
            <div className="flex-1">
              <h3 className="font-bold mb-2">
                If you pay only the minimum (${data.minimum_payment.toFixed(2)}/mo):
              </h3>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-xs mb-1">
                    Payoff time
                  </p>
                  <p className="font-bold">
                    {data.minimum_scenario.months} months
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-xs mb-1">
                    Interest paid
                  </p>
                  <p className="font-bold text-red-400">
                    ${data.minimum_scenario.interest.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-xs mb-1">
                    You save
                  </p>
                  <p className="font-bold text-green-500">
                    ${data.savings.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {data.cards.length > 0 && (
        <div>
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <CardIcon className="h-5 w-5 text-primary" />
            Breakdown by Card
          </h2>
          <div className="glass-card overflow-hidden">
            <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 dark:bg-white/5 border-b border-gray-200 dark:border-white/10 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              <div className="col-span-4">Card</div>
              <div className="col-span-2 text-right">Balance</div>
              <div className="col-span-2 text-right">Payment</div>
              <div className="col-span-2 text-right">Months</div>
              <div className="col-span-2 text-right">Interest</div>
            </div>

            <div className="divide-y divide-gray-200 dark:divide-white/10">
              {data.cards.map((card, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-gray-50 dark:hover:bg-white/5"
                >
                  <div className="col-span-4">
                    <p className="text-sm font-medium">{card.card_name}</p>
                    <p className="text-xs text-gray-500">
                      •••• {card.last_four} • {card.apr}% APR
                    </p>
                  </div>
                  <div className="col-span-2 text-right">
                    <p className="text-sm font-medium">
                      ${card.balance.toFixed(2)}
                    </p>
                  </div>
                  <div className="col-span-2 text-right">
                    <p className="text-sm font-medium text-primary">
                      ${card.payment.toFixed(2)}
                    </p>
                  </div>
                  <div className="col-span-2 text-right">
                    <p className="text-sm font-medium">
                      {card.months ?? '∞'}
                    </p>
                  </div>
                  <div className="col-span-2 text-right">
                    <p className="text-sm font-medium text-red-400">
                      ${card.interest?.toFixed(2) ?? '∞'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}