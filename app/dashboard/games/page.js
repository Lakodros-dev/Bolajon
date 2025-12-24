'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/dashboard/Header';
import Link from 'next/link';
import YinYangProgress from '@/components/YinYangProgress';

export default function GamesPage() {
    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [lessons, setLessons] = useState([]);
    const [progress, setProgress] = useState({ completedLessons: [], wonGames: [] });
    const [loading, setLoading] = useState(true);
    const [showStudentModal, setShowStudentModal] = useState(true);

    // Fetch students
    useEffect(() => {
        fetchStudents();
    }, []);

    // Fetch lessons and progress when student selected
    useEffect(() => {
        if (selectedStudent) {
            fetchLessons();
            fetchProgress();
        }
    }, [selectedStudent]);

    const fetchStudents = async () => {
        try {
            const res = await fetch('/api/students', { credentials: 'include' });
            const data = await res.json();
            if (data.students && data.students.length > 0) {
                setStudents(data.students);
            }
        } catch (error) {
            console.error('Error fetching students:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchLessons = async () => {
        try {
            const res = await fetch('/api/lessons', { credentials: 'include' });
            const data = await res.json();
            if (data.lessons) {
                setLessons(data.lessons.sort((a, b) => a.order - b.order || a.level - b.level));
            }
        } catch (error) {
            console.error('Error fetching lessons:', error);
        }
    };

    const fetchProgress = async () => {
        try {
            const res = await fetch(`/api/game-progress?studentId=${selectedStudent._id}`, { credentials: 'include' });
            const data = await res.json();
            setProgress(data);
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

                    {loading ? (
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

                {/* Roadmap */}
                <div className="roadmap-container">
                    {lessons.length === 0 ? (
                        <div className="text-center py-5">
                            <p className="text-muted">Darslar topilmadi</p>
                        </div>
                    ) : (
                        <div className="position-relative">
                            {/* Connecting Line */}
                            <div
                                className="position-absolute"
                                style={{
                                    left: '50%',
                                    top: 0,
                                    bottom: 0,
                                    width: 4,
                                    backgroundColor: '#e0e0e0',
                                    transform: 'translateX(-50%)',
                                    zIndex: 0
                                }}
                            />

                            {/* Lesson Steps */}
                            {lessons.map((lesson, index) => {
                                const lessonCompleted = progress.completedLessons.includes(lesson._id);
                                const gameWon = progress.wonGames.includes(lesson._id);
                                const isLeft = index % 2 === 0;

                                return (
                                    <div
                                        key={lesson._id}
                                        className="position-relative d-flex align-items-center mb-4"
                                        style={{
                                            flexDirection: isLeft ? 'row' : 'row-reverse'
                                        }}
                                    >
                                        {/* Lesson Info Card */}
                                        <div
                                            className="card border-0 rounded-3 shadow-sm"
                                            style={{
                                                width: 'calc(50% - 50px)',
                                                backgroundColor: lessonCompleted && gameWon ? '#DCFCE7' : '#fff'
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
                                                <h6 className="fw-bold mb-1 small">{lesson.title}</h6>
                                                <p className="text-muted mb-2" style={{ fontSize: '0.75rem' }}>
                                                    {lesson.description?.substring(0, 60)}...
                                                </p>
                                                <Link
                                                    href={`/games/vocabulary/${lesson._id}?student=${selectedStudent._id}`}
                                                    className="btn btn-sm btn-primary"
                                                >
                                                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                                                        play_arrow
                                                    </span>
                                                    O'ynash
                                                </Link>
                                            </div>
                                        </div>

                                        {/* YinYang Progress Indicator */}
                                        <div
                                            className="position-absolute"
                                            style={{
                                                left: '50%',
                                                transform: 'translateX(-50%)',
                                                zIndex: 1
                                            }}
                                        >
                                            <YinYangProgress
                                                lessonCompleted={lessonCompleted}
                                                gameWon={gameWon}
                                                size={70}
                                            />
                                        </div>

                                        {/* Empty space for other side */}
                                        <div style={{ width: 'calc(50% - 50px)' }} />
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </main>

            <style jsx>{`
                .roadmap-container {
                    padding: 20px 0;
                }
                @media (max-width: 576px) {
                    .roadmap-container .card {
                        width: calc(100% - 90px) !important;
                    }
                }
            `}</style>
        </div>
    );
}
