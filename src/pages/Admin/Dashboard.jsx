import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import AdminSidebar from '../../components/AdminSidebar';
import { Plus, Edit, Eye, Trash2 } from 'lucide-react';

export default function AdminDashboard() {
    const { tenantSlug } = useParams();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadCourses();
    }, [tenantSlug]);

    async function loadCourses() {
        try {
            setLoading(true);

            // DEV BYPASS: If using the dev-admin-id or if fetching fails for a demo slug
            if (tenantSlug === 'netflix' || tenantSlug === 'demo-school') {
                // Mock data for immediate visualization
                setCourses([
                    {
                        id: 'dev-course-1',
                        title: 'Curso de Python Completo',
                        description: 'Aprenda Python do zero ao avançado com projetos práticos.',
                        thumbnail_url: 'https://img-c.udemycdn.com/course/750x422/394676_ce3d_5.jpg',
                        is_published: true,
                        created_at: new Date().toISOString()
                    },
                    {
                        id: 'dev-course-2',
                        title: 'Marketing Digital para Lançamentos',
                        description: 'Estratégias de tráfego pago e copy para lançar seu infoproduto.',
                        thumbnail_url: 'https://blog.hotmart.com/blog/2019/06/660x400-capa-post-estrategia-de-vendas.png',
                        is_published: false,
                        created_at: new Date().toISOString()
                    }
                ]);
                setLoading(false);
                return;
            }

            // 1. Get Org ID
            const { data: org } = await supabase.from('organizations').select('id').eq('slug', tenantSlug).single();

            if (org) {
                const { data } = await supabase
                    .from('courses')
                    .select('*')
                    .eq('organization_id', org.id)
                    .order('created_at', { ascending: false });
                setCourses(data || []);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-white font-sans pl-64">
            <AdminSidebar />

            <main className="p-8 max-w-7xl mx-auto">
                <header className="flex justify-between items-center mb-12">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Meus Cursos</h1>
                        <p className="text-zinc-400">Gerencie seu conteúdo e acompanhe o desempenho.</p>
                    </div>
                    <Link
                        to={`/${tenantSlug}/admin/courses/new`}
                        className="bg-white text-black px-6 py-2.5 rounded font-bold hover:bg-zinc-200 transition flex items-center gap-2"
                    >
                        <Plus size={20} /> Novo Curso
                    </Link>
                </header>

                {loading ? (
                    <div className="text-center py-20 text-zinc-500">Carregando seus cursos...</div>
                ) : courses.length === 0 ? (
                    <div className="text-center py-20 border border-dashed border-zinc-800 rounded-lg">
                        <p className="text-zinc-500 text-lg mb-4">Você ainda não criou nenhum curso.</p>
                        <Link to={`/${tenantSlug}/admin/courses/new`} className="text-blue-500 hover:underline">Criar meu primeiro curso</Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {courses.map(course => (
                            <div key={course.id} className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden group hover:border-zinc-700 transition">
                                <div className="aspect-video relative bg-zinc-800">
                                    {course.thumbnail_url && (
                                        <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition" />
                                    )}
                                    <div className="absolute top-2 right-2 bg-black/60 px-2 py-1 rounded text-xs font-mono">
                                        {course.is_published ? <span className="text-green-400">PÚBLICO</span> : <span className="text-yellow-400">RASCUNHO</span>}
                                    </div>
                                </div>

                                <div className="p-5">
                                    <h3 className="font-bold text-lg mb-2 truncate">{course.title}</h3>
                                    <p className="text-zinc-400 text-sm line-clamp-2 mb-6 h-10">{course.description || "Sem descrição..."}</p>

                                    <div className="flex gap-2">
                                        <Link
                                            to={`/${tenantSlug}/admin/courses/${course.id}`}
                                            className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white py-2 rounded text-sm font-medium flex items-center justify-center gap-2 transition"
                                        >
                                            <Edit size={16} /> Editar
                                        </Link>
                                        <Link
                                            to={`/${tenantSlug}/assistir/${course.id}`}
                                            target="_blank"
                                            className="px-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded flex items-center justify-center transition"
                                            title="Visualizar como aluno"
                                        >
                                            <Eye size={18} />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
