'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function Logo({ size = 50, href = '/', className = '' }) {
    const content = (
        <div className={`d-flex align-items-center ${className}`}>
            <Image
                src="/logo.png"
                alt="Bolajon.uz"
                width={size}
                height={size * 0.6}
                style={{ objectFit: 'contain' }}
            />
        </div>
    );

    if (href) {
        return (
            <Link href={href} className="text-decoration-none text-dark">
                {content}
            </Link>
        );
    }

    return content;
}
