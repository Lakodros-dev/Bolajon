'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Gift, PlayCircle, Gamepad2, GraduationCap } from 'lucide-react';

export default function Navbar() {
    const pathname = usePathname();

    const navItems = [
        { href: '/dashboard', icon: Home, label: 'Asosiy' },
        { href: '/dashboard/rewards', icon: Gift, label: "Sovg'alar" },
        { href: '/dashboard/lessons', icon: PlayCircle, label: 'Darslar', isMain: true },
        { href: '/dashboard/games', icon: Gamepad2, label: "O'yinlar" },
        { href: '/dashboard/students', icon: GraduationCap, label: "O'quvchilar" },
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
                {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
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
                                    <Icon size={28} color="white" strokeWidth={2.5} />
                                </div>
                            ) : (
                                <Icon
                                    size={24}
                                    color={isActive(item.href) ? '#2b8cee' : '#64748b'}
                                    strokeWidth={isActive(item.href) ? 2.5 : 2}
                                />
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
                    );
                })}
            </div>
        </nav>
    );
}
