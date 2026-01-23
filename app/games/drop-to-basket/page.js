'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

// Number words in English (1-100)
const NUMBER_WORDS = {
    1: 'one', 2: 'two', 3: 'three', 4: 'four', 5: 'five',
    6: 'six', 7: 'seven', 8: 'eight', 9: 'nine', 10: 'ten',
    11: 'eleven', 12: 'twelve', 13: 'thirteen', 14: 'fourteen', 15: 'fifteen',
    16: 'sixteen', 17: 'seventeen', 18: 'eighteen', 19: 'nineteen', 20: 'twenty',
    21: 'twenty-one', 22: 'twenty-two', 23: 'twenty-three', 24: 'twenty-four', 25: 'twenty-five',
    26: 'twenty-six', 27: 'twenty-seven', 28: 'twenty-eight', 29: 'twenty-nine', 30: 'thirty',
    31: 'thirty-one', 32: 'thirty-two', 33: 'thirty-three', 34: 'thirty-four', 35: 'thirty-five',
    36: 'thirty-six', 37: 'thirty-seven', 38: 'thirty-eight', 39: 'thirty-nine', 40: 'forty',
    41: 'forty-one', 42: 'forty-two', 43: 'forty-three', 44: 'forty-four', 45: 'forty-five',
    46: 'forty-six', 47: 'forty-seven', 48: 'forty-eight', 49: 'forty-nine', 50: 'fifty',
    51: 'fifty-one', 52: 'fifty-two', 53: 'fifty-three', 54: 'fifty-four', 55: 'fifty-five',
    56: 'fifty-six', 57: 'fifty-seven', 58: 'fifty-eight', 59: 'fifty-nine', 60: 'sixty',
    61: 'sixty-one', 62: 'sixty-two', 63: 'sixty-three', 64: 'sixty-four', 65: 'sixty-five',
    66: 'sixty-six', 67: 'sixty-seven', 68: 'sixty-eight', 69: 'sixty-nine', 70: 'seventy',
    71: 'seventy-one', 72: 'seventy-two', 73: 'seventy-three', 74: 'seventy-four', 75: 'seventy-five',
    76: 'seventy-six', 77: 'seventy-seven', 78: 'seventy-eight', 79: 'seventy-nine', 80: 'eighty',
    81: 'eighty-one', 82: 'eighty-two', 83: 'eighty-three', 84: 'eighty-four', 85: 'eighty-five',
    86: 'eighty-six', 87: 'eighty-seven', 88: 'eighty-eight', 89: 'eighty-nine', 90: 'ninety',
    91: 'ninety-one', 92: 'ninety-two', 93: 'ninety-three', 94: 'ninety-four', 95: 'ninety-five',
    96: 'ninety-six', 97: 'ninety-seven', 98: 'ninety-eight', 99: 'ninety-nine', 100: 'one hundred'
};

