import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Briefcase } from 'lucide-react';

export default function Login() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [role, setRole] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const navigate = useNavigate();

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                navigate('/');
            } else {
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: fullName,
                        },
                    },
                });
                if (error) throw error;

                // Salvar o role na tabela profile_bons_frutos
                if (data.user) {
                    const { error: profileError } = await supabase
                        .from('profiles_bons_frutos')
                        .upsert({
                            id: data.user.id,
                            full_name: fullName,
                            role: role,
                            email: email
                        });
                    if (profileError) console.error('Erro ao salvar perfil:', profileError);
                }

                alert('Cadastro realizado! Aguarde aprovação de um administrador.');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-brand-900 flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background Elements for subtle depth */}
            <div className="absolute inset-0 bg-gradient-to-br from-brand-900 to-black opacity-90" />
            <div className="absolute w-[800px] h-[800px] bg-brand-700/10 rounded-full blur-3xl -top-40 -right-40" />
            <div className="absolute w-[600px] h-[600px] bg-brand-500/5 rounded-full blur-3xl -bottom-20 -left-20" />

            <div className="relative z-10 w-full max-w-sm flex flex-col items-center">
                {/* Logo Section */}
                <div className="mb-8 relative flex justify-center w-48 h-48 overflow-hidden rounded-full border-4 border-brand-700/30 shadow-2xl bg-black/50 backdrop-blur-sm">
                    <img
                        src="/logo-bons-frutos.jpg"
                        alt="Bons Frutos Logo"
                        className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity duration-700"
                    />
                </div>

                {/* Error Message */}
                {error && (
                    <div className="w-full bg-red-900/40 border border-red-500/30 text-red-200 px-4 py-2 rounded-lg mb-6 text-sm text-center backdrop-blur-sm">
                        {error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleAuth} className="w-full space-y-5">
                    {!isLogin && (
                        <>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User size={18} className="text-brand-100/60 group-focus-within:text-brand-100 transition-colors" />
                                </div>
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="w-full bg-black/20 border border-brand-700/30 rounded-lg px-10 py-3 text-brand-100 placeholder-brand-100/40 focus:outline-none focus:border-brand-500 focus:bg-brand-900/50 transition-all text-sm tracking-wide"
                                    placeholder="Nome Completo"
                                    required
                                />
                            </div>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Briefcase size={18} className="text-brand-100/60 group-focus-within:text-brand-100 transition-colors" />
                                </div>
                                <input
                                    type="text"
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                    className="w-full bg-black/20 border border-brand-700/30 rounded-lg px-10 py-3 text-brand-100 placeholder-brand-100/40 focus:outline-none focus:border-brand-500 focus:bg-brand-900/50 transition-all text-sm tracking-wide"
                                    placeholder="Função (ex: Vendedor, Gerente)"
                                    required
                                />
                            </div>
                        </>
                    )}

                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <User size={18} className="text-brand-100/60 group-focus-within:text-brand-100 transition-colors" />
                        </div>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-black/20 border border-brand-700/30 rounded-lg px-10 py-3 text-brand-100 placeholder-brand-100/40 focus:outline-none focus:border-brand-500 focus:bg-brand-900/50 transition-all text-sm tracking-wide"
                            placeholder="EMAIL"
                            required
                        />
                    </div>

                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock size={18} className="text-brand-100/60 group-focus-within:text-brand-100 transition-colors" />
                        </div>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-black/20 border border-brand-700/30 rounded-lg px-10 py-3 text-brand-100 placeholder-brand-100/40 focus:outline-none focus:border-brand-500 focus:bg-brand-900/50 transition-all text-sm tracking-wide uppercase"
                            placeholder="SENHA"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-brand-700 hover:bg-brand-600 text-white font-bold py-3.5 rounded-lg shadow-lg border border-brand-600/50 transition-all transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed uppercase text-sm tracking-widest mt-8"
                    >
                        {loading ? 'CARREGANDO...' : isLogin ? 'ENTRAR' : 'CADASTRAR'}
                    </button>
                </form>

                {/* Footer Links */}
                <div className="mt-8 text-center space-y-2">
                    <button className="text-brand-100/50 hover:text-brand-100 text-xs transition-colors">
                        Esqueceu a senha?
                    </button>
                    <div className="w-full pt-2">
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-brand-100/70 hover:text-brand-100 text-xs transition-colors border-b border-dashed border-brand-100/30 hover:border-brand-100 pb-0.5"
                        >
                            {isLogin ? 'Criar uma conta' : 'Voltar para Login'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
