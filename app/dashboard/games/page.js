'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/dashboard/Header';
import Link from 'next/link';
import YinYangProgress from '@/components/YinYangProgress';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { useSubscription } from '@/components/SubscriptionModal';

export default function GamesPage() {
    const router = useRouter();
    const { students, lessons: allLessons, initialLoading } = useData();
    const { getAuthHeader } = useAuth();
    const { requireSubscription } = useSubscription();
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [lessons, setLessons] = useState([]);
    const [progress, setProgress] = useState({ completedLessons: [], wonGames: [] });
    const [showStudentModal, setShowStudentModal] = useState(true);

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

    const fetchProgress = async () => {
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
        }
    };

    const handleSelectStudent = (student) => {
        setSelectedStudent(student);
        setShowStudentModal(false);
    };

    const handleChangeStudent = () => {
        setShowStudentModal(true);
        setSelectedStudent(null);
    };

    // Student Selection Modal
    if (showStudentModal) {
        return (
            <div className="page-content">
                <Header title="O'yinlar" />
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
                            <span className="material-symbols-outlined text-muted" style={{ fontSize: '64px' }}>
                                person_off
                            </span>
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
            <Header title="O'yinlar" />
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
                        className="btn btn-outline-secondary btn-sm"
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                            swap_horiz
                        </span>
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
                    {lessons.length === 0 ? (
                        <div className="text-center py-5">
                            <p className="text-muted">Darslar topilmadi</p>
                        </div>
                    ) : (
                        <div className="snake-roadmap">
                            {lessons.map((lesson, index) => {
                                const lessonCompleted = progress.completedLessons.includes(lesson._id);
                                const gameWon = progress.wonGames.includes(lesson._id);
                                const isLeft = index % 2 === 0;
                                const isLast = index === lessons.length - 1;

                                return (
                                    <div key={lesson._id} className="snake-step">
                                        {/* Row with card and circle */}
                                        <div
                                            className="d-flex align-items-center"
                                            style={{
                                                flexDirection: isLeft ? 'row' : 'row-reverse'
                                            }}
                                        >
                                            {/* Lesson Card */}
                                            <div
                                                className="card border-0 rounded-4 shadow-sm flex-grow-1"
                                                style={{
                                                    backgroundColor: lessonCompleted && gameWon ? '#DCFCE7' : '#fff',
                                                    maxWidth: 'calc(100% - 100px)'
                                                }}
                                            >
                                                <div className="card-body p-3">
                                                    <div className="d-flex align-items-center gap-2 mb-2">
                                                        <span className="badge bg-primary rounded-pill">
                                                            {index + 1}-dars
                                                        </span>
                                                        {lessonCompleted && gameWon && (
                                                            <span className="badge bg-success rounded-pill">
                                                                ✓ Tugallangan
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
                                                                        : lesson.gameType
                                                                }?student=${selectedStudent._id}&lesson=${lesson._id}`;
                                                                router.push(gameUrl);
                                                            })}
                                                            className="btn btn-sm btn-primary d-inline-flex align-items-center gap-1"
                                                        >
                                                            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                                                                play_arrow
                                                            </span>
                                                            O'ynash
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
                                                    backgroundColor: lessonCompleted ? '#16a34a' : '#e5e7eb',
                                                    flexShrink: 0
                                                }}
                                            />

                                            {/* YinYang Circle */}
                                            <div style={{ flexShrink: 0 }}>
                                                <YinYangProgress
                                                    lessonCompleted={lessonCompleted}
                                                    gameWon={gameWon}
                                                    size={65}
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
                                                        backgroundColor: lessonCompleted && gameWon ? '#22c55e' : '#e5e7eb',
                                                        borderRadius: 2
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
                                                        backgroundColor: lessonCompleted && gameWon ? '#22c55e' : '#e5e7eb',
                                                        borderRadius: 2
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
                                                        backgroundColor: '#e5e7eb',
                                                        borderRadius: 2
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
