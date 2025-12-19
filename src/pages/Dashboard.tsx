import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { DollarSign, Users, ShoppingBag, TrendingUp, UserPlus, Calendar, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
    const [stats, setStats] = useState({
        totalSales: 0,
        totalLeads: 0,
        totalSalesCount: 0,
        newLeadsMonth: 0,
        salesMonthCount: 0,
        salesMonthAmount: 0,
        // Comparisons (percentage change)
        leadsChange: 0,
        salesCountChange: 0,
        salesAmountChange: 0
    });
    const [recentSales, setRecentSales] = useState<any[]>([]);
    const [chartData, setChartData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const now = new Date();
            const currentYear = now.getFullYear();
            const currentMonth = now.getMonth();

            // Dates for Current Month
            const startCurrentMonth = new Date(currentYear, currentMonth, 1).toISOString();

            // Dates for Last Month
            const startLastMonth = new Date(currentYear, currentMonth - 1, 1).toISOString();
            const endLastMonth = new Date(currentYear, currentMonth, 0).toISOString(); // Last day of previous month

            // 1. Total Leads & New Leads (Current vs Last Month)
            const { data: allLeads } = await supabase.from('leads_bons_frutos').select('created_at');

            const totalLeads = allLeads?.length || 0;
            const newLeadsCurr = allLeads?.filter(l => l.created_at >= startCurrentMonth).length || 0;
            const newLeadsLast = allLeads?.filter(l => l.created_at >= startLastMonth && l.created_at <= endLastMonth).length || 0;

            const leadsChange = calculateChange(newLeadsCurr, newLeadsLast);

            // 2. Sales Data (Current vs Last Month + Total + Chart Data)
            const { data: allSales } = await supabase
                .from('sales_bons_frutos')
                .select('total_amount, sale_date');

            const totalSalesCount = allSales?.length || 0;
            const totalSales = allSales?.reduce((acc, curr) => acc + (curr.total_amount || 0), 0) || 0;

            const salesCurr = allSales?.filter(s => s.sale_date >= startCurrentMonth) || [];
            const salesLast = allSales?.filter(s => s.sale_date >= startLastMonth && s.sale_date <= endLastMonth) || [];

            const salesMonthCount = salesCurr.length;
            const salesMonthAmount = salesCurr.reduce((acc, curr) => acc + (curr.total_amount || 0), 0);

            const salesLastCount = salesLast.length;
            const salesLastAmount = salesLast.reduce((acc, curr) => acc + (curr.total_amount || 0), 0);

            const salesCountChange = calculateChange(salesMonthCount, salesLastCount);
            const salesAmountChange = calculateChange(salesMonthAmount, salesLastAmount);

            // 3. Prepare Chart Data (Last 6 Months)
            const monthlyData = processChartData(allSales || []);

            setStats({
                totalLeads,
                newLeadsMonth: newLeadsCurr,
                totalSalesCount,
                totalSales,
                salesMonthCount,
                salesMonthAmount,
                leadsChange,
                salesCountChange,
                salesAmountChange
            });
            setChartData(monthlyData);

            // 4. Recent Sales
            const { data: recent } = await supabase
                .from('sales_bons_frutos')
                .select('*, leads:leads_bons_frutos(name)')
                .order('sale_date', { ascending: false })
                .limit(5);

            if (recent) setRecentSales(recent);

        } catch (error) {
            console.error('Error loading dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateChange = (current: number, previous: number) => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return ((current - previous) / previous) * 100;
    };

    const processChartData = (sales: any[]) => {
        const data: any[] = [];
        const today = new Date();

        // Generate last 6 months placeholders
        for (let i = 5; i >= 0; i--) {
            const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const monthName = date.toLocaleDateString('pt-BR', { month: 'short' });
            data.push({
                name: monthName.charAt(0).toUpperCase() + monthName.slice(1), // Capitalize
                monthIndex: date.getMonth(),
                year: date.getFullYear(),
                value: 0
            });
        }

        // Fill with data
        sales.forEach(sale => {
            if (!sale.sale_date) return;
            const saleDate = new Date(sale.sale_date);
            const match = data.find(d => d.monthIndex === saleDate.getMonth() && d.year === saleDate.getFullYear());
            if (match) {
                match.value += (sale.total_amount || 0);
            }
        });

        return data; // Returns [{name: 'Jan', value: 1000}, ...]
    };

    const ComparisonBadge = ({ val }: { val: number }) => {
        const isPositive = val >= 0;
        return (
            <div className={`flex items-center text-xs font-medium ml-2 px-1.5 py-0.5 rounded-full ${isPositive ? 'text-green-400 bg-green-500/10' : 'text-red-400 bg-red-500/10'
                }`}>
                {isPositive ? <ArrowUpRight size={12} className="mr-1" /> : <ArrowDownRight size={12} className="mr-1" />}
                {Math.abs(val).toFixed(0)}%
            </div>
        );
    };

    return (
        <div className="p-8 space-y-8">
            {/* KPIs - 6 cards: Month metrics on top, Totals on bottom */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Row 1: Month Metrics */}
                {/* New Leads This Month */}
                <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group">
                    <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <UserPlus size={100} />
                    </div>
                    <div className="relative z-10">
                        <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">Novos Leads (Mês)</p>
                        <div className="flex items-end mt-1">
                            <h3 className="text-3xl font-bold text-white">
                                {loading ? '...' : stats.newLeadsMonth}
                            </h3>
                            {!loading && <ComparisonBadge val={stats.leadsChange} />}
                        </div>
                    </div>
                </div>

                {/* Sales This Month (Count) */}
                <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group">
                    <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Calendar size={100} />
                    </div>
                    <div className="relative z-10">
                        <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">Vendas do Mês (Qtd)</p>
                        <div className="flex items-end mt-1">
                            <h3 className="text-3xl font-bold text-white">
                                {loading ? '...' : stats.salesMonthCount}
                            </h3>
                            {!loading && <ComparisonBadge val={stats.salesCountChange} />}
                        </div>
                    </div>
                </div>

                {/* Sales This Month (Amount) */}
                <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group">
                    <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <TrendingUp size={100} />
                    </div>
                    <div className="relative z-10">
                        <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">Vendas do Mês (R$)</p>
                        <div className="flex items-end mt-1">
                            <h3 className="text-3xl font-bold text-white">
                                {loading ? '...' : `R$ ${stats.salesMonthAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                            </h3>
                            {!loading && <ComparisonBadge val={stats.salesAmountChange} />}
                        </div>
                    </div>
                </div>

                {/* Row 2: Total Metrics */}
                {/* Total Leads */}
                <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group">
                    <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Users size={100} />
                    </div>
                    <div className="relative z-10">
                        <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">Total de Leads</p>
                        <h3 className="text-3xl font-bold text-white mt-1">
                            {loading ? '...' : stats.totalLeads}
                        </h3>
                    </div>
                </div>

                {/* Total Sales (Count) */}
                <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group">
                    <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <ShoppingBag size={100} />
                    </div>
                    <div className="relative z-10">
                        <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">Total de Vendas</p>
                        <h3 className="text-3xl font-bold text-white mt-1">
                            {loading ? '...' : stats.totalSalesCount}
                        </h3>
                    </div>
                </div>

                {/* Total Sales (Amount) */}
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
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Revenue Chart */}
                <div className="lg:col-span-2 glass-panel p-6 rounded-2xl flex flex-col">
                    <h3 className="text-xl font-semibold text-white mb-6">Faturamento Mensal</h3>
                    <div className="flex-1 min-h-[300px] w-full">
                        {loading ? (
                            <div className="h-full w-full flex items-center justify-center text-gray-500">Carregando gráfico...</div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#4ade80" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#4ade80" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                                    <XAxis
                                        dataKey="name"
                                        stroke="#9ca3af"
                                        tick={{ fill: '#9ca3af', fontSize: 12 }}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <YAxis
                                        stroke="#9ca3af"
                                        tick={{ fill: '#9ca3af', fontSize: 12 }}
                                        tickFormatter={(value) => `R$ ${value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}`}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '0.5rem', color: '#fff' }}
                                        itemStyle={{ color: '#4ade80' }}
                                        formatter={(value: number | undefined) => [
                                            `R$ ${(value || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
                                            'Faturamento'
                                        ]}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="value"
                                        stroke="#4ade80"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorValue)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        )}
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
                                                {new Date(sale.sale_date).toLocaleDateString('pt-BR')}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-white">
                                            R$ {sale.total_amount?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </p>
                                        <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full ${sale.status === 'Pago' ? 'text-green-400 bg-green-900/20' :
                                            sale.status === 'A Pagar' ? 'text-red-400 bg-red-900/20' :
                                                'text-yellow-400 bg-yellow-900/20'
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
