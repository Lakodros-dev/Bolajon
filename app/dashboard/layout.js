'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/dashboard/Navbar';
import Sidebar from '@/components/dashboard/Sidebar';
import Footer from '@/components/dashboard/Footer';
import SubscriptionModal from '@/components/SubscriptionModal';

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

            setSubscriptionChecked(true);
        };

        checkSubscription();
    }, [isAuthenticated, user, getAuthHeader, router]);

    return (
        <ProtectedRoute allowedRoles={['teacher', 'admin']}>
            <div className="min-vh-100 d-flex flex-column" style={{ backgroundColor: '#f6f7f8' }}>
                <div className="d-flex flex-grow-1">
                    {/* Desktop Sidebar */}
                    <Sidebar />

                    {/* Main Content */}
                    <div className="flex-grow-1 dashboard-main d-flex flex-column">
                        <div className="dashboard-content mx-auto flex-grow-1">
                            {children}
                        </div>
                        {/* Footer - hidden on mobile due to bottom nav */}
                        <div className="d-none d-lg-block">
                            <Footer />
                        </div>
                    </div>
                </div>

                {/* Mobile Bottom Nav */}
                <Navbar />

                {/* Global Subscription Modal */}
                <SubscriptionModal />
            </div>
        </ProtectedRoute>
    );
}
