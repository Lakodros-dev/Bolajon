'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
    return (
        <footer className="bg-dark text-white px-3 py-4 mt-auto">
            <div className="container-fluid">
                <div className="row g-4 mb-3">
                    {/* About */}
                    <div className="col-12 col-md-5">
                        <Image src="/logo.png" alt="Bolajon.uz" width={100} height={32} style={{ objectFit: 'contain' }} />
                        <p className="text-white-50 mt-2 small mb-0">
                            Bolalar uchun ingliz tili o'rgatish platformasi. Interaktiv darslar va qiziqarli o'yinlar.
                        </p>
                    </div>

                    {/* Links */}
                    <div className="col-6 col-md-3">
                        <h6 className="fw-bold mb-2 small">Sahifalar</h6>
                        <ul className="list-unstyled mb-0">
                            <li><Link href="/dashboard" className="text-white-50 text-decoration-none small">Bosh sahifa</Link></li>
                            <li><Link href="/dashboard/lessons" className="text-white-50 text-decoration-none small">Darslar</Link></li>
                            <li><Link href="/dashboard/leaderboard" className="text-white-50 text-decoration-none small">Reyting</Link></li>
                        </ul>
                    </div>

                    {/* Developer */}
                    <div className="col-6 col-md-4">
                        <h6 className="fw-bold mb-2 small">Ishlab chiquvchi</h6>
                        <div className="d-flex align-items-center gap-2">
                            <div className="rounded-circle bg-primary d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }}>
                                <span className="material-symbols-outlined text-white" style={{ fontSize: '16px' }}>code</span>
                            </div>
                            <div>
                                <p className="fw-semibold mb-0 small">Lakodros</p>
                                <p className="text-white-50 mb-0" style={{ fontSize: '11px' }}>Prox Company</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom */}
                <div className="border-top border-secondary pt-3">
                    <p className="text-white-50 small mb-0 text-center">
                        © 2024 Bolajon.uz • O'zbekistonda ishlab chiqilgan ❤️
                    </p>
                </div>
            </div>
        </footer>
    );
}
