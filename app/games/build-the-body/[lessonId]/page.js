'use client';
import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { ArrowLeft, Volume2, CheckCircle, XCircle, RotateCcw, Frown } from 'lucide-react';

export default function BuildTheBodyGame() {
    const params = useParams();
    const searchParams = useSearchParams();
    const { getAuthHeader } = useAuth();
    const lessonId = params.lessonId;
    const studentId = searchParams.get('student');
    
    const [lesson, setLesson] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [options, setOptions] = useState([]);
    const [score, setScore] = useState(0);
    const [mistakes, setMistakes] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const [showConfetti, setShowConfetti] = useState(false);
    const [usedWords, setUsedWords] = useState([]);

    const MAX_MISTAKES = 5;
    const TOTAL_QUESTIONS = 10;

    // Body parts emoji icons
    const bodyPartIcons = {
        'head': '👤',
        'hair': '💇',
        'eyes': '👀',
        'eye': '👁️',
        'nose': '👃',
        'mouth': '👄',
        'ears': '👂',
        'ear': '👂',
        'neck': '🦴',
        'shoulders': '💪',
        'shoulder': '💪',
        'arm': '💪',
        'hand': '✋',
        'fingers': '🖐️',
        'finger': '☝️',
        'chest': '🫁',
        'stomach': '🫃',
        'back': '🔙',
        'leg': '🦵',
        'knee': '🦵',
        'foot': '🦶',
        'elbow': '💪',
        'face': '😊',
        'body': '🧍',
        'teeth': '🦷',
        'tooth': '🦷',
        'tongue': '👅'
    };

    const getBodyPartIcon = (word) => {
        const lowerWord = word.toLowerCase();
        return bodyPartIcons[lowerWord] || '🧍';
    };

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
        if (vocabulary.length < 4) {
            alert('Bu o\'yin uchun kamida 4 ta so\'z kerak!');
            return;
        }
        generateQuestion(vocabulary, []);
    };

    const generateQuestion = (vocabulary, used) => {
        if (used.length >= TOTAL_QUESTIONS || used.length >= vocabulary.length) {
            setGameOver(true);
            if (mistakes < MAX_MISTAKES) {
                recordGameWin();
            }
            return;
        }

        const availableWords = vocabulary.filter(v => !used.includes(v.word));
        if (availableWords.length === 0) {
            setGameOver(true);
            if (mistakes < MAX_MISTAKES) {
                recordGameWin();
            }
            return;
        }

        const correctAnswer = availableWords[Math.floor(Math.random() * availableWords.length)];
        const wrongAnswers = vocabulary
            .filter(v => v.word !== correctAnswer.word)
            .sort(() => Math.random() - 0.5)
            .slice(0, 3);
        const allOptions = [correctAnswer, ...wrongAnswers].sort(() => Math.random() - 0.5);

        setCurrentQuestion(correctAnswer);
        setOptions(allOptions);
        
        setTimeout(() => {
            speakText(`Find the ${correctAnswer.word}!`);
        }, 300);
    };

    const handleOptionClick = (selectedOption) => {
        if (feedback) return;

        if (selectedOption.word === currentQuestion.word) {
            setScore(prev => prev + 1);
            setFeedback({ type: 'success', message: '✓ Perfect!' });
            setShowConfetti(true);
            speakText('Perfect!');
            
            setTimeout(() => {
                setShowConfetti(false);
                setFeedback(null);
                const newUsed = [...usedWords, currentQuestion.word];
                setUsedWords(newUsed);
                generateQuestion(lesson.vocabulary, newUsed);
            }, 1500);
        } else {
            const newMistakes = mistakes + 1;
            setMistakes(newMistakes);
            setFeedback({ type: 'error', message: '✗ Try again!' });
            speakText('Try again!');
            
            setTimeout(() => {
                setFeedback(null);
            }, 1000);
            
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
        setShowConfetti(false);
        setFeedback(null);
        setUsedWords([]);
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

    if (!lesson || !lesson.vocabulary || lesson.vocabulary.length < 4) {
        return (
            <div className="min-vh-100 d-flex flex-column align-items-center justify-content-center p-4" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                <Frown size={64} className="text-white mb-3" />
                <h4 className="text-white mb-3">Bu o'yin uchun kamida 4 ta so'z kerak</h4>
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

            {currentQuestion && (
                <div className="text-center mb-4">
                    <div className="card border-0 rounded-4 shadow-lg mx-auto" style={{ maxWidth: 500 }}>
                        <div className="card-body p-4">
                            <h3 className="fw-bold mb-3">
                                🎯 Find the <span className="text-primary" style={{ fontSize: '1.5em' }}>{currentQuestion.word}</span>!
                            </h3>
                            <button
                                onClick={() => speakText(`Find the ${currentQuestion.word}!`)}
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

            <div className="container" style={{ maxWidth: '900px' }}>
                <div className="row g-4">
                    {options.map((option, index) => (
                        <div key={index} className="col-6">
                            <div
                                onClick={() => handleOptionClick(option)}
                                className="card border-0 rounded-4 shadow-lg h-100"
                                style={{
                                    cursor: feedback ? 'not-allowed' : 'pointer',
                                    transition: 'all 0.3s ease',
                                    background: 'white',
                                    minHeight: '250px'
                                }}
                                onMouseEnter={(e) => {
                                    if (!feedback) {
                                        e.currentTarget.style.transform = 'translateY(-10px)';
                                        e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.2)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '';
                                }}
                            >
                                <div className="card-body p-4 d-flex flex-column align-items-center justify-content-center">
                                    {option.image ? (
                                        <img
                                            src={option.image}
                                            alt={option.translation}
                                            style={{
                                                width: '150px',
                                                height: '150px',
                                                objectFit: 'contain',
                                                borderRadius: '15px',
                                                marginBottom: '15px'
                                            }}
                                        />
                                    ) : (
                                        <div
                                            style={{
                                                width: '150px',
                                                height: '150px',
                                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                borderRadius: '15px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: 'white',
                                                fontSize: '80px',
                                                marginBottom: '15px'
                                            }}
                                        >
                                            {getBodyPartIcon(option.word)}
                                        </div>
                                    )}
                                    <h5 className="fw-bold text-center mb-0">{option.translation}</h5>
                                </div>
                            </div>
                        </div>
                    ))}
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
                    0%, 100% { transform: translate(-50%, -50%) scale(1); }
                    50% { transform: translate(-50%, -50%) scale(1.1); }
                }
                @keyframes shake {
                    0%, 100% { transform: translate(-50%, -50%) translateX(0); }
                    25% { transform: translate(-50%, -50%) translateX(-10px); }
                    75% { transform: translate(-50%, -50%) translateX(10px); }
                }
            `}</style>
        </div>
    );
}
