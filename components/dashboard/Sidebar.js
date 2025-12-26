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
        <aside className="sidebar d-none d-lg-flex flex-column bg-white border-end position-fixed h-100">
            {/* Logo */}
            <div className="p-4 border-bottom">
                <Link href="/dashboard" className="text-decoration-none">
                    <Image
                        src="/logo.png"
                        alt="Bolajon.uz"
                        width={140}
                        height={45}
                        style={{ objectFit: 'contain' }}
                    />
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-grow-1 p-3">
                <ul className="nav flex-column gap-1">
                    {navItems.map((item) => (
                        <li key={item.href} className="nav-item">
                            <Link
                                href={item.href}
                                prefetch={true}
                                className={`nav-link d-flex align-items-center gap-3 rounded-3 px-3 py-2 ${pathname === item.href
                                    ? 'bg-primary text-white'
                                    : 'text-dark'
                                    }`}
                            >
                                <span className={`material-symbols-outlined ${pathname === item.href ? 'filled' : ''}`} style={{ fontSize: '22px' }}>
                                    {item.icon}
                                </span>
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
                        className="rounded-circle"
                        style={{
                            width: '40px',
                            height: '40px',
                            backgroundImage: `url('https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=2b8cee&color=fff')`,
                            backgroundSize: 'cover'
                        }}
                    />
                    <div className="flex-grow-1 overflow-hidden">
                        <p className="fw-semibold mb-0 text-truncate">{user?.name}</p>
                        <p className="small text-muted mb-0">{user?.phone}</p>
                    </div>
                </div>
                {/* Switch to Admin Mode - only for admins */}
                {user?.role === 'admin' && (
                    <Link
                        href="/admin"
                        className="btn btn-outline-primary w-100 rounded-3 mb-2 d-flex align-items-center justify-content-center gap-2"
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>admin_panel_settings</span>
                        Admin rejimi
                    </Link>
                )}
                <button
                    onClick={logout}
                    className="btn btn-outline-danger w-100 rounded-3 d-flex align-items-center justify-content-center gap-2"
                >
                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>logout</span>
                    Chiqish
                </button>
            </div>
        </aside>
    );
}
