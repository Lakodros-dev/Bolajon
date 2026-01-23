'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Star, RotateCcw } from 'lucide-react';

export default function BuildBodyTestPage() {
    const router = useRouter();
    const [currentPart, setCurrentPart] = useState(null);
    const [placedParts, setPlacedParts] = useState([]);
    const [score, setScore] = useState(0);
    const [message, setMessage] = useState('');

    const bodyParts = [
        { id: 'head', name: 'Head', translation: 'Bosh', emoji: '😊', position: 'top' },
        { id: 'body', name: 'Body', translation: 'Tana', emoji: '👕', position: 'middle' },
        { id: 'arms', name: 'Arms', translation: 'Qo\'llar', emoji: '💪', position: 'middle' },
        { id: 'legs', name: 'Legs', translation: 'Oyoqlar', emoji: '👖', position: 'bottom' },
    ];

    const [availableParts, setAvailableParts] = useState([...bodyParts]);

    const handlePartClick = (part) => {
        setCurrentPart(part);
        setMessage(`${part.translation}ni to'g'ri joyga qo'ying`);
    };

    const handlePlacePart = (position) => {
        if (!currentPart) {
            setMessage('Avval tana a\'zosini tanlang!');
            return;
        }

        if (currentPart.position === position) {
            setPlacedParts([...placedParts, currentPart]);
            setAvailableParts(availableParts.filter(p => p.id !== currentPart.id));
            setScore(score + 1);
            setMessage('✅ To\'g\'ri!');
            setCurrentPart(null);
            
            if (placedParts.length + 1 === bodyParts.length) {
                setTimeout(() => {
                    setMessage('🎉 Tanani to\'liq yig\'dingiz!');
                }, 500);
            }
        } else {
            setMessage('❌ Noto\'g\'ri joy! Qaytadan urinib ko\'ring.');
        }

        setTimeout(() => {
            if (placedParts.length + 1 < bodyParts.length) {
                setMessage('');
            }
        }, 2000);
    };

    const restartGame = () => {
        setPlacedParts([]);
        setAvailableParts([...bodyParts]);
        setCurrentPart(null);
        setScore(0);
        setMessage('');
    };

    return (
        <div className="min-vh-100" style={{ backgroundColor: '#f5f5f7' }}>
            {/* Header */}
            <div className="bg-white border-bottom py-3 px-4">
                <div className="d-flex align-items-center justify-content-between">
                    <button onClick={() => router.push('/admin/games-test')} className="btn btn-light rounded-circle">
                        <ArrowLeft size={20} />
                    </button>
                    <h5 className="fw-bold mb-0">Build the Body</h5>
                    <div className="badge bg-primary rounded-pill px-3 py-2 d-flex align-items-center gap-1">
                        <Star size={16} />
                        {score}
                    </div>
                </div>
            </div>

            {/* Game Content */}
            <div className="container py-4">
                {/* Message */}
                {message && (
                    <div className={`alert ${message.includes('✅') || message.includes('🎉') ? 'alert-success' : message.includes('❌') ? 'alert-danger' : 'alert-info'} rounded-4 mb-4 text-center`}>
                        {message}
                    </div>
                )}

                <div className="row g-4">
                    {/* Body Builder */}
                    <div className="col-lg-6">
                        <div className="card border-0 rounded-4 shadow-sm">
                            <div className="card-body p-4">
                                <h6 className="fw-bold mb-4 text-center">Tanani yig'ing:</h6>
                                
                                {/* Top (Head) */}
                                <div
                                    onClick={() => handlePlacePart('top')}
                                    className={`border-2 border-dashed rounded-4 p-4 mb-3 text-center ${currentPart ? 'cursor-pointer' : ''}`}
                                    style={{ 
                                        minHeight: '120px',
                                        backgroundColor: placedParts.find(p => p.position === 'top') ? '#e8f5e9' : '#f5f5f7',
                                        cursor: currentPart ? 'pointer' : 'default',
                                        borderColor: currentPart?.position === 'top' ? '#4caf50' : '#dee2e6'
                                    }}
                                >
                                    {placedParts.find(p => p.position === 'top') ? (
                                        <div>
                                            <div style={{ fontSize: '60px' }}>
                                                {placedParts.find(p => p.position === 'top').emoji}
                                            </div>
                                            <p className="fw-semibold mb-0">{placedParts.find(p => p.position === 'top').translation}</p>
                                        </div>
                                    ) : (
                                        <p className="text-muted mb-0">Bosh</p>
                                    )}
                                </div>

                                {/* Middle (Body & Arms) */}
                                <div
                                    onClick={() => handlePlacePart('middle')}
                                    className={`border-2 border-dashed rounded-4 p-4 mb-3 text-center ${currentPart ? 'cursor-pointer' : ''}`}
                                    style={{ 
                                        minHeight: '150px',
                                        backgroundColor: placedParts.filter(p => p.position === 'middle').length > 0 ? '#e8f5e9' : '#f5f5f7',
                                        cursor: currentPart ? 'pointer' : 'default',
                                        borderColor: currentPart?.position === 'middle' ? '#4caf50' : '#dee2e6'
                                    }}
                                >
                                    {placedParts.filter(p => p.position === 'middle').length > 0 ? (
                                        <div className="d-flex justify-content-center gap-3">
                                            {placedParts.filter(p => p.position === 'middle').map(part => (
                                                <div key={part.id}>
                                                    <div style={{ fontSize: '50px' }}>{part.emoji}</div>
                                                    <p className="fw-semibold mb-0 small">{part.translation}</p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-muted mb-0">Tana va Qo'llar</p>
                                    )}
                                </div>

                                {/* Bottom (Legs) */}
                                <div
                                    onClick={() => handlePlacePart('bottom')}
                                    className={`border-2 border-dashed rounded-4 p-4 text-center ${currentPart ? 'cursor-pointer' : ''}`}
                                    style={{ 
                                        minHeight: '120px',
                                        backgroundColor: placedParts.find(p => p.position === 'bottom') ? '#e8f5e9' : '#f5f5f7',
                                        cursor: currentPart ? 'pointer' : 'default',
                                        borderColor: currentPart?.position === 'bottom' ? '#4caf50' : '#dee2e6'
                                    }}
                                >
                                    {placedParts.find(p => p.position === 'bottom') ? (
                                        <div>
                                            <div style={{ fontSize: '60px' }}>
                                                {placedParts.find(p => p.position === 'bottom').emoji}
                                            </div>
                                            <p className="fw-semibold mb-0">{placedParts.find(p => p.position === 'bottom').translation}</p>
                                        </div>
                                    ) : (
                                        <p className="text-muted mb-0">Oyoqlar</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Available Parts */}
                    <div className="col-lg-6">
                        <div className="card border-0 rounded-4 shadow-sm">
                            <div className="card-body p-4">
                                <h6 className="fw-bold mb-4">Tana a'zolari:</h6>
                                
                                {availableParts.length === 0 ? (
                                    <div className="text-center py-5">
                                        <div style={{ fontSize: '80px' }}>🎉</div>
                                        <h5 className="fw-bold mb-3">Ajoyib!</h5>
                                        <p className="text-muted mb-4">Tanani to'liq yig'dingiz!</p>
                                        <button onClick={restartGame} className="btn btn-primary rounded-3 d-flex align-items-center gap-2">
                                            <RotateCcw size={20} />
                                            Qayta o'ynash
                                        </button>
                                    </div>
                                ) : (
                                    <div className="row g-3">
                                        {availableParts.map(part => (
                                            <div key={part.id} className="col-6">
                                                <button
                                                    onClick={() => handlePartClick(part)}
                                                    className={`btn w-100 rounded-3 p-4 ${currentPart?.id === part.id ? 'btn-primary' : 'btn-light'}`}
                                                >
                                                    <div style={{ fontSize: '50px' }}>{part.emoji}</div>
                                                    <p className="fw-semibold mb-0 mt-2">{part.translation}</p>
                                                    <small className="text-muted">{part.name}</small>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
