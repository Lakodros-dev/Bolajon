'use client';
import { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

const numberToWord = (num) => {
    if (num === 0) return 'Zero';
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    if (num < 10) return ones[num];
    if (num < 20) return teens[num - 10];
    if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 ? ' ' + ones[num % 10] : '');
    if (num < 1000) return ones[Math.floor(num / 100)] + ' Hundred' + (num % 100 ? ' ' + numberToWord(num % 100) : '');
    return num.toString();
};

export default function CatchTheNumberGame() {
    const params = useParams();
    const searchParams = useSearchParams();
    const { getAuthHeader } = useAuth();
    const lessonId = params.lessonId;
    const studentId = searchParams.get('student');
    const [lesson, setLesson] = useState(null);
    const [currentNumber, setCurrentNumber] = useState(null);
    const [fallingNumbers, setFallingNumbers] = useState([]);
    const [score, setScore] = useState(0);
    const [mistakes, setMistakes] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [loading, setLoading] = useState(true);
    const [feedback, setFeedback] = useState(null);
    const [showConfetti, setShowConfetti] = useState(false);
    const [nextId, setNextId] = useState(0);
    const [maxNumber, setMaxNumber] = useState(10);
    const MAX_MISTAKES = 5;
    const FALL_DURATION = 4000;
    const SPAWN_INTERVAL = 1000;

    useEffect(() => { if (lessonId) fetchLesson(); }, [lessonId]);

    // Cleanup: sahifadan chiqishda ovoz va intervallarni to'xtatish
    useEffect(() => {
        return () => {
            // Ovozni to'xtatish
            if ('speechSynthesis' in window) {
                window.speechSynthesis.cancel();
            }
            // Interval to'xtatish
            if (window.currentSpeechInterval) {
                clearInterval(window.currentSpeechInterval);
                window.currentSpeechInterval = null;
            }
        };
    }, []);

    const fetchLesson = async () => {
        try {
            const res = await fetch(`/api/lessons/${lessonId}`, {
                headers: getAuthHeader()
            });
            const data = await res.json();
            if (data.lesson) { setLesson(data.lesson); startGame(); }
        } catch (error) { console.error('Error:', error); }
        finally { setLoading(false); }
    };

    const generateRandomNumber = () => Math.floor(Math.random() * maxNumber) + 1;

    const startGame = useCallback(() => {
        // Clear previous interval
        if (window.currentSpeechInterval) {
            clearInterval(window.currentSpeechInterval);
            window.currentSpeechInterval = null;
        }
        
        const value = generateRandomNumber();
        const target = { value, word: numberToWord(value) };
        setCurrentNumber(target);
        speakText(target.word);
        
        // Auto-repeat every 3 seconds
        const repeatInterval = setInterval(() => {
            speakText(target.word);
        }, 3000);
        
        // Store interval ID to clear it later
        window.currentSpeechInterval = repeatInterval;
    }, [maxNumber]);

    useEffect(() => {
        if (gameOver || !currentNumber) return;
        const interval = setInterval(() => {
            const value = generateRandomNumber();
            const randomNum = { value, word: numberToWord(value) };
            const newNumber = { id: nextId, word: randomNum.word, value: randomNum.value, left: Math.random() * 80 + 10, isCorrect: randomNum.value === currentNumber.value };
            setNextId(prev => prev + 1);
            setFallingNumbers(prev => [...prev, newNumber]);
            setTimeout(() => {
                setFallingNumbers(prev => {
                    const filtered = prev.filter(n => n.id !== newNumber.id);
                    // O'tkazib yuborish xato hisoblanmaydi
                    // if (newNumber.isCorrect && prev.find(n => n.id !== newNumber.id)) handleMissed();
                    return filtered;
                });
            }, FALL_DURATION);
        }, SPAWN_INTERVAL);
        return () => clearInterval(interval);
    }, [gameOver, currentNumber, nextId, maxNumber]);

    const handleNumberClick = (number) => {
        if (gameOver) return;
        if (number.isCorrect) {
            setScore(prev => prev + 1);
            setFeedback({ type: 'success', message: '✓ Perfect!' });
            setShowConfetti(true);
            speakText('Perfect!');
            setFallingNumbers(prev => prev.filter(n => n.id !== number.id));
            setTimeout(() => { setShowConfetti(false); setFeedback(null); }, 1000);
            setTimeout(() => {
                if (score + 1 >= 20) { 
                    if (window.currentSpeechInterval) clearInterval(window.currentSpeechInterval);
                    setGameOver(true); 
                    recordGameWin(); 
                }
                else {
                    if ((score + 1) % 5 === 0 && maxNumber < 100) setMaxNumber(prev => Math.min(prev + 10, 100));
                    startGame();
                }
            }, 800);
        } else {
            // Faqat noto'g'ri raqamni bosganda xato hisoblanadi
            const newMistakes = mistakes + 1;
            setMistakes(newMistakes);
            setFeedback({ type: 'error', message: '✗ Try again!' });
            speakText('Try again!');
            setFallingNumbers(prev => prev.filter(n => n.id !== number.id));
            setTimeout(() => setFeedback(null), 1000);
            // 5 ta xato bo'lganda o'yin tugaydi
            if (newMistakes >= MAX_MISTAKES) {
                if (window.currentSpeechInterval) clearInterval(window.currentSpeechInterval);
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
            await fetch('/api/game-progress', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ studentId, lessonId }) });
        } catch (error) { console.error('Error:', error); }
    };

    const restartGame = () => {
        if (window.currentSpeechInterval) clearInterval(window.currentSpeechInterval);
        setScore(0); setMistakes(0); setGameOver(false); setFallingNumbers([]); setShowConfetti(false); setFeedback(null); setNextId(0); setMaxNumber(10); startGame();
    };

    if (loading) return (<div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}><div className="spinner-border text-white"><span className="visually-hidden">Yuklanmoqda...</span></div></div>);
    if (!lesson) return (<div className="min-vh-100 d-flex flex-column align-items-center justify-content-center p-4" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}><Frown size={64} className="text-white mb-3" /><h4 className="text-white mb-3">Dars topilmadi</h4><Link href="/dashboard/games" className="btn btn-light">Orqaga qaytish</Link></div>);
    if (gameOver) {
        const won = mistakes < MAX_MISTAKES;
        return (<div className="min-vh-100 d-flex flex-column align-items-center justify-content-center p-4" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}><div className="card border-0 rounded-4 shadow-lg text-center" style={{ maxWidth: 400 }}><div className="card-body p-5"><div className="mb-4"><span style={{ fontSize: '80px' }}>{won ? '🎉' : '😊'}</span></div><h2 className="fw-bold mb-2">{won ? 'Ajoyib!' : 'Yaxshi harakat!'}</h2><p className="text-muted mb-4">{score} ta to'g'ri, {mistakes} ta xato</p><div className="d-flex gap-3 justify-content-center"><button onClick={restartGame} className="btn btn-primary rounded-3 px-4 d-flex align-items-center gap-2"><RotateCcw size={20} />Qayta o'ynash</button><Link href="/dashboard/games" className="btn btn-outline-secondary rounded-3 px-4">Chiqish</Link></div></div></div></div>);
    }

    return (
        <div className="min-vh-100" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', position: 'relative', overflow: 'hidden' }}>
            {showConfetti && (<div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 9999 }}>{[...Array(30)].map((_, i) => (<div key={i} style={{ position: 'absolute', top: '-10px', left: `${Math.random() * 100}%`, width: '10px', height: '10px', backgroundColor: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A'][Math.floor(Math.random() * 5)], borderRadius: Math.random() > 0.5 ? '50%' : '0', animation: `fall ${2 + Math.random() * 2}s linear`, animationDelay: `${Math.random() * 0.5}s` }} />))}</div>)}
            
            {/* Fixed Top Bar */}
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100 }}>
                <div className="container-fluid px-3 py-2">
                    {/* Desktop Layout */}
                    <div className="d-none d-lg-flex justify-content-between align-items-center">
                        <Link href="/dashboard/games" className="btn btn-light rounded-circle shadow-sm" style={{ width: '45px', height: '45px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <ArrowLeft size={20} />
                        </Link>
                        
                        {currentNumber && (
                            <div className="bg-white bg-opacity-90 rounded-4 shadow-lg px-4 py-3" style={{ backdropFilter: 'blur(10px)' }}>
                                <div className="d-flex align-items-center gap-3">
                                    <span style={{ fontSize: '1.1rem', color: '#666' }}>🎯 Catch the</span>
                                    <span className="fw-bold" style={{ fontSize: '2.2rem', color: '#000', letterSpacing: '-0.5px' }}>{currentNumber.word}</span>
                                    <button 
                                        onClick={() => speakText(currentNumber.word)} 
                                        className="btn btn-primary rounded-circle shadow-sm" 
                                        style={{ 
                                            width: '50px', 
                                            height: '50px', 
                                            padding: 0, 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'center', 
                                            transition: 'all 0.2s',
                                            flexShrink: 0
                                        }} 
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform = 'scale(1.1)';
                                            e.currentTarget.style.boxShadow = '0 6px 16px rgba(13, 110, 253, 0.4)';
                                        }} 
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = 'scale(1)';
                                            e.currentTarget.style.boxShadow = '';
                                        }}
                                    >
                                        <Volume2 size={20} />
                                    </button>
                                </div>
                            </div>
                        )}
                        
                        <div className="d-flex gap-2">
                            <div className="bg-white bg-opacity-25 rounded-3 px-3 py-2 border border-white border-opacity-50 shadow-sm">
                                <span className="fw-bold text-white d-flex align-items-center gap-1">
                                    <CheckCircle size={18} />
                                    {score}
                                </span>
                            </div>
                            <div className="bg-white bg-opacity-25 rounded-3 px-3 py-2 border border-white border-opacity-50 shadow-sm">
                                <span className="fw-bold text-white d-flex align-items-center gap-1">
                                    <XCircle size={18} />
                                    {mistakes}/{MAX_MISTAKES}
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    {/* Mobile Layout */}
                    <div className="d-lg-none">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                            <Link href="/dashboard/games" className="btn btn-light rounded-circle shadow-sm" style={{ width: '40px', height: '40px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <ArrowLeft size={20} />
                            </Link>
                            
                            <div className="d-flex gap-2">
                                <div className="bg-white bg-opacity-25 rounded-3 px-2 py-1 border border-white border-opacity-50 shadow-sm">
                                    <span className="fw-bold text-white d-flex align-items-center gap-1" style={{ fontSize: '14px' }}>
                                        <CheckCircle size={16} />
                                        {score}
                                    </span>
                                </div>
                                <div className="bg-white bg-opacity-25 rounded-3 px-2 py-1 border border-white border-opacity-50 shadow-sm">
                                    <span className="fw-bold text-white d-flex align-items-center gap-1" style={{ fontSize: '14px' }}>
                                        <XCircle size={16} />
                                        {mistakes}/{MAX_MISTAKES}
                                    </span>
                                </div>
                            </div>
                        </div>
                        
                        {currentNumber && (
                            <div className="bg-white bg-opacity-90 rounded-4 shadow-lg px-3 py-2 text-center" style={{ backdropFilter: 'blur(10px)', marginTop: '8px' }}>
                                <div className="d-flex flex-column align-items-center gap-2">
                                    <div className="d-flex align-items-center gap-2">
                                        <span style={{ fontSize: '0.9rem', color: '#666' }}>🎯 Catch the</span>
                                        <span className="fw-bold" style={{ fontSize: '1.8rem', color: '#000', letterSpacing: '-0.5px' }}>{currentNumber.word}</span>
                                    </div>
                                    <button 
                                        onClick={() => speakText(currentNumber.word)} 
                                        className="btn btn-primary rounded-circle shadow-sm" 
                                        style={{ 
                                            width: '45px', 
                                            height: '45px', 
                                            padding: 0, 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'center'
                                        }}
                                    >
                                        <Volume2 size={24} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            {/* Game Area with top padding */}
            <div style={{ paddingTop: '140px' }} className="d-lg-none"></div>
            <div style={{ paddingTop: '100px' }} className="d-none d-lg-block"></div>
            
            {feedback && (<div className={`alert alert-${feedback.type === 'success' ? 'success' : 'danger'} text-center fw-bold mb-4 mx-auto shadow-lg`} style={{ maxWidth: 400, animation: feedback.type === 'success' ? 'bounce 0.5s ease' : 'shake 0.5s ease', fontSize: '1.2em', position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 1000 }}>{feedback.message}</div>)}
            
            <div style={{ position: 'relative', height: '80vh', marginTop: '20px', overflow: 'hidden' }}>
                {fallingNumbers.map((number) => (
                    <div key={number.id} onClick={() => handleNumberClick(number)} style={{ position: 'absolute', left: `${number.left}%`, top: '0', cursor: 'pointer', animation: `fallDown ${FALL_DURATION}ms linear`, zIndex: 10 }}>
                        <div className="rounded-circle d-flex align-items-center justify-content-center shadow-lg" style={{ width: '90px', height: '90px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: '4px solid white', transition: 'transform 0.2s', boxShadow: '0 8px 20px rgba(0,0,0,0.3)' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.15)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                            <span style={{ fontSize: '36px', fontWeight: 'bold', color: 'white', textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>{number.value}</span>
                        </div>
                    </div>
                ))}
            </div>
            
            <div className="text-center" style={{ position: 'fixed', bottom: '20px', left: '50%', transform: 'translateX(-50%)', zIndex: 5 }}>
                <div style={{ fontSize: '80px', animation: 'float 3s ease-in-out infinite' }}>🧺</div>
                <p className="text-white fw-bold">Catch here!</p>
            </div>
            
            <style jsx>{`@keyframes fall{to{transform:translateY(100vh) rotate(360deg);opacity:0}}@keyframes fallDown{from{transform:translateY(-100px)}to{transform:translateY(calc(70vh + 100px))}}@keyframes slideDown{from{opacity:0;transform:translateY(-20px)}to{opacity:1;transform:translateY(0)}}@keyframes bounce{0%,100%{transform:scale(1)}50%{transform:scale(1.1)}}@keyframes shake{0%,100%{transform:translate(-50%,-50%) translateX(0)}25%{transform:translate(-50%,-50%) translateX(-10px)}75%{transform:translate(-50%,-50%) translateX(10px)}}@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}`}</style>
        </div>
    );
}
