'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { X, Check } from 'lucide-react';

export default function CompleteLessonModal({ show, onClose, student, lesson, onComplete }) {
    const { getAuthHeader } = useAuth();
    const [stars, setStars] = useState(5);
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [hoveredStar, setHoveredStar] = useState(0);

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
                setStars(5);
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

    const getStarMessage = (count) => {
        const messages = {
            1: "Yaxshi harakat! 💪",
            2: "Yaxshi! 👍",
            3: "Juda yaxshi! 😊",
            4: "A'lo natija! 🌟",
            5: "Zo'r! Mukammal! 🎉"
        };
        return messages[count] || "";
    };

    if (!show) return null;

    return (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content rounded-4 border-0 shadow-lg overflow-hidden">
                    {/* Header with gradient */}
                    <div
                        className="px-4 py-3 d-flex align-items-center justify-content-between"
                        style={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        }}
                    >
                        <h5 className="modal-title fw-bold text-white mb-0">Darsni yakunlash</h5>
                        <button
                            type="button"
                            className="btn btn-link p-0 text-white"
                            onClick={onClose}
                            style={{ opacity: 0.8 }}
                        >
                            <X size={24} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="modal-body p-4">
                            {error && (
                                <div className="alert alert-danger rounded-3 small py-2">{error}</div>
                            )}

                            {/* Student Selection */}
                            <div className="mb-4">
                                <label className="form-label small fw-semibold text-muted mb-2">O'quvchini tanlang</label>
                                <div
                                    className="d-flex align-items-center gap-3 p-3 rounded-4"
                                    style={{ backgroundColor: '#f8f9fa', border: '2px solid #e9ecef' }}
                                >
                                    <div
                                        className="rounded-circle flex-shrink-0 d-flex align-items-center justify-content-center fw-bold text-white"
                                        style={{
                                            width: '48px',
                                            height: '48px',
                                            backgroundColor: '#0d6955',
                                            fontSize: '16px'
                                        }}
                                    >
                                        {student?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                    </div>
                                    <div>
                                        <h6 className="fw-bold mb-0">{student?.name}</h6>
                                    </div>
                                </div>
                            </div>

                            {/* Star Rating */}
                            <div className="mb-4">
                                <label className="form-label small fw-semibold text-muted mb-2">Yulduz bering (1-5)</label>
                                <div className="d-flex gap-1 justify-content-center py-3">
                                    {[1, 2, 3, 4, 5].map((value) => (
                                        <button
                                            key={value}
                                            type="button"
                                            onClick={() => setStars(value)}
                                            onMouseEnter={() => setHoveredStar(value)}
                                            onMouseLeave={() => setHoveredStar(0)}
                                            className="btn p-1 border-0 position-relative"
                                            style={{
                                                transition: 'transform 0.15s ease',
                                                transform: (hoveredStar >= value || (!hoveredStar && stars >= value)) ? 'scale(1.1)' : 'scale(1)'
                                            }}
                                        >
                                            <span
                                                style={{
                                                    fontSize: '44px',
                                                    color: (hoveredStar ? hoveredStar >= value : stars >= value) ? '#f59e0b' : '#e2e8f0',
                                                    transition: 'color 0.15s ease',
                                                    display: 'block',
                                                    lineHeight: 1,
                                                }}
                                            >
                                                ★
                                            </span>
                                        </button>
                                    ))}
                                </div>
                                <p className="text-center mb-0" style={{ fontSize: '14px', color: '#6b7280', minHeight: '24px' }}>
                                    {getStarMessage(hoveredStar || stars)}
                                </p>
                            </div>

                            {/* Notes */}
                            <div>
                                <label className="form-label small fw-semibold text-muted mb-2">Izoh (ixtiyoriy)</label>
                                <textarea
                                    className="form-control rounded-3 border-2"
                                    rows="3"
                                    placeholder="Izoh qo'shing..."
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    style={{
                                        resize: 'none',
                                        borderColor: '#e9ecef',
                                        fontSize: '15px'
                                    }}
                                />
                            </div>
                        </div>

                        <div className="px-4 pb-4">
                            <button
                                type="submit"
                                className="btn w-100 py-3 rounded-3 d-flex align-items-center justify-content-center gap-2 fw-bold"
                                disabled={loading}
                                style={{
                                    backgroundColor: '#3b82f6',
                                    color: 'white',
                                    fontSize: '16px',
                                    border: 'none',
                                    transition: 'background-color 0.2s'
                                }}
                                onMouseEnter={(e) => e.target.style.backgroundColor = '#2563eb'}
                                onMouseLeave={(e) => e.target.style.backgroundColor = '#3b82f6'}
                            >
                                {loading ? (
                                    <span className="spinner-border spinner-border-sm"></span>
                                ) : (
                                    <>
                                        <Check size={22} />
                                        Yakunlash (+{stars} yulduz)
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
