'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { ArrowLeft, Volume2, CheckCircle, XCircle, RotateCcw, Frown, ShoppingCart, ArrowDown, X as CloseIcon } from 'lucide-react';

export default function ShoppingBasketGame() {
    const params = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();
    const { getAuthHeader } = useAuth();
    const lessonId = params.lessonId;
    const studentId = searchParams.get('student');

    const [lesson, setLesson] = useState(null);
    const [vocabulary, setVocabulary] = useState([]);
    const [currentTask, setCurrentTask] = useState(null);
    const [items, setItems] = useState([]);
    const [basket, setBasket] = useState([]);
    const [score, setScore] = useState(0);
    const [mistakes, setMistakes] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [loading, setLoading] = useState(true);
    const [feedback, setFeedback] = useState(null);
    const [draggedItem, setDraggedItem] = useState(null);
    const [isShaking, setIsShaking] = useState(false);
    const [completedItems, setCompletedItems] = useState([]);
    const [showConfetti, setShowConfetti] = useState(false);

    const MAX_MISTAKES = 3;

    useEffect(() => {
        if (lessonId) {
            fetchLesson();
        }
    }, [lessonId]);

    const fetchLesson = async () => {
        try {
            const res = await fetch(`/api/lessons/${lessonId}`, {
                headers: getAuthHeader()
            });
            const data = await res.json();
            if (data.lesson) {
                setLesson(data.lesson);
                const vocab = data.lesson.vocabulary || [];
                if (vocab.length > 0) {
                    setVocabulary(vocab);
                    startNewRound(vocab);
                }
            }
        } catch (error) {
            console.error('Error fetching lesson:', error);
        } finally {
            setLoading(false);
        }
    };

    const startNewRound = useCallback((vocab) => {
        if (!vocab || vocab.length === 0) return;

        // Select random item as task
        const task = vocab[Math.floor(Math.random() * vocab.length)];
        setCurrentTask(task);

        // Generate items (correct + random others)
        const others = vocab.filter(v => v.word !== task.word);
        const shuffledOthers = others.sort(() => Math.random() - 0.5).slice(0, Math.min(5, others.length));
        const allItems = [task, ...shuffledOthers].sort(() => Math.random() - 0.5);
        
        setItems(allItems);
        setBasket([]);
        setFeedback(null);
    }, []);

    const handleDragStart = (e, item) => {
        setDraggedItem(item);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e) => {
        e.preventDefault();
        if (!draggedItem || !currentTask) return;

        const isCorrect = draggedItem.word === currentTask.word;

        if (isCorrect) {
            // Correct!
            setScore(prev => prev + 1);
            setFeedback({ type: 'success', message: '✓ Good job!' });
            setShowConfetti(true);
            speakText('Good job!');

            // Remove item from items and add to basket
            setItems(prev => prev.filter(item => item.word !== draggedItem.word));
            setBasket(prev => [...prev, draggedItem]);
            setCompletedItems(prev => [...prev, draggedItem.word]);

            // Hide confetti after animation
            setTimeout(() => setShowConfetti(false), 2000);

            // Next round after delay
            setTimeout(() => {
                if (score + 1 >= vocabulary.length) {
                    // Game won!
                    setGameOver(true);
                    recordGameWin();
                } else {
                    startNewRound(vocabulary);
                }
            }, 1500);
        } else {
            // Wrong!
            setMistakes(prev => prev + 1);
            setFeedback({ type: 'error', message: '✗ Try again!' });
            setIsShaking(true);
            speakText('Try again!');

            // Stop shaking after animation
            setTimeout(() => setIsShaking(false), 500);

            if (mistakes + 1 >= MAX_MISTAKES) {
                // Game over
                setTimeout(() => {
                    setGameOver(true);
                }, 1500);
            } else {
                setTimeout(() => {
                    setFeedback(null);
                }, 1500);
            }
        }

        setDraggedItem(null);
    };

    const speakText = (text) => {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'en-US';
            utterance.rate = 0.9;
            window.speechSynthesis.speak(utterance);
        }
    };

    const speakTask = () => {
        if (currentTask) {
            speakText(`Add the ${currentTask.word} to the basket!`);
        }
    };

    const recordGameWin = async () => {
        try {
            await fetch('/api/game-progress', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ studentId, lessonId })
            });
        } catch (error) {
            console.error('Error recording game win:', error);
        }
    };

    const restartGame = () => {
        setScore(0);
        setMistakes(0);
        setGameOver(false);
        setBasket([]);
        setCompletedItems([]);
        setShowConfetti(false);
        startNewRound(vocabulary);
    };

    if (loading) {
        return (
            <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                <div className="spinner-border text-white" role="status">
                    <span className="visually-hidden">Yuklanmoqda...</span>
                </div>
            </div>
        );
    }

    if (!lesson || vocabulary.length === 0) {
        return (
            <div className="min-vh-100 d-flex flex-column align-items-center justify-content-center p-4" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                <Frown size={64} className="text-white mb-3" />
                <h4 className="text-white mb-3">Bu dars uchun lug'at topilmadi</h4>
                <Link href="/dashboard/games" className="btn btn-light">
                    Orqaga qaytish
                </Link>
            </div>
        );
    }

    if (gameOver) {
        const won = mistakes < MAX_MISTAKES;
        const percentage = Math.round((score / vocabulary.length) * 100);

        return (
            <div className="min-vh-100 d-flex flex-column align-items-center justify-content-center p-4" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                <div className="card border-0 rounded-4 shadow-lg text-center" style={{ maxWidth: 400 }}>
                    <div className="card-body p-5">
                        <div className="mb-4">
                            <span style={{ fontSize: '80px' }}>
                                {won ? '🎉' : '😊'}
                            </span>
                        </div>
                        <h2 className="fw-bold mb-2">
                            {won ? 'Ajoyib!' : 'Yaxshi harakat!'}
                        </h2>
                        <p className="text-muted mb-4">
                            {score} / {vocabulary.length} to'g'ri
                        </p>
                        <div className="d-flex gap-3 justify-content-center">
                            <button onClick={restartGame} className="btn btn-primary rounded-3 px-4 d-flex align-items-center gap-2">
                                <RotateCcw size={20} />
                                Qayta o'ynash
                            </button>
                            <Link href="/dashboard/games" className="btn btn-outline-secondary rounded-3 px-4">
                                Chiqish
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-vh-100 p-4" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', position: 'relative', overflow: 'hidden' }}>
            {/* Confetti Animation */}
            {showConfetti && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 9999 }}>
                    {[...Array(30)].map((_, i) => (
                        <div
                            key={i}
                            style={{
                                position: 'absolute',
                                top: '-10px',
                                left: `${Math.random() * 100}%`,
                                width: '10px',
                                height: '10px',
                                backgroundColor: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A'][Math.floor(Math.random() * 5)],
                                borderRadius: Math.random() > 0.5 ? '50%' : '0',
                                animation: `fall ${2 + Math.random() * 2}s linear`,
                                animationDelay: `${Math.random() * 0.5}s`
                            }}
                        />
                    ))}
                </div>
            )}

            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <Link href="/dashboard/games" className="btn btn-light rounded-circle p-2 shadow">
                    <ArrowLeft size={20} />
                </Link>
                <div className="d-flex gap-3">
                    <div className="bg-white rounded-3 px-4 py-2 shadow-sm">
                        <span className="fw-bold text-success d-flex align-items-center gap-1">
                            <CheckCircle size={20} />
                            {score}
                        </span>
                    </div>
                    <div className="bg-white rounded-3 px-4 py-2 shadow-sm">
                        <span className="fw-bold text-danger d-flex align-items-center gap-1">
                            <XCircle size={20} />
                            {mistakes}/{MAX_MISTAKES}
                        </span>
                    </div>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
                <div className="bg-white rounded-pill p-1 shadow-sm">
                    <div 
                        className="bg-success rounded-pill transition-all" 
                        style={{ 
                            height: '8px', 
                            width: `${(score / vocabulary.length) * 100}%`,
                            transition: 'width 0.5s ease'
                        }}
                    />
                </div>
                <p className="text-white text-center mt-2 small fw-semibold">
                    {score} / {vocabulary.length} items collected
                </p>
            </div>

            {/* Task */}
            {currentTask && (
                <div className="text-center mb-4">
                    <div className="card border-0 rounded-4 shadow-lg mx-auto" style={{ maxWidth: 500, animation: 'slideDown 0.5s ease' }}>
                        <div className="card-body p-4">
                            <h3 className="fw-bold mb-3">
                                🛒 Add the <span className="text-primary" style={{ fontSize: '1.5em' }}>{currentTask.word}</span> to the basket!
                            </h3>
                            <p className="text-muted mb-3">({currentTask.translation})</p>
                            <button 
                                onClick={speakTask} 
                                className="btn btn-primary rounded-circle p-3 shadow"
                                style={{ transition: 'transform 0.2s' }}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                            >
                                <Volume2 size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Feedback */}
            {feedback && (
                <div 
                    className={`alert alert-${feedback.type === 'success' ? 'success' : 'danger'} text-center fw-bold mb-4 mx-auto shadow-lg`} 
                    style={{ 
                        maxWidth: 400,
                        animation: feedback.type === 'success' ? 'bounce 0.5s ease' : 'shake 0.5s ease',
                        fontSize: '1.2em'
                    }}
                >
                    {feedback.message}
                </div>
            )}

            {/* Game Area */}
            <div className="row g-4">
                {/* Items */}
                <div className="col-lg-8">
                    <div className="card border-0 rounded-4 shadow-lg">
                        <div className="card-body p-4">
                            <h5 className="fw-bold mb-4 d-flex align-items-center gap-2">
                                <ShoppingBag size={20} className="text-primary" />
                                Available Items:
                            </h5>
                            <div className="row g-3">
                                {items.map((item, index) => (
                                    <div key={index} className="col-4 col-md-3">
                                        <div
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, item)}
                                            className={`card border-2 rounded-3 text-center p-3 ${completedItems.includes(item.word) ? 'opacity-50' : ''}`}
                                            style={{ 
                                                cursor: 'grab', 
                                                transition: 'all 0.2s',
                                                boxShadow: draggedItem?.word === item.word ? '0 8px 16px rgba(0,0,0,0.2)' : '0 2px 4px rgba(0,0,0,0.1)'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px) scale(1.05)'}
                                            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0) scale(1)'}
                                        >
                                            {item.image ? (
                                                <img 
                                                    src={item.image} 
                                                    alt={item.word} 
                                                    className="mb-2" 
                                                    style={{ 
                                                        width: '80px', 
                                                        height: '80px', 
                                                        objectFit: 'contain',
                                                        filter: completedItems.includes(item.word) ? 'grayscale(100%)' : 'none'
                                                    }} 
                                                />
                                            ) : (
                                                <div className="mb-2" style={{ fontSize: '60px' }}>📦</div>
                                            )}
                                            <p className="small fw-semibold mb-0">{item.word}</p>
                                            <p className="text-muted mb-0" style={{ fontSize: '0.7em' }}>{item.translation}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Basket */}
                <div className="col-lg-4">
                    <div
                        className={`card border-0 rounded-4 shadow-lg h-100 ${isShaking ? 'shake' : ''}`}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        style={{ 
                            minHeight: '400px', 
                            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                            transition: 'transform 0.3s ease'
                        }}
                    >
                        <div className="card-body p-4 d-flex flex-column align-items-center justify-content-center text-white">
                            <div style={{ fontSize: '80px', animation: 'float 3s ease-in-out infinite' }} className="mb-3">🧺</div>
                            <h5 className="fw-bold mb-3">Shopping Basket</h5>
                            {basket.length === 0 ? (
                                <p className="text-center opacity-75">
                                    <ArrowDown size={40} className="mb-2" />
                                    <br />
                                    Drag items here
                                </p>
                            ) : (
                                <div className="d-flex flex-wrap gap-2 justify-content-center">
                                    {basket.map((item, index) => (
                                        <div 
                                            key={index} 
                                            className="bg-white text-dark rounded-3 px-3 py-2 shadow-sm"
                                            style={{ animation: 'popIn 0.3s ease' }}
                                        >
                                            <small className="fw-semibold d-flex align-items-center gap-1">
                                                <span>✓</span>
                                                {item.word}
                                            </small>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* CSS Animations */}
            <style jsx>{`
                @keyframes fall {
                    to {
                        transform: translateY(100vh) rotate(360deg);
                        opacity: 0;
                    }
                }
                @keyframes slideDown {
                    from {
                        opacity: 0;
                        transform: translateY(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                @keyframes bounce {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.1); }
                }
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-10px); }
                    75% { transform: translateX(10px); }
                }
                .shake {
                    animation: shake 0.5s ease;
                }
                @keyframes float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
                @keyframes popIn {
                    from {
                        opacity: 0;
                        transform: scale(0.5);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }
            `}</style>
        </div>
    );
}
