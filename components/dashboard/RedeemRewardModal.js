'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Star, AlertTriangle, CheckCircle, Gift } from 'lucide-react';

export default function RedeemRewardModal({ show, onClose, reward, onRedeem }) {
    const { getAuthHeader } = useAuth();
    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [loading, setLoading] = useState(false);
    const [fetchingStudents, setFetchingStudents] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (show) {
            fetchStudents();
        }
    }, [show]);

    const fetchStudents = async () => {
        setFetchingStudents(true);
        try {
            const res = await fetch('/api/students', {
                headers: getAuthHeader()
            });
            const data = await res.json();
            if (data.success) {
                setStudents(data.students || []);
            }
        } catch (error) {
            console.error('Failed to fetch students:', error);
        } finally {
            setFetchingStudents(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedStudent) {
            setError("O'quvchini tanlang");
            return;
        }

        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/rewards/redeem', {
                method: 'POST',
                headers: getAuthHeader(),
                body: JSON.stringify({
                    studentId: selectedStudent._id,
                    rewardId: reward._id
                })
            });

            const data = await res.json();

            if (data.success) {
                onRedeem(data);
                onClose();
                setSelectedStudent(null);
            } else {
                setError(data.error || 'Failed to redeem reward');
            }
        } catch (err) {
            setError('Failed to redeem reward');
        } finally {
            setLoading(false);
        }
    };

    const eligibleStudents = students.filter(s => (s.stars || 0) >= (reward?.cost || 0));

    if (!show) return null;

    return (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content rounded-4 border-0 shadow-lg">
                    <div className="modal-header border-0 pb-0">
                        <h5 className="modal-title fw-bold">Sovg'a berish</h5>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="modal-body">
                            {error && (
                                <div className="alert alert-danger rounded-3 small">{error}</div>
                            )}

                            {/* Reward Info */}
                            <div className="d-flex gap-3 p-3 rounded-4 mb-4" style={{ backgroundColor: '#f6f7f8' }}>
                                <div
                                    className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
                                    style={{
                                        width: '64px',
                                        height: '64px',
                                        backgroundColor: reward?.bgColor || '#fef3c7'
                                    }}
                                >
                                    {reward?.image ? (
                                        <img src={reward.image} alt={reward.title} style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
                                    ) : (
                                        <span style={{ fontSize: '32px' }}>🎁</span>
                                    )}
                                </div>
                                <div>
                                    <h6 className="fw-bold mb-1">{reward?.title}</h6>
                                    <p className="small text-muted mb-1">{reward?.description}</p>
                                    <div className="d-flex align-items-center gap-1">
                                        <Star size={18} fill="#fbbf24" className="text-warning" />
                                        <span className="fw-bold">{reward?.cost}</span>
                                        <span className="text-muted small">yulduz</span>
                                    </div>
                                </div>
                            </div>

                            {/* Student Selection */}
                            <div className="mb-3">
                                <label className="form-label fw-semibold">O'quvchini tanlang</label>

                                {fetchingStudents ? (
                                    <div className="text-center py-3">
                                        <div className="spinner-border spinner-border-sm text-primary"></div>
                                    </div>
                                ) : eligibleStudents.length === 0 ? (
                                    <div className="alert alert-warning rounded-3 small mb-0 d-flex align-items-center gap-2">
                                        <AlertTriangle size={18} />
                                        Yetarli yulduzga ega o'quvchi yo'q
                                    </div>
                                ) : (
                                    <div className="d-flex flex-column gap-2" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                        {eligibleStudents.map((student) => (
                                            <div
                                                key={student._id}
                                                onClick={() => setSelectedStudent(student)}
                                                className={`d-flex align-items-center gap-3 p-3 rounded-3 cursor-pointer ${selectedStudent?._id === student._id
                                                        ? 'bg-primary bg-opacity-10 border border-primary'
                                                        : 'bg-light border'
                                                    }`}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                <div
                                                    className="rounded-circle flex-shrink-0"
                                                    style={{
                                                        width: '40px',
                                                        height: '40px',
                                                        backgroundImage: `url('https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=2b8cee&color=fff')`,
                                                        backgroundSize: 'cover'
                                                    }}
                                                />
                                                <div className="flex-grow-1">
                                                    <h6 className="fw-semibold mb-0" style={{ fontSize: '14px' }}>{student.name}</h6>
                                                    <p className="small text-muted mb-0">{student.stars || 0} ⭐</p>
                                                </div>
                                                {selectedStudent?._id === student._id && (
                                                    <CheckCircle size={20} className="text-primary" />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Preview */}
                            {selectedStudent && (
                                <div className="p-3 rounded-4 text-center" style={{ backgroundColor: '#dcfce7' }}>
                                    <p className="small mb-1 text-muted">Yangi balans:</p>
                                    <h4 className="fw-bold mb-0 d-flex align-items-center justify-content-center gap-2">
                                        <Star size={24} fill="#fbbf24" className="text-warning" />
                                        {(selectedStudent.stars || 0) - (reward?.cost || 0)}
                                    </h4>
                                </div>
                            )}
                        </div>

                        <div className="modal-footer border-0 pt-0">
                            <button type="button" className="btn btn-light rounded-3 px-4" onClick={onClose}>
                                Bekor qilish
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary rounded-3 px-4 d-flex align-items-center gap-2"
                                disabled={loading || !selectedStudent}
                            >
                                {loading ? (
                                    <span className="spinner-border spinner-border-sm"></span>
                                ) : (
                                    <>
                                        <Gift size={20} />
                                        Sovg'a berish
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
