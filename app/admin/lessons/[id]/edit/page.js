'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function EditLessonPage() {
    const router = useRouter();
    const params = useParams();
    const { getAuthHeader } = useAuth();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        videoUrl: '',
        thumbnail: '',
        level: 1,
        duration: 0,
        order: 0
    });

    useEffect(() => {
        fetchLesson();
    }, [params.id]);

    const fetchLesson = async () => {
        try {
            const res = await fetch(`/api/lessons/${params.id}`);
            const data = await res.json();
            if (data.success) {
                setFormData({
                    title: data.lesson.title || '',
                    description: data.lesson.description || '',
                    videoUrl: data.lesson.videoUrl || '',
                    thumbnail: data.lesson.thumbnail || '',
                    level: data.lesson.level || 1,
                    duration: data.lesson.duration || 0,
                    order: data.lesson.order || 0
                });
            }
        } catch (error) {
            console.error('Failed to fetch lesson:', error);
        } finally {
            setFetching(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'number' ? parseInt(value) || 0 : value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch(`/api/lessons/${params.id}`, {
                method: 'PUT',
                headers: getAuthHeader(),
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (data.success) {
                router.push('/admin/lessons');
            } else {
                setError(data.error || "Darsni yangilashda xatolik");
            }
        } catch (err) {
            setError("Darsni yangilashda xatolik");
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="text-center py-5">
                <div className="spinner-border text-primary"></div>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '800px' }}>
            <div className="d-flex align-items-center gap-3 mb-4">
                <Link href="/admin/lessons" className="btn btn-light rounded-circle p-2">
                    <span className="material-symbols-outlined">arrow_back</span>
                </Link>
                <h1 className="h3 fw-bold mb-0">Darsni tahrirlash</h1>
            </div>

            <form onSubmit={handleSubmit}>
                {error && (
                    <div className="alert alert-danger rounded-3 mb-4">{error}</div>
                )}

                <div className="card border-0 rounded-4 shadow-sm mb-4">
                    <div className="card-body p-4">
                        <h3 className="h6 fw-bold mb-4">Asosiy ma'lumotlar</h3>

                        <div className="mb-3">
                            <label className="form-label fw-semibold">Dars nomi *</label>
                            <input
                                type="text"
                                name="title"
                                className="form-control rounded-3 py-2"
                                value={formData.title}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label fw-semibold">Tavsif *</label>
                            <textarea
                                name="description"
                                className="form-control rounded-3"
                                rows="3"
                                value={formData.description}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label fw-semibold">Video URL *</label>
                            <input
                                type="text"
                                name="videoUrl"
                                className="form-control rounded-3 py-2"
                                placeholder="YouTube, Vimeo yoki video fayl havolasi"
                                value={formData.videoUrl}
                                onChange={handleChange}
                                required
                            />
                            <small className="text-muted">Har qanday video havolasini kiriting (YouTube, Vimeo, MP4, va boshqalar)</small>
                        </div>

                        <div className="mb-3">
                            <label className="form-label fw-semibold">Rasm URL</label>
                            <input
                                type="url"
                                name="thumbnail"
                                className="form-control rounded-3 py-2"
                                value={formData.thumbnail}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                </div>

                <div className="card border-0 rounded-4 shadow-sm mb-4">
                    <div className="card-body p-4">
                        <h3 className="h6 fw-bold mb-4">Sozlamalar</h3>

                        <div className="row g-3">
                            <div className="col-md-4">
                                <label className="form-label fw-semibold">Daraja</label>
                                <select
                                    name="level"
                                    className="form-select rounded-3 py-2"
                                    value={formData.level}
                                    onChange={handleChange}
                                >
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(level => (
                                        <option key={level} value={level}>{level}-daraja</option>
                                    ))}
                                </select>
                            </div>

                            <div className="col-md-4">
                                <label className="form-label fw-semibold">Davomiylik (daqiqa)</label>
                                <input
                                    type="number"
                                    name="duration"
                                    className="form-control rounded-3 py-2"
                                    min="0"
                                    value={formData.duration}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="col-md-4">
                                <label className="form-label fw-semibold">Tartib raqami</label>
                                <input
                                    type="number"
                                    name="order"
                                    className="form-control rounded-3 py-2"
                                    min="0"
                                    value={formData.order}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="d-flex gap-3">
                    <Link href="/admin/lessons" className="btn btn-light rounded-3 px-4 py-2">
                        Bekor qilish
                    </Link>
                    <button
                        type="submit"
                        className="btn btn-primary rounded-3 px-4 py-2 d-flex align-items-center gap-2"
                        disabled={loading}
                    >
                        {loading ? (
                            <span className="spinner-border spinner-border-sm"></span>
                        ) : (
                            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>save</span>
                        )}
                        Saqlash
                    </button>
                </div>
            </form>
        </div>
    );
}
