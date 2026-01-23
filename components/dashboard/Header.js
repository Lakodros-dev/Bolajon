'use client';

import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import Image from 'next/image';

export default function Header({ title, showStars = false, stars = 0, showSubscription = false, daysRemaining = 0 }) {
    const { user } = useAuth();

    return (
        <header className="sticky-top bg-white border-bottom py-3 px-3">
            <div className="d-flex align-items-center justify-content-between">
                {/* Logo only */}
                <Image
                    src="/logo.png"
                    alt="Bolajon"
                    width={120}
                    height={40}
                    className="rounded-3"
                    style={{ objectFit: 'cover' }}
                />

                <div className="d-flex align-items-center gap-2">
                    {/* Admin Mode Button - only for admins on mobile */}
                    {user?.role === 'admin' && (
                        <Link
                            href="/admin"
                            className="btn btn-outline-primary rounded-pill px-2 py-1 d-lg-none d-flex align-items-center gap-1"
                            style={{ fontSize: '12px' }}
                        >
                            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>admin_panel_settings</span>
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
                            <span
                                className="material-symbols-outlined"
                                style={{
                                    fontSize: '16px',
                                    color: daysRemaining <= 3 ? '#dc2626' : '#0284c7'
                                }}
                            >
                                schedule
                            </span>
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
                        <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>person</span>
                    </Link>
                </div>
            </div>

            {title && (
                <h1 className="h4 fw-bold mt-3 mb-0">{title}</h1>
            )}
        </header>
    );
}
