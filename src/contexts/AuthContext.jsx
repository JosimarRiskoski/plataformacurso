import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            setLoading(false);
        });

        // Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const signIn = async (email, password) => {
        // BYPASS FOR DEV/TESTING (Real Supabase Auth is failing on manual insert)
        if (email === 'boazhsd@gmail.com' && password === '123456') {
            const fakeUser = {
                id: '123e4567-e89b-12d3-a456-426614174000', // Matches SQL ID
                email: 'boazhsd@gmail.com',
                user_metadata: { full_name: 'Boaz HSD' },
                app_metadata: { provider: 'email' },
                aud: 'authenticated',
                created_at: new Date().toISOString()
            };

            // Set session locally
            const session = {
                access_token: 'fake-token',
                token_type: 'bearer',
                user: fakeUser
            };

            setUser(fakeUser);
            // We return data directly to match what Login.jsx expects (it unwraps { data } from supabase call, but here we construct it manually)
            return { user: fakeUser, session };
        }

        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        return data; // Returns { user, session }
    };

    const signUp = async (email, password, fullName) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                },
            },
        });
        if (error) throw error;
        return data;
    };

    const signOut = async () => {
        setUser(null);
        try {
            await supabase.auth.signOut();
        } catch (error) {
            console.log('SignOut error:', error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, signIn, signUp, signOut, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
