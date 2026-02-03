import React from 'react';
import { Lock, PlayCircle, CheckCircle } from 'lucide-react';
import { cn } from '../lib/utils';

export default function CourseSidebar({ modules, currentLessonId, onLessonClick }) {
    return (
        <div className="bg-netflix-dark h-full overflow-y-auto border-l border-gray-800 w-full">
            <div className="p-4 border-b border-gray-800">
                <h3 className="text-white font-bold text-lg">Conteúdo do Curso</h3>
            </div>

            <div className="pb-20">
                {modules.map((module) => (
                    <div key={module.id} className="border-b border-gray-800/50">
                        <div className="bg-gray-900/50 px-4 py-3 text-gray-300 font-semibold text-sm uppercase tracking-wider">
                            {module.title}
                        </div>

                        <div>
                            {module.lessons?.map((lesson) => {
                                const isActive = lesson.id === currentLessonId;
                                const isLocked = lesson.isLocked; // Propriedade injetada pelo componente pai

                                return (
                                    <div
                                        key={lesson.id}
                                        onClick={() => !isLocked && onLessonClick(lesson)}
                                        className={cn(
                                            "group flex items-start gap-3 p-4 cursor-pointer transition-colors relative hover:bg-white/5",
                                            isActive && "bg-white/10",
                                            isLocked && "opacity-50 cursor-not-allowed hover:bg-transparent"
                                        )}
                                    >
                                        {/* Indicador Ativo Lateral */}
                                        {isActive && (
                                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-netflix-red"></div>
                                        )}

                                        <div className="mt-1 shrink-0">
                                            {isLocked ? (
                                                <Lock size={16} className="text-gray-500" />
                                            ) : lesson.completed ? ( // Assumindo propriedade completed
                                                <CheckCircle size={18} className="text-green-500" />
                                            ) : (
                                                <PlayCircle size={18} className={cn("text-gray-400 group-hover:text-white transition", isActive && "text-netflix-red")} />
                                            )}
                                        </div>

                                        <div className="flex-1">
                                            <h4 className={cn("text-sm font-medium leading-tight mb-1", isActive ? "text-white" : "text-gray-300")}>
                                                {lesson.title}
                                            </h4>
                                            <span className="text-xs text-gray-500">{Math.floor(lesson.duration / 60)} min</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
