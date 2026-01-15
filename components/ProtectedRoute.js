'use client';

/**
 * Protected Route Component
 * Wraps pages that require authentication
 */
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function ProtectedRoute({ children, allowedRoles = ['admin', 'teacher'] }) {
    const { user, loading, isAuthenticated } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (!isAuthenticated) {
                router.push('/login');
            } else if (!allowedRoles.includes(user?.role)) {
                // Redirect to appropriate dashboard based on role
                if (user?.role === 'admin') {
                    router.push('/admin');
                } else {
                    router.push('/dashboard');
                }
            }
        }
    }, [loading, isAuthenticated, user, router, allowedRoles]);

    // Show loading state
    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center min-vh-100">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    // Don't render if not authenticated or wrong role
    if (!isAuthenticated || !allowedRoles.includes(user?.role)) {
        return null;
    }

    return children;
}

/**
 * Admin Only Route
 */
export function AdminRoute({ children }) {
    return (
        <ProtectedRoute allowedRoles={['admin']}>
            {children}
        </ProtectedRoute>
    );
}

/**
 * Teacher Only Route
 */
export function TeacherRoute({ children }) {
    return (
        <ProtectedRoute allowedRoles={['teacher']}>
            {children}
        </ProtectedRoute>
    );
}
