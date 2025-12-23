'use client';

import Header from '@/components/dashboard/Header';
import Link from 'next/link';

const games = [
    {
        id: 'pop-the-balloon',
        title: 'Pop the Balloon',
        titleUz: 'Sharni yorish',
        description: "Ranglarni o'rganish - to'g'ri rangli sharni bosing!",
        icon: '🎈',
        color: '#E0F2FE',
        iconBg: '#0284c7'
    },
    {
        id: 'drop-to-basket',
        title: 'Drop to Basket',
        titleUz: 'Savatga tashlash',
        description: "Narsalarni o'rganish - kerakli narsalarni savatga yig'ing!",
        icon: '🧺',
        color: '#DCFCE7',
        iconBg: '#16a34a'
    },
    {
        id: 'movements',
        title: 'Learn Verbs',
        titleUz: "Fe'llarni o'rganish",
        description: "Harakatlarni o'rganish - ko'rsatmaga qarab harakat qiling!",
        icon: '🏃',
        color: '#FEF3C7',
        iconBg: '#d97706'
    },
];

export default function GamesPage() {
    return (
        <div className="page-content">
            <Header title="O'yinlar" />

            <main className="p-3">
                {/* Page Title */}
                <div className="mb-4">
                    <h1 className="h4 fw-bold mb-2">🎮 O'yinlar</h1>
                    <p className="text-muted small">
                        Ingliz tilini o'yin orqali o'rganing!
                    </p>
                </div>

                {/* Games Grid */}
                <div data-tour="games-list" className="row g-3">
                    {games.map((game, index) => (
                        <div key={game.id} className="col-12 col-md-6 col-lg-4">
                            <Link href={`/games/${game.id}`} className="text-decoration-none">
                                <div
                                    data-tour={index === 0 ? "game-card" : undefined}
                                    className="card border-0 rounded-4 h-100 lesson-card"
                                    style={{ backgroundColor: game.color }}
                                >
                                    <div className="card-body p-4">
                                        <div className="d-flex align-items-start gap-3 mb-3">
                                            <div
                                                className="rounded-3 p-3 d-flex align-items-center justify-content-center"
                                                style={{
                                                    backgroundColor: 'white',
                                                    fontSize: '2.5rem'
                                                }}
                                            >
                                                {game.icon}
                                            </div>
                                            <div className="flex-grow-1">
                                                <h3 className="h6 fw-bold text-dark mb-1">{game.title}</h3>
                                                <p className="small text-muted mb-0">{game.titleUz}</p>
                                            </div>
                                        </div>
                                        <p className="small text-dark mb-0">{game.description}</p>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>

                {/* Info Card */}
                <div className="card border-0 rounded-4 bg-white mt-4">
                    <div className="card-body p-4">
                        <div className="d-flex align-items-center gap-3">
                            <span className="material-symbols-outlined text-primary" style={{ fontSize: '32px' }}>
                                info
                            </span>
                            <div>
                                <h4 className="h6 fw-bold mb-1">O'yinlar haqida</h4>
                                <p className="small text-muted mb-0">
                                    Bu o'yinlar bolalarga ingliz tilini qiziqarli tarzda o'rgatish uchun mo'ljallangan.
                                    Har bir o'yin turli mavzularni qamrab oladi.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
