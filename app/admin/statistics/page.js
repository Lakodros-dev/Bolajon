'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function AdminStatisticsPage() {
    const { getAuthHeader } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await fetch('/api/admin/statistics', {
                headers: getAuthHeader()
            });
            const result = await res.json();
            if (result.success) {
                setData(result);
            }
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const stats = data?.stats || {};
    const weeklyData = data?.weeklyData || [];
    const topTeachers = data?.topTeachers || [];
    const maxCount = Math.max(...weeklyData.map(d => d.count), 1);

    const statCards = [
        { label: "O'qituvchilar", value: stats.totalTeachers || 0, icon: 'school', color: '#2b8cee', bg: '#dbeafe' },
        { label: "O'quvchilar", value: stats.totalStudents || 0, icon: 'groups', color: '#16a34a', bg: '#dcfce7' },
        { label: 'Faol darslar', value: stats.activeLessons || 0, icon: 'smart_display', color: '#9333ea', bg: '#f3e8ff' },
        { label: 'Jami yulduzlar', value: stats.totalStars || 0, icon: 'star', color: '#d97706', bg: '#fef3c7' },
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
                                        <h2 className="h3 fw-bold mb-1" style={{ color: stat.color }}>
                                            {stat.value.toLocaleString()}
                                        </h2>
                                        <p className="text-muted mb-0 fw-medium">{stat.label}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="row g-4">
                        {/* Weekly Activity Chart */}
                        <div className="col-lg-8">
                            <div className="card border-0 rounded-4 shadow-sm">
                                <div className="card-body p-4">
                                    <h3 className="h5 fw-bold mb-4">Haftalik faollik</h3>
                                    <div className="d-flex align-items-end justify-content-between gap-3" style={{ height: '200px' }}>
                                        {weeklyData.map((item, index) => (
                                            <div key={index} className="d-flex flex-column align-items-center gap-2 flex-grow-1">
                                                <span className="small fw-bold text-primary">{item.count}</span>
                                                <div className="w-100 rounded-top position-relative" style={{ backgroundColor: '#e2e8f0', height: '160px' }}>
                                                    <div
                                                        className="w-100 rounded-top position-absolute bottom-0 bg-primary"
                                                        style={{
                                                            height: `${(item.count / maxCount) * 100}%`,
                                                            minHeight: item.count > 0 ? '8px' : '0',
                                                            opacity: index === weeklyData.length - 1 ? 1 : 0.6
                                                        }}
                                                    />
                                                </div>
                                                <span className={`small fw-semibold ${index === weeklyData.length - 1 ? 'text-primary' : 'text-muted'}`}>
                                                    {item.day}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-muted small mt-3 mb-0 text-center">
                                        Yakunlangan darslar soni (oxirgi 7 kun)
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="col-lg-4">
                            <div className="card border-0 rounded-4 shadow-sm h-100">
                                <div className="card-body p-4">
                                    <h3 className="h5 fw-bold mb-4">Tez statistika</h3>
                                    <div className="d-flex flex-column gap-3">
                                        <div className="d-flex justify-content-between align-items-center p-3 rounded-3" style={{ backgroundColor: '#f6f7f8' }}>
                                            <span className="text-muted">O'rtacha o'quvchi/ustoz</span>
                                            <span className="fw-bold">{stats.averageStudentsPerTeacher || 0}</span>
                                        </div>
                                        <div className="d-flex justify-content-between align-items-center p-3 rounded-3" style={{ backgroundColor: '#f6f7f8' }}>
                                            <span className="text-muted">Jami darslar</span>
                                            <span className="fw-bold text-primary">{stats.totalLessons || 0}</span>
                                        </div>
                                        <div className="d-flex justify-content-between align-items-center p-3 rounded-3" style={{ backgroundColor: '#f6f7f8' }}>
                                            <span className="text-muted">Yakunlangan darslar</span>
                                            <span className="fw-bold text-success">{stats.totalProgress || 0}</span>
                                        </div>
                                        <div className="d-flex justify-content-between align-items-center p-3 rounded-3" style={{ backgroundColor: '#f6f7f8' }}>
                                            <span className="text-muted">Sovg'alar</span>
                                            <span className="fw-bold text-warning">{stats.totalRewards || 0}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Top Teachers */}
                    {topTeachers.length > 0 && (
                        <div className="mt-4">
                            <div className="card border-0 rounded-4 shadow-sm">
                                <div className="card-body p-4">
                                    <h3 className="h5 fw-bold mb-4">Top o'qituvchilar</h3>
                                    <div className="table-responsive">
                                        <table className="table table-hover mb-0">
                                            <thead className="bg-light">
                                                <tr>
                                                    <th className="border-0 py-3">#</th>
                                                    <th className="border-0 py-3">O'qituvchi</th>
                                                    <th className="border-0 py-3 text-center">O'quvchilar</th>
                                                    <th className="border-0 py-3 text-center">Jami yulduzlar</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {topTeachers.map((teacher, index) => (
                                                    <tr key={index}>
                                                        <td className="py-3">
                                                            <span className={`badge rounded-pill ${index === 0 ? 'bg-warning' : index === 1 ? 'bg-secondary' : index === 2 ? 'bg-danger' : 'bg-light text-dark'}`}>
                                                                {index + 1}
                                                            </span>
                                                        </td>
                                                        <td className="py-3 fw-semibold">{teacher.name}</td>
                                                        <td className="py-3 text-center">
                                                            <span className="badge bg-primary rounded-pill">{teacher.studentCount}</span>
                                                        </td>
                                                        <td className="py-3 text-center">
                                                            <span className="d-flex align-items-center justify-content-center gap-1">
                                                                <span className="material-symbols-outlined filled text-warning" style={{ fontSize: '18px' }}>star</span>
                                                                {teacher.totalStars}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
