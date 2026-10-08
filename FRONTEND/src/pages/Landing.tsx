import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CreditCard, Calculator, Trophy, BarChart3, TrendingUp, Shield, ArrowRight, Sparkles } from 'lucide-react';

const FEATURES = [
  { icon: CreditCard, title: 'Card Management', description: 'Track all your credit cards in one place with realistic visuals.', color: 'from-blue-500 to-cyan-500' },
  { icon: Calculator, title: 'Payoff Simulator', description: 'See exactly when you will be debt-free with our calculator.', color: 'from-purple-500 to-pink-500' },
  { icon: Trophy, title: 'Gamification', description: 'Earn XP, unlock badges, and level up as you pay off debt.', color: 'from-yellow-500 to-orange-500' },
  { icon: BarChart3, title: 'Smart Analytics', description: 'Visualize spending trends, debt distribution, and history.', color: 'from-green-500 to-emerald-500' },
  { icon: TrendingUp, title: 'Leaderboard', description: 'Compete with other users and climb to the top.', color: 'from-pink-500 to-rose-500' },
  { icon: Shield, title: 'Secure', description: 'JWT authentication with bcrypt password hashing.', color: 'from-indigo-500 to-purple-500' },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0b0e14] overflow-hidden">
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-[#0b0e14]/80 border-b border-gray-200/80 dark:border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-600 via-pink-500 to-cyan-500 shadow-lg flex items-center justify-center">
              <span className="text-white font-black text-lg">CW</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
              CreditWise
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5">
              Sign In
            </Link>
            <Link to="/register" className="px-5 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-purple-600 to-pink-500 text-white hover:opacity-90 shadow-lg">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <section className="relative pt-32 pb-20 px-6">
        <div className="absolute top-20 -left-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
        <div className="absolute top-40 -right-20 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl" />

        <div className="relative max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 mb-6"
          >
            <Sparkles className="h-4 w-4 text-purple-500" />
            <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
              Gamified Finance Tracker
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-black tracking-tight mb-6"
          >
            <span className="text-gray-900 dark:text-white">Take control of</span>
            <br />
            <span className="bg-gradient-to-r from-purple-600 via-pink-500 to-cyan-500 bg-clip-text text-transparent">
              your credit cards
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-10"
          >
            Track every card. Log every payment. Earn XP and badges as you pay off your debt.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link to="/register" className="group inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-semibold bg-gradient-to-r from-purple-600 to-pink-500 text-white hover:opacity-90 shadow-lg">
              Start Free Today
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/login" className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-semibold border-2 border-gray-200 dark:border-white/10 text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-white/5">
              Sign In
            </Link>
          </motion.div>
        </div>
      </section>

      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4 text-gray-900 dark:text-white">
              Everything you need
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Powerful features wrapped in a beautiful interface.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="group p-6 rounded-2xl bg-white dark:bg-white/5 border border-gray-200/80 dark:border-white/10 hover:shadow-2xl hover:-translate-y-1 transition-all"
                >
                  <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.color} shadow-lg mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">{feature.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto rounded-3xl bg-gradient-to-br from-purple-600 via-pink-500 to-cyan-500 p-1 shadow-2xl">
          <div className="rounded-3xl bg-white dark:bg-[#0b0e14] p-12 md:p-16 text-center">
            <h2 className="text-4xl md:text-5xl font-black mb-4 text-gray-900 dark:text-white">
              Ready to take control?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
              Join CreditWise today. It's free and fun.
            </p>
            <Link to="/register" className="group inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-semibold bg-gradient-to-r from-purple-600 to-pink-500 text-white hover:opacity-90 shadow-lg">
              Get Started Free
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-gray-200/80 dark:border-white/10 py-12 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Built with React, FastAPI, and PostgreSQL
          </p>
        </div>
      </footer>
    </div>
  );
}