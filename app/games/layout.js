'use client';

import ProtectedRoute from '@/components/ProtectedRoute';

// O'yinlar uchun alohida layout - sidebar va navbarsiz, faqat himoyalangan
export default function GamesLayout({ children }) {
    return (
        <ProtectedRoute allowedRoles={['teacher', 'admin']}>
            {children}
        </ProtectedRoute>
    );
}
