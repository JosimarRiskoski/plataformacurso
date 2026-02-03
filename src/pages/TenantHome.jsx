import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Play, Info } from 'lucide-react';

export default function TenantHome() {
    const { tenantSlug } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [org, setOrg] = useState(null);
    const [courses, setCourses] = useState([]);

    useEffect(() => {
        async function loadTenantData() {
            try {
                setLoading(true);
                // 1. Buscar Organização pelo Slug
                const { data: orgData, error: orgError } = await supabase
                    .from('organizations')
                    .select('*')
                    .eq('slug', tenantSlug)
                    .single();

                if (orgError) throw orgError;
                setOrg(orgData);

                if (orgData) {
                    // 2. Buscar Cursos da Organização
                    const { data: coursesData, error: coursesError } = await supabase
                        .from('courses')
                        .select('*')
                        .eq('organization_id', orgData.id)
                        .eq('is_published', true);

                    if (coursesError) throw coursesError;
                    setCourses(coursesData);
                }
            } catch (error) {
                console.error('Erro ao carregar dados:', error);
            } finally {
                setLoading(false);
            }
        }

        if (tenantSlug) {
            loadTenantData();
        }
    }, [tenantSlug]);

    if (loading) return <div className="min-h-screen bg-netflix-black text-white flex items-center justify-center">Carregando...</div>;
    if (!org) return <div className="min-h-screen bg-netflix-black text-white flex items-center justify-center">Organização não encontrada</div>;

    // Usa cores configuradas no banco ou fallback
    const primaryColor = org.theme_colors?.primary || '#E50914';

    // Destaque (Pega o primeiro curso como destaque por enquanto)
    const featuredCourse = courses[0];

    return (
        <div className="min-h-screen bg-netflix-black text-white font-sans">
            {/* Header */}
            <header className="fixed w-full z-50 transition-all duration-300 bg-gradient-to-b from-black/80 to-transparent p-4 flex justify-between items-center">
                <div className="flex items-center gap-8">
                    {org.logo_url ? (
                        <img src={org.logo_url} alt={org.name} className="h-8 object-contain" />
                    ) : (
                        <h2 className="text-2xl font-bold uppercase" style={{ color: primaryColor }}>{org.name}</h2>
                    )}
                    <nav className="hidden md:flex gap-4 text-sm font-medium text-gray-300">
                        <a href="#" className="hover:text-white transition">Início</a>
                        <a href="#" className="hover:text-white transition">Minha Lista</a>
                    </nav>
                </div>
                <div className="flex gap-4">
                    <div className="w-8 h-8 bg-gray-600 rounded cursor-pointer"></div>
                </div>
            </header>

            {/* Hero Section */}
            {featuredCourse && (
                <div className="relative h-[80vh] w-full">
                    <div className="absolute inset-0">
                        <img
                            src={featuredCourse.thumbnail_url}
                            alt={featuredCourse.title}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-netflix-black via-netflix-black/50 to-transparent"></div>
                        <div className="absolute inset-0 bg-gradient-to-t from-netflix-black via-transparent to-transparent"></div>
                    </div>

                    <div className="absolute top-1/3 left-12 max-w-xl z-10 space-y-4">
                        <h1 className="text-6xl font-black drop-shadow-lg leading-tight">
                            {featuredCourse.title}
                        </h1>
                        <p className="text-lg text-gray-200 drop-shadow-md line-clamp-3">
                            {featuredCourse.description}
                        </p>
                        <div className="flex gap-4 mt-8">
                            <button
                                onClick={() => navigate(`/${tenantSlug}/assistir/${featuredCourse.id}`)}
                                className="flex items-center gap-2 text-black px-8 py-3 rounded font-bold hover:bg-opacity-80 transition"
                                style={{ backgroundColor: 'white' }}
                            >
                                <Play className="fill-black" size={24} /> Assistir
                            </button>
                            <button className="flex items-center gap-2 bg-gray-500/70 text-white px-8 py-3 rounded font-bold hover:bg-gray-500/50 transition backdrop-blur-sm">
                                <Info size={24} /> Mais Informações
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Listas de Cursos */}
            <div className="px-12 -mt-32 relative z-20 space-y-12 pb-20">
                <section>
                    <h3 className="text-xl font-bold mb-4 text-white/90">Nossos Cursos</h3>
                    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                        {courses.map(course => (
                            <div
                                key={course.id}
                                onClick={() => navigate(`/${tenantSlug}/assistir/${course.id}`)}
                                className="min-w-[300px] h-[170px] relative rounded-md overflow-hidden hover:scale-105 hover:z-30 transition duration-300 cursor-pointer group"
                            >
                                <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/0 transition"></div>
                                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent opacity-0 group-hover:opacity-100 transition">
                                    <p className="font-bold text-sm">{course.title}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}
