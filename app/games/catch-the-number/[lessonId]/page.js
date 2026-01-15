'use client';
import { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
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
    const SPAWN_INTERVAL = 1500;

    useEffect(() => { if (lessonId) fetchLesson(); }, [lessonId]);

    const fetchLesson = async () => {
        try {
            const res = await fetch(`/api/lessons/${lessonId}`);
            const data = await res.json();
            if (data.lesson) { setLesson(data.lesson); startGame(); }
        } catch (error) { console.error('Error:', error); }
        finally { setLoading(false); }
    };

    const generateRandomNumber = () => Math.floor(Math.random() * maxNumber) + 1;

    const startGame = useCallback(() => {
        const value = generateRandomNumber();
        const target = { value, word: numberToWord(value) };
        setCurrentNumber(target);
        speakText(target.word);
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
                    if (newNumber.isCorrect && prev.find(n => n.id === newNumber.id)) handleMissed();
                    return filtered;
                });
            }, FALL_DURATION);
        }, SPAWN_INTERVAL);
        return () => clearInterval(interval);
    }, [gameOver, currentNumber, nextId, maxNumber]);

    const handleMissed = () => {
        setMistakes(prev => {
            const newMistakes = prev + 1;
            if (newMistakes >= MAX_MISTAKES) setTimeout(() => setGameOver(true), 500);
            return newMistakes;
        });
    };

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
                if (score + 1 >= 20) { setGameOver(true); recordGameWin(); }
                else {
                    if ((score + 1) % 5 === 0 && maxNumber < 100) setMaxNumber(prev => Math.min(prev + 10, 100));
                    startGame();
                }
            }, 1500);
        } else {
            setMistakes(prev => prev + 1);
            setFeedback({ type: 'error', message: '✗ Try again!' });
            speakText('Try again!');
            setFallingNumbers(prev => prev.filter(n => n.id !== number.id));
            setTimeout(() => setFeedback(null), 1000);
            if (mistakes + 1 >= MAX_MISTAKES) setTimeout(() => setGameOver(true), 1000);
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
        setScore(0); setMistakes(0); setGameOver(false); setFallingNumbers([]); setShowConfetti(false); setFeedback(null); setNextId(0); setMaxNumber(10); startGame();
    };

    if (loading) return (<div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}><div className="spinner-border text-white"><span className="visually-hidden">Yuklanmoqda...</span></div></div>);
    if (!lesson) return (<div className="min-vh-100 d-flex flex-column align-items-center justify-content-center p-4" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}><span className="material-symbols-outlined text-white mb-3" style={{ fontSize: '64px' }}>sentiment_dissatisfied</span><h4 className="text-white mb-3">Dars topilmadi</h4><Link href="/dashboard/games" className="btn btn-light">Orqaga qaytish</Link></div>);
    if (gameOver) {
        const won = mistakes < MAX_MISTAKES;
        return (<div className="min-vh-100 d-flex flex-column align-items-center justify-content-center p-4" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}><div className="card border-0 rounded-4 shadow-lg text-center" style={{ maxWidth: 400 }}><div className="card-body p-5"><div className="mb-4"><span style={{ fontSize: '80px' }}>{won ? '🎉' : '😊'}</span></div><h2 className="fw-bold mb-2">{won ? 'Ajoyib!' : 'Yaxshi harakat!'}</h2><p className="text-muted mb-4">{score} ta to'g'ri, {mistakes} ta xato</p><div className="d-flex gap-3 justify-content-center"><button onClick={restartGame} className="btn btn-primary rounded-3 px-4"><span className="material-symbols-outlined me-2" style={{ fontSize: '20px' }}>replay</span>Qayta o'ynash</button><Link href="/dashboard/games" className="btn btn-outline-secondary rounded-3 px-4">Chiqish</Link></div></div></div></div>);
    }

    return (
        <div className="min-vh-100 p-4" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', position: 'relative', overflow: 'hidden' }}>
            {showConfetti && (<div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 9999 }}>{[...Array(30)].map((_, i) => (<div key={i} style={{ position: 'absolute', top: '-10px', left: `${Math.random() * 100}%`, width: '10px', height: '10px', backgroundColor: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A'][Math.floor(Math.random() * 5)], borderRadius: Math.random() > 0.5 ? '50%' : '0', animation: `fall ${2 + Math.random() * 2}s linear`, animationDelay: `${Math.random() * 0.5}s` }} />))}</div>)}
            <div className="d-flex justify-content-between align-items-center mb-4"><Link href="/dashboard/games" className="btn btn-light rounded-circle p-2 shadow"><span className="material-symbols-outlined">arrow_back</span></Link><div className="d-flex gap-3"><div className="bg-white rounded-3 px-4 py-2 shadow-sm"><span className="fw-bold text-success d-flex align-items-center gap-1"><span className="material-symbols-outlined" style={{ fontSize: '20px' }}>check_circle</span>{score}</span></div><div className="bg-white rounded-3 px-4 py-2 shadow-sm"><span className="fw-bold text-danger d-flex align-items-center gap-1"><span className="material-symbols-outlined" style={{ fontSize: '20px' }}>cancel</span>{mistakes}/{MAX_MISTAKES}</span></div></div></div>
            {currentNumber && (<div className="text-center mb-4"><div className="card border-0 rounded-4 shadow-lg mx-auto" style={{ maxWidth: 500, animation: 'slideDown 0.5s ease' }}><div className="card-body p-4"><h3 className="fw-bold mb-3">🎯 Catch the <span className="text-primary" style={{ fontSize: '2em' }}>{currentNumber.word}</span>!</h3><p className="text-muted mb-3">Raqam: {currentNumber.value} | Daraja: 1-{maxNumber}</p><button onClick={() => speakText(currentNumber.word)} className="btn btn-primary rounded-circle p-3 shadow" style={{ transition: 'transform 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}><span className="material-symbols-outlined">volume_up</span></button></div></div></div>)}
            {feedback && (<div className={`alert alert-${feedback.type === 'success' ? 'success' : 'danger'} text-center fw-bold mb-4 mx-auto shadow-lg`} style={{ maxWidth: 400, animation: feedback.type === 'success' ? 'bounce 0.5s ease' : 'shake 0.5s ease', fontSize: '1.2em', position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 1000 }}>{feedback.message}</div>)}
            <div style={{ position: 'relative', height: '60vh', marginTop: '20px', overflow: 'hidden' }}>{fallingNumbers.map((number) => (<div key={number.id} onClick={() => handleNumberClick(number)} style={{ position: 'absolute', left: `${number.left}%`, top: '-100px', cursor: 'pointer', animation: `fallDown ${FALL_DURATION}ms linear`, zIndex: 10 }}><div className="rounded-circle d-flex align-items-center justify-content-center shadow-lg" style={{ width: '90px', height: '90px', background: number.isCorrect ? 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: '4px solid white', transition: 'transform 0.2s', boxShadow: '0 8px 20px rgba(0,0,0,0.3)' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.15)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}><span style={{ fontSize: '36px', fontWeight: 'bold', color: 'white', textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>{number.value}</span></div></div>))}</div>
            <div className="text-center" style={{ position: 'fixed', bottom: '20px', left: '50%', transform: 'translateX(-50%)', zIndex: 5 }}><div style={{ fontSize: '80px', animation: 'float 3s ease-in-out infinite' }}>🧺</div><p className="text-white fw-bold">Catch here!</p></div>
            <style jsx>{`@keyframes fall{to{transform:translateY(100vh) rotate(360deg);opacity:0}}@keyframes fallDown{from{transform:translateY(0)}to{transform:translateY(calc(70vh + 100px))}}@keyframes slideDown{from{opacity:0;transform:translateY(-20px)}to{opacity:1;transform:translateY(0)}}@keyframes bounce{0%,100%{transform:scale(1)}50%{transform:scale(1.1)}}@keyframes shake{0%,100%{transform:translate(-50%,-50%) translateX(0)}25%{transform:translate(-50%,-50%) translateX(-10px)}75%{transform:translate(-50%,-50%) translateX(10px)}}@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}`}</style>
        </div>
    );
}
