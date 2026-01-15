'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';

const COLORS = ['red', 'blue', 'yellow', 'green', 'black'];
const TARGET_SCORE = 15;
const GAME_DURATION = 180;
const GAME_AREA_PADDING = 10;
const MAX_TARGET_WAIT = 10000; // 10 sekund - maksimal kutish vaqti
const RETRY_DELAY = 2000; // 2 sekund - qayta urinish orasidagi pauza
const SPEAK_INTERVAL_MS = 6000; // Har 6 sekundda rang nomi avtomatik aytiladi

const colorStyles = {
    red: { bg: '#E53935', shadow: '#B71C1C' },
    blue: { bg: '#1E88E5', shadow: '#0D47A1' },
    yellow: { bg: '#FDD835', shadow: '#F9A825' },
    green: { bg: '#43A047', shadow: '#1B5E20' },
    black: { bg: '#212121', shadow: '#000000' },
};

const colorNames = {
    red: 'RED',
    blue: 'BLUE',
    yellow: 'YELLOW',
    green: 'GREEN',
    black: 'BLACK',
};

export default function PopTheBalloonGame() {
    const [balloons, setBalloons] = useState([]);
    const [score, setScore] = useState(0);
    const [targetColor, setTargetColor] = useState('');
    const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
    const [gameActive, setGameActive] = useState(false);
    const [gameStarted, setGameStarted] = useState(false);
    const [showWarning, setShowWarning] = useState(false);
    const [timeTaken, setTimeTaken] = useState(0);
    const [isSpeaking, setIsSpeaking] = useState(false);

    const balloonIdRef = useRef(0);
    const lastColorRef = useRef('');
    const gameAreaRef = useRef(null);
    const targetColorSpawnedRef = useRef(false);
    const lastTargetSpawnTimeRef = useRef(Date.now());
    const isSpeakingRef = useRef(false);

    useEffect(() => {
        isSpeakingRef.current = isSpeaking;
    }, [isSpeaking]);

    // Rangni talaffuz qilish - optimizatsiya qilingan
    const speakColor = useCallback((color) => {
        if ('speechSynthesis' in window) {
            // Avvalgi talaffuzni to'xtatish
            window.speechSynthesis.cancel();

            // Kichik timeout - telefonda speech synthesis'ni ishga tushirish uchun
            setTimeout(() => {
                const utterance = new SpeechSynthesisUtterance(color);
                utterance.lang = 'en-US';
                utterance.rate = 0.9; // Biroz tezroq
                utterance.pitch = 1.1;
                utterance.volume = 1;

                utterance.onstart = () => setIsSpeaking(true);
                utterance.onend = () => setIsSpeaking(false);
                utterance.onerror = () => setIsSpeaking(false);

                window.speechSynthesis.speak(utterance);
            }, 100); // 100ms timeout - telefonda ishlashi uchun
        }
    }, []);

    // Target rang nomini avtomatik aytib turish
    useEffect(() => {
        if (!gameActive || !gameStarted || !targetColor) return;

        // Speech synthesis'ni oldindan tayyorlash (telefonda tezroq ishlashi uchun)
        if ('speechSynthesis' in window) {
            window.speechSynthesis.getVoices(); // Voice'larni oldindan yuklash
        }

        // Darhol aytib yuborish (kichik timeout bilan)
        const initialTimeout = setTimeout(() => {
            speakColor(colorNames[targetColor]);
        }, 200);

        // Har 6 sekundda takrorlash
        const intervalId = setInterval(() => {
            if (!isSpeakingRef.current) {
                speakColor(colorNames[targetColor]);
            }
        }, SPEAK_INTERVAL_MS);

        return () => {
            clearTimeout(initialTimeout);
            clearInterval(intervalId);
        };
    }, [gameActive, gameStarted, targetColor, speakColor]);

    const selectNextColor = useCallback(() => {
        let newColor;
        do {
            newColor = COLORS[Math.floor(Math.random() * COLORS.length)];
        } while (newColor === lastColorRef.current);
        lastColorRef.current = newColor;
        setTargetColor(newColor);
        targetColorSpawnedRef.current = false;
        lastTargetSpawnTimeRef.current = Date.now();
    }, []);

    // O'yinni boshlash
    useEffect(() => {
        if (!gameStarted) {
            // Speech synthesis'ni oldindan tayyorlash
            if ('speechSynthesis' in window) {
                // Voice'larni oldindan yuklash (telefonda tezroq ishlashi uchun)
                const voices = window.speechSynthesis.getVoices();
                if (voices.length === 0) {
                    // Agar voice'lar hali yuklanmagan bo'lsa, event listener qo'shamiz
                    window.speechSynthesis.onvoiceschanged = () => {
                        window.speechSynthesis.getVoices();
                    };
                }
            }
            
            selectNextColor();
            setGameStarted(true);
            setGameActive(true);
        }
    }, [gameStarted, selectNextColor]);

    // Timer
    useEffect(() => {
        if (!gameActive || !gameStarted) return;
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    setGameActive(false);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [gameActive, gameStarted]);

    // Spawn config
    const getSpawnConfig = useCallback((currentScore) => {
        let spawnInterval = 1800 - currentScore * 30;
        let balloonCount = 1;
        if (currentScore >= 5) balloonCount = 2;
        if (currentScore >= 10) balloonCount = 3;
        spawnInterval = Math.max(1000, spawnInterval);
        return { spawnInterval, balloonCount };
    }, []);

    // Sharlarni yaratish - garantiyalangan target rang bilan
    useEffect(() => {
        if (!gameActive || !gameStarted || !targetColor) return;

        const config = getSpawnConfig(score);

        const spawnBalloon = () => {
            const now = Date.now();
            const timeSinceLastTarget = now - lastTargetSpawnTimeRef.current;

            const newBalloons = Array.from({ length: config.balloonCount }).map((_, index) => {
                let balloonColor;

                // Agar 10 sekunddan ko'p vaqt o'tgan bo'lsa va target rang chiqmagan bo'lsa
                // yoki bu birinchi shar bo'lsa va target rang hali chiqmagan bo'lsa
                if (!targetColorSpawnedRef.current && timeSinceLastTarget >= MAX_TARGET_WAIT - config.spawnInterval) {
                    balloonColor = targetColor;
                    targetColorSpawnedRef.current = true;
                } else {
                    // Tasodifiy rang, lekin target rang ham chiqishi mumkin
                    balloonColor = COLORS[Math.floor(Math.random() * COLORS.length)];
                    if (balloonColor === targetColor) {
                        targetColorSpawnedRef.current = true;
                    }
                }

                const randomX = GAME_AREA_PADDING + Math.random() * (100 - 2 * GAME_AREA_PADDING);
                return {
                    id: balloonIdRef.current++,
                    color: balloonColor,
                    x: randomX,
                    createdAt: Date.now(),
                    popped: false,
                };
            });

            setBalloons((prev) => [...prev, ...newBalloons]);
        };

        spawnBalloon();
        const intervalId = setInterval(spawnBalloon, config.spawnInterval);
        return () => clearInterval(intervalId);
    }, [gameActive, gameStarted, score, targetColor, getSpawnConfig]);

    // Garantiyalangan target rang - agar 10 sekund ichida chiqmasa, majburiy chiqarish
    useEffect(() => {
        if (!gameActive || !gameStarted || !targetColor) return;

        const checkAndSpawnTarget = () => {
            const now = Date.now();
            const timeSinceLastTarget = now - lastTargetSpawnTimeRef.current;

            // Agar 10 sekund o'tgan bo'lsa va target rang hali chiqmagan bo'lsa
            if (!targetColorSpawnedRef.current && timeSinceLastTarget >= MAX_TARGET_WAIT) {
                // Majburiy target rangdagi shar chiqarish
                const randomX = GAME_AREA_PADDING + Math.random() * (100 - 2 * GAME_AREA_PADDING);
                const forcedBalloon = {
                    id: balloonIdRef.current++,
                    color: targetColor,
                    x: randomX,
                    createdAt: Date.now(),
                    popped: false,
                };
                setBalloons((prev) => [...prev, forcedBalloon]);
                targetColorSpawnedRef.current = true;
            }
        };

        const intervalId = setInterval(checkAndSpawnTarget, 1000);
        return () => clearInterval(intervalId);
    }, [gameActive, gameStarted, targetColor]);

    // Eski sharlarni tozalash va target rang o'tib ketganini tekshirish
    useEffect(() => {
        const cleanupInterval = setInterval(() => {
            const now = Date.now();
            setBalloons((prev) => {
                const filtered = prev.filter((b) => {
                    const age = now - b.createdAt;
                    // 6 sekund o'tgan yoki yorilgan sharlarni o'chirish
                    if (b.popped || age >= 6000) {
                        // Agar target rangdagi shar o'tib ketgan bo'lsa
                        if (b.color === targetColor && !b.popped && age >= 6000) {
                            // 2 sekund kutib, qayta target rang chiqarish uchun flag'ni reset qilish
                            setTimeout(() => {
                                targetColorSpawnedRef.current = false;
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
    }, [targetColor]);

    // Sharni bosish
    const handleBalloonClick = useCallback((balloonId, balloonColor) => {
        if (!gameActive) return;

        setBalloons((prev) => prev.map((b) =>
            b.id === balloonId ? { ...b, popped: true } : b
        ));

        setTimeout(() => {
            setBalloons((prev) => prev.filter((b) => b.id !== balloonId));
        }, 200);

        const isCorrect = balloonColor === targetColor;

        if (isCorrect) {
            const newScore = score + 1;
            setScore(newScore);
            if (newScore >= TARGET_SCORE) {
                setGameActive(false);
                setTimeTaken(GAME_DURATION - timeLeft);
            } else {
                selectNextColor();
            }
        } else {
            setShowWarning(true);
            setTimeout(() => setShowWarning(false), 500);
        }
    }, [score, gameActive, timeLeft, targetColor, selectNextColor]);

    const handlePlayAgain = () => {
        setScore(0);
        setTimeLeft(GAME_DURATION);
        setGameActive(true);
        setGameStarted(false);
        setBalloons([]);
        setShowWarning(false);
        lastColorRef.current = '';
        balloonIdRef.current = 0;
        targetColorSpawnedRef.current = false;
        lastTargetSpawnTimeRef.current = Date.now();
    };

    const handleSpeakColor = (e) => {
        if (e) e.stopPropagation();
        if (targetColor) {
            // Darhol aytish uchun
            window.speechSynthesis.cancel();
            speakColor(colorNames[targetColor]);
        }
    };

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;

    const timeTakenMinutes = Math.floor(timeTaken / 60);
    const timeTakenSeconds = timeTaken % 60;
    const timeTakenString = `${timeTakenMinutes}:${timeTakenSeconds.toString().padStart(2, '0')}`;

    return (
        <div
            ref={gameAreaRef}
            className={showWarning ? 'shake-animation' : ''}
            style={{
                position: 'fixed',
                inset: 0,
                overflow: 'hidden',
                background: 'linear-gradient(to bottom, #bfdbfe, #dbeafe, #fef3c7)',
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
                @keyframes pulse {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.8; transform: scale(1.05); }
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
                    top: '12px',
                    left: '12px',
                    zIndex: 100,
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    backgroundColor: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    textDecoration: 'none',
                }}
            >
                <span className="material-symbols-outlined" style={{ fontSize: '22px', color: '#374151' }}>arrow_back</span>
            </Link>

            {/* Score Board */}
            <div style={{
                position: 'absolute',
                top: '16px',
                left: 0,
                right: 0,
                zIndex: 30,
                padding: '0 16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
            }}>
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    padding: '10px 20px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    marginLeft: '60px'
                }}>
                    <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>⏱️ Time</div>
                    <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#2563eb' }}>{timeString}</div>
                </div>
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    padding: '10px 20px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}>
                    <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>🎯 Score</div>
                    <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#16a34a' }}>{score}/15</div>
                </div>
            </div>

            {/* Target Color - with speaker button */}
            {targetColor && gameActive && (
                <div
                    onClick={handleSpeakColor}
                    style={{
                        position: 'absolute',
                        top: '100px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        zIndex: 30,
                        textAlign: 'center',
                        backgroundColor: 'rgba(255,255,255,0.95)',
                        padding: '20px 40px',
                        borderRadius: '20px',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                        border: '4px solid #9ca3af',
                        cursor: 'pointer',
                    }}
                >
                    {/* Speaker icon */}
                    <button
                        className={`speaker-btn ${isSpeaking ? 'speaking' : ''}`}
                        onClick={(e) => {
                            e.stopPropagation();
                            handleSpeakColor();
                        }}
                        style={{
                            position: 'absolute',
                            top: '10px',
                            right: '10px',
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            border: 'none',
                            backgroundColor: 'rgba(0,0,0,0.05)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: '20px', color: isSpeaking ? '#2563eb' : '#6b7280' }}>
                            {isSpeaking ? 'volume_up' : 'volume_up'}
                        </span>
                    </button>

                    <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '1px' }}>Pop the</p>
                    <p style={{
                        fontSize: '48px',
                        fontWeight: 'bold',
                        color: '#6b7280', // Kulrang rang - o'sha rangda emas
                        animation: 'pulse 1.5s infinite',
                        margin: '4px 0',
                        lineHeight: 1,
                    }}>
                        {colorNames[targetColor]}
                    </p>
                    <p style={{ fontSize: '11px', color: '#9ca3af', marginTop: '8px' }}>
                        🔊 Bosib eshiting
                    </p>
                </div>
            )}

            {/* Balloons */}
            {balloons.map((balloon) => (
                <div
                    key={balloon.id}
                    className={`balloon ${balloon.popped ? 'popped' : ''}`}
                    onClick={() => !balloon.popped && handleBalloonClick(balloon.id, balloon.color)}
                    style={{
                        left: `${balloon.x}%`,
                        transform: 'translateX(-50%)',
                    }}
                >
                    <div style={{
                        width: '65px',
                        height: '78px',
                        borderRadius: '50% 50% 50% 50%',
                        backgroundColor: colorStyles[balloon.color]?.bg,
                        position: 'relative',
                        boxShadow: `inset -10px -10px 25px ${colorStyles[balloon.color]?.shadow}, 0 6px 12px rgba(0,0,0,0.25)`,
                        transition: 'transform 0.1s ease-out',
                    }}>
                        <div style={{
                            position: 'absolute',
                            top: '14px',
                            left: '16px',
                            width: '18px',
                            height: '18px',
                            backgroundColor: 'rgba(255,255,255,0.6)',
                            borderRadius: '50%',
                        }} />
                        <div style={{
                            position: 'absolute',
                            top: '28px',
                            left: '12px',
                            width: '8px',
                            height: '8px',
                            backgroundColor: 'rgba(255,255,255,0.4)',
                            borderRadius: '50%',
                        }} />
                        <div style={{
                            position: 'absolute',
                            bottom: '-8px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: '0',
                            height: '0',
                            borderLeft: '7px solid transparent',
                            borderRight: '7px solid transparent',
                            borderTop: `12px solid ${colorStyles[balloon.color]?.shadow}`,
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
                        <h1 style={{ fontSize: '40px', fontWeight: 'bold', color: '#16a34a', marginBottom: '8px' }}>You Win!</h1>
                        <div style={{ fontSize: '56px', marginBottom: '16px' }}>🎉</div>
                        <div style={{ backgroundColor: '#dcfce7', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
                            <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '4px' }}>Total Correct Balloons</p>
                            <p style={{ fontSize: '36px', fontWeight: 'bold', color: '#16a34a' }}>15</p>
                        </div>
                        <div style={{ backgroundColor: '#dbeafe', borderRadius: '12px', padding: '16px', marginBottom: '24px' }}>
                            <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '4px' }}>Time Taken</p>
                            <p style={{ fontSize: '36px', fontWeight: 'bold', color: '#2563eb' }}>{timeTakenString}</p>
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
            {!gameActive && score < TARGET_SCORE && gameStarted && (
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
                        <h1 style={{ fontSize: '40px', fontWeight: 'bold', color: '#dc2626', marginBottom: '8px' }}>Game Over!</h1>
                        <div style={{ fontSize: '56px', marginBottom: '16px' }}>⏰</div>
                        <p style={{ color: '#6b7280', fontSize: '18px', marginBottom: '24px' }}>
                            You popped <span style={{ fontWeight: 'bold', color: '#2563eb' }}>{score}/15</span> balloons
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
