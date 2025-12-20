'use client';

import { useEffect, useState } from 'react';

export default function PWAInstall() {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [showInstall, setShowInstall] = useState(false);

    useEffect(() => {
        // Register service worker
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker
                .register('/sw.js')
                .then((registration) => {
                    console.log('SW registered:', registration.scope);
                })
                .catch((error) => {
                    console.log('SW registration failed:', error);
                });
        }

        // Listen for install prompt
        const handleBeforeInstall = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setShowInstall(true);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstall);

        // Check if already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setShowInstall(false);
        }

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
        };
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            setShowInstall(false);
        }
        setDeferredPrompt(null);
    };

    const handleDismiss = () => {
        setShowInstall(false);
        // Don't show again for 7 days
        localStorage.setItem('pwa-dismissed', Date.now().toString());
    };

    // Check if dismissed recently
    useEffect(() => {
        const dismissed = localStorage.getItem('pwa-dismissed');
        if (dismissed) {
            const daysSince = (Date.now() - parseInt(dismissed)) / (1000 * 60 * 60 * 24);
            if (daysSince < 7) {
                setShowInstall(false);
            }
        }
    }, []);

    if (!showInstall) return null;

    return (
        <div
            className="position-fixed bottom-0 start-0 end-0 p-3"
            style={{ zIndex: 1060 }}
        >
            <div
                className="bg-white rounded-4 shadow-lg p-3 mx-auto d-flex align-items-center gap-3"
                style={{ maxWidth: '400px' }}
            >
                <div
                    className="rounded-3 bg-primary bg-opacity-10 p-2 flex-shrink-0"
                >
                    <span className="material-symbols-outlined text-primary" style={{ fontSize: '28px' }}>
                        install_mobile
                    </span>
                </div>
                <div className="flex-grow-1">
                    <p className="fw-semibold mb-0" style={{ fontSize: '14px' }}>
                        Ilovani o'rnating
                    </p>
                    <p className="text-muted mb-0" style={{ fontSize: '12px' }}>
                        Tezroq kirish uchun
                    </p>
                </div>
                <button
                    onClick={handleDismiss}
                    className="btn btn-light btn-sm rounded-circle p-1"
                >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
                </button>
                <button
                    onClick={handleInstall}
                    className="btn btn-primary btn-sm rounded-3 px-3"
                >
                    O'rnatish
                </button>
            </div>
        </div>
    );
}
