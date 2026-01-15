'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import NProgress from 'nprogress';

// Configure NProgress for instant feedback
NProgress.configure({
    showSpinner: false,
    speed: 100,
    minimum: 0.3,
    trickleSpeed: 20,
    trickle: true
});

export default function TopLoader() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const isNavigating = useRef(false);

    // Complete progress when route changes
    useEffect(() => {
        if (isNavigating.current) {
            NProgress.done();
            isNavigating.current = false;
        }
    }, [pathname, searchParams]);

    // Start progress on link clicks - capture phase for immediate response
    useEffect(() => {
        const handleClick = (e) => {
            const target = e.target.closest('a');
            if (target && target.href) {
                try {
                    const targetUrl = new URL(target.href);
                    const currentUrl = new URL(window.location.href);

                    // Check if it's an internal navigation to a different page
                    if (targetUrl.origin === currentUrl.origin &&
                        targetUrl.pathname !== currentUrl.pathname &&
                        !target.target && // Not opening in new tab
                        !e.ctrlKey && !e.metaKey && !e.shiftKey) { // Not modifier keys
                        isNavigating.current = true;
                        NProgress.start();
                    }
                } catch (err) {
                    // Invalid URL, ignore
                }
            }
        };

        // Use capture phase for immediate response
        document.addEventListener('click', handleClick, true);

        return () => {
            document.removeEventListener('click', handleClick, true);
        };
    }, []);

    // Handle browser back/forward
    useEffect(() => {
        const handlePopState = () => {
            isNavigating.current = true;
            NProgress.start();
        };

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    return null;
}
