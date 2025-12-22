'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Header from '@/components/dashboard/Header';
import AlertModal from '@/components/AlertModal';
import ConfirmModal from '@/components/ConfirmModal';

export default function ProfilePage() {
    const { user, logout, getAuthHeader } = useAuth();
    const [saving, setSaving] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [alertModal, setAlertModal] = useState({ show: false, title: '', message: '', type: 'success' });
    const [formData, setFormData] = useState({
        name: user?.name || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

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

    return (
        <div className="page-content">
            <Header title="Sozlamalar" />

            <main className="p-3">
                {/* Profile Info */}
                <div className="card border-0 rounded-4 shadow-sm mb-4">
                    <div className="card-body p-4">
                        <div className="d-flex align-items-center gap-3 mb-4">
                            <div
                                className="rounded-circle"
                                style={{
                                    width: '72px',
                                    height: '72px',
                                    backgroundImage: `url('https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=2b8cee&color=fff&size=144')`,
                                    backgroundSize: 'cover'
                                }}
                            />
                            <div>
                                <h5 className="fw-bold mb-1">{user?.name}</h5>
                                <p className="text-muted mb-0">{user?.phone}</p>
                            </div>
                        </div>

                        <form onSubmit={handleUpdateProfile}>
                            <div className="mb-3">
                                <label className="form-label small fw-semibold">Ism</label>
                                <input
                                    type="text"
                                    className="form-control rounded-3 bg-light border-0"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>

                            <hr className="my-4" />

                            <h6 className="fw-bold mb-3">Parolni o'zgartirish</h6>

                            <div className="mb-3">
                                <label className="form-label small fw-semibold">Joriy parol</label>
                                <input
                                    type="password"
                                    className="form-control rounded-3 bg-light border-0"
                                    value={formData.currentPassword}
                                    onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                                    placeholder="Parolni o'zgartirish uchun kiriting"
                                />
                            </div>

                            <div className="row g-3 mb-4">
                                <div className="col-6">
                                    <label className="form-label small fw-semibold">Yangi parol</label>
                                    <input
                                        type="password"
                                        className="form-control rounded-3 bg-light border-0"
                                        value={formData.newPassword}
                                        onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                                    />
                                </div>
                                <div className="col-6">
                                    <label className="form-label small fw-semibold">Tasdiqlash</label>
                                    <input
                                        type="password"
                                        className="form-control rounded-3 bg-light border-0"
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
                                    <span className="material-symbols-outlined me-2" style={{ fontSize: '20px' }}>save</span>
                                )}
                                Saqlash
                            </button>
                        </form>
                    </div>
                </div>

                {/* Logout */}
                <div className="card border-0 rounded-4 shadow-sm">
                    <div className="card-body p-4">
                        <button
                            onClick={() => setShowLogoutModal(true)}
                            className="btn btn-outline-danger rounded-3 w-100 py-2 fw-semibold d-flex align-items-center justify-content-center gap-2"
                        >
                            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>logout</span>
                            Tizimdan chiqish
                        </button>
                    </div>
                </div>
            </main>

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
