'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import { useAuth } from '@/context/AuthContext';

const SubscriptionContext = createContext();

export function SubscriptionProvider({ children }) {
    const { user } = useAuth();
    const [showModal, setShowModal] = useState(false);
    const [isSubscriptionValid, setIsSubscriptionValid] = useState(true);
    const [daysRemaining, setDaysRemaining] = useState(999);
    const [subscriptionChecked, setSubscriptionChecked] = useState(false);

    useEffect(() => {
        if (user && user.role !== 'admin') {
            checkSubscription();
        } else if (user && user.role === 'admin') {
            setSubscriptionChecked(true);
        }
    }, [user]);

    const checkSubscription = async () => {
        try {
            console.log('Checking subscription...');
            
            // Get token from cookie
            const token = document.cookie
                .split('; ')
                .find(row => row.startsWith('token='))
                ?.split('=')[1];
            
            console.log('Token found:', !!token);
            
            const headers = {
                'Content-Type': 'application/json'
            };
            
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
            
            const res = await fetch('/api/auth/me', { headers });
            const data = await res.json();
            
            console.log('Subscription check response:', data);
            
            if (data.success && data.user) {
                const days = data.user.daysRemaining || 0;
                console.log('Days remaining:', days);
                setDaysRemaining(days);
                setIsSubscriptionValid(days > 0);
                setSubscriptionChecked(true);
            } else {
                console.error('Failed to get user data:', data);
                // If no token, assume valid to avoid blocking
                setIsSubscriptionValid(true);
                setSubscriptionChecked(true);
            }
        } catch (error) {
            console.error('Failed to check subscription:', error);
            // On error, assume valid to avoid blocking
            setIsSubscriptionValid(true);
            setSubscriptionChecked(true);
        }
    };

    const requireSubscription = (callback) => {
        console.log('requireSubscription called:', {
            userRole: user?.role,
            isSubscriptionValid,
            daysRemaining
        });
        
        if (user?.role === 'admin' || isSubscriptionValid) {
            console.log('Subscription valid, executing callback');
            callback();
        } else {
            console.log('Subscription invalid, showing modal');
            setShowModal(true);
        }
    };

    return (
        <SubscriptionContext.Provider value={{
            showModal,
            setShowModal,
            isSubscriptionValid,
            daysRemaining,
            requireSubscription,
            checkSubscription,
            subscriptionChecked
        }}>
            {children}
        </SubscriptionContext.Provider>
    );
}

export function useSubscription() {
    const context = useContext(SubscriptionContext);
    if (!context) {
        throw new Error('useSubscription must be used within SubscriptionProvider');
    }
    return context;
}

export default function SubscriptionModal() {
    const { user } = useAuth();
    const { showModal, setShowModal, daysRemaining, checkSubscription } = useSubscription();
    const [paymentInfo, setPaymentInfo] = useState(null);
    const [copied, setCopied] = useState(false);
    const [selectedDays, setSelectedDays] = useState(1);
    const [loading, setLoading] = useState(true);

    const packages = [
        { days: 1, label: '1 kun' },
        { days: 7, label: '1 hafta' },
        { days: 30, label: '1 oy' },
    ];

    useEffect(() => {
        if (user) {
            fetchData();
        }
    }, [user]);

    const fetchData = async () => {
        try {
            const settingsRes = await fetch('/api/settings');
            const settingsData = await settingsRes.json();

            if (settingsData.success) {
                setPaymentInfo({
                    adminPhone: settingsData.adminPhone,
                    cardNumber: settingsData.cardNumber,
                    cardHolder: settingsData.cardHolder,
                    dailyPrice: settingsData.dailyPrice || 500
                });
            }
        } catch (error) {
            console.error('Failed to fetch subscription data:', error);
        } finally {
            setLoading(false);
        }
    };

    const copyCardNumber = () => {
        if (paymentInfo?.cardNumber) {
            navigator.clipboard.writeText(paymentInfo.cardNumber.replace(/\s/g, ''));
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    // Don't render anything if loading, no user, or admin
    if (loading || !user || user.role === 'admin') {
        console.log('SubscriptionModal: Not rendering', { loading, hasUser: !!user, role: user?.role });
        return null;
    }

    // Only show modal when explicitly requested
    if (!showModal || !paymentInfo) {
        console.log('SubscriptionModal: Not showing', { showModal, hasPaymentInfo: !!paymentInfo });
        return null;
    }

    const isExpired = daysRemaining <= 0;
    console.log('SubscriptionModal: Rendering', { showModal, isExpired, daysRemaining });

    return (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 10000 }}>
            <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                <div className="modal-content rounded-4 border-0">
                    <div className="modal-header border-0 pb-0">
                        <h5 className="modal-title fw-bold d-flex align-items-center gap-2">
                            <span className="material-symbols-outlined text-primary">payments</span>
                            {isExpired ? 'Obuna muddati tugadi' : 'Obunani uzaytirish'}
                        </h5>
                        {!isExpired && (
                            <button
                                type="button"
                                className="btn-close"
                                onClick={() => setShowModal(false)}
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
                            {isExpired && (
                                <p className="small mb-0 mt-2" style={{ color: '#dc2626' }}>
                                    Davom ettirish uchun to'lov qiling
                                </p>
                            )}
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
                            <small className="text-muted">Minimal: 1 kun (500 so'm)</small>
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
                    {!isExpired && (
                        <div className="modal-footer border-0 pt-0">
                            <button
                                type="button"
                                className="btn btn-light rounded-3 w-100"
                                onClick={() => setShowModal(false)}
                            >
                                Yopish
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
