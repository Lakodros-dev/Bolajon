                                                                                                                                                                                                            'use client';

/**
 * Authentication Context
 * Manages user authentication state across the app
 * Optimized with useMemo and useCallback
 */
import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    // Load user from localStorage on mount - IMMEDIATELY set loading to false
    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
            setLoading(false); // Immediately allow rendering
            // Verify token in background (non-blocking)
            verifyTokenInBackground(storedToken);
        } else {
            setLoading(false);
        }
    }, []);

    // Verify token in background - doesn't block UI
    const verifyTokenInBackground = async (tokenToVerify) => {
        try {
            const res = await fetch('/api/auth/me', {
                headers: {
                    'Authorization': `Bearer ${tokenToVerify}`
                }
            });

            if (res.ok) {
                const data = await res.json();
                setUser(data.user);
                localStorage.setItem('user', JSON.stringify(data.user));
            } else {
                // Token invalid, clear storage
                logout();
            }
        } catch (error) {
            console.error('Token verification failed:', error);
        }
    };


    // Login function - memoized
    const login = useCallback(async (phone, password) => {
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone, password })
            });

            const data = await res.json();

            if (data.success) {
                setToken(data.token);
                setUser(data.user);
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                return { success: true };
            } else {
                return { success: false, error: data.error };
            }
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: 'Kirishda xatolik. Qaytadan urinib ko\'ring.' };
        }
    }, []);

    // Register function - memoized
    const register = useCallback(async (name, phone, password) => {
        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, phone, password })
            });

            const data = await res.json();

            if (data.success) {
                setToken(data.token);
                setUser(data.user);
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                return { success: true };
            } else {
                return { success: false, error: data.error };
            }
        } catch (error) {
            return { success: false, error: 'Ro\'yxatdan o\'tishda xatolik. Qaytadan urinib ko\'ring.' };
        }
    }, []);

    // Logout function - memoized
    const logout = useCallback(() => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/login');
    }, [router]);

    // Check if user is admin - memoized
    const isAdmin = useCallback(() => user?.role === 'admin', [user]);

    // Check if user is teacher - memoized
    const isTeacher = useCallback(() => user?.role === 'teacher', [user]);

    // Get auth header for API calls - memoized
    const getAuthHeader = useCallback(() => ({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    }), [token]);

    // Memoize context value to prevent unnecessary re-renders
    const contextValue = useMemo(() => ({
        user,
        token,
        loading,
        login,
        register,
        logout,
        isAdmin,
        isTeacher,
        getAuthHeader,
        isAuthenticated: !!token
    }), [user, token, loading, login, register, logout, isAdmin, isTeacher, getAuthHeader]);

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
}

// Custom hook to use auth context
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export default AuthContext;
