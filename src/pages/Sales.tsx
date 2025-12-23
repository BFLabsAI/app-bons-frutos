import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Product, Lead } from '../types';
import { Plus, Minus, Trash2, CheckCircle, DollarSign, History, ChevronDown, ChevronUp, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface SaleItem {
    quantity: number;
    unit_price: number;
    product: {
        name: string;
    } | null;
}

interface SaleWithLead {
    id: string;
    lead_id: string;
    total_amount: number;
    status: string;
    sale_date: string;
    leads: { name: string } | null;
    sale_items_bons_frutos: SaleItem[];
}

export default function Sales() {
    const { user } = useAuth();
    const [leads, setLeads] = useState<Lead[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [selectedLeadId, setSelectedLeadId] = useState('');
    const [cart, setCart] = useState<{ product: Product, quantity: number, unitPrice: number }[]>([]);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [salesHistory, setSalesHistory] = useState<SaleWithLead[]>([]);
    const [showHistory, setShowHistory] = useState(false);
    const [expandedSaleId, setExpandedSaleId] = useState<string | null>(null);

    useEffect(() => {
        fetchData();
        fetchSalesHistory();
    }, []);

    const fetchData = async () => {
        const { data: leadsData } = await supabase.from('leads_bons_frutos').select('*').order('name');
        const { data: productsData } = await supabase.from('products_bons_frutos').select('*').eq('active', true).order('name');
        if (leadsData) setLeads(leadsData);
        if (productsData) setProducts(productsData);
    };

    const fetchSalesHistory = async () => {
        const { data, error } = await supabase
            .from('sales_bons_frutos')
            .select(`
                *,
                leads:leads_bons_frutos(name),
                sale_items_bons_frutos (
                    quantity,
                    unit_price,
                    product:products_bons_frutos(name)
                )
            `)
            .order('sale_date', { ascending: false });

        if (!error && data) {
            setSalesHistory(data as any);
        } else if (error) {
            console.error('Error fetching history:', error);
        }
    };

    const handleDeleteSale = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir esta venda? Esta ação não pode ser desfeita.')) return;

        // Cascade delete should handle items ideally, but RLS/FK policies might vary.
        // Assuming FK has ON DELETE CASCADE. If not, we'd need to delete items first.
        const { error } = await supabase.from('sales_bons_frutos').delete().eq('id', id);

        if (error) {
            alert(`Erro ao excluir venda: ${error.message}`);
        } else {
            fetchSalesHistory();
        }
    };

    const handleStatusChange = async (id: string, newStatus: string) => {
        const { error } = await supabase
            .from('sales_bons_frutos')
            .update({ status: newStatus })
            .eq('id', id);

        if (error) {
            alert(`Erro ao atualizar status: ${error.message}`);
        } else {
            fetchSalesHistory();
        }
    };

    const addToCart = (product: Product) => {
        setCart(prev => {
            const existing = prev.find(item => item.product.id === product.id);
            if (existing) {
                return prev.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
            }
            return [...prev, { product, quantity: 1, unitPrice: product.price }];
        });
    };

    const removeFromCart = (productId: string) => {
        setCart(prev => prev.filter(item => item.product.id !== productId));
    };

    const updateQuantity = (productId: string, delta: number) => {
        setCart(prev => prev.map(item => {
            if (item.product.id === productId) {
                const newQty = Math.max(1, item.quantity + delta);
                return { ...item, quantity: newQty };
            }
            return item;
        }));
    };

    const updateUnitPrice = (productId: string, newPrice: string) => {
        const price = parseFloat(newPrice.replace(',', '.'));
        if (isNaN(price)) return;

        setCart(prev => prev.map(item => {
            if (item.product.id === productId) {
                return { ...item, unitPrice: price };
            }
            return item;
        }));
    };

    const totalAmount = cart.reduce((acc, item) => acc + (item.unitPrice * item.quantity), 0);

    const handleCheckout = async () => {
        if (!selectedLeadId || cart.length === 0 || !user) return;
        setLoading(true);

        try {
            const { data: sale, error: saleError } = await supabase
                .from('sales_bons_frutos')
                .insert([{
                    lead_id: selectedLeadId,
                    user_id: user.id,
                    total_amount: totalAmount,
                    status: 'Pago', // Default, can be changed later
                    notes: 'Venda realizada via app',
                    sale_date: new Date().toISOString()
                }])
                .select()
                .single();

            if (saleError) throw saleError;

            const saleItems = cart.map(item => ({
                sale_id: sale.id,
                product_id: item.product.id,
                quantity: item.quantity,
                unit_price: item.unitPrice
            }));

            const { error: itemsError } = await supabase.from('sale_items_bons_frutos').insert(saleItems);
            if (itemsError) throw itemsError;

            setSuccess(true);
            setCart([]);
            setSelectedLeadId('');
            fetchSalesHistory();
            setTimeout(() => setSuccess(false), 3000);

        } catch (error) {
            console.error(error);
            alert('Erro ao finalizar venda');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="p-8 space-y-6">
            {/* Sales History Toggle */}
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-white">Vendas</h1>
                <button
                    onClick={() => setShowHistory(!showHistory)}
                    className="flex items-center gap-2 bg-brand-700/20 hover:bg-brand-700/40 text-brand-400 px-4 py-2 rounded-lg transition-all"
                >
                    <History size={20} />
                    Histórico ({salesHistory.length})
                    {showHistory ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
            </div>

            {/* Sales History Panel */}
            {showHistory && (
                <div className="glass-panel rounded-2xl overflow-hidden">
                    <div className="p-4 border-b border-brand-700/20 bg-brand-900/20">
                        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                            <History size={20} className="text-brand-400" />
                            Histórico de Vendas
                        </h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-brand-900/40 text-brand-100 uppercase text-xs tracking-wider">
                                <tr>
                                    <th className="p-4">Data</th>
                                    <th className="p-4">Cliente</th>
                                    <th className="p-4">Valor</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-brand-700/10">
                                {salesHistory.length === 0 ? (
                                    <tr><td colSpan={5} className="p-8 text-center text-gray-400">Nenhuma venda registrada.</td></tr>
                                ) : (
                                    salesHistory.map((sale) => (
                                        <>
                                            <tr key={sale.id} className="hover:bg-brand-500/5 transition-colors">
                                                <td className="p-4 text-gray-300 text-sm">{formatDate(sale.sale_date)}</td>
                                                <td className="p-4 text-white font-medium">{sale.leads?.name || 'Cliente removido'}</td>
                                                <td className="p-4 text-brand-400 font-bold">
                                                    R$ {sale.total_amount?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                </td>
                                                <td className="p-4">
                                                    <select
                                                        value={sale.status}
                                                        onChange={(e) => handleStatusChange(sale.id, e.target.value)}
                                                        className={`px-3 py-1.5 rounded-full text-xs font-medium border cursor-pointer outline-none transition-all ${sale.status === 'Pago' ? 'bg-green-900/20 border-green-800 text-green-400' :
                                                            sale.status === 'A Pagar' ? 'bg-red-900/20 border-red-800 text-red-400' :
                                                                sale.status === 'Parcelado' ? 'bg-yellow-900/20 border-yellow-800 text-yellow-400' :
                                                                    'bg-gray-800/50 border-gray-700 text-gray-400'
                                                            }`}
                                                    >
                                                        <option value="Pago">Pago</option>
                                                        <option value="A Pagar">A Pagar</option>
                                                        <option value="Parcelado">Parcelado</option>
                                                    </select>
                                                </td>
                                                <td className="p-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => setExpandedSaleId(expandedSaleId === sale.id ? null : sale.id)}
                                                            className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-brand-300 transition-colors"
                                                            title="Ver detalhes"
                                                        >
                                                            {expandedSaleId === sale.id ? <EyeOff size={16} /> : <Eye size={16} />}
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteSale(sale.id)}
                                                            className="p-2 hover:bg-red-500/10 rounded-lg text-gray-400 hover:text-red-400 transition-colors"
                                                            title="Excluir venda"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                            {expandedSaleId === sale.id && (
                                                <tr className="bg-brand-900/20">
                                                    <td colSpan={5} className="p-4">
                                                        <div className="bg-black/20 rounded-lg p-4 border border-brand-700/20">
                                                            <h4 className="text-sm font-medium text-gray-400 mb-3 uppercase tracking-wider">Itens do Pedido</h4>
                                                            <div className="space-y-2">
                                                                {sale.sale_items_bons_frutos?.map((item, idx) => (
                                                                    <div key={idx} className="flex justify-between items-center text-sm">
                                                                        <div className="flex items-center gap-3">
                                                                            <span className="w-6 h-6 rounded-full bg-brand-700/30 flex items-center justify-center text-xs font-bold text-brand-300">
                                                                                {item.quantity}x
                                                                            </span>
                                                                            <span className="text-white">{item.product?.name || 'Produto removido'}</span>
                                                                        </div>
                                                                        <span className="text-gray-400">
                                                                            R$ {item.unit_price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                                        </span>
                                                                    </div>
                                                                ))}
                                                                <div className="border-t border-brand-700/20 mt-3 pt-3 flex justify-between items-center font-bold">
                                                                    <span className="text-brand-400">Total</span>
                                                                    <span className="text-white">R$ {sale.total_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Main Sales Area */}
            <div className="flex flex-col md:flex-row gap-6" style={{ minHeight: showHistory ? '400px' : 'calc(100vh - 250px)' }}>
                {/* LEFT: Product Selection */}
                <div className="flex-1 flex flex-col gap-4 overflow-hidden">
                    <h2 className="text-xl font-semibold text-white">Nova Venda</h2>

                    <div className="overflow-y-auto pr-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-4">
                        {products.map(product => (
                            <button
                                key={product.id}
                                onClick={() => addToCart(product)}
                                className="glass-panel p-4 rounded-xl text-left hover:border-brand-500/50 transition-all group relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-brand-500/5 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                                <div className="relative z-10">
                                    <h3 className="font-bold text-white">{product.name}</h3>
                                    <p className="text-gray-400 text-sm mb-2">{product.description}</p>
                                    <div className="text-brand-400 font-bold">R$ {product.price.toFixed(2)}</div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* RIGHT: Cart & Checkout */}
                <div className="w-full md:w-[400px] glass-panel rounded-2xl flex flex-col border-l border-brand-700/30">
                    <div className="p-6 border-b border-brand-700/20">
                        <h2 className="text-xl font-bold text-white flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-brand-500/50">
                                <img src="/logo-bons-frutos.jpg" alt="Logo" className="w-full h-full object-cover" />
                            </div>
                            Carrinho
                        </h2>
                    </div>

                    <div className="p-6 flex-1 overflow-y-auto space-y-4">
                        {/* Lead Selector */}
                        <div className="space-y-2">
                            <label className="text-sm text-gray-400">Cliente</label>
                            <select
                                value={selectedLeadId}
                                onChange={(e) => setSelectedLeadId(e.target.value)}
                                className="w-full bg-dark-bg border border-brand-700/30 rounded-lg p-3 text-white focus:outline-none focus:border-brand-500"
                            >
                                <option value="">Selecione um cliente...</option>
                                {leads.map(lead => (
                                    <option key={lead.id} value={lead.id}>{lead.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Cart Items */}
                        <div className="space-y-3 mt-4">
                            {cart.length === 0 ? (
                                <div className="text-center text-gray-500 py-8">Carrinho vazio</div>
                            ) : (
                                cart.map((item) => (
                                    <div key={item.product.id} className="flex items-center justify-between bg-white/5 p-3 rounded-lg">
                                        <div className="flex-1">
                                            <p className="text-white font-medium text-sm">{item.product.name}</p>
                                            <div className="flex items-center gap-1 mt-1">
                                                <span className="text-gray-500 text-xs">R$</span>
                                                <input
                                                    className="w-20 bg-transparent text-gray-400 text-xs border-b border-gray-700 focus:border-brand-500 focus:text-white outline-none"
                                                    value={item.unitPrice}
                                                    onChange={(e) => updateUnitPrice(item.product.id, e.target.value)}
                                                    type="number"
                                                    step="0.01"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <button onClick={() => updateQuantity(item.product.id, -1)} className="p-1 hover:bg-white/10 rounded"><Minus size={14} /></button>
                                            <span className="text-white text-sm w-4 text-center">{item.quantity}</span>
                                            <button onClick={() => updateQuantity(item.product.id, 1)} className="p-1 hover:bg-white/10 rounded"><Plus size={14} /></button>
                                            <button onClick={() => removeFromCart(item.product.id)} className="p-1 text-red-400 hover:bg-red-900/20 rounded ml-1"><Trash2 size={14} /></button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="p-6 bg-brand-900/20 border-t border-brand-700/20">
                        <div className="flex justify-between items-center mb-6">
                            <span className="text-gray-400">Total</span>
                            <span className="text-2xl font-bold text-white">R$ {totalAmount.toFixed(2)}</span>
                        </div>

                        <button
                            onClick={handleCheckout}
                            disabled={loading || !selectedLeadId || cart.length === 0}
                            className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${success
                                ? 'bg-green-500 text-white'
                                : 'bg-brand-700 hover:bg-brand-600 text-white disabled:opacity-50 disabled:cursor-not-allowed'
                                }`}
                        >
                            {success ? (
                                <> <CheckCircle /> Venda Realizada! </>
                            ) : (
                                <> <DollarSign /> Finalizar Venda </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
