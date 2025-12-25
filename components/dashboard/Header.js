'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import Image from 'next/image';

export default function Header({ title, showStars = false, stars = 0, showSubscription = false, daysRemaining = 0, onPaymentClick }) {
    const { user } = useAuth();

    return (
        <header className="sticky-top bg-white border-bottom py-3 px-3">
            <div className="d-flex align-items-center justify-content-between">
                {/* Logo */}
                <div className="d-flex align-items-center gap-2">
                    <Image
                        src="/logo.png"
                        alt="Bolajon"
                        width={45}
                        height={45}
                        className="rounded-3"
                        style={{ objectFit: 'contain' }}
                    />
                    <div>
                        <h2 className="h6 mb-0 fw-bold text-primary">Bolajon</h2>
                        <p className="text-muted small mb-0" style={{ fontSize: '11px' }}>Ingliz tili kursi</p>
                    </div>
                </div>

                <div className="d-flex align-items-center gap-2">
                    {/* Subscription Days */}
                    {showSubscription && (
                        <button
                            onClick={onPaymentClick}
                            className="d-flex align-items-center gap-1 px-2 py-1 rounded-pill border-0"
                            style={{
                                backgroundColor: daysRemaining <= 3 ? '#fee2e2' : '#e0f2fe',
                                cursor: 'pointer'
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
                        </button>
                    )}

                    {/* Stars */}
                    {showStars && (
                        <div className="d-flex align-items-center gap-1 px-2 py-1 rounded-pill" style={{ backgroundColor: '#fef3c7' }}>
                            <span className="material-symbols-outlined filled text-warning" style={{ fontSize: '18px' }}>star</span>
                            <span className="fw-bold small" style={{ color: '#92400e' }}>{stars}</span>
                        </div>
                    )}

                    {/* Settings */}
                    <Link href="/dashboard/profile" className="btn btn-light rounded-circle p-2" style={{ width: 38, height: 38 }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>settings</span>
                    </Link>
                </div>
            </div>

            {title && (
                <h1 className="h4 fw-bold mt-3 mb-0">{title}</h1>
            )}
        </header>
    );
}
