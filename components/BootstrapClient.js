'use client';

import { useEffect } from 'react';

export default function BootstrapClient() {
    useEffect(() => {
        // Import Bootstrap JS on client side using dynamic import
        import('bootstrap/dist/js/bootstrap.bundle.min.js')
            .then(() => {
                console.log('✅ Bootstrap JS loaded');
            })
            .catch((err) => {
                console.error('❌ Failed to load Bootstrap JS:', err);
            });
    }, []);

    return null;
}
