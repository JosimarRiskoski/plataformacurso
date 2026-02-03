import React, { useState } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export default function RegisterPage() {
    const { tenantSlug } = useParams();
    const navigate = useNavigate();
    const { signUp } = useAuth();

    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setError('');
            setLoading(true);

            // 1. Sign Up
            const { user } = await signUp(email, password, fullName);

            // 2. Create Profile (Trigger usually handles this, but we'll do manual for safety if no trigger yet)
            if (user) {
                const { error: profileError } = await supabase
                    .from('profiles')
                    .upsert({
                        id: user.id,
                        full_name: fullName,
                        email: email,
                        role: 'student'
                    });

                if (profileError) console.error("Profile creation error:", profileError);
            }

            navigate(tenantSlug ? `/${tenantSlug}` : '/');
        } catch (err) {
            setError('Falha ao criar conta. ' + err.message);
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black bg-opacity-75 bg-[url('https://assets.nflxext.com/ffe/siteui/vlv3/f841d4c7-10e1-40af-bcae-07a3f8dc141a/f6d7434e-d6de-4185-a6d4-c77a2d08737b/US-en-20220502-popsignuptwoweeks-perspective_alpha_website_medium.jpg')] bg-blend-overlay flex items-center justify-center font-sans">
            <div className="bg-black/80 p-16 rounded-lg w-full max-w-md">
                <h1 className="text-3xl font-bold text-white mb-8">Criar Conta</h1>

                {error && <div className="bg-orange-500 text-white p-3 rounded mb-4 text-sm">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <input
                            type="text"
                            placeholder="Nome Completo"
                            className="w-full bg-[#333] text-white rounded px-4 py-3 focus:outline-none focus:bg-[#444]"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <input
                            type="email"
                            placeholder="Email"
                            className="w-full bg-[#333] text-white rounded px-4 py-3 focus:outline-none focus:bg-[#444]"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <input
                            type="password"
                            placeholder="Senha"
                            className="w-full bg-[#333] text-white rounded px-4 py-3 focus:outline-none focus:bg-[#444]"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-netflix-red text-white font-bold py-3 rounded mt-6 hover:bg-red-700 transition disabled:opacity-50"
                    >
                        {loading ? 'Cadastrar' : 'Cadastrar'}
                    </button>
                </form>

                <div className="mt-4 text-gray-400 text-sm">
                    Já tem uma conta?{' '}
                    <Link to={`/${tenantSlug}/login`} className="text-white hover:underline">
                        Entrar agora
                    </Link>.
                </div>
            </div>
        </div>
    );
}
