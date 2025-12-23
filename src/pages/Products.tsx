import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Product } from '../types';
import { Plus, Package, Trash2 } from 'lucide-react';

export default function Products() {
    const [products, setProducts] = useState<Product[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [newProduct, setNewProduct] = useState({ name: '', price: '', description: '' });

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        const { data, error } = await supabase
            .from('products_bons_frutos')
            .select('*')
            .order('name');
        if (!error && data) setProducts(data);
    };

    const handleCreateProduct = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            // Replace comma with dot for valid float parsing
            const cleanPrice = newProduct.price.replace(',', '.');
            const priceValue = parseFloat(cleanPrice);

            if (isNaN(priceValue)) {
                alert('Por favor, insira um preço válido.');
                return;
            }

            const { error } = await supabase.from('products_bons_frutos').insert([{
                name: newProduct.name,
                price: priceValue,
                description: newProduct.description,
                active: true
            }]);

            if (error) throw error;

            setShowModal(false);
            setNewProduct({ name: '', price: '', description: '' });
            fetchProducts();
        } catch (error: any) {
            alert(`Erro ao criar produto: ${error.message}`);
            console.error('Error creating product:', error);
        }
    };

    const toggleActive = async (id: string, currentStatus: boolean) => {
        try {
            const { error } = await supabase.from('products_bons_frutos').update({ active: !currentStatus }).eq('id', id);
            if (error) throw error;
            fetchProducts();
        } catch (error: any) {
            console.error('Error toggling status:', error);
            alert(`Erro ao atualizar status: ${error.message}`);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Tem certeza que deseja excluir o produto "${name}"?`)) return;

        try {
            // Tentativa inicial de exclusão direta
            const { error } = await supabase.from('products_bons_frutos').delete().eq('id', id);

            if (error) {
                // Se der erro de FK (23503), pede confirmação para exclusão em cascata
                if (error.code === '23503') {
                    const confirmCascade = confirm(
                        `O produto "${name}" possui vendas vinculadas.\n\n` +
                        `Deseja EXCLUIR DEFINITIVAMENTE?\n` +
                        `Isso removerá o produto de todos os pedidos anteriores.`
                    );

                    if (confirmCascade) {
                        try {
                            // 1. Remove itens de venda vinculados a este produto
                            const { error: itemsError } = await supabase
                                .from('sale_items_bons_frutos')
                                .delete()
                                .eq('product_id', id);

                            if (itemsError) throw itemsError;

                            // 2. Remove o produto
                            const { error: deleteError } = await supabase
                                .from('products_bons_frutos')
                                .delete()
                                .eq('id', id);

                            if (deleteError) throw deleteError;

                            fetchProducts();
                            return;
                        } catch (cascadeError: any) {
                            console.error('Cascade delete error:', cascadeError);
                            alert(`Erro ao forçar exclusão: ${cascadeError.message}`);
                            return;
                        }
                    }
                } else {
                    throw error;
                }
            }

            fetchProducts();
        } catch (error: any) {
            if (error.code !== '23503') {
                alert(`Erro ao excluir: ${error.message}`);
                console.error('Delete error:', error);
            }
        }
    };

    return (
        <div className="p-8 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-white">Produtos</h1>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-brand-700 hover:bg-brand-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all"
                >
                    <Plus size={20} /> Novo Produto
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map(product => (
                    <div key={product.id} className={`glass-panel p-6 rounded-2xl border-l-4 transition-all ${product.active ? 'border-brand-500' : 'border-gray-600 opacity-60'}`}>
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-brand-900/40 rounded-lg text-brand-400">
                                <Package size={24} />
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => toggleActive(product.id, product.active)}
                                    className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-full border transition-all ${product.active
                                        ? 'border-green-800 text-green-400 hover:bg-green-900/20'
                                        : 'border-gray-600 text-gray-400 hover:bg-gray-800/50'}`}
                                >
                                    <span className={`w-2 h-2 rounded-full ${product.active ? 'bg-green-400 shadow-[0_0_6px_rgba(74,222,128,0.6)]' : 'bg-gray-500'}`}></span>
                                    {product.active ? 'Ativo' : 'Inativo'}
                                </button>
                                <button
                                    onClick={() => handleDelete(product.id, product.name)}
                                    className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                                    title="Excluir produto"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>

                        <h3 className="text-xl font-bold text-white mb-1">{product.name}</h3>
                        <p className="text-gray-400 text-sm min-h-[40px] mb-4 line-clamp-2">{product.description || 'Sem descrição.'}</p>

                        <div className="flex items-center gap-1 text-2xl font-bold text-brand-100">
                            <span className="text-sm text-brand-500 mt-1">R$</span>
                            {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                    </div>
                ))}
            </div>

            {/* Create Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="glass-panel w-full max-w-md p-6 rounded-2xl relative">
                        <h2 className="text-xl font-bold text-white mb-6">Novo Produto</h2>
                        <form onSubmit={handleCreateProduct} className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Nome do Produto</label>
                                <input required className="w-full bg-dark-bg border border-brand-700/30 rounded-lg p-3 text-white focus:border-brand-500 outline-none"
                                    value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Preço (R$)</label>
                                <input
                                    type="text"
                                    inputMode="decimal"
                                    required
                                    className="w-full bg-dark-bg border border-brand-700/30 rounded-lg p-3 text-white focus:border-brand-500 outline-none"
                                    value={newProduct.price}
                                    onChange={e => setNewProduct({ ...newProduct, price: e.target.value })}
                                    placeholder="0,00"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Descrição</label>
                                <textarea className="w-full bg-dark-bg border border-brand-700/30 rounded-lg p-3 text-white focus:border-brand-500 outline-none h-24"
                                    value={newProduct.description} onChange={e => setNewProduct({ ...newProduct, description: e.target.value })} />
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700">Cancelar</button>
                                <button type="submit" className="flex-1 py-3 bg-brand-700 text-white rounded-lg hover:bg-brand-600">Salvar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
