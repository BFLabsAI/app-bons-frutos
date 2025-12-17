import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { DollarSign, Users, ShoppingBag } from 'lucide-react';

export default function Dashboard() {
    const [stats, setStats] = useState({
        totalSales: 0,
        leadsCount: 0,
        salesCount: 0
    });
    const [recentSales, setRecentSales] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            // 1. Leads Count
            const { count: leadsCount, error: leadsError } = await supabase
                .from('leads_bons_frutos')
                .select('*', { count: 'exact', head: true });

            // 2. Sales Data (Total Amount and Count)
            const { data: salesData, error: salesError } = await supabase
                .from('sales_bons_frutos')
                .select('total_amount');

            const totalSales = salesData?.reduce((acc, curr) => acc + (curr.total_amount || 0), 0) || 0;
            const salesCount = salesData?.length || 0;

            setStats({
                leadsCount: leadsCount || 0,
                totalSales,
                salesCount
            });

            // 3. Recent Sales
            const { data: recent, error: recentError } = await supabase
                .from('sales_bons_frutos')
                .select('*, leads:leads_bons_frutos(name)')
                .order('created_at', { ascending: false })
                .limit(5);

            if (recent) setRecentSales(recent);

            if (leadsError) console.error("Leads Error:", leadsError);
            if (salesError) console.error("Sales Error:", salesError);
            if (recentError) console.error("Recent Sales Error:", recentError);

        } catch (error) {
            console.error('Error loading dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 space-y-8">
            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group">
                    <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <DollarSign size={100} />
                    </div>
                    <div className="relative z-10">
                        <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">Total Vendido</p>
                        <h3 className="text-3xl font-bold text-white mt-1">
                            {loading ? '...' : `R$ ${stats.totalSales.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                        </h3>
                    </div>
                </div>

                <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group">
                    <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Users size={100} />
                    </div>
                    <div className="relative z-10">
                        <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">Novos Leads</p>
                        <h3 className="text-3xl font-bold text-white mt-1">
                            {loading ? '...' : stats.leadsCount}
                        </h3>
                    </div>
                </div>

                <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group">
                    <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <ShoppingBag size={100} />
                    </div>
                    <div className="relative z-10">
                        <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">Vendas Realizadas</p>
                        <h3 className="text-3xl font-bold text-white mt-1">
                            {loading ? '...' : stats.salesCount}
                        </h3>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Chart Placeholder */}
                <div className="lg:col-span-2 glass-panel p-6 rounded-2xl">
                    <h3 className="text-xl font-semibold text-white mb-6">Faturamento Mensal</h3>
                    <div className="h-[300px] w-full flex flex-col items-center justify-center text-gray-500 border border-brand-700/30 rounded-xl bg-black/20">
                        <p>Gráfico temporariamente desativado para estabilidade.</p>
                        <p className="text-xs mt-2 opacity-50">(Em manutenção)</p>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="glass-panel p-6 rounded-2xl">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-semibold text-white">Últimas Vendas</h3>
                        <button onClick={fetchDashboardData} className="text-xs text-brand-400 hover:text-brand-300">Atualizar</button>
                    </div>

                    <div className="space-y-4">
                        {loading ? (
                            <p className="text-gray-500 text-center py-4">Carregando...</p>
                        ) : recentSales.length === 0 ? (
                            <p className="text-gray-500 text-center py-4">Nenhuma venda recente.</p>
                        ) : (
                            recentSales.map((sale) => (
                                <div key={sale.id} className="flex items-center justify-between border-b border-brand-700/20 pb-3 last:border-0 last:pb-0">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-brand-700/30 flex items-center justify-center text-brand-400 text-xs font-bold">
                                            {sale.leads?.name?.substring(0, 2).toUpperCase() || 'C'}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-white">{sale.leads?.name || 'Cliente Removido'}</p>
                                            <p className="text-xs text-gray-500">
                                                {new Date(sale.created_at).toLocaleDateString('pt-BR')}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-white">
                                            R$ {sale.total_amount?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </p>
                                        <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full ${sale.status === 'Pago' ? 'text-green-400 bg-green-900/20' : 'text-yellow-400 bg-yellow-900/20'
                                            }`}>
                                            {sale.status}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
