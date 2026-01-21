'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function Sidebar() {
    const pathname = usePathname();
    const { user, logout } = useAuth();

    const navItems = [
        { href: '/dashboard', icon: 'home', label: 'Asosiy' },
        { href: '/dashboard/lessons', icon: 'smart_display', label: 'Darslar' },
        { href: '/dashboard/games', icon: 'sports_esports', label: "O'yinlar" },
        { href: '/dashboard/students', icon: 'school', label: "O'quvchilarim" },
        { href: '/dashboard/leaderboard', icon: 'emoji_events', label: 'Leaderboard' },
        { href: '/dashboard/statistics', icon: 'leaderboard', label: 'Natijalar' },
        { href: '/dashboard/rewards', icon: 'redeem', label: "Sovg'alar" },
    ];

    return (
        <aside className="sidebar d-none d-lg-flex flex-column bg-white border-end position-fixed h-100" style={{ width: '260px' }}>
            {/* Logo */}
            <div className="px-3 py-2 border-bottom">
                <Link href="/dashboard" className="text-decoration-none">
                    <Image
                        src="/logo.png"
                        alt="Bolajon.uz"
                        width={100}
                        height={32}
                        style={{ objectFit: 'contain' }}
                    />
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-grow-1 px-2 py-2">
                <ul className="nav flex-column gap-1">
                    {navItems.map((item) => (
                        <li key={item.href} className="nav-item">
                            <Link
                                href={item.href}
                                prefetch={true}
                                className={`nav-link d-flex align-items-center gap-2 rounded-3 px-3 py-2 ${pathname === item.href
                                    ? 'bg-primary text-white'
                                    : 'text-dark'
                                    }`}
                                style={{ fontSize: '14px' }}
                            >
                                <span className={`material-symbols-outlined ${pathname === item.href ? 'filled' : ''}`} style={{ fontSize: '20px' }}>
                                    {item.icon}
                                </span>
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
                        className="rounded-circle"
                        style={{
                            width: '36px',
                            height: '36px',
                            backgroundImage: `url('https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=2b8cee&color=fff')`,
                            backgroundSize: 'cover'
                        }}
                    />
                    <div className="flex-grow-1 overflow-hidden">
                        <p className="fw-semibold mb-0 text-truncate" style={{ fontSize: '13px' }}>{user?.name}</p>
                        <p className="text-muted mb-0 text-truncate" style={{ fontSize: '11px' }}>{user?.phone}</p>
                    </div>
                </div>
                {/* Switch to Admin Mode - only for admins */}
                {user?.role === 'admin' && (
                    <Link
                        href="/admin"
                        className="btn btn-outline-primary w-100 rounded-3 mb-1 d-flex align-items-center justify-content-center gap-2"
                        style={{ fontSize: '13px', padding: '6px 12px' }}
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>admin_panel_settings</span>
                        Admin rejimi
                    </Link>
                )}
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
    );
}
