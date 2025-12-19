'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function AdminSidebar() {
    const pathname = usePathname();
    const { user, logout } = useAuth();

    const menuItems = [
        { href: '/admin', icon: 'dashboard', label: 'Dashboard' },
        { href: '/admin/teachers', icon: 'school', label: "O'qituvchilar" },
        { href: '/admin/lessons', icon: 'smart_display', label: 'Darslar' },
        { href: '/admin/rewards', icon: 'redeem', label: "Sovg'alar" },
        { href: '/admin/statistics', icon: 'analytics', label: 'Statistika' },
    ];

    return (
        <aside
            className="bg-white border-end d-flex flex-column position-fixed h-100"
            style={{ width: '250px' }}
        >
            {/* Logo */}
            <div className="p-4 border-bottom">
                <div className="d-flex align-items-center gap-2">
                    <Image src="/logo.png" alt="Bolajon.uz" width={140} height={45} style={{ objectFit: 'contain' }} />
                    <span className="badge bg-primary small">Admin</span>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-grow-1 p-3">
                <ul className="nav flex-column gap-1">
                    {menuItems.map((item) => (
                        <li key={item.href} className="nav-item">
                            <Link
                                href={item.href}
                                prefetch={true}
                                className={`nav-link d-flex align-items-center gap-3 rounded-3 px-3 py-2 ${pathname === item.href
                                    ? 'bg-primary text-white'
                                    : 'text-dark hover-bg-light'
                                    }`}
                            >
                                <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>{item.icon}</span>
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
                            backgroundImage: `url('https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Admin')}&background=2b8cee&color=fff')`,
                            backgroundSize: 'cover'
                        }}
                    />
                    <div className="flex-grow-1 overflow-hidden">
                        <p className="fw-semibold mb-0 text-truncate">{user?.name}</p>
                        <p className="small text-muted mb-0">{user?.email}</p>
                    </div>
                </div>
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
