'use client';

import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import Image from 'next/image';
import { ShieldCheck, Clock, User, ChevronRight } from 'lucide-react';

export default function Header({ title, showStars = false, stars = 0, showSubscription = false, daysRemaining = 0, breadcrumbs = [] }) {
    const { user } = useAuth();

    return (
        <header className="sticky-top bg-white border-bottom py-3 px-3">
            <div className="d-flex align-items-center justify-content-between">
                {/* Logo - only show on mobile, hidden on desktop (sidebar has logo) */}
                <Image
                    src="/logo.png"
                    alt="Bolajon"
                    width={120}
                    height={40}
                    className="rounded-3 d-lg-none"
                    style={{ objectFit: 'cover' }}
                />

                {/* Breadcrumb navigation on desktop - hidden on mobile */}
                <div className="d-none d-lg-block">
                    {breadcrumbs && breadcrumbs.length > 0 ? (
                        <nav aria-label="breadcrumb">
                            <ol className="breadcrumb mb-0">
                                {breadcrumbs.map((crumb, index) => (
                                    <li 
                                        key={index} 
                                        className={`breadcrumb-item ${index === breadcrumbs.length - 1 ? 'active' : ''}`}
                                        aria-current={index === breadcrumbs.length - 1 ? 'page' : undefined}
                                    >
                                        {index === breadcrumbs.length - 1 ? (
                                            <span className="fw-semibold">{crumb.label}</span>
                                        ) : (
                                            <Link href={crumb.href} className="text-decoration-none">
                                                {crumb.label}
                                            </Link>
                                        )}
                                    </li>
                                ))}
                            </ol>
                        </nav>
                    ) : (
                        <div>
                            {user && (
                                <p className="text-muted mb-0 small">Xush kelibsiz, {user.name}!</p>
                            )}
                            {title && (
                                <h1 className="h5 fw-bold mb-0">{title}</h1>
                            )}
                        </div>
                    )}
                </div>

                <div className="d-flex align-items-center gap-2">
                    {/* Admin Mode Button - only for admins on mobile */}
                    {user?.role === 'admin' && (
                        <Link
                            href="/admin"
                            className="btn btn-outline-primary rounded-pill px-2 py-1 d-lg-none d-flex align-items-center gap-1"
                            style={{ fontSize: '12px' }}
                        >
                            <ShieldCheck size={16} />
                            <span className="d-none d-sm-inline">Admin</span>
                        </Link>
                    )}

                    {/* Subscription Days - just display, modal is global */}
                    {showSubscription && (
                        <div
                            className="d-flex align-items-center gap-1 px-2 py-1 rounded-pill"
                            style={{
                                backgroundColor: daysRemaining <= 3 ? '#fee2e2' : '#e0f2fe'
                            }}
                        >
                            <Clock
                                size={16}
                                style={{
                                    color: daysRemaining <= 3 ? '#dc2626' : '#0284c7'
                                }}
                            />
                            <span
                                className="fw-bold small"
                                style={{ color: daysRemaining <= 3 ? '#dc2626' : '#0284c7' }}
                            >
                                {daysRemaining} kun
                            </span>
                        </div>
                    )}

                    {/* Profile */}
                    <Link href="/dashboard/profile" className="btn btn-light rounded-circle p-2" style={{ width: 38, height: 38 }}>
                        <User size={20} />
                    </Link>
                </div>
            </div>

            {/* Title below on mobile only */}
            {title && (
                <h1 className="h4 fw-bold mt-3 mb-0 d-lg-none">{title}</h1>
            )}
        </header>
    );
}
