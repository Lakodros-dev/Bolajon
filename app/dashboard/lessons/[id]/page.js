'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import VideoPlayer from '@/components/VideoPlayer';

export default function LessonDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { getAuthHeader } = useAuth();
    const { lessons } = useData();
    const [lesson, setLesson] = useState(null);
    const [students, setStudents] = useState([]);
    const [studentProgress, setStudentProgress] = useState({}); // { studentId: { lessonId: starsEarned } }
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [stars, setStars] = useState(5);
    const [notes, setNotes] = useState('');
    const [completing, setCompleting] = useState(false);
    const [successModal, setSuccessModal] = useState({ show: false, message: '' });
    const [errorModal, setErrorModal] = useState({ show: false, message: '' });

    // Find previous lesson based on level and order
    const previousLesson = useMemo(() => {
        if (!lesson || !lessons.length) return null;

        // Sort lessons by level and order
        const sortedLessons = [...lessons].sort((a, b) => {
            if (a.level !== b.level) return a.level - b.level;
            return (a.order || 0) - (b.order || 0);
        });

        const currentIndex = sortedLessons.findIndex(l => l._id === lesson._id);
        if (currentIndex <= 0) return null; // First lesson, no previous

        return sortedLessons[currentIndex - 1];
    }, [lesson, lessons]);

    useEffect(() => {
        fetchLesson();
        fetchStudents();
    }, [params.id]);

    const fetchLesson = async () => {
        try {
            const res = await fetch(`/api/lessons/${params.id}`);
            
            // Handle subscription expired
            if (res.status === 402) {
                const data = await res.json();
                console.log('Subscription expired:', data.error);
                setLoading(false);
                return;
            }
            
            const data = await res.json();
            if (data.success) {
                setLesson(data.lesson);
            }
        } catch (error) {
            console.error('Failed to fetch lesson:', error);
            // Demo data
            setLesson({
                _id: params.id,
                title: 'Salomlashish!',
                description: "Salomlashish va tanishishni o'rganing.",
                videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                level: 1,
                duration: 5
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchStudents = async () => {
        try {
            const res = await fetch('/api/students', {
                headers: getAuthHeader()
            });
            const data = await res.json();
            if (data.success) {
                const studentList = data.students || [];
                setStudents(studentList);
                // Fetch progress for each student
                await fetchAllStudentProgress(studentList);
            }
        } catch (error) {
            console.error('Failed to fetch students:', error);
            setStudents([
                { _id: '1', name: 'Azizbek', stars: 850 },
                { _id: '2', name: 'Madina', stars: 1240 },
                { _id: '3', name: 'Jasur', stars: 320 },
            ]);
        }
    };

    const fetchAllStudentProgress = async (studentList) => {
        const progressMap = {};
        await Promise.all(
            studentList.map(async (student) => {
                try {
                    const res = await fetch(`/api/progress/${student._id}`, {
                        headers: getAuthHeader()
                    });
                    const data = await res.json();
                    if (data.success && data.progress) {
                        progressMap[student._id] = {};
                        data.progress.forEach(p => {
                            progressMap[student._id][p.lesson?._id || p.lesson] = p.starsEarned;
                        });
                    }
                } catch (error) {
                    console.error(`Failed to fetch progress for student ${student._id}:`, error);
                }
            })
        );
        setStudentProgress(progressMap);
    };

    // Check if a student can access this lesson
    const canStudentAccessLesson = (studentId) => {
        if (!previousLesson) return true; // First lesson is always accessible

        const progress = studentProgress[studentId];
        if (!progress) return false; // No progress data, assume locked

        const prevLessonStars = progress[previousLesson._id];
        return prevLessonStars >= 5; // Previous lesson must have 5 stars
    };

    // Get student's progress for current lesson
    const getStudentLessonProgress = (studentId) => {
        const progress = studentProgress[studentId];
        if (!progress) return null;
        return progress[lesson?._id] || null;
    };

    const handleCompleteLesson = async () => {
        if (!selectedStudent) return;

        setCompleting(true);
        try {
            const res = await fetch('/api/progress', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeader()
                },
                body: JSON.stringify({
                    studentId: selectedStudent._id,
                    lessonId: lesson._id,
                    stars,
                    notes
                })
            });
            const data = await res.json();
            if (data.success) {
                setShowModal(false);
                setSuccessModal({
                    show: true,
                    message: `${selectedStudent.name} uchun dars yakunlandi! +${stars} yulduz`
                });
                setSelectedStudent(null);
                setStars(5);
                setNotes('');
            } else {
                setErrorModal({ show: true, message: data.error || 'Xatolik yuz berdi' });
            }
        } catch (error) {
            console.error('Failed to complete lesson:', error);
            setErrorModal({ show: true, message: 'Xatolik yuz berdi' });
        } finally {
            setCompleting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-vh-100 d-flex align-items-center justify-content-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="page-content">
            {/* Header */}
            <header className="sticky-top bg-white border-bottom py-3 px-3">
                <div className="d-flex align-items-center gap-3">
                    <button onClick={() => router.back()} className="btn btn-light rounded-circle p-2">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <div className="flex-grow-1">
                        <h1 className="h6 fw-bold mb-0">{lesson?.title}</h1>
                        <p className="small text-muted mb-0">{lesson?.duration} daqiqa</p>
                    </div>
                </div>
            </header>

            <main className="p-3">
                {/* Video Player */}
                <div className="card border-0 rounded-4 overflow-hidden mb-4 shadow-sm">
                    <VideoPlayer url={lesson?.videoUrl} title={lesson?.title} />
                </div>

                {/* Lesson Info */}
                <div className="card border-0 rounded-4 shadow-sm mb-4">
                    <div className="card-body p-4">
                        <h2 className="h5 fw-bold mb-2">{lesson?.title}</h2>
                        <p className="text-muted mb-3">{lesson?.description}</p>

                        <div className="d-flex gap-3">
                            <div className="d-flex align-items-center gap-2">
                                <span className="material-symbols-outlined text-primary" style={{ fontSize: '20px' }}>schedule</span>
                                <span className="small">{lesson?.duration} daqiqa</span>
                            </div>
                            <div className="d-flex align-items-center gap-2">
                                <span className="material-symbols-outlined text-success" style={{ fontSize: '20px' }}>signal_cellular_alt</span>
                                <span className="small">{lesson?.level}-daraja</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Complete Lesson Button */}
                <button
                    onClick={() => setShowModal(true)}
                    className="btn btn-primary btn-lg w-100 rounded-4 py-3 fw-bold d-flex align-items-center justify-content-center gap-2"
                >
                    <span className="material-symbols-outlined">check_circle</span>
                    Darsni yakunlash
                </button>
            </main>

            {/* Complete Lesson Modal */}
            {showModal && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content rounded-4 border-0">
                            <div className="modal-header border-0 pb-0">
                                <h5 className="modal-title fw-bold">Darsni yakunlash</h5>
                                <button onClick={() => setShowModal(false)} className="btn-close"></button>
                            </div>
                            <div className="modal-body">
                                {/* Select Student */}
                                <div className="mb-4">
                                    <label className="form-label small fw-semibold">O'quvchini tanlang</label>
                                    <div className="d-flex flex-column gap-2">
                                        {students.map((student) => (
                                            <button
                                                key={student._id}
                                                onClick={() => setSelectedStudent(student)}
                                                className={`btn rounded-3 p-3 d-flex align-items-center gap-3 ${selectedStudent?._id === student._id
                                                    ? 'btn-primary'
                                                    : 'btn-light border'
                                                    }`}
                                            >
                                                <div
                                                    className="rounded-circle"
                                                    style={{
                                                        width: '40px',
                                                        height: '40px',
                                                        backgroundImage: `url('https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=random')`,
                                                        backgroundSize: 'cover'
                                                    }}
                                                />
                                                <span className="fw-semibold">{student.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Star Rating */}
                                <div className="mb-4">
                                    <label className="form-label small fw-semibold">Yulduz bering (1-5)</label>
                                    <div className="d-flex gap-2 justify-content-center">
                                        {[1, 2, 3, 4, 5].map((num) => (
                                            <button
                                                key={num}
                                                onClick={() => setStars(num)}
                                                className="btn p-2"
                                            >
                                                <span
                                                    className={`material-symbols-outlined ${num <= stars ? 'filled' : ''}`}
                                                    style={{ fontSize: '36px', color: num <= stars ? '#fbbf24' : '#cbd5e1' }}
                                                >
                                                    star
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Notes */}
                                <div className="mb-3">
                                    <label className="form-label small fw-semibold">Izoh (ixtiyoriy)</label>
                                    <textarea
                                        className="form-control rounded-3"
                                        rows="2"
                                        placeholder="Izoh qo'shing..."
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="modal-footer border-0 pt-0">
                                <button
                                    onClick={handleCompleteLesson}
                                    disabled={!selectedStudent || completing}
                                    className="btn btn-primary w-100 rounded-3 py-3 fw-bold"
                                >
                                    {completing ? (
                                        <span className="spinner-border spinner-border-sm" role="status"></span>
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined me-2">check</span>
                                            Yakunlash (+{stars} yulduz)
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Success Modal */}
            {successModal.show && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1060 }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content rounded-4 border-0 shadow">
                            <div className="modal-body p-4 text-center">
                                <div className="rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center"
                                    style={{ width: '64px', height: '64px', backgroundColor: '#dcfce7' }}>
                                    <span className="material-symbols-outlined text-success" style={{ fontSize: '32px' }}>check_circle</span>
                                </div>
                                <h5 className="fw-bold mb-2">Muvaffaqiyatli!</h5>
                                <p className="text-muted mb-4">{successModal.message}</p>
                                <button
                                    onClick={() => setSuccessModal({ show: false, message: '' })}
                                    className="btn btn-primary rounded-3 px-5 py-2"
                                >
                                    OK
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Error Modal */}
            {errorModal.show && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1060 }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content rounded-4 border-0 shadow">
                            <div className="modal-body p-4 text-center">
                                <div className="rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center"
                                    style={{ width: '64px', height: '64px', backgroundColor: '#fee2e2' }}>
                                    <span className="material-symbols-outlined text-danger" style={{ fontSize: '32px' }}>error</span>
                                </div>
                                <h5 className="fw-bold mb-2">Xatolik</h5>
                                <p className="text-muted mb-4">{errorModal.message}</p>
                                <button
                                    onClick={() => setErrorModal({ show: false, message: '' })}
                                    className="btn btn-primary rounded-3 px-5 py-2"
                                >
                                    OK
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
