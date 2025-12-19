'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import Image from 'next/image';
import PhoneInput from '@/components/PhoneInput';

export default function RegisterPage() {
    const router = useRouter();
    const { register, isAuthenticated } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        phone: '+',
        password: '',
        confirmPassword: ''
    });

    useEffect(() => {
        if (isAuthenticated) {
            router.push('/dashboard');
        }
    }, [isAuthenticated, router]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const phone = formData.phone.replace(/\s/g, '');

        if (phone.length < 10) {
            setError('Telefon raqamni to\'liq kiriting');
            setLoading(false);
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Parollar mos kelmaydi');
            setLoading(false);
            return;
        }

        if (formData.password.length < 6) {
            setError('Parol kamida 6 ta belgidan iborat bo\'lishi kerak');
            setLoading(false);
            return;
        }

        const result = await register(formData.name, phone, formData.password);

        if (!result.success) {
            setError(result.error);
            setLoading(false);
        }
    };

    return (
        <div className="min-vh-100 d-flex" style={{ backgroundColor: '#f6f7f8' }}>
            {/* Left Side - Branding (Desktop only) */}
            <div className="d-none d-lg-flex flex-column justify-content-center align-items-center p-5"
                style={{
                    width: '45%',
                    background: 'linear-gradient(180deg, #6366f1 0%, #2563eb 60%, #1d4ed8 100%)',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                {/* Background decoration */}
                <div className="position-absolute" style={{ top: '-10%', right: '-10%', opacity: 0.1 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '400px', color: 'white' }}>school</span>
                </div>
                <div className="position-absolute" style={{ bottom: '-5%', left: '-5%', opacity: 0.1 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '300px', color: 'white' }}>star</span>
                </div>

                <div className="text-center text-white position-relative" style={{ zIndex: 1 }}>
                    <Image
                        src="/logo.png"
                        alt="Bolajon.uz"
                        width={200}
                        height={70}
                        style={{
                            objectFit: 'contain',
                            filter: 'drop-shadow(0 0 15px rgba(255,255,255,0.9)) drop-shadow(0 0 30px rgba(255,255,255,0.6))'
                        }}
                        className="mb-4"
                    />
                    <h1 className="display-5 fw-bold mb-3">Bolalar uchun ingliz tili</h1>
                    <p className="fs-5 opacity-75 mb-4">5-9 yoshli bolalarga ingliz tilini o'yinlar va interaktiv hikoyalar orqali o'rgatish platformasi</p>

                    <div className="d-flex justify-content-center gap-4 mt-4">
                        <div className="text-center">
                            <h3 className="h2 fw-bold mb-0">500+</h3>
                            <p className="small opacity-75">O'quvchilar</p>
                        </div>
                        <div className="text-center">
                            <h3 className="h2 fw-bold mb-0">50+</h3>
                            <p className="small opacity-75">Video darslar</p>
                        </div>
                        <div className="text-center">
                            <h3 className="h2 fw-bold mb-0">100+</h3>
                            <p className="small opacity-75">O'qituvchilar</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="flex-grow-1 d-flex flex-column">
                {/* Mobile Header */}
                <header className="p-4 d-lg-none">
                    <Link href="/">
                        <Image src="/logo.png" alt="Bolajon.uz" width={140} height={45} style={{ objectFit: 'contain' }} />
                    </Link>
                </header>

                {/* Desktop Header */}
                <header className="p-4 d-none d-lg-flex justify-content-end">
                    <p className="mb-0 text-muted">
                        Hisobingiz bormi?{' '}
                        <Link href="/login" className="text-primary fw-semibold text-decoration-none">Kirish</Link>
                    </p>
                </header>

                {/* Form */}
                <main className="flex-grow-1 d-flex flex-column justify-content-center px-4 px-lg-5 pb-5">
                    <div style={{ maxWidth: '420px', margin: '0 auto', width: '100%' }}>
                        <div className="text-center text-lg-start mb-4">
                            <h2 className="h2 fw-bold mb-2">Ro'yxatdan o'tish</h2>
                            <p className="text-muted">O'qituvchi sifatida ro'yxatdan o'ting</p>
                        </div>

                        <form onSubmit={handleSubmit} method="POST" action="#">
                            {error && (
                                <div className="alert alert-danger rounded-4 mb-4 small">{error}</div>
                            )}

                            <div className="mb-3">
                                <label className="form-label small fw-semibold">To'liq ism</label>
                                <div className="position-relative">
                                    <span className="material-symbols-outlined position-absolute top-50 start-0 translate-middle-y ms-3 text-muted">person</span>
                                    <input
                                        type="text"
                                        name="name"
                                        className="form-control rounded-4 py-3 ps-5"
                                        placeholder="Ismingiz"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="mb-3">
                                <label className="form-label small fw-semibold">Telefon raqam</label>
                                <PhoneInput
                                    name="phone"
                                    className="form-control rounded-end-4 py-3"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="row g-3 mb-4">
                                <div className="col-12 col-md-6">
                                    <label className="form-label small fw-semibold">Parol</label>
                                    <div className="position-relative">
                                        <span className="material-symbols-outlined position-absolute top-50 start-0 translate-middle-y ms-3 text-muted">lock</span>
                                        <input
                                            type="password"
                                            name="password"
                                            className="form-control rounded-4 py-3 ps-5"
                                            placeholder="Kamida 6 ta belgi"
                                            value={formData.password}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="col-12 col-md-6">
                                    <label className="form-label small fw-semibold">Parolni tasdiqlang</label>
                                    <div className="position-relative">
                                        <span className="material-symbols-outlined position-absolute top-50 start-0 translate-middle-y ms-3 text-muted">lock</span>
                                        <input
                                            type="password"
                                            name="confirmPassword"
                                            className="form-control rounded-4 py-3 ps-5"
                                            placeholder="Qayta kiriting"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary btn-lg w-100 rounded-4 py-3 fw-bold mb-4"
                                disabled={loading}
                            >
                                {loading ? (
                                    <span className="spinner-border spinner-border-sm" role="status"></span>
                                ) : (
                                    "Ro'yxatdan o'tish"
                                )}
                            </button>

                            <p className="text-center text-muted small d-lg-none">
                                Hisobingiz bormi?{' '}
                                <Link href="/login" className="text-primary fw-semibold text-decoration-none">
                                    Kirish
                                </Link>
                            </p>
                        </form>
                    </div>
                </main>
            </div>
        </div>
    );
}