// 50 xil buyum
const ITEM_TYPES = [
    // Mevalar
    { name: 'apple', emoji: '🍎' },
    { name: 'banana', emoji: '🍌' },
    { name: 'orange', emoji: '🍊' },
    { name: 'grape', emoji: '🍇' },
    { name: 'strawberry', emoji: '🍓' },
    { name: 'watermelon', emoji: '🍉' },
    { name: 'peach', emoji: '🍑' },
    { name: 'cherry', emoji: '🍒' },
    { name: 'lemon', emoji: '🍋' },
    { name: 'pineapple', emoji: '🍍' },
    // Sabzavotlar
    { name: 'carrot', emoji: '🥕' },
    { name: 'corn', emoji: '🌽' },
    { name: 'tomato', emoji: '🍅' },
    { name: 'broccoli', emoji: '🥦' },
    { name: 'cucumber', emoji: '🥒' },
    { name: 'potato', emoji: '🥔' },
    { name: 'eggplant', emoji: '🍆' },
    { name: 'pepper', emoji: '🌶️' },
    { name: 'mushroom', emoji: '🍄' },
    { name: 'onion', emoji: '🧅' },
    // Hayvonlar
    { name: 'dog', emoji: '🐕' },
    { name: 'cat', emoji: '🐈' },
    { name: 'rabbit', emoji: '🐇' },
    { name: 'bear', emoji: '🐻' },
    { name: 'pig', emoji: '🐷' },
    { name: 'cow', emoji: '🐄' },
    { name: 'chicken', emoji: '🐔' },
    { name: 'fish', emoji: '🐟' },
    { name: 'butterfly', emoji: '🦋' },
    { name: 'bee', emoji: '🐝' },
    // Narsalar
    { name: 'ball', emoji: '⚽' },
    { name: 'car', emoji: '🚗' },
    { name: 'book', emoji: '📚' },
    { name: 'star', emoji: '⭐' },
    { name: 'heart', emoji: '❤️' },
    { name: 'flower', emoji: '🌸' },
    { name: 'tree', emoji: '🌳' },
    { name: 'sun', emoji: '☀️' },
    { name: 'moon', emoji: '🌙' },
    { name: 'cloud', emoji: '☁️' },
    // O'yinchoqlar
    { name: 'toy', emoji: '🧸' },
    { name: 'robot', emoji: '🤖' },
    { name: 'rocket', emoji: '🚀' },
    { name: 'plane', emoji: '✈️' },
    { name: 'train', emoji: '🚂' },
    { name: 'boat', emoji: '⛵' },
    { name: 'balloon', emoji: '🎈' },
    { name: 'gift', emoji: '🎁' },
    { name: 'candy', emoji: '🍬' },
    { name: 'cookie', emoji: '🍪' },
];

const TOTAL_ITEMS = 30;
const MAX_MISTAKES = 3;

function getRandomItem(excludeType = null) {
    let item;
    do {
        item = ITEM_TYPES[Math.floor(Math.random() * ITEM_TYPES.length)];
    } while (item.name === excludeType);
    return item;
}

function generateItems(requiredType, requiredRemaining) {
    const items = [];
    const requiredItem = ITEM_TYPES.find(i => i.name === requiredType);
    const itemCounts = {}; // Har bir buyum turidan nechta borligini kuzatish

    // Kerakli narsalardan 1-3 ta qo'shish (qolgan soniga qarab)
    const requiredCount = Math.min(Math.floor(Math.random() * 3) + 1, requiredRemaining);
    itemCounts[requiredType] = requiredCount;

    for (let i = 0; i < requiredCount; i++) {
        items.push({
            id: `item-${Date.now()}-${i}`,
            type: requiredItem.name,
            emoji: requiredItem.emoji,
            x: 5 + Math.random() * 90,
            y: 12 + Math.random() * 48,
        });
    }

    // Qolgan joylarni boshqa narsalar bilan to'ldirish (har biridan max 3 ta)
    let itemIndex = requiredCount;
    while (items.length < TOTAL_ITEMS) {
        const randomItem = getRandomItem(requiredType);
        const currentCount = itemCounts[randomItem.name] || 0;

        // Har bir turdan max 3 ta
        if (currentCount < 3) {
            itemCounts[randomItem.name] = currentCount + 1;
            items.push({
                id: `item-${Date.now()}-${itemIndex}`,
                type: randomItem.name,
                emoji: randomItem.emoji,
                x: 5 + Math.random() * 90,
                y: 12 + Math.random() * 48,
            });
            itemIndex++;
        }
    }

    return items.sort(() => Math.random() - 0.5);
}

function shufflePositions(items) {
    return items.map(item => ({
        ...item,
        x: 5 + Math.random() * 90,
        y: 12 + Math.random() * 48,
    }));
}

