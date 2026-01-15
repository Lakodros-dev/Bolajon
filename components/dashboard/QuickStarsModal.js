'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function QuickStarsModal({ show, onClose, student, onUpdate }) {
    const { getAuthHeader } = useAuth();
    const [amount, setAmount] = useState(1);
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const quickAmounts = [1, 2, 3, 5, 10];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch(`/api/students/${student._id}/stars`, {
                method: 'POST',
                headers: getAuthHeader(),
                body: JSON.stringify({ amount, reason })
            });

            const data = await res.json();

            if (data.success) {
                onUpdate(data.student);
                onClose();
                setAmount(1);
                setReason('');
            } else {
                setError(data.error || 'Failed to update stars');
            }
        } catch (err) {
            setError('Failed to update stars');
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
                        <h5 className="modal-title fw-bold">Yulduz berish</h5>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="modal-body">
                            {error && (
                                <div className="alert alert-danger rounded-3 small">{error}</div>
                            )}

                            {/* Student Info */}
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
                                    <p className="small mb-0 d-flex align-items-center gap-1">
                                        <span className="material-symbols-outlined filled text-warning" style={{ fontSize: '16px' }}>star</span>
                                        <span className="fw-semibold">{student?.stars || 0}</span>
                                        <span className="text-muted">yulduz</span>
                                    </p>
                                </div>
                            </div>

                            {/* Quick Amount Buttons */}
                            <div className="mb-3">
                                <label className="form-label fw-semibold">Yulduzlar soni</label>
                                <div className="d-flex gap-2 flex-wrap">
                                    {quickAmounts.map((value) => (
                                        <button
                                            key={value}
                                            type="button"
                                            onClick={() => setAmount(value)}
                                            className={`btn rounded-pill px-3 py-2 ${amount === value ? 'btn-primary' : 'btn-outline-secondary'
                                                }`}
                                        >
                                            +{value} ⭐
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Custom Amount */}
                            <div className="mb-3">
                                <label className="form-label fw-semibold">Yoki o'zingiz kiriting</label>
                                <div className="input-group">
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary"
                                        onClick={() => setAmount(Math.max(-100, amount - 1))}
                                    >
                                        <span className="material-symbols-outlined">remove</span>
                                    </button>
                                    <input
                                        type="number"
                                        className="form-control text-center fw-bold"
                                        value={amount}
                                        onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
                                        min="-100"
                                        max="100"
                                    />
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary"
                                        onClick={() => setAmount(Math.min(100, amount + 1))}
                                    >
                                        <span className="material-symbols-outlined">add</span>
                                    </button>
                                </div>
                                {amount < 0 && (
                                    <small className="text-danger">Yulduzlar ayiriladi</small>
                                )}
                            </div>

                            {/* Reason */}
                            <div className="mb-3">
                                <label className="form-label fw-semibold">Sabab (ixtiyoriy)</label>
                                <input
                                    type="text"
                                    className="form-control rounded-3"
                                    placeholder="Masalan: Uy vazifasi uchun"
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                />
                            </div>

                            {/* Preview */}
                            <div className="p-3 rounded-4 text-center" style={{ backgroundColor: amount >= 0 ? '#dcfce7' : '#fee2e2' }}>
                                <p className="small mb-1 text-muted">Yangi balans:</p>
                                <h4 className="fw-bold mb-0 d-flex align-items-center justify-content-center gap-2">
                                    <span className="material-symbols-outlined filled text-warning">star</span>
                                    {Math.max(0, (student?.stars || 0) + amount)}
                                </h4>
                            </div>
                        </div>

                        <div className="modal-footer border-0 pt-0">
                            <button type="button" className="btn btn-light rounded-3 px-4" onClick={onClose}>
                                Bekor qilish
                            </button>
                            <button
                                type="submit"
                                className={`btn rounded-3 px-4 d-flex align-items-center gap-2 ${amount >= 0 ? 'btn-primary' : 'btn-danger'
                                    }`}
                                disabled={loading || amount === 0}
                            >
                                {loading ? (
                                    <span className="spinner-border spinner-border-sm"></span>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                                            {amount >= 0 ? 'add' : 'remove'}
                                        </span>
                                        {amount >= 0 ? `+${amount} yulduz` : `${amount} yulduz`}
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
