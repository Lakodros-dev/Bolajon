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
            <div className="min-vh-100" style={{ backgroundColor: '#f6f7f8' }}>
                <AdminSidebar />
                {/* Main content - responsive margin */}
                <main
                    className="p-3 p-lg-4"
                    style={{
                        marginLeft: '0',
                        paddingTop: '76px', // Mobile header height
                    }}
                >
                    <style jsx global>{`
                        @media (min-width: 992px) {
                            main {
                                margin-left: 280px !important;
                                padding-top: 0 !important;
                            }
                        }
                    `}</style>
                    <Suspense fallback={<PageLoader />}>
                        {children}
                    </Suspense>
                </main>
            </div>
        </AdminRoute>
    );
}
