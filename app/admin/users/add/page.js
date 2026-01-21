'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import AlertModal from '@/components/AlertModal';
import PhoneInput from '@/components/PhoneInput';

export default function AddTeacherPage() {
    const router = useRouter();
    const { getAuthHeader } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        password: '',
        role: 'teacher'
    });
    const [loading, setLoading] = useState(false);
    const [alertModal, setAlertModal] = useState({ show: false, title: '', message: '', type: 'success' });

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name || !formData.phone || !formData.password) {
            setAlertModal({
                show: true,
                title: 'Xatolik',
                message: 'Barcha maydonlarni to\'ldiring',
                type: 'danger'
            });
            return;
        }

        if (formData.password.length < 6) {
            setAlertModal({
                show: true,
                title: 'Xatolik',
                message: 'Parol kamida 6 ta belgidan iborat bo\'lishi kerak',
                type: 'danger'
            });
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeader()
                },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (data.success) {
                setAlertModal({
                    show: true,
                    title: 'Muvaffaqiyatli',
                    message: `${formData.role === 'admin' ? 'Admin' : 'O\'qituvchi'} muvaffaqiyatli qo'shildi`,
                    type: 'success'
                });
                setTimeout(() => {
                    router.push('/admin/users');
                }, 1500);
            } else {
                setAlertModal({
                    show: true,
                    title: 'Xatolik',
                    message: data.error || 'Qo\'shishda xatolik yuz berdi',
                    type: 'danger'
                });
            }
        } catch (error) {
            console.error('Add teacher error:', error);
            setAlertModal({
                show: true,
                title: 'Xatolik',
                message: 'Qo\'shishda xatolik yuz berdi',
                type: 'danger'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h1 className="h3 fw-bold mb-1">Yangi foydalanuvchi qo'shish</h1>
                    <p className="text-muted mb-0">Admin yoki o'qituvchi qo'shing</p>
                </div>
                <button
                    onClick={() => router.back()}
                    className="btn btn-light rounded-3 d-flex align-items-center gap-2"
                >
                    <span className="material-symbols-outlined">arrow_back</span>
                    Orqaga
                </button>
            </div>

            <div className="row justify-content-center">
                <div className="col-lg-8">
                    <div className="card border-0 rounded-4 shadow-sm">
                        <div className="card-body p-4">
                            <form onSubmit={handleSubmit}>
                                {/* Role Selection */}
                                <div className="mb-4">
                                    <label className="form-label fw-semibold">
                                        <span className="material-symbols-outlined me-2" style={{ fontSize: '20px', verticalAlign: 'middle' }}>badge</span>
                                        Rol
                                    </label>
                                    <div className="d-flex gap-3">
                                        <div className="form-check">
                                            <input
                                                className="form-check-input"
                                                type="radio"
                                                name="role"
                                                id="roleTeacher"
                                                value="teacher"
                                                checked={formData.role === 'teacher'}
                                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                            />
                                            <label className="form-check-label" htmlFor="roleTeacher">
                                                O'qituvchi
                                            </label>
                                        </div>
                                        <div className="form-check">
                                            <input
                                                className="form-check-input"
                                                type="radio"
                                                name="role"
                                                id="roleAdmin"
                                                value="admin"
                                                checked={formData.role === 'admin'}
                                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                            />
                                            <label className="form-check-label" htmlFor="roleAdmin">
                                                Admin
                                            </label>
                                        </div>
                                    </div>
                                    <small className="text-muted">
                                        {formData.role === 'admin' 
                                            ? 'Admin barcha funksiyalarga kirish huquqiga ega' 
                                            : 'O\'qituvchi faqat o\'z o\'quvchilari bilan ishlaydi'}
                                    </small>
                                </div>

                                {/* Name */}
                                <div className="mb-4">
                                    <label className="form-label fw-semibold">
                                        <span className="material-symbols-outlined me-2" style={{ fontSize: '20px', verticalAlign: 'middle' }}>person</span>
                                        Ism
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control form-control-lg rounded-3 border-0 bg-light"
                                        placeholder="To'liq ism kiriting"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </div>

                                {/* Phone */}
                                <div className="mb-4">
                                    <label className="form-label fw-semibold">
                                        <span className="material-symbols-outlined me-2" style={{ fontSize: '20px', verticalAlign: 'middle' }}>phone</span>
                                        Telefon raqam
                                    </label>
                                    <PhoneInput
                                        value={formData.phone}
                                        onChange={(value) => setFormData({ ...formData, phone: value })}
                                        placeholder="+998 90 123 45 67"
                                        required
                                    />
                                </div>

                                {/* Password */}
                                <div className="mb-4">
                                    <label className="form-label fw-semibold">
                                        <span className="material-symbols-outlined me-2" style={{ fontSize: '20px', verticalAlign: 'middle' }}>lock</span>
                                        Parol
                                    </label>
                                    <input
                                        type="password"
                                        className="form-control form-control-lg rounded-3 border-0 bg-light"
                                        placeholder="Kamida 6 ta belgi"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        minLength={6}
                                        required
                                    />
                                    <small className="text-muted">Parol kamida 6 ta belgidan iborat bo'lishi kerak</small>
                                </div>

                                {/* Info Alert */}
                                <div className="alert alert-info rounded-3 d-flex align-items-start gap-2 mb-4">
                                    <span className="material-symbols-outlined">info</span>
                                    <div>
                                        <strong>Eslatma:</strong> Yangi foydalanuvchi 7 kunlik bepul sinov davri bilan yaratiladi.
                                        Keyin admin paneldan obuna berishingiz mumkin.
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <div className="d-flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => router.back()}
                                        className="btn btn-light rounded-3 px-4"
                                        disabled={loading}
                                    >
                                        Bekor qilish
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-primary rounded-3 px-4 d-flex align-items-center gap-2"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm"></span>
                                                Qo'shilmoqda...
                                            </>
                                        ) : (
                                            <>
                                                <span className="material-symbols-outlined">add</span>
                                                Qo'shish
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

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
