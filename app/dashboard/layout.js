'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/dashboard/Navbar';
import Sidebar from '@/components/dashboard/Sidebar';

export default function DashboardLayout({ children }) {
    const router = useRouter();
    const { user, getAuthHeader, isAuthenticated } = useAuth();
    const [subscriptionChecked, setSubscriptionChecked] = useState(false);

    useEffect(() => {
        const checkSubscription = async () => {
            if (!isAuthenticated || !user) return;

            // Admin always has access
            if (user.role === 'admin') {
                setSubscriptionChecked(true);
                return;
            }

            try {
                const res = await fetch('/api/subscription/check', {
                    headers: getAuthHeader()
                });
                const data = await res.json();

                if (data.success && !data.isValid) {
                    router.replace('/blocked');
                } else {
                    setSubscriptionChecked(true);
                }
            } catch (error) {
                console.error('Subscription check failed:', error);
                setSubscriptionChecked(true);
            }
        };

        checkSubscription();
    }, [isAuthenticated, user, getAuthHeader, router]);

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
