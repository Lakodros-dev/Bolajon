'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import GameOverModal from '@/components/GameOverModal';
import { ArrowLeft, Volume2, CheckCircle, XCircle, Frown, ShoppingCart, ShoppingBag, ArrowDown, X as CloseIcon } from 'lucide-react';

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
    const [touchStartPos, setTouchStartPos] = useState(null);
    const [isDragging, setIsDragging] = useState(false);

    const MAX_MISTAKES = 3;

    useEffect(() => {
        if (lessonId) {
            fetchLesson();
        }
    }, [lessonId]);

    // Auto-repeat audio every 3 seconds
    useEffect(() => {
        if (!currentTask) return;

        // Speak immediately when task changes
        speakWord(currentTask.word);

        // Set up interval to repeat every 3 seconds
        const interval = setInterval(() => {
            speakWord(currentTask.word);
        }, 3000);

        return () => clearInterval(interval);
    }, [currentTask]);

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

        // Generate more diverse items (correct + more random others)
        const others = vocab.filter(v => v.word !== task.word);
        const shuffledOthers = others.sort(() => Math.random() - 0.5).slice(0, Math.min(8, others.length)); // 8 ta boshqa item
        const allItems = [task, ...shuffledOthers].sort(() => Math.random() - 0.5);
        
        setItems(allItems);
        setBasket([]);
        setFeedback(null);
    }, []);

    const handleItemClick = (item) => {
        // Faqat drag bo'lmagan holda click ishlasin
        if (!isDragging && !currentTask) return;
        if (!isDragging) {
            handleItemDrop(item);
        }
    };

    const handleDragStart = (e, item) => {
        setDraggedItem(item);
        if (e.dataTransfer) {
            e.dataTransfer.effectAllowed = 'move';
        }
    };

    const handleTouchStart = (e, item) => {
        const touch = e.touches[0];
        setTouchStartPos({ x: touch.clientX, y: touch.clientY });
        setDraggedItem(item);
        setIsDragging(false);
    };

    const handleTouchMove = (e) => {
        if (!touchStartPos) return;
        const touch = e.touches[0];
        const deltaX = Math.abs(touch.clientX - touchStartPos.x);
        const deltaY = Math.abs(touch.clientY - touchStartPos.y);
        
        // Agar 10px dan ko'proq harakat qilsa, drag deb hisoblaymiz
        if (deltaX > 10 || deltaY > 10) {
            setIsDragging(true);
        }
    };

    const handleTouchEnd = (e, item) => {
        if (!currentTask || !draggedItem) {
            setDraggedItem(null);
            setTouchStartPos(null);
            setIsDragging(false);
            return;
        }
        
        // Agar drag qilingan bo'lsa, basket ustida ekanligini tekshiramiz
        if (isDragging) {
            const touch = e.changedTouches[0];
            const basketElement = document.getElementById('basket-drop-zone');
            if (basketElement) {
                const rect = basketElement.getBoundingClientRect();
                if (
                    touch.clientX >= rect.left &&
                    touch.clientX <= rect.right &&
                    touch.clientY >= rect.top &&
                    touch.clientY <= rect.bottom
                ) {
                    handleItemDrop(item);
                }
            }
        }
        
        setDraggedItem(null);
        setTouchStartPos(null);
        setIsDragging(false);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        if (e.dataTransfer) {
            e.dataTransfer.dropEffect = 'move';
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        if (!draggedItem || !currentTask) return;
        handleItemDrop(draggedItem);
        setDraggedItem(null);
    };

    const handleItemDrop = (item) => {
        if (!item || !currentTask) return;

        const isCorrect = item.word === currentTask.word;

        if (isCorrect) {
            // Correct!
            setScore(prev => prev + 1);
            setFeedback({ type: 'success', message: '✓ To\'g\'ri!' });
            setShowConfetti(true);
            speakText('Good job!');

            // Remove item from items and add to basket
            setItems(prev => prev.filter(i => i.word !== item.word));
            setBasket(prev => [...prev, item]);
            setCompletedItems(prev => [...prev, item.word]);

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
            setFeedback({ type: 'error', message: '✗ Qayta urinib ko\'ring!' });
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
    };

    const speakWord = (word) => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel(); // Cancel any ongoing speech
            const utterance = new SpeechSynthesisUtterance(word);
            utterance.lang = 'en-US';
            utterance.rate = 0.9;
            window.speechSynthesis.speak(utterance);
        }
    };

    const recordGameWin = async () => {
        try {
            await fetch('/api/game-progress', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    ...getAuthHeader()
                },
                body: JSON.stringify({ studentId, lessonId })
            });
        } catch (error) {
            console.error('Error recording game progress:', error);
        }
    };

    const speakText = (text) => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel(); // Cancel any ongoing speech
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'en-US';
            utterance.rate = 0.9;
            window.speechSynthesis.speak(utterance);
        }
    };

    const speakTask = () => {
        if (currentTask) {
            speakWord(currentTask.word);
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
        return (
            <GameOverModal
                won={won}
                score={score}
                total={vocabulary.length}
                onRestart={restartGame}
            />
        );
    }

    return (
        <div className="min-vh-100 d-flex flex-column" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', position: 'relative', overflow: 'hidden' }}>
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

            {/* Compact Header */}
            <div className="p-2">
                <div className="d-flex justify-content-between align-items-center">
                    <Link href="/dashboard/lessons" className="btn btn-light rounded-circle shadow" style={{ width: '36px', height: '36px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ArrowLeft size={18} />
                    </Link>
                    
                    <div className="d-flex gap-2">
                        <div className="bg-white rounded-3 px-2 py-1 shadow-sm">
                            <span className="fw-bold text-success d-flex align-items-center gap-1" style={{ fontSize: '13px' }}>
                                <CheckCircle size={14} />
                                {score}/{vocabulary.length}
                            </span>
                        </div>
                        <div className="bg-white rounded-3 px-2 py-1 shadow-sm">
                            <span className="fw-bold text-danger d-flex align-items-center gap-1" style={{ fontSize: '13px' }}>
                                <XCircle size={14} />
                                {mistakes}/{MAX_MISTAKES}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Task Card - Simple and Clear */}
            {currentTask && (
                <div className="px-2 pb-2">
                    <div className="card border-0 rounded-4 shadow-lg" style={{ 
                        background: 'linear-gradient(135deg, #FFD93D 0%, #FFC107 100%)',
                        animation: 'slideDown 0.5s ease, pulse 2s ease-in-out infinite'
                    }}>
                        <div className="card-body p-3">
                            <div className="d-flex align-items-center justify-content-center gap-2">
                                <span style={{ fontSize: '2rem' }}>🛒</span>
                                <h4 className="fw-bold mb-0 text-dark">Savatga qo'shing:</h4>
                                <span className="badge bg-white text-dark" style={{ fontSize: '2rem', padding: '12px 24px', fontWeight: 'bold', boxShadow: '0 4px 8px rgba(0,0,0,0.2)' }}>
                                    {currentTask.word}
                                </span>
                                <button 
                                    onClick={speakTask} 
                                    className="btn btn-light rounded-circle shadow" 
                                    style={{ 
                                        width: '44px', 
                                        height: '44px', 
                                        padding: 0, 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'center',
                                        transition: 'transform 0.2s'
                                    }}
                                >
                                    <Volume2 size={22} className="text-primary" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Feedback */}
            {feedback && (
                <div 
                    className={`alert alert-${feedback.type === 'success' ? 'success' : 'danger'} text-center fw-bold mx-2 shadow-lg`} 
                    style={{ 
                        animation: feedback.type === 'success' ? 'bounce 0.5s ease' : 'shake 0.5s ease',
                        fontSize: '1.3em',
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        zIndex: 1000,
                        maxWidth: '300px'
                    }}
                >
                    {feedback.message}
                </div>
            )}

            {/* Main Content - Flex grow to fill space */}
            <div className="flex-grow-1 px-2 pb-2 d-flex flex-column" style={{ minHeight: 0 }}>
                {/* Game Area */}
                <div className="row g-2 flex-grow-1" style={{ minHeight: 0 }}>
                    {/* Items */}
                    <div className="col-12 col-lg-7">
                        <div className="card border-0 rounded-4 shadow-sm h-100" style={{ background: 'rgba(255, 255, 255, 0.95)' }}>
                            <div className="card-body p-2" style={{ overflowY: 'auto', maxHeight: '100%' }}>
                                <h6 className="fw-bold mb-2 d-flex align-items-center gap-2 text-center justify-content-center" style={{ fontSize: '0.9rem' }}>
                                    <ShoppingBag size={16} className="text-primary" />
                                    Mahsulotlar
                                </h6>
                                <div className="row g-2">
                                    {items.map((item, index) => (
                                        <div key={index} className="col-4 col-md-3">
                                            <div
                                                draggable
                                                onClick={() => handleItemClick(item)}
                                                onDragStart={(e) => handleDragStart(e, item)}
                                                onTouchStart={(e) => handleTouchStart(e, item)}
                                                onTouchMove={(e) => handleTouchMove(e)}
                                                onTouchEnd={(e) => handleTouchEnd(e, item)}
                                                className="card rounded-3 text-center p-2 border-0"
                                                style={{ 
                                                    cursor: 'pointer', 
                                                    transition: 'all 0.2s',
                                                    boxShadow: draggedItem?.word === item.word && isDragging ? '0 8px 16px rgba(0,0,0,0.3)' : '0 2px 4px rgba(0,0,0,0.1)',
                                                    background: 'white',
                                                    height: '110px',
                                                    transform: draggedItem?.word === item.word && isDragging ? 'scale(1.1)' : 'scale(1)',
                                                    opacity: draggedItem?.word === item.word && isDragging ? 0.7 : 1,
                                                    touchAction: 'none'
                                                }}
                                            >
                                                {item.image ? (
                                                    <img 
                                                        src={item.image} 
                                                        alt={item.word} 
                                                        style={{ 
                                                            width: '100%', 
                                                            height: '100%', 
                                                            objectFit: 'contain',
                                                            borderRadius: '8px',
                                                            pointerEvents: 'none'
                                                        }} 
                                                    />
                                                ) : (
                                                    <div className="d-flex align-items-center justify-content-center h-100" style={{ fontSize: '60px' }}>📦</div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Basket */}
                    <div className="col-12 col-lg-5">
                        <div
                            id="basket-drop-zone"
                            className={`card border-0 rounded-4 shadow-lg h-100 ${isShaking ? 'shake' : ''}`}
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                            style={{ 
                                background: 'linear-gradient(135deg, #6DD5FA 0%, #2980B9 100%)',
                                transition: 'transform 0.3s ease',
                                minHeight: '180px'
                            }}
                        >
                            <div className="card-body p-3 d-flex flex-column align-items-center justify-content-center text-white">
                                <div style={{ fontSize: '60px', animation: 'float 3s ease-in-out infinite' }} className="mb-2">🧺</div>
                                <h5 className="fw-bold mb-2" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.2)' }}>Savat</h5>
                                {basket.length === 0 ? (
                                    <p className="text-center fw-semibold small mb-0" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.2)' }}>
                                        <ArrowDown size={28} className="mb-1" />
                                        <br />
                                        Bu yerga tashlang
                                    </p>
                                ) : (
                                    <div className="d-flex flex-wrap gap-2 justify-content-center">
                                        {basket.map((item, index) => (
                                            <div 
                                                key={index} 
                                                className="bg-white text-dark rounded-3 px-2 py-1 shadow"
                                                style={{ animation: 'popIn 0.3s ease' }}
                                            >
                                                <small className="fw-bold d-flex align-items-center gap-1" style={{ fontSize: '0.8rem' }}>
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
                @keyframes pulse {
                    0%, 100% { 
                        transform: scale(1);
                        box-shadow: 0 4px 12px rgba(255,193,7,0.3);
                    }
                    50% { 
                        transform: scale(1.02);
                        box-shadow: 0 6px 20px rgba(255,193,7,0.5);
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
