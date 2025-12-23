'use client';

import { useState, useEffect, useCallback } from 'react';

/**
 * Onboarding Guide Component
 * Interactive step-by-step tour for new users
 */

const ONBOARDING_STEPS = [
    {
        target: '[data-tour="welcome"]',
        title: 'Xush kelibsiz! 👋',
        content: "Bolajon platformasiga xush kelibsiz! Bu qo'llanma sizga platformadan foydalanishni o'rgatadi.",
        position: 'bottom'
    },
    {
        target: '[data-tour="stats"]',
        title: 'Statistika 📊',
        content: "Bu yerda o'quvchilaringiz soni, o'tilgan darslar va yig'ilgan yulduzlarni ko'rishingiz mumkin.",
        position: 'bottom'
    },
    {
        target: '[data-tour="book"]',
        title: 'Mashq kitobi 📚',
        content: "Bolajon kursining mashq kitobini yuklab oling yoki onlayn o'qing. Bosmaxona variantini ham sotib olishingiz mumkin.",
        position: 'top'
    },
    {
        target: '[data-tour="quick-actions"]',
        title: 'Tezkor harakatlar ⚡',
        content: "Bu tugmalar orqali tez o'quvchi qo'shish, dars boshlash, yulduz va sovg'a berishingiz mumkin.",
        position: 'top'
    },
    {
        target: '[data-tour="add-student"]',
        title: "O'quvchi qo'shish 👤",
        content: "Birinchi qadamingiz - o'quvchilaringizni qo'shing. Har bir bola uchun ism kiriting.",
        position: 'bottom'
    },
    {
        target: '[data-tour="start-lesson"]',
        title: 'Dars boshlash 🎬',
        content: "Video darslarni tomosha qiling va bolalarga ingliz tilini o'rgating.",
        position: 'bottom'
    }
];

export default function Onboarding({ onComplete }) {
    const [isActive, setIsActive] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [tooltipStyle, setTooltipStyle] = useState({});
    const [highlightStyle, setHighlightStyle] = useState({});

    useEffect(() => {
        // Check if onboarding was completed
        const completed = localStorage.getItem('onboarding_completed');
        if (!completed) {
            // Delay to let page render
            setTimeout(() => setIsActive(true), 1000);
        }
    }, []);

    const calculatePosition = useCallback(() => {
        const step = ONBOARDING_STEPS[currentStep];
        const element = document.querySelector(step.target);

        if (!element) {
            // If element not found, try next step
            if (currentStep < ONBOARDING_STEPS.length - 1) {
                setCurrentStep(prev => prev + 1);
            }
            return;
        }

        const rect = element.getBoundingClientRect();
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const scrollLeft = window.scrollX || document.documentElement.scrollLeft;

        // Highlight position
        setHighlightStyle({
            top: rect.top + scrollTop - 8,
            left: rect.left + scrollLeft - 8,
            width: rect.width + 16,
            height: rect.height + 16,
        });

        // Tooltip position
        const tooltipWidth = Math.min(320, window.innerWidth - 32);
        let tooltipTop, tooltipLeft;

        if (step.position === 'bottom') {
            tooltipTop = rect.bottom + scrollTop + 16;
            tooltipLeft = Math.max(16, Math.min(
                rect.left + scrollLeft + (rect.width / 2) - (tooltipWidth / 2),
                window.innerWidth - tooltipWidth - 16
            ));
        } else if (step.position === 'top') {
            tooltipTop = rect.top + scrollTop - 180;
            tooltipLeft = Math.max(16, Math.min(
                rect.left + scrollLeft + (rect.width / 2) - (tooltipWidth / 2),
                window.innerWidth - tooltipWidth - 16
            ));
        }

        setTooltipStyle({
            top: tooltipTop,
            left: tooltipLeft,
            width: tooltipWidth,
        });

        // Scroll element into view
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, [currentStep]);

    useEffect(() => {
        if (isActive) {
            calculatePosition();
            window.addEventListener('resize', calculatePosition);
            return () => window.removeEventListener('resize', calculatePosition);
        }
    }, [isActive, currentStep, calculatePosition]);

    const handleNext = () => {
        if (currentStep < ONBOARDING_STEPS.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            handleComplete();
        }
    };

    const handlePrev = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const handleSkip = () => {
        handleComplete();
    };

    const handleComplete = () => {
        setIsActive(false);
        localStorage.setItem('onboarding_completed', 'true');
        if (onComplete) onComplete();
    };

    if (!isActive) return null;

    const step = ONBOARDING_STEPS[currentStep];

    return (
        <>
            {/* Overlay */}
            <div
                className="onboarding-overlay"
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.75)',
                    zIndex: 9998,
                }}
                onClick={handleSkip}
            />

            {/* Highlight */}
            <div
                className="onboarding-highlight"
                style={{
                    position: 'absolute',
                    ...highlightStyle,
                    borderRadius: '16px',
                    boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.75)',
                    zIndex: 9999,
                    pointerEvents: 'none',
                    transition: 'all 0.3s ease',
                }}
            />

            {/* Tooltip */}
            <div
                className="onboarding-tooltip"
                style={{
                    position: 'absolute',
                    ...tooltipStyle,
                    backgroundColor: 'white',
                    borderRadius: '16px',
                    padding: '20px',
                    zIndex: 10000,
                    boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
                    transition: 'all 0.3s ease',
                }}
            >
                {/* Progress dots */}
                <div className="d-flex justify-content-center gap-1 mb-3">
                    {ONBOARDING_STEPS.map((_, index) => (
                        <div
                            key={index}
                            style={{
                                width: index === currentStep ? '24px' : '8px',
                                height: '8px',
                                borderRadius: '4px',
                                backgroundColor: index === currentStep ? '#2b8cee' : '#e5e7eb',
                                transition: 'all 0.3s ease',
                            }}
                        />
                    ))}
                </div>

                {/* Content */}
                <h4 className="fw-bold mb-2" style={{ fontSize: '1.1rem' }}>{step.title}</h4>
                <p className="text-muted mb-4" style={{ fontSize: '0.9rem', lineHeight: 1.5 }}>{step.content}</p>

                {/* Navigation */}
                <div className="d-flex justify-content-between align-items-center">
                    <button
                        onClick={handleSkip}
                        className="btn btn-link text-muted text-decoration-none p-0"
                        style={{ fontSize: '0.85rem' }}
                    >
                        O'tkazib yuborish
                    </button>

                    <div className="d-flex gap-2">
                        {currentStep > 0 && (
                            <button
                                onClick={handlePrev}
                                className="btn btn-light btn-sm rounded-pill px-3"
                            >
                                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_back</span>
                            </button>
                        )}
                        <button
                            onClick={handleNext}
                            className="btn btn-primary btn-sm rounded-pill px-4 d-flex align-items-center gap-1"
                        >
                            {currentStep === ONBOARDING_STEPS.length - 1 ? (
                                <>
                                    Tayyor
                                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>check</span>
                                </>
                            ) : (
                                <>
                                    Keyingi
                                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_forward</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Step counter */}
                <div className="text-center mt-3">
                    <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                        {currentStep + 1} / {ONBOARDING_STEPS.length}
                    </span>
                </div>
            </div>
        </>
    );
}
