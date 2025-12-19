'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function CompleteLessonModal({ show, onClose, student, lesson, onComplete }) {
    const { getAuthHeader } = useAuth();
    const [stars, setStars] = useState(3);
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/progress/complete', {
                method: 'POST',
                headers: getAuthHeader(),
                body: JSON.stringify({
                    studentId: student._id,
                    lessonId: lesson._id,
                    stars,
                    notes
                })
            });

            const data = await res.json();

            if (data.success) {
                onComplete(data);
                onClose();
                setStars(3);
                setNotes('');
            } else {
                setError(data.error || 'Failed to complete lesson');
            }
        } catch (err) {
            setError('Failed to complete lesson');
        } finally {
            setLoading(false);
        }
    };

    if (!show) return null;

    return (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content rounded-4 border-0 shadow-lg">
                    <div className="modal-header border-0 pb-0">
                        <h5 className="modal-title fw-bold">Darsni yakunlash</h5>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="modal-body">
                            {error && (
                                <div className="alert alert-danger rounded-3 small">{error}</div>
                            )}

                            {/* Student & Lesson Info */}
                            <div className="d-flex gap-3 p-3 rounded-4 mb-4" style={{ backgroundColor: '#f6f7f8' }}>
                                <div
                                    className="rounded-3 flex-shrink-0"
                                    style={{
                                        width: '48px',
                                        height: '48px',
                                        backgroundImage: `url('https://ui-avatars.com/api/?name=${encodeURIComponent(student?.name || '')}&background=2b8cee&color=fff')`,
                                        backgroundSize: 'cover'
                                    }}
                                />
                                <div>
                                    <h6 className="fw-bold mb-1">{student?.name}</h6>
                                    <p className="small text-muted mb-0">{lesson?.title}</p>
                                </div>
                            </div>

                            {/* Star Rating */}
                            <div className="mb-4">
                                <label className="form-label fw-semibold">Yulduzlar soni</label>
                                <div className="d-flex gap-2 justify-content-center py-3">
                                    {[1, 2, 3, 4, 5].map((value) => (
                                        <button
                                            key={value}
                                            type="button"
                                            onClick={() => setStars(value)}
                                            className="btn p-0 border-0"
                                            style={{ fontSize: '2.5rem', transition: 'transform 0.2s' }}
                                            onMouseEnter={(e) => e.target.style.transform = 'scale(1.2)'}
                                            onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                                        >
                                            <span
                                                className={`material-symbols-outlined ${value <= stars ? 'filled' : ''}`}
                                                style={{
                                                    color: value <= stars ? '#fbbf24' : '#e2e8f0',
                                                    fontSize: '40px'
                                                }}
                                            >
                                                star
                                            </span>
                                        </button>
                                    ))}
                                </div>
                                <p className="text-center text-muted small mb-0">
                                    {stars === 1 && "Yaxshi harakat!"}
                                    {stars === 2 && "Yaxshi!"}
                                    {stars === 3 && "Juda yaxshi!"}
                                    {stars === 4 && "A'lo!"}
                                    {stars === 5 && "Zo'r! Mukammal!"}
                                </p>
                            </div>

                            {/* Notes */}
                            <div className="mb-3">
                                <label className="form-label fw-semibold">Izoh (ixtiyoriy)</label>
                                <textarea
                                    className="form-control rounded-3"
                                    rows="2"
                                    placeholder="O'quvchi haqida izoh..."
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="modal-footer border-0 pt-0">
                            <button type="button" className="btn btn-light rounded-3 px-4" onClick={onClose}>
                                Bekor qilish
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary rounded-3 px-4 d-flex align-items-center gap-2"
                                disabled={loading}
                            >
                                {loading ? (
                                    <span className="spinner-border spinner-border-sm"></span>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined filled" style={{ fontSize: '20px' }}>star</span>
                                        {stars} yulduz berish
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
