'use client';

import { Suspense } from 'react';
import { AdminRoute } from '@/components/ProtectedRoute';
import AdminSidebar from '@/components/admin/AdminSidebar';

function PageLoader() {
    return (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
            <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Yuklanmoqda...</span>
            </div>
        </div>
    );
}

export default function AdminLayout({ children }) {
    return (
        <AdminRoute>
            <div className="d-flex min-vh-100" style={{ backgroundColor: '#f6f7f8' }}>
                <AdminSidebar />
                <main className="flex-grow-1 p-4" style={{ marginLeft: '250px' }}>
                    <Suspense fallback={<PageLoader />}>
                        {children}
                    </Suspense>
                </main>
            </div>
        </AdminRoute>
    );
}
