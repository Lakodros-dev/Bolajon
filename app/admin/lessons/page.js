'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import ConfirmModal from '@/components/ConfirmModal';

export default function AdminLessonsPage() {
    const { getAuthHeader } = useAuth();
    const [lessons, setLessons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleteModal, setDeleteModal] = useState({ show: false, lesson: null });
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        fetchLessons();
    }, []);

    const fetchLessons = async () => {
        try {
            // Use admin endpoint to get ALL lessons (active and inactive)
            const res = await fetch('/api/admin/lessons', {
                headers: getAuthHeader()
            });
            const data = await res.json();
            if (data.success) {
                setLessons(data.lessons || []);
            }
        } catch (error) {
            console.error('Failed to fetch lessons:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (lesson) => {
        try {
            const res = await fetch(`/api/lessons/${lesson._id}`, {
                method: 'PUT',
                headers: getAuthHeader(),
                body: JSON.stringify({ isActive: !lesson.isActive })
            });
            const data = await res.json();
            if (data.success) {
                setLessons(lessons.map(l =>
                    l._id === lesson._id ? { ...l, isActive: !l.isActive } : l
                ));
            }
        } catch (error) {
            console.error('Failed to update lesson:', error);
        }
    };

    const handleDelete = async () => {
        const lesson = deleteModal.lesson;
        if (!lesson) return;

        setDeleting(true);
        try {
            const res = await fetch(`/api/lessons/${lesson._id}`, {
                method: 'DELETE',
                headers: getAuthHeader()
            });
            const data = await res.json();
            if (data.success) {
                setLessons(lessons.filter(l => l._id !== lesson._id));
            }
        } catch (error) {
            console.error('Failed to delete lesson:', error);
        } finally {
            setDeleting(false);
            setDeleteModal({ show: false, lesson: null });
        }
    };

    // Group lessons by level
    const lessonsByLevel = lessons.reduce((acc, lesson) => {
        const level = lesson.level || 1;
        if (!acc[level]) acc[level] = [];
        acc[level].push(lesson);
        return acc;
    }, {});

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h1 className="h3 fw-bold mb-1">Darslar</h1>
                    <p className="text-muted mb-0">{lessons.length} ta dars</p>
                </div>
                <Link href="/admin/lessons/add" className="btn btn-primary rounded-3 d-flex align-items-center gap-2">
                    <span className="material-symbols-outlined">add</span>
                    Yangi dars
                </Link>
            </div>

            {loading ? (
                <div className="text-center py-5">
                    <div className="spinner-border text-primary"></div>
                </div>
            ) : lessons.length === 0 ? (
                <div className="card border-0 rounded-4 shadow-sm">
                    <div className="card-body text-center py-5">
                        <span className="material-symbols-outlined mb-2 text-muted" style={{ fontSize: '48px' }}>smart_display</span>
                        <p className="text-muted mb-3">Hali dars qo'shilmagan</p>
                        <Link href="/admin/lessons/add" className="btn btn-primary rounded-3">
                            Birinchi darsni qo'shish
                        </Link>
                    </div>
                </div>
            ) : (
                Object.entries(lessonsByLevel).sort(([a], [b]) => a - b).map(([level, levelLessons]) => (
                    <div key={level} className="mb-4">
                        <h2 className="h5 fw-bold mb-3 d-flex align-items-center gap-2">
                            <span className="badge bg-primary rounded-pill">{level}</span>
                            {level}-daraja
                        </h2>

                        <div className="card border-0 rounded-4 shadow-sm">
                            <div className="card-body p-0">
                                <div className="table-responsive">
                                    <table className="table table-hover mb-0">
                                        <thead className="bg-light">
                                            <tr>
                                                <th className="border-0 ps-4 py-3">Dars</th>
                                                <th className="border-0 py-3">Video</th>
                                                <th className="border-0 py-3">Davomiylik</th>
                                                <th className="border-0 py-3">Tartib</th>
                                                <th className="border-0 py-3">Holat</th>
                                                <th className="border-0 pe-4 py-3 text-end">Amallar</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {levelLessons.sort((a, b) => (a.order || 0) - (b.order || 0)).map((lesson) => (
                                                <tr key={lesson._id}>
                                                    <td className="ps-4 py-3">
                                                        <div>
                                                            <p className="fw-semibold mb-0">{lesson.title}</p>
                                                            <p className="small text-muted mb-0 text-truncate" style={{ maxWidth: '300px' }}>
                                                                {lesson.description}
                                                            </p>
                                                        </div>
                                                    </td>
                                                    <td className="py-3">
                                                        <a href={lesson.videoUrl} target="_blank" rel="noopener noreferrer" className="text-primary small">
                                                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>play_circle</span>
                                                        </a>
                                                    </td>
                                                    <td className="py-3">{lesson.duration || 0} daq</td>
                                                    <td className="py-3">{lesson.order || 0}</td>
                                                    <td className="py-3">
                                                        <span className={`badge rounded-pill ${lesson.isActive ? 'bg-success' : 'bg-secondary'}`}>
                                                            {lesson.isActive ? 'Faol' : 'Nofaol'}
                                                        </span>
                                                    </td>
                                                    <td className="pe-4 py-3 text-end">
                                                        <div className="d-flex gap-2 justify-content-end">
                                                            <Link
                                                                href={`/admin/lessons/${lesson._id}/edit`}
                                                                className="btn btn-sm btn-outline-primary rounded-2"
                                                            >
                                                                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>edit</span>
                                                            </Link>
                                                            <button
                                                                onClick={() => handleToggleStatus(lesson)}
                                                                className={`btn btn-sm rounded-2 ${lesson.isActive ? 'btn-outline-warning' : 'btn-outline-success'}`}
                                                            >
                                                                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                                                                    {lesson.isActive ? 'visibility_off' : 'visibility'}
                                                                </span>
                                                            </button>
                                                            <button
                                                                onClick={() => setDeleteModal({ show: true, lesson })}
                                                                className="btn btn-sm btn-outline-danger rounded-2"
                                                            >
                                                                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                ))
            )}

            <ConfirmModal
                show={deleteModal.show}
                onClose={() => setDeleteModal({ show: false, lesson: null })}
                onConfirm={handleDelete}
                title="Darsni o'chirish"
                message={`"${deleteModal.lesson?.title}" darsini o'chirmoqchimisiz?`}
                confirmText="O'chirish"
                type="danger"
                loading={deleting}
            />
        </div>
    );
}
