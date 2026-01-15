'use client';
import { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function BuildTheBodyGame() {
    const params = useParams();
    const searchParams = useSearchParams();
    const lessonId = params.lessonId;
    const studentId = searchParams.get('student');
    
    const [lesson, setLesson] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentBodyPart, setCurrentBodyPart] = useState(null);
    const [placedParts, setPlacedParts] = useState([]);
    const [availableParts, setAvailableParts] = useState([]);
    const [score, setScore] = useState(0);
    const [mistakes, setMistakes] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const [showConfetti, setShowConfetti] = useState(false);
    const [draggedItem, setDraggedItem] = useState(null);

    const MAX_MISTAKES = 5;

    // Body parts with their positions on the body outline
    const bodyPartsPositions = {
        'head': { top: '5%', left: '50%', width: '80px', height: '80px' },
        'hair': { top: '2%', left: '50%', width: '90px', height: '40px' },
        'eyes': { top: '15%', left: '50%', width: '60px', height: '20px' },
        'nose': { top: '22%', left: '50%', width: '30px', height: '30px' },
        'mouth': { top: '28%', left: '50%', width: '50px', height: '20px' },
        'ears': { top: '15%', left: '50%', width: '100px', height: '30px' },
        'neck': { top: '35%', left: '50%', width: '40px', height: '30px' },
        'shoulders': { top: '40%', left: '50%', width: '120px', height: '20px' },
        'arm': { top: '45%', left: '30%', width: '30px', height: '80px' },
        'hand': { top: '60%', left: '25%', width: '35px', height: '35px' },
        'chest': { top: '48%', left: '50%', width: '80px', height: '50px' },
        'stomach': { top: '60%', left: '50%', width: '70px', height: '40px' },
        'leg': { top: '75%', left: '40%', width: '35px', height: '90px' },
        'knee': { top: '82%', left: '40%', width: '40px', height: '20px' },
        'foot': { top: '92%', left: '40%', width: '45px', height: '25px' }
    };

    useEffect(() => {
        if (lessonId) fetchLesson();
    }, [lessonId]);

    const fetchLesson = async () => {
        try {
            const res = await fetch(`/api/lessons/${lessonId}`);
            const data = await res.json();
            if (data.lesson && data.lesson.vocabulary) {
                setLesson(data.lesson);
                initializeGame(data.lesson.vocabulary);
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const initializeGame = (vocabulary) => {
        const parts = vocabulary.map(item => ({
            word: item.word.toLowerCase(),
            translation: item.translation,
            image: item.image,
            placed: false
        }));
        setAvailableParts(parts);
        if (parts.length > 0) {
            selectRandomPart(parts);
        }
    };

    const selectRandomPart = (parts) => {
        const unplacedParts = parts.filter(p => !p.placed);
        if (unplacedParts.length === 0) {
            setGameOver(true);
            recordGameWin();
            return;
        }
        const randomPart = unplacedParts[Math.floor(Math.random() * unplacedParts.length)];
        setCurrentBodyPart(randomPart);
        speakText(`Put the ${randomPart.word}!`);
    };

    const handleDragStart = (e, part) => {
        setDraggedItem(part);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e, targetPart) => {
        e.preventDefault();
        if (!draggedItem || !currentBodyPart) return;

        if (draggedItem.word === currentBodyPart.word) {
            // Correct placement
            setScore(prev => prev + 1);
            setPlacedParts(prev => [...prev, draggedItem.word]);
            setAvailableParts(prev => prev.map(p => 
                p.word === draggedItem.word ? { ...p, placed: true } : p
            ));
            setFeedback({ type: 'success', message: '✓ Perfect!' });
            setShowConfetti(true);
            speakText('Perfect!');
            
            setTimeout(() => {
                setShowConfetti(false);
                setFeedback(null);
                selectRandomPart(availableParts.map(p => 
                    p.word === draggedItem.word ? { ...p, placed: true } : p
                ));
            }, 1500);
        } else {
            // Wrong placement
            setMistakes(prev => prev + 1);
            setFeedback({ type: 'error', message: '✗ Try again!' });
            speakText('Try again!');
            
            setTimeout(() => setFeedback(null), 1000);
            
            if (mistakes + 1 >= MAX_MISTAKES) {
                setTimeout(() => setGameOver(true), 1000);
            }
        }
        setDraggedItem(null);
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
        setPlacedParts([]);
        setShowConfetti(false);
        setFeedback(null);
        if (lesson && lesson.vocabulary) {
            initializeGame(lesson.vocabulary);
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
        <div className="min-vh-100 p-4" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', position: 'relative' }}>
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

            <div className="d-flex justify-content-between align-items-center mb-4">
                <Link href="/dashboard/games" className="btn btn-light rounded-circle p-2 shadow">
                    <span className="material-symbols-outlined">arrow_back</span>
                </Link>
                <div className="d-flex gap-3">
                    <div className="bg-white rounded-3 px-4 py-2 shadow-sm">
                        <span className="fw-bold text-success d-flex align-items-center gap-1">
                            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>check_circle</span>
                            {score}
                        </span>
                    </div>
                    <div className="bg-white rounded-3 px-4 py-2 shadow-sm">
                        <span className="fw-bold text-danger d-flex align-items-center gap-1">
                            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>cancel</span>
                            {mistakes}/{MAX_MISTAKES}
                        </span>
                    </div>
                </div>
            </div>

            {currentBodyPart && (
                <div className="text-center mb-4">
                    <div className="card border-0 rounded-4 shadow-lg mx-auto" style={{ maxWidth: 500 }}>
                        <div className="card-body p-4">
                            <h3 className="fw-bold mb-3">
                                🎯 Put the <span className="text-primary" style={{ fontSize: '1.5em' }}>{currentBodyPart.word}</span>!
                            </h3>
                            <p className="text-muted mb-3">{currentBodyPart.translation}</p>
                            <button
                                onClick={() => speakText(`Put the ${currentBodyPart.word}!`)}
                                className="btn btn-primary rounded-circle p-3 shadow"
                                style={{ transition: 'transform 0.2s' }}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                            >
                                <span className="material-symbols-outlined">volume_up</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

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

            <div className="row g-4">
                {/* Body Outline - Drop Zone */}
                <div className="col-lg-8">
                    <div className="card border-0 rounded-4 shadow-lg" style={{ minHeight: '600px', background: 'white' }}>
                        <div className="card-body p-4">
                            <h5 className="fw-bold mb-4 text-center">Build the Body</h5>
                            <div
                                style={{
                                    position: 'relative',
                                    width: '100%',
                                    height: '500px',
                                    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                                    borderRadius: '20px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                {/* Body Outline SVG */}
                                <svg width="200" height="450" style={{ position: 'absolute' }}>
                                    {/* Head outline */}
                                    <circle cx="100" cy="50" r="40" fill="none" stroke="#ddd" strokeWidth="3" strokeDasharray="5,5" />
                                    {/* Neck */}
                                    <line x1="100" y1="90" x2="100" y2="120" stroke="#ddd" strokeWidth="3" strokeDasharray="5,5" />
                                    {/* Body */}
                                    <rect x="70" y="120" width="60" height="100" fill="none" stroke="#ddd" strokeWidth="3" strokeDasharray="5,5" rx="10" />
                                    {/* Arms */}
                                    <line x1="70" y1="140" x2="30" y2="200" stroke="#ddd" strokeWidth="3" strokeDasharray="5,5" />
                                    <line x1="130" y1="140" x2="170" y2="200" stroke="#ddd" strokeWidth="3" strokeDasharray="5,5" />
                                    {/* Legs */}
                                    <line x1="85" y1="220" x2="70" y2="320" stroke="#ddd" strokeWidth="3" strokeDasharray="5,5" />
                                    <line x1="115" y1="220" x2="130" y2="320" stroke="#ddd" strokeWidth="3" strokeDasharray="5,5" />
                                </svg>

                                {/* Drop zones for each body part */}
                                {Object.keys(bodyPartsPositions).map((partKey) => {
                                    const position = bodyPartsPositions[partKey];
                                    const isPlaced = placedParts.includes(partKey);
                                    const partData = availableParts.find(p => p.word === partKey);

                                    return (
                                        <div
                                            key={partKey}
                                            onDragOver={handleDragOver}
                                            onDrop={(e) => handleDrop(e, partKey)}
                                            style={{
                                                position: 'absolute',
                                                top: position.top,
                                                left: position.left,
                                                transform: 'translate(-50%, -50%)',
                                                width: position.width,
                                                height: position.height,
                                                border: isPlaced ? 'none' : '2px dashed #ccc',
                                                borderRadius: '10px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                background: isPlaced ? 'transparent' : 'rgba(255,255,255,0.3)',
                                                transition: 'all 0.3s ease'
                                            }}
                                        >
                                            {isPlaced && partData && partData.image && (
                                                <img
                                                    src={partData.image}
                                                    alt={partKey}
                                                    style={{
                                                        width: '100%',
                                                        height: '100%',
                                                        objectFit: 'contain',
                                                        animation: 'snapIn 0.3s ease'
                                                    }}
                                                />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Inventory - Available Parts */}
                <div className="col-lg-4">
                    <div className="card border-0 rounded-4 shadow-lg" style={{ minHeight: '600px' }}>
                        <div className="card-body p-4">
                            <h5 className="fw-bold mb-4">Body Parts</h5>
                            <div className="d-flex flex-column gap-3" style={{ maxHeight: '520px', overflowY: 'auto' }}>
                                {availableParts.map((part, index) => (
                                    <div
                                        key={index}
                                        draggable={!part.placed}
                                        onDragStart={(e) => handleDragStart(e, part)}
                                        className={`card border-2 rounded-3 ${part.placed ? 'opacity-50' : ''}`}
                                        style={{
                                            cursor: part.placed ? 'not-allowed' : 'grab',
                                            transition: 'all 0.2s',
                                            borderColor: currentBodyPart && currentBodyPart.word === part.word ? '#0d6efd' : '#dee2e6',
                                            background: currentBodyPart && currentBodyPart.word === part.word ? 'rgba(13, 110, 253, 0.1)' : 'white'
                                        }}
                                    >
                                        <div className="card-body p-3 d-flex align-items-center gap-3">
                                            {part.image ? (
                                                <img
                                                    src={part.image}
                                                    alt={part.word}
                                                    style={{
                                                        width: '60px',
                                                        height: '60px',
                                                        objectFit: 'contain',
                                                        borderRadius: '8px'
                                                    }}
                                                />
                                            ) : (
                                                <div
                                                    style={{
                                                        width: '60px',
                                                        height: '60px',
                                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                        borderRadius: '8px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        color: 'white',
                                                        fontWeight: 'bold'
                                                    }}
                                                >
                                                    {part.word.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                            <div className="flex-grow-1">
                                                <p className="mb-0 fw-semibold">{part.word}</p>
                                                <small className="text-muted">{part.translation}</small>
                                            </div>
                                            {part.placed && (
                                                <span className="material-symbols-outlined text-success">check_circle</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes fall {
                    to {
                        transform: translateY(100vh) rotate(360deg);
                        opacity: 0;
                    }
                }
                @keyframes bounce {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.1); }
                }
                @keyframes shake {
                    0%, 100% { transform: translate(-50%, -50%) translateX(0); }
                    25% { transform: translate(-50%, -50%) translateX(-10px); }
                    75% { transform: translate(-50%, -50%) translateX(10px); }
                }
                @keyframes snapIn {
                    0% { transform: scale(0); opacity: 0; }
                    50% { transform: scale(1.2); }
                    100% { transform: scale(1); opacity: 1; }
                }
            `}</style>
        </div>
    );
}
