'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { useSubscription } from '@/components/SubscriptionModal';
import Header from '@/components/dashboard/Header';
import AlertModal from '@/components/AlertModal';
import ConfirmModal from '@/components/ConfirmModal';
import { Wallet, Calendar, CreditCard, Edit, LogOut, User, Phone, BadgeCheck, Save, Copy, Check, PhoneCall, Users, Trash2 } from 'lucide-react';

export default function ProfilePage() {
    const { user, logout, getAuthHeader } = useAuth();
    const { daysRemaining } = useSubscription();
    const { students: cachedStudents, updateStudent: updateStudentInCache } = useData();
    const [saving, setSaving] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [showTopUpModal, setShowTopUpModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showEditStudentModal, setShowEditStudentModal] = useState(false);
    const [showDeleteStudentModal, setShowDeleteStudentModal] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [loadingStudents, setLoadingStudents] = useState(false);
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
    const [studentFormData, setStudentFormData] = useState({
        name: ''
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

    const handleEditStudent = (student) => {
        setSelectedStudent(student);
        setStudentFormData({ name: student.name });
        setShowEditStudentModal(true);
    };

    const handleUpdateStudent = async (e) => {
        e.preventDefault();
        if (!selectedStudent) return;

        setSaving(true);
        try {
            const res = await fetch(`/api/students/${selectedStudent._id}`, {
                method: 'PUT',
                headers: getAuthHeader(),
                body: JSON.stringify({ name: studentFormData.name })
            });
            const data = await res.json();

            if (data.success) {
                // Update in global cache
                updateStudentInCache(selectedStudent._id, { name: studentFormData.name });
                
                setAlertModal({
                    show: true,
                    title: 'Muvaffaqiyatli',
                    message: 'O\'quvchi ma\'lumotlari yangilandi',
                    type: 'success'
                });
                setShowEditStudentModal(false);
            } else {
                setAlertModal({
                    show: true,
                    title: 'Xatolik',
                    message: data.error || 'O\'quvchini yangilashda xatolik',
                    type: 'danger'
                });
            }
        } catch (error) {
            console.error('Failed to update student:', error);
            setAlertModal({
                show: true,
                title: 'Xatolik',
                message: 'O\'quvchini yangilashda xatolik',
                type: 'danger'
            });
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteStudent = async () => {
        if (!selectedStudent) return;

        setSaving(true);
        try {
            const res = await fetch(`/api/students/${selectedStudent._id}`, {
                method: 'DELETE',
                headers: getAuthHeader()
            });
            const data = await res.json();

            if (data.success) {
                // Remove from global cache
                updateStudentInCache(selectedStudent._id, { isActive: false });
                
                setAlertModal({
                    show: true,
                    title: 'Muvaffaqiyatli',
                    message: 'O\'quvchi o\'chirildi',
                    type: 'success'
                });
                setShowDeleteStudentModal(false);
            } else {
                setAlertModal({
                    show: true,
                    title: 'Xatolik',
                    message: data.error || 'O\'quvchini o\'chirishda xatolik',
                    type: 'danger'
                });
            }
        } catch (error) {
            console.error('Failed to delete student:', error);
            setAlertModal({
                show: true,
                title: 'Xatolik',
                message: 'O\'quvchini o\'chirishda xatolik',
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
                                            <Wallet size={24} className="text-success" />
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
                                            <Calendar size={24} className="text-primary" />
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
                            <CreditCard size={20} />
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
                                        <Edit size={24} className="text-primary" />
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
                                        <LogOut size={24} className="text-danger" />
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
                                    <User size={20} className="text-secondary" />
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
                                    <Phone size={20} className="text-secondary" />
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
                                    <BadgeCheck size={20} className="text-secondary" />
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

                {/* Students List */}
                <div className="card border shadow-sm rounded-3 mb-3" style={{ backgroundColor: '#fff' }}>
                    <div className="card-body p-3">
                        <div className="d-flex align-items-center gap-2 mb-3">
                            <Users size={20} className="text-primary" />
                            <h6 className="fw-bold mb-0">O'quvchilar</h6>
                            <span className="badge bg-primary rounded-pill ms-auto">{cachedStudents.length}</span>
                        </div>

                        {cachedStudents.length === 0 ? (
                            <div className="text-center py-4 text-muted">
                                <Users size={32} className="mb-2 opacity-50" />
                                <p className="small mb-0">O'quvchilar yo'q</p>
                            </div>
                        ) : (
                            <div className="d-flex flex-column gap-2">
                                {cachedStudents.map((student) => (
                                    <div
                                        key={student._id}
                                        className="d-flex align-items-center gap-3 p-2 rounded-3 border"
                                        style={{ backgroundColor: '#f8f9fa' }}
                                    >
                                        <div
                                            className="rounded-circle"
                                            style={{
                                                width: '40px',
                                                height: '40px',
                                                backgroundImage: `url('https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=667eea&color=fff&size=80&bold=true')`,
                                                backgroundSize: 'cover'
                                            }}
                                        />
                                        <div className="flex-grow-1">
                                            <p className="fw-semibold mb-0 small">{student.name}</p>
                                            <p className="text-muted mb-0" style={{ fontSize: '11px' }}>
                                                {student.age} yosh • ⭐ {student.stars || 0}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => handleEditStudent(student)}
                                            className="btn btn-sm btn-outline-primary rounded-2 d-flex align-items-center justify-content-center"
                                            style={{ width: '32px', height: '32px', padding: 0 }}
                                        >
                                            <Edit size={14} />
                                        </button>
                                        <button
                                            onClick={() => {
                                                setSelectedStudent(student);
                                                setShowDeleteStudentModal(true);
                                            }}
                                            className="btn btn-sm btn-outline-danger rounded-2 d-flex align-items-center justify-content-center"
                                            style={{ width: '32px', height: '32px', padding: 0 }}
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
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
                                    <Edit size={20} className="text-primary" />
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
                                        className="btn btn-primary rounded-3 w-100 py-2 fw-semibold d-flex align-items-center justify-content-center gap-2"
                                        disabled={saving}
                                    >
                                        {saving ? (
                                            <span className="spinner-border spinner-border-sm"></span>
                                        ) : (
                                            <Save size={18} />
                                        )}
                                        Saqlash
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Student Modal */}
            {showEditStudentModal && selectedStudent && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 10000 }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content rounded-4 border-0">
                            <div className="modal-header border-0 pb-0">
                                <h5 className="modal-title fw-bold d-flex align-items-center gap-2">
                                    <Edit size={20} className="text-primary" />
                                    O'quvchini tahrirlash
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setShowEditStudentModal(false)}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <form onSubmit={handleUpdateStudent}>
                                    <div className="mb-4">
                                        <label className="form-label small fw-semibold">Ism va familiya</label>
                                        <input
                                            type="text"
                                            className="form-control rounded-3 border"
                                            value={studentFormData.name}
                                            onChange={(e) => setStudentFormData({ name: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        className="btn btn-primary rounded-3 w-100 py-2 fw-semibold d-flex align-items-center justify-content-center gap-2"
                                        disabled={saving}
                                    >
                                        {saving ? (
                                            <span className="spinner-border spinner-border-sm"></span>
                                        ) : (
                                            <Save size={18} />
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
                                    <Wallet size={20} className="text-success" />
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
                                            {copied ? <Check size={16} /> : <Copy size={16} />}
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
                                    <PhoneCall size={20} />
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

            <ConfirmModal
                show={showDeleteStudentModal}
                onClose={() => setShowDeleteStudentModal(false)}
                onConfirm={handleDeleteStudent}
                title="O'quvchini o'chirish"
                message={`${selectedStudent?.name} o'quvchisini o'chirmoqchimisiz? Bu amal qaytarilmaydi.`}
                confirmText="O'chirish"
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
