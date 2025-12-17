import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Product, Lead } from '../types';
import { Plus, Minus, Trash2, CheckCircle, DollarSign } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Sales() {
    const { user } = useAuth();
    const [leads, setLeads] = useState<Lead[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [selectedLeadId, setSelectedLeadId] = useState('');
    const [cart, setCart] = useState<{ product: Product, quantity: number }[]>([]);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            const { data: leadsData } = await supabase.from('leads_bons_frutos').select('*').order('name');
            const { data: productsData } = await supabase.from('products_bons_frutos').select('*').eq('active', true).order('name');
            if (leadsData) setLeads(leadsData);
            if (productsData) setProducts(productsData);
        };
        fetchData();
    }, []);

    const addToCart = (product: Product) => {
        setCart(prev => {
            const existing = prev.find(item => item.product.id === product.id);
            if (existing) {
                return prev.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
            }
            return [...prev, { product, quantity: 1 }];
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

    const totalAmount = cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);

    const handleCheckout = async () => {
        if (!selectedLeadId || cart.length === 0 || !user) return;
        setLoading(true);

        try {
            // 1. Create Sale Header
            const { data: sale, error: saleError } = await supabase
                .from('sales_bons_frutos')
                .insert([{
                    lead_id: selectedLeadId,
                    user_id: user.id,
                    total_amount: totalAmount,
                    status: 'Pago', // Defaulting to paid for simplicity in MVP
                    notes: 'Venda realizada via app'
                }])
                .select()
                .single();

            if (saleError) throw saleError;

            // 2. Create Sale Items
            const saleItems = cart.map(item => ({
                sale_id: sale.id,
                product_id: item.product.id,
                quantity: item.quantity,
                unit_price: item.product.price
            }));

            const { error: itemsError } = await supabase.from('sale_items_bons_frutos').insert(saleItems);
            if (itemsError) throw itemsError;

            setSuccess(true);
            setCart([]);
            setSelectedLeadId('');
            setTimeout(() => setSuccess(false), 3000);

        } catch (error) {
            console.error(error);
            alert('Erro ao finalizar venda');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 h-[calc(100vh-64px)] flex flex-col md:flex-row gap-6">

            {/* LEFT: Product Selection */}
            <div className="flex-1 flex flex-col gap-6 overflow-hidden">
                <h1 className="text-3xl font-bold text-white mb-2">Nova Venda</h1>

                <div className="overflow-y-auto pr-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-20">
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
            <div className="w-full md:w-[400px] glass-panel rounded-2xl flex flex-col h-full border-l border-brand-700/30">
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
                                        <p className="text-gray-400 text-xs">R$ {item.product.price.toFixed(2)}</p>
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
    );
}
