'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';

export default function AdminSidebar() {
    const pathname = usePathname();
    const { user, logout } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 992);
            if (window.innerWidth >= 992) {
                setIsOpen(false);
            }
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Close sidebar when route changes on mobile
    useEffect(() => {
        if (isMobile) {
            setIsOpen(false);
        }
    }, [pathname, isMobile]);

    const menuItems = [
        { href: '/admin', icon: 'dashboard', label: 'Dashboard' },
        { href: '/admin/teachers', icon: 'school', label: "O'qituvchilar" },
        { href: '/admin/lessons', icon: 'smart_display', label: 'Darslar' },
        { href: '/admin/rewards', icon: 'redeem', label: "Sovg'alar" },
        { href: '/admin/statistics', icon: 'analytics', label: 'Statistika' },
        { href: '/admin/settings', icon: 'settings', label: 'Sozlamalar' },
    ];

    return (
        <>
            {/* Mobile Header */}
            <header className="d-lg-none bg-white border-bottom position-fixed top-0 start-0 end-0" style={{ zIndex: 1040 }}>
                <div className="d-flex align-items-center justify-content-between p-3">
                    <button
                        className="btn btn-light rounded-circle p-2"
                        onClick={() => setIsOpen(true)}
                    >
                        <span className="material-symbols-outlined">menu</span>
                    </button>
                    <Image src="/logo.png" alt="Bolajon.uz" width={100} height={32} style={{ objectFit: 'contain' }} />
                    <span className="badge bg-primary">Admin</span>
                </div>
            </header>

            {/* Overlay */}
            {isOpen && isMobile && (
                <div
                    className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50"
                    style={{ zIndex: 1045 }}
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`bg-white border-end d-flex flex-column position-fixed h-100 ${isMobile ? (isOpen ? 'translate-0' : 'translate-start') : ''}`}
                style={{
                    width: '280px',
                    zIndex: 1050,
                    transition: 'transform 0.3s ease',
                    transform: isMobile && !isOpen ? 'translateX(-100%)' : 'translateX(0)',
                }}
            >
                {/* Logo */}
                <div className="p-4 border-bottom">
                    <div className="d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center gap-2">
                            <Image src="/logo.png" alt="Bolajon.uz" width={120} height={40} style={{ objectFit: 'contain' }} />
                            <span className="badge bg-primary small">Admin</span>
                        </div>
                        {isMobile && (
                            <button
                                className="btn btn-light rounded-circle p-2"
                                onClick={() => setIsOpen(false)}
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-grow-1 p-3 overflow-auto">
                    <ul className="nav flex-column gap-1">
                        {menuItems.map((item) => (
                            <li key={item.href} className="nav-item">
                                <Link
                                    href={item.href}
                                    prefetch={true}
                                    className={`nav-link d-flex align-items-center gap-3 rounded-3 px-3 py-3 ${pathname === item.href
                                        ? 'bg-primary text-white'
                                        : 'text-dark hover-bg-light'
                                        }`}
                                >
                                    <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>{item.icon}</span>
                                    <span className="fw-medium">{item.label}</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* User Info */}
                <div className="p-3 border-top">
                    <div className="d-flex align-items-center gap-3 mb-3">
                        <div
                            className="rounded-circle flex-shrink-0"
                            style={{
                                width: '44px',
                                height: '44px',
                                backgroundImage: `url('https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Admin')}&background=2b8cee&color=fff')`,
                                backgroundSize: 'cover'
                            }}
                        />
                        <div className="flex-grow-1 overflow-hidden">
                            <p className="fw-semibold mb-0 text-truncate">{user?.name}</p>
                            <p className="small text-muted mb-0 text-truncate">{user?.phone}</p>
                        </div>
                    </div>
                    {/* Switch to Teacher Mode */}
                    <Link
                        href="/dashboard"
                        className="btn btn-outline-primary w-100 rounded-3 py-2 mb-2 d-flex align-items-center justify-content-center gap-2"
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>swap_horiz</span>
                        O'qituvchi rejimi
                    </Link>
                    <button
                        onClick={logout}
                        className="btn btn-outline-danger w-100 rounded-3 py-2 d-flex align-items-center justify-content-center gap-2"
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>logout</span>
                        Chiqish
                    </button>
                </div>
            </aside>
        </>
    );
}
