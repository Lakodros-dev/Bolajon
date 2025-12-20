'use client';

import { useEffect, useState } from 'react';

export default function PWAInstall() {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [showInstall, setShowInstall] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        // Check if mobile
        setIsMobile(window.innerWidth < 768);
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);

        // Register service worker
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js').catch(() => { });
        }

        // Listen for install prompt
        const handleBeforeInstall = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);

            // Check if dismissed recently
            const dismissed = localStorage.getItem('pwa-dismissed');
            if (dismissed) {
                const daysSince = (Date.now() - parseInt(dismissed)) / (1000 * 60 * 60 * 24);
                if (daysSince < 7) return;
            }

            setShowInstall(true);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstall);

        // Check if already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setShowInstall(false);
        }

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    // Auto-hide after 8 seconds
    useEffect(() => {
        if (showInstall) {
            const timer = setTimeout(() => {
                setShowInstall(false);
            }, 8000);
            return () => clearTimeout(timer);
        }
    }, [showInstall]);

    const handleInstall = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') setShowInstall(false);
        setDeferredPrompt(null);
    };

    const handleDismiss = () => {
        setShowInstall(false);
        localStorage.setItem('pwa-dismissed', Date.now().toString());
    };

    if (!showInstall) return null;

    // Mobile: top-right corner, Desktop: bottom-center
    return (
        <div
            className={`position-fixed p-3 ${isMobile ? '' : 'start-0 end-0'}`}
            style={{
                zIndex: 1060,
                top: isMobile ? '70px' : 'auto',
                right: isMobile ? '0' : 'auto',
                bottom: isMobile ? 'auto' : '0'
            }}
        >
            <div
                className={`bg-white rounded-4 shadow-lg p-3 d-flex align-items-center gap-3 ${isMobile ? '' : 'mx-auto'}`}
                style={{
                    maxWidth: isMobile ? '300px' : '400px',
                    animation: 'slideIn 0.3s ease'
                }}
            >
                <style jsx global>{`
                    @keyframes slideIn {
                        from { opacity: 0; transform: translateY(${isMobile ? '-20px' : '20px'}); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                `}</style>
                <div className="rounded-3 bg-primary bg-opacity-10 p-2 flex-shrink-0">
                    <span className="material-symbols-outlined text-primary" style={{ fontSize: '24px' }}>
                        install_mobile
                    </span>
                </div>
                <div className="flex-grow-1">
                    <p className="fw-semibold mb-0" style={{ fontSize: '14px' }}>Ilovani o'rnating</p>
                    <p className="text-muted mb-0" style={{ fontSize: '12px' }}>Tezroq kirish uchun</p>
                </div>
                <button onClick={handleDismiss} className="btn btn-light btn-sm rounded-circle p-1">
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
                </button>
                <button onClick={handleInstall} className="btn btn-primary btn-sm rounded-3 px-3">
                    O'rnatish
                </button>
            </div>
        </div>
    );
}
