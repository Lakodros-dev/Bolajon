'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

const INSTRUCTIONS = ['walk left', 'walk right', 'jump', 'stop'];
const MAX_MISTAKES = 3;
const TARGET_ACTIONS = 10;

function getRandomInstruction(previousInstruction) {
    const available = INSTRUCTIONS.filter((i) => i !== previousInstruction);
    return available[Math.floor(Math.random() * available.length)];
}

// SVG asosidagi Stickman - tana a'zolari birlashgan
function Stickman({ action, animationType }) {
    const [position, setPosition] = useState(0);
    const [jumpHeight, setJumpHeight] = useState(0);
    const [pose, setPose] = useState('stand');

    useEffect(() => {
        if (action === 'walk left') {
            setPosition((prev) => Math.max(prev - 25, -80));
            setPose('walkLeft');
        } else if (action === 'walk right') {
            setPosition((prev) => Math.min(prev + 25, 80));
            setPose('walkRight');
        } else if (action === 'jump') {
            setJumpHeight(50);
            setPose('jump');
            const timer = setTimeout(() => {
                setJumpHeight(0);
                setPose('stand');
            }, 500);
            return () => clearTimeout(timer);
        } else if (action === 'stop') {
            setPose('stop');
            setTimeout(() => setPosition(0), 200);
        }
    }, [action]);

    // Har bir poza uchun qo'l va oyoq burchaklari
    const getPose = () => {
        switch (pose) {
            case 'walkLeft':
                return { leftArm: 40, rightArm: -30, leftLeg: -20, rightLeg: 20, bodyTilt: -3 };
            case 'walkRight':
                return { leftArm: -30, rightArm: 40, leftLeg: 20, rightLeg: -20, bodyTilt: 3 };
            case 'jump':
                return { leftArm: -50, rightArm: 50, leftLeg: 15, rightLeg: -15, bodyTilt: 0 };
            case 'stop':
                return { leftArm: -90, rightArm: 90, leftLeg: -10, rightLeg: 10, bodyTilt: 0 };
            default:
                return { leftArm: 10, rightArm: -10, leftLeg: 0, rightLeg: 0, bodyTilt: 0 };
        }
    };

    const p = getPose();

    return (
        <div style={{
            position: 'relative',
            width: '100%',
            height: '200px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        }}>
            {/* Ground */}
            <div style={{
                position: 'absolute',
                bottom: '10px',
                width: '60%',
                maxWidth: '300px',
                height: '4px',
                background: 'linear-gradient(to right, transparent, #94a3b8 20%, #94a3b8 80%, transparent)',
                borderRadius: '2px'
            }} />

            {/* Shadow */}
            <div style={{
                position: 'absolute',
                bottom: '6px',
                width: `${40 - jumpHeight * 0.3}px`,
                height: '8px',
                backgroundColor: 'rgba(0,0,0,0.15)',
                borderRadius: '50%',
                transform: `translateX(${position}px)`,
                transition: 'all 0.2s ease-out',
            }} />

            {/* SVG Stickman */}
            <svg
                width="120"
                height="180"
                viewBox="0 0 120 180"
                style={{
                    transform: `translateX(${position}px) translateY(-${jumpHeight}px)`,
                    transition: 'transform 0.2s ease-out',
                }}
            >
                {/* Glow effect for correct */}
                {animationType === 'correct' && (
                    <circle cx="60" cy="90" r="50" fill="#4ade80" opacity="0.3" />
                )}

                {/* Body group with tilt */}
                <g transform={`rotate(${p.bodyTilt}, 60, 70)`}>
                    {/* Body */}
                    <line x1="60" y1="50" x2="60" y2="100" stroke="#3b82f6" strokeWidth="8" strokeLinecap="round" />

                    {/* Left Arm */}
                    <line
                        x1="60" y1="58"
                        x2={60 + Math.sin(p.leftArm * Math.PI / 180) * 35}
                        y2={58 + Math.cos(p.leftArm * Math.PI / 180) * 35}
                        stroke="#3b82f6" strokeWidth="7" strokeLinecap="round"
                    />
                    {/* Left Hand */}
                    <circle
                        cx={60 + Math.sin(p.leftArm * Math.PI / 180) * 38}
                        cy={58 + Math.cos(p.leftArm * Math.PI / 180) * 38}
                        r="6" fill="#fbbf24"
                    />

                    {/* Right Arm */}
                    <line
                        x1="60" y1="58"
                        x2={60 + Math.sin(p.rightArm * Math.PI / 180) * 35}
                        y2={58 + Math.cos(p.rightArm * Math.PI / 180) * 35}
                        stroke="#3b82f6" strokeWidth="7" strokeLinecap="round"
                    />
                    {/* Right Hand */}
                    <circle
                        cx={60 + Math.sin(p.rightArm * Math.PI / 180) * 38}
                        cy={58 + Math.cos(p.rightArm * Math.PI / 180) * 38}
                        r="6" fill="#fbbf24"
                    />

                    {/* Left Leg */}
                    <line
                        x1="60" y1="100"
                        x2={60 + Math.sin(p.leftLeg * Math.PI / 180) * 40}
                        y2={100 + Math.cos(p.leftLeg * Math.PI / 180) * 40}
                        stroke="#1e293b" strokeWidth="8" strokeLinecap="round"
                    />
                    {/* Left Foot */}
                    <ellipse
                        cx={60 + Math.sin(p.leftLeg * Math.PI / 180) * 43}
                        cy={100 + Math.cos(p.leftLeg * Math.PI / 180) * 43}
                        rx="10" ry="5" fill="#dc2626"
                    />

                    {/* Right Leg */}
                    <line
                        x1="60" y1="100"
                        x2={60 + Math.sin(p.rightLeg * Math.PI / 180) * 40}
                        y2={100 + Math.cos(p.rightLeg * Math.PI / 180) * 40}
                        stroke="#1e293b" strokeWidth="8" strokeLinecap="round"
                    />
                    {/* Right Foot */}
                    <ellipse
                        cx={60 + Math.sin(p.rightLeg * Math.PI / 180) * 43}
                        cy={100 + Math.cos(p.rightLeg * Math.PI / 180) * 43}
                        rx="10" ry="5" fill="#dc2626"
                    />
                </g>

                {/* Head (always on top) */}
                <circle cx="60" cy="28" r="22" fill="url(#headGradient)" />
                {/* Eyes */}
                <circle cx="52" cy="25" r="4" fill="#1e293b" />
                <circle cx="68" cy="25" r="4" fill="#1e293b" />
                {/* Smile */}
                <path d="M 50 34 Q 60 42 70 34" stroke="#1e293b" strokeWidth="2.5" fill="none" strokeLinecap="round" />

                {/* Gradient definitions */}
                <defs>
                    <linearGradient id="headGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#fbbf24" />
                        <stop offset="100%" stopColor="#f59e0b" />
                    </linearGradient>
                </defs>
            </svg>

            {/* Action emoji */}
            {pose !== 'stand' && (
                <div style={{
                    position: 'absolute',
                    top: '0',
                    left: '50%',
                    transform: `translateX(calc(-50% + ${position}px))`,
                    fontSize: '28px',
                    animation: 'fadeUp 0.6s ease-out forwards',
                }}>
                    {pose === 'walkLeft' && '👈'}
                    {pose === 'walkRight' && '👉'}
                    {pose === 'jump' && '⬆️'}
                    {pose === 'stop' && '🛑'}
                </div>
            )}
        </div>
    );
}

function MobileControls({ onAction, disabled }) {
    const buttons = [
        { action: 'walk left', icon: '←', label: 'Left', color: '#3b82f6' },
        { action: 'jump', icon: '↑', label: 'Jump', color: '#a855f7' },
        { action: 'walk right', icon: '→', label: 'Right', color: '#3b82f6' },
        { action: 'stop', icon: '■', label: 'Stop', color: '#ef4444' },
    ];

    return (
        <div style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            background: 'linear-gradient(to top, #1e293b, #334155)',
            padding: '12px 16px',
            paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
            zIndex: 1000,
        }}>
            <div style={{
                maxWidth: '400px',
                margin: '0 auto',
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '8px'
            }}>
                {buttons.map((btn) => (
                    <button
                        key={btn.action}
                        onClick={() => onAction(btn.action)}
                        disabled={disabled}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '12px 4px',
                            borderRadius: '10px',
                            fontWeight: '600',
                            color: 'white',
                            backgroundColor: disabled ? '#475569' : btn.color,
                            opacity: disabled ? 0.5 : 1,
                            cursor: disabled ? 'not-allowed' : 'pointer',
                            border: 'none',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                        }}
                    >
                        <span style={{ fontSize: '20px' }}>{btn.icon}</span>
                        <span style={{ fontSize: '10px', marginTop: '2px' }}>{btn.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}

export default function MovementsGame() {
    const [currentInstruction, setCurrentInstruction] = useState('');
    const [mistakes, setMistakes] = useState(0);
    const [correctActions, setCorrectActions] = useState(0);
    const [gameStarted, setGameStarted] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [won, setWon] = useState(false);
    const [timeElapsed, setTimeElapsed] = useState(0);
    const [animationType, setAnimationType] = useState(null);
    const [lastAction, setLastAction] = useState('');
    const [isMobile, setIsMobile] = useState(false);
    const timerRef = useRef(null);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 1024);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        if (gameStarted && !gameOver && !won) {
            timerRef.current = setInterval(() => setTimeElapsed((prev) => prev + 1), 1000);
            return () => clearInterval(timerRef.current);
        }
    }, [gameStarted, gameOver, won]);

    useEffect(() => {
        if (!gameStarted || gameOver || won) return;
        const handleKeyDown = (e) => {
            const keyMap = {
                'ArrowLeft': 'walk left',
                'ArrowRight': 'walk right',
                'ArrowUp': 'jump',
                'ArrowDown': 'stop'
            };
            if (keyMap[e.key]) {
                e.preventDefault();
                handleAction(keyMap[e.key]);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [gameStarted, gameOver, won, currentInstruction]);

    useEffect(() => {
        if (animationType) {
            const timer = setTimeout(() => setAnimationType(null), 400);
            return () => clearTimeout(timer);
        }
    }, [animationType]);

    useEffect(() => {
        if (!gameStarted) startGame();
    }, []);

    const startGame = useCallback(() => {
        setCurrentInstruction(INSTRUCTIONS[Math.floor(Math.random() * INSTRUCTIONS.length)]);
        setMistakes(0);
        setCorrectActions(0);
        setGameStarted(true);
        setGameOver(false);
        setWon(false);
        setTimeElapsed(0);
        setAnimationType(null);
        setLastAction('');
    }, []);

    const handleAction = useCallback((action) => {
        if (!action || gameOver || won) return;
        setLastAction(action);

        if (action === currentInstruction) {
            const newCount = correctActions + 1;
            setCorrectActions(newCount);
            setAnimationType('correct');
            if (newCount >= TARGET_ACTIONS) {
                setWon(true);
                setGameOver(true);
            } else {
                setCurrentInstruction(getRandomInstruction(currentInstruction));
            }
        } else {
            const newMistakes = mistakes + 1;
            setMistakes(newMistakes);
            setAnimationType('wrong');
            if (newMistakes >= MAX_MISTAKES) setGameOver(true);
        }
    }, [currentInstruction, correctActions, mistakes, gameOver, won]);

    const formatTime = (s) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            background: 'linear-gradient(to bottom, #dbeafe, #f3e8ff, #fce7f3)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
        }}>
            <style jsx global>{`
                @keyframes fadeUp {
                    0% { opacity: 1; transform: translateX(calc(-50% + var(--pos, 0px))) translateY(0); }
                    100% { opacity: 0; transform: translateX(calc(-50% + var(--pos, 0px))) translateY(-20px); }
                }
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-8px); }
                    75% { transform: translateX(8px); }
                }
                @keyframes bounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-8px); }
                }
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
                <ArrowLeft size={22} style={{ color: '#374151' }} />
            </Link>

            {/* Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 16px',
                paddingLeft: '60px',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#374151', fontWeight: 'bold' }}>
                    <span>⏱️</span>
                    <span style={{ fontSize: '16px' }}>{formatTime(timeElapsed)}</span>
                </div>
                <h1 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e293b' }}>Learn Verbs</h1>
                <div style={{ display: 'flex', gap: '2px' }}>
                    {Array.from({ length: MAX_MISTAKES }).map((_, i) => (
                        <span key={i} style={{ fontSize: '18px', color: i < mistakes ? '#ef4444' : '#d1d5db' }}>✕</span>
                    ))}
                </div>
            </div>

            {/* Main Game Area */}
            <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '16px',
                paddingBottom: isMobile ? '100px' : '16px',
            }}>
                {/* Instruction */}
                {gameStarted && (
                    <div style={{
                        fontSize: 'clamp(24px, 8vw, 36px)',
                        fontWeight: 'bold',
                        textAlign: 'center',
                        color: animationType === 'correct' ? '#22c55e' : animationType === 'wrong' ? '#ef4444' : '#374151',
                        textTransform: 'capitalize',
                        marginBottom: '24px',
                        animation: animationType === 'wrong' ? 'shake 0.3s' : 'none',
                    }}>
                        {currentInstruction}
                    </div>
                )}

                {/* Stickman */}
                {gameStarted && (
                    <Stickman action={lastAction} animationType={animationType} />
                )}

                {/* Progress */}
                {gameStarted && (
                    <div style={{ width: '100%', maxWidth: '300px', marginTop: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '13px', color: '#374151' }}>
                            <span>Progress</span>
                            <span style={{ fontWeight: 'bold' }}>{correctActions}/{TARGET_ACTIONS}</span>
                        </div>
                        <div style={{ width: '100%', height: '10px', backgroundColor: '#e5e7eb', borderRadius: '5px', overflow: 'hidden' }}>
                            <div style={{
                                height: '100%',
                                backgroundColor: correctActions === TARGET_ACTIONS ? '#22c55e' : '#3b82f6',
                                width: `${(correctActions / TARGET_ACTIONS) * 100}%`,
                                transition: 'width 0.3s'
                            }} />
                        </div>
                    </div>
                )}

                {/* Desktop keyboard hint */}
                {!isMobile && gameStarted && !gameOver && (
                    <div style={{ marginTop: '20px', textAlign: 'center', color: '#6b7280', fontSize: '12px' }}>
                        <p>← Left | → Right | ↑ Jump | ↓ Stop</p>
                    </div>
                )}
            </div>

            {/* Mobile Controls */}
            {isMobile && gameStarted && !gameOver && (
                <MobileControls onAction={handleAction} disabled={gameOver || won} />
            )}

            {/* Game Over Screen */}
            {gameOver && !won && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '16px',
                    zIndex: 200
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '20px',
                        padding: '24px',
                        textAlign: 'center',
                        maxWidth: '340px',
                        width: '100%',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
                    }}>
                        <div style={{ fontSize: '48px', marginBottom: '12px' }}>😢</div>
                        <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#dc2626', marginBottom: '8px' }}>Game Over!</h2>
                        <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '20px' }}>Too many mistakes</p>

                        <div style={{ backgroundColor: '#f1f5f9', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
                                <span style={{ color: '#6b7280' }}>Correct:</span>
                                <span style={{ fontWeight: 'bold' }}>{correctActions}/{TARGET_ACTIONS}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
                                <span style={{ color: '#6b7280' }}>Mistakes:</span>
                                <span style={{ fontWeight: 'bold', color: '#ef4444' }}>{mistakes}/{MAX_MISTAKES}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                                <span style={{ color: '#6b7280' }}>Time:</span>
                                <span style={{ fontWeight: 'bold' }}>{formatTime(timeElapsed)}</span>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '10px' }}>
                            <Link href="/dashboard/games" style={{
                                flex: 1,
                                padding: '12px',
                                borderRadius: '10px',
                                backgroundColor: '#e5e7eb',
                                color: '#374151',
                                fontWeight: '600',
                                textDecoration: 'none',
                                textAlign: 'center',
                                fontSize: '14px'
                            }}>
                                Chiqish
                            </Link>
                            <button onClick={startGame} style={{
                                flex: 1,
                                padding: '12px',
                                borderRadius: '10px',
                                backgroundColor: '#3b82f6',
                                color: 'white',
                                fontWeight: '600',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '14px'
                            }}>
                                Qayta
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Win Screen */}
            {won && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '16px',
                    zIndex: 200
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '20px',
                        padding: '24px',
                        textAlign: 'center',
                        maxWidth: '340px',
                        width: '100%',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
                    }}>
                        <div style={{ fontSize: '48px', marginBottom: '12px', animation: 'bounce 0.5s infinite' }}>🎉</div>
                        <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#22c55e', marginBottom: '8px' }}>You Win!</h2>
                        <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '20px' }}>Great job!</p>

                        <div style={{ backgroundColor: '#dcfce7', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
                                <span style={{ color: '#6b7280' }}>Correct:</span>
                                <span style={{ fontWeight: 'bold', color: '#22c55e' }}>{correctActions}/{TARGET_ACTIONS}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
                                <span style={{ color: '#6b7280' }}>Mistakes:</span>
                                <span style={{ fontWeight: 'bold', color: mistakes === 0 ? '#22c55e' : '#f97316' }}>{mistakes}/{MAX_MISTAKES}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                                <span style={{ color: '#6b7280' }}>Time:</span>
                                <span style={{ fontWeight: 'bold', color: '#2563eb' }}>{formatTime(timeElapsed)}</span>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '10px' }}>
                            <Link href="/dashboard/games" style={{
                                flex: 1,
                                padding: '12px',
                                borderRadius: '10px',
                                backgroundColor: '#e5e7eb',
                                color: '#374151',
                                fontWeight: '600',
                                textDecoration: 'none',
                                textAlign: 'center',
                                fontSize: '14px'
                            }}>
                                Chiqish
                            </Link>
                            <button onClick={startGame} style={{
                                flex: 1,
                                padding: '12px',
                                borderRadius: '10px',
                                backgroundColor: '#22c55e',
                                color: 'white',
                                fontWeight: '600',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '14px'
                            }}>
                                Qayta
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
