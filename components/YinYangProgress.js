'use client';

import { Check, Star } from 'lucide-react';

/**
 * YinYang Progress Component
 * Shows lesson and game completion status
 * - Yin (left): Green when lesson completed with 5 stars
 * - Yang (right): Green when game won
 * - Both complete: Full green circle with checkmark
 */

export default function YinYangProgress({ lessonCompleted, gameWon, size = 60 }) {
    const bothComplete = lessonCompleted && gameWon;

    // Colors
    const incompleteColor = '#e5e7eb';
    const yinColor = lessonCompleted ? '#16a34a' : incompleteColor; // Dark green
    const yangColor = gameWon ? '#22c55e' : incompleteColor; // Light green

    // If both complete, show full green circle with checkmark
    if (bothComplete) {
        return (
            <div
                style={{
                    width: size,
                    height: size,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(22, 163, 74, 0.4)',
                    border: '3px solid #fff'
                }}
            >
                <Check
                    size={size * 0.5}
                    color="#fff"
                    strokeWidth={3}
                />
            </div>
        );
    }

    return (
        <div
            style={{
                width: size,
                height: size,
                position: 'relative',
                borderRadius: '50%',
                overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                border: '3px solid #fff'
            }}
        >
            {/* SVG Yin Yang */}
            <svg
                width={size}
                height={size}
                viewBox="0 0 100 100"
                style={{ position: 'absolute', top: 0, left: 0 }}
            >
                {/* Yang (right) half - background */}
                <circle cx="50" cy="50" r="50" fill={yangColor} />

                {/* Yin (left) half - S curve */}
                <path
                    d="M50,0 A50,50 0 0,0 50,100 A25,25 0 0,0 50,50 A25,25 0 0,1 50,0"
                    fill={yinColor}
                />

                {/* Small dot in Yin area (top) */}
                <circle cx="50" cy="25" r="8" fill={yangColor} />

                {/* Small dot in Yang area (bottom) */}
                <circle cx="50" cy="75" r="8" fill={yinColor} />
            </svg>

            {/* Icons */}
            {lessonCompleted && (
                <div
                    style={{
                        position: 'absolute',
                        top: '18%',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        zIndex: 2
                    }}
                >
                    <Check size={size * 0.2} color="#fff" strokeWidth={3} />
                </div>
            )}
            {gameWon && (
                <div
                    style={{
                        position: 'absolute',
                        bottom: '18%',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        zIndex: 2
                    }}
                >
                    <Star size={size * 0.2} color="#fff" fill="#fff" />
                </div>
            )}
        </div>
    );
}
