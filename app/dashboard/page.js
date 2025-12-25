'use client';

import { useState, useEffect } from 'react';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import Header from '@/components/dashboard/Header';
import Link from 'next/link';

const quickActions = [
    { icon: 'person_add', label: "O'quvchi qo'shish", href: '/dashboard/students/add', color: '#E0F2FE', iconColor: '#0284c7', tour: 'add-student' },
    { icon: 'play_lesson', label: 'Dars boshlash', href: '/dashboard/lessons', color: '#DCFCE7', iconColor: '#16a34a', tour: 'start-lesson' },
    { icon: 'star', label: 'Yulduz berish', href: '/dashboard/students', color: '#FEF3C7', iconColor: '#d97706' },
    { icon: 'redeem', label: "Sovg'a berish", href: '/dashboard/rewards', color: '#F3E8FF', iconColor: '#9333ea' },
];

export default function DashboardPage() {
    const { dashboard, initialLoading } = useData();
    const { user } = useAuth();
    const [showBuyModal, setShowBuyModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentInfo, setPaymentInfo] = useState(null);
    const [copied, setCopied] = useState(false);
    const [daysRemaining, setDaysRemaining] = useState(0);
    const [selectedDays, setSelectedDays] = useState(30);

    // Predefined packages
    const packages = [
        { days: 15, label: '15 kun' },
        { days: 20, label: '20 kun' },
        { days: 30, label: '30 kun' },
    ];

    useEffect(() => {
        fetchPaymentInfo();
        fetchSubscriptionInfo();
    }, []);

    const fetchPaymentInfo = async () => {
        try {
            const res = await fetch('/api/settings');
            const data = await res.json();
            if (data.success) {
                setPaymentInfo({
                    adminPhone: data.adminPhone,
                    cardNumber: data.cardNumber,
                    cardHolder: data.cardHolder,
                    bookPrice: data.bookPrice || 50000,
                    dailyPrice: data.dailyPrice || 200
                });
            }
        } catch (error) {
            console.error('Failed to fetch payment info:', error);
        }
    };

    const fetchSubscriptionInfo = async () => {
        try {
            const res = await fetch('/api/auth/me');
            const data = await res.json();
            if (data.success && data.user) {
                const days = data.user.daysRemaining || 0;
                setDaysRemaining(days);
                // Auto-open payment modal if 0 days remaining
                if (days <= 0 && data.user.role !== 'admin') {
                    setShowPaymentModal(true);
                }
            }
        } catch (error) {
            console.error('Failed to fetch subscription info:', error);
        }
    };

    // Check if subscription expired
    const isExpired = daysRemaining <= 0 && user?.role !== 'admin';

    const copyCardNumber = () => {
        if (paymentInfo?.cardNumber) {
            navigator.clipboard.writeText(paymentInfo.cardNumber.replace(/\s/g, ''));
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div className="page-content">
            <Header
                showStars={true}
                stars={dashboard.totalStars}
                showSubscription={true}
                daysRemaining={daysRemaining}
                onPaymentClick={() => setShowPaymentModal(true)}
            />

            <main className="p-3 position-relative">
                {/* Expired Overlay */}
                {isExpired && (
                    <div
                        className="position-absolute top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center"
                        style={{
                            backgroundColor: 'rgba(255,255,255,0.95)',
                            zIndex: 100,
                            borderRadius: '1rem'
                        }}
                    >
                        <span className="material-symbols-outlined text-danger mb-3" style={{ fontSize: '64px' }}>
                            lock
                        </span>
                        <h4 className="fw-bold text-danger mb-2">Obuna muddati tugadi</h4>
                        <p className="text-muted mb-4 text-center px-4">
                            Platformadan foydalanishni davom ettirish uchun obunani yangilang
                        </p>
                        <button
                            onClick={() => setShowPaymentModal(true)}
                            className="btn btn-danger rounded-pill px-4 py-2 d-flex align-items-center gap-2"
                        >
                            <span className="material-symbols-outlined">payments</span>
                            To'lov qilish
                        </button>
                    </div>
                )}

                {/* Welcome Banner */}
                <div data-tour="welcome" className="card border-0 rounded-4 mb-4 overflow-hidden" style={{ background: 'linear-gradient(135deg, #2b8cee 0%, #1e40af 100%)' }}>
                    <div className="card-body text-white p-4">
                        <h2 className="h4 fw-bold mb-2">
                            Xush kelibsiz, <span style={{ color: '#fde68a' }}>{user?.name || 'Ustoz'}!</span>
                        </h2>
                        <p className="small opacity-75 mb-3">
                            Darslarni o'rgatishni boshlang
                        </p>
                        <Link href="/dashboard/lessons" prefetch={true} className="btn btn-light btn-sm rounded-pill px-4 fw-semibold d-inline-flex align-items-center">
                            <span className="material-symbols-outlined me-1" style={{ fontSize: '18px', lineHeight: 1 }}>play_arrow</span>
                            Darsni boshlash
                        </Link>
                    </div>
                </div>

                {/* Stats Cards */}
                <div data-tour="stats" className="row g-2 mb-4">
                    <div className="col-4">
                        <div className="card border-0 rounded-4 h-100 card-pastel-blue">
                            <div className="card-body text-center p-2 p-sm-3">
                                <span className="material-symbols-outlined mb-1" style={{ fontSize: '28px', color: '#0284c7' }}>school</span>
                                <h3 className="h5 fw-bold mb-0">{initialLoading ? '-' : dashboard.totalStudents}</h3>
                                <p className="small text-muted mb-0" style={{ fontSize: '11px', whiteSpace: 'nowrap' }}>Bolalar</p>
                            </div>
                        </div>
                    </div>
                    <div className="col-4">
                        <div className="card border-0 rounded-4 h-100 card-pastel-green">
                            <div className="card-body text-center p-2 p-sm-3">
                                <span className="material-symbols-outlined mb-1" style={{ fontSize: '28px', color: '#16a34a' }}>task_alt</span>
                                <h3 className="h5 fw-bold mb-0">{initialLoading ? '-' : dashboard.completedLessons}</h3>
                                <p className="small text-muted mb-0" style={{ fontSize: '11px', whiteSpace: 'nowrap' }}>Darslar</p>
                            </div>
                        </div>
                    </div>
                    <div className="col-4">
                        <div className="card border-0 rounded-4 h-100 card-pastel-yellow">
                            <div className="card-body text-center p-2 p-sm-3">
                                <span className="material-symbols-outlined filled mb-1" style={{ fontSize: '28px', color: '#d97706' }}>star</span>
                                <h3 className="h5 fw-bold mb-0">{initialLoading ? '-' : dashboard.totalStars}</h3>
                                <p className="small text-muted mb-0" style={{ fontSize: '11px', whiteSpace: 'nowrap' }}>Yulduzlar</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Book Promo Card */}
                <div data-tour="book" className="card border-0 rounded-4 mb-4 overflow-hidden" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)' }}>
                    <div className="card-body text-white p-4">
                        <div className="d-flex align-items-center gap-3">
                            <Link href="/dashboard/book" className="rounded-4 p-3 bg-white bg-opacity-25 text-white text-decoration-none" style={{ cursor: 'pointer' }}>
                                <span className="material-symbols-outlined" style={{ fontSize: '40px' }}>auto_stories</span>
                            </Link>
                            <div className="flex-grow-1">
                                <h3 className="fw-bold mb-0" style={{ fontSize: '1.1rem' }}>Bolajon kursining mashq kitobidan foydalaning</h3>
                            </div>
                        </div>
                        <div className="d-flex gap-2 mt-3">
                            <a
                                href="/book/bolajon-darslik.pdf"
                                download="Bolajon-Mashq-Kitobi.pdf"
                                className="btn btn-light btn-sm rounded-pill px-4 fw-semibold d-inline-flex align-items-center"
                            >
                                <span className="material-symbols-outlined me-1" style={{ fontSize: '18px' }}>download</span>
                                Yuklab olish
                            </a>
                            <button
                                onClick={() => setShowBuyModal(true)}
                                className="btn btn-outline-light btn-sm rounded-pill px-4 fw-semibold d-inline-flex align-items-center"
                            >
                                <span className="material-symbols-outlined me-1" style={{ fontSize: '18px' }}>shopping_cart</span>
                                Sotib olish
                            </button>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <h3 className="h6 fw-bold mb-3">Tezkor harakatlar</h3>
                <div data-tour="quick-actions" className="row g-3 mb-4">
                    {quickActions.map((action, index) => (
                        <div key={index} className="col-6 col-lg-3">
                            <Link href={action.href} prefetch={true} className="text-decoration-none">
                                <div
                                    data-tour={action.tour}
                                    className="card border-0 rounded-4 lesson-card h-100"
                                    style={{ backgroundColor: action.color }}
                                >
                                    <div className="card-body p-3 d-flex flex-column flex-lg-row align-items-center gap-3">
                                        <div className="rounded-3 p-2" style={{ backgroundColor: 'white' }}>
                                            <span className="material-symbols-outlined" style={{ color: action.iconColor, fontSize: '24px' }}>
                                                {action.icon}
                                            </span>
                                        </div>
                                        <span className="fw-semibold text-dark small text-center text-lg-start">{action.label}</span>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>

                {/* How it works */}
                <div className="card border-0 rounded-4 bg-white">
                    <div className="card-body p-4">
                        <div className="d-flex align-items-center justify-content-between mb-3">
                            <h3 className="h6 fw-bold mb-0">Qanday ishlaydi?</h3>
                            <span className="material-symbols-outlined text-muted">help</span>
                        </div>

                        <div className="d-flex flex-column gap-3">
                            <div className="d-flex align-items-start gap-3 p-3 rounded-4" style={{ backgroundColor: '#E0F2FE' }}>
                                <div className="rounded-3 p-2 bg-white">
                                    <span className="material-symbols-outlined" style={{ color: '#0284c7' }}>smart_display</span>
                                </div>
                                <div>
                                    <h4 className="small fw-bold mb-1">1. Video darsni ko'ring</h4>
                                    <p className="small text-muted mb-0">Interaktiv video darslarni tomosha qiling</p>
                                </div>
                            </div>

                            <div className="d-flex align-items-start gap-3 p-3 rounded-4" style={{ backgroundColor: '#DCFCE7' }}>
                                <div className="rounded-3 p-2 bg-white">
                                    <span className="material-symbols-outlined" style={{ color: '#16a34a' }}>groups</span>
                                </div>
                                <div>
                                    <h4 className="small fw-bold mb-1">2. Bolalarga o'rgating</h4>
                                    <p className="small text-muted mb-0">O'rgangan narsalaringizni bolalarga o'rgating</p>
                                </div>
                            </div>

                            <div className="d-flex align-items-start gap-3 p-3 rounded-4" style={{ backgroundColor: '#FEF3C7' }}>
                                <div className="rounded-3 p-2 bg-white">
                                    <span className="material-symbols-outlined filled" style={{ color: '#d97706' }}>star</span>
                                </div>
                                <div>
                                    <h4 className="small fw-bold mb-1">3. Yulduz bering</h4>
                                    <p className="small text-muted mb-0">Bolalarning yutuqlarini yulduzlar bilan mukofotlang</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Buy Book Modal */}
            {showBuyModal && paymentInfo && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                        <div className="modal-content rounded-4 border-0">
                            <div className="modal-header border-0 pb-0">
                                <h5 className="modal-title fw-bold d-flex align-items-center gap-2">
                                    <span className="material-symbols-outlined text-warning">auto_stories</span>
                                    Kitobni sotib olish
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setShowBuyModal(false)}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <div className="bg-warning bg-opacity-10 rounded-4 p-4 mb-4 text-center">
                                    <p className="text-warning small fw-semibold mb-1">Bosmaxona varianti narxi</p>
                                    <h2 className="display-6 fw-bold text-warning mb-0">
                                        {paymentInfo.bookPrice?.toLocaleString()} <span className="fs-5">so'm</span>
                                    </h2>
                                </div>

                                <div className="bg-light rounded-3 p-3 mb-3">
                                    <p className="small text-muted mb-1">Karta raqami</p>
                                    <div className="d-flex align-items-center justify-content-between">
                                        <p className="fw-bold font-monospace mb-0 fs-5">{paymentInfo.cardNumber}</p>
                                        <button onClick={copyCardNumber} className="btn btn-sm btn-outline-primary rounded-2">
                                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                                                {copied ? 'check' : 'content_copy'}
                                            </span>
                                        </button>
                                    </div>
                                </div>

                                <div className="row g-3 mb-4">
                                    <div className="col-6">
                                        <div className="bg-light rounded-3 p-3">
                                            <p className="small text-muted mb-1">Karta egasi</p>
                                            <p className="fw-semibold mb-0">{paymentInfo.cardHolder}</p>
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <div className="bg-light rounded-3 p-3">
                                            <p className="small text-muted mb-1">Summa</p>
                                            <p className="fw-semibold mb-0">{paymentInfo.bookPrice?.toLocaleString()} so'm</p>
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
                            <div className="modal-footer border-0 pt-0">
                                <button
                                    type="button"
                                    className="btn btn-light rounded-3 w-100"
                                    onClick={() => setShowBuyModal(false)}
                                >
                                    Yopish
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Subscription Payment Modal */}
            {showPaymentModal && paymentInfo && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                        <div className="modal-content rounded-4 border-0">
                            <div className="modal-header border-0 pb-0">
                                <h5 className="modal-title fw-bold d-flex align-items-center gap-2">
                                    <span className="material-symbols-outlined text-primary">payments</span>
                                    {isExpired ? 'Obuna muddati tugadi' : 'Obunani uzaytirish'}
                                </h5>
                                {/* Only show close button if not expired */}
                                {!isExpired && (
                                    <button
                                        type="button"
                                        className="btn-close"
                                        onClick={() => setShowPaymentModal(false)}
                                    ></button>
                                )}
                            </div>
                            <div className="modal-body">
                                {/* Current Status */}
                                <div
                                    className="rounded-4 p-3 mb-4 text-center"
                                    style={{
                                        backgroundColor: daysRemaining <= 3 ? '#fee2e2' : '#e0f2fe'
                                    }}
                                >
                                    <p className="small fw-semibold mb-1" style={{ color: daysRemaining <= 3 ? '#dc2626' : '#0284c7' }}>
                                        Qolgan muddat
                                    </p>
                                    <h2 className="h3 fw-bold mb-0" style={{ color: daysRemaining <= 3 ? '#dc2626' : '#0284c7' }}>
                                        {daysRemaining} kun
                                    </h2>
                                </div>

                                {/* Package Selection */}
                                <div className="mb-4">
                                    <h6 className="fw-bold mb-3">Obuna paketlari</h6>
                                    <div className="d-flex flex-column gap-2">
                                        {packages.map(pkg => (
                                            <div
                                                key={pkg.days}
                                                className={`d-flex align-items-center justify-content-between rounded-3 p-3 ${selectedDays === pkg.days ? 'bg-primary text-white' : 'bg-light'}`}
                                                style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                                                onClick={() => setSelectedDays(pkg.days)}
                                            >
                                                <div className="d-flex align-items-center gap-2">
                                                    <span className={`material-symbols-outlined ${selectedDays === pkg.days ? '' : 'text-muted'}`} style={{ fontSize: '20px' }}>
                                                        {selectedDays === pkg.days ? 'radio_button_checked' : 'radio_button_unchecked'}
                                                    </span>
                                                    <span className="fw-semibold">{pkg.label}</span>
                                                </div>
                                                <span className="fw-bold">
                                                    {(paymentInfo.dailyPrice * pkg.days).toLocaleString()} so'm
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Calculator */}
                                <div className="bg-light rounded-3 p-3 mb-4">
                                    <div className="d-flex align-items-center justify-content-between mb-2">
                                        <span className="small text-muted">Kunlik narx:</span>
                                        <span className="fw-semibold">{paymentInfo.dailyPrice?.toLocaleString()} so'm</span>
                                    </div>
                                    <div className="d-flex align-items-center justify-content-between mb-2">
                                        <span className="small text-muted">Tanlangan muddat:</span>
                                        <span className="fw-semibold">{selectedDays} kun</span>
                                    </div>
                                    <hr className="my-2" />
                                    <div className="d-flex align-items-center justify-content-between">
                                        <span className="fw-bold">Jami to'lov:</span>
                                        <span className="fw-bold text-primary fs-5">
                                            {(paymentInfo.dailyPrice * selectedDays).toLocaleString()} so'm
                                        </span>
                                    </div>
                                </div>

                                {/* Custom Days Input */}
                                <div className="mb-4">
                                    <label className="form-label small fw-semibold">Boshqa muddat (kun)</label>
                                    <div className="input-group">
                                        <input
                                            type="number"
                                            className="form-control rounded-start-3"
                                            min="1"
                                            max="365"
                                            value={selectedDays}
                                            onChange={(e) => setSelectedDays(Math.max(1, Math.min(365, parseInt(e.target.value) || 1)))}
                                        />
                                        <span className="input-group-text bg-light">kun</span>
                                    </div>
                                </div>

                                {/* Payment Info */}
                                <div className="bg-light rounded-3 p-3 mb-3">
                                    <p className="small text-muted mb-1">Karta raqami</p>
                                    <div className="d-flex align-items-center justify-content-between">
                                        <p className="fw-bold font-monospace mb-0 fs-5">{paymentInfo.cardNumber}</p>
                                        <button onClick={copyCardNumber} className="btn btn-sm btn-outline-primary rounded-2">
                                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                                                {copied ? 'check' : 'content_copy'}
                                            </span>
                                        </button>
                                    </div>
                                </div>

                                <div className="row g-3 mb-4">
                                    <div className="col-6">
                                        <div className="bg-light rounded-3 p-3">
                                            <p className="small text-muted mb-1">Karta egasi</p>
                                            <p className="fw-semibold mb-0">{paymentInfo.cardHolder}</p>
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <div className="bg-light rounded-3 p-3">
                                            <p className="small text-muted mb-1">To'lov summasi</p>
                                            <p className="fw-bold text-primary mb-0">{(paymentInfo.dailyPrice * selectedDays).toLocaleString()} so'm</p>
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
                            {/* Only show close button if not expired */}
                            {!isExpired && (
                                <div className="modal-footer border-0 pt-0">
                                    <button
                                        type="button"
                                        className="btn btn-light rounded-3 w-100"
                                        onClick={() => setShowPaymentModal(false)}
                                    >
                                        Yopish
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
