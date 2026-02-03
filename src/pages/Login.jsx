import React, { useState } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export default function LoginPage() {
    const { tenantSlug } = useParams();
    const navigate = useNavigate();
    const { signIn } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setError('');
            setLoading(true);
            const { user } = await signIn(email, password);

            // Special handling for Bypassed User (boazhsd@gmail.com)
            if (user.id === '123e4567-e89b-12d3-a456-426614174000') {
                navigate('/hsd/admin');
                return;
            }

            // Check Profile Role
            const { data: profile } = await supabase
                .from('profiles')
                .select('role, organization_id, organizations(slug)')
                .eq('id', user.id)
                .single();

            if (profile?.role === 'admin') {
                const slug = profile.organizations?.slug || tenantSlug;
                navigate(`/${slug}/admin`);
            } else {
                navigate(tenantSlug ? `/${tenantSlug}` : '/');
            }

        } catch (err) {
            console.error(err);
            setError('Falha ao fazer login. Verifique suas credenciais.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black bg-opacity-75 bg-[url('https://assets.nflxext.com/ffe/siteui/vlv3/f841d4c7-10e1-40af-bcae-07a3f8dc141a/f6d7434e-d6de-4185-a6d4-c77a2d08737b/US-en-20220502-popsignuptwoweeks-perspective_alpha_website_medium.jpg')] bg-blend-overlay flex items-center justify-center font-sans">
            <div className="bg-black/80 p-16 rounded-lg w-full max-w-md">
                <h1 className="text-3xl font-bold text-white mb-8">Entrar</h1>

                {error && <div className="bg-orange-500 text-white p-3 rounded mb-4 text-sm">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
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
                        {loading ? 'Entrando...' : 'Entrar'}
                    </button>
                </form>

                <div className="mt-4 text-gray-400 text-sm">
                    Novo por aqui?{' '}
                    <Link to={`/${tenantSlug}/register`} className="text-white hover:underline">
                        Assine agora
                    </Link>.
                </div>
            </div>
        </div>
    );
}
