'use client';

/**
 * YinYang Progress Component
 * Shows lesson and game completion status
 * - Left half (Yin): Green when lesson completed with 5 stars - checkmark icon
 * - Right half (Yang): Green when game won - star icon
 */

export default function YinYangProgress({ lessonCompleted, gameWon, size = 60 }) {
    const halfSize = size / 2;
    const smallCircleSize = size / 5;
    const iconSize = size / 4;

    // Colors
    const incompleteColor = '#e0e0e0';
    const yinColor = lessonCompleted ? '#16a34a' : incompleteColor; // Dark green
    const yangColor = gameWon ? '#22c55e' : incompleteColor; // Light green

    return (
        <div
            style={{
                width: size,
                height: size,
                position: 'relative',
                borderRadius: '50%',
                overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                border: '2px solid #fff'
            }}
        >
            {/* SVG Yin Yang */}
            <svg
                width={size}
                height={size}
                viewBox="0 0 100 100"
                style={{ position: 'absolute', top: 0, left: 0 }}
            >
                {/* Background circle */}
                <circle cx="50" cy="50" r="50" fill={yangColor} />

                {/* Yin (left) half - S curve */}
                <path
                    d="M50,0 A50,50 0 0,0 50,100 A25,25 0 0,0 50,50 A25,25 0 0,1 50,0"
                    fill={yinColor}
                />

                {/* Small circle in Yin (checkmark area) */}
                <circle cx="50" cy="25" r="10" fill={yangColor} />

                {/* Small circle in Yang (star area) */}
                <circle cx="50" cy="75" r="10" fill={yinColor} />
            </svg>

            {/* Checkmark icon for Yin (lesson) - top */}
            <div
                style={{
                    position: 'absolute',
                    top: '15%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    fontSize: iconSize * 0.8,
                    color: lessonCompleted ? '#fff' : '#999',
                    zIndex: 2
                }}
            >
                <span className="material-symbols-outlined" style={{ fontSize: iconSize * 0.8 }}>
                    check
                </span>
            </div>

            {/* Star icon for Yang (game) - bottom */}
            <div
                style={{
                    position: 'absolute',
                    bottom: '15%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    fontSize: iconSize * 0.8,
                    color: gameWon ? '#fff' : '#999',
                    zIndex: 2
                }}
            >
                <span className="material-symbols-outlined" style={{ fontSize: iconSize * 0.8 }}>
                    star
                </span>
            </div>
        </div>
    );
}
