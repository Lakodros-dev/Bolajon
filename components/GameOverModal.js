'use client';

import Link from 'next/link';
import { RotateCcw, Trophy, Star, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function GameOverModal({ won, score, total, onRestart }) {
    const [show, setShow] = useState(false);
    const percentage = total ? Math.round((score / total) * 100) : 0;

    useEffect(() => {
        // Trigger animation after mount
        setTimeout(() => setShow(true), 100);
    }, []);

    return (
        <div 
            className="min-vh-100 d-flex flex-column align-items-center justify-content-center p-4 position-relative overflow-hidden"
            style={{ 
                background: won 
                    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                    : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                transition: 'all 0.3s ease'
            }}
        >
            {/* Animated background circles */}
            <div 
                className="position-absolute rounded-circle"
                style={{
                    width: '300px',
                    height: '300px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    top: '-100px',
                    right: '-100px',
                    animation: 'float 6s ease-in-out infinite'
                }}
            />
            <div 
                className="position-absolute rounded-circle"
                style={{
                    width: '200px',
                    height: '200px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    bottom: '-50px',
                    left: '-50px',
                    animation: 'float 8s ease-in-out infinite reverse'
                }}
            />

            {/* Main Card */}
            <div 
                className="card border-0 shadow-lg text-center position-relative"
                style={{ 
                    maxWidth: 450,
                    borderRadius: '24px',
                    transform: show ? 'scale(1)' : 'scale(0.8)',
                    opacity: show ? 1 : 0,
                    transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)'
                }}
            >
                <div className="card-body p-5">
                    {/* Icon/Emoji with animation */}
                    <div 
                        className="mb-4"
                        style={{
                            animation: won ? 'bounce 1s ease-in-out' : 'shake 0.5s ease-in-out'
                        }}
                    >
                        {won ? (
                            <div className="position-relative d-inline-block">
                                <Trophy size={80} className="text-warning" strokeWidth={2} />
                                <div 
                                    className="position-absolute"
                                    style={{
                                        top: '-10px',
                                        right: '-10px',
                                        animation: 'sparkle 1.5s ease-in-out infinite'
                                    }}
                                >
                                    <Star size={24} className="text-warning" fill="currentColor" />
                                </div>
                            </div>
                        ) : (
                            <div className="d-flex align-items-center justify-content-center">
                                <TrendingUp size={80} className="text-primary" strokeWidth={2} />
                            </div>
                        )}
                    </div>

                    {/* Title */}
                    <h1 
                        className="fw-bold mb-3"
                        style={{ 
                            fontSize: '2rem',
                            background: won 
                                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text'
                        }}
                    >
                        {won ? '🎉 Ajoyib!' : '💪 Yaxshi harakat!'}
                    </h1>

                    {/* Score Display */}
                    {score !== undefined && total !== undefined && (
                        <div className="mb-4">
                            <div 
                                className="d-inline-flex align-items-center gap-3 px-4 py-3 rounded-pill"
                                style={{ 
                                    background: won 
                                        ? 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)'
                                        : 'linear-gradient(135deg, #f093fb15 0%, #f5576c15 100%)',
                                    border: won 
                                        ? '2px solid #667eea30'
                                        : '2px solid #f093fb30'
                                }}
                            >
                                <div className="text-center">
                                    <div 
                                        className="fw-bold"
                                        style={{ 
                                            fontSize: '2rem',
                                            color: won ? '#667eea' : '#f5576c'
                                        }}
                                    >
                                        {score}/{total}
                                    </div>
                                    <small className="text-muted">To'g'ri javoblar</small>
                                </div>
                                <div 
                                    className="vr"
                                    style={{ 
                                        height: '50px',
                                        opacity: 0.3
                                    }}
                                />
                                <div className="text-center">
                                    <div 
                                        className="fw-bold"
                                        style={{ 
                                            fontSize: '2rem',
                                            color: won ? '#667eea' : '#f5576c'
                                        }}
                                    >
                                        {percentage}%
                                    </div>
                                    <small className="text-muted">Natija</small>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Message */}
                    <p className="text-muted mb-4" style={{ fontSize: '1.1rem' }}>
                        {won 
                            ? "Siz barcha savollarga to'g'ri javob berdingiz!" 
                            : "Qayta urinib ko'ring, siz albatta muvaffaqiyatga erishasiz!"}
                    </p>

                    {/* Buttons */}
                    <div className="d-flex gap-3 justify-content-center flex-nowrap">
                        <button 
                            onClick={onRestart} 
                            className="btn btn-lg rounded-pill px-4 py-3 d-flex align-items-center gap-2 shadow-sm flex-nowrap"
                            style={{
                                background: 'white',
                                color: won ? '#667eea' : '#f5576c',
                                border: won ? '2px solid #667eea' : '2px solid #f5576c',
                                fontWeight: '600',
                                transition: 'all 0.3s ease',
                                whiteSpace: 'nowrap'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.15)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                            }}
                        >
                            <RotateCcw size={20} />
                            {won ? "Qayta o'ynash" : "Qayta urinish"}
                        </button>
                        <Link 
                            href="/dashboard/games" 
                            className="btn btn-lg rounded-pill px-4 py-3 shadow-sm text-white"
                            style={{
                                background: won 
                                    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                    : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                                border: 'none',
                                fontWeight: '600',
                                transition: 'all 0.3s ease',
                                whiteSpace: 'nowrap'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.2)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                            }}
                        >
                            Keyingisi →
                        </Link>
                    </div>
                </div>
            </div>

            {/* CSS Animations */}
            <style jsx>{`
                @keyframes float {
                    0%, 100% {
                        transform: translateY(0) rotate(0deg);
                    }
                    50% {
                        transform: translateY(-20px) rotate(5deg);
                    }
                }

                @keyframes bounce {
                    0%, 100% {
                        transform: translateY(0);
                    }
                    50% {
                        transform: translateY(-20px);
                    }
                }

                @keyframes shake {
                    0%, 100% {
                        transform: translateX(0);
                    }
                    25% {
                        transform: translateX(-10px);
                    }
                    75% {
                        transform: translateX(10px);
                    }
                }

                @keyframes sparkle {
                    0%, 100% {
                        transform: scale(1) rotate(0deg);
                        opacity: 1;
                    }
                    50% {
                        transform: scale(1.2) rotate(180deg);
                        opacity: 0.8;
                    }
                }
            `}</style>
        </div>
    );
}
