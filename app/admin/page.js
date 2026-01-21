'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function AdminDashboard() {
    const { getAuthHeader } = useAuth();
    const [stats, setStats] = useState({
        teachers: 0,
        students: 0,
        lessons: 0,
        rewards: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            // Fetch counts from APIs
            const [teachersRes, lessonsRes, rewardsRes] = await Promise.all([
                fetch('/api/teachers', { headers: getAuthHeader() }),
                fetch('/api/lessons'),
                fetch('/api/rewards')
            ]);

            const teachersData = await teachersRes.json();
            const lessonsData = await lessonsRes.json();
            const rewardsData = await rewardsRes.json();

            setStats({
                teachers: teachersData.teachers?.length || 0,
                students: 0, // Will be calculated from teachers
                lessons: lessonsData.lessons?.length || 0,
                rewards: rewardsData.rewards?.length || 0
            });
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const statCards = [
        { label: "Foydalanuvchilar", value: stats.teachers, icon: 'group', color: '#2b8cee', bg: '#dbeafe', href: '/admin/users' },
        { label: 'Darslar', value: stats.lessons, icon: 'smart_display', color: '#16a34a', bg: '#dcfce7', href: '/admin/lessons' },
        { label: "Sovg'alar", value: stats.rewards, icon: 'redeem', color: '#9333ea', bg: '#f3e8ff', href: '/admin/rewards' },
        { label: 'Statistika', value: '—', icon: 'analytics', color: '#d97706', bg: '#fef3c7', href: '/admin/statistics' },
    ];

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h1 className="h3 fw-bold mb-1">Admin Dashboard</h1>
                    <p className="text-muted mb-0">Platformani boshqarish paneli</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="row g-4 mb-4">
                {statCards.map((stat, index) => (
                    <div key={index} className="col-md-6 col-lg-3">
                        <Link href={stat.href} className="text-decoration-none">
                            <div className="card border-0 rounded-4 h-100 shadow-sm" style={{ backgroundColor: stat.bg }}>
                                <div className="card-body p-4">
                                    <div className="d-flex align-items-center justify-content-between mb-3">
                                        <div className="rounded-3 p-2" style={{ backgroundColor: 'white' }}>
                                            <span className="material-symbols-outlined" style={{ color: stat.color, fontSize: '28px' }}>{stat.icon}</span>
                                        </div>
                                        <span className="material-symbols-outlined text-muted">arrow_forward</span>
                                    </div>
                                    <h2 className="h3 fw-bold mb-1" style={{ color: stat.color }}>
                                        {loading ? '...' : stat.value}
                                    </h2>
                                    <p className="text-muted mb-0 fw-medium">{stat.label}</p>
                                </div>
                            </div>
                        </Link>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="card border-0 rounded-4 shadow-sm">
                <div className="card-body p-4">
                    <h3 className="h5 fw-bold mb-4">Tezkor harakatlar</h3>
                    <div className="row g-3">
                        <div className="col-md-4">
                            <Link href="/admin/lessons/add" className="btn btn-outline-primary w-100 rounded-3 py-3 d-flex align-items-center justify-content-center gap-2">
                                <span className="material-symbols-outlined">add</span>
                                Yangi dars qo'shish
                            </Link>
                        </div>
                        <div className="col-md-4">
                            <Link href="/admin/rewards/add" className="btn btn-outline-success w-100 rounded-3 py-3 d-flex align-items-center justify-content-center gap-2">
                                <span className="material-symbols-outlined">add</span>
                                Yangi sovg'a qo'shish
                            </Link>
                        </div>
                        <div className="col-md-4">
                            <Link href="/admin/users" className="btn btn-outline-secondary w-100 rounded-3 py-3 d-flex align-items-center justify-content-center gap-2">
                                <span className="material-symbols-outlined">group</span>
                                Foydalanuvchilarni ko'rish
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
