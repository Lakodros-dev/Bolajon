'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/dashboard/Header';
import Link from 'next/link';
import YinYangProgress from '@/components/YinYangProgress';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { useSubscription } from '@/components/SubscriptionModal';
import { UserX, Repeat, Play } from 'lucide-react';

export default function GamesPage() {
    const router = useRouter();
    const { students, lessons: allLessons, initialLoading } = useData();
    const { getAuthHeader } = useAuth();
    const { requireSubscription } = useSubscription();
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [lessons, setLessons] = useState([]);
    const [progress, setProgress] = useState({ completedLessons: [], wonGames: [] });
    const [showStudentModal, setShowStudentModal] = useState(true);
    const [loadingProgress, setLoadingProgress] = useState(false);
    const [hasScrolled, setHasScrolled] = useState(false);

    // Sort lessons when loaded
    useEffect(() => {
        if (allLessons && allLessons.length > 0) {
            const sorted = [...allLessons].sort((a, b) => a.order - b.order || a.level - b.level);
            setLessons(sorted);
        }
    }, [allLessons]);

    // Refresh lessons on mount to get latest gameType
    useEffect(() => {
        const fetchFreshLessons = async () => {
            try {
                const res = await fetch('/api/lessons');
                const data = await res.json();
                if (data.success && data.lessons) {
                    const sorted = [...data.lessons].sort((a, b) => a.order - b.order || a.level - b.level);
                    setLessons(sorted);
                }
            } catch (error) {
                console.error('Error fetching lessons:', error);
            }
        };
        fetchFreshLessons();
    }, []);

    // Fetch progress when student selected
    useEffect(() => {
        if (selectedStudent) {
            fetchProgress();
        }
    }, [selectedStudent]);

    // Scroll to next game after progress loaded
    useEffect(() => {
        if (!loadingProgress && lessons.length > 0 && progress.wonGames.length > 0 && !hasScrolled) {
            // Find the first incomplete game
            const nextGameIndex = lessons.findIndex(lesson => !progress.wonGames.includes(lesson._id));
            
            if (nextGameIndex > 0) {
                // Wait a bit for DOM to render
                setTimeout(() => {
                    const gameCards = document.querySelectorAll('.snake-step');
                    if (gameCards[nextGameIndex]) {
                        // Instant scroll without smooth behavior
                        gameCards[nextGameIndex].scrollIntoView({ 
                            behavior: 'auto', // instant scroll
                            block: 'center'
                        });
                        setHasScrolled(true);
                    }
                }, 100);
            }
        }
    }, [loadingProgress, lessons, progress, hasScrolled]);

    const fetchProgress = async () => {
        setLoadingProgress(true);
        try {
            const res = await fetch(`/api/game-progress?studentId=${selectedStudent._id}`, {
                headers: getAuthHeader()
            });
            
            // Handle subscription expired
            if (res.status === 402) {
                const data = await res.json();
                console.log('Subscription expired:', data.error);
                return;
            }
            
            const data = await res.json();
            if (data.completedLessons) {
                setProgress(data);
            }
        } catch (error) {
            console.error('Error fetching progress:', error);
        } finally {
            setLoadingProgress(false);
        }
    };

    const handleSelectStudent = (student) => {
        setSelectedStudent(student);
        setShowStudentModal(false);
        setHasScrolled(false); // Reset scroll flag for new student
    };

    const handleChangeStudent = () => {
        setShowStudentModal(true);
        setSelectedStudent(null);
        setHasScrolled(false); // Reset scroll flag
    };

    // Student Selection Modal
    if (showStudentModal) {
        return (
            <div className="page-content">
                <Header 
                    title="O'yinlar"
                    breadcrumbs={[
                        { label: 'Asosiy', href: '/dashboard' },
                        { label: "O'yinlar", href: '/dashboard/games' }
                    ]}
                />
                <main className="p-3">
                    <div className="text-center mb-4">
                        <h1 className="h4 fw-bold mb-2">🎮 O'yinlar</h1>
                        <p className="text-muted">Qaysi farzandingiz uchun o'yin o'ynaysiz?</p>
                    </div>

                    {initialLoading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Yuklanmoqda...</span>
                            </div>
                        </div>
                    ) : students.length === 0 ? (
                        <div className="text-center py-5">
                            <UserX size={64} className="text-muted mb-3" />
                            <p className="text-muted mt-3">Hali bolalar qo'shilmagan</p>
                            <Link href="/dashboard/students" className="btn btn-primary">
                                Bola qo'shish
                            </Link>
                        </div>
                    ) : (
                        <div className="row g-3">
                            {students.map((student) => (
                                <div key={student._id} className="col-6 col-md-4 col-lg-3">
                                    <button
                                        onClick={() => handleSelectStudent(student)}
                                        className="card border-0 rounded-4 w-100 h-100 text-start"
                                        style={{
                                            backgroundColor: '#E0F2FE',
                                            transition: 'transform 0.2s',
                                            cursor: 'pointer'
                                        }}
                                        onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                                        onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                    >
                                        <div className="card-body p-3 text-center">
                                            <div
                                                className="rounded-circle mx-auto mb-2 d-flex align-items-center justify-content-center"
                                                style={{
                                                    width: 60,
                                                    height: 60,
                                                    backgroundColor: '#0284c7',
                                                    fontSize: '28px'
                                                }}
                                            >
                                                {student.avatar || '👦'}
                                            </div>
                                            <h6 className="fw-bold mb-1">{student.name}</h6>
                                            <small className="text-muted">{student.age} yosh</small>
                                        </div>
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </main>
            </div>
        );
    }

    // Roadmap View
    return (
        <div className="page-content">
            <Header 
                title="O'yinlar"
                breadcrumbs={[
                    { label: 'Asosiy', href: '/dashboard' },
                    { label: "O'yinlar", href: '/dashboard/games' }
                ]}
            />
            <main className="p-3">
                {/* Selected Student Header */}
                <div className="d-flex align-items-center justify-content-between mb-4">
                    <div className="d-flex align-items-center gap-2">
                        <div
                            className="rounded-circle d-flex align-items-center justify-content-center"
                            style={{
                                width: 40,
                                height: 40,
                                backgroundColor: '#0284c7',
                                fontSize: '20px'
                            }}
                        >
                            {selectedStudent?.avatar || '👦'}
                        </div>
                        <div>
                            <h6 className="fw-bold mb-0">{selectedStudent?.name}</h6>
                            <small className="text-muted">{selectedStudent?.age} yosh</small>
                        </div>
                    </div>
                    <button
                        onClick={handleChangeStudent}
                        className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-2"
                    >
                        <Repeat size={18} />
                        Almashtirish
                    </button>
                </div>

                {/* Legend */}
                <div className="card border-0 rounded-3 bg-light mb-4">
                    <div className="card-body p-3">
                        <div className="d-flex flex-wrap gap-3 justify-content-center small">
                            <div className="d-flex align-items-center gap-2">
                                <div style={{ width: 16, height: 16, backgroundColor: '#16a34a', borderRadius: '50%' }}></div>
                                <span>Dars tugallangan (5 ⭐)</span>
                            </div>
                            <div className="d-flex align-items-center gap-2">
                                <div style={{ width: 16, height: 16, backgroundColor: '#22c55e', borderRadius: '50%' }}></div>
                                <span>O'yin yutilgan</span>
                            </div>
                            <div className="d-flex align-items-center gap-2">
                                <div style={{ width: 16, height: 16, backgroundColor: '#e0e0e0', borderRadius: '50%' }}></div>
                                <span>Bajarilmagan</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Snake Roadmap */}
                <div className="roadmap-container px-2">
                    {loadingProgress ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem', borderWidth: '0.3em' }}>
                                <span className="visually-hidden">Yuklanmoqda...</span>
                            </div>
                            <p className="text-muted mt-3 fw-semibold">O'yinlar yuklanmoqda...</p>
                        </div>
                    ) : lessons.length === 0 ? (
                        <div className="text-center py-5">
                            <p className="text-muted">O'yinlar topilmadi</p>
                        </div>
                    ) : (
                        <div className="snake-roadmap">
                            {lessons.map((lesson, index) => {
                                const gameWon = progress.wonGames.includes(lesson._id);
                                const isLeft = index % 2 === 0;
                                const isLast = index === lessons.length - 1;
                                const nextGameWon = !isLast && progress.wonGames.includes(lessons[index + 1]._id);
                                
                                // Keyingi o'ynaladigan o'yin - oxirgi yutilgan o'yindan keyingi birinchi o'yin
                                const isNextToPlay = !gameWon && index > 0 && progress.wonGames.includes(lessons[index - 1]._id);
                                // Yoki birinchi o'yin va hali o'ynalmagan bo'lsa
                                const isFirstUnplayed = index === 0 && !gameWon;
                                const shouldHighlight = isNextToPlay || isFirstUnplayed;

                                return (
                                    <div key={lesson._id} className="snake-step">
                                        {/* Row with card and circle */}
                                        <div
                                            className="d-flex align-items-center"
                                            style={{
                                                flexDirection: isLeft ? 'row' : 'row-reverse'
                                            }}
                                        >
                                            {/* Game Card */}
                                            <div
                                                className={`card border-0 rounded-4 shadow-sm flex-grow-1 ${shouldHighlight ? 'pulse-glow' : ''}`}
                                                style={{
                                                    backgroundColor: gameWon ? '#DCFCE7' : shouldHighlight ? '#FEF3C7' : '#fff',
                                                    maxWidth: 'calc(100% - 100px)',
                                                    border: shouldHighlight ? '2px solid #F59E0B' : 'none',
                                                    boxShadow: shouldHighlight ? '0 4px 20px rgba(245, 158, 11, 0.3)' : undefined
                                                }}
                                            >
                                                <div className="card-body p-3">
                                                    <div className="d-flex align-items-center gap-2 mb-2">
                                                        <span className="badge bg-primary rounded-pill">
                                                            {index + 1}-o'yin
                                                        </span>
                                                        {gameWon && (
                                                            <span className="badge bg-success rounded-pill">
                                                                ✓ Yutilgan
                                                            </span>
                                                        )}
                                                        {shouldHighlight && (
                                                            <span className="badge rounded-pill" style={{ 
                                                                backgroundColor: '#F59E0B', 
                                                                color: 'white',
                                                                animation: 'pulse 2s infinite'
                                                            }}>
                                                                ⭐ Keyingi o'yin
                                                            </span>
                                                        )}
                                                    </div>
                                                    <h6 className="fw-bold mb-1">{lesson.title}</h6>
                                                    <p className="text-muted mb-2 small">
                                                        {lesson.description?.substring(0, 50)}...
                                                    </p>
                                                    {lesson.gameType && lesson.gameType !== 'none' ? (
                                                        <button
                                                            onClick={() => requireSubscription(() => {
                                                                const gameUrl = `/games/${
                                                                    lesson.gameType === 'vocabulary' 
                                                                        ? 'vocabulary/' + lesson._id 
                                                                        : lesson.gameType === 'shopping-basket'
                                                                        ? 'shopping-basket/' + lesson._id
                                                                        : lesson.gameType === 'catch-the-number'
                                                                        ? 'catch-the-number/' + lesson._id
                                                                        : lesson.gameType === 'build-the-body'
                                                                        ? 'build-the-body/' + lesson._id
                                                                        : lesson.gameType === 'drop-to-basket'
                                                                        ? 'drop-to-basket/' + lesson._id
                                                                        : lesson.gameType === 'pop-the-balloon'
                                                                        ? 'pop-the-balloon/' + lesson._id
                                                                        : lesson.gameType
                                                                }?student=${selectedStudent._id}&lesson=${lesson._id}`;
                                                                router.push(gameUrl);
                                                            })}
                                                            className={`btn btn-sm d-inline-flex align-items-center gap-1 ${shouldHighlight ? 'btn-warning' : 'btn-primary'}`}
                                                            style={shouldHighlight ? {
                                                                animation: 'pulse 2s infinite',
                                                                fontWeight: 'bold'
                                                            } : {}}
                                                        >
                                                            <Play size={16} />
                                                            {shouldHighlight ? "Hozir o'ynang!" : "O'ynash"}
                                                        </button>
                                                    ) : (
                                                        <span className="badge bg-secondary">O'yinsiz</span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Horizontal connector line */}
                                            <div
                                                style={{
                                                    width: 20,
                                                    height: 4,
                                                    backgroundColor: gameWon ? '#22c55e' : '#e5e7eb',
                                                    flexShrink: 0
                                                }}
                                            />

                                            {/* YinYang Circle */}
                                            <div style={{ flexShrink: 0 }}>
                                                <YinYangProgress
                                                    lessonCompleted={false}
                                                    gameWon={gameWon}
                                                    size={65}
                                                    index={index}
                                                />
                                            </div>
                                        </div>

                                        {/* Vertical connector to next step (not for last item) */}
                                        {!isLast && (
                                            <div
                                                className="d-flex"
                                                style={{
                                                    justifyContent: isLeft ? 'flex-end' : 'flex-start',
                                                    paddingLeft: isLeft ? 0 : 30,
                                                    paddingRight: isLeft ? 30 : 0
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        width: 4,
                                                        height: 30,
                                                        backgroundColor: gameWon ? '#22c55e' : '#e5e7eb',
                                                        borderRadius: 2,
                                                        transition: 'background-color 0.3s ease'
                                                    }}
                                                />
                                            </div>
                                        )}

                                        {/* Horizontal connector for zigzag (not for last item) */}
                                        {!isLast && (
                                            <div
                                                className="d-flex align-items-center"
                                                style={{
                                                    justifyContent: 'center',
                                                    padding: '0 30px'
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        height: 4,
                                                        flex: 1,
                                                        backgroundColor: gameWon ? '#22c55e' : '#e5e7eb',
                                                        borderRadius: 2,
                                                        transition: 'background-color 0.3s ease'
                                                    }}
                                                />
                                            </div>
                                        )}

                                        {/* Second vertical connector (not for last item) */}
                                        {!isLast && (
                                            <div
                                                className="d-flex"
                                                style={{
                                                    justifyContent: isLeft ? 'flex-start' : 'flex-end',
                                                    paddingLeft: isLeft ? 30 : 0,
                                                    paddingRight: isLeft ? 0 : 30
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        width: 4,
                                                        height: 30,
                                                        backgroundColor: gameWon ? '#22c55e' : '#e5e7eb',
                                                        borderRadius: 2,
                                                        transition: 'background-color 0.3s ease'
                                                    }}
                                                />
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </main>

            <style jsx>{`
                .roadmap-container {
                    padding: 10px 0;
                }
                .snake-roadmap {
                    max-width: 500px;
                    margin: 0 auto;
                }
                .snake-step {
                    margin-bottom: 0;
                }
            `}</style>
        </div>
    );
}
