'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useData } from '@/context/DataContext';
import { useSubscription } from '@/components/SubscriptionModal';
import Header from '@/components/dashboard/Header';
import Link from 'next/link';
import { Play, Clock, GraduationCap } from 'lucide-react';

const levelNames = {
    1: "Boshlang'ich",
    2: 'Ranglar va Shakllar',
    3: 'Hayvonlar',
    4: 'Oila',
    5: 'Ilg\'or'
};

const levelColors = {
    1: { bg: '#DCFCE7', color: '#166534' },
    2: { bg: '#F3E8FF', color: '#7c3aed' },
    3: { bg: '#FEF3C7', color: '#92400e' },
    4: { bg: '#DBEAFE', color: '#1e40af' },
    5: { bg: '#FCE7F3', color: '#be185d' }
};

export default function LessonsPage() {
    const router = useRouter();
    const { lessons, dashboard, initialLoading, loadingTimeout } = useData();
    const { requireSubscription } = useSubscription();

    const lessonsByLevel = useMemo(() => {
        return lessons.reduce((acc, lesson) => {
            const level = lesson.level || 1;
            if (!acc[level]) acc[level] = [];
            acc[level].push(lesson);
            return acc;
        }, {});
    }, [lessons]);

    return (
        <div className="page-content">
            <Header 
                showStars={true} 
                stars={dashboard.totalStars}
                breadcrumbs={[
                    { label: 'Asosiy', href: '/dashboard' },
                    { label: 'Darslar', href: '/dashboard/lessons' }
                ]}
            />

            <main className="p-3">
                <h1 className="h4 fw-bold mb-4">
                    Ingliz tilini o'rganishga <br />
                    <span style={{ color: '#2b8cee' }}>tayyormisiz?</span>
                </h1>

                {initialLoading && (
                    <div className="d-flex flex-column align-items-center justify-content-center py-5">
                        <div className="spinner-border text-primary mb-3" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="text-muted small">Darslar yuklanmoqda...</p>
                    </div>
                )}

                <div data-tour="lessons-list">
                    {!initialLoading && Object.keys(lessonsByLevel).sort().map((level, levelIdx) => {
                        const levelNum = parseInt(level);
                        const colors = levelColors[levelNum] || levelColors[1];

                        return (
                            <div key={level} className="mb-4">
                                <div className="d-flex align-items-center gap-2 mb-3">
                                    <div className="rounded-3 d-flex align-items-center justify-content-center fw-bold small"
                                        style={{ width: '32px', height: '32px', backgroundColor: colors.bg, color: colors.color }}>
                                        {String(levelNum).padStart(2, '0')}
                                    </div>
                                    <h2 className="h5 fw-bold mb-0">{levelNames[levelNum] || `${levelNum}-daraja`}</h2>
                                </div>

                                <div className="row g-3">
                                    {lessonsByLevel[level].map((lesson, idx) => (
                                        <div key={lesson._id} className="col-12 col-lg-6">
                                            <div 
                                                onClick={() => requireSubscription(() => router.push(`/dashboard/lessons/${lesson._id}`))}
                                                className="text-decoration-none"
                                                style={{ cursor: 'pointer' }}
                                            >
                                                <div
                                                    data-tour={levelIdx === 0 && idx === 0 ? "lesson-card" : undefined}
                                                    className="card border rounded-4 lesson-card h-100"
                                                >
                                                    <div className="card-body p-3">
                                                        <div className="d-flex gap-3 align-items-center">
                                                            <div
                                                                className="rounded-circle flex-shrink-0 overflow-hidden d-flex align-items-center justify-content-center"
                                                                style={{
                                                                    width: '80px',
                                                                    height: '80px',
                                                                    backgroundColor: colors.bg,
                                                                }}
                                                            >
                                                                {lesson.thumbnail ? (
                                                                    <img
                                                                        src={lesson.thumbnail}
                                                                        alt={lesson.title}
                                                                        style={{
                                                                            width: '100%',
                                                                            height: '100%',
                                                                            objectFit: 'cover'
                                                                        }}
                                                                        onError={(e) => {
                                                                            e.target.style.display = 'none';
                                                                            e.target.nextElementSibling.style.display = 'flex';
                                                                        }}
                                                                    />
                                                                ) : null}
                                                                <div
                                                                    style={{
                                                                        display: lesson.thumbnail ? 'none' : 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                        width: '100%',
                                                                        height: '100%',
                                                                        flexDirection: 'column',
                                                                        gap: '4px'
                                                                    }}
                                                                >
                                                                    <span className="fw-bold" style={{ fontSize: '28px', color: colors.color }}>
                                                                        {idx + 1}
                                                                    </span>
                                                                    <Play size={24} color={colors.color} style={{ opacity: 0.6 }} />
                                                                </div>
                                                            </div>
                                                            <div className="flex-grow-1 min-width-0">
                                                                <div className="d-flex align-items-center gap-2 mb-1">
                                                                    <span className="small text-muted fw-semibold">{idx + 1}-dars</span>
                                                                    <span className="badge rounded-pill ms-auto flex-shrink-0" style={{ backgroundColor: colors.bg, color: colors.color, fontSize: '10px' }}>
                                                                        {levelNames[levelNum] || 'Dars'}
                                                                    </span>
                                                                </div>
                                                                <h3 className="fw-bold mb-1 text-dark text-truncate" style={{ fontSize: '15px' }}>{lesson.title}</h3>
                                                                <p className="small text-muted mb-1 text-truncate" style={{ fontSize: '13px' }}>{lesson.description}</p>
                                                                <div className="d-flex align-items-center gap-1 text-muted" style={{ fontSize: '12px' }}>
                                                                    <Clock size={14} />
                                                                    {lesson.duration || 5} daqiqa
                                                                </div>
                                                            </div>
                                                            <div className="flex-shrink-0">
                                                                <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px', backgroundColor: 'rgba(43, 140, 238, 0.1)' }}>
                                                                    <Play size={20} fill="#2b8cee" className="text-primary" />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {!initialLoading && lessons.length === 0 && (
                    <div className="text-center py-5">
                        <GraduationCap size={64} className="text-muted mb-3" />
                        <p className="text-muted">
                            {loadingTimeout ? 'Darslarni yuklashda xatolik yuz berdi' : 'Hozircha darslar yo\'q'}
                        </p>
                        {loadingTimeout && (
                            <button
                                className="btn btn-primary btn-sm rounded-pill mt-2"
                                onClick={() => window.location.reload()}
                            >
                                Qayta urinish
                            </button>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}
