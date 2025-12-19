'use client';

import { useData } from '@/context/DataContext';
import Header from '@/components/dashboard/Header';
import Link from 'next/link';

const quickActions = [
    { icon: 'person_add', label: "O'quvchi qo'shish", href: '/dashboard/students/add', color: '#E0F2FE', iconColor: '#0284c7' },
    { icon: 'play_lesson', label: 'Dars boshlash', href: '/dashboard/lessons', color: '#DCFCE7', iconColor: '#16a34a' },
    { icon: 'star', label: 'Yulduz berish', href: '/dashboard/students', color: '#FEF3C7', iconColor: '#d97706' },
    { icon: 'redeem', label: "Sovg'a berish", href: '/dashboard/rewards', color: '#F3E8FF', iconColor: '#9333ea' },
];

export default function DashboardPage() {
    const { dashboard, initialLoading } = useData();

    return (
        <div className="page-content">
            <Header showStars={true} stars={dashboard.totalStars} />

            <main className="p-3">
                {/* Welcome Banner */}
                <div className="card border-0 rounded-4 mb-4 overflow-hidden" style={{ background: 'linear-gradient(135deg, #2b8cee 0%, #1e40af 100%)' }}>
                    <div className="card-body text-white p-4">
                        <h2 className="h4 fw-bold mb-2">
                            Ingliz tilini o'rgatishga <br />
                            <span style={{ color: '#fde68a' }}>tayyormisiz?</span>
                        </h2>
                        <p className="small opacity-75 mb-3">
                            {initialLoading ? '...' : `Bugun ${dashboard.totalStudents} ta o'quvchingiz sizni kutmoqda`}
                        </p>
                        <Link href="/dashboard/lessons" prefetch={true} className="btn btn-light btn-sm rounded-pill px-4 fw-semibold d-inline-flex align-items-center">
                            <span className="material-symbols-outlined me-1" style={{ fontSize: '18px', lineHeight: 1 }}>play_arrow</span>
                            Darsni boshlash
                        </Link>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="row g-3 mb-4">
                    <div className="col-4">
                        <div className="card border-0 rounded-4 h-100 card-pastel-blue">
                            <div className="card-body text-center p-3">
                                <span className="material-symbols-outlined mb-2" style={{ fontSize: '32px', color: '#0284c7' }}>school</span>
                                <h3 className="h4 fw-bold mb-0">{initialLoading ? '-' : dashboard.totalStudents}</h3>
                                <p className="small text-muted mb-0">O'quvchilar</p>
                            </div>
                        </div>
                    </div>
                    <div className="col-4">
                        <div className="card border-0 rounded-4 h-100 card-pastel-green">
                            <div className="card-body text-center p-3">
                                <span className="material-symbols-outlined mb-2" style={{ fontSize: '32px', color: '#16a34a' }}>task_alt</span>
                                <h3 className="h4 fw-bold mb-0">{initialLoading ? '-' : dashboard.completedLessons}</h3>
                                <p className="small text-muted mb-0">Darslar</p>
                            </div>
                        </div>
                    </div>
                    <div className="col-4">
                        <div className="card border-0 rounded-4 h-100 card-pastel-yellow">
                            <div className="card-body text-center p-3">
                                <span className="material-symbols-outlined filled mb-2" style={{ fontSize: '32px', color: '#d97706' }}>star</span>
                                <h3 className="h4 fw-bold mb-0">{initialLoading ? '-' : dashboard.totalStars}</h3>
                                <p className="small text-muted mb-0">Yulduzlar</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <h3 className="h6 fw-bold mb-3">Tezkor harakatlar</h3>
                <div className="row g-3 mb-4">
                    {quickActions.map((action, index) => (
                        <div key={index} className="col-6 col-lg-3">
                            <Link href={action.href} prefetch={true} className="text-decoration-none">
                                <div className="card border-0 rounded-4 lesson-card h-100" style={{ backgroundColor: action.color }}>
                                    <div className="card-body p-3 d-flex flex-column flex-lg-row align-items-center gap-3">
                                        <div className="rounded-3 p-2" style={{ backgroundColor: 'white' }}>
                                            <span className="material-symbols-outlined" style={{ color: action.iconColor, fontSize: '24px' }}>
                                                {action.icon}
                                            </span>
                                        </div>
                                        <span className="fw-semibold text-dark small text-center text-lg-start">{action.label}</span>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>

                {/* How it works */}
                <div className="card border-0 rounded-4 bg-white">
                    <div className="card-body p-4">
                        <div className="d-flex align-items-center justify-content-between mb-3">
                            <h3 className="h6 fw-bold mb-0">Qanday ishlaydi?</h3>
                            <span className="material-symbols-outlined text-muted">help</span>
                        </div>

                        <div className="d-flex flex-column gap-3">
                            <div className="d-flex align-items-start gap-3 p-3 rounded-4" style={{ backgroundColor: '#E0F2FE' }}>
                                <div className="rounded-3 p-2 bg-white">
                                    <span className="material-symbols-outlined" style={{ color: '#0284c7' }}>smart_display</span>
                                </div>
                                <div>
                                    <h4 className="small fw-bold mb-1">1. Video darsni ko'ring</h4>
                                    <p className="small text-muted mb-0">Interaktiv video darslarni tomosha qiling</p>
                                </div>
                            </div>

                            <div className="d-flex align-items-start gap-3 p-3 rounded-4" style={{ backgroundColor: '#DCFCE7' }}>
                                <div className="rounded-3 p-2 bg-white">
                                    <span className="material-symbols-outlined" style={{ color: '#16a34a' }}>groups</span>
                                </div>
                                <div>
                                    <h4 className="small fw-bold mb-1">2. Bolalarga o'rgating</h4>
                                    <p className="small text-muted mb-0">O'rgangan narsalaringizni bolalarga o'rgating</p>
                                </div>
                            </div>

                            <div className="d-flex align-items-start gap-3 p-3 rounded-4" style={{ backgroundColor: '#FEF3C7' }}>
                                <div className="rounded-3 p-2 bg-white">
                                    <span className="material-symbols-outlined filled" style={{ color: '#d97706' }}>star</span>
                                </div>
                                <div>
                                    <h4 className="small fw-bold mb-1">3. Yulduz bering</h4>
                                    <p className="small text-muted mb-0">Bolalarning yutuqlarini yulduzlar bilan mukofotlang</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
