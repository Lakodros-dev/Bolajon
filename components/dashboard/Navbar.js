'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
    const pathname = usePathname();

    const navItems = [
        { href: '/dashboard', icon: 'home', label: 'Asosiy' },
        { href: '/dashboard/rewards', icon: 'redeem', label: "Sovg'alar" },
        { href: '/dashboard/lessons', icon: 'play_circle', label: 'Darslar', isMain: true },
        { href: '/dashboard/games', icon: 'sports_esports', label: "O'yinlar" },
        { href: '/dashboard/students', icon: 'school', label: "O'quvchilar" },
    ];

    const isActive = (href) => {
        if (href === '/dashboard') return pathname === '/dashboard';
        // O'quvchilar uchun leaderboard va statistics ham active bo'lsin
        if (href === '/dashboard/students') {
            return pathname.startsWith('/dashboard/students') ||
                pathname.startsWith('/dashboard/leaderboard') ||
                pathname.startsWith('/dashboard/statistics');
        }
        return pathname.startsWith(href);
    };

    return (
        <nav className="bottom-nav">
            <div className="d-flex justify-content-around align-items-end" style={{ maxWidth: '500px', margin: '0 auto' }}>
                {navItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        prefetch={true}
                        className={`nav-link d-flex flex-column align-items-center text-decoration-none ${isActive(item.href) ? 'active' : ''} ${item.isMain ? 'nav-main' : ''}`}
                        style={{
                            padding: item.isMain ? '0' : '8px 12px',
                            marginTop: item.isMain ? '-20px' : '0'
                        }}
                    >
                        {item.isMain ? (
                            <div
                                className="d-flex flex-column align-items-center justify-content-center shadow"
                                style={{
                                    width: '56px',
                                    height: '56px',
                                    borderRadius: '16px',
                                    background: isActive(item.href)
                                        ? 'linear-gradient(135deg, #2b8cee 0%, #1e40af 100%)'
                                        : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                    marginBottom: '4px'
                                }}
                            >
                                <span className="material-symbols-outlined filled text-white" style={{ fontSize: '28px' }}>
                                    {item.icon}
                                </span>
                            </div>
                        ) : (
                            <span
                                className={`material-symbols-outlined ${isActive(item.href) ? 'filled' : ''}`}
                                style={{
                                    fontSize: '24px',
                                    color: isActive(item.href) ? '#2b8cee' : '#64748b'
                                }}
                            >
                                {item.icon}
                            </span>
                        )}
                        <span
                            className={item.isMain ? 'fw-semibold' : ''}
                            style={{
                                fontSize: item.isMain ? '11px' : '10px',
                                color: isActive(item.href) ? '#2b8cee' : '#64748b',
                                marginTop: item.isMain ? '0' : '2px'
                            }}
                        >
                            {item.label}
                        </span>
                    </Link>
                ))}
            </div>
        </nav>
    );
}
