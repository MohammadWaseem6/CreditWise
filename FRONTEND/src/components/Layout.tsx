import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard, CreditCard, Trophy, LogOut, Sun, Moon,
    Receipt, User, Calculator, TrendingUp, BarChart3, Menu, X,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import logo from "../assets/creditwise-logo.png"

export default function Layout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isDark, setIsDark] = useState(() => localStorage.getItem('theme') === 'dark');
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        if (isDark) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDark]);

    useEffect(() => {
        setSidebarOpen(false);
    }, [location.pathname]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
        { icon: CreditCard, label: 'Cards', path: '/cards' },
        { icon: Receipt, label: 'Payments', path: '/payments' },
        { icon: Calculator, label: 'Simulator', path: '/simulator' },
        { icon: BarChart3, label: 'Charts', path: '/charts' },
        { icon: Trophy, label: 'Badges', path: '/badges' },
        { icon: TrendingUp, label: 'Leaderboard', path: '/leaderboard' },
        { icon: User, label: 'Profile', path: '/profile' },
    ];

    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-[#0b0e14]">
            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed left-0 top-0 z-50 flex h-full w-64 flex-col border-r border-gray-200/80 bg-white/95 p-6 backdrop-blur-xl transition-transform duration-300 dark:border-white/10 dark:bg-[#0b0e14]/95 lg:bg-white/80 lg:dark:bg-white/[0.03] ${
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                    }`}
            >
                <div className="flex items-center justify-between mb-8 lg:mb-10">
                    <Link to="/dashboard" className="flex items-center gap-3">
                        <img src={logo} alt="CreditWise" className="h-full w-full shrink-0" />
                        <span className="text-2xl font-bold tracking-tight text-gray-800 dark:text-white">
                            
                        </span>
                    </Link>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden p-2 rounded-lg hover:bg-white/10"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <nav className="flex-1 space-y-1.5 overflow-y-auto">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                                    isActive
                                        ? 'bg-gradient-primary text-white shadow-lg shadow-primary/30'
                                        : 'text-gray-600 hover:bg-primary/10 hover:text-primary dark:text-gray-300 dark:hover:bg-white/8 dark:hover:text-white'
                                    }`}
                            >
                                <Icon className="h-5 w-5 shrink-0" />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="mt-4 space-y-3 border-t border-gray-200/80 pt-4 dark:border-white/10">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/5">
                        <div className="h-9 w-9 rounded-full bg-gradient-primary flex items-center justify-center text-white font-bold shrink-0">
                            {user ?.first_name ?.[0]}{user ?.last_name ?.[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                                {user ?.first_name} {user ?.last_name}
                            </p>
                            <p className="text-xs opacity-60">
                                Level {user ?.level} • {user ?.xp} XP
              </p>
                        </div>
                    </div>

                    <button
                        onClick={() => setIsDark(!isDark)}
                        className="flex items-center justify-center gap-2 w-full py-2 rounded-xl text-sm hover:bg-primary/10 dark:hover:bg-white/5 transition-all"
                    >
                        {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                        {isDark ? 'Light Mode' : 'Dark Mode'}
                    </button>

                    <button
                        onClick={handleLogout}
                        className="flex items-center justify-center gap-2 w-full py-2 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-all"
                    >
                        <LogOut className="h-4 w-4" />
                        Logout
          </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 lg:ml-64 w-full">
                {/* Mobile Top Bar */}
                <div className="lg:hidden sticky top-0 z-30 flex items-center justify-between p-4 bg-white/80 dark:bg-[#0b0e14]/80 backdrop-blur-xl border-b border-gray-200/80 dark:border-white/10">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="p-2 rounded-xl hover:bg-primary/10 dark:hover:bg-white/5"
                    >
                        <Menu className="h-6 w-6" />
                    </button>
                    <Link to="/dashboard" className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-gradient-primary" />
                        <span className="text-lg font-bold gradient-text">CreditWise</span>
                    </Link>
                    <div className="h-9 w-9 rounded-full bg-gradient-primary flex items-center justify-center text-white font-bold text-sm">
                        {user ?.first_name ?.[0]}{user ?.last_name ?.[0]}
                    </div>
                </div>

                {/* Page Content */}
                <main className="p-4 md:p-6 lg:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}