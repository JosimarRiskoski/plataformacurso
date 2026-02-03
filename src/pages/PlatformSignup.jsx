import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Layout } from 'lucide-react';

export default function PlatformSignup() {
    const navigate = useNavigate();
    const { signUp } = useAuth();

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        companyName: '',
        slug: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const generateSlug = (name) => {
        return name.toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Remove accents
            .replace(/[^a-z0-9]/g, '-') // Replace non-alphanum with hyphen
            .replace(/-+/g, '-') // Remove duplicate hyphens
            .replace(/^-|-$/g, ''); // Trim hyphens
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'companyName') {
            setFormData(prev => ({
                ...prev,
                companyName: value,
                slug: generateSlug(value)
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // 1. Create Auth User
            const { user } = await signUp(formData.email, formData.password, formData.fullName);
            if (!user) throw new Error("Erro ao criar usuário.");

            // 2. Create Organization (Tenant)
            const { data: org, error: orgError } = await supabase
                .from('organizations')
                .insert({
                    name: formData.companyName,
                    slug: formData.slug,
                    theme_colors: { primary: '#E50914', background: '#141414' } // Default Theme
                })
                .select()
                .single();

            if (orgError) {
                // Rollback doesn't exist easily here without backend function, but for now throwing error
                if (orgError.code === '23505') throw new Error("Este endereço (URL) já está em uso. Escolha outro nome para sua escola.");
                throw orgError;
            }

            // 3. Link User to Org as Admin
            const { error: profileError } = await supabase
                .from('profiles')
                .upsert({
                    id: user.id,
                    full_name: formData.fullName,
                    email: formData.email,
                    role: 'admin',
                    organization_id: org.id
                });

            if (profileError) throw profileError;

            // Success -> Redirect to Pending Setup Page
            navigate(`/${formData.slug}/setup-pending`);

        } catch (err) {
            console.error(err);
            const errorMessage = err.message || "Erro ao criar plataforma.";

            // Helpful message for rate limit
            if (errorMessage.includes("rate limit")) {
                setError("Muitas tentativas recentes. Aguarde um momento ou use outro email.");
            } else {
                setError(errorMessage);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDemoBypass = () => {
        // Allows user to see the next screen even if API fails (for flow validation)
        navigate(`/${formData.slug || 'demo-school'}/setup-pending`);
    };

    return (
        <div className="min-h-screen bg-black text-white font-sans flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 p-8 rounded-xl shadow-2xl">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-red-600 rounded-lg mb-4">
                        <Layout className="text-white" size={24} />
                    </div>
                    <h1 className="text-2xl font-bold">Crie sua Plataforma</h1>
                    <p className="text-zinc-400 text-sm mt-2">Comece a vender seus cursos hoje mesmo.</p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded text-sm mb-6">
                        <p className="mb-2">{error}</p>
                        <button
                            onClick={handleDemoBypass}
                            className="text-xs font-bold underline hover:text-red-400"
                        >
                            [Modo Demo] Visualizar Próxima Etapa sem criar conta
                        </button>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Nome da sua Escola/Empresa</label>
                        <input
                            type="text"
                            name="companyName"
                            value={formData.companyName}
                            onChange={handleChange}
                            className="w-full bg-black border border-zinc-800 rounded p-3 text-white focus:border-red-600 focus:outline-none transition"
                            placeholder="Ex: Academy Pro"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">URL da Plataforma</label>
                        <div className="flex items-center bg-black border border-zinc-800 rounded pl-3 text-zinc-500">
                            <span className="text-sm">flix.education/</span>
                            <input
                                type="text"
                                name="slug"
                                value={formData.slug}
                                onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase() })} // slug manual override
                                className="w-full bg-transparent border-none p-3 text-white focus:outline-none text-sm font-mono"
                                placeholder="academy-pro"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Seu Nome</label>
                            <input
                                type="text"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                className="w-full bg-black border border-zinc-800 rounded p-3 text-white focus:border-red-600 focus:outline-none transition"
                                placeholder="João Silva"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full bg-black border border-zinc-800 rounded p-3 text-white focus:border-red-600 focus:outline-none transition"
                                placeholder="joao@email.com"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Senha</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full bg-black border border-zinc-800 rounded p-3 text-white focus:border-red-600 focus:outline-none transition"
                            placeholder="Mínimo 6 caracteres"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 rounded mt-4 transition flex items-center justify-center gap-2"
                    >
                        {loading ? 'Criando Plataforma...' : 'Lançar Minha Plataforma 🚀'}
                    </button>
                </form>
            </div>
        </div>
    );
}
