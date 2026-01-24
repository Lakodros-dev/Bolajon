'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Volume2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const TARGET_SCORE = 15;
const GAME_AREA_PADDING = 10;
const MAX_TARGET_WAIT = 10000; // 10 sekund
const RETRY_DELAY = 2000; // 2 sekund
const SPEAK_INTERVAL_MS = 3000; // Har 3 sekundda

// Rang-barang sharlar
const BALLOON_COLORS = [
    { bg: '#E53935', shadow: '#B71C1C' }, // Qizil
    { bg: '#1E88E5', shadow: '#0D47A1' }, // Ko'k
    { bg: '#FDD835', shadow: '#F9A825' }, // Sariq
    { bg: '#43A047', shadow: '#1B5E20' }, // Yashil
    { bg: '#F4511E', shadow: '#BF360C' }, // To'q qizil
    { bg: '#8E24AA', shadow: '#4A148C' }, // Binafsha
    { bg: '#00ACC1', shadow: '#006064' }, // Moviy
    { bg: '#FB8C00', shadow: '#E65100' }, // To'q sariq
];

const numberToWord = (num) => {
    if (num === 0) return 'Zero';
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const hundreds = ['', 'One Hundred', 'Two Hundred', 'Three Hundred', 'Four Hundred', 'Five Hundred', 'Six Hundred', 'Seven Hundred', 'Eight Hundred', 'Nine Hundred'];
    
    if (num < 10) return ones[num];
    if (num < 20) return teens[num - 10];
    if (num < 100) {
        const ten = tens[Math.floor(num / 10)];
        const one = ones[num % 10];
        return one ? `${ten} ${one}` : ten;
    }
    if (num < 1000) {
        const hundred = hundreds[Math.floor(num / 100)];
        const remainder = num % 100;
        return remainder ? `${hundred} ${numberToWord(remainder)}` : hundred;
    }
    if (num === 1000) return 'One Thousand';
    return num.toString();
};

