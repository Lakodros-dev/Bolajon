'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Star, ShoppingBasket, X, CheckCircle } from 'lucide-react';

export default function ShoppingBasketTestPage() {
    const router = useRouter();
    const [basket, setBasket] = useState([]);
    const [targetItems, setTargetItems] = useState([]);
    const [score, setScore] = useState(0);
    const [level, setLevel] = useState(1);
    const [showResult, setShowResult] = useState(false);
    const [message, setMessage] = useState('');

    const items = [
        { id: 1, name: 'Apple', translation: 'Olma', emoji: '🍎' },
        { id: 2, name: 'Banana', translation: 'Banan', emoji: '🍌' },
        { id: 3, name: 'Orange', translation: 'Apelsin', emoji: '🍊' },
        { id: 4, name: 'Grapes', translation: 'Uzum', emoji: '🍇' },
        { id: 5, name: 'Watermelon', translation: 'Tarvuz', emoji: '🍉' },
        { id: 6, name: 'Strawberry', translation: 'Qulupnay', emoji: '🍓' },
        { id: 7, name: 'Bread', translation: 'Non', emoji: '🍞' },
        { id: 8, name: 'Milk', translation: 'Sut', emoji: '🥛' },
    ];

    useEffect(() => {
        generateNewRound();
    }, []);

    const generateNewRound = () => {
        const numItems = Math.min(2 + level, 5);
        const selected = [];
        const availableItems = [...items];
        
        for (let i = 0; i < numItems; i++) {
            const randomIndex = Math.floor(Math.random() * availableItems.length);
            selected.push(availableItems[randomIndex]);
            availableItems.splice(randomIndex, 1);
        }
        
        setTargetItems(selected);
        setBasket([]);
        setMessage('');
    };

    const addToBasket = (item) => {
        if (basket.find(i => i.id === item.id)) {
            setMessage('Bu mahsulot allaqachon savatda!');
            setTimeout(() => setMessage(''), 2000);
            return;
        }
        setBasket([...basket, item]);
    };

    const removeFromBasket = (itemId) => {
        setBasket(basket.filter(i => i.id !== itemId));
    };

    const checkBasket = () => {
        const correct = targetItems.every(target => 
            basket.find(item => item.id === target.id)
        ) && basket.length === targetItems.length;

        if (correct) {
            setScore(score + 1);
            setMessage('✅ To\'g\'ri!');
            setTimeout(() => {
                setLevel(level + 1);
                generateNewRound();
            }, 1500);
        } else {
            setMessage('❌ Noto\'g\'ri! Qaytadan urinib ko\'ring.');
            setTimeout(() => setMessage(''), 2000);
        }
    };

    return (
        <div className="min-vh-100" style={{ backgroundColor: '#f5f5f7' }}>
            {/* Header */}
            <div className="bg-white border-bottom py-3 px-4">
                <div className="d-flex align-items-center justify-content-between">
                    <button onClick={() => router.push('/admin/games-test')} className="btn btn-light rounded-circle">
                        <ArrowLeft size={20} />
                    </button>
                    <div className="text-center">
                        <h5 className="fw-bold mb-0">Shopping Basket</h5>
                        <small className="text-muted">Level {level}</small>
                    </div>
                    <div className="badge bg-primary rounded-pill px-3 py-2 d-flex align-items-center gap-1">
                        <Star size={16} />
                        {score}
                    </div>
                </div>
            </div>

            {/* Game Content */}
            <div className="container py-4">
                {/* Target Items */}
                <div className="card border-0 rounded-4 shadow-sm mb-4">
                    <div className="card-body p-4">
                        <h6 className="fw-bold mb-3">Quyidagi mahsulotlarni savatga soling:</h6>
                        <div className="d-flex flex-wrap gap-2">
                            {targetItems.map(item => (
                                <div key={item.id} className="badge bg-primary bg-opacity-10 text-primary rounded-pill px-3 py-2">
                                    <span style={{ fontSize: '20px' }}>{item.emoji}</span>
                                    {' '}{item.translation}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Message */}
                {message && (
                    <div className={`alert ${message.includes('✅') ? 'alert-success' : 'alert-warning'} rounded-4 mb-4`}>
                        {message}
                    </div>
                )}

                <div className="row g-4">
                    {/* Available Items */}
                    <div className="col-lg-7">
                        <div className="card border-0 rounded-4 shadow-sm">
                            <div className="card-body p-4">
                                <h6 className="fw-bold mb-3">Mahsulotlar:</h6>
                                <div className="row g-3">
                                    {items.map(item => (
                                        <div key={item.id} className="col-6 col-md-4">
                                            <button
                                                onClick={() => addToBasket(item)}
                                                className="btn btn-light w-100 rounded-3 p-3"
                                                disabled={basket.find(i => i.id === item.id)}
                                            >
                                                <div style={{ fontSize: '40px' }}>{item.emoji}</div>
                                                <small className="fw-semibold">{item.translation}</small>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Basket */}
                    <div className="col-lg-5">
                        <div className="card border-0 rounded-4 shadow-sm">
                            <div className="card-body p-4">
                                <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
                                    <ShoppingBasket size={20} />
                                    Savat ({basket.length})
                                </h6>
                                
                                {basket.length === 0 ? (
                                    <div className="text-center py-5 text-muted">
                                        <div style={{ fontSize: '60px' }}>🛒</div>
                                        <p className="mb-0">Savat bo'sh</p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="d-flex flex-column gap-2 mb-3">
                                            {basket.map(item => (
                                                <div key={item.id} className="d-flex align-items-center justify-content-between bg-light rounded-3 p-2">
                                                    <div className="d-flex align-items-center gap-2">
                                                        <span style={{ fontSize: '24px' }}>{item.emoji}</span>
                                                        <span className="fw-semibold">{item.translation}</span>
                                                    </div>
                                                    <button
                                                        onClick={() => removeFromBasket(item.id)}
                                                        className="btn btn-sm btn-outline-danger rounded-circle"
                                                        style={{ width: '30px', height: '30px', padding: 0 }}
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                        <button
                                            onClick={checkBasket}
                                            className="btn btn-primary w-100 rounded-3 d-flex align-items-center justify-content-center gap-2"
                                        >
                                            <CheckCircle size={18} />
                                            Tekshirish
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
