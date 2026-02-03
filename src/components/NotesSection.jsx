import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Save, Trash2, Clock } from 'lucide-react';

export default function NotesSection({ lessonId, userId, playerRef }) {
    const [notes, setNotes] = useState([]);
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (lessonId && userId) {
            loadNotes();
        }
    }, [lessonId, userId]);

    async function loadNotes() {
        try {
            const { data, error } = await supabase
                .from('notes')
                .select('*')
                .eq('lesson_id', lessonId)
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setNotes(data || []);
        } catch (error) {
            console.error('Error loading notes:', error);
        } finally {
            setLoading(false);
        }
    }

    async function handleSaveNote() {
        if (!content.trim()) return;

        try {
            // Get current video time if possible
            const timestamp = playerRef?.current?.getCurrentTime() || 0;

            const { data, error } = await supabase
                .from('notes')
                .insert({
                    user_id: userId,
                    lesson_id: lessonId,
                    content,
                    timestamp_seconds: Math.floor(timestamp)
                })
                .select()
                .single();

            if (error) throw error;

            setNotes([data, ...notes]);
            setContent('');
        } catch (error) {
            console.error('Error saving note:', error);
        }
    }

    async function handleDeleteNote(id) {
        try {
            const { error } = await supabase.from('notes').delete().eq('id', id);
            if (error) throw error;
            setNotes(notes.filter(n => n.id !== id));
        } catch (error) {
            console.error('Error deleting note:', error);
        }
    }

    function formatTime(seconds) {
        const min = Math.floor(seconds / 60);
        const sec = Math.floor(seconds % 60);
        return `${min}:${sec < 10 ? '0' : ''}${sec}`;
    }

    return (
        <div className="space-y-6">
            <div className="bg-gray-900 p-4 rounded-lg border border-gray-800">
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Faça uma anotação sobre este momento..."
                    className="w-full bg-transparent text-white placeholder-gray-500 focus:outline-none resize-none min-h-[80px]"
                />
                <div className="flex justify-between items-center mt-2 border-t border-gray-800 pt-2">
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock size={12} /> {formatTime(playerRef?.current?.getCurrentTime() || 0)}
                    </span>
                    <button
                        onClick={handleSaveNote}
                        className="bg-netflix-red px-4 py-1.5 rounded text-sm font-bold flex items-center gap-2 hover:bg-red-700 transition"
                    >
                        <Save size={14} /> Salvar
                    </button>
                </div>
            </div>

            <div className="space-y-4">
                {notes.length === 0 && !loading && (
                    <p className="text-gray-500 text-center text-sm py-4">Nenhuma anotação nesta aula.</p>
                )}
                {notes.map(note => (
                    <div key={note.id} className="bg-gray-800/50 p-4 rounded border border-gray-800 relative group">
                        <button
                            onClick={() => handleDeleteNote(note.id)}
                            className="absolute top-2 right-2 text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
                        >
                            <Trash2 size={14} />
                        </button>
                        <div
                            className="mb-2 text-xs text-netflix-red font-mono bg-red-500/10 inline-block px-1.5 rounded cursor-pointer hover:underline"
                            onClick={() => playerRef?.current?.seekTo(note.timestamp_seconds)}
                        >
                            {formatTime(note.timestamp_seconds)}
                        </div>
                        <p className="text-gray-300 text-sm whitespace-pre-wrap">{note.content}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
