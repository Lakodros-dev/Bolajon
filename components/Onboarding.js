'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

/**
 * Onboarding flow - ketma-ket sahifalar
 */
const ONBOARDING_FLOW = [
    { page: 'dashboard', nextPage: '/dashboard/lessons', nextLabel: 'Darslar' },
    { page: 'lessons', nextPage: '/dashboard/students', nextLabel: "O'quvchilar" },
    { page: 'students', nextPage: '/dashboard/games', nextLabel: "O'yinlar" },
    { page: 'games', nextPage: null, nextLabel: null }
];

const PAGE_STEPS = {
    dashboard: [
        {
            target: '[data-tour="welcome"]',
            title: 'Xush kelibsiz! 👋',
            content: "Bolajon - bolalarga ingliz tilini o'rgatish platformasi.",
            position: 'bottom'
        },
        {
            target: '[data-tour="stats"]',
            title: 'Statistika 📊',
            content: "O'quvchilar, darslar va yulduzlar soni.",
            position: 'bottom'
        },
        {
            target: '[data-tour="book"]',
            title: 'Mashq kitobi 📚',
            content: "Kitobni yuklab oling yoki onlayn o'qing.",
            position: 'top'
        },
        {
            target: '[data-tour="add-student"]',
            title: "O'quvchi qo'shish 👤",
            content: "Avval o'quvchilaringizni qo'shing.",
            position: 'bottom'
        },
        {
            target: '[data-tour="start-lesson"]',
            title: 'Dars boshlash 🎬',
            content: "Video darslarni ko'ring va o'rgating.",
            position: 'bottom'
        }
    ],
    lessons: [
        {
            target: '[data-tour="lessons-list"]',
            title: 'Video darslar 🎬',
            content: "Barcha darslar darajalar bo'yicha tartiblangan.",
            position: 'bottom'
        },
        {
            target: '[data-tour="lesson-card"]',
            title: 'Darsni tanlang',
            content: "Darsni bosib videoni tomosha qiling.",
            position: 'bottom'
        }
    ],
    students: [
        {
            target: '[data-tour="students-list"]',
            title: "O'quvchilar 👥",
            content: "Barcha o'quvchilaringiz shu yerda.",
            position: 'bottom'
        },
        {
            target: '[data-tour="add-student-btn"]',
            title: "Yangi o'quvchi ➕",
            content: "Bu tugma orqali yangi o'quvchi qo'shing.",
            position: 'top'
        },
        {
            target: '[data-tour="student-card"]',
            title: "O'quvchi kartasi",
            content: "Yulduz berish uchun o'quvchini tanlang.",
            position: 'bottom'
        }
    ],
    games: [
        {
            target: '[data-tour="games-list"]',
            title: "O'yinlar 🎮",
            content: "Bolalar bilan birga o'ynash uchun o'yinlar.",
            position: 'bottom'
        },
        {
            target: '[data-tour="game-card"]',
            title: "O'yin tanlang",
            content: "O'yinni bosing va bolalar bilan o'ynang.",
            position: 'bottom'
        }
    ]
};

