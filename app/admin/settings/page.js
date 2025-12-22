'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import AlertModal from '@/components/AlertModal';

export default function SettingsPage() {
    const { getAuthHeader } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [alertModal, setAlertModal] = useState({ show: false, title: '', message: '', type: 'success' });
    const [settings, setSettings] = useState({
        adminPhone: '',
        cardNumber: '',
        cardHolder: '',
        dailyPrice: 200,
        bookPrice: 50000
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/settings', {
                headers: getAuthHeader()
            });
            const data = await res.json();
            if (data.success) {
                setSettings({
                    adminPhone: data.adminPhone || '',
                    cardNumber: data.cardNumber || '',
                    cardHolder: data.cardHolder || '',
                    dailyPrice: data.dailyPrice || 200,
                    bookPrice: data.bookPrice || 50000
                });
            }
        } catch (error) {
            console.error('Failed to fetch settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            const res = await fetch('/api/settings', {
                method: 'PUT',
                headers: getAuthHeader(),
                body: JSON.stringify(settings)
            });
            const data = await res.json();

            if (data.success) {
                setAlertModal({
                    show: true,
                    title: 'Muvaffaqiyatli',
                    message: 'Sozlamalar saqlandi',
                    type: 'success'
                });
            } else {
                setAlertModal({
                    show: true,
                    title: 'Xatolik',
                    message: data.error || 'Sozlamalarni saqlashda xatolik',
                    type: 'danger'
                });
            }
        } catch (error) {
            console.error('Failed to save settings:', error);
            setAlertModal({
                show: true,
                title: 'Xatolik',
                message: 'Sozlamalarni saqlashda xatolik',
                type: 'danger'
            });
        } finally {
            setSaving(false);
        }
    };

    const formatCardNumber = (value) => {
        const numbers = value.replace(/\D/g, '');
        const groups = numbers.match(/.{1,4}/g) || [];
        return groups.join(' ').slice(0, 19);
    };

    // Obuna paketlari narxlari
    const packages = [
        { days: 15, total: settings.dailyPrice * 15 },
        { days: 20, total: settings.dailyPrice * 20 },
        { days: 30, total: settings.dailyPrice * 30 },
    ];

    if (loading) {
        return (
            <div className="d-flex justify-content-center py-5">
                <div className="spinner-border text-primary"></div>
            </div>
        );
    }

    return (
        <div>
            <div className="mb-4">
                <h1 className="h3 fw-bold mb-1">Sozlamalar</h1>
                <p className="text-muted mb-0">To'lov ma'lumotlari va obuna narxi</p>
            </div>

            <div className="row">
                <div className="col-lg-8">
                    <form onSubmit={handleSave}>
                        {/* Payment Info Card */}
                        <div className="card border-0 rounded-4 shadow-sm mb-4">
                            <div className="card-header bg-transparent border-0 pt-4 pb-0 px-4">
                                <h5 className="fw-bold mb-0 d-flex align-items-center gap-2">
                                    <span className="material-symbols-outlined text-primary">credit_card</span>
                                    To'lov ma'lumotlari
                                </h5>
                            </div>
                            <div className="card-body p-4">
                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <label className="form-label small fw-semibold">Admin telefon raqami</label>
                                        <div className="input-group">
                                            <span className="input-group-text bg-light border-0">
                                                <span className="material-symbols-outlined text-muted" style={{ fontSize: '20px' }}>phone</span>
                                            </span>
                                            <input
                                                type="text"
                                                className="form-control border-0 bg-light"
                                                placeholder="+998901234567"
                                                value={settings.adminPhone}
                                                onChange={(e) => setSettings({ ...settings, adminPhone: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label small fw-semibold">Karta egasi ismi</label>
                                        <div className="input-group">
                                            <span className="input-group-text bg-light border-0">
                                                <span className="material-symbols-outlined text-muted" style={{ fontSize: '20px' }}>person</span>
                                            </span>
                                            <input
                                                type="text"
                                                className="form-control border-0 bg-light"
                                                placeholder="Ism Familiya"
                                                value={settings.cardHolder}
                                                onChange={(e) => setSettings({ ...settings, cardHolder: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label small fw-semibold">Karta raqami</label>
                                        <div className="input-group">
                                            <span className="input-group-text bg-light border-0">
                                                <span className="material-symbols-outlined text-muted" style={{ fontSize: '20px' }}>credit_card</span>
                                            </span>
                                            <input
                                                type="text"
                                                className="form-control border-0 bg-light"
                                                placeholder="8600 0000 0000 0000"
                                                value={settings.cardNumber}
                                                onChange={(e) => setSettings({ ...settings, cardNumber: formatCardNumber(e.target.value) })}
                                                maxLength={19}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Subscription Price Card */}
                        <div className="card border-0 rounded-4 shadow-sm mb-4">
                            <div className="card-header bg-transparent border-0 pt-4 pb-0 px-4">
                                <h5 className="fw-bold mb-0 d-flex align-items-center gap-2">
                                    <span className="material-symbols-outlined text-success">payments</span>
                                    Obuna narxi
                                </h5>
                            </div>
                            <div className="card-body p-4">
                                <div className="row g-3 mb-4">
                                    <div className="col-md-6">
                                        <label className="form-label small fw-semibold">Kunlik obuna narxi (so'm)</label>
                                        <div className="input-group">
                                            <input
                                                type="number"
                                                className="form-control border-0 bg-light"
                                                placeholder="200"
                                                value={settings.dailyPrice}
                                                onChange={(e) => setSettings({ ...settings, dailyPrice: parseInt(e.target.value) || 0 })}
                                            />
                                            <span className="input-group-text bg-light border-0 fw-semibold">so'm/kun</span>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="bg-light rounded-3 p-3 h-100 d-flex flex-column justify-content-center">
                                            <p className="small text-muted mb-1">Sinov muddati</p>
                                            <p className="fw-bold mb-0">7 kun (bepul)</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Package prices preview */}
                                <div className="bg-light rounded-3 p-3">
                                    <p className="small fw-semibold mb-2">Obuna paketlari:</p>
                                    <div className="d-flex flex-wrap gap-3">
                                        {packages.map(pkg => (
                                            <div key={pkg.days} className="bg-white rounded-2 px-3 py-2">
                                                <span className="fw-bold text-primary">{pkg.days} kun</span>
                                                <span className="text-muted mx-2">=</span>
                                                <span className="fw-semibold">{pkg.total.toLocaleString()} so'm</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Book Price Card */}
                        <div className="card border-0 rounded-4 shadow-sm mb-4">
                            <div className="card-header bg-transparent border-0 pt-4 pb-0 px-4">
                                <h5 className="fw-bold mb-0 d-flex align-items-center gap-2">
                                    <span className="material-symbols-outlined text-warning">auto_stories</span>
                                    Kitob narxi
                                </h5>
                            </div>
                            <div className="card-body p-4">
                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <label className="form-label small fw-semibold">Bolajon darsligi narxi (so'm)</label>
                                        <div className="input-group">
                                            <input
                                                type="number"
                                                className="form-control border-0 bg-light"
                                                placeholder="50000"
                                                value={settings.bookPrice}
                                                onChange={(e) => setSettings({ ...settings, bookPrice: parseInt(e.target.value) || 0 })}
                                            />
                                            <span className="input-group-text bg-light border-0 fw-semibold">so'm</span>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="bg-light rounded-3 p-3 h-100 d-flex flex-column justify-content-center">
                                            <p className="small text-muted mb-1">Bosmaxona varianti</p>
                                            <p className="fw-bold mb-0">{settings.bookPrice?.toLocaleString()} so'm</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary rounded-3 px-4 py-2 d-flex align-items-center gap-2"
                            disabled={saving}
                        >
                            {saving ? (
                                <span className="spinner-border spinner-border-sm"></span>
                            ) : (
                                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>save</span>
                            )}
                            Saqlash
                        </button>
                    </form>
                </div>

                {/* Preview Card */}
                <div className="col-lg-4">
                    <div className="card border-0 rounded-4 shadow-sm sticky-top" style={{ top: '100px' }}>
                        <div className="card-header bg-transparent border-0 pt-4 pb-0 px-4">
                            <h6 className="fw-bold mb-0">Ko'rinishi</h6>
                            <p className="text-muted small mb-0">Foydalanuvchi ko'radigan ma'lumot</p>
                        </div>
                        <div className="card-body p-4">
                            <div className="bg-light rounded-4 p-4 text-center">
                                <div className="mb-3">
                                    <span className="material-symbols-outlined text-warning" style={{ fontSize: '48px' }}>lock</span>
                                </div>
                                <h6 className="fw-bold mb-2">Obuna tugadi</h6>
                                <p className="small text-muted mb-3">
                                    Kunlik narx: {settings.dailyPrice?.toLocaleString()} so'm
                                </p>
                                <div className="bg-white rounded-3 p-3 text-start mb-3">
                                    <p className="small text-muted mb-1">Karta raqami:</p>
                                    <p className="fw-bold mb-2 font-monospace">{settings.cardNumber || '8600 **** **** ****'}</p>
                                    <p className="small text-muted mb-1">Karta egasi:</p>
                                    <p className="fw-semibold mb-0">{settings.cardHolder || 'Ism Familiya'}</p>
                                </div>
                                <p className="small mb-0">
                                    <span className="material-symbols-outlined align-middle me-1" style={{ fontSize: '16px' }}>phone</span>
                                    {settings.adminPhone || '+998901234567'}
                                </p>
                            </div>
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
