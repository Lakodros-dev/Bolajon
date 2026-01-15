'use client';

import { useMemo } from 'react';
import { useData } from '@/context/DataContext';
import Header from '@/components/dashboard/Header';
import Link from 'next/link';

export default function StatisticsPage() {
    const { statistics, initialLoading } = useData();

    const stats = useMemo(() => statistics?.stats || {
        totalStudents: 0,
        totalStars: 0,
        completedLessons: 0,
        totalLessons: 0,
        averageStars: 0
    }, [statistics]);

    const weeklyData = useMemo(() => statistics?.weeklyData || [], [statistics]);
    const topStudents = useMemo(() => statistics?.topStudents || [], [statistics]);
    const maxValue = useMemo(() => Math.max(...weeklyData.map(d => d.value), 1), [weeklyData]);

    return (
        <div className="page-content">
            <Header title="Reyting va Statistika" />

            <main className="p-3">
                {/* Back button - mobile only */}
                <Link
                    href="/dashboard/students"
                    className="btn btn-light rounded-pill px-3 py-2 mb-3 d-inline-flex d-lg-none align-items-center gap-2"
                >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_back</span>
                    <span className="small fw-semibold">O'quvchilar</span>
                </Link>

                {/* Total Stars Card */}
                <div className="card border-0 rounded-4 mb-4 overflow-hidden position-relative" style={{ background: 'linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%)' }}>
                    <div className="card-body p-4">
                        <div className="position-relative" style={{ zIndex: 1 }}>
                            <span className="badge rounded-3 px-2 py-1 mb-2" style={{ backgroundColor: 'rgba(255,255,255,0.6)', color: '#92400e', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Umumiy ball
                            </span>
                            <div className="d-flex align-items-baseline gap-2">
                                <span className="fw-bold" style={{ fontSize: '2.5rem', color: '#78350f' }}>{initialLoading ? '-' : stats.totalStars.toLocaleString()}</span>
                                <span className="fw-bold" style={{ color: '#b45309' }}>Yulduz</span>
                            </div>
                            <p className="small mt-2 mb-0" style={{ color: '#92400e', maxWidth: '60%' }}>
                                {initialLoading ? '...' : `${stats.totalStudents} ta o'quvchi, ${stats.completedLessons} ta yakunlangan dars`}
                            </p>
                        </div>
                        <div className="position-absolute top-50 end-0 translate-middle-y" style={{ marginRight: '-1rem', opacity: 0.9 }}>
                            <span className="material-symbols-outlined filled" style={{ fontSize: '120px', color: '#fbbf24' }}>star</span>
                        </div>
                    </div>
                </div>

                {initialLoading && (
                    <div className="d-flex justify-content-center py-5">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                )}

                {!initialLoading && (
                    <>
                        {/* Stats Grid */}
                        <div className="row g-3 mb-4">
                            <div className="col-6 col-lg-3">
                                <div className="card border-0 rounded-4 h-100 card-pastel-blue">
                                    <div className="card-body text-center p-3">
                                        <span className="material-symbols-outlined mb-2" style={{ fontSize: '28px', color: '#0284c7' }}>school</span>
                                        <h3 className="h4 fw-bold mb-0">{stats.totalStudents}</h3>
                                        <p className="small text-muted mb-0">O'quvchilar</p>
                                    </div>
                                </div>
                            </div>
                            <div className="col-6 col-lg-3">
                                <div className="card border-0 rounded-4 h-100 card-pastel-green">
                                    <div className="card-body text-center p-3">
                                        <span className="material-symbols-outlined mb-2" style={{ fontSize: '28px', color: '#16a34a' }}>task_alt</span>
                                        <h3 className="h4 fw-bold mb-0">{stats.completedLessons}</h3>
                                        <p className="small text-muted mb-0">Yakunlangan</p>
                                    </div>
                                </div>
                            </div>
                            <div className="col-6 col-lg-3">
                                <div className="card border-0 rounded-4 h-100 card-pastel-purple">
                                    <div className="card-body text-center p-3">
                                        <span className="material-symbols-outlined mb-2" style={{ fontSize: '28px', color: '#9333ea' }}>menu_book</span>
                                        <h3 className="h4 fw-bold mb-0">{stats.totalLessons}</h3>
                                        <p className="small text-muted mb-0">Jami darslar</p>
                                    </div>
                                </div>
                            </div>
                            <div className="col-6 col-lg-3">
                                <div className="card border-0 rounded-4 h-100 card-pastel-yellow">
                                    <div className="card-body text-center p-3">
                                        <span className="material-symbols-outlined filled mb-2" style={{ fontSize: '28px', color: '#d97706' }}>star</span>
                                        <h3 className="h4 fw-bold mb-0">{stats.averageStars}</h3>
                                        <p className="small text-muted mb-0">O'rtacha</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Activity Chart */}
                        {weeklyData.length > 0 && (
                            <div className="mb-4">
                                <h3 className="h6 fw-bold mb-3">Haftalik faollik</h3>
                                <div className="card border-0 rounded-4 shadow-sm">
                                    <div className="card-body p-4">
                                        <div className="d-flex align-items-end justify-content-between gap-2" style={{ height: '140px' }}>
                                            {weeklyData.map((item, index) => (
                                                <div key={index} className="d-flex flex-column align-items-center gap-2 flex-grow-1">
                                                    <span className="small fw-bold text-primary">{item.count}</span>
                                                    <div className="w-100 rounded-top position-relative" style={{ backgroundColor: '#e2e8f0', height: '100px' }}>
                                                        <div
                                                            className="w-100 rounded-top position-absolute bottom-0"
                                                            style={{
                                                                backgroundColor: index === weeklyData.length - 1 ? '#2b8cee' : 'rgba(43, 140, 238, 0.4)',
                                                                height: `${(item.value / maxValue) * 100}%`,
                                                                minHeight: item.value > 0 ? '4px' : '0'
                                                            }}
                                                        />
                                                    </div>
                                                    <span className={`small fw-bold ${index === weeklyData.length - 1 ? 'text-primary' : 'text-muted'}`} style={{ fontSize: '11px' }}>
                                                        {item.day}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Top Students */}
                        {topStudents.length > 0 && (
                            <div className="mb-4">
                                <h3 className="h6 fw-bold mb-3">Top o'quvchilar</h3>
                                <div className="card border-0 rounded-4 shadow-sm">
                                    <div className="card-body p-0">
                                        {topStudents.map((student, index) => (
                                            <div key={index} className={`d-flex align-items-center justify-content-between p-3 ${index < topStudents.length - 1 ? 'border-bottom' : ''}`}>
                                                <div className="d-flex align-items-center gap-3">
                                                    <div className="rounded-circle d-flex align-items-center justify-content-center fw-bold"
                                                        style={{
                                                            width: '32px',
                                                            height: '32px',
                                                            backgroundColor: index === 0 ? '#fef3c7' : index === 1 ? '#e2e8f0' : index === 2 ? '#fed7aa' : '#f1f5f9',
                                                            color: index === 0 ? '#92400e' : index === 1 ? '#475569' : index === 2 ? '#c2410c' : '#64748b'
                                                        }}>
                                                        {index + 1}
                                                    </div>
                                                    <span className="fw-semibold">{student.name}</span>
                                                </div>
                                                <div className="d-flex align-items-center gap-1">
                                                    <span className="material-symbols-outlined filled text-warning" style={{ fontSize: '18px' }}>star</span>
                                                    <span className="fw-bold">{student.stars}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    );
}
