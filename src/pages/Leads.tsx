import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Lead } from '../types';
import { Plus, Search, Phone, Mail, User } from 'lucide-react';

export default function Leads() {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);

    // New Lead Form State
    const [newLead, setNewLead] = useState({ name: '', phone: '', email: '', status: 'Novo' });

    useEffect(() => {
        fetchLeads();
    }, []);

    const fetchLeads = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('leads_bons_frutos')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) console.error(error);
        else setLeads(data || []);
        setLoading(false);
    };

    const handleCreateLead = async (e: React.FormEvent) => {
        e.preventDefault();
        const { error } = await supabase.from('leads_bons_frutos').insert([newLead]);
        if (error) {
            alert(`Erro ao criar lead: ${error.message}`);
            console.error(error);
        } else {
            setShowModal(false);
            setNewLead({ name: '', phone: '', email: '', status: 'Novo' });
            fetchLeads();
        }
    };

    const filteredLeads = leads.filter(lead =>
        lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (lead.email && lead.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="p-8 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h1 className="text-3xl font-bold text-white">Gestão de Leads</h1>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-brand-700 hover:bg-brand-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all"
                >
                    <Plus size={20} />
                    Novo Lead
                </button>
            </div>

            {/* Search Bar */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                <input
                    type="text"
                    placeholder="Buscar leads..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-dark-surface border border-brand-700/30 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-brand-500 transition-colors"
                />
            </div>

            {/* Leads Table */}
            <div className="glass-panel rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-brand-900/40 text-brand-100 uppercase text-xs tracking-wider">
                            <tr>
                                <th className="p-4">Nome</th>
                                <th className="p-4">Contato</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-brand-700/10">
                            {loading ? (
                                <tr><td colSpan={4} className="p-8 text-center text-gray-400">Carregando...</td></tr>
                            ) : filteredLeads.length === 0 ? (
                                <tr><td colSpan={4} className="p-8 text-center text-gray-400">Nenhum lead encontrado.</td></tr>
                            ) : (
                                filteredLeads.map((lead) => (
                                    <tr key={lead.id} className="hover:bg-brand-500/5 transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-brand-700/30 flex items-center justify-center text-brand-400">
                                                    <User size={20} />
                                                </div>
                                                <span className="font-medium text-white">{lead.name}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-gray-300 text-sm">
                                            <div className="flex flex-col gap-1">
                                                {lead.email && <div className="flex items-center gap-2"><Mail size={14} /> {lead.email}</div>}
                                                {lead.phone && <div className="flex items-center gap-2"><Phone size={14} /> {lead.phone}</div>}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <select
                                                value={lead.status || 'Novo Lead'}
                                                onChange={async (e) => {
                                                    await supabase.from('leads_bons_frutos').update({ status: e.target.value }).eq('id', lead.id);
                                                    fetchLeads();
                                                }}
                                                className={`px-3 py-1.5 rounded-full text-xs font-medium border cursor-pointer outline-none transition-all ${lead.status === 'Novo Lead' || lead.status === 'Novo' ? 'bg-blue-900/20 border-blue-800 text-blue-400' :
                                                        lead.status === 'Repassado' ? 'bg-purple-900/20 border-purple-800 text-purple-400' :
                                                            lead.status === 'Em Negociação' ? 'bg-yellow-900/20 border-yellow-800 text-yellow-400' :
                                                                lead.status === 'Fechado' ? 'bg-green-900/20 border-green-800 text-green-400' :
                                                                    lead.status === 'Perdido' ? 'bg-red-900/20 border-red-800 text-red-400' :
                                                                        'bg-gray-800/50 border-gray-700 text-gray-400'
                                                    }`}
                                            >
                                                <option value="Novo Lead">Novo Lead</option>
                                                <option value="Repassado">Repassado</option>
                                                <option value="Em Negociação">Em Negociação</option>
                                                <option value="Fechado">Fechado</option>
                                                <option value="Perdido">Perdido</option>
                                            </select>
                                        </td>
                                        <td className="p-4 text-right">
                                            <button className="text-brand-400 hover:text-brand-300 text-sm">Detalhes</button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="glass-panel w-full max-w-md p-6 rounded-2xl relative">
                        <h2 className="text-xl font-bold text-white mb-6">Novo Lead</h2>
                        <form onSubmit={handleCreateLead} className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Nome</label>
                                <input required className="w-full bg-dark-bg border border-brand-700/30 rounded-lg p-3 text-white focus:border-brand-500 outline-none"
                                    value={newLead.name} onChange={e => setNewLead({ ...newLead, name: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Telefone / WhatsApp</label>
                                <input className="w-full bg-dark-bg border border-brand-700/30 rounded-lg p-3 text-white focus:border-brand-500 outline-none"
                                    value={newLead.phone} onChange={e => setNewLead({ ...newLead, phone: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Email</label>
                                <input className="w-full bg-dark-bg border border-brand-700/30 rounded-lg p-3 text-white focus:border-brand-500 outline-none"
                                    value={newLead.email} onChange={e => setNewLead({ ...newLead, email: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Status</label>
                                <select
                                    className="w-full bg-dark-bg border border-brand-700/30 rounded-lg p-3 text-white focus:border-brand-500 outline-none"
                                    value={newLead.status}
                                    onChange={e => setNewLead({ ...newLead, status: e.target.value })}
                                >
                                    <option value="Novo Lead">Novo Lead</option>
                                    <option value="Repassado">Repassado</option>
                                    <option value="Em Negociação">Em Negociação</option>
                                    <option value="Fechado">Fechado</option>
                                    <option value="Perdido">Perdido</option>
                                </select>
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