function formatTime(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function getEmoji(type) {
    const item = ITEM_TYPES.find(i => i.name === type);
    return item ? item.emoji : '🎁';
}

function getNumberWord(num) {
    return NUMBER_WORDS[num] || num.toString();
}

export default function DropToBasketGame() {
    const [gameScreen, setGameScreen] = useState('start'); // 'start', 'playing'
    const [maxNumber, setMaxNumber] = useState(5);
    const [items, setItems] = useState([]);
    const [requiredType, setRequiredType] = useState('');
    const [requiredQuantity, setRequiredQuantity] = useState(0);
    const [collected, setCollected] = useState(0);
    const [mistakes, setMistakes] = useState(0);
    const [gameStatus, setGameStatus] = useState('playing');
    const [gameStartTime, setGameStartTime] = useState(Date.now());
    const [gameTime, setGameTime] = useState(0);
    const [feedbackAnimation, setFeedbackAnimation] = useState({ type: 'success', show: false });

    // Drag state
    const [draggedItem, setDraggedItem] = useState(null);
    const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const containerRef = useRef(null);
    const basketRef = useRef(null);

    useEffect(() => {
        if (gameStatus !== 'playing' || gameScreen !== 'playing') return;
        const timer = setInterval(() => {
            setGameTime(Date.now() - gameStartTime);
        }, 100);
        return () => clearInterval(timer);
    }, [gameStatus, gameStartTime, gameScreen]);

    // "Tugatish" tugmasi bosilganda tekshirish
    function handleFinish() {
        if (collected === requiredQuantity) {
            setGameStatus('won');
        } else {
            setGameStatus('lost');
        }
    }

    useEffect(() => {
        if (mistakes >= MAX_MISTAKES) {
            setGameStatus('lost');
        }
    }, [mistakes]);

    function startGame() {
        const selectedItem = getRandomItem();
        // Random quantity between 1 and maxNumber
        const quantity = Math.floor(Math.random() * maxNumber) + 1;
        // Generate items with 1-3 required items initially
        const newItems = generateItems(selectedItem.name, quantity);

        setRequiredType(selectedItem.name);
        setRequiredQuantity(quantity);
        setItems(newItems);
        setCollected(0);
        setMistakes(0);
        setGameStatus('playing');
        setGameStartTime(Date.now());
        setGameTime(0);
        setDraggedItem(null);
        setIsDragging(false);
        setGameScreen('playing');
    }

    function initializeGame() {
        setGameScreen('start');
    }

    // Touch/Mouse handlers
    const handleDragStart = useCallback((e, item) => {
        e.preventDefault();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;

        setDraggedItem(item);
        setDragPosition({ x: clientX, y: clientY });
        setIsDragging(true);
    }, []);

    const handleDragMove = useCallback((e) => {
        if (!isDragging || !draggedItem) return;
        e.preventDefault();

        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;

        setDragPosition({ x: clientX, y: clientY });
    }, [isDragging, draggedItem]);

    const handleDragEnd = useCallback((e) => {
        if (!isDragging || !draggedItem || gameStatus !== 'playing') {
            setIsDragging(false);
            setDraggedItem(null);
            return;
        }

        // Basket pozitsiyasini tekshirish
        if (basketRef.current && containerRef.current) {
            const basketRect = basketRef.current.getBoundingClientRect();
            const dropX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
            const dropY = e.changedTouches ? e.changedTouches[0].clientY : e.clientY;

            // Savatga tushganmi?
            const isInBasket =
                dropX >= basketRect.left - 30 &&
                dropX <= basketRect.right + 30 &&
                dropY >= basketRect.top - 30 &&
                dropY <= basketRect.bottom + 30;

            if (isInBasket) {
                handleItemDrop(draggedItem);
            }
        }

        setIsDragging(false);
        setDraggedItem(null);
    }, [isDragging, draggedItem, gameStatus]);

    // Click handler (drag qilmasdan bosish)
    const handleItemClick = useCallback((item) => {
        if (gameStatus !== 'playing' || isDragging) return;
        handleItemDrop(item);
    }, [gameStatus, isDragging]);

    const handleItemDrop = (item) => {
        if (item.type === requiredType) {
            // To'g'ri narsa - savatga qo'shildi
            const newCollected = collected + 1;
            setCollected(newCollected);
            triggerFeedback('success');

            // Narsani o'chirish va yangi itemlar generatsiya qilish
            // Har doim kerakli narsadan 1-3 ta qo'shish (cheksiz)
            setItems(generateItems(requiredType, 100));
        } else {
            // Noto'g'ri narsa
            setMistakes((prev) => prev + 1);
            triggerFeedback('error');

            // Yangi itemlar generatsiya qilish
            setItems(generateItems(requiredType, 100));
        }
    };

    function triggerFeedback(type) {
        setFeedbackAnimation({ type, show: true });
        setTimeout(() => setFeedbackAnimation({ type, show: false }), 500);
    }

    // Global event listeners
    useEffect(() => {
        const handleMove = (e) => handleDragMove(e);
        const handleEnd = (e) => handleDragEnd(e);

        if (isDragging) {
            window.addEventListener('mousemove', handleMove);
            window.addEventListener('mouseup', handleEnd);
            window.addEventListener('touchmove', handleMove, { passive: false });
            window.addEventListener('touchend', handleEnd);
        }

        return () => {
            window.removeEventListener('mousemove', handleMove);
            window.removeEventListener('mouseup', handleEnd);
            window.removeEventListener('touchmove', handleMove);
            window.removeEventListener('touchend', handleEnd);
        };
    }, [isDragging, handleDragMove, handleDragEnd]);

    const gameTimeFormatted = formatTime(gameTime);

    // Start Screen
    if (gameScreen === 'start') {
        return (
            <div style={{
                position: 'fixed',
                inset: 0,
                background: 'linear-gradient(to bottom right, #c4b5fd, #fbcfe8, #bfdbfe)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '16px',
            }}>
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

                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '24px',
                    padding: '32px',
                    textAlign: 'center',
                    maxWidth: '400px',
                    width: '100%',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.15)'
                }}>
                    <div style={{ fontSize: '64px', marginBottom: '16px' }}>🧺</div>
                    <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#374151', marginBottom: '8px' }}>
                        Drop to Basket
                    </h1>
                    <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '24px' }}>
                        Collect the correct number of items!
                    </p>

                    <div style={{
                        backgroundColor: '#f3f4f6',
                        borderRadius: '16px',
                        padding: '20px',
                        marginBottom: '24px'
                    }}>
                        <label style={{
                            display: 'block',
                            fontSize: '14px',
                            fontWeight: '600',
                            color: '#374151',
                            marginBottom: '12px'
                        }}>
                            O'quvchi qaysi raqamgacha o'rgangan?
                        </label>
                        <div style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '8px',
                            justifyContent: 'center'
                        }}>
                            {[5, 10, 15, 20, 30, 50, 100].map(num => (
                                <button
                                    key={num}
                                    onClick={() => setMaxNumber(num)}
                                    style={{
                                        padding: '12px 20px',
                                        borderRadius: '12px',
                                        border: 'none',
                                        backgroundColor: maxNumber === num ? '#8b5cf6' : 'white',
                                        color: maxNumber === num ? 'white' : '#374151',
                                        fontWeight: '600',
                                        fontSize: '16px',
                                        cursor: 'pointer',
                                        boxShadow: maxNumber === num ? '0 4px 12px rgba(139, 92, 246, 0.4)' : '0 2px 4px rgba(0,0,0,0.1)',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {num}
                                </button>
                            ))}
                        </div>
                        <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '12px' }}>
                            1 dan {maxNumber} gacha sonlar ishlatiladi
                        </p>
                    </div>

                    <button
                        onClick={startGame}
                        style={{
                            width: '100%',
                            padding: '16px',
                            borderRadius: '12px',
                            border: 'none',
                            backgroundColor: '#22c55e',
                            color: 'white',
                            fontWeight: '700',
                            fontSize: '18px',
                            cursor: 'pointer',
                            boxShadow: '0 4px 12px rgba(34, 197, 94, 0.4)',
                        }}
                    >
                        🎮 O'yinni boshlash
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            style={{
                position: 'fixed',
                inset: 0,
                background: 'linear-gradient(to bottom right, #c4b5fd, #fbcfe8, #bfdbfe)',
                overflow: 'hidden',
                touchAction: 'none',
                userSelect: 'none',
            }}
        >
            <style jsx global>{`
                @keyframes float {
                    0%, 100% { transform: translate(-50%, -50%) scale(1); }
                    50% { transform: translate(-50%, -50%) translateY(-5px) scale(1); }
                }
                @keyframes wiggle {
                    0%, 100% { transform: translateX(-50%) rotate(0deg); }
                    25% { transform: translateX(-50%) rotate(-3deg); }
                    75% { transform: translateX(-50%) rotate(3deg); }
                }
                @keyframes pop {
                    0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
                    50% { transform: translate(-50%, -50%) scale(1.3); opacity: 0.8; }
                    100% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
                }
                @keyframes bounce {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.1); }
                }
                .item-btn {
                    animation: float 2s ease-in-out infinite;
                    animation-delay: calc(var(--delay) * 0.1s);
                }
                .item-btn:hover {
                    transform: translate(-50%, -50%) scale(1.15) !important;
                    z-index: 100 !important;
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

            {/* Top Bar */}
            {gameStatus === 'playing' && (
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    backgroundColor: 'rgba(255,255,255,0.85)',
                    backdropFilter: 'blur(8px)',
                    padding: '10px 16px',
                    paddingLeft: '60px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    zIndex: 50,
                    borderBottom: '1px solid rgba(0,0,0,0.05)',
                }}>
                    {/* Timer */}
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '10px',
                        padding: '6px 12px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
                    }}>
                        <div style={{ fontSize: '10px', color: '#6b7280', fontWeight: '500' }}>⏱️ Time</div>
                        <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#2563eb' }}>{gameTimeFormatted}</div>
                    </div>

                    {/* Instruction - Number as word */}
                    <div style={{ textAlign: 'center', flex: 1, padding: '0 8px' }}>
                        <p style={{ fontSize: '14px', fontWeight: '600', color: '#374151', margin: 0 }}>
                            Collect <span style={{
                                fontSize: '18px',
                                color: '#8b5cf6',
                                fontWeight: 'bold',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px'
                            }}>{getNumberWord(requiredQuantity)}</span> {getEmoji(requiredType)}
                        </p>
                        <p style={{ fontSize: '11px', color: '#6b7280', margin: 0, textTransform: 'capitalize' }}>{requiredType}s</p>
                    </div>

                    {/* Lives */}
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '10px',
                        padding: '6px 12px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
                    }}>
                        <div style={{ fontSize: '10px', color: '#6b7280', fontWeight: '500' }}>❤️ Lives</div>
                        <div style={{ fontSize: '16px' }}>
                            {'❤️'.repeat(MAX_MISTAKES - mistakes)}{'🖤'.repeat(mistakes)}
                        </div>
                    </div>
                </div>
            )}

            {/* Items */}
            {gameStatus === 'playing' && items.map((item, index) => (
                <div
                    key={item.id}
                    className="item-btn"
                    style={{
                        '--delay': index,
                        position: 'absolute',
                        left: `${item.x}%`,
                        top: `${item.y}%`,
                        transform: 'translate(-50%, -50%)',
                        fontSize: 'clamp(32px, 8vw, 48px)',
                        cursor: 'grab',
                        filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.15))',
                        opacity: draggedItem?.id === item.id ? 0.3 : 1,
                        zIndex: 10,
                        touchAction: 'none',
                    }}
                    onMouseDown={(e) => handleDragStart(e, item)}
                    onTouchStart={(e) => handleDragStart(e, item)}
                    onClick={() => handleItemClick(item)}
                >
                    {item.emoji}
                </div>
            ))}

            {/* Dragged Item */}
            {isDragging && draggedItem && (
                <div
                    style={{
                        position: 'fixed',
                        left: dragPosition.x,
                        top: dragPosition.y,
                        transform: 'translate(-50%, -50%) scale(1.2)',
                        fontSize: 'clamp(40px, 10vw, 56px)',
                        pointerEvents: 'none',
                        zIndex: 1000,
                        filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.3))',
                    }}
                >
                    {draggedItem.emoji}
                </div>
            )}

            {/* Basket */}
            {gameStatus === 'playing' && (
                <div
                    ref={basketRef}
                    style={{
                        position: 'absolute',
                        bottom: '8%',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        animation: isDragging ? 'bounce 0.5s infinite' : 'wiggle 3s ease-in-out infinite',
                        zIndex: 20,
                    }}
                >
                    <div style={{
                        fontSize: 'clamp(60px, 15vw, 90px)',
                        filter: isDragging ? 'drop-shadow(0 0 20px rgba(34, 197, 94, 0.5))' : 'none',
                    }}>
                        🧺
                    </div>
                    <p style={{
                        fontSize: '12px',
                        fontWeight: '600',
                        color: '#374151',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        margin: '4px 0 0 0',
                    }}>
                        {isDragging ? 'Drop here!' : 'Drag items here'}
                    </p>

                    {/* Tugatish tugmasi */}
                    <button
                        onClick={handleFinish}
                        style={{
                            marginTop: '12px',
                            padding: '12px 32px',
                            borderRadius: '12px',
                            border: 'none',
                            backgroundColor: '#22c55e',
                            color: 'white',
                            fontWeight: '700',
                            fontSize: '16px',
                            cursor: 'pointer',
                            boxShadow: '0 4px 12px rgba(34, 197, 94, 0.4)',
                        }}
                    >
                        ✓ Tugatish
                    </button>
                </div>
            )}

            {/* Feedback Animation */}
            {feedbackAnimation.show && (
                <div style={{
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    fontSize: '64px',
                    zIndex: 100,
                    animation: 'pop 0.5s ease-out forwards',
                }}>
                    {feedbackAnimation.type === 'success' ? '✨' : '❌'}
                </div>
            )}

            {/* Victory Screen */}
            {gameStatus === 'won' && (
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
                        <div style={{ fontSize: '48px', marginBottom: '12px' }}>🎉</div>
                        <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#22c55e', marginBottom: '8px' }}>You Win!</h2>
                        <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '20px' }}>Great job collecting all items!</p>

                        <div style={{ backgroundColor: '#dcfce7', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
                                <span style={{ color: '#6b7280' }}>Collected:</span>
                                <span style={{ fontWeight: 'bold', color: '#22c55e' }}>{getNumberWord(collected)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
                                <span style={{ color: '#6b7280' }}>Mistakes:</span>
                                <span style={{ fontWeight: 'bold', color: mistakes === 0 ? '#22c55e' : '#f97316' }}>{mistakes}/{MAX_MISTAKES}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                                <span style={{ color: '#6b7280' }}>Time:</span>
                                <span style={{ fontWeight: 'bold', color: '#2563eb' }}>{gameTimeFormatted}</span>
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
                            <button onClick={initializeGame} style={{
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

            {/* Game Over Screen */}
            {gameStatus === 'lost' && (
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
                        <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#dc2626', marginBottom: '8px' }}>
                            {mistakes >= MAX_MISTAKES ? 'Game Over!' : 'Noto\'g\'ri!'}
                        </h2>
                        <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '20px' }}>
                            {mistakes >= MAX_MISTAKES
                                ? 'Juda ko\'p xato!'
                                : collected > requiredQuantity
                                    ? `Ko'p soldingiz! (${getNumberWord(collected)} / ${getNumberWord(requiredQuantity)})`
                                    : `Kam soldingiz! (${getNumberWord(collected)} / ${getNumberWord(requiredQuantity)})`
                            }
                        </p>

                        <div style={{ backgroundColor: '#f1f5f9', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
                                <span style={{ color: '#6b7280' }}>Collected:</span>
                                <span style={{ fontWeight: 'bold' }}>{getNumberWord(collected)}/{getNumberWord(requiredQuantity)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
                                <span style={{ color: '#6b7280' }}>Mistakes:</span>
                                <span style={{ fontWeight: 'bold', color: '#ef4444' }}>{mistakes}/{MAX_MISTAKES}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                                <span style={{ color: '#6b7280' }}>Time:</span>
                                <span style={{ fontWeight: 'bold' }}>{gameTimeFormatted}</span>
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
                            <button onClick={initializeGame} style={{
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
        </div>
    );
}