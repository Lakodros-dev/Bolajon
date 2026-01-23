'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';

export default function DropToBasketTestPage() {
    const router = useRouter();
    const [fallingItem, setFallingItem] = useState(null);
    const [basketPosition, setBasketPosition] = useState(50);
    const [score, setScore] = useState(0);
    const [missed, setMissed] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [itemPosition, setItemPosition] = useState(0);

    const items = [
        { id: 1, name: 'Apple', translation: 'Olma', emoji: '🍎' },
        { id: 2, name: 'Banana', translation: 'Banan', emoji: '🍌' },
        { id: 3, name: 'Orange', translation: 'Apelsin', emoji: '🍊' },
        { id: 4, name: 'Grapes', translation: 'Uzum', emoji: '🍇' },
        { id: 5, name: 'Watermelon', translation: 'Tarvuz', emoji: '🍉' },
    ];

    useEffect(() => {
        if (!gameOver) {
            dropNewItem();
        }
    }, [gameOver]);

    useEffect(() => {
        if (fallingItem && !gameOver) {
            const interval = setInterval(() => {
                setItemPosition(prev => {
                    if (prev >= 85) {
                        checkCatch();
                        return 0;
                    }
                    return prev + 2;
                });
            }, 50);
            return () => clearInterval(interval);
        }
    }, [fallingItem, gameOver]);

    const dropNewItem = () => {
        const randomItem = items[Math.floor(Math.random() * items.length)];
        const randomX = Math.random() * 80 + 10;
        setFallingItem({ ...randomItem, x: randomX });
        setItemPosition(0);
    };

    const checkCatch = () => {
        if (fallingItem) {
            const distance = Math.abs(fallingItem.x - basketPosition);
            if (distance < 15) {
                setScore(score + 1);
            } else {
                setMissed(missed + 1);
                if (missed + 1 >= 5) {
                    setGameOver(true);
                }
            }
            setTimeout(dropNewItem, 500);
        }
    };

    const moveBasket = (direction) => {
        setBasketPosition(prev => {
            const newPos = direction === 'left' ? prev - 10 : prev + 10;
            return Math.max(10, Math.min(90, newPos));
        });
    };

    const restartGame = () => {
        setScore(0);
        setMissed(0);
        setGameOver(false);
        setItemPosition(0);
        dropNewItem();
    };

    if (gameOver) {
        return (
            <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: '#f5f5f7' }}>
                <div className="text-center">
                    <div className="mb-4" style={{ fontSize: '80px' }}>😢</div>
                    <h1 className="display-4 fw-bold mb-3">O'yin tugadi!</h1>
                    <p className="h3 mb-4">
                        Natija: <span className="text-primary">{score}</span> ta ushlandi
                    </p>
                    <div className="d-flex gap-3 justify-content-center">
                        <button onClick={restartGame} className="btn btn-primary btn-lg rounded-3 d-flex align-items-center gap-2">
                            <RotateCcw size={20} />
                            Qayta o'ynash
                        </button>
                        <button onClick={() => router.push('/admin/games-test')} className="btn btn-outline-secondary btn-lg rounded-3 d-flex align-items-center gap-2">
                            <ArrowLeft size={20} />
                            Orqaga
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-vh-100" style={{ backgroundColor: '#87CEEB' }}>
            {/* Header */}
            <div className="bg-white border-bottom py-3 px-4">
                <div className="d-flex align-items-center justify-content-between">
                    <button onClick={() => router.push('/admin/games-test')} className="btn btn-light rounded-circle">
                        <ArrowLeft size={20} />
                    </button>
                    <h5 className="fw-bold mb-0">Savatga tashlash</h5>
                    <div className="d-flex gap-2">
                        <div className="badge bg-danger rounded-pill px-3 py-2">
                            ❌ {missed}/5
                        </div>
                        <div className="badge bg-primary rounded-pill px-3 py-2">
                            ⭐ {score}
                        </div>
                    </div>
                </div>
            </div>

            {/* Game Area */}
            <div className="position-relative" style={{ height: 'calc(100vh - 80px)' }}>
                {/* Falling Item */}
                {fallingItem && (
                    <div
                        className="position-absolute"
                        style={{
                            left: `${fallingItem.x}%`,
                            top: `${itemPosition}%`,
                            fontSize: '50px',
                            transition: 'top 0.05s linear',
                            transform: 'translateX(-50%)'
                        }}
                    >
                        {fallingItem.emoji}
                    </div>
                )}

                {/* Basket */}
                <div
                    className="position-absolute bottom-0"
                    style={{
                        left: `${basketPosition}%`,
                        transform: 'translateX(-50%)',
                        fontSize: '80px',
                        transition: 'left 0.2s'
                    }}
                >
                    🧺
                </div>

                {/* Controls */}
                <div className="position-absolute bottom-0 start-50 translate-middle-x mb-5 pb-5">
                    <div className="d-flex gap-3">
                        <button
                            onClick={() => moveBasket('left')}
                            className="btn btn-primary btn-lg rounded-circle"
                            style={{ width: '80px', height: '80px' }}
                        >
                            <ChevronLeft size={40} />
                        </button>
                        <button
                            onClick={() => moveBasket('right')}
                            className="btn btn-primary btn-lg rounded-circle"
                            style={{ width: '80px', height: '80px' }}
                        >
                            <ChevronRight size={40} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
