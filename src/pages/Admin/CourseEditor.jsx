import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import AdminSidebar from '../../components/AdminSidebar';
import ModuleManager from '../../components/ModuleManager';
import { Save, ArrowLeft } from 'lucide-react';

export default function CourseEditor() {
    const { tenantSlug, courseId: paramId } = useParams();
    const navigate = useNavigate();
    // Validar se paramId existe, senão assume 'new' (para a rota explícita /new)
    const courseId = paramId || 'new';
    const isNew = courseId === 'new';

    const [loading, setLoading] = useState(false);
    const [course, setCourse] = useState({ title: '', description: '', thumbnail_url: '', is_published: false });

    useEffect(() => {
        if (!isNew && courseId) {
            loadCourse();
        }
    }, [courseId, isNew]);

    async function loadCourse() {
        if (courseId.startsWith('dev-course')) {
            const mockCourses = {
                'dev-course-1': {
                    title: 'Curso de Python Completo',
                    description: 'Aprenda Python do zero ao avançado.',
                    thumbnail_url: 'https://img-c.udemycdn.com/course/750x422/394676_ce3d_5.jpg',
                    is_published: true
                }
            };
            setCourse(mockCourses[courseId] || {});
            return;
        }

        const { data } = await supabase.from('courses').select('*').eq('id', courseId).single();
        if (data) setCourse(data);
    }

    async function handleSave(e) {
        e.preventDefault();
        setLoading(true);
        try {
            if (courseId.startsWith('dev-course')) {
                await new Promise(resolve => setTimeout(resolve, 1000));
                alert("Curso salvo com sucesso! (Modo Simulação)");
                setLoading(false);
                return;
            }

            const { data: org } = await supabase.from('organizations').select('id').eq('slug', tenantSlug).single();
            if (!org) throw new Error("Org not found");

            const payload = {
                ...course,
                organization_id: org.id
            };

            let result;
            if (isNew) {
                result = await supabase.from('courses').insert(payload).select().single();
            } else {
                result = await supabase.from('courses').update(payload).eq('id', courseId).select().single();
            }

            if (result.error) throw result.error;

            if (isNew) {
                navigate(`/${tenantSlug}/admin/courses/${result.data.id}`);
            } else {
                alert("Curso salvo!");
            }

        } catch (err) {
            console.error(err);
            alert("Erro ao salvar.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-white font-sans pl-64">
            <AdminSidebar />
            <main className="p-8 max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <button onClick={() => navigate(-1)} className="text-zinc-400 hover:text-white flex items-center gap-2">
                        <ArrowLeft size={20} /> Voltar
                    </button>
                    <h1 className="text-2xl font-bold">{isNew ? 'Criar Novo Curso' : 'Editar Curso'}</h1>
                </div>

                <form onSubmit={handleSave} className="space-y-6 bg-zinc-900/50 p-8 rounded-xl border border-zinc-800">
                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-2">Título do Curso</label>
                        <input
                            type="text"
                            value={course.title}
                            onChange={e => setCourse({ ...course, title: e.target.value })}
                            className="w-full bg-black border border-zinc-800 rounded p-3 text-white focus:border-white focus:outline-none"
                            placeholder="Ex: Masterclass de React"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-2">Descrição</label>
                        <textarea
                            value={course.description}
                            onChange={e => setCourse({ ...course, description: e.target.value })}
                            className="w-full bg-black border border-zinc-800 rounded p-3 text-white focus:border-white focus:outline-none min-h-[100px]"
                            placeholder="Sobre o que é este curso?"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-2">URL da Capa (Thumbnail)</label>
                        <input
                            type="url"
                            value={course.thumbnail_url}
                            onChange={e => setCourse({ ...course, thumbnail_url: e.target.value })}
                            className="w-full bg-black border border-zinc-800 rounded p-3 text-white focus:border-white focus:outline-none"
                            placeholder="https://..."
                        />
                    </div>

                    <div className="flex items-center gap-3 py-4">
                        <input
                            type="checkbox"
                            id="published"
                            checked={course.is_published}
                            onChange={e => setCourse({ ...course, is_published: e.target.checked })}
                            className="w-5 h-5 accent-netflix-red rounded cursor-pointer"
                        />
                        <label htmlFor="published" className="cursor-pointer select-none">Publicar Curso (Visível para alunos)</label>
                    </div>

                    <div className="pt-4 border-t border-zinc-800 flex justify-end">
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-white text-black px-8 py-3 rounded font-bold hover:bg-zinc-200 transition flex items-center gap-2"
                        >
                            <Save size={20} /> {loading ? 'Salvando...' : 'Salvar Alterações'}
                        </button>
                    </div>
                </form>

                {!isNew && (
                    <div className="mt-12">
                        <ModuleManager
                            courseId={courseId}
                            demoMode={courseId.startsWith('dev-course')}
                        />
                    </div>
                )}
            </main>
        </div>
    );
}
