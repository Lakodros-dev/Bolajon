'use client';

import { AuthProvider } from '@/context/AuthContext';
import { DataProvider } from '@/context/DataContext';
import { SubscriptionProvider } from '@/components/SubscriptionModal';

export default function Providers({ children }) {
    return (
        <AuthProvider>
            <SubscriptionProvider>
                <DataProvider>
                    {children}
                </DataProvider>
            </SubscriptionProvider>
        </AuthProvider>
    );
}
