'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useSubscription } from '@/components/SubscriptionModal';
import Header from '@/components/dashboard/Header';
import AlertModal from '@/components/AlertModal';
import ConfirmModal from '@/components/ConfirmModal';

export default function ProfilePage() {
    const { user, logout, getAuthHeader } = useAuth();
    const { daysRemaining, checkSubscription } = useSubscription();
    const [saving, setSaving] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [showTopUpModal, setShowTopUpModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [alertModal, setAlertModal] = useState({ show: false, title: '', message: '', type: 'success' });
    const [balance, setBalance] = useState(0);
    const [topUpAmount, setTopUpAmount] = useState(10000);
    const [paymentInfo, setPaymentInfo] = useState(null);
    const [copied, setCopied] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    useEffect(() => {
        fetchUserData();
        fetchPaymentInfo();
    }, []);

    const fetchUserData = async () => {
        try {
            const res = await fetch('/api/auth/me', {
                headers: getAuthHeader()
            });
            const data = await res.json();
            if (data.success && data.user) {
                setBalance(data.user.balance || 0);
            }
        } catch (error) {
            console.error('Failed to fetch user data:', error);
        }
    };

    const fetchPaymentInfo = async () => {
        try {
            const res = await fetch('/api/settings');
            const data = await res.json();
            if (data.success) {
                setPaymentInfo({
                    adminPhone: data.adminPhone,
                    cardNumber: data.cardNumber,
                    cardHolder: data.cardHolder
                });
            }
        } catch (error) {
            console.error('Failed to fetch payment info:', error);
        }
    };

    const copyCardNumber = () => {
        if (paymentInfo?.cardNumber) {
            navigator.clipboard.writeText(paymentInfo.cardNumber.replace(/\s/g, ''));
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();

        if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
            setAlertModal({
                show: true,
                title: 'Xatolik',
                message: 'Yangi parollar mos kelmaydi',
                type: 'danger'
            });
            return;
        }

        setSaving(true);
        try {
            const res = await fetch('/api/auth/update-profile', {
                method: 'PUT',
                headers: getAuthHeader(),
                body: JSON.stringify({
                    name: formData.name,
                    currentPassword: formData.currentPassword || undefined,
                    newPassword: formData.newPassword || undefined
                })
            });
            const data = await res.json();

            if (data.success) {
                setAlertModal({
                    show: true,
                    title: 'Muvaffaqiyatli',
                    message: 'Profil yangilandi',
                    type: 'success'
                });
                setFormData(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
                setShowEditModal(false);
                // Update localStorage
                const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
                storedUser.name = formData.name;
                localStorage.setItem('user', JSON.stringify(storedUser));
            } else {
                setAlertModal({
                    show: true,
                    title: 'Xatolik',
                    message: data.error || 'Profilni yangilashda xatolik',
                    type: 'danger'
                });
            }
        } catch (error) {
            console.error('Failed to update profile:', error);
            setAlertModal({
                show: true,
                title: 'Xatolik',
                message: 'Profilni yangilashda xatolik',
                type: 'danger'
            });
        } finally {
            setSaving(false);
        }
    };

    const quickAmounts = [5000, 10000, 20000, 50000, 100000];

    return (
        <div className="page-content">
            <Header title="Profil" />

            <main className="p-3 pb-5">
                {/* Profile Card with Gradient */}
                <div className="card border-0 rounded-4 shadow-sm mb-3 overflow-hidden">
                    <div 
                        className="position-relative"
                        style={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            padding: '24px 20px 80px'
                        }}
                    >
                        {/* Avatar & Name */}
                        <div className="text-center text-white mb-3">
                            <div
                                className="rounded-circle border border-3 border-white mx-auto mb-3 shadow-lg"
                                style={{
                                    width: '80px',
                                    height: '80px',
                                    backgroundImage: `url('https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=fff&color=667eea&size=160&bold=true')`,
                                    backgroundSize: 'cover'
                                }}
                            />
                            <h5 className="fw-bold mb-1">{user?.name}</h5>
                            <p className="mb-0 opacity-75 small">{user?.phone}</p>
                        </div>
                    </div>

                    {/* Stats Cards - Overlapping */}
                    <div 
                        className="px-3"
                        style={{ marginTop: '-60px', position: 'relative', zIndex: 1 }}
                    >
                        <div className="row g-2 mb-3">
                            <div className="col-6">
                                <div className="card border shadow-sm rounded-3 h-100" style={{ backgroundColor: '#fff' }}>
                                    <div className="card-body p-3 text-center">
                                        <div className="d-flex align-items-center justify-content-center mb-2">
                                            <span className="material-symbols-outlined text-success" style={{ fontSize: '24px' }}>
                                                account_balance_wallet
                                            </span>
                                        </div>
                                        <p className="small text-muted mb-1">Balans</p>
                                        <h5 className="fw-bold mb-0 text-success">{balance.toLocaleString()}</h5>
                                        <small className="text-muted">so'm</small>
                                    </div>
                                </div>
                            </div>
                            <div className="col-6">
                                <div className="card border shadow-sm rounded-3 h-100" style={{ backgroundColor: '#fff' }}>
                                    <div className="card-body p-3 text-center">
                                        <div className="d-flex align-items-center justify-content-center mb-2">
                                            <span className="material-symbols-outlined text-primary" style={{ fontSize: '24px' }}>
                                                event_available
                                            </span>
                                        </div>
                                        <p className="small text-muted mb-1">Obuna</p>
                                        <h5 className="fw-bold mb-0 text-primary">{daysRemaining}</h5>
                                        <small className="text-muted">kun</small>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Button */}
                        <button
                            onClick={() => setShowTopUpModal(true)}
                            className="btn btn-primary rounded-3 w-100 py-3 fw-semibold d-flex align-items-center justify-content-center gap-2 shadow-sm"
                        >
                            <span className="material-symbols-outlined">add_card</span>
                            Balansni to'ldirish
                        </button>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="row g-2 mb-3">
                    <div className="col-6">
                        <button
                            onClick={() => {
                                setFormData({
                                    name: user?.name || '',
                                    currentPassword: '',
                                    newPassword: '',
                                    confirmPassword: ''
                                });
                                setShowEditModal(true);
                            }}
                            className="card border shadow-sm rounded-3 w-100 text-start"
                            style={{ cursor: 'pointer', transition: 'transform 0.2s', backgroundColor: '#fff' }}
                            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            <div className="card-body p-3">
                                <div className="d-flex align-items-center gap-3">
                                    <div 
                                        className="rounded-3 d-flex align-items-center justify-content-center"
                                        style={{
                                            width: '48px',
                                            height: '48px',
                                            backgroundColor: '#e0f2fe'
                                        }}
                                    >
                                        <span className="material-symbols-outlined text-primary" style={{ fontSize: '24px' }}>
                                            edit
                                        </span>
                                    </div>
                                    <div>
                                        <p className="fw-semibold mb-0 small">Tahrirlash</p>
                                        <p className="text-muted mb-0" style={{ fontSize: '11px' }}>Profil ma'lumotlari</p>
                                    </div>
                                </div>
                            </div>
                        </button>
                    </div>
                    <div className="col-6">
                        <button
                            onClick={() => setShowLogoutModal(true)}
                            className="card border shadow-sm rounded-3 w-100 text-start"
                            style={{ cursor: 'pointer', transition: 'transform 0.2s', backgroundColor: '#fff' }}
                            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            <div className="card-body p-3">
                                <div className="d-flex align-items-center gap-3">
                                    <div 
                                        className="rounded-3 d-flex align-items-center justify-content-center"
                                        style={{
                                            width: '48px',
                                            height: '48px',
                                            backgroundColor: '#fee2e2'
                                        }}
                                    >
                                        <span className="material-symbols-outlined text-danger" style={{ fontSize: '24px' }}>
                                            logout
                                        </span>
                                    </div>
                                    <div>
                                        <p className="fw-semibold mb-0 small">Chiqish</p>
                                        <p className="text-muted mb-0" style={{ fontSize: '11px' }}>Tizimdan chiqish</p>
                                    </div>
                                </div>
                            </div>
                        </button>
                    </div>
                </div>

                {/* Info Cards */}
                <div className="card border shadow-sm rounded-3 mb-3" style={{ backgroundColor: '#fff' }}>
                    <div className="card-body p-0">
                        <div className="p-3 border-bottom">
                            <div className="d-flex align-items-center gap-3">
                                <div 
                                    className="rounded-3 d-flex align-items-center justify-content-center"
                                    style={{
                                        width: '40px',
                                        height: '40px',
                                        backgroundColor: '#f3f4f6'
                                    }}
                                >
                                    <span className="material-symbols-outlined text-secondary" style={{ fontSize: '20px' }}>
                                        person
                                    </span>
                                </div>
                                <div className="flex-grow-1">
                                    <p className="text-muted mb-0 small">Ism</p>
                                    <p className="fw-semibold mb-0">{user?.name}</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-3 border-bottom">
                            <div className="d-flex align-items-center gap-3">
                                <div 
                                    className="rounded-3 d-flex align-items-center justify-content-center"
                                    style={{
                                        width: '40px',
                                        height: '40px',
                                        backgroundColor: '#f3f4f6'
                                    }}
                                >
                                    <span className="material-symbols-outlined text-secondary" style={{ fontSize: '20px' }}>
                                        phone
                                    </span>
                                </div>
                                <div className="flex-grow-1">
                                    <p className="text-muted mb-0 small">Telefon</p>
                                    <p className="fw-semibold mb-0">{user?.phone}</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-3">
                            <div className="d-flex align-items-center gap-3">
                                <div 
                                    className="rounded-3 d-flex align-items-center justify-content-center"
                                    style={{
                                        width: '40px',
                                        height: '40px',
                                        backgroundColor: '#f3f4f6'
                                    }}
                                >
                                    <span className="material-symbols-outlined text-secondary" style={{ fontSize: '20px' }}>
                                        badge
                                    </span>
                                </div>
                                <div className="flex-grow-1">
                                    <p className="text-muted mb-0 small">Rol</p>
                                    <p className="fw-semibold mb-0">
                                        {user?.role === 'admin' ? 'Administrator' : 'O\'qituvchi'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Edit Profile Modal */}
            {showEditModal && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 10000 }}>
                    <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                        <div className="modal-content rounded-4 border-0">
                            <div className="modal-header border-0 pb-0">
                                <h5 className="modal-title fw-bold d-flex align-items-center gap-2">
                                    <span className="material-symbols-outlined text-primary">edit</span>
                                    Profilni tahrirlash
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setShowEditModal(false)}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <form onSubmit={handleUpdateProfile}>
                                    <div className="mb-3">
                                        <label className="form-label small fw-semibold">Ism</label>
                                        <input
                                            type="text"
                                            className="form-control rounded-3 border"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <hr className="my-3" />

                                    <h6 className="fw-bold mb-3 small">Parolni o'zgartirish</h6>

                                    <div className="mb-3">
                                        <label className="form-label small">Joriy parol</label>
                                        <input
                                            type="password"
                                            className="form-control rounded-3 border"
                                            value={formData.currentPassword}
                                            onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                                            placeholder="Parolni o'zgartirish uchun kiriting"
                                        />
                                    </div>

                                    <div className="row g-3 mb-4">
                                        <div className="col-6">
                                            <label className="form-label small">Yangi parol</label>
                                            <input
                                                type="password"
                                                className="form-control rounded-3 border"
                                                value={formData.newPassword}
                                                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                                            />
                                        </div>
                                        <div className="col-6">
                                            <label className="form-label small">Tasdiqlash</label>
                                            <input
                                                type="password"
                                                className="form-control rounded-3 border"
                                                value={formData.confirmPassword}
                                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        className="btn btn-primary rounded-3 w-100 py-2 fw-semibold"
                                        disabled={saving}
                                    >
                                        {saving ? (
                                            <span className="spinner-border spinner-border-sm me-2"></span>
                                        ) : (
                                            <span className="material-symbols-outlined me-2" style={{ fontSize: '18px' }}>save</span>
                                        )}
                                        Saqlash
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Top Up Modal */}
            {showTopUpModal && paymentInfo && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 10000 }}>
                    <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                        <div className="modal-content rounded-4 border-0">
                            <div className="modal-header border-0 pb-0">
                                <h5 className="modal-title fw-bold d-flex align-items-center gap-2">
                                    <span className="material-symbols-outlined text-success">account_balance_wallet</span>
                                    Balansni to'ldirish
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setShowTopUpModal(false)}
                                ></button>
                            </div>
                            <div className="modal-body">
                                {/* Current Balance */}
                                <div className="bg-light rounded-3 p-3 mb-4 text-center">
                                    <p className="small text-muted mb-1">Joriy balans</p>
                                    <h3 className="fw-bold text-success mb-0">{balance.toLocaleString()} so'm</h3>
                                </div>

                                {/* Amount Input */}
                                <div className="mb-3">
                                    <label className="form-label small fw-semibold">To'ldirish summasi</label>
                                    <div className="input-group input-group-lg">
                                        <input
                                            type="number"
                                            className="form-control border text-center fw-bold"
                                            value={topUpAmount}
                                            onChange={(e) => setTopUpAmount(Math.max(1000, parseInt(e.target.value) || 1000))}
                                            min={1000}
                                            step={1000}
                                        />
                                        <span className="input-group-text border">so'm</span>
                                    </div>
                                </div>

                                {/* Quick Amounts */}
                                <p className="small text-muted mb-2">Tezkor tanlash:</p>
                                <div className="d-flex flex-wrap gap-2 mb-4">
                                    {quickAmounts.map(amount => (
                                        <button
                                            key={amount}
                                            onClick={() => setTopUpAmount(amount)}
                                            className={`btn btn-sm rounded-pill px-3 ${topUpAmount === amount ? 'btn-success' : 'btn-outline-secondary'}`}
                                        >
                                            {(amount / 1000).toLocaleString()} ming
                                        </button>
                                    ))}
                                </div>

                                {/* Payment Info */}
                                <div className="bg-light rounded-3 p-3 mb-3">
                                    <p className="small text-muted mb-1">Karta raqami</p>
                                    <div className="d-flex align-items-center justify-content-between">
                                        <p className="fw-bold font-monospace mb-0">{paymentInfo.cardNumber}</p>
                                        <button onClick={copyCardNumber} className="btn btn-sm btn-outline-success rounded-2">
                                            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                                                {copied ? 'check' : 'content_copy'}
                                            </span>
                                        </button>
                                    </div>
                                </div>

                                <div className="row g-3 mb-4">
                                    <div className="col-6">
                                        <div className="bg-light rounded-3 p-3">
                                            <p className="small text-muted mb-1">Karta egasi</p>
                                            <p className="fw-semibold mb-0 small">{paymentInfo.cardHolder}</p>
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <div className="bg-light rounded-3 p-3">
                                            <p className="small text-muted mb-1">Summa</p>
                                            <p className="fw-bold text-success mb-0 small">{topUpAmount.toLocaleString()} so'm</p>
                                        </div>
                                    </div>
                                </div>

                                <p className="text-muted small mb-3 text-center">
                                    To'lovni amalga oshirgandan so'ng admin bilan bog'laning
                                </p>
                                <a
                                    href={`tel:${paymentInfo.adminPhone}`}
                                    className="btn btn-success w-100 rounded-3 py-3 d-flex align-items-center justify-content-center gap-2"
                                >
                                    <span className="material-symbols-outlined">call</span>
                                    <span className="fw-bold">{paymentInfo.adminPhone}</span>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <ConfirmModal
                show={showLogoutModal}
                onClose={() => setShowLogoutModal(false)}
                onConfirm={logout}
                title="Tizimdan chiqish"
                message="Haqiqatan ham tizimdan chiqmoqchimisiz?"
                confirmText="Chiqish"
                type="danger"
            />

            <AlertModal
                show={alertModal.show}
                onClose={() => setAlertModal({ ...alertModal, show: false })}
                title={alertModal.title}
                message={alertModal.message}
                type={alertModal.type}
            />
        </div>
    );
}