export default function Onboarding({ page = 'dashboard' }) {
    const { token } = useAuth();
    const router = useRouter();
    const [isActive, setIsActive] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [showNextPage, setShowNextPage] = useState(false);
    const [tooltipStyle, setTooltipStyle] = useState({});
    const [highlightStyle, setHighlightStyle] = useState({});
    const [steps, setSteps] = useState([]);

    const flowInfo = ONBOARDING_FLOW.find(f => f.page === page);

    useEffect(() => {
        if (!token) return;

        const checkOnboarding = async () => {
            try {
                const res = await fetch('/api/onboarding', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await res.json();

                if (data.success && !data.completedPages?.includes(page)) {
                    const pageSteps = PAGE_STEPS[page] || [];
                    if (pageSteps.length > 0) {
                        setSteps(pageSteps);
                        setTimeout(() => setIsActive(true), 800);
                    }
                }
            } catch (error) {
                console.error('Onboarding check error:', error);
            }
        };

        checkOnboarding();
    }, [token, page]);

    const calculatePosition = useCallback(() => {
        if (steps.length === 0 || showNextPage) return;

        const step = steps[currentStep];
        if (!step) return;

        const element = document.querySelector(step.target);

        if (!element) {
            if (currentStep < steps.length - 1) {
                setCurrentStep(prev => prev + 1);
            } else {
                finishPageTour();
            }
            return;
        }

        const rect = element.getBoundingClientRect();
        const scrollTop = window.scrollY;
        const scrollLeft = window.scrollX;

        setHighlightStyle({
            top: rect.top + scrollTop - 8,
            left: rect.left + scrollLeft - 8,
            width: rect.width + 16,
            height: rect.height + 16,
        });

        const tooltipWidth = Math.min(300, window.innerWidth - 32);
        let tooltipTop, tooltipLeft;

        switch (step.position) {
            case 'top':
                tooltipTop = rect.top + scrollTop - 150;
                break;
            case 'left':
                tooltipTop = rect.top + scrollTop;
                tooltipLeft = Math.max(16, rect.left + scrollLeft - tooltipWidth - 16);
                break;
            default:
                tooltipTop = rect.bottom + scrollTop + 16;
        }

        if (step.position !== 'left') {
            tooltipLeft = Math.max(16, Math.min(
                rect.left + scrollLeft + (rect.width / 2) - (tooltipWidth / 2),
                window.innerWidth - tooltipWidth - 16
            ));
        }

        setTooltipStyle({ top: tooltipTop, left: tooltipLeft, width: tooltipWidth });
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, [currentStep, steps, showNextPage]);

    useEffect(() => {
        if (isActive && steps.length > 0 && !showNextPage) {
            calculatePosition();
            window.addEventListener('resize', calculatePosition);
            return () => window.removeEventListener('resize', calculatePosition);
        }
    }, [isActive, currentStep, calculatePosition, steps, showNextPage]);

    const finishPageTour = () => {
        // Show next page prompt if there's a next page
        if (flowInfo?.nextPage) {
            setShowNextPage(true);
        } else {
            handleComplete();
        }
    };

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            finishPageTour();
        }
    };

    const handlePrev = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const handleComplete = async () => {
        setIsActive(false);
        setShowNextPage(false);

        try {
            await fetch('/api/onboarding', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ page })
            });
        } catch (error) {
            console.error('Complete onboarding error:', error);
        }
    };

    const handleGoToNextPage = async () => {
        await handleComplete();
        if (flowInfo?.nextPage) {
            router.push(flowInfo.nextPage);
        }
    };

    const handleSkipAll = async () => {
        setIsActive(false);
        setShowNextPage(false);

        try {
            // Mark all pages as completed in one request
            await fetch('/api/onboarding', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ skipAll: true })
            });
        } catch (error) {
            console.error('Skip all error:', error);
        }
    };

    if (!isActive) return null;

    // Next page prompt
    if (showNextPage && flowInfo?.nextPage) {
        return (
            <>
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        zIndex: 9998,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '16px'
                    }}
                >
                    <div
                        style={{
                            backgroundColor: 'white',
                            borderRadius: '20px',
                            padding: '24px',
                            maxWidth: '340px',
                            width: '100%',
                            textAlign: 'center',
                        }}
                    >
                        <div
                            className="rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center"
                            style={{
                                width: '64px',
                                height: '64px',
                                backgroundColor: '#dcfce7'
                            }}
                        >
                            <span className="material-symbols-outlined" style={{ fontSize: '32px', color: '#16a34a' }}>
                                check_circle
                            </span>
                        </div>

                        <h4 className="fw-bold mb-2">Ajoyib! ✨</h4>
                        <p className="text-muted mb-4" style={{ fontSize: '0.9rem' }}>
                            Bu sahifa bilan tanishdingiz. Endi "{flowInfo.nextLabel}" sahifasiga o'tamizmi?
                        </p>

                        <div className="d-flex flex-column gap-2">
                            <button
                                onClick={handleGoToNextPage}
                                className="btn btn-primary rounded-pill py-2 d-flex align-items-center justify-content-center gap-2"
                            >
                                {flowInfo.nextLabel} sahifasiga o'tish
                                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_forward</span>
                            </button>

                            <button
                                onClick={handleComplete}
                                className="btn btn-light rounded-pill py-2"
                            >
                                Keyinroq davom etaman
                            </button>

                            <button
                                onClick={handleSkipAll}
                                className="btn btn-outline-secondary rounded-pill py-2"
                            >
                                <span className="material-symbols-outlined me-1" style={{ fontSize: '18px' }}>close</span>
                                Qo'llanmani o'tkazib yuborish
                            </button>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    const step = steps[currentStep];
    if (!step) return null;

    return (
        <>
            {/* Overlay */}
            <div
                onClick={handleComplete}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    zIndex: 9998,
                }}
            />

            {/* Highlight */}
            <div
                style={{
                    position: 'absolute',
                    ...highlightStyle,
                    borderRadius: '16px',
                    boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.7)',
                    zIndex: 9999,
                    pointerEvents: 'none',
                    transition: 'all 0.3s ease',
                }}
            />

            {/* Tooltip */}
            <div
                style={{
                    position: 'absolute',
                    ...tooltipStyle,
                    backgroundColor: 'white',
                    borderRadius: '16px',
                    padding: '16px',
                    zIndex: 10000,
                    boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
                    transition: 'all 0.3s ease',
                }}
            >
                {/* Progress */}
                <div className="d-flex justify-content-center gap-1 mb-2">
                    {steps.map((_, i) => (
                        <div
                            key={i}
                            style={{
                                width: i === currentStep ? '20px' : '6px',
                                height: '6px',
                                borderRadius: '3px',
                                backgroundColor: i === currentStep ? '#2b8cee' : '#e5e7eb',
                                transition: 'all 0.3s',
                            }}
                        />
                    ))}
                </div>

                {/* Content */}
                <h5 className="fw-bold mb-1" style={{ fontSize: '1rem' }}>{step.title}</h5>
                <p className="text-muted mb-3" style={{ fontSize: '0.85rem', lineHeight: 1.4 }}>{step.content}</p>

                {/* Navigation */}
                <div className="d-flex justify-content-between align-items-center">
                    <button
                        onClick={handleSkipAll}
                        className="btn btn-outline-danger btn-sm rounded-pill px-3 d-flex align-items-center gap-1"
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>close</span>
                        O'tkazish
                    </button>

                    <div className="d-flex gap-2">
                        {currentStep > 0 && (
                            <button onClick={handlePrev} className="btn btn-light btn-sm rounded-pill px-2">
                                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_back</span>
                            </button>
                        )}
                        <button
                            onClick={handleNext}
                            className="btn btn-primary btn-sm rounded-pill px-3 d-flex align-items-center gap-1"
                        >
                            {currentStep === steps.length - 1 ? 'Tayyor' : 'Keyingi'}
                            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                                {currentStep === steps.length - 1 ? 'check' : 'arrow_forward'}
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
