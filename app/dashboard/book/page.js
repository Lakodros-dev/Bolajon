'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const PDF_PATH = '/book/bolajon-darslik.pdf';

export default function BookPage() {
    const [loading, setLoading] = useState(true);
    const [showBuyModal, setShowBuyModal] = useState(false);
    const [paymentInfo, setPaymentInfo] = useState(null);
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
                    bookPrice: data.bookPrice || 50000
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

    return (
        <div className="page-content d-flex flex-column" style={{ height: '100vh' }}>
            {/* Buy Book Banner - Pinned */}
            <div className="text-white py-2 px-3 d-flex align-items-center justify-content-between flex-wrap gap-2"
                style={{
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    position: 'sticky',
                    top: 0,
                    zIndex: 100
                }}>
                <div className="d-flex align-items-center gap-2">
                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>auto_stories</span>
                    <span className="small fw-semibold">Kitobning bosmaxona variantini xarid qiling!</span>
                </div>
                <button
                    onClick={() => setShowBuyModal(true)}
                    className="btn btn-light btn-sm rounded-pill px-3 py-1 fw-semibold d-flex align-items-center"
                >
                    <span className="material-symbols-outlined me-1" style={{ fontSize: '16px' }}>shopping_cart</span>
                    Sotib olish
                </button>
            </div>

            {/* Header */}
            <div className="bg-white border-bottom px-3 py-3">
                <div className="d-flex align-items-center gap-3">
                    <Link href="/dashboard" className="btn btn-light rounded-circle p-2">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </Link>
                    <div>
                        <h1 className="h6 fw-bold mb-0">Bolajon Darsligi</h1>
                        <p className="small text-muted mb-0">Elektron variant</p>
                    </div>
                </div>
            </div>

            {/* PDF Viewer */}
            <div className="flex-grow-1 position-relative bg-light">
                {loading && (
                    <div className="position-absolute top-50 start-50 translate-middle text-center">
                        <div className="spinner-border text-primary mb-3" role="status"></div>
                        <p className="text-muted">Kitob yuklanmoqda...</p>
                    </div>
                )}
                <iframe
                    src={`${PDF_PATH}#toolbar=0&navpanes=0`}
                    className="w-100 h-100 border-0"
                    style={{ display: loading ? 'none' : 'block' }}
                    onLoad={() => setLoading(false)}
                    title="Bolajon Darsligi"
                />
            </div>

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
                                {/* Price */}
                                <div className="bg-warning bg-opacity-10 rounded-4 p-4 mb-4 text-center">
                                    <p className="text-warning small fw-semibold mb-1">Bosmaxona varianti narxi</p>
                                    <h2 className="display-6 fw-bold text-warning mb-0">
                                        {paymentInfo.bookPrice?.toLocaleString()} <span className="fs-5">so'm</span>
                                    </h2>
                                </div>

                                {/* Payment Info */}
                                <div className="bg-light rounded-3 p-3 mb-3">
                                    <p className="small text-muted mb-1">Karta raqami</p>
                                    <div className="d-flex align-items-center justify-content-between">
                                        <p className="fw-bold font-monospace mb-0 fs-5">{paymentInfo.cardNumber}</p>
                                        <button
                                            onClick={copyCardNumber}
                                            className="btn btn-sm btn-outline-primary rounded-2"
                                        >
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

                                {/* Contact */}
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
        </div>
    );
}
