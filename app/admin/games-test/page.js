'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function GamesTestPage() {
    const router = useRouter();
    const [selectedGame, setSelectedGame] = useState('');

    const games = [
        { 
            id: 'vocabulary', 
            name: "Lug'at o'yini", 
            icon: '📚',
            description: "So'zlar va rasmlarni o'rganish",
            path: '/games/vocabulary/test',
            needsLesson: true
        },
        { 
            id: 'catch-the-number', 
            name: 'Catch the Number', 
            icon: '🔢',
            description: "Raqamlarni ushlash o'yini",
            path: '/games/catch-the-number/test',
            needsLesson: true
        },
        { 
            id: 'shopping-basket', 
            name: 'Shopping Basket', 
            icon: '🛒',
            description: "Xarid savati o'yini",
            path: '/games/shopping-basket/test',
            needsLesson: true
        },
        { 
            id: 'build-the-body', 
            name: 'Build the Body', 
            icon: '🧍',
            description: "Tana a'zolarini o'rganish",
            path: '/games/build-the-body/test',
            needsLesson: true
        },
        { 
            id: 'pop-the-balloon', 
            name: 'Sharni yorish', 
            icon: '🎈',
            description: "Sharlarni yorish o'yini",
            path: '/games/pop-the-balloon',
            needsLesson: false
        },
        { 
            id: 'drop-to-basket', 
            name: 'Savatga tashlash', 
            icon: '🧺',
            description: "Narsalarni savatga tashlash",
            path: '/games/drop-to-basket/test',
            needsLesson: true
        },
        { 
            id: 'movements', 
            name: "Fe'llarni o'rganish", 
            icon: '🏃',
            description: "Harakat fe'llarini o'rganish",
            path: '/games/movements',
            needsLesson: false
        }
    ];

    const handlePlayGame = (game) => {
        router.push(game.path);
    };

    return (
        <div>
            {/* Header */}
            <div className="d-flex align-items-center gap-3 mb-4">
                <Link href="/admin" className="btn btn-light rounded-circle p-2">
                    <span className="material-symbols-outlined">arrow_back</span>
                </Link>
                <div>
                    <h1 className="h3 fw-bold mb-1" style={{ color: '#1d1d1f' }}>O'yinlarni test qilish</h1>
                    <p className="mb-0" style={{ color: '#86868b', fontSize: '14px' }}>
                        O'yinlarni sinab ko'ring va qanday ishlashini tekshiring
                    </p>
                </div>
            </div>

            {/* Info Alert */}
            <div className="alert alert-info rounded-4 mb-4 d-flex align-items-start gap-3">
                <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>info</span>
                <div>
                    <h6 className="fw-bold mb-1">Test rejimi</h6>
                    <p className="mb-0 small">
                        Bu yerda barcha o'yinlarni sinab ko'rishingiz mumkin. Ba'zi o'yinlar test ma'lumotlari bilan ishlaydi.
                    </p>
                </div>
            </div>

            {/* Games Grid */}
            <div className="row g-4">
                {games.map((game) => (
                    <div key={game.id} className="col-12 col-md-6 col-lg-4">
                        <div 
                            className="card border-0 rounded-4 shadow-sm h-100"
                            style={{ 
                                backgroundColor: 'white',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                cursor: 'pointer'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-4px)';
                                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '';
                            }}
                        >
                            <div className="card-body p-4">
                                {/* Game Icon */}
                                <div 
                                    className="rounded-circle d-flex align-items-center justify-content-center mb-3 mx-auto"
                                    style={{ 
                                        width: '80px', 
                                        height: '80px', 
                                        backgroundColor: '#f5f5f7',
                                        fontSize: '40px'
                                    }}
                                >
                                    {game.icon}
                                </div>

                                {/* Game Info */}
                                <h5 className="fw-bold text-center mb-2" style={{ color: '#1d1d1f' }}>
                                    {game.name}
                                </h5>
                                <p className="text-center text-muted small mb-3">
                                    {game.description}
                                </p>

                                {/* Status Badge */}
                                {game.needsLesson && (
                                    <div className="text-center mb-3">
                                        <span className="badge bg-warning bg-opacity-10 text-warning rounded-pill px-3 py-2">
                                            <span className="material-symbols-outlined" style={{ fontSize: '14px', verticalAlign: 'middle' }}>science</span>
                                            {' '}Test ma'lumotlari
                                        </span>
                                    </div>
                                )}

                                {/* Play Button */}
                                <button
                                    onClick={() => handlePlayGame(game)}
                                    className="btn btn-primary w-100 rounded-3 d-flex align-items-center justify-content-center gap-2"
                                >
                                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>play_arrow</span>
                                    O'ynash
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Help Section */}
            <div className="card border-0 rounded-4 shadow-sm mt-4" style={{ backgroundColor: '#f5f5f7' }}>
                <div className="card-body p-4">
                    <h6 className="fw-bold mb-3">
                        <span className="material-symbols-outlined me-2" style={{ fontSize: '20px', verticalAlign: 'middle' }}>help</span>
                        Yordam
                    </h6>
                    <div className="row g-3">
                        <div className="col-md-6">
                            <div className="d-flex gap-2">
                                <span className="material-symbols-outlined text-primary" style={{ fontSize: '20px' }}>check_circle</span>
                                <div>
                                    <p className="fw-semibold mb-1 small">To'liq ishlaydi</p>
                                    <p className="text-muted mb-0 small">O'yin to'liq ishlab chiqilgan va test qilishga tayyor</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="d-flex gap-2">
                                <span className="material-symbols-outlined text-warning" style={{ fontSize: '20px' }}>science</span>
                                <div>
                                    <p className="fw-semibold mb-1 small">Test ma'lumotlari</p>
                                    <p className="text-muted mb-0 small">O'yin test ma'lumotlari bilan ishlaydi</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
