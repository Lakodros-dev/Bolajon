'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Timer, Star, RotateCcw } from 'lucide-react';

export default function CatchNumberTestPage() {
    const router = useRouter();
    const [targetNumber, setTargetNumber] = useState(0);
    const [options, setOptions] = useState([]);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(30);
    const [gameOver, setGameOver] = useState(false);
    const [feedback, setFeedback] = useState(null);

    useEffect(() => {
        generateNewRound();
    }, []);

    useEffect(() => {
        if (timeLeft > 0 && !gameOver) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        } else if (timeLeft === 0) {
            setGameOver(true);
        }
    }, [timeLeft, gameOver]);

    const generateNewRound = () => {
        const target = Math.floor(Math.random() * 100) + 1;
        setTargetNumber(target);
        
        const opts = [target];
        while (opts.length < 6) {
            const num = Math.floor(Math.random() * 100) + 1;
            if (!opts.includes(num)) {
                opts.push(num);
            }
        }
        setOptions(opts.sort(() => Math.random() - 0.5));
        setFeedback(null);
    };

    const handleAnswer = (number) => {
        if (number === targetNumber) {
            setScore(score + 1);
            setFeedback('correct');
            setTimeout(() => generateNewRound(), 500);
        } else {
            setFeedback('wrong');
            setTimeout(() => setFeedback(null), 500);
        }
    };

    const restartGame = () => {
        setScore(0);
        setTimeLeft(30);
        setGameOver(false);
        generateNewRound();
    };

    if (gameOver) {
        return (
            <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: '#f5f5f7' }}>
                <div className="text-center">
                    <div className="mb-4" style={{ fontSize: '80px' }}>
                        {score >= 15 ? '🏆' : score >= 10 ? '🎉' : '💪'}
                    </div>
                    <h1 className="display-4 fw-bold mb-3">Vaqt tugadi!</h1>
                    <p className="h3 mb-4">
                        Natija: <span className="text-primary">{score}</span> ta to'g'ri
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
        <div className="min-vh-100" style={{ backgroundColor: '#f5f5f7' }}>
            {/* Header */}
            <div className="bg-white border-bottom py-3 px-4">
                <div className="d-flex align-items-center justify-content-between">
                    <button onClick={() => router.push('/admin/games-test')} className="btn btn-light rounded-circle">
                        <ArrowLeft size={20} />
                    </button>
                    <h5 className="fw-bold mb-0">Catch the Number</h5>
                    <div className="d-flex gap-2">
                        <div className="badge bg-danger rounded-pill px-3 py-2 d-flex align-items-center gap-1">
                            <Timer size={16} />
                            {timeLeft}s
                        </div>
                        <div className="badge bg-primary rounded-pill px-3 py-2 d-flex align-items-center gap-1">
                            <Star size={16} />
                            {score}
                        </div>
                    </div>
                </div>
            </div>

            {/* Game Content */}
            <div className="container py-5">
                <div className="row justify-content-center">
                    <div className="col-lg-8">
                        {/* Target Number */}
                        <div className={`card border-0 rounded-4 shadow-lg mb-4 ${feedback === 'correct' ? 'bg-success' : feedback === 'wrong' ? 'bg-danger' : 'bg-primary'}`}>
                            <div className="card-body p-5 text-center text-white">
                                <p className="h5 mb-3">Qaysi raqamni toping:</p>
                                <h1 className="display-1 fw-bold mb-0">{targetNumber}</h1>
                            </div>
                        </div>

                        {/* Number Grid */}
                        <div className="row g-3">
                            {options.map((number, index) => (
                                <div key={index} className="col-4">
                                    <button
                                        onClick={() => handleAnswer(number)}
                                        className="btn btn-light w-100 rounded-4 shadow-sm"
                                        style={{ 
                                            fontSize: '32px', 
                                            fontWeight: 'bold',
                                            padding: '40px 20px',
                                            transition: 'transform 0.1s'
                                        }}
                                        onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
                                        onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                    >
                                        {number}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
