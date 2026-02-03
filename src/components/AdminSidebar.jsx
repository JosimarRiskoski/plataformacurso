import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { LayoutDashboard, Video, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function AdminSidebar() {
    const { tenantSlug } = useParams();
    const { signOut } = useAuth();

    return (
        <div className="w-64 bg-zinc-900 border-r border-zinc-800 h-screen fixed left-0 top-0 flex flex-col">
            <div className="p-6 border-b border-zinc-800">
                <h1 className="text-xl font-bold text-white tracking-tight">Studio Criador</h1>
                <p className="text-xs text-zinc-500 mt-1 uppercase tracking-wider">Painel Administrativo</p>
            </div>

            <nav className="flex-1 p-4 space-y-2">
                <Link
                    to={`/${tenantSlug}/admin`}
                    className="flex items-center gap-3 text-zinc-400 hover:text-white hover:bg-zinc-800 px-4 py-3 rounded-lg transition"
                >
                    <LayoutDashboard size={20} />
                    <span>Dashboard</span>
                </Link>
                <Link
                    to={`/${tenantSlug}/admin/courses`}
                    className="flex items-center gap-3 text-zinc-400 hover:text-white hover:bg-zinc-800 px-4 py-3 rounded-lg transition"
                >
                    <Video size={20} />
                    <span>Meus Cursos</span>
                </Link>
                <Link
                    to={`/${tenantSlug}/admin/settings`}
                    className="flex items-center gap-3 text-zinc-400 hover:text-white hover:bg-zinc-800 px-4 py-3 rounded-lg transition"
                >
                    <Settings size={20} />
                    <span>Configurações</span>
                </Link>
            </nav>

            <div className="p-4 border-t border-zinc-800">
                <button
                    onClick={signOut}
                    className="flex items-center gap-3 text-red-500 hover:bg-red-500/10 w-full px-4 py-3 rounded-lg transition"
                >
                    <LogOut size={20} />
                    <span>Sair</span>
                </button>
            </div>
        </div>
    );
}
