'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';
import { LogOut, CreditCard, Phone, Copy, Check, Clock } from 'lucide-react';

export default function BlockedPage() {
    const { logout } = useAuth();
    const [paymentInfo, setPaymentInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        fetchPaymentInfo();
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
                    dailyPrice: data.dailyPrice || 200
                });
            }
        } catch (error) {
            console.error('Failed to fetch payment info:', error);
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

    const packages = paymentInfo ? [
        { days: 15, total: paymentInfo.dailyPrice * 15 },
        { days: 20, total: paymentInfo.dailyPrice * 20 },
        { days: 30, total: paymentInfo.dailyPrice * 30 },
    ] : [];

    return (
        <div className="min-vh-100 d-flex flex-column" style={{ backgroundColor: '#f6f7f8' }}>
            <header className="bg-white border-bottom py-3 px-4">
                <div className="d-flex align-items-center justify-content-between">
                    <Image src="/logo.png" alt="Bolajon.uz" width={120} height={40} style={{ objectFit: 'contain' }} />
                    <button onClick={logout} className="btn btn-outline-secondary btn-sm rounded-3 d-flex align-items-center gap-2">
                        <LogOut size={18} />
                        Chiqish
                    </button>
                </div>
            </header>

            <main className="flex-grow-1 d-flex align-items-center justify-content-center p-4">
                <div className="text-center" style={{ maxWidth: '450px' }}>
                    <div
                        className="rounded-circle mx-auto mb-4 d-flex align-items-center justify-content-center"
                        style={{
                            width: '100px',
                            height: '100px',
                            background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)'
                        }}
                    >
                        <Clock size={48} className="text-white" />
                    </div>

                    <h1 className="h3 fw-bold mb-2">Obuna muddati tugadi</h1>
                    <p className="text-muted mb-4">
                        Platformadan foydalanishni davom ettirish uchun obunani to'lang
                    </p>

                    {loading ? (
                        <div className="spinner-border text-primary"></div>
                    ) : paymentInfo && (
                        <>
                            <div className="card border-0 rounded-4 shadow-sm mb-4">
                                <div className="card-body p-4">
                                    <h6 className="fw-bold mb-3">Obuna paketlari</h6>
                                    <div className="d-flex flex-column gap-2">
                                        {packages.map(pkg => (
                                            <div key={pkg.days} className="d-flex align-items-center justify-content-between bg-light rounded-3 p-3">
                                                <span className="fw-semibold">{pkg.days} kunlik</span>
                                                <span className="fw-bold text-primary">{pkg.total.toLocaleString()} so'm</span>
                                            </div>
                                        ))}
                                    </div>
                                    <p className="small text-muted mt-3 mb-0">Kunlik narx: {paymentInfo.dailyPrice?.toLocaleString()} so'm</p>
                                </div>
                            </div>

                            <div className="card border-0 rounded-4 shadow-sm mb-4">
                                <div className="card-body p-4">
                                    <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
                                        <CreditCard size={20} className="text-primary" />
                                        To'lov ma'lumotlari
                                    </h6>
                                    <div className="bg-light rounded-3 p-3 mb-3">
                                        <p className="small text-muted mb-1">Karta raqami</p>
                                        <div className="d-flex align-items-center justify-content-between">
                                            <p className="fw-bold font-monospace mb-0 fs-5">{paymentInfo.cardNumber}</p>
                                            <button onClick={copyCardNumber} className="btn btn-sm btn-outline-primary rounded-2">
                                                {copied ? <Check size={18} /> : <Copy size={18} />}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="bg-light rounded-3 p-3">
                                        <p className="small text-muted mb-1">Karta egasi</p>
                                        <p className="fw-semibold mb-0">{paymentInfo.cardHolder}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="card border-0 rounded-4 shadow-sm">
                                <div className="card-body p-4">
                                    <p className="text-muted small mb-3">To'lovni amalga oshirgandan so'ng admin bilan bog'laning</p>
                                    <a href={`tel:${paymentInfo.adminPhone}`} className="btn btn-success w-100 rounded-3 py-3 d-flex align-items-center justify-content-center gap-2">
                                        <Phone size={20} />
                                        <span className="fw-bold">{paymentInfo.adminPhone}</span>
                                    </a>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </main>

            <footer className="text-center py-3 text-muted small">
                <p className="mb-0">7 kunlik bepul sinov muddati tugadi</p>
            </footer>
        </div>
    );
}
