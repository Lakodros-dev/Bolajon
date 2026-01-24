'use client';

import { Check } from 'lucide-react';
import Image from 'next/image';

/**
 * YinYang Progress Component
 * Shows lesson and game completion status
 * - Gray circle with alternating favicon.png/icon2.png for incomplete
 * - Gray circle with icon + green checkmark for completed
 * - Full green gradient circle with checkmark for both complete
 */

export default function YinYangProgress({ lessonCompleted, gameWon, size = 60, index = 0 }) {
    const bothComplete = lessonCompleted && gameWon;
    
    // Alternate between favicon.png and icon2.png based on index
    const iconSrc = index % 2 === 0 ? '/favicon.png' : '/icon2.png';

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

    // If only game won, show gray circle with icon and green checkmark
    if (gameWon && !lessonCompleted) {
        return (
            <div
                style={{
                    width: size,
                    height: size,
                    borderRadius: '50%',
                    backgroundColor: '#e5e7eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    border: '3px solid #fff'
                }}
            >
                {/* Icon - full size, no padding */}
                <Image
                    src={iconSrc}
                    alt="Bolajon"
                    width={size}
                    height={size}
                    style={{
                        objectFit: 'cover',
                        borderRadius: '50%'
                    }}
                />
                {/* Green checkmark - smaller */}
                <div
                    style={{
                        position: 'absolute',
                        top: -6,
                        right: -6,
                        backgroundColor: '#22c55e',
                        borderRadius: '50%',
                        width: size * 0.38,
                        height: size * 0.38,
                        border: '3px solid #fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 2px 8px rgba(34, 197, 94, 0.5)',
                        zIndex: 10
                    }}
                >
                    <Check
                        size={size * 0.22}
                        color="#fff"
                        strokeWidth={3.5}
                    />
                </div>
            </div>
        );
    }

    // If only lesson completed, show gray circle with icon and green checkmark
    if (lessonCompleted && !gameWon) {
        return (
            <div
                style={{
                    width: size,
                    height: size,
                    borderRadius: '50%',
                    backgroundColor: '#e5e7eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    border: '3px solid #fff'
                }}
            >
                {/* Icon - full size, no padding */}
                <Image
                    src={iconSrc}
                    alt="Bolajon"
                    width={size}
                    height={size}
                    style={{
                        objectFit: 'cover',
                        borderRadius: '50%'
                    }}
                />
                {/* Green checkmark - smaller */}
                <div
                    style={{
                        position: 'absolute',
                        top: -6,
                        right: -6,
                        backgroundColor: '#16a34a',
                        borderRadius: '50%',
                        width: size * 0.38,
                        height: size * 0.38,
                        border: '3px solid #fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 2px 8px rgba(22, 163, 74, 0.5)',
                        zIndex: 10
                    }}
                >
                    <Check
                        size={size * 0.22}
                        color="#fff"
                        strokeWidth={3.5}
                    />
                </div>
            </div>
        );
    }

    // Default: Nothing completed - show gray circle with icon only
    return (
        <div
            style={{
                width: size,
                height: size,
                borderRadius: '50%',
                backgroundColor: '#e5e7eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                border: '3px solid #fff'
            }}
        >
            {/* Icon - full size, semi-transparent */}
            <Image
                src={iconSrc}
                alt="Bolajon"
                width={size}
                height={size}
                style={{
                    objectFit: 'cover',
                    borderRadius: '50%',
                    opacity: 0.3
                }}
            />
        </div>
    );
}
