'use client';

import { useState, useEffect } from 'react';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import Header from '@/components/dashboard/Header';
import AlertModal from '@/components/AlertModal';
import { Star, Gift, ShoppingBag, User, History, X, Check } from 'lucide-react';

export default function RewardsPage() {
    const { rewards, students, refreshStudents, initialLoading } = useData();
    const { getAuthHeader } = useAuth();

    const [selectedStudent, setSelectedStudent] = useState(null);
    const [selectedReward, setSelectedReward] = useState(null);
    const [showBuyModal, setShowBuyModal] = useState(false);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [redemptions, setRedemptions] = useState([]);
    const [processing, setProcessing] = useState(false);
    const [alertModal, setAlertModal] = useState({ show: false, title: '', message: '', type: 'success' });

    useEffect(() => {
        fetchRedemptions();
    }, []);

    const fetchRedemptions = async () => {
        try {
            const res = await fetch('/api/redemptions', {
                headers: getAuthHeader()
            });
            const data = await res.json();
            if (data.success) {
                setRedemptions(data.redemptions || []);
            }
        } catch (error) {
            console.error('Failed to fetch redemptions:', error);
        }
    };

    const handleBuyClick = (reward) => {
        setSelectedReward(reward);
        setSelectedStudent(null);
        setShowBuyModal(true);
    };

    const confirmPurchase = async () => {
        if (!selectedStudent) {
            setAlertModal({
                show: true,
                title: 'O\'quvchi tanlanmagan',
                message: 'Iltimos, o\'quvchini tanlang',
                type: 'error'
            });
            return;
        }

        const student = students.find(s => s._id === selectedStudent);
        
        if (student.stars < selectedReward.cost) {
            setAlertModal({
                show: true,
                title: 'Yulduzlaringiz yetmaydi',
                message: 'Iltimos, darslarni tugallang va ko\'proq yulduz yig\'ing',
                type: 'error'
            });
            return;
        }

        setProcessing(true);
        setShowBuyModal(false);

        try {
            const res = await fetch('/api/rewards/redeem', {
                method: 'POST',
                headers: getAuthHeader(),
                body: JSON.stringify({
                    studentId: selectedStudent,
                    rewardId: selectedReward._id
                })
            });

            const data = await res.json();

            if (data.success) {
                const student = students.find(s => s._id === selectedStudent);
                setAlertModal({
                    show: true,
                    title: 'Muvaffaqiyatli! 🎉',
                    message: `${student.name}ga "${selectedReward.title}" sovg'asi berildi!`,
                    type: 'success'
                });
                refreshStudents();
                fetchRedemptions();
            } else {
                setAlertModal({
                    show: true,
                    title: 'Xatolik',
                    message: data.error || 'Xatolik yuz berdi',
                    type: 'error'
                });
            }
        } catch (error) {
            setAlertModal({
                show: true,
                title: 'Xatolik',
                message: 'Server bilan bog\'lanishda xatolik',
                type: 'error'
            });
        } finally {
            setProcessing(false);
            setSelectedReward(null);
            setSelectedStudent(null);
        }
    };

    return (
        <div className="page-content">
            <Header title="Sovg'alar" />

            <main className="p-3 pb-5">
                {/* Action Buttons */}
                <div className="d-flex gap-2 mb-3">
                    <button
                        onClick={() => setShowHistoryModal(true)}
                        className="btn btn-outline-primary rounded-3 d-flex align-items-center gap-2"
                    >
                        <History size={18} />
                        Tarix
                    </button>
                </div>

                {/* Rewards Grid */}
                {initialLoading ? (
                    <div className="text-center py-5">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Yuklanmoqda...</span>
                        </div>
                    </div>
                ) : rewards.length === 0 ? (
                    <div className="text-center py-5">
                        <Gift size={64} className="text-muted mb-3" />
                        <p className="text-muted">Hozircha sovg'alar yo'q</p>
                    </div>
                ) : (
                    <div className="row g-3">
                        {rewards.map((reward) => {
                            const isOutOfStock = reward.stock === 0;

                            return (
                                <div key={reward._id} className="col-6 col-md-4 col-lg-3">
                                    <div className={`card border-0 rounded-4 shadow-sm h-100 ${isOutOfStock ? 'opacity-50' : ''}`}>
                                        <div className="card-body p-3 d-flex flex-column">
                                            {/* Image */}
                                            <div
                                                className="rounded-3 mb-3 d-flex align-items-center justify-content-center position-relative"
                                                style={{
                                                    aspectRatio: '1',
                                                    backgroundColor: '#f3f4f6'
                                                }}
                                            >
                                                {reward.image ? (
                                                    <img
                                                        src={reward.image}
                                                        alt={reward.title}
                                                        className="w-100 h-100 rounded-3"
                                                        style={{ objectFit: 'contain', padding: '10px' }}
                                                    />
                                                ) : (
                                                    <span style={{ fontSize: '48px' }}>🎁</span>
                                                )}

                                                {/* Stock Badge */}
                                                {reward.stock !== -1 && (
                                                    <span
                                                        className={`position-absolute top-0 end-0 m-2 badge rounded-pill ${reward.stock === 0 ? 'bg-danger' : reward.stock <= 5 ? 'bg-warning' : 'bg-secondary'}`}
                                                        style={{ fontSize: '10px' }}
                                                    >
                                                        {reward.stock === 0 ? 'Tugadi' : `${reward.stock} ta`}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Title */}
                                            <h6 className="fw-bold mb-2" style={{ fontSize: '14px' }}>
                                                {reward.title}
                                            </h6>

                                            {/* Description */}
                                            {reward.description && (
                                                <p className="text-muted small mb-2" style={{ fontSize: '11px' }}>
                                                    {reward.description.substring(0, 50)}...
                                                </p>
                                            )}

                                            {/* Price */}
                                            <div className="d-flex align-items-center gap-1 mb-3 mt-auto">
                                                <Star size={18} fill="#fbbf24" color="#fbbf24" />
                                                <span className="fw-bold">{reward.cost}</span>
                                            </div>

                                            {/* Buy Button */}
                                            <button
                                                onClick={() => handleBuyClick(reward)}
                                                className="btn btn-primary rounded-3 w-100 d-flex align-items-center justify-content-center gap-2"
                                                disabled={isOutOfStock || processing}
                                            >
                                                <ShoppingBag size={16} />
                                                Sotib olish
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>

            {/* Buy Modal - Student Selection */}
            {showBuyModal && selectedReward && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 10000 }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content rounded-4 border-0 shadow-lg">
                            <div className="modal-header border-0 pb-0">
                                <h5 className="modal-title fw-bold">Kim uchun sotib olasiz?</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => {
                                        setShowBuyModal(false);
                                        setSelectedStudent(null);
                                    }}
                                ></button>
                            </div>
                            <div className="modal-body">
                                {/* Reward Info */}
                                <div className="card border rounded-3 mb-3" style={{ backgroundColor: '#f8f9fa' }}>
                                    <div className="card-body p-3 d-flex align-items-center gap-3">
                                        <div
                                            className="rounded-3 flex-shrink-0 d-flex align-items-center justify-content-center"
                                            style={{
                                                width: 60,
                                                height: 60,
                                                backgroundColor: 'white'
                                            }}
                                        >
                                            {selectedReward.image ? (
                                                <img
                                                    src={selectedReward.image}
                                                    alt={selectedReward.title}
                                                    style={{ maxWidth: '80%', maxHeight: '80%', objectFit: 'contain' }}
                                                />
                                            ) : (
                                                <span style={{ fontSize: '32px' }}>🎁</span>
                                            )}
                                        </div>
                                        <div className="flex-grow-1">
                                            <h6 className="fw-bold mb-1">{selectedReward.title}</h6>
                                            <div className="d-flex align-items-center gap-1">
                                                <Star size={16} fill="#fbbf24" color="#fbbf24" />
                                                <span className="fw-bold">{selectedReward.cost}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Student Selection */}
                                <label className="form-label fw-semibold mb-3">O'quvchini tanlang</label>
                                {students.length === 0 ? (
                                    <div className="alert alert-warning rounded-3">
                                        O'quvchilar yo'q. Avval o'quvchi qo'shing.
                                    </div>
                                ) : (
                                    <div className="row g-2">
                                        {students.map((student) => {
                                            const canAfford = student.stars >= selectedReward.cost;
                                            const isSelected = selectedStudent === student._id;
                                            return (
                                                <div key={student._id} className="col-6">
                                                    <button
                                                        onClick={() => setSelectedStudent(student._id)}
                                                        className="card border-0 rounded-3 w-100 h-100 text-start position-relative"
                                                        style={{
                                                            cursor: 'pointer',
                                                            backgroundColor: isSelected ? '#e0f2fe' : '#f8f9fa',
                                                            border: isSelected ? '2px solid #0284c7' : '2px solid transparent',
                                                            transition: 'all 0.2s'
                                                        }}
                                                    >
                                                        <div className="card-body p-3 text-center">
                                                            <div
                                                                className="rounded-circle mx-auto mb-2 d-flex align-items-center justify-content-center"
                                                                style={{
                                                                    width: 50,
                                                                    height: 50,
                                                                    backgroundColor: isSelected ? '#0284c7' : '#667eea',
                                                                    fontSize: '24px'
                                                                }}
                                                            >
                                                                {student.avatar || '👦'}
                                                            </div>
                                                            <h6 className="fw-bold mb-1 small">{student.name}</h6>
                                                            <p className="text-muted mb-2" style={{ fontSize: '11px' }}>{student.age} yosh</p>
                                                            <div className="d-flex align-items-center justify-content-center gap-1">
                                                                <Star size={16} fill="#fbbf24" color="#fbbf24" />
                                                                <span className={`fw-bold small ${canAfford ? 'text-success' : 'text-danger'}`}>
                                                                    {student.stars}
                                                                </span>
                                                            </div>
                                                            {isSelected && (
                                                                <div
                                                                    className="position-absolute top-0 end-0 m-2 bg-primary rounded-circle d-flex align-items-center justify-content-center"
                                                                    style={{ width: 24, height: 24 }}
                                                                >
                                                                    <Check size={16} color="white" />
                                                                </div>
                                                            )}
                                                        </div>
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                            <div className="modal-footer border-0 pt-0">
                                <button
                                    type="button"
                                    className="btn btn-secondary rounded-3"
                                    onClick={() => {
                                        setShowBuyModal(false);
                                        setSelectedStudent(null);
                                    }}
                                >
                                    Bekor qilish
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-primary rounded-3 d-flex align-items-center gap-2"
                                    onClick={confirmPurchase}
                                    disabled={!selectedStudent || processing}
                                >
                                    {processing ? (
                                        <span className="spinner-border spinner-border-sm"></span>
                                    ) : (
                                        <>
                                            <ShoppingBag size={18} />
                                            Sotib olish
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* History Modal */}
            {showHistoryModal && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 10000 }}>
                    <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                        <div className="modal-content rounded-4 border-0 shadow-lg">
                            <div className="modal-header border-0">
                                <h5 className="modal-title fw-bold d-flex align-items-center gap-2">
                                    <History size={20} />
                                    Olingan sovg'alar
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setShowHistoryModal(false)}
                                ></button>
                            </div>
                            <div className="modal-body">
                                {redemptions.length === 0 ? (
                                    <div className="text-center py-5">
                                        <Gift size={48} className="text-muted mb-3" />
                                        <p className="text-muted">Hali sovg'alar olinmagan</p>
                                    </div>
                                ) : (
                                    <div className="d-flex flex-column gap-3">
                                        {redemptions.map((redemption) => (
                                            <div key={redemption._id} className="card border rounded-3">
                                                <div className="card-body p-3">
                                                    <div className="d-flex align-items-start gap-3">
                                                        <div
                                                            className="rounded-3 flex-shrink-0 d-flex align-items-center justify-content-center"
                                                            style={{
                                                                width: 50,
                                                                height: 50,
                                                                backgroundColor: '#f3f4f6'
                                                            }}
                                                        >
                                                            {redemption.reward?.image ? (
                                                                <img
                                                                    src={redemption.reward.image}
                                                                    alt={redemption.reward.title}
                                                                    style={{ maxWidth: '80%', maxHeight: '80%', objectFit: 'contain' }}
                                                                />
                                                            ) : (
                                                                <span style={{ fontSize: '24px' }}>🎁</span>
                                                            )}
                                                        </div>
                                                        <div className="flex-grow-1">
                                                            <h6 className="fw-bold mb-1">{redemption.reward?.title || 'Sovg\'a'}</h6>
                                                            <p className="text-muted small mb-1">
                                                                {redemption.student?.name || 'O\'quvchi'}
                                                            </p>
                                                            <div className="d-flex align-items-center gap-2">
                                                                <span className="badge bg-success rounded-pill d-flex align-items-center gap-1">
                                                                    <Star size={12} fill="white" />
                                                                    {redemption.cost}
                                                                </span>
                                                                <span className="text-muted small">
                                                                    {new Date(redemption.createdAt).toLocaleDateString('uz-UZ')}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Alert Modal */}
            <AlertModal
                show={alertModal.show}
                title={alertModal.title}
                message={alertModal.message}
                type={alertModal.type}
                onClose={() => setAlertModal({ ...alertModal, show: false })}
            />
        </div>
    );
}
