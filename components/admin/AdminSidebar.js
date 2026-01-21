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
        { href: '/admin/users', icon: 'group', label: 'Foydalanuvchilar' },
        { href: '/admin/lessons', icon: 'smart_display', label: 'Darslar' },
        { href: '/admin/rewards', icon: 'redeem', label: "Sovg'alar" },
        { href: '/admin/games-test', icon: 'sports_esports', label: "O'yinlarni test qilish" },
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
                    width: '260px',
                    zIndex: 1050,
                    transition: 'transform 0.3s ease',
                    transform: isMobile && !isOpen ? 'translateX(-100%)' : 'translateX(0)',
                }}
            >
                {/* Logo */}
                <div className="px-3 py-2 border-bottom">
                    <div className="d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center gap-2">
                            <Image src="/logo.png" alt="Bolajon.uz" width={100} height={32} style={{ objectFit: 'contain' }} />
                            <span className="badge bg-primary" style={{ fontSize: '10px', padding: '3px 6px' }}>Admin</span>
                        </div>
                        {isMobile && (
                            <button
                                className="btn btn-light rounded-circle p-1"
                                onClick={() => setIsOpen(false)}
                                style={{ width: '32px', height: '32px' }}
                            >
                                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-grow-1 px-2 py-2">
                    <ul className="nav flex-column gap-1">
                        {menuItems.map((item) => (
                            <li key={item.href} className="nav-item">
                                <Link
                                    href={item.href}
                                    prefetch={true}
                                    className={`nav-link d-flex align-items-center gap-2 rounded-3 px-3 py-2 ${pathname === item.href
                                        ? 'bg-primary text-white'
                                        : 'text-dark hover-bg-light'
                                        }`}
                                    style={{ fontSize: '14px' }}
                                >
                                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>{item.icon}</span>
                                    <span className="fw-medium">{item.label}</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* User Info */}
                <div className="px-2 py-2 border-top">
                    <div className="d-flex align-items-center gap-2 mb-2 px-2">
                        <div
                            className="rounded-circle flex-shrink-0"
                            style={{
                                width: '36px',
                                height: '36px',
                                backgroundImage: `url('https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Admin')}&background=2b8cee&color=fff')`,
                                backgroundSize: 'cover'
                            }}
                        />
                        <div className="flex-grow-1 overflow-hidden">
                            <p className="fw-semibold mb-0 text-truncate" style={{ fontSize: '13px' }}>{user?.name}</p>
                            <p className="text-muted mb-0 text-truncate" style={{ fontSize: '11px' }}>{user?.phone}</p>
                        </div>
                    </div>
                    {/* Switch to Teacher Mode */}
                    <Link
                        href="/dashboard"
                        className="btn btn-outline-primary w-100 rounded-3 mb-1 d-flex align-items-center justify-content-center gap-2"
                        style={{ fontSize: '13px', padding: '6px 12px' }}
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>swap_horiz</span>
                        O'qituvchi rejimi
                    </Link>
                    <button
                        onClick={logout}
                        className="btn btn-outline-danger w-100 rounded-3 d-flex align-items-center justify-content-center gap-2"
                        style={{ fontSize: '13px', padding: '6px 12px' }}
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>logout</span>
                        Chiqish
                    </button>
                </div>
            </aside>
        </>
    );
}
