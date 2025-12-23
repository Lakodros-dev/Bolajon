'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';

const PDF_PATH = '/book/bolajon-darslik.pdf';

export default function BookPage() {
    const [loading, setLoading] = useState(true);
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [numPages, setNumPages] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [scale, setScale] = useState(1);
    const [showBuyModal, setShowBuyModal] = useState(false);
    const [paymentInfo, setPaymentInfo] = useState(null);
    const [copied, setCopied] = useState(false);
    const [pdfDoc, setPdfDoc] = useState(null);
    const [renderedPages, setRenderedPages] = useState({});

    const containerRef = useRef(null);
    const canvasRefs = useRef({});

    useEffect(() => {
        fetchPaymentInfo();
        loadPdfJs();
    }, []);

    const loadPdfJs = async () => {
        // Load PDF.js from CDN
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
        script.onload = () => {
            window.pdfjsLib.GlobalWorkerOptions.workerSrc =
                'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
            loadPdf();
        };
        document.head.appendChild(script);
    };

    const loadPdf = async () => {
        try {
            const loadingTask = window.pdfjsLib.getDocument(PDF_PATH);

            loadingTask.onProgress = (progress) => {
                if (progress.total > 0) {
                    setLoadingProgress(Math.round((progress.loaded / progress.total) * 100));
                }
            };

            const pdf = await loadingTask.promise;
            setPdfDoc(pdf);
            setNumPages(pdf.numPages);
            setLoading(false);
        } catch (error) {
            console.error('PDF yuklashda xatolik:', error);
            setLoading(false);
        }
    };

    const renderPage = useCallback(async (pageNum) => {
        if (!pdfDoc || renderedPages[pageNum]) return;

        const page = await pdfDoc.getPage(pageNum);
        const canvas = canvasRefs.current[pageNum];
        if (!canvas) return;

        const context = canvas.getContext('2d');

        // Get page rotation and apply it
        const rotation = page.rotate || 0;
        const viewport = page.getViewport({ scale: scale * 1.5, rotation: rotation });

        canvas.height = viewport.height;
        canvas.width = viewport.width;
        canvas.style.width = '100%';
        canvas.style.height = 'auto';

        await page.render({
            canvasContext: context,
            viewport: viewport
        }).promise;

        setRenderedPages(prev => ({ ...prev, [pageNum]: true }));
    }, [pdfDoc, scale, renderedPages]);

    useEffect(() => {
        if (pdfDoc) {
            // Render current page and adjacent pages
            const pagesToRender = [currentPage - 1, currentPage, currentPage + 1]
                .filter(p => p >= 1 && p <= numPages);

            pagesToRender.forEach(pageNum => {
                renderPage(pageNum);
            });
        }
    }, [pdfDoc, currentPage, numPages, renderPage]);

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

    const goToPage = (page) => {
        const newPage = Math.max(1, Math.min(page, numPages));
        setCurrentPage(newPage);
        // Scroll to page
        const pageElement = document.getElementById(`page-${newPage}`);
        if (pageElement) {
            pageElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const handleScroll = () => {
        if (!containerRef.current) return;
        const container = containerRef.current;
        const scrollTop = container.scrollTop;

        // Find which page is most visible
        for (let i = 1; i <= numPages; i++) {
            const pageElement = document.getElementById(`page-${i}`);
            if (pageElement) {
                const rect = pageElement.getBoundingClientRect();
                const containerRect = container.getBoundingClientRect();
                if (rect.top >= containerRect.top - 100 && rect.top <= containerRect.top + 200) {
                    if (currentPage !== i) setCurrentPage(i);
                    break;
                }
            }
        }
    };

    return (
        <div className="page-content d-flex flex-column" style={{ height: '100vh' }}>
            {/* Buy Book Banner */}
            <div className="text-white py-2 px-3 d-flex align-items-center justify-content-between flex-wrap gap-2"
                style={{
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    position: 'sticky',
                    top: 0,
                    zIndex: 100
                }}>
                <div className="d-flex align-items-center gap-2">
                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>auto_stories</span>
                    <span className="small fw-semibold">Bosmaxona variantini xarid qiling!</span>
                </div>
                <button
                    onClick={() => setShowBuyModal(true)}
                    className="btn btn-light btn-sm rounded-pill px-3 py-1 fw-semibold d-flex align-items-center"
                >
                    <span className="material-symbols-outlined me-1" style={{ fontSize: '16px' }}>shopping_cart</span>
                    Sotib olish
                </button>
            </div>

            {/* Header with Navigation */}
            <div className="bg-white border-bottom px-3 py-2">
                <div className="d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center gap-2">
                        <Link href="/dashboard" className="btn btn-light rounded-circle p-2">
                            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>arrow_back</span>
                        </Link>
                        <div>
                            <h1 className="small fw-bold mb-0">Bolajon Darsligi</h1>
                        </div>
                    </div>

                    {!loading && numPages > 0 && (
                        <div className="d-flex align-items-center gap-2">
                            <button
                                onClick={() => goToPage(currentPage - 1)}
                                disabled={currentPage <= 1}
                                className="btn btn-sm btn-light rounded-circle p-1"
                            >
                                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>chevron_left</span>
                            </button>
                            <span className="small fw-semibold" style={{ minWidth: '60px', textAlign: 'center' }}>
                                {currentPage} / {numPages}
                            </span>
                            <button
                                onClick={() => goToPage(currentPage + 1)}
                                disabled={currentPage >= numPages}
                                className="btn btn-sm btn-light rounded-circle p-1"
                            >
                                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>chevron_right</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* PDF Viewer */}
            <div
                ref={containerRef}
                className="flex-grow-1 overflow-auto bg-secondary bg-opacity-25"
                onScroll={handleScroll}
                style={{ scrollBehavior: 'smooth' }}
            >
                {loading ? (
                    <div className="d-flex flex-column align-items-center justify-content-center h-100">
                        <div className="spinner-border text-primary mb-3" role="status"></div>
                        <p className="text-muted mb-2">Kitob yuklanmoqda...</p>
                        {loadingProgress > 0 && (
                            <div className="progress" style={{ width: '200px', height: '6px' }}>
                                <div
                                    className="progress-bar"
                                    style={{ width: `${loadingProgress}%` }}
                                ></div>
                            </div>
                        )}
                        <p className="small text-muted mt-2">{loadingProgress}%</p>
                    </div>
                ) : (
                    <div className="d-flex flex-column align-items-center py-3 gap-3">
                        {Array.from({ length: numPages }, (_, i) => i + 1).map(pageNum => (
                            <div
                                key={pageNum}
                                id={`page-${pageNum}`}
                                className="bg-white shadow-sm"
                                style={{ maxWidth: '100%', width: 'fit-content' }}
                            >
                                <canvas
                                    ref={el => canvasRefs.current[pageNum] = el}
                                    style={{ display: 'block', maxWidth: '100%' }}
                                />
                                {!renderedPages[pageNum] && (
                                    <div className="d-flex align-items-center justify-content-center p-5">
                                        <div className="spinner-border spinner-border-sm text-primary"></div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
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
        </div>
    );
}
