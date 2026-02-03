import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, Trash2, GripVertical, Video, ChevronDown, ChevronRight, Edit2, Upload, Youtube, X } from 'lucide-react';
import Modal from './Modal';

export default function ModuleManager({ courseId, demoMode = false }) {
    const [modules, setModules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedModules, setExpandedModules] = useState({});

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState(null); // 'add-module', 'edit-module', 'add-lesson', 'edit-lesson'
    const [selectedItem, setSelectedItem] = useState(null); // Stores the ID or object being edited
    const [formData, setFormData] = useState({ title: '', videoUrl: '', isUpload: false, file: null });
    const [uploading, setUploading] = useState(false);

    // Init Mock Data
    useEffect(() => {
        if (demoMode) {
            setModules([
                {
                    id: 1, title: 'Introdução ao Curso', order_index: 0,
                    lessons: [
                        { id: 101, title: 'Boas vindas', video_url: 'https://youtube.com/watch?v=hello', duration: 120, order_index: 0 },
                        { id: 102, title: 'Configurando Ambiente', video_url: 'https://youtube.com/watch?v=setup', duration: 300, order_index: 1 }
                    ]
                },
                {
                    id: 2, title: 'Conceitos Básicos', order_index: 1,
                    lessons: []
                }
            ]);
            setLoading(false);
            setExpandedModules({ 1: true });
            return;
        }
        loadModules();
    }, [courseId, demoMode]);

    async function loadModules() {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('modules')
                .select(`*, lessons(*)`)
                .eq('course_id', courseId)
                .order('order_index');

            if (error) throw error;

            data.forEach(m => m.lessons.sort((a, b) => a.order_index - b.order_index));
            setModules(data);
            if (data.length > 0) toggleExpand(data[0].id);

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    const toggleExpand = (modId) => {
        setExpandedModules(prev => ({ ...prev, [modId]: !prev[modId] }));
    };

    // --- Actions Wrappers ---
    const openAddModule = () => {
        setFormData({ title: '' });
        setModalMode('add-module');
        setIsModalOpen(true);
    };

    const openEditModule = (module) => {
        setFormData({ title: module.title });
        setSelectedItem(module);
        setModalMode('edit-module');
        setIsModalOpen(true);
    };

    const openAddLesson = (moduleId) => {
        setFormData({ title: '', videoUrl: '', isUpload: false, file: null });
        setSelectedItem({ moduleId }); // Pass parent ID
        setModalMode('add-lesson');
        setIsModalOpen(true);
    };

    const openEditLesson = (lesson, moduleId) => {
        setFormData({ title: lesson.title, videoUrl: lesson.video_url, isUpload: false, file: null });
        setSelectedItem({ ...lesson, moduleId });
        setModalMode('edit-lesson');
        setIsModalOpen(true);
    };

    // --- Logic ---
    const handleSaveModule = async () => {
        if (!formData.title) return;

        if (modalMode === 'edit-module') {
            const modId = selectedItem.id;
            if (demoMode) {
                setModules(modules.map(m => m.id === modId ? { ...m, title: formData.title } : m));
            } else {
                await supabase.from('modules').update({ title: formData.title }).eq('id', modId);
                loadModules();
            }
        } else {
            // Add
            if (demoMode) {
                const newMod = { id: Date.now(), title: formData.title, order_index: modules.length, lessons: [] };
                setModules([...modules, newMod]);
            } else {
                await supabase.from('modules').insert({ course_id: courseId, title: formData.title, order_index: modules.length + 1 });
                loadModules();
            }
        }
        setIsModalOpen(false);
    };

    const handleSaveLesson = async () => {
        if (!formData.title) return;
        setUploading(true);

        const lessonId = selectedItem.id; // Undefined if adding
        const moduleId = selectedItem.moduleId;

        // Handle Upload if file selected
        let finalUrl = formData.videoUrl;

        if (formData.isUpload && formData.file) {
            if (demoMode) {
                await new Promise(r => setTimeout(r, 1500));
                finalUrl = URL.createObjectURL(formData.file);
            } else {
                try {
                    const file = formData.file;
                    const fileExt = file.name.split('.').pop();
                    const fileName = `${Date.now()}.${fileExt}`;
                    const filePath = `${moduleId}/${fileName}`;

                    const { error: uploadError } = await supabase.storage.from('course-videos').upload(filePath, file);
                    if (uploadError) throw uploadError;

                    const { data: { publicUrl } } = supabase.storage.from('course-videos').getPublicUrl(filePath);
                    finalUrl = publicUrl;
                } catch (e) {
                    alert("Erro update: " + e.message);
                    setUploading(false);
                    return;
                }
            }
        }

        if (modalMode === 'edit-lesson') {
            if (demoMode) {
                setModules(modules.map(m => {
                    if (m.id === moduleId) {
                        return {
                            ...m,
                            lessons: m.lessons.map(l => l.id === lessonId ? { ...l, title: formData.title, video_url: finalUrl } : l)
                        };
                    }
                    return m;
                }));
            } else {
                await supabase.from('lessons').update({ title: formData.title, video_url: finalUrl }).eq('id', lessonId);
                loadModules();
            }
        } else {
            // Add Lesson
            if (demoMode) {
                setModules(modules.map(m => {
                    if (m.id === moduleId) {
                        return {
                            ...m,
                            lessons: [...(m.lessons || []), { id: Date.now(), title: formData.title, video_url: finalUrl, order_index: (m.lessons?.length || 0) }]
                        };
                    }
                    return m;
                }));
            } else {
                const module = modules.find(m => m.id === moduleId);
                const newOrder = (module.lessons?.length || 0) + 1;
                await supabase.from('lessons').insert({ module_id: moduleId, title: formData.title, video_url: finalUrl, order_index: newOrder, duration: 0 });
                loadModules();
            }
        }

        setUploading(false);
        setIsModalOpen(false);
    };

    const handleDeleteModule = async (id) => {
        if (!confirm("Tem certeza que deseja apagar este módulo e todas as suas aulas?")) return;

        if (demoMode) {
            setModules(modules.filter(m => m.id !== id));
            return;
        }
        try {
            await supabase.from('modules').delete().eq('id', id);
            loadModules();
        } catch (e) { alert("Erro ao deletar"); }
    };

    const handleDeleteLesson = async (id, moduleId) => {
        if (!confirm("Apagar aula?")) return;

        if (demoMode) {
            setModules(modules.map(m => m.id === moduleId ? { ...m, lessons: m.lessons.filter(l => l.id !== id) } : m));
            return;
        }
        await supabase.from('lessons').delete().eq('id', id);
        loadModules();
    };

    if (loading) return <div className="text-zinc-500">Carregando módulos...</div>;

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center bg-zinc-900/50 p-4 rounded-lg border border-zinc-800">
                <h3 className="font-bold text-lg">Conteúdo do Curso</h3>
                <button onClick={openAddModule} className="text-sm bg-white text-black px-3 py-1.5 rounded font-bold hover:bg-zinc-200 transition flex items-center gap-1">
                    <Plus size={16} /> Novo Módulo
                </button>
            </div>

            <div className="space-y-4">
                {modules.map((module) => (
                    <div key={module.id} className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden transition-all">
                        <div className="flex items-center justify-between p-4 bg-zinc-800/50 cursor-pointer hover:bg-zinc-800 transition" onClick={() => toggleExpand(module.id)}>
                            <div className="flex items-center gap-3">
                                <button className="text-zinc-500 hover:text-white"><GripVertical size={16} /></button>
                                {expandedModules[module.id] ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                                <span className="font-bold text-zinc-200">{module.title}</span>
                                <span className="text-xs text-zinc-500 ml-2">({module.lessons?.length || 0} aulas)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={(e) => { e.stopPropagation(); openEditModule(module); }} className="p-2 text-zinc-500 hover:text-white" title="Editar Nome"><Edit2 size={16} /></button>
                                <button onClick={(e) => { e.stopPropagation(); handleDeleteModule(module.id); }} className="p-2 text-zinc-500 hover:text-red-500" title="Apagar Módulo"><Trash2 size={16} /></button>
                            </div>
                        </div>

                        {expandedModules[module.id] && (
                            <div className="p-2 bg-black/20 space-y-2">
                                {module.lessons?.map(lesson => (
                                    <div key={lesson.id} className="flex items-center justify-between p-3 ml-8 bg-zinc-900 hover:bg-zinc-800 rounded border border-zinc-800/50 group">
                                        <div className="flex items-center gap-3">
                                            <Video size={16} className="text-zinc-500" />
                                            <span className="text-sm text-zinc-300">{lesson.title}</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => openEditLesson(lesson, module.id)} className="p-1.5 text-zinc-400 hover:text-white" title="Editar Aula"><Edit2 size={14} /></button>
                                            <button onClick={() => handleDeleteLesson(lesson.id, module.id)} className="p-1.5 text-zinc-400 hover:text-red-500" title="Apagar Aula"><Trash2 size={14} /></button>
                                        </div>
                                    </div>
                                ))}

                                <button
                                    onClick={() => openAddLesson(module.id)}
                                    className="w-full py-2 ml-8 border border-dashed border-zinc-800 rounded text-zinc-500 text-sm hover:text-white hover:border-zinc-600 transition flex items-center justify-center gap-2"
                                >
                                    <Plus size={14} /> Adicionar Aula
                                </button>
                            </div>
                        )}
                    </div>
                ))}
                {modules.length === 0 && <div className="text-center py-8 text-zinc-500">Nenhum módulo criado.</div>}
            </div>

            {/* MODAL */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={
                    modalMode === 'add-module' ? 'Novo Módulo' :
                        modalMode === 'edit-module' ? 'Editar Módulo' :
                            modalMode === 'add-lesson' ? 'Nova Aula' : 'Editar Aula'
                }
                footer={
                    <>
                        <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white transition">Cancelar</button>
                        <button
                            onClick={modalMode.includes('module') ? handleSaveModule : handleSaveLesson}
                            disabled={uploading}
                            className="px-4 py-2 text-sm font-medium bg-white text-black rounded hover:bg-zinc-200 transition"
                        >
                            {uploading ? 'Salvando...' : 'Salvar'}
                        </button>
                    </>
                }
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-1">Título</label>
                        <input
                            type="text"
                            className="w-full bg-black border border-zinc-800 rounded p-2 text-white focus:outline-none focus:border-white"
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            autoFocus
                        />
                    </div>

                    {modalMode.includes('lesson') && (
                        <div className="space-y-3">
                            <label className="block text-sm font-medium text-zinc-400 mb-1">Vídeo</label>

                            <div className="flex gap-2 mb-2 p-1 bg-zinc-800 rounded-lg inline-flex">
                                <button
                                    onClick={() => setFormData({ ...formData, isUpload: false })}
                                    className={`px-3 py-1.5 text-xs font-bold rounded-md flex items-center gap-2 transition ${!formData.isUpload ? 'bg-zinc-600 text-white' : 'text-zinc-400 hover:text-white'}`}
                                >
                                    <Youtube size={14} /> Link Externo
                                </button>
                                <button
                                    onClick={() => setFormData({ ...formData, isUpload: true })}
                                    className={`px-3 py-1.5 text-xs font-bold rounded-md flex items-center gap-2 transition ${formData.isUpload ? 'bg-zinc-600 text-white' : 'text-zinc-400 hover:text-white'}`}
                                >
                                    <Upload size={14} /> Upload Arquivo
                                </button>
                            </div>

                            {!formData.isUpload ? (
                                <input
                                    type="url"
                                    className="w-full bg-black border border-zinc-800 rounded p-2 text-white focus:outline-none focus:border-white text-sm"
                                    placeholder="https://youtube.com/..."
                                    value={formData.videoUrl}
                                    onChange={e => setFormData({ ...formData, videoUrl: e.target.value })}
                                />
                            ) : (
                                <div className="border border-dashed border-zinc-700 bg-zinc-800/30 rounded p-4 text-center cursor-pointer hover:bg-zinc-800/50 transition relative">
                                    <input
                                        type="file"
                                        accept="video/*"
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                        onChange={e => setFormData({ ...formData, file: e.target.files[0] })}
                                    />
                                    <div className="flex flex-col items-center gap-2 text-zinc-400">
                                        <Upload size={24} />
                                        <span className="text-sm">{formData.file ? formData.file.name : "Clique para escolher o vídeo"}</span>
                                    </div>
                                </div>
                            )}

                            {modalMode === 'edit-lesson' && !formData.file && formData.videoUrl && (
                                <p className="text-xs text-zinc-500 truncate mt-1">Atual: {formData.videoUrl}</p>
                            )}
                        </div>
                    )}
                </div>
            </Modal>
        </div>
    );
}
