import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Send, User } from 'lucide-react';

export default function CommentsSection({ lessonId, userId }) {
    const [comments, setComments] = useState([]);
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (lessonId) {
            loadComments();
        }
    }, [lessonId]);

    async function loadComments() {
        try {
            const { data, error } = await supabase
                .from('comments')
                .select(`
            *,
            profiles ( full_name, avatar_url )
        `)
                .eq('lesson_id', lessonId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setComments(data || []);
        } catch (error) {
            console.error('Error loading comments:', error);
        } finally {
            setLoading(false);
        }
    }

    async function handleSendComment() {
        if (!content.trim()) return;

        try {
            // Insert comment
            // Note: In real setup, user_id is from auth. We use userId prop here.
            const { data, error } = await supabase
                .from('comments')
                .insert({
                    user_id: userId,
                    lesson_id: lessonId,
                    content
                })
                .select()
                .single();

            if (error) throw error;

            // Optimistic add (without profile data initially, or fetch it)
            const newComment = {
                ...data,
                profiles: { full_name: 'Usuário', avatar_url: null } // Placeholder until reload
            };

            setComments([newComment, ...comments]);
            setContent('');
        } catch (error) {
            console.error('Error sending comment:', error);
        }
    }

    function formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
    }

    return (
        <div className="space-y-6">
            <div className="flex gap-4">
                <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center shrink-0">
                    <User size={20} className="text-gray-400" />
                </div>
                <div className="flex-1">
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Adicione um comentário público..."
                        className="w-full bg-transparent border-b border-gray-700 focus:border-white text-white py-2 focus:outline-none transition min-h-[40px]"
                    />
                    <div className="flex justify-end mt-2">
                        <button
                            onClick={handleSendComment}
                            disabled={!content.trim()}
                            className="bg-white text-black px-4 py-2 rounded font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition"
                        >
                            Comentar
                        </button>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                {comments.map(comment => (
                    <div key={comment.id} className="flex gap-4">
                        <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center shrink-0 overflow-hidden">
                            {comment.profiles?.avatar_url ? (
                                <img src={comment.profiles.avatar_url} className="w-full h-full object-cover" />
                            ) : (
                                <User size={20} className="text-gray-400" />
                            )}
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="font-bold text-sm text-gray-300">
                                    {comment.profiles?.full_name || 'Usuário'}
                                </span>
                                <span className="text-xs text-gray-600">
                                    {formatDate(comment.created_at)}
                                </span>
                            </div>
                            <p className="text-gray-300 text-sm leading-relaxed">{comment.content}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
