'use client';

import { useEffect } from 'react';

export default function BootstrapClient() {
    useEffect(() => {
        // Import Bootstrap JS on client side
        require('bootstrap/dist/js/bootstrap.bundle.min.js');
    }, []);

    return null;
}
