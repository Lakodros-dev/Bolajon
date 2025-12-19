'use client';

import { AuthProvider } from '@/context/AuthContext';
import { DataProvider } from '@/context/DataContext';

export default function Providers({ children }) {
    return (
        <AuthProvider>
            <DataProvider>
                {children}
            </DataProvider>
        </AuthProvider>
    );
}
