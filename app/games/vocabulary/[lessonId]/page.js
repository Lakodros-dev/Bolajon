'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { ArrowLeft, Star, RotateCcw, Frown, Image as ImageIcon, CheckCircle, XCircle } from 'lucide-react';

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

    const handleOptionClick = async (option) => {
        if (selectedOption !== null) return;

        setSelectedOption(option);
        const correct = option.word === vocabulary[currentIndex].word;
        setIsCorrect(correct);

        if (correct) {
            setScore(prev => prev + 1);
        }

        // Wait and move to next
        setTimeout(() => {
            if (currentIndex + 1 < vocabulary.length) {
                setCurrentIndex(prev => prev + 1);
                generateOptions(vocabulary, currentIndex + 1);
                setSelectedOption(null);
                setIsCorrect(null);
            } else {
                // Game over
                setGameOver(true);
                // Record win if score is good enough (at least 70%)
                if ((score + (correct ? 1 : 0)) / vocabulary.length >= 0.7) {
                    recordGameWin();
                }
            }
        }, 1000);
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
        const shuffled = [...vocabulary].sort(() => Math.random() - 0.5);
        setVocabulary(shuffled);
        setCurrentIndex(0);
        setScore(0);
        setGameOver(false);
        setSelectedOption(null);
        setIsCorrect(null);
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
            <div className="min-vh-100 d-flex flex-column align-items-center justify-content-center bg-light p-4">
                <div className="card border-0 rounded-4 shadow-lg text-center" style={{ maxWidth: 400 }}>
                    <div className="card-body p-5">
                        <div className="mb-4">
                            <span style={{ fontSize: '80px' }}>
                                {won ? '🎉' : '😊'}
                            </span>
                        </div>
                        <h2 className="fw-bold mb-2">
                            {won ? 'Tabriklaymiz!' : 'Yaxshi urinish!'}
                        </h2>
                        <p className="text-muted mb-4">
                            {vocabulary.length} ta so'zdan {score} tasini to'g'ri topdingiz
                        </p>
                        <div className="mb-4">
                            <div className="progress" style={{ height: 20 }}>
                                <div
                                    className={`progress-bar ${won ? 'bg-success' : 'bg-warning'}`}
                                    style={{ width: `${percentage}%` }}
                                >
                                    {percentage}%
                                </div>
                            </div>
                        </div>
                        {won && (
                            <div className="alert alert-success mb-4 d-flex align-items-center justify-content-center gap-2">
                                <Star size={20} />
                                O'yin yutildi! Progress saqlandi.
                            </div>
                        )}
                        <div className="d-flex gap-2 justify-content-center">
                            <button onClick={restartGame} className="btn btn-outline-primary d-flex align-items-center gap-2">
                                <RotateCcw size={18} />
                                Qayta o'ynash
                            </button>
                            <Link href="/dashboard/games" className="btn btn-primary d-flex align-items-center gap-2">
                                <ArrowLeft size={18} />
                                Orqaga
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
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
                        style={{ maxWidth: 300 }}
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
                            <small className="text-muted">Bu nima?</small>
                        </div>
                    </div>
                </div>

                {/* Options */}
                <div className="row g-3 justify-content-center" style={{ maxWidth: 500, margin: '0 auto' }}>
                    {options.map((option, index) => {
                        let btnClass = 'btn-outline-primary';
                        if (selectedOption) {
                            if (option.word === vocabulary[currentIndex].word) {
                                btnClass = 'btn-success';
                            } else if (option.word === selectedOption.word && !isCorrect) {
                                btnClass = 'btn-danger';
                            } else {
                                btnClass = 'btn-outline-secondary';
                            }
                        }

                        return (
                            <div key={index} className="col-6">
                                <button
                                    onClick={() => handleOptionClick(option)}
                                    disabled={selectedOption !== null}
                                    className={`btn ${btnClass} w-100 py-3 rounded-3 fw-bold`}
                                    style={{ fontSize: '1.1rem' }}
                                >
                                    {option.word}
                                </button>
                            </div>
                        );
                    })}
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
