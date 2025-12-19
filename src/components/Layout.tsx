
import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Package, ShoppingCart, LogOut, FileText, Menu, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const Layout = () => {
    const location = useLocation();
    const { signOut } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const navItems = [
        { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/leads', icon: Users, label: 'Leads' },
        { path: '/products', icon: Package, label: 'Produtos' },
        { path: '/sales', icon: ShoppingCart, label: 'Vendas' },
        { path: '/invoices', icon: FileText, label: 'Notas Fiscais' },
    ];

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    return (
        <div className="min-h-screen bg-dark-bg flex text-white relative overflow-hidden">
            {/* Background Glows for the whole app */}
            <div className="fixed top-0 left-0 w-[500px] h-[500px] bg-brand-900/10 rounded-full blur-[120px] pointer-events-none" />

            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 w-full z-30 glass border-b border-brand-700/20 px-6 py-4 flex items-center justify-between">
                <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-brand-500 shadow-[0_0_10px_#8B9650]"></span>
                    Bons Frutos
                </h1>
                <button
                    onClick={toggleMobileMenu}
                    className="p-2 text-gray-400 hover:text-white bg-white/5 rounded-lg border border-brand-700/20"
                >
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Backdrop for Mobile */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-20 md:hidden backdrop-blur-sm"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar Navigation */}
            <aside className={`
                w-64 glass fixed h-screen z-30 flex flex-col border-r border-brand-700/20 transition-transform duration-300 ease-in-out
                ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
                md:translate-x-0 md:sticky md:top-0 md:h-screen
            `}>
                <div className="p-6 hidden md:block">
                    <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-brand-500 shadow-[0_0_10px_#8B9650]"></span>
                        Bons Frutos
                    </h1>
                </div>

                {/* Mobile Menu Header inside sidebar */}
                <div className="md:hidden p-6 flex justify-between items-center border-b border-brand-700/20 mb-4">
                    <span className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Menu</span>
                    <button onClick={() => setIsMobileMenuOpen(false)} className="text-gray-400 hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                {/* Navigation items at top */}
                <nav className="px-4 space-y-2 pb-4">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setIsMobileMenuOpen(false)}
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

                {/* Spacer to push Sair button to bottom */}
                <div className="flex-1" />

                {/* Sair button at absolute bottom */}
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

            {/* Main Content Area */}
            <main className="flex-1 relative z-10 overflow-y-auto h-screen md:h-auto pt-[72px] md:pt-0">
                <Outlet />
            </main>
        </div>
    );
};
