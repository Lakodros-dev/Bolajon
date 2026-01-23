'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import Link from 'next/link';
import CompleteLessonModal from '@/components/dashboard/CompleteLessonModal';
import QuickStarsModal from '@/components/dashboard/QuickStarsModal';
import { ArrowLeft, Star, CheckCircle, Plus, PlayCircle, Video, Check, GraduationCap, TrendingUp, Users } from 'lucide-react';

export default function StudentDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { getAuthHeader } = useAuth();
    const { updateStudent } = useData();

    const [student, setStudent] = useState(null);
    const [lessons, setLessons] = useState([]);
    const [progress, setProgress] = useState([]);
    const [loading, setLoading] = useState(true);

    const [showCompleteModal, setShowCompleteModal] = useState(false);
    const [showStarsModal, setShowStarsModal] = useState(false);
    const [selectedLesson, setSelectedLesson] = useState(null);

    useEffect(() => {
        fetchData();
    }, [params.id]);

    const fetchData = async () => {
        try {
            // Fetch student
            const studentRes = await fetch(`/api/students/${params.id}`, {
                headers: getAuthHeader()
            });
            const studentData = await studentRes.json();

            if (studentData.success) {
                setStudent(studentData.student);
            }

            // Fetch progress
            const progressRes = await fetch(`/api/progress/${params.id}`, {
                headers: getAuthHeader()
            });
            const progressData = await progressRes.json();

            if (progressData.success) {
                setProgress(progressData.progress);
            }

            // Fetch all lessons
            const lessonsRes = await fetch('/api/lessons');
            const lessonsData = await lessonsRes.json();

            if (lessonsData.success) {
                setLessons(lessonsData.lessons);
            }
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    const completedLessonIds = progress.map(p => p.lesson?._id || p.lesson);

    const incompleteLessons = lessons.filter(
        lesson => !completedLessonIds.includes(lesson._id)
    );

    const handleCompleteLesson = (lesson) => {
        setSelectedLesson(lesson);
        setShowCompleteModal(true);
    };

    const handleLessonCompleted = (data) => {
        setStudent(data.student);
        setProgress([data.progress, ...progress]);
        // Update in global cache
        updateStudent(data.student._id, { stars: data.student.stars });
    };

    const handleStarsUpdated = (updatedStudent) => {
        setStudent(prev => ({ ...prev, stars: updatedStudent.stars }));
        // Update in global cache
        updateStudent(updatedStudent._id, { stars: updatedStudent.stars });
    };

    if (loading) {
        return (
            <div className="page-content d-flex justify-content-center align-items-center min-vh-100">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    if (!student) {
        return (
            <div className="page-content p-4 text-center">
                <p className="text-muted">O'quvchi topilmadi</p>
                <Link href="/dashboard/students" className="btn btn-primary">Orqaga</Link>
            </div>
        );
    }

    return (
        <div className="page-content">
            {/* Header */}
            <header className="sticky-top bg-white border-bottom py-3 px-3">
                <div className="d-flex align-items-center gap-3">
                    <Link href="/dashboard/students" className="btn btn-light rounded-circle p-2">
                        <ArrowLeft size={20} />
                    </Link>
                    <h1 className="h5 fw-bold mb-0">O'quvchi profili</h1>
                </div>
            </header>

            <main className="p-3">
                {/* Student Card */}
                <div className="card border-0 rounded-4 shadow-sm mb-4 overflow-hidden">
                    <div className="card-body p-4 text-center" style={{ background: 'linear-gradient(135deg, #E0F2FE 0%, #dbeafe 100%)' }}>
                        <div
                            className="rounded-circle mx-auto mb-3 border-4 border-white shadow"
                            style={{
                                width: '80px',
                                height: '80px',
                                backgroundImage: `url('https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=2b8cee&color=fff&size=160')`,
                                backgroundSize: 'cover'
                            }}
                        />
                        <h2 className="h4 fw-bold mb-1">{student.name}</h2>
                        <p className="text-muted mb-3">{student.age} yosh</p>

                        <div className="d-flex justify-content-center gap-2">
                            <div className="px-4 py-2 rounded-pill bg-white shadow-sm d-flex align-items-center gap-2">
                                <Star size={20} fill="#fbbf24" className="text-warning" />
                                <span className="fw-bold">{student.stars}</span>
                                <span className="text-muted small">yulduz</span>
                            </div>
                            <button
                                className="btn btn-primary rounded-pill px-3"
                                onClick={() => setShowStarsModal(true)}
                            >
                                <Plus size={20} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="row g-3 mb-4">
                    <div className="col-4">
                        <div className="card border-0 rounded-4 h-100 card-pastel-green">
                            <div className="card-body text-center p-3">
                                <CheckCircle size={28} style={{ color: '#16a34a' }} className="mb-1" />
                                <h3 className="h5 fw-bold mb-0">{progress.length}</h3>
                                <p className="small text-muted mb-0">Darslar</p>
                            </div>
                        </div>
                    </div>
                    <div className="col-4">
                        <div className="card border-0 rounded-4 h-100 card-pastel-yellow">
                            <div className="card-body text-center p-3">
                                <Star size={28} fill="#d97706" style={{ color: '#d97706' }} className="mb-1" />
                                <h3 className="h5 fw-bold mb-0">{student.stars}</h3>
                                <p className="small text-muted mb-0">Yulduzlar</p>
                            </div>
                        </div>
                    </div>
                    <div className="col-4">
                        <div className="card border-0 rounded-4 h-100 card-pastel-purple">
                            <div className="card-body text-center p-3">
                                <TrendingUp size={28} style={{ color: '#9333ea' }} className="mb-1" />
                                <h3 className="h5 fw-bold mb-0">
                                    {progress.length > 0
                                        ? (progress.reduce((sum, p) => sum + (p.starsEarned || 0), 0) / progress.length).toFixed(1)
                                        : '0'
                                    }
                                </h3>
                                <p className="small text-muted mb-0">O'rtacha</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Incomplete Lessons */}
                {incompleteLessons.length > 0 && (
                    <div className="mb-4">
                        <h3 className="h6 fw-bold mb-3 d-flex align-items-center gap-2">
                            <PlayCircle size={20} className="text-primary" />
                            Bajarilmagan darslar
                        </h3>

                        <div className="d-flex flex-column gap-2">
                            {incompleteLessons.slice(0, 5).map((lesson) => (
                                <div key={lesson._id} className="card border rounded-4">
                                    <div className="card-body p-3 d-flex align-items-center justify-content-between">
                                        <div className="d-flex align-items-center gap-3">
                                            <div className="rounded-3 d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px', backgroundColor: '#dbeafe' }}>
                                                <Video size={20} className="text-primary" />
                                            </div>
                                            <div>
                                                <h4 className="fw-semibold mb-0" style={{ fontSize: '14px' }}>{lesson.title}</h4>
                                                <p className="small text-muted mb-0">{lesson.level}-daraja • {lesson.duration} daq</p>
                                            </div>
                                        </div>
                                        <button
                                            className="btn btn-primary btn-sm rounded-pill px-3"
                                            onClick={() => handleCompleteLesson(lesson)}
                                        >
                                            <Check size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Completed Lessons */}
                <div className="mb-4">
                    <h3 className="h6 fw-bold mb-3 d-flex align-items-center gap-2">
                        <CheckCircle size={20} className="text-success" />
                        Bajarilgan darslar ({progress.length})
                    </h3>

                    {progress.length === 0 ? (
                        <div className="card border rounded-4">
                            <div className="card-body p-4 text-center text-muted">
                                <GraduationCap size={48} style={{ opacity: 0.5 }} className="mb-2" />
                                <p className="mb-0">Hali dars bajarilmagan</p>
                            </div>
                        </div>
                    ) : (
                        <div className="d-flex flex-column gap-2">
                            {progress.map((item) => (
                                <div key={item._id} className="card border rounded-4">
                                    <div className="card-body p-3 d-flex align-items-center justify-content-between">
                                        <div className="d-flex align-items-center gap-3">
                                            <div className="rounded-3 d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px', backgroundColor: '#dcfce7' }}>
                                                <CheckCircle size={20} className="text-success" />
                                            </div>
                                            <div>
                                                <h4 className="fw-semibold mb-0" style={{ fontSize: '14px' }}>
                                                    {item.lesson?.title || 'Dars'}
                                                </h4>
                                                <p className="small text-muted mb-0">
                                                    {new Date(item.completedAt).toLocaleDateString('uz-UZ')}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="d-flex align-items-center gap-1 px-2 py-1 rounded-pill" style={{ backgroundColor: '#fef3c7' }}>
                                            {[...Array(item.starsEarned || 0)].map((_, i) => (
                                                <Star key={i} size={16} fill="#fbbf24" className="text-warning" />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Parent Info */}
                {(student.parentName || student.parentPhone) && (
                    <div className="card border-0 rounded-4 shadow-sm">
                        <div className="card-body p-4">
                            <h3 className="h6 fw-bold mb-3 d-flex align-items-center gap-2">
                                <Users size={20} className="text-primary" />
                                Ota-ona ma'lumotlari
                            </h3>
                            {student.parentName && (
                                <p className="mb-2">
                                    <span className="text-muted">Ism:</span> {student.parentName}
                                </p>
                            )}
                            {student.parentPhone && (
                                <p className="mb-0">
                                    <span className="text-muted">Telefon:</span>{' '}
                                    <a href={`tel:${student.parentPhone}`} className="text-primary">{student.parentPhone}</a>
                                </p>
                            )}
                        </div>
                    </div>
                )}
            </main>

            {/* Modals */}
            <CompleteLessonModal
                show={showCompleteModal}
                onClose={() => setShowCompleteModal(false)}
                student={student}
                lesson={selectedLesson}
                onComplete={handleLessonCompleted}
            />

            <QuickStarsModal
                show={showStarsModal}
                onClose={() => setShowStarsModal(false)}
                student={student}
                onUpdate={handleStarsUpdated}
            />
        </div>
    );
}