export default function CatchTheNumberGame() {
    const params = useParams();
    const searchParams = useSearchParams();
    const { getAuthHeader } = useAuth();
    const lessonId = params.lessonId;
    const studentId = searchParams.get('student');
    
    const [balloons, setBalloons] = useState([]);
    const [score, setScore] = useState(0);
    const [mistakes, setMistakes] = useState(0);
    const [targetNumber, setTargetNumber] = useState(null);
    const [gameActive, setGameActive] = useState(false);
    const [gameStarted, setGameStarted] = useState(false);
    const [showWarning, setShowWarning] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [minNumber, setMinNumber] = useState(1);
    const [maxNumber, setMaxNumber] = useState(10);
    const [lesson, setLesson] = useState(null);
    const [loading, setLoading] = useState(true);

    const MAX_MISTAKES = 5;

    const balloonIdRef = useRef(0);
    const lastNumberRef = useRef(null);
    const gameAreaRef = useRef(null);
    const targetNumberSpawnedRef = useRef(false);
    const lastTargetSpawnTimeRef = useRef(Date.now());
    const isSpeakingRef = useRef(false);
    const recentNumbersRef = useRef([]); // Oxirgi chiqgan raqamlarni saqlash

    useEffect(() => {
        isSpeakingRef.current = isSpeaking;
    }, [isSpeaking]);

    // Fetch lesson and settings
    useEffect(() => {
        const fetchLesson = async () => {
            try {
                const res = await fetch(`/api/lessons/${lessonId}`, {
                    headers: getAuthHeader()
                });
                const data = await res.json();
                if (data.lesson) {
                    setLesson(data.lesson);
                    
                    if (data.lesson.gameSettings?.numberRange) {
                        setMinNumber(data.lesson.gameSettings.numberRange.min || 1);
                        setMaxNumber(data.lesson.gameSettings.numberRange.max || 10);
                    }
                }
            } catch (error) {
                console.error('Error:', error);
            } finally {
                setLoading(false);
            }
        };
        if (lessonId) fetchLesson();
    }, [lessonId, getAuthHeader]);

    // Raqamni talaffuz qilish
    const speakNumber = useCallback((numberWord) => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();

            setTimeout(() => {
                const utterance = new SpeechSynthesisUtterance(numberWord);
                utterance.lang = 'en-US';
                utterance.rate = 0.9;
                utterance.pitch = 1.1;
                utterance.volume = 1;

                utterance.onstart = () => setIsSpeaking(true);
                utterance.onend = () => setIsSpeaking(false);
                utterance.onerror = () => setIsSpeaking(false);

                window.speechSynthesis.speak(utterance);
            }, 100);
        }
    }, []);

    // Target raqam nomini avtomatik aytib turish
    useEffect(() => {
        if (!gameActive || !gameStarted || !targetNumber) return;

        if ('speechSynthesis' in window) {
            window.speechSynthesis.getVoices();
        }

        const initialTimeout = setTimeout(() => {
            speakNumber(targetNumber.word);
        }, 200);

        const intervalId = setInterval(() => {
            if (!isSpeakingRef.current) {
                speakNumber(targetNumber.word);
            }
        }, SPEAK_INTERVAL_MS);

        return () => {
            clearTimeout(initialTimeout);
            clearInterval(intervalId);
        };
    }, [gameActive, gameStarted, targetNumber, speakNumber]);

    const generateRandomNumber = useCallback(() => {
        const range = maxNumber - minNumber + 1;
        let attempts = 0;
        let newNum;
        
        // Agar range kichik bo'lsa (10 dan kam), oddiy random
        if (range <= 10) {
            do {
                newNum = Math.floor(Math.random() * range) + minNumber;
                attempts++;
            } while (recentNumbersRef.current.includes(newNum) && attempts < 20);
        } else {
            // Katta range uchun - oxirgi 5 ta raqamdan boshqa raqam
            do {
                newNum = Math.floor(Math.random() * range) + minNumber;
                attempts++;
            } while (recentNumbersRef.current.includes(newNum) && attempts < 30);
        }
        
        // Oxirgi raqamlar ro'yxatini yangilash (max 5 ta)
        recentNumbersRef.current.push(newNum);
        if (recentNumbersRef.current.length > 5) {
            recentNumbersRef.current.shift();
        }
        
        return newNum;
    }, [minNumber, maxNumber]);

    const selectNextNumber = useCallback(() => {
        let newNum;
        do {
            newNum = generateRandomNumber();
        } while (newNum === lastNumberRef.current);
        lastNumberRef.current = newNum;
        const numObj = { value: newNum, word: numberToWord(newNum) };
        setTargetNumber(numObj);
        targetNumberSpawnedRef.current = false;
        lastTargetSpawnTimeRef.current = Date.now();
    }, [generateRandomNumber]);

    // O'yinni boshlash
    useEffect(() => {
        if (!gameStarted && !loading) {
            if ('speechSynthesis' in window) {
                const voices = window.speechSynthesis.getVoices();
                if (voices.length === 0) {
                    window.speechSynthesis.onvoiceschanged = () => {
                        window.speechSynthesis.getVoices();
                    };
                }
            }
            
            selectNextNumber();
            setGameStarted(true);
            setGameActive(true);
        }
    }, [gameStarted, selectNextNumber, loading]);

    // Spawn config
    const getSpawnConfig = useCallback((currentScore) => {
        let spawnInterval = 2000 - currentScore * 20;
        let balloonCount = 2;
        if (currentScore >= 7) balloonCount = 3;
        if (currentScore >= 12) balloonCount = 4;
        spawnInterval = Math.max(1200, spawnInterval);
        return { spawnInterval, balloonCount };
    }, []);

    // Sharlar bir-biriga tegmaslik uchun pozitsiya tekshirish
    const getValidPosition = useCallback((existingBalloons) => {
        const minDistance = 15;
        let attempts = 0;
        const maxAttempts = 20;
        
        while (attempts < maxAttempts) {
            const randomX = GAME_AREA_PADDING + Math.random() * (100 - 2 * GAME_AREA_PADDING);
            
            const isTooClose = existingBalloons.some(balloon => {
                const distance = Math.abs(balloon.x - randomX);
                return distance < minDistance;
            });
            
            if (!isTooClose) {
                return randomX;
            }
            
            attempts++;
        }
        
        return GAME_AREA_PADDING + Math.random() * (100 - 2 * GAME_AREA_PADDING);
    }, []);

    // Sharlarni yaratish - garantiyalangan target raqam bilan
    useEffect(() => {
        if (!gameActive || !gameStarted || !targetNumber) return;

        const config = getSpawnConfig(score);

        const spawnBalloon = () => {
            const now = Date.now();
            const timeSinceLastTarget = now - lastTargetSpawnTimeRef.current;

            setBalloons((prevBalloons) => {
                const newBalloons = [];
                
                for (let i = 0; i < config.balloonCount; i++) {
                    let balloonNumber;

                    if (!targetNumberSpawnedRef.current && timeSinceLastTarget >= MAX_TARGET_WAIT - config.spawnInterval) {
                        balloonNumber = targetNumber.value;
                        targetNumberSpawnedRef.current = true;
                    } else {
                        balloonNumber = generateRandomNumber();
                        if (balloonNumber === targetNumber.value) {
                            targetNumberSpawnedRef.current = true;
                        }
                    }

                    const randomX = getValidPosition([...prevBalloons, ...newBalloons]);
                    const randomColor = BALLOON_COLORS[Math.floor(Math.random() * BALLOON_COLORS.length)];
                    newBalloons.push({
                        id: balloonIdRef.current++,
                        number: balloonNumber,
                        x: randomX,
                        color: randomColor,
                        createdAt: Date.now(),
                        popped: false,
                    });
                }

                return [...prevBalloons, ...newBalloons];
            });
        };

        spawnBalloon();
        const intervalId = setInterval(spawnBalloon, config.spawnInterval);
        return () => clearInterval(intervalId);
    }, [gameActive, gameStarted, score, targetNumber, getSpawnConfig, getValidPosition, generateRandomNumber]);

    // Garantiyalangan target raqam
    useEffect(() => {
        if (!gameActive || !gameStarted || !targetNumber) return;

        const checkAndSpawnTarget = () => {
            const now = Date.now();
            const timeSinceLastTarget = now - lastTargetSpawnTimeRef.current;

            if (!targetNumberSpawnedRef.current && timeSinceLastTarget >= MAX_TARGET_WAIT) {
                setBalloons((prevBalloons) => {
                    const randomX = getValidPosition(prevBalloons);
                    const randomColor = BALLOON_COLORS[Math.floor(Math.random() * BALLOON_COLORS.length)];
                    const forcedBalloon = {
                        id: balloonIdRef.current++,
                        number: targetNumber.value,
                        x: randomX,
                        color: randomColor,
                        createdAt: Date.now(),
                        popped: false,
                    };
                    targetNumberSpawnedRef.current = true;
                    return [...prevBalloons, forcedBalloon];
                });
            }
        };

        const intervalId = setInterval(checkAndSpawnTarget, 1000);
        return () => clearInterval(intervalId);
    }, [gameActive, gameStarted, targetNumber, getValidPosition]);

    // Eski sharlarni tozalash
    useEffect(() => {
        const cleanupInterval = setInterval(() => {
            const now = Date.now();
            setBalloons((prev) => {
                const filtered = prev.filter((b) => {
                    const age = now - b.createdAt;
                    if (b.popped || age >= 6000) {
                        if (b.number === targetNumber?.value && !b.popped && age >= 6000) {
                            setTimeout(() => {
                                targetNumberSpawnedRef.current = false;
                                lastTargetSpawnTimeRef.current = Date.now();
                            }, RETRY_DELAY);
                        }
                        return false;
                    }
                    return true;
                });
                return filtered;
            });
        }, 500);

        return () => clearInterval(cleanupInterval);
    }, [targetNumber]);

    // Sharni bosish
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

    const handleBalloonClick = useCallback(async (balloonId, balloonNumber) => {
        if (!gameActive) return;

        setBalloons((prev) => prev.map((b) =>
            b.id === balloonId ? { ...b, popped: true } : b
        ));

        setTimeout(() => {
            setBalloons((prev) => prev.filter((b) => b.id !== balloonId));
        }, 200);

        const isCorrect = balloonNumber === targetNumber.value;

        if (isCorrect) {
            const newScore = score + 1;
            setScore(newScore);
            if (newScore >= TARGET_SCORE) {
                if (studentId && lessonId) {
                    await recordGameWin();
                }
                setGameActive(false);
            } else {
                selectNextNumber();
            }
        } else {
            const newMistakes = mistakes + 1;
            setMistakes(newMistakes);
            setShowWarning(true);
            setTimeout(() => setShowWarning(false), 500);
            
            if (newMistakes >= MAX_MISTAKES) {
                setGameActive(false);
            }
        }
    }, [score, gameActive, targetNumber, selectNextNumber, mistakes, studentId, lessonId, getAuthHeader]);

    const handlePlayAgain = () => {
        setScore(0);
        setMistakes(0);
        setGameActive(true);
        setGameStarted(false);
        setBalloons([]);
        setShowWarning(false);
        lastNumberRef.current = null;
        balloonIdRef.current = 0;
        targetNumberSpawnedRef.current = false;
        lastTargetSpawnTimeRef.current = Date.now();
        recentNumbersRef.current = []; // Reset recent numbers
    };

    const handleSpeakNumber = (e) => {
        if (e) e.stopPropagation();
        if (targetNumber) {
            window.speechSynthesis.cancel();
            speakNumber(targetNumber.word);
        }
    };

    if (loading) {
        return (
            <div style={{
                position: 'fixed',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(to bottom, #bfdbfe, #dbeafe, #fef3c7)'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎈</div>
                    <p style={{ color: '#6b7280', fontSize: '18px' }}>Yuklanmoqda...</p>
                </div>
            </div>
        );
    }

    return (
        <div
            ref={gameAreaRef}
            className={showWarning ? 'shake-animation' : ''}
            style={{
                position: 'fixed',
                inset: 0,
                overflow: 'hidden',
                background: 'linear-gradient(to bottom, #bfdbfe, #dbeafe, #fef3c7)',
                touchAction: 'none',
            }}
        >
            <style jsx global>{`
                @keyframes floatUp {
                    0% { bottom: -80px; opacity: 1; }
                    90% { opacity: 1; }
                    100% { bottom: 100vh; opacity: 0; }
                }
                @keyframes pop {
                    0% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.3); opacity: 0.5; }
                    100% { transform: scale(0); opacity: 0; }
                }
                @keyframes shake-anim {
                    0%, 100% { transform: translateX(0); }
                    20% { transform: translateX(-8px); }
                    40% { transform: translateX(8px); }
                    60% { transform: translateX(-5px); }
                    80% { transform: translateX(5px); }
                }
                .shake-animation {
                    animation: shake-anim 0.4s ease-in-out;
                }
                @keyframes speakerPulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.2); }
                }
                .balloon {
                    position: absolute;
                    animation: floatUp 5s linear forwards;
                    cursor: pointer;
                    z-index: 20;
                }
                .balloon.popped {
                    animation: pop 0.2s ease-out forwards !important;
                    pointer-events: none;
                }
                .balloon:hover:not(.popped) { transform: scale(1.15); }
                .balloon:active:not(.popped) { transform: scale(0.9); }
                .speaker-btn { transition: all 0.2s; }
                .speaker-btn:hover { background-color: rgba(0,0,0,0.1) !important; }
                .speaker-btn.speaking { animation: speakerPulse 0.5s infinite; }
            `}</style>

            {/* Back Button */}
            <Link
                href="/dashboard/games"
                style={{
                    position: 'fixed',
                    top: '16px',
                    left: '16px',
                    zIndex: 100,
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    backgroundColor: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    textDecoration: 'none',
                    transition: 'transform 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
                <ArrowLeft size={24} style={{ color: '#374151' }} />
            </Link>

            {/* Score Board */}
            <div style={{
                position: 'fixed',
                top: '16px',
                right: '16px',
                zIndex: 100,
                display: 'flex',
                gap: '8px',
            }}>
                <div style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '12px',
                    padding: '8px 12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    minWidth: '70px',
                    textAlign: 'center'
                }}>
                    <div style={{ fontSize: '10px', color: '#6b7280', fontWeight: '600', marginBottom: '2px' }}>🎯</div>
                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#16a34a', lineHeight: 1 }}>{score}<span style={{ fontSize: '12px', color: '#9ca3af' }}>/15</span></div>
                </div>
                <div style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '12px',
                    padding: '8px 12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    minWidth: '70px',
                    textAlign: 'center'
                }}>
                    <div style={{ fontSize: '10px', color: '#6b7280', fontWeight: '600', marginBottom: '2px' }}>❌</div>
                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#dc2626', lineHeight: 1 }}>{mistakes}<span style={{ fontSize: '12px', color: '#9ca3af' }}>/5</span></div>
                </div>
            </div>

            {/* Target Number Card */}
            {targetNumber && gameActive && (
                <div
                    onClick={handleSpeakNumber}
                    style={{
                        position: 'fixed',
                        top: '90px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        zIndex: 90,
                        width: 'calc(100% - 32px)',
                        maxWidth: '420px',
                        backgroundColor: 'rgba(255, 255, 255, 0.98)',
                        backdropFilter: 'blur(20px)',
                        padding: '20px 24px',
                        borderRadius: '24px',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                        border: '2px solid rgba(255,255,255,0.8)',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateX(-50%) translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.15)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateX(-50%) translateY(0)';
                        e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.12)';
                    }}
                >
                    <button
                        className={`speaker-btn ${isSpeaking ? 'speaking' : ''}`}
                        onClick={(e) => {
                            e.stopPropagation();
                            handleSpeakNumber();
                        }}
                        style={{
                            position: 'absolute',
                            top: '12px',
                            right: '12px',
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            border: 'none',
                            backgroundColor: isSpeaking ? 'rgba(37, 99, 235, 0.1)' : 'rgba(0,0,0,0.05)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s',
                        }}
                    >
                        <Volume2 size={22} style={{ color: isSpeaking ? '#2563eb' : '#6b7280' }} />
                    </button>

                    <div style={{ textAlign: 'center', paddingRight: '40px' }}>
                        <p style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '8px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>Catch the</p>
                        <p style={{
                            fontSize: '42px',
                            fontWeight: 'bold',
                            color: '#1f2937',
                            margin: '0',
                            lineHeight: 1,
                            letterSpacing: '-1px'
                        }}>
                            {targetNumber.word}
                        </p>
                        <p style={{ fontSize: '11px', color: '#d1d5db', marginTop: '8px', fontWeight: '500' }}>
                            🔊 Tap to hear
                        </p>
                    </div>
                </div>
            )}

            {/* Balloons with Numbers */}
            {balloons.map((balloon) => (
                <div
                    key={balloon.id}
                    className={`balloon ${balloon.popped ? 'popped' : ''}`}
                    onClick={() => !balloon.popped && handleBalloonClick(balloon.id, balloon.number)}
                    style={{
                        left: `${balloon.x}%`,
                        transform: 'translateX(-50%)',
                    }}
                >
                    <div style={{
                        width: '75px',
                        height: '90px',
                        borderRadius: '50% 50% 50% 50%',
                        background: `linear-gradient(135deg, ${balloon.color.bg} 0%, ${balloon.color.shadow} 100%)`,
                        position: 'relative',
                        boxShadow: `inset -10px -10px 25px ${balloon.color.shadow}, 0 6px 12px rgba(0,0,0,0.25)`,
                        transition: 'transform 0.1s ease-out',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        <div style={{
                            position: 'absolute',
                            top: '14px',
                            left: '18px',
                            width: '20px',
                            height: '20px',
                            backgroundColor: 'rgba(255,255,255,0.6)',
                            borderRadius: '50%',
                        }} />
                        <div style={{
                            position: 'absolute',
                            top: '30px',
                            left: '14px',
                            width: '10px',
                            height: '10px',
                            backgroundColor: 'rgba(255,255,255,0.4)',
                            borderRadius: '50%',
                        }} />
                        <span style={{
                            fontSize: '32px',
                            fontWeight: 'bold',
                            color: 'white',
                            textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                            zIndex: 1
                        }}>
                            {balloon.number}
                        </span>
                        <div style={{
                            position: 'absolute',
                            bottom: '-8px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: '0',
                            height: '0',
                            borderLeft: '8px solid transparent',
                            borderRight: '8px solid transparent',
                            borderTop: `14px solid ${balloon.color.shadow}`,
                        }} />
                    </div>
                    <div style={{
                        width: '2px',
                        height: '45px',
                        backgroundColor: '#6b7280',
                        margin: '0 auto',
                        background: 'linear-gradient(to bottom, #9ca3af, #6b7280)',
                    }} />
                    {balloon.popped && (
                        <div style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            fontSize: '48px',
                        }}>
                            💥
                        </div>
                    )}
                </div>
            ))}

            {/* Victory Screen */}
            {!gameActive && score >= TARGET_SCORE && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 50
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '20px',
                        padding: '32px 48px',
                        maxWidth: '400px',
                        width: '90%',
                        textAlign: 'center',
                        boxShadow: '0 25px 50px rgba(0,0,0,0.25)'
                    }}>
                        <h1 style={{ fontSize: '40px', fontWeight: 'bold', color: '#16a34a', marginBottom: '8px' }}>Ajoyib!</h1>
                        <div style={{ fontSize: '56px', marginBottom: '16px' }}>🎉</div>
                        <div style={{ backgroundColor: '#dcfce7', borderRadius: '12px', padding: '16px', marginBottom: '24px' }}>
                            <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '4px' }}>To'g'ri javoblar</p>
                            <p style={{ fontSize: '36px', fontWeight: 'bold', color: '#16a34a' }}>15</p>
                        </div>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <Link
                                href="/dashboard/games"
                                style={{
                                    flex: 1,
                                    backgroundColor: '#e5e7eb',
                                    color: '#374151',
                                    fontWeight: 'bold',
                                    padding: '14px 24px',
                                    borderRadius: '12px',
                                    textDecoration: 'none',
                                    textAlign: 'center',
                                    fontSize: '16px'
                                }}
                            >
                                Chiqish
                            </Link>
                            <button
                                onClick={handlePlayAgain}
                                style={{
                                    flex: 1,
                                    background: 'linear-gradient(to right, #3b82f6, #8b5cf6)',
                                    color: 'white',
                                    fontWeight: 'bold',
                                    padding: '14px 24px',
                                    borderRadius: '12px',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: '16px'
                                }}
                            >
                                Qayta o'ynash
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Game Over Screen */}
            {!gameActive && mistakes >= MAX_MISTAKES && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 50
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '20px',
                        padding: '32px 48px',
                        maxWidth: '400px',
                        width: '90%',
                        textAlign: 'center',
                        boxShadow: '0 25px 50px rgba(0,0,0,0.25)'
                    }}>
                        <h1 style={{ fontSize: '40px', fontWeight: 'bold', color: '#dc2626', marginBottom: '8px' }}>O'yin tugadi!</h1>
                        <div style={{ fontSize: '56px', marginBottom: '16px' }}>😢</div>
                        <p style={{ color: '#6b7280', fontSize: '18px', marginBottom: '24px' }}>
                            Juda ko'p xato! Siz <span style={{ fontWeight: 'bold', color: '#16a34a' }}>{score}</span> ta to'g'ri topdingiz
                        </p>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <Link
                                href="/dashboard/games"
                                style={{
                                    flex: 1,
                                    backgroundColor: '#e5e7eb',
                                    color: '#374151',
                                    fontWeight: 'bold',
                                    padding: '14px 24px',
                                    borderRadius: '12px',
                                    textDecoration: 'none',
                                    textAlign: 'center',
                                    fontSize: '16px'
                                }}
                            >
                                Chiqish
                            </Link>
                            <button
                                onClick={handlePlayAgain}
                                style={{
                                    flex: 1,
                                    background: 'linear-gradient(to right, #3b82f6, #8b5cf6)',
                                    color: 'white',
                                    fontWeight: 'bold',
                                    padding: '14px 24px',
                                    borderRadius: '12px',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: '16px'
                                }}
                            >
                                Qayta o'ynash
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
