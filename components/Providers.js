'use client';

import { AuthProvider } from '@/context/AuthContext';
import { DataProvider } from '@/context/DataContext';
import { SubscriptionProvider } from '@/components/SubscriptionModal';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export default function Providers({ children }) {
    // Create QueryClient with optimized settings
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 5 * 60 * 1000, // 5 minutes - ma'lumotlar 5 daqiqa "yangi" hisoblanadi
                cacheTime: 10 * 60 * 1000, // 10 minutes - cache da 10 daqiqa saqlanadi
                refetchOnWindowFocus: false, // Window focus bo'lganda qayta yuklamasin
                refetchOnMount: false, // Mount bo'lganda qayta yuklamasin (cache dan oladi)
                retry: 1, // Xato bo'lsa 1 marta qayta urinadi
            },
        },
    }));

    return (
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <SubscriptionProvider>
                    <DataProvider>
                        {children}
                    </DataProvider>
                </SubscriptionProvider>
            </AuthProvider>
        </QueryClientProvider>
    );
}
