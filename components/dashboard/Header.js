'use client';

import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function Header({ title, showStars = false, stars = 0 }) {
    const { user } = useAuth();

    return (
        <header className="sticky-top bg-white border-bottom py-3 px-3">
            <div className="d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center gap-3">
                    <div className="position-relative">
                        <div
                            className="avatar"
                            style={{
                                backgroundImage: `url('https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=2b8cee&color=fff')`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center'
                            }}
                        />
                        <div
                            className="position-absolute bottom-0 end-0 bg-success rounded-circle border border-2 border-white"
                            style={{ width: '12px', height: '12px' }}
                        />
                    </div>
                    <div>
                        <p className="text-muted small mb-0 fw-medium">Xush kelibsiz,</p>
                        <h2 className="h6 mb-0 fw-bold">{user?.name || 'Ustoz'}</h2>
                    </div>
                </div>

                <div className="d-flex align-items-center gap-2">
                    {showStars && (
                        <div className="d-flex align-items-center gap-1 px-3 py-2 rounded-pill" style={{ backgroundColor: '#fef3c7' }}>
                            <span className="material-symbols-outlined filled text-warning" style={{ fontSize: '20px' }}>star</span>
                            <span className="fw-bold" style={{ color: '#92400e' }}>{stars}</span>
                        </div>
                    )}
                    <Link href="/dashboard/profile" className="btn btn-light rounded-circle p-2">
                        <span className="material-symbols-outlined">notifications</span>
                    </Link>
                </div>
            </div>

            {title && (
                <h1 className="h4 fw-bold mt-3 mb-0">{title}</h1>
            )}
        </header>
    );
}
