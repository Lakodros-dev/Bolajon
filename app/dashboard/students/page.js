'use client';

import { useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useData } from '@/context/DataContext';
import { useSubscription } from '@/components/SubscriptionModal';
import Header from '@/components/dashboard/Header';
import Link from 'next/link';
import { GraduationCap, Trophy, BarChart3, ArrowRight, ChevronRight, Plus } from 'lucide-react';

const cardColors = [
    { bg: 'student-card-blue', text: 'text-primary', progress: 'bg-primary' },
    { bg: 'student-card-purple', text: 'text-purple', progress: 'bg-purple' },
    { bg: 'student-card-green', text: 'text-success', progress: 'bg-success' },
    { bg: 'student-card-yellow', text: 'text-warning', progress: 'bg-warning' },
];

export default function StudentsPage() {
    const router = useRouter();
    const { students, initialLoading } = useData();
    const { requireSubscription } = useSubscription();
    const tabsRef = useRef(null);

    const tabs = [
        { id: 'students', label: "O'quvchilarim", icon: GraduationCap, href: null },
        { id: 'leaderboard', label: 'Umumiy reyting', icon: Trophy, href: '/dashboard/leaderboard' },
        { id: 'results', label: 'Natijalar', icon: BarChart3, href: '/dashboard/statistics' },
    ];

    const scrollTabs = (direction) => {
        if (tabsRef.current) {
            tabsRef.current.scrollBy({ left: direction * 150, behavior: 'smooth' });
        }
    };

    return (
        <div className="page-content">
            <Header title="O'quvchilar" />

            <main className="p-3">
                {/* Tabs with scroll indicator */}
                <div className="position-relative mb-4">
                    <div
                        ref={tabsRef}
                        className="d-flex gap-2 overflow-auto pb-2"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                        {tabs.map(tab => {
                            const IconComponent = tab.icon;
                            return tab.href ? (
                                <Link
                                    key={tab.id}
                                    href={tab.href}
                                    className="btn btn-light text-muted rounded-pill px-3 py-2 d-flex align-items-center gap-2 flex-shrink-0 text-decoration-none"
                                >
                                    <IconComponent size={18} />
                                    <span className="small fw-semibold">{tab.label}</span>
                                    <ArrowRight size={16} />
                                </Link>
                            ) : (
                                <button
                                    key={tab.id}
                                    className="btn btn-primary rounded-pill px-3 py-2 d-flex align-items-center gap-2 flex-shrink-0"
                                >
                                    <IconComponent size={18} />
                                    <span className="small fw-semibold">{tab.label}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Scroll indicator - fade effect on right */}
                    <div
                        className="position-absolute top-0 end-0 h-100 d-flex align-items-center d-lg-none"
                        style={{
                            background: 'linear-gradient(to left, #f6f7f8 0%, transparent 100%)',
                            width: '40px',
                            pointerEvents: 'none'
                        }}
                    >
                        <ChevronRight size={20} className="text-muted" style={{ marginLeft: 'auto' }} />
                    </div>
                </div>

                {/* Students List */}
                {initialLoading ? (
                    <div className="text-center py-5">
                        <div className="spinner-border text-primary" role="status"></div>
                    </div>
                ) : (
                    <div data-tour="students-list" className="row g-3">
                        {students.map((student, index) => {
                            const colorScheme = cardColors[index % cardColors.length];
                            return (
                                <div key={student._id} className="col-12 col-lg-6">
                                    <Link href={`/dashboard/students/${student._id}`} className="text-decoration-none">
                                        <div
                                            data-tour={index === 0 ? "student-card" : undefined}
                                            className={`card border rounded-4 ${colorScheme.bg} lesson-card h-100`}
                                        >
                                            <div className="card-body p-3">
                                                <div className="d-flex align-items-start justify-content-between mb-3">
                                                    <div className="d-flex gap-3">
                                                        <div
                                                            className="rounded-4 shadow-sm flex-shrink-0"
                                                            style={{
                                                                width: '64px',
                                                                height: '64px',
                                                                backgroundImage: `url('https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=random&size=128')`,
                                                                backgroundSize: 'cover'
                                                            }}
                                                        />
                                                        <div className="pt-1">
                                                            <h3 className="fw-bold mb-1 text-dark" style={{ fontSize: '18px' }}>{student.name}</h3>
                                                            <p className={`small fw-medium mb-0 ${colorScheme.text}`}>{student.age} yosh</p>
                                                        </div>
                                                    </div>
                                                    <ChevronRight size={20} className="text-muted" />
                                                </div>
                                                <div className="d-flex align-items-center justify-content-between mb-2">
                                                    <span className="small text-muted fw-semibold">Yulduzlar</span>
                                                    <span className={`small fw-bold ${colorScheme.text}`}>{student.stars || 0} ⭐</span>
                                                </div>
                                                <div className="progress progress-custom bg-white">
                                                    <div className={`progress-bar ${colorScheme.progress}`} style={{ width: `${Math.min(100, (student.stars || 0) / 10)}%` }}></div>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </div>
                            );
                        })}

                        <div className="col-12 col-lg-6">
                            <div 
                                onClick={() => requireSubscription(() => router.push('/dashboard/students/add'))}
                                data-tour="add-student-btn" 
                                className="text-decoration-none"
                                style={{ cursor: 'pointer' }}
                            >
                                <div className="card border-2 border-dashed rounded-4 h-100" style={{ borderColor: '#cbd5e1', minHeight: '150px' }}>
                                    <div className="card-body p-4 text-center d-flex align-items-center justify-content-center">
                                        <div className="d-flex flex-column align-items-center gap-2">
                                            <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: '48px', height: '48px', backgroundColor: 'rgba(43, 140, 238, 0.1)' }}>
                                                <Plus size={28} className="text-primary" />
                                            </div>
                                            <span className="fw-semibold text-muted">Yangi o'quvchi qo'shish</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {students.length === 0 && (
                            <div className="col-12">
                                <div className="text-center py-4">
                                    <GraduationCap size={48} className="text-muted mb-2" />
                                    <p className="text-muted mb-0">Hozircha o'quvchilar yo'q</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}
