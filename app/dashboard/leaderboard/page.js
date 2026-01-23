'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import Header from '@/components/dashboard/Header';
import Link from 'next/link';
import { ArrowLeft, Search, Trophy } from 'lucide-react';

export default function LeaderboardPage() {
    const { getAuthHeader } = useAuth();
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [searchTimeout, setSearchTimeout] = useState(null);

    const fetchLeaderboard = useCallback(async (searchQuery = '') => {
        try {
            setLoading(true);
            const url = searchQuery
                ? `/api/leaderboard?search=${encodeURIComponent(searchQuery)}`
                : '/api/leaderboard';

            const res = await fetch(url, { headers: getAuthHeader() });
            const data = await res.json();

            if (data.success) {
                setStudents(data.students || []);
            }
        } catch (error) {
            console.error('Failed to fetch leaderboard:', error);
        } finally {
            setLoading(false);
        }
    }, [getAuthHeader]);

    useEffect(() => {
        fetchLeaderboard();
    }, [fetchLeaderboard]);

    // Debounced search
    const handleSearch = (value) => {
        setSearch(value);

        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }

        const timeout = setTimeout(() => {
            fetchLeaderboard(value);
        }, 300);

        setSearchTimeout(timeout);
    };

    const getRankStyle = (rank) => {
        if (rank === 1) return { bg: 'bg-warning', icon: '🥇', color: 'text-warning' };
        if (rank === 2) return { bg: 'bg-secondary', icon: '🥈', color: 'text-secondary' };
        if (rank === 3) return { bg: 'bg-danger', icon: '🥉', color: 'text-danger' };
        return { bg: 'bg-light', icon: rank, color: 'text-muted' };
    };

    return (
        <div className="page-content">
            <Header title="Leaderboard" />

            <main className="p-3">
                {/* Back button - mobile only */}
                <Link
                    href="/dashboard/students"
                    className="btn btn-light rounded-pill px-3 py-2 mb-3 d-inline-flex d-lg-none align-items-center gap-2"
                >
                    <ArrowLeft size={18} />
                    <span className="small fw-semibold">O'quvchilar</span>
                </Link>

                {/* Search */}
                <div className="mb-4">
                    <div className="position-relative">
                        <Search size={20} className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
                        <input
                            type="text"
                            className="form-control rounded-4 py-2 ps-5"
                            placeholder="O'quvchi qidirish..."
                            value={search}
                            onChange={(e) => handleSearch(e.target.value)}
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-5">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                ) : students.length === 0 ? (
                    <div className="text-center py-5">
                        <Trophy size={48} className="text-muted mb-2" />
                        <p className="text-muted mb-0">
                            {search ? "Hech narsa topilmadi" : "Hozircha o'quvchilar yo'q"}
                        </p>
                    </div>
                ) : (
                    <div className="card border-0 shadow-sm rounded-4">
                        <div className="card-body p-0">
                            {students.map((student, index) => {
                                const rankStyle = getRankStyle(student.rank);
                                return (
                                    <div
                                        key={student._id}
                                        className={`d-flex align-items-center gap-3 p-3 ${index !== students.length - 1 ? 'border-bottom' : ''} ${student.isOwn ? 'bg-primary bg-opacity-10' : ''}`}
                                    >
                                        {/* Rank */}
                                        <div
                                            className={`rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 ${rankStyle.bg}`}
                                            style={{ width: '40px', height: '40px' }}
                                        >
                                            {student.rank <= 3 ? (
                                                <span style={{ fontSize: '20px' }}>{rankStyle.icon}</span>
                                            ) : (
                                                <span className="fw-bold text-muted">{student.rank}</span>
                                            )}
                                        </div>

                                        {/* Avatar */}
                                        <div
                                            className="rounded-circle flex-shrink-0"
                                            style={{
                                                width: '48px',
                                                height: '48px',
                                                backgroundImage: `url('https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=random&size=96')`,
                                                backgroundSize: 'cover',
                                                backgroundPosition: 'center'
                                            }}
                                        />

                                        {/* Info */}
                                        <div className="flex-grow-1 overflow-hidden">
                                            <div className="d-flex align-items-center gap-2">
                                                <h6 className="fw-bold mb-0 text-truncate">{student.name}</h6>
                                                {student.isOwn && (
                                                    <span className="badge bg-primary rounded-pill" style={{ fontSize: '10px' }}>
                                                        Sizning
                                                    </span>
                                                )}
                                            </div>
                                            <p className="small text-muted mb-0">
                                                {student.age} yosh • {student.teacher?.name || 'Noma\'lum'}
                                            </p>
                                        </div>

                                        {/* Stars */}
                                        <div className="text-end flex-shrink-0">
                                            <div className="d-flex align-items-center gap-1">
                                                <span className="fw-bold" style={{ fontSize: '18px' }}>{student.stars || 0}</span>
                                                <span style={{ fontSize: '18px' }}>⭐</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
