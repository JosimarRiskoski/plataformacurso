import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import VideoPlayer from '../components/VideoPlayer';
import CourseSidebar from '../components/CourseSidebar';
import NotesSection from '../components/NotesSection';
import CommentsSection from '../components/CommentsSection';
import { ArrowLeft, Menu, MessageSquare, NotebookPen } from 'lucide-react';
import { cn } from '../lib/utils';

export default function WatchPage() {
    const { tenantSlug, courseId, lessonId } = useParams();
    const navigate = useNavigate();
    const playerRef = useRef(null); // Reference to pass to Notes

    const [loading, setLoading] = useState(true);
    const [modules, setModules] = useState([]);
    const [course, setCourse] = useState(null);
    const [currentLesson, setCurrentLesson] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [progressMap, setProgressMap] = useState({});
    const [activeTab, setActiveTab] = useState('comments'); // 'comments' | 'notes'

    // Mock User ID for development
    const MOCK_USER_ID = '00000000-0000-0000-0000-000000000000';

    useEffect(() => {
        async function fetchCourseData() {
            try {
                setLoading(true);

                const { data: courseData, error: courseError } = await supabase
                    .from('courses')
                    .select('*')
                    .eq('id', courseId)
                    .single();

                if (courseError) throw courseError;
                setCourse(courseData);

                const { data: modulesData, error: modulesError } = await supabase
                    .from('modules')
                    .select(`*, lessons (*)`)
                    .eq('course_id', courseId)
                    .order('order_index');

                if (modulesError) throw modulesError;

                modulesData.forEach(m => {
                    m.lessons.sort((a, b) => a.order_index - b.order_index);
                });

                const { data: progressData } = await supabase
                    .from('progress')
                    .select('lesson_id, completed, last_position');

                const pMap = {};
                if (progressData) {
                    progressData.forEach(p => pMap[p.lesson_id] = p);
                }
                setProgressMap(pMap);

                // Logic for Locking
                let previousLessonCompleted = true;
                modulesData.forEach(m => {
                    m.lessons.forEach(l => {
                        l.isLocked = !previousLessonCompleted;
                        l.completed = pMap[l.id]?.completed || false;

                        if (l.completed) {
                            previousLessonCompleted = true;
                        } else {
                            previousLessonCompleted = !l.block_next;
                        }
                    });
                });

                setModules(modulesData);

                const allLessons = modulesData.flatMap(m => m.lessons);

                // Define Current Lesson
                if (lessonId) {
                    const found = allLessons.find(l => l.id === lessonId);
                    if (found) setCurrentLesson(found);
                } else if (allLessons.length > 0) {
                    // Auto-select first available
                    const firstUncompleted = allLessons.find(l => !l.completed && !l.isLocked);
                    const target = firstUncompleted || allLessons[0];
                    setCurrentLesson(target);
                    // Replace URL
                    navigate(`/${tenantSlug}/assistir/${courseId}/${target.id}`, { replace: true });
                }

            } catch (err) {
                console.error("Error loading course:", err);
            } finally {
                setLoading(false);
            }
        }

        if (courseId) {
            fetchCourseData();
        }
    }, [courseId, lessonId, tenantSlug, navigate]);

    const handleLessonClick = (lesson) => {
        if (lesson.isLocked) return;
        navigate(`/${tenantSlug}/assistir/${courseId}/${lesson.id}`);
    };

    const handleLessonComplete = async () => {
        if (!currentLesson) return;
        const newMap = { ...progressMap, [currentLesson.id]: { completed: true } };
        setProgressMap(newMap);

        try {
            await supabase
                .from('progress')
                .upsert({
                    user_id: MOCK_USER_ID,
                    lesson_id: currentLesson.id,
                    completed: true
                });

            // Force slight delay then reload to update locks? 
            // Or just rely on state update if we implemented it fully.
            // For reliability in this strict blocking mode:
            window.location.reload();
        } catch (e) { console.error(e); }
    };

    if (loading || authLoading) return <div className="bg-netflix-black min-h-screen flex items-center justify-center text-white">Carregando...</div>;

    return (
        <div className="flex h-screen bg-netflix-black text-white overflow-hidden font-sans">
            {/* Sidebar */}
            <div className={cn(
                "fixed inset-y-0 right-0 w-96 bg-netflix-dark transform transition-transform duration-300 z-40 border-l border-gray-800",
                sidebarOpen ? "translate-x-0" : "translate-x-full"
            )}>
                <CourseSidebar
                    modules={modules}
                    currentLessonId={currentLesson?.id}
                    onLessonClick={handleLessonClick}
                />
            </div>

            {/* Main Content */}
            <div className={cn(
                "flex-1 flex flex-col h-full transition-all duration-300",
                sidebarOpen ? "mr-96" : "mr-0"
            )}>
                {/* Top Bar */}
                <div className="h-16 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-6 z-30 shadow-lg">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate(`/${tenantSlug}`)} className="p-2 hover:bg-white/10 rounded-full transition">
                            <ArrowLeft size={20} />
                        </button>
                        <div className="border-l border-gray-700 pl-4">
                            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-0.5">{course?.title}</h2>
                            <h1 className="text-lg font-bold truncate max-w-2xl text-white">{currentLesson?.title}</h1>
                        </div>
                    </div>

                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className={cn("p-2 rounded hover:bg-white/10 transition flex items-center gap-2 text-sm font-medium", sidebarOpen && "text-netflix-red")}
                    >
                        {sidebarOpen ? 'Fechar Aulas' : 'Ver Aulas'} <Menu size={20} />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 bg-black overflow-y-auto scrollbar-thin scrollbar-thumb-gray-800">
                    <div className="max-w-5xl mx-auto p-6 pb-20">
                        {currentLesson ? (
                            <>
                                <VideoPlayer
                                    url={currentLesson.video_url}
                                    onEnded={handleLessonComplete}
                                // Pass ref logic if VideoPlayer exposes it? 
                                // Actually VideoPlayer is a functional component. We need forwardRef or pass ref prop.
                                // Assuming VideoPlayer doesn't support ref prop out of box, we need to update VideoPlayer to forward ref.
                                // OR we just assume VideoPlayer uses internal ref.
                                // NotesSection needs playerRef to get currentTime.
                                // I'll update VideoPlayer to forwardRef in next step or use a callback.
                                // For now let's pass null and correct VideoPlayer later.
                                />

                                <div className="mt-8 flex flex-col md:flex-row gap-8">
                                    <div className="flex-1">
                                        <h2 className="text-3xl font-bold mb-4">{currentLesson.title}</h2>
                                        <p className="text-gray-400 leading-relaxed text-lg mb-8">{currentLesson.description}</p>

                                        {/* Tabs */}
                                        <div className="border-b border-gray-800 flex gap-8 mb-6">
                                            <button
                                                onClick={() => setActiveTab('comments')}
                                                className={cn(
                                                    "pb-4 text-sm font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition",
                                                    activeTab === 'comments' ? "border-netflix-red text-white" : "border-transparent text-gray-500 hover:text-white"
                                                )}
                                            >
                                                <MessageSquare size={18} /> Comentários
                                            </button>
                                            <button
                                                onClick={() => setActiveTab('notes')}
                                                className={cn(
                                                    "pb-4 text-sm font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition",
                                                    activeTab === 'notes' ? "border-netflix-red text-white" : "border-transparent text-gray-500 hover:text-white"
                                                )}
                                            >
                                                <NotebookPen size={18} /> Minhas Anotações
                                            </button>
                                        </div>

                                        {activeTab === 'comments' ? (
                                            <CommentsSection lessonId={currentLesson.id} userId={MOCK_USER_ID} />
                                        ) : (
                                            // Hack: We need ref to player to get time. 
                                            // I'll handle this detail later or assume global event?
                                            // Best is to pass methods.
                                            <NotesSection lessonId={currentLesson.id} userId={MOCK_USER_ID} playerRef={null} />
                                        )}
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="text-center mt-20 text-gray-500">Selecione uma aula</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
