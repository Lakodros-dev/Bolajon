'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/dashboard/Navbar';
import Sidebar from '@/components/dashboard/Sidebar';

export default function DashboardLayout({ children }) {
    return (
        <ProtectedRoute allowedRoles={['teacher', 'admin']}>
            <div className="min-vh-100 d-flex" style={{ backgroundColor: '#f6f7f8' }}>
                {/* Desktop Sidebar */}
                <Sidebar />

                {/* Main Content */}
                <div className="flex-grow-1 dashboard-main">
                    <div className="dashboard-content mx-auto">
                        {children}
                    </div>
                </div>

                {/* Mobile Bottom Nav */}
                <Navbar />
            </div>
        </ProtectedRoute>
    );
}
