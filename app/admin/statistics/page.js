'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function AdminStatisticsPage() {
    const { getAuthHeader } = useAuth();
    const [stats, setStats] = useState({
        totalTeachers: 0,
        totalStudents: 0,
        totalLessons: 0,
        totalRewards: 0,
        totalStarsGiven: 0,
        totalRedemptions: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const [teachersRes, lessonsRes, rewardsRes] = await Promise.all([
                fetch('/api/teachers', { headers: getAuthHeader() }),
                fetch('/api/lessons'),
                fetch('/api/rewards')
            ]);

            const teachersData = await teachersRes.json();
            const lessonsData = await lessonsRes.json();
            const rewardsData = await rewardsRes.json();

            const teachers = teachersData.teachers || [];
            const totalStudents = teachers.reduce((sum, t) => sum + (t.studentCount || 0), 0);

            setStats({
                totalTeachers: teachers.length,
                totalStudents,
                totalLessons: lessonsData.lessons?.length || 0,
                totalRewards: rewardsData.rewards?.length || 0,
                totalStarsGiven: 0,
                totalRedemptions: 0
            });
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const statCards = [
        { label: "O'qituvchilar", value: stats.totalTeachers, icon: 'school', color: '#2b8cee', bg: '#dbeafe' },
        { label: "O'quvchilar", value: stats.totalStudents, icon: 'groups', color: '#16a34a', bg: '#dcfce7' },
        { label: 'Darslar', value: stats.totalLessons, icon: 'smart_display', color: '#9333ea', bg: '#f3e8ff' },
        { label: "Sovg'alar", value: stats.totalRewards, icon: 'redeem', color: '#d97706', bg: '#fef3c7' },
    ];

    return (
        <div>
            <div className="mb-4">
                <h1 className="h3 fw-bold mb-1">Statistika</h1>
                <p className="text-muted mb-0">Platforma statistikasi</p>
            </div>

            {loading ? (
                <div className="text-center py-5">
                    <div className="spinner-border text-primary"></div>
                </div>
            ) : (
                <>
                    {/* Overview Cards */}
                    <div className="row g-4 mb-4">
                        {statCards.map((stat, index) => (
                            <div key={index} className="col-md-6 col-lg-3">
                                <div className="card border-0 rounded-4 h-100 shadow-sm" style={{ backgroundColor: stat.bg }}>
                                    <div className="card-body p-4">
                                        <div className="d-flex align-items-center justify-content-between mb-3">
                                            <div className="rounded-3 p-2" style={{ backgroundColor: 'white' }}>
                                                <span className="material-symbols-outlined" style={{ color: stat.color, fontSize: '28px' }}>{stat.icon}</span>
                                            </div>
                                        </div>
                                        <h2 className="h3 fw-bold mb-1" style={{ color: stat.color }}>{stat.value}</h2>
                                        <p className="text-muted mb-0 fw-medium">{stat.label}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Charts Section */}
                    <div className="row g-4">
                        <div className="col-lg-8">
                            <div className="card border-0 rounded-4 shadow-sm">
                                <div className="card-body p-4">
                                    <h3 className="h5 fw-bold mb-4">Haftalik faollik</h3>
                                    <div className="d-flex align-items-end justify-content-between gap-3" style={{ height: '200px' }}>
                                        {['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya'].map((day, index) => {
                                            const height = Math.random() * 80 + 20;
                                            return (
                                                <div key={day} className="d-flex flex-column align-items-center gap-2 flex-grow-1">
                                                    <div
                                                        className="w-100 rounded-top bg-primary"
                                                        style={{ height: `${height}%`, minHeight: '20px', opacity: 0.7 + (index * 0.05) }}
                                                    />
                                                    <span className="small text-muted fw-semibold">{day}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-lg-4">
                            <div className="card border-0 rounded-4 shadow-sm h-100">
                                <div className="card-body p-4">
                                    <h3 className="h5 fw-bold mb-4">Tez statistika</h3>
                                    <div className="d-flex flex-column gap-3">
                                        <div className="d-flex justify-content-between align-items-center p-3 rounded-3" style={{ backgroundColor: '#f6f7f8' }}>
                                            <span className="text-muted">O'rtacha o'quvchi/ustoz</span>
                                            <span className="fw-bold">
                                                {stats.totalTeachers > 0 ? (stats.totalStudents / stats.totalTeachers).toFixed(1) : 0}
                                            </span>
                                        </div>
                                        <div className="d-flex justify-content-between align-items-center p-3 rounded-3" style={{ backgroundColor: '#f6f7f8' }}>
                                            <span className="text-muted">Faol o'qituvchilar</span>
                                            <span className="fw-bold text-success">{stats.totalTeachers}</span>
                                        </div>
                                        <div className="d-flex justify-content-between align-items-center p-3 rounded-3" style={{ backgroundColor: '#f6f7f8' }}>
                                            <span className="text-muted">Jami darslar</span>
                                            <span className="fw-bold text-primary">{stats.totalLessons}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
