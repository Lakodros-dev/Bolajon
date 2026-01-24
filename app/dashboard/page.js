'use client';

import { useState, useEffect } from 'react';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import Header from '@/components/dashboard/Header';
import Link from 'next/link';
import { Play, GraduationCap, CheckCircle2, Star, BookOpen, Download, ShoppingCart, Phone, Video, Users, HelpCircle, Copy, Check } from 'lucide-react';

const quickActions = [
    { icon: 'UserPlus', label: "O'quvchi qo'shish", href: '/dashboard/students/add', color: '#E0F2FE', iconColor: '#0284c7', tour: 'add-student' },
    { icon: 'Play', label: 'Dars boshlash', href: '/dashboard/lessons', color: '#DCFCE7', iconColor: '#16a34a', tour: 'start-lesson' },
    { icon: 'Star', label: 'Yulduz berish', href: '/dashboard/students', color: '#FEF3C7', iconColor: '#d97706' },
    { icon: 'Gift', label: "Sovg'a berish", href: '/dashboard/rewards', color: '#F3E8FF', iconColor: '#9333ea' },
];

// Icon component mapper
const IconComponent = ({ name, ...props }) => {
    const icons = {
        UserPlus: () => <Users {...props} />,
        Play: () => <Play {...props} />,
        Star: () => <Star {...props} fill="#fbbf24" />,
        Gift: () => <ShoppingCart {...props} />
    };
    const Icon = icons[name] || icons.Star;
    return <Icon />;
};

export default function DashboardPage() {
    const { dashboard, initialLoading } = useData();
    const { user } = useAuth();
    const [showBuyModal, setShowBuyModal] = useState(false);
    const [paymentInfo, setPaymentInfo] = useState(null);
    const [copied, setCopied] = useState(false);
    const [daysRemaining, setDaysRemaining] = useState(0);

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
                    bookPrice: data.bookPrice || 50000
                });
            }
        } catch (error) {
            console.error('Failed to fetch payment info:', error);
        }
    };

    const fetchSubscriptionInfo = async () => {
        try {
            const res = await fetch('/api/auth/me', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await res.json();
            if (data.success && data.user) {
                setDaysRemaining(data.user.daysRemaining || 0);
            }
        } catch (error) {
            console.error('Failed to fetch subscription info:', error);
        }
    };

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
                breadcrumbs={[
                    { label: 'Asosiy', href: '/dashboard' }
                ]}
            />

            <main className="p-3">
                {/* Welcome Banner */}
                <div data-tour="welcome" className="card border-0 rounded-4 mb-4 overflow-hidden" style={{ background: 'linear-gradient(135deg, #2b8cee 0%, #1e40af 100%)' }}>
                    <div className="card-body text-white p-4">
                        <h2 className="h4 fw-bold mb-2">
                            Xush kelibsiz, <span style={{ color: '#fde68a' }}>{user?.name || 'Ustoz'}!</span>
                        </h2>
                        <p className="small opacity-75 mb-3">
                            Darslarni o'rgatishni boshlang
                        </p>
                        <Link href="/dashboard/lessons" prefetch={true} className="btn btn-light btn-sm rounded-pill px-4 fw-semibold d-inline-flex align-items-center gap-2">
                            <Play size={18} />
                            Darsni boshlash
                        </Link>
                    </div>
                </div>

                {/* Stats Cards */}
                <div data-tour="stats" className="row g-2 mb-4">
                    <div className="col-4">
                        <div className="card border-0 rounded-4 h-100 card-pastel-blue">
                            <div className="card-body text-center p-2 p-sm-3">
                                <GraduationCap size={28} color="#0284c7" className="mb-1" />
                                <h3 className="h5 fw-bold mb-0">{initialLoading ? '-' : dashboard.totalStudents}</h3>
                                <p className="small text-muted mb-0" style={{ fontSize: '11px', whiteSpace: 'nowrap' }}>Bolalar</p>
                            </div>
                        </div>
                    </div>
                    <div className="col-4">
                        <div className="card border-0 rounded-4 h-100 card-pastel-green">
                            <div className="card-body text-center p-2 p-sm-3">
                                <CheckCircle2 size={28} color="#16a34a" className="mb-1" />
                                <h3 className="h5 fw-bold mb-0">{initialLoading ? '-' : dashboard.completedLessons}</h3>
                                <p className="small text-muted mb-0" style={{ fontSize: '11px', whiteSpace: 'nowrap' }}>Darslar</p>
                            </div>
                        </div>
                    </div>
                    <div className="col-4">
                        <div className="card border-0 rounded-4 h-100 card-pastel-yellow">
                            <div className="card-body text-center p-2 p-sm-3">
                                <Star size={28} fill="#fbbf24" color="#fbbf24" className="mb-1" />
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
                                <BookOpen size={40} />
                            </Link>
                            <div className="flex-grow-1">
                                <h3 className="fw-bold mb-0" style={{ fontSize: '1.1rem' }}>Bolajon kursining mashq kitobidan foydalaning</h3>
                            </div>
                        </div>
                        <div className="d-flex gap-2 mt-3">
                            <a
                                href="/book/bolajon-darslik.pdf"
                                download="Bolajon-Mashq-Kitobi.pdf"
                                className="btn btn-light btn-sm rounded-pill px-4 fw-semibold d-inline-flex align-items-center gap-2"
                            >
                                <Download size={18} />
                                Yuklab olish
                            </a>
                            <button
                                onClick={() => setShowBuyModal(true)}
                                className="btn btn-outline-light btn-sm rounded-pill px-4 fw-semibold d-inline-flex align-items-center gap-2"
                            >
                                <ShoppingCart size={18} />
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
                                            <IconComponent name={action.icon} size={24} color={action.iconColor} />
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
                            <HelpCircle size={20} className="text-muted" />
                        </div>

                        <div className="d-flex flex-column gap-3">
                            <div className="d-flex align-items-start gap-3 p-3 rounded-4" style={{ backgroundColor: '#E0F2FE' }}>
                                <div className="rounded-3 p-2 bg-white">
                                    <Video size={20} color="#0284c7" />
                                </div>
                                <div>
                                    <h4 className="small fw-bold mb-1">1. Video darsni ko'ring</h4>
                                    <p className="small text-muted mb-0">Interaktiv video darslarni tomosha qiling</p>
                                </div>
                            </div>

                            <div className="d-flex align-items-start gap-3 p-3 rounded-4" style={{ backgroundColor: '#DCFCE7' }}>
                                <div className="rounded-3 p-2 bg-white">
                                    <Users size={20} color="#16a34a" />
                                </div>
                                <div>
                                    <h4 className="small fw-bold mb-1">2. Bolalarga o'rgating</h4>
                                    <p className="small text-muted mb-0">O'rgangan narsalaringizni bolalarga o'rgating</p>
                                </div>
                            </div>

                            <div className="d-flex align-items-start gap-3 p-3 rounded-4" style={{ backgroundColor: '#FEF3C7' }}>
                                <div className="rounded-3 p-2 bg-white">
                                    <Star size={20} fill="#fbbf24" color="#fbbf24" />
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
                                    <BookOpen size={24} className="text-warning" />
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
                                            {copied ? <Check size={18} /> : <Copy size={18} />}
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
                                    <Phone size={20} />
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
        </div>
    );
}
