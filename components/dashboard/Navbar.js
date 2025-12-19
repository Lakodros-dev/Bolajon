'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
    const pathname = usePathname();

    const navItems = [
        { href: '/dashboard', icon: 'home', label: 'Asosiy' },
        { href: '/dashboard/lessons', icon: 'smart_display', label: 'Darslar' },
        { href: '/dashboard/games', icon: 'sports_esports', label: "O'yinlar" },
        { href: '/dashboard/students', icon: 'school', label: "O'quvchilar" },
        { href: '/dashboard/rewards', icon: 'redeem', label: 'Sovg\'alar' },
    ];

    return (
        <nav className="bottom-nav">
            <div className="d-flex justify-content-between align-items-center" style={{ maxWidth: '500px', margin: '0 auto' }}>
                {navItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        prefetch={true}
                        className={`nav-link ${pathname === item.href ? 'active' : ''}`}
                    >
                        <span className={`material-symbols-outlined ${pathname === item.href ? 'filled' : ''}`}>
                            {item.icon}
                        </span>
                        <span>{item.label}</span>
                    </Link>
                ))}
            </div>
        </nav>
    );
}
