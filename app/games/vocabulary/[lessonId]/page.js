'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import GameOverModal from '@/components/GameOverModal';
import { ArrowLeft, Frown, Image as ImageIcon, CheckCircle, XCircle, Star } from 'lucide-react';

export default function VocabularyGamePage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();
    const { getAuthHeader } = useAuth();
    const lessonId = params.lessonId;
    const studentId = searchParams.get('student');

    const [lesson, setLesson] = useState(null);
    const [vocabulary, setVocabulary] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [options, setOptions] = useState([]);
    const [selectedOption, setSelectedOption] = useState(null);
    const [isCorrect, setIsCorrect] = useState(null);
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isSpeaking, setIsSpeaking] = useState(false);

    // Speech synthesis setup
    const speakText = useCallback((text, lang = 'en-US', rate = 0.9) => {
        if ('speechSynthesis' in window) {
            // Cancel any ongoing speech
            window.speechSynthesis.cancel();
            
            setTimeout(() => {
                const utterance = new SpeechSynthesisUtterance(text);
                utterance.lang = lang;
                utterance.rate = rate;
                utterance.pitch = 1.0;
                utterance.volume = 1.0;
                
                utterance.onstart = () => setIsSpeaking(true);
                utterance.onend = () => setIsSpeaking(false);
                utterance.onerror = () => setIsSpeaking(false);
                
                window.speechSynthesis.speak(utterance);
            }, 100);
        }
    }, []);

    // No need to speak Uzbek translation automatically
    // Only speak English words when user clicks on options

    useEffect(() => {
        if (lessonId) {
            fetchLesson();
        }
        
        // Cleanup: stop speech when component unmounts
        return () => {
            if ('speechSynthesis' in window) {
                window.speechSynthesis.cancel();
            }
        };
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
                // Shuffle vocabulary
                const shuffled = [...vocab].sort(() => Math.random() - 0.5);
                setVocabulary(shuffled);
                if (shuffled.length > 0) {
                    generateOptions(shuffled, 0);
                }
            }
        } catch (error) {
            console.error('Error fetching lesson:', error);
        } finally {
            setLoading(false);
        }
    };

    const generateOptions = useCallback((vocab, index) => {
        if (!vocab || vocab.length === 0 || index >= vocab.length) return;

        const correct = vocab[index];
        const others = vocab.filter((_, i) => i !== index);
        const shuffledOthers = others.sort(() => Math.random() - 0.5).slice(0, 3);
        const allOptions = [correct, ...shuffledOthers].sort(() => Math.random() - 0.5);
        setOptions(allOptions);
    }, []);

    const handleListenClick = (option, e) => {
        e.stopPropagation();
        // Just play the pronunciation, don't select
        speakText(option.word, 'en-US', 0.9);
    };

    const handleOptionClick = async (option) => {
        // If already checking answer, don't allow selection
        if (isCorrect !== null) return;
        
        // Select and check answer
        setSelectedOption(option);
        const correct = option.word === vocabulary[currentIndex].word;
        setIsCorrect(correct);

        if (correct) {
            setScore(prev => prev + 1);
        }

        // Wait and move to next
        setTimeout(async () => {
            if (currentIndex + 1 < vocabulary.length) {
                setCurrentIndex(prev => prev + 1);
                generateOptions(vocabulary, currentIndex + 1);
                setSelectedOption(null);
                setIsCorrect(null);
            } else {
                // Game over
                if ((score + (correct ? 1 : 0)) / vocabulary.length >= 0.7) {
                    await recordGameWin();
                }
                setGameOver(true);
            }
        }, 1500);
    };

    const recordGameWin = async () => {
        try {
            console.log('Recording game win...', { studentId, lessonId });
            const response = await fetch('/api/game-progress', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeader()
                },
                body: JSON.stringify({ studentId, lessonId })
            });
            const data = await response.json();
            console.log('Game win recorded:', data);
        } catch (error) {
            console.error('Error recording game win:', error);
        }
    };

    const restartGame = () => {
        // Cancel any ongoing speech
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
        
        const shuffled = [...vocabulary].sort(() => Math.random() - 0.5);
        setVocabulary(shuffled);
        setCurrentIndex(0);
        setScore(0);
        setGameOver(false);
        setSelectedOption(null);
        setIsCorrect(null);
        setIsSpeaking(false);
        generateOptions(shuffled, 0);
    };

    if (loading) {
        return (
            <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Yuklanmoqda...</span>
                </div>
            </div>
        );
    }

    if (!lesson || vocabulary.length === 0) {
        return (
            <div className="min-vh-100 d-flex flex-column align-items-center justify-content-center bg-light p-4">
                <Frown size={64} className="text-muted mb-3" />
                <h4 className="text-muted mb-3">Bu dars uchun lug'at topilmadi</h4>
                <Link href="/dashboard/games" className="btn btn-primary">
                    Orqaga qaytish
                </Link>
            </div>
        );
    }

    if (gameOver) {
        const percentage = Math.round((score / vocabulary.length) * 100);
        const won = percentage >= 70;

        return (
            <GameOverModal
                won={won}
                score={score}
                total={vocabulary.length}
                onRestart={restartGame}
            />
        );
    }

    const currentWord = vocabulary[currentIndex];

    return (
        <div className="min-vh-100 bg-light">
            {/* Header */}
            <div className="bg-white shadow-sm p-3">
                <div className="container">
                    <div className="d-flex align-items-center justify-content-between">
                        <Link href="/dashboard/games" className="btn btn-outline-secondary btn-sm">
                            <ArrowLeft size={18} />
                        </Link>
                        <div className="text-center flex-grow-1 mx-3">
                            <h6 className="fw-bold mb-0">{lesson.title}</h6>
                            <small className="text-muted">Lug'at o'yini</small>
                        </div>
                        <div className="d-flex gap-2 align-items-center">
                            <div className="badge bg-success rounded-pill px-3 py-2 d-flex align-items-center gap-1">
                                <Star size={16} />
                                {score}
                            </div>
                            <div className="badge bg-primary rounded-pill px-3 py-2">
                                {currentIndex + 1}/{vocabulary.length}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="progress" style={{ height: 4, borderRadius: 0 }}>
                <div
                    className="progress-bar bg-success"
                    style={{ width: `${((currentIndex) / vocabulary.length) * 100}%` }}
                />
            </div>

            {/* Game Content */}
            <div className="container py-4">
                {/* Question - Show Image */}
                <div className="text-center mb-4">
                    <div
                        className="card border-0 rounded-4 shadow mx-auto"
                        style={{ 
                            maxWidth: 320
                        }}
                    >
                        <div className="card-body p-4">
                            {currentWord.image ? (
                                <img
                                    src={currentWord.image}
                                    alt="?"
                                    className="img-fluid rounded-3 mb-3"
                                    style={{ maxHeight: 200, objectFit: 'contain' }}
                                />
                            ) : (
                                <div
                                    className="bg-light rounded-3 d-flex align-items-center justify-content-center mb-3"
                                    style={{ height: 150 }}
                                >
                                    <ImageIcon size={64} className="text-muted" />
                                </div>
                            )}
                            <h4 className="fw-bold text-primary mb-0">
                                {currentWord.translation}
                            </h4>
                        </div>
                    </div>
                </div>

                {/* Options */}
                <div style={{ maxWidth: 500, margin: '0 auto' }}>
                    <div className="d-flex flex-column gap-3">
                        {options.map((option, index) => {
                            let cardClass = 'border-primary';
                            let bgClass = 'bg-white';
                            
                            if (isCorrect !== null) {
                                if (option.word === vocabulary[currentIndex].word) {
                                    cardClass = 'border-success';
                                    bgClass = 'bg-success bg-opacity-10';
                                } else if (option.word === selectedOption.word && !isCorrect) {
                                    cardClass = 'border-danger';
                                    bgClass = 'bg-danger bg-opacity-10';
                                } else {
                                    cardClass = 'border-secondary';
                                    bgClass = 'bg-light';
                                }
                            }

                            return (
                                <div 
                                    key={index}
                                    className={`card ${cardClass} ${bgClass} rounded-3 shadow-sm`}
                                    style={{ 
                                        border: '2px solid',
                                        transition: 'all 0.2s',
                                        cursor: isCorrect === null ? 'pointer' : 'default'
                                    }}
                                    onClick={() => {
                                        if (isCorrect === null) {
                                            handleListenClick(option, { stopPropagation: () => {} });
                                        }
                                    }}
                                >
                                    <div className="card-body p-3 d-flex align-items-center justify-content-between">
                                        <span className="fw-bold flex-grow-1" style={{ fontSize: '1.1rem' }}>
                                            {option.word}
                                        </span>
                                        <div className="d-flex gap-2">
                                            {/* Listen button */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleListenClick(option, e);
                                                }}
                                                disabled={isCorrect !== null}
                                                className="btn btn-outline-primary rounded-circle d-flex align-items-center justify-content-center"
                                                style={{ 
                                                    width: 45, 
                                                    height: 45,
                                                    fontSize: '1.3rem',
                                                    border: '2px solid'
                                                }}
                                                title="Eshitish"
                                            >
                                                🔊
                                            </button>
                                            {/* Select button */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleOptionClick(option);
                                                }}
                                                disabled={isCorrect !== null}
                                                className="btn btn-primary rounded-circle d-flex align-items-center justify-content-center"
                                                style={{ 
                                                    width: 45, 
                                                    height: 45,
                                                    fontSize: '1.3rem',
                                                    fontWeight: 'bold'
                                                }}
                                                title="Tanlash"
                                            >
                                                ✓
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Feedback */}
                {selectedOption && (
                    <div className="text-center mt-4">
                        <span style={{ fontSize: '48px' }}>
                            {isCorrect ? '✅' : '❌'}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}
