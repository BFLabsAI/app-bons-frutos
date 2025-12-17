
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Package, ShoppingCart, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const Layout = () => {
    const location = useLocation();
    const { signOut } = useAuth();

    const navItems = [
        { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/leads', icon: Users, label: 'Leads' },
        { path: '/products', icon: Package, label: 'Produtos' },
        { path: '/sales', icon: ShoppingCart, label: 'Vendas' },
    ];

    return (
        <div className="min-h-screen bg-dark-bg flex text-white relative overflow-hidden">
            {/* Background Glows for the whole app */}
            <div className="fixed top-0 left-0 w-[500px] h-[500px] bg-brand-900/10 rounded-full blur-[120px] pointer-events-none" />

            <aside className="w-64 glass fixed h-full z-20 hidden md:flex flex-col border-r border-brand-700/20">
                <div className="p-6">
                    <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-brand-500 shadow-[0_0_10px_#8B9650]"></span>
                        Bons Frutos
                    </h1>
                </div>

                <nav className="flex-1 px-4 space-y-2">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 group
                  ${isActive
                                        ? 'bg-brand-500/10 text-brand-400 border border-brand-500/20 shadow-[0_0_15px_rgba(139,150,80,0.1)]'
                                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <Icon size={20} className={isActive ? 'text-brand-400 drop-shadow-[0_0_5px_rgba(139,150,80,0.5)]' : ''} />
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-brand-700/20">
                    <button
                        onClick={() => signOut()}
                        className="flex items-center gap-3 px-4 py-3 w-full text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                    >
                        <LogOut size={20} />
                        <span>Sair</span>
                    </button>
                </div>
            </aside>

            <main className="flex-1 md:ml-64 relative z-10">
                <Outlet />
            </main>
        </div>
    );
};
