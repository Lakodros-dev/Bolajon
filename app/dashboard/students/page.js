'use client';

import { useData } from '@/context/DataContext';
import Header from '@/components/dashboard/Header';
import Link from 'next/link';

const cardColors = [
    { bg: 'student-card-blue', text: 'text-primary', progress: 'bg-primary' },
    { bg: 'student-card-purple', text: 'text-purple', progress: 'bg-purple' },
    { bg: 'student-card-green', text: 'text-success', progress: 'bg-success' },
    { bg: 'student-card-yellow', text: 'text-warning', progress: 'bg-warning' },
];

export default function StudentsPage() {
    const { students, initialLoading } = useData();

    return (
        <div className="page-content">
            <Header title="Mening O'quvchilarim" />

            <main className="p-3">
                {initialLoading ? (
                    <div className="text-center py-5">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                ) : (
                    <div className="row g-3">
                        {students.map((student, index) => {
                            const colorScheme = cardColors[index % cardColors.length];
                            return (
                                <div key={student._id} className="col-12 col-lg-6">
                                    <Link href={`/dashboard/students/${student._id}`} className="text-decoration-none">
                                        <div className={`card border rounded-4 ${colorScheme.bg} lesson-card h-100`}>
                                            <div className="card-body p-3">
                                                <div className="d-flex align-items-start justify-content-between mb-3">
                                                    <div className="d-flex gap-3">
                                                        <div
                                                            className="rounded-4 shadow-sm flex-shrink-0"
                                                            style={{
                                                                width: '64px',
                                                                height: '64px',
                                                                backgroundImage: `url('https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=random&size=128')`,
                                                                backgroundSize: 'cover',
                                                                backgroundPosition: 'center'
                                                            }}
                                                        />
                                                        <div className="pt-1">
                                                            <h3 className="fw-bold mb-1 text-dark" style={{ fontSize: '18px' }}>{student.name}</h3>
                                                            <p className={`small fw-medium mb-0 ${colorScheme.text}`}>{student.age} yosh</p>
                                                        </div>
                                                    </div>
                                                    <span className="material-symbols-outlined text-muted" style={{ fontSize: '20px' }}>chevron_right</span>
                                                </div>

                                                <div className="d-flex align-items-center justify-content-between mb-2">
                                                    <span className="small text-muted fw-semibold text-uppercase" style={{ letterSpacing: '0.05em' }}>Yulduzlar</span>
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
                            <Link href="/dashboard/students/add" className="text-decoration-none">
                                <div className="card border-2 border-dashed rounded-4 h-100" style={{ borderColor: '#cbd5e1', minHeight: '150px' }}>
                                    <div className="card-body p-4 text-center d-flex align-items-center justify-content-center">
                                        <div className="d-flex flex-column align-items-center gap-2">
                                            <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: '48px', height: '48px', backgroundColor: 'rgba(43, 140, 238, 0.1)' }}>
                                                <span className="material-symbols-outlined text-primary" style={{ fontSize: '28px' }}>add</span>
                                            </div>
                                            <span className="fw-semibold text-muted">Yangi o'quvchi qo'shish</span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </div>

                        {students.length === 0 && (
                            <div className="col-12">
                                <div className="text-center py-4">
                                    <span className="material-symbols-outlined text-muted mb-2" style={{ fontSize: '48px' }}>school</span>
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
