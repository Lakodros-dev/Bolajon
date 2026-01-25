'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Gift, PlayCircle, Gamepad2, GraduationCap } from 'lucide-react';
import { useEffect, useState, useMemo, memo } from 'react';

const Navbar = memo(function Navbar() {
    const pathname = usePathname();
    const [activeIndex, setActiveIndex] = useState(0);

    const navItems = useMemo(() => [
        { href: '/dashboard', icon: Home, label: 'Asosiy' },
        { href: '/dashboard/rewards', icon: Gift, label: "Sovg'alar" },
        { href: '/dashboard/lessons', icon: PlayCircle, label: 'Darslar' },
        { href: '/dashboard/games', icon: Gamepad2, label: "O'yinlar" },
        { href: '/dashboard/students', icon: GraduationCap, label: "O'quvchilar" },
    ], []);

    const isActive = useMemo(() => (href) => {
        // Exact match for dashboard home
        if (href === '/dashboard') return pathname === '/dashboard';
        
        // Students section includes leaderboard and statistics
        if (href === '/dashboard/students') {
            return pathname.startsWith('/dashboard/students') ||
                pathname.startsWith('/dashboard/leaderboard') ||
                pathname.startsWith('/dashboard/statistics');
        }
        
        // For other routes, check if pathname starts with href
        // but exclude profile and other non-navbar routes
        if (href === '/dashboard/rewards') {
            return pathname.startsWith('/dashboard/rewards');
        }
        if (href === '/dashboard/lessons') {
            return pathname.startsWith('/dashboard/lessons');
        }
        if (href === '/dashboard/games') {
            return pathname.startsWith('/dashboard/games');
        }
        
        return false;
    }, [pathname]);

    useEffect(() => {
        const index = navItems.findIndex(item => isActive(item.href));
        if (index !== -1) {
            setActiveIndex(index);
        } else {
            setActiveIndex(-1); // No active item for routes not in navbar
        }
    }, [pathname, navItems, isActive]);

    // Calculate position for sliding background - memoized
    const itemWidth = 100 / navItems.length;
    const backgroundPosition = useMemo(() => activeIndex * itemWidth, [activeIndex, itemWidth]);
    
    // Check if any navbar item is active
    const hasActiveItem = activeIndex !== -1;

    return (
        <nav className="bottom-nav">
            <div 
                className="position-relative d-flex justify-content-around" 
                style={{ 
                    maxWidth: '500px', 
                    margin: '0 auto',
                    paddingBottom: '8px',
                    height: '80px',
                    alignItems: 'flex-end'
                }}
            >
                {/* Sliding background indicator - only show if there's an active item */}
                {hasActiveItem && (
                    <div
                        className="position-absolute shadow"
                        style={{
                            width: '64px',
                            height: '64px',
                            borderRadius: '18px',
                            background: 'linear-gradient(135deg, #2b8cee 0%, #1e40af 100%)',
                            bottom: '28px',
                            left: `calc(${backgroundPosition}% + ${itemWidth / 2}% - 32px)`,
                            transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
                            zIndex: 0,
                            pointerEvents: 'none'
                        }}
                    />
                )}

                {navItems.map((item, index) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);
                    
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            prefetch={true}
                            className="d-flex flex-column align-items-center text-decoration-none position-relative"
                            style={{
                                padding: '0',
                                marginTop: active ? '-20px' : '0',
                                transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                                zIndex: 1,
                                flex: 1,
                                minWidth: '60px'
                            }}
                        >
                            <div
                                className="d-flex align-items-center justify-content-center"
                                style={{
                                    width: active ? '64px' : '40px',
                                    height: active ? '64px' : '40px',
                                    marginBottom: '4px',
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                <Icon 
                                    size={active ? 32 : 24} 
                                    color={active ? 'white' : '#64748b'} 
                                    strokeWidth={active ? 2.5 : 2}
                                    style={{
                                        transition: 'all 0.3s ease',
                                        position: 'relative',
                                        zIndex: 2
                                    }}
                                />
                            </div>
                            <span
                                className={active ? 'fw-semibold' : ''}
                                style={{
                                    fontSize: active ? '12px' : '10px',
                                    color: active ? '#2b8cee' : '#64748b',
                                    transition: 'all 0.3s ease',
                                    whiteSpace: 'nowrap',
                                    textAlign: 'center'
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
});

export default Navbar;
