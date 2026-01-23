'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { RotateCcw, ArrowLeft, Star, CheckCircle, XCircle } from 'lucide-react';

export default function VocabularyTestPage() {
    const router = useRouter();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [showResult, setShowResult] = useState(false);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [isCorrect, setIsCorrect] = useState(null);

    // Test vocabulary
    const vocabulary = [
        { word: 'Apple', translation: 'Olma', image: '🍎' },
        { word: 'Book', translation: 'Kitob', image: '📚' },
        { word: 'Cat', translation: 'Mushuk', image: '🐱' },
        { word: 'Dog', translation: 'It', image: '🐕' },
        { word: 'House', translation: 'Uy', image: '🏠' },
        { word: 'Car', translation: 'Mashina', image: '🚗' },
        { word: 'Tree', translation: "Daraxt", image: '🌳' },
        { word: 'Sun', translation: 'Quyosh', image: '☀️' },
    ];

    const currentWord = vocabulary[currentIndex];

    // Generate options
    const getOptions = () => {
        const options = [currentWord.translation];
        const otherWords = vocabulary.filter((_, i) => i !== currentIndex);
        
        while (options.length < 4 && otherWords.length > 0) {
            const randomIndex = Math.floor(Math.random() * otherWords.length);
            const option = otherWords[randomIndex].translation;
            if (!options.includes(option)) {
                options.push(option);
            }
            otherWords.splice(randomIndex, 1);
        }
        
        return options.sort(() => Math.random() - 0.5);
    };

    const [options, setOptions] = useState(getOptions());

    const handleAnswer = (answer) => {
        setSelectedAnswer(answer);
        const correct = answer === currentWord.translation;
        setIsCorrect(correct);
        
        if (correct) {
            setScore(score + 1);
        }

        setTimeout(() => {
            if (currentIndex < vocabulary.length - 1) {
                setCurrentIndex(currentIndex + 1);
                setSelectedAnswer(null);
                setIsCorrect(null);
                setOptions(getOptions());
            } else {
                setShowResult(true);
            }
        }, 1500);
    };

    const restartGame = () => {
        setCurrentIndex(0);
        setScore(0);
        setShowResult(false);
        setSelectedAnswer(null);
        setIsCorrect(null);
        setOptions(getOptions());
    };

    if (showResult) {
        return (
            <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: '#f5f5f7' }}>
                <div className="text-center">
                    <div className="mb-4" style={{ fontSize: '80px' }}>
                        {score >= vocabulary.length * 0.8 ? '🎉' : score >= vocabulary.length * 0.5 ? '👍' : '💪'}
                    </div>
                    <h1 className="display-4 fw-bold mb-3">O'yin tugadi!</h1>
                    <p className="h3 mb-4">
                        Natija: <span className="text-primary">{score}</span> / {vocabulary.length}
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
                    <div className="text-center">
                        <h5 className="fw-bold mb-0">Lug'at o'yini</h5>
                        <small className="text-muted">{currentIndex + 1} / {vocabulary.length}</small>
                    </div>
                    <div className="badge bg-primary rounded-pill px-3 py-2 d-flex align-items-center gap-1">
                        <Star size={16} />
                        {score}
                    </div>
                </div>
            </div>

            {/* Game Content */}
            <div className="container py-5">
                <div className="row justify-content-center">
                    <div className="col-lg-6">
                        {/* Word Card */}
                        <div className="card border-0 rounded-4 shadow-lg mb-4">
                            <div className="card-body p-5 text-center">
                                <div className="mb-4" style={{ fontSize: '100px' }}>
                                    {currentWord.image}
                                </div>
                                <h2 className="display-5 fw-bold mb-0">{currentWord.word}</h2>
                            </div>
                        </div>

                        {/* Options */}
                        <div className="row g-3">
                            {options.map((option, index) => (
                                <div key={index} className="col-6">
                                    <button
                                        onClick={() => handleAnswer(option)}
                                        disabled={selectedAnswer !== null}
                                        className={`btn w-100 rounded-4 py-4 ${
                                            selectedAnswer === option
                                                ? isCorrect
                                                    ? 'btn-success'
                                                    : 'btn-danger'
                                                : selectedAnswer !== null && option === currentWord.translation
                                                ? 'btn-success'
                                                : 'btn-outline-primary'
                                        }`}
                                        style={{ fontSize: '18px', fontWeight: '600' }}
                                    >
                                        {option}
                                        {selectedAnswer === option && (
                                            isCorrect ? <CheckCircle size={24} className="ms-2" style={{ verticalAlign: 'middle' }} /> : <XCircle size={24} className="ms-2" style={{ verticalAlign: 'middle' }} />
                                        )}
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
