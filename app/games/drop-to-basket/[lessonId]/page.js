'use client';
import { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { ArrowLeft, Volume2, CheckCircle, XCircle, RotateCcw, Frown } from 'lucide-react';

export default function DropToBasketGame() {
    const params = useParams();
    const searchParams = useSearchParams();
    const { getAuthHeader } = useAuth();
    const lessonId = params.lessonId;
    const studentId = searchParams.get('student');
    
    const [lesson, setLesson] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentWord, setCurrentWord] = useState(null);
    const [fallingItems, setFallingItems] = useState([]);
    const [score, setScore] = useState(0);
    const [mistakes, setMistakes] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const [showConfetti, setShowConfetti] = useState(false);
    const [nextId, setNextId] = useState(0);

    const MAX_MISTAKES = 5;
    const FALL_DURATION = 5000;
    const SPAWN_INTERVAL = 2000;

    useEffect(() => {
        if (lessonId) fetchLesson();
    }, [lessonId]);

    // Cleanup: sahifadan chiqishda ovozni to'xtatish
    useEffect(() => {
        return () => {
            if ('speechSynthesis' in window) {
                window.speechSynthesis.cancel();
            }
        };
    }, []);

    const fetchLesson = async () => {
        try {
            const res = await fetch(`/api/lessons/${lessonId}`, {
                headers: getAuthHeader()
            });
            const data = await res.json();
            if (data.lesson && data.lesson.vocabulary && data.lesson.vocabulary.length > 0) {
                setLesson(data.lesson);
                startGame(data.lesson.vocabulary);
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const startGame = useCallback((vocabulary) => {
        const randomWord = vocabulary[Math.floor(Math.random() * vocabulary.length)];
        setCurrentWord(randomWord);
        speakText(`Find the ${randomWord.word}!`);
    }, []);

    useEffect(() => {
        if (gameOver || !currentWord || !lesson) return;

        const interval = setInterval(() => {
            const randomItem = lesson.vocabulary[Math.floor(Math.random() * lesson.vocabulary.length)];
            const newItem = {
                id: nextId,
                word: randomItem.word,
                translation: randomItem.translation,
                image: randomItem.image,
                left: Math.random() * 70 + 15,
                isCorrect: randomItem.word === currentWord.word
            };
            
            setNextId(prev => prev + 1);
            setFallingItems(prev => [...prev, newItem]);

            setTimeout(() => {
                setFallingItems(prev => {
                    const filtered = prev.filter(n => n.id !== newItem.id);
                    // O'tkazib yuborish xato hisoblanmaydi - faqat noto'g'ri so'zni bosish xato
                    // if (newItem.isCorrect && prev.find(n => n.id === newItem.id)) {
                    //     handleMissed();
                    // }
                    return filtered;
                });
            }, FALL_DURATION);
        }, SPAWN_INTERVAL);

        return () => clearInterval(interval);
    }, [gameOver, currentWord, lesson, nextId]);

    const handleItemClick = (item) => {
        if (gameOver) return;

        if (item.isCorrect) {
            setScore(prev => prev + 1);
            setFeedback({ type: 'success', message: '✓ Perfect!' });
            setShowConfetti(true);
            speakText('Perfect!');
            setFallingItems(prev => prev.filter(n => n.id !== item.id));

            setTimeout(() => {
                setShowConfetti(false);
                setFeedback(null);
            }, 1000);

            setTimeout(() => {
                if (score + 1 >= 15) {
                    setGameOver(true);
                    recordGameWin();
                } else {
                    startGame(lesson.vocabulary);
                }
            }, 1500);
        } else {
            // Faqat noto'g'ri so'zni bosganda xato hisoblanadi
            const newMistakes = mistakes + 1;
            setMistakes(newMistakes);
            setFeedback({ type: 'error', message: '✗ Try again!' });
            speakText('Try again!');
            setFallingItems(prev => prev.filter(n => n.id !== item.id));
            
            setTimeout(() => setFeedback(null), 1000);
            
            // 5 ta xato bo'lganda o'yin tugaydi
            if (newMistakes >= MAX_MISTAKES) {
                setTimeout(() => setGameOver(true), 1000);
            }
        }
    };

    const speakText = (text) => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'en-US';
            utterance.rate = 0.9;
            window.speechSynthesis.speak(utterance);
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
            console.error('Error:', error);
        }
    };

    const restartGame = () => {
        setScore(0);
        setMistakes(0);
        setGameOver(false);
        setFallingItems([]);
        setShowConfetti(false);
        setFeedback(null);
        setNextId(0);
        if (lesson && lesson.vocabulary) {
            startGame(lesson.vocabulary);
        }
    };

    if (loading) {
        return (
            <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                <div className="spinner-border text-white">
                    <span className="visually-hidden">Yuklanmoqda...</span>
                </div>
            </div>
        );
    }

    if (!lesson || !lesson.vocabulary || lesson.vocabulary.length === 0) {
        return (
            <div className="min-vh-100 d-flex flex-column align-items-center justify-content-center p-4" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                <span className="material-symbols-outlined text-white mb-3" style={{ fontSize: '64px' }}>sentiment_dissatisfied</span>
                <h4 className="text-white mb-3">Bu dars uchun lug'at topilmadi</h4>
                <Link href="/dashboard/games" className="btn btn-light">Orqaga qaytish</Link>
            </div>
        );
    }

    if (gameOver) {
        const won = mistakes < MAX_MISTAKES;
        return (
            <div className="min-vh-100 d-flex flex-column align-items-center justify-content-center p-4" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                <div className="card border-0 rounded-4 shadow-lg text-center" style={{ maxWidth: 400 }}>
                    <div className="card-body p-5">
                        <div className="mb-4">
                            <span style={{ fontSize: '80px' }}>{won ? '🎉' : '😊'}</span>
                        </div>
                        <h2 className="fw-bold mb-2">{won ? 'Ajoyib!' : 'Yaxshi harakat!'}</h2>
                        <p className="text-muted mb-4">{score} ta to'g'ri, {mistakes} ta xato</p>
                        <div className="d-flex gap-3 justify-content-center">
                            <button onClick={restartGame} className="btn btn-primary rounded-3 px-4">
                                <span className="material-symbols-outlined me-2" style={{ fontSize: '20px' }}>replay</span>
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
        <div className="min-vh-100" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', position: 'relative', overflow: 'hidden' }}>
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

            {/* Fixed Header */}
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', paddingTop: '20px', paddingBottom: '20px' }}>
                <div className="container-fluid px-4">
                    {/* Desktop Layout */}
                    <div className="d-none d-lg-flex justify-content-between align-items-center">
                        <Link href="/dashboard/games" className="btn btn-light rounded-circle shadow-sm" style={{ width: '50px', height: '50px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <ArrowLeft size={24} />
                        </Link>
                        
                        {currentWord && (
                            <div className="bg-white bg-opacity-90 rounded-4 shadow-lg px-4 py-3 text-center flex-grow-1 mx-4" style={{ backdropFilter: 'blur(10px)', maxWidth: '600px' }}>
                                <div className="d-flex align-items-center justify-content-center gap-3">
                                    <span style={{ fontSize: '1.1rem', color: '#666' }}>🧺 Find the</span>
                                    <span className="fw-bold" style={{ fontSize: '2.2rem', color: '#000', letterSpacing: '-0.5px' }}>{currentWord.word}</span>
                                    <button 
                                        onClick={() => speakText(`Find the ${currentWord.word}!`)} 
                                        className="btn btn-primary rounded-circle shadow-sm" 
                                        style={{ 
                                            width: '50px', 
                                            height: '50px', 
                                            padding: 0, 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'center', 
                                            transition: 'all 0.2s',
                                            flexShrink: 0
                                        }} 
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform = 'scale(1.1)';
                                            e.currentTarget.style.boxShadow = '0 6px 16px rgba(13, 110, 253, 0.4)';
                                        }} 
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = 'scale(1)';
                                            e.currentTarget.style.boxShadow = '';
                                        }}
                                    >
                                        <Volume2 size={24} />
                                    </button>
                                </div>
                            </div>
                        )}
                        
                        <div className="d-flex gap-2">
                            <div className="bg-white bg-opacity-25 rounded-3 px-3 py-2 border border-white border-opacity-50 shadow-sm">
                                <span className="fw-bold text-white d-flex align-items-center gap-1">
                                    <CheckCircle size={18} />
                                    {score}
                                </span>
                            </div>
                            <div className="bg-white bg-opacity-25 rounded-3 px-3 py-2 border border-white border-opacity-50 shadow-sm">
                                <span className="fw-bold text-white d-flex align-items-center gap-1">
                                    <XCircle size={18} />
                                    {mistakes}/{MAX_MISTAKES}
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    {/* Mobile Layout */}
                    <div className="d-lg-none">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                            <Link href="/dashboard/games" className="btn btn-light rounded-circle shadow-sm" style={{ width: '40px', height: '40px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <ArrowLeft size={20} />
                            </Link>
                            
                            <div className="d-flex gap-2">
                                <div className="bg-white bg-opacity-25 rounded-3 px-2 py-1 border border-white border-opacity-50 shadow-sm">
                                    <span className="fw-bold text-white d-flex align-items-center gap-1" style={{ fontSize: '14px' }}>
                                        <CheckCircle size={16} />
                                        {score}
                                    </span>
                                </div>
                                <div className="bg-white bg-opacity-25 rounded-3 px-2 py-1 border border-white border-opacity-50 shadow-sm">
                                    <span className="fw-bold text-white d-flex align-items-center gap-1" style={{ fontSize: '14px' }}>
                                        <XCircle size={16} />
                                        {mistakes}/{MAX_MISTAKES}
                                    </span>
                                </div>
                            </div>
                        </div>
                        
                        {currentWord && (
                            <div className="bg-white bg-opacity-90 rounded-4 shadow-lg px-3 py-2 text-center" style={{ backdropFilter: 'blur(10px)', marginTop: '8px' }}>
                                <div className="d-flex align-items-center justify-content-center gap-2">
                                    <span style={{ fontSize: '0.9rem', color: '#666' }}>🧺 Find the</span>
                                    <span className="fw-bold" style={{ fontSize: '1.8rem', color: '#000', letterSpacing: '-0.5px' }}>{currentWord.word}</span>
                                    <button 
                                        onClick={() => speakText(`Find the ${currentWord.word}!`)} 
                                        className="btn btn-primary rounded-circle shadow-sm" 
                                        style={{ 
                                            width: '40px', 
                                            height: '40px', 
                                            padding: 0, 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'center'
                                        }}
                                    >
                                        <Volume2 size={20} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            {/* Game Area with top padding */}
            <div style={{ paddingTop: '140px' }} className="d-lg-none"></div>
            <div style={{ paddingTop: '100px' }} className="d-none d-lg-block"></div>

            {feedback && (
                <div
                    className={`alert alert-${feedback.type === 'success' ? 'success' : 'danger'} text-center fw-bold mb-4 mx-auto shadow-lg`}
                    style={{
                        maxWidth: 400,
                        animation: feedback.type === 'success' ? 'bounce 0.5s ease' : 'shake 0.5s ease',
                        fontSize: '1.2em',
                        position: 'fixed',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        zIndex: 1000
                    }}
                >
                    {feedback.message}
                </div>
            )}

            <div style={{ position: 'relative', height: '80vh', marginTop: '20px', overflow: 'hidden' }}>
                {fallingItems.map((item) => (
                    <div
                        key={item.id}
                        onClick={() => handleItemClick(item)}
                        style={{
                            position: 'absolute',
                            left: `${item.left}%`,
                            top: '0',
                            cursor: 'pointer',
                            animation: `fallDown ${FALL_DURATION}ms linear`,
                            zIndex: 10
                        }}
                    >
                        <div
                            className="rounded-circle d-flex align-items-center justify-content-center shadow-lg"
                            style={{
                                width: '100px',
                                height: '100px',
                                background: item.image ? 'white' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                border: '4px solid white',
                                boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
                                overflow: 'hidden',
                                transition: 'transform 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.15)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            {item.image ? (
                                <img
                                    src={item.image}
                                    alt={item.word}
                                    style={{
                                        width: '80px',
                                        height: '80px',
                                        objectFit: 'cover',
                                        borderRadius: '50%'
                                    }}
                                />
                            ) : (
                                <span style={{ fontSize: '40px', fontWeight: 'bold', color: 'white', textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
                                    {item.word.charAt(0).toUpperCase()}
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <div className="text-center" style={{ position: 'fixed', bottom: '20px', left: '50%', transform: 'translateX(-50%)', zIndex: 5 }}>
                <div style={{ fontSize: '80px', animation: 'float 3s ease-in-out infinite' }}>🧺</div>
                <p className="text-white fw-bold">Catch here!</p>
            </div>

            <style jsx>{`
                @keyframes fall {
                    to {
                        transform: translateY(100vh) rotate(360deg);
                        opacity: 0;
                    }
                }
                @keyframes fallDown {
                    from {
                        transform: translateY(-100px);
                    }
                    to {
                        transform: translateY(calc(70vh + 100px));
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
                    0%, 100% {
                        transform: scale(1);
                    }
                    50% {
                        transform: scale(1.1);
                    }
                }
                @keyframes shake {
                    0%, 100% {
                        transform: translate(-50%, -50%) translateX(0);
                    }
                    25% {
                        transform: translate(-50%, -50%) translateX(-10px);
                    }
                    75% {
                        transform: translate(-50%, -50%) translateX(10px);
                    }
                }
                @keyframes float {
                    0%, 100% {
                        transform: translateY(0);
                    }
                    50% {
                        transform: translateY(-10px);
                    }
                }
            `}</style>
        </div>
    );
}
