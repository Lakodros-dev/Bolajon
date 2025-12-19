'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      if (user?.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    }
  }, [isAuthenticated, user, router]);

  const steps = [
    { icon: 'how_to_reg', title: "1. Bepul a'zo bo'ling", desc: "Ota-ona yoki o'qituvchi hisobini soniyalar ichida yarating.", color: '#E0F2FE', iconColor: '#0284c7' },
    { icon: 'auto_stories', title: '2. Darajani tanlang', desc: "Bolaning yoshi va qobiliyatiga qarab darslarni tanlang.", color: '#FEF3C7', iconColor: '#d97706' },
    { icon: 'play_lesson', title: "3. O'qishni boshlang", desc: "Interaktiv videolarni tomosha qiling va qiziqarli o'yinlar o'ynang.", color: '#DCFCE7', iconColor: '#16a34a' },
    { icon: 'monitoring', title: '4. Natijani kuzating', desc: "O'zlashtirish darajasini real vaqtda kuzatib boring!", color: '#F3E8FF', iconColor: '#9333ea' },
  ];

  const features = [
    { icon: 'play_circle', title: 'Video darslar', desc: "Professional o'qituvchilar tomonidan tayyorlangan", color: '#E0F2FE', iconColor: '#0284c7' },
    { icon: 'sports_esports', title: "Interaktiv o'yinlar", desc: "O'yin orqali o'rganish metodikasi", color: '#DCFCE7', iconColor: '#16a34a' },
    { icon: 'emoji_events', title: 'Mukofotlar', desc: "Yulduzlar va sovg'alar tizimi", color: '#FEF3C7', iconColor: '#d97706' },
    { icon: 'analytics', title: 'Statistika', desc: "Bolaning rivojlanishini kuzating", color: '#F3E8FF', iconColor: '#9333ea' },
  ];

  return (
    <div className="min-vh-100" style={{ backgroundColor: '#f6f7f8' }}>
      {/* Header */}
      <header className="sticky-top bg-white border-bottom py-3 px-3 px-lg-5">
        <div className="d-flex align-items-center justify-content-between landing-container">
          <div className="d-flex align-items-center">
            <Image src="/logo.png" alt="Bolajon.uz" width={140} height={45} style={{ objectFit: 'contain' }} />
          </div>

          {/* Desktop Nav */}
          <div className="d-none d-md-flex align-items-center gap-4">
            <Link href="#features" className="text-decoration-none text-dark fw-medium">Imkoniyatlar</Link>
            <Link href="#how-it-works" className="text-decoration-none text-dark fw-medium">Qanday ishlaydi</Link>
            <Link href="/login" className="btn btn-outline-primary rounded-pill px-4">Kirish</Link>
            <Link href="/register" className="btn btn-primary rounded-pill px-4">Ro'yxatdan o'tish</Link>
          </div>

          {/* Mobile Nav */}
          <div className="d-flex d-md-none align-items-center gap-2">
            <button className="btn btn-light rounded-circle p-2 small fw-bold" style={{ width: '40px', height: '40px' }}>
              UZ
            </button>
            <button className="btn btn-light rounded-circle p-2">
              <span className="material-symbols-outlined">menu</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-3 px-lg-5 pt-4 pt-lg-5 pb-5">
        <div className="landing-container">
          <div className="row align-items-center g-4 g-lg-5">
            {/* Content */}
            <div className="col-12 col-lg-6 text-center text-lg-start">
              <div className="d-inline-flex align-items-center gap-1 px-3 py-1 rounded-pill mb-3" style={{ backgroundColor: 'rgba(43, 140, 238, 0.1)' }}>
                <span className="material-symbols-outlined text-primary" style={{ fontSize: '18px' }}>school</span>
                <span className="small fw-semibold text-primary">#1 Ta'lim Platformasi</span>
              </div>

              <h1 className="display-5 display-lg-4 fw-bold mb-3">
                Bolalar uchun ingliz tili{' '}
                <span className="text-primary">Endi qiziqarli!</span>
              </h1>

              <p className="text-muted mb-4 fs-5">
                5-9 yoshli bolalarga ingliz tilini o'yinlar va interaktiv hikoyalar orqali o'rgatish uchun eng qiziqarli platforma.
              </p>

              {/* CTA Buttons */}
              <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center justify-content-lg-start">
                <Link href="/register" className="btn btn-primary btn-lg rounded-4 py-3 px-4 fw-bold d-flex align-items-center justify-content-center gap-2 shadow">
                  <span className="material-symbols-outlined">person_add</span>
                  Ro'yxatdan o'tish
                </Link>
                <Link href="/login" className="btn btn-light btn-lg rounded-4 py-3 px-4 fw-bold d-flex align-items-center justify-content-center gap-2 border">
                  <span className="material-symbols-outlined text-primary">play_circle</span>
                  Kirish
                </Link>
              </div>

              {/* Stats */}
              <div className="d-flex gap-4 mt-4 justify-content-center justify-content-lg-start">
                <div>
                  <h3 className="h4 fw-bold text-primary mb-0">500+</h3>
                  <p className="small text-muted mb-0">O'quvchilar</p>
                </div>
                <div>
                  <h3 className="h4 fw-bold text-primary mb-0">50+</h3>
                  <p className="small text-muted mb-0">Video darslar</p>
                </div>
                <div>
                  <h3 className="h4 fw-bold text-primary mb-0">100+</h3>
                  <p className="small text-muted mb-0">O'qituvchilar</p>
                </div>
              </div>
            </div>

            {/* Hero Image */}
            <div className="col-12 col-lg-6">
              <div
                className="rounded-5 shadow-lg mx-auto"
                style={{
                  maxWidth: '500px',
                  aspectRatio: '4/3',
                  backgroundImage: 'url("https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800")',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="px-3 px-lg-5 py-5 bg-white">
        <div className="landing-container">
          <div className="text-center mb-5">
            <h2 className="h2 fw-bold mb-2">Platformamiz imkoniyatlari</h2>
            <p className="text-muted">Bolalaringiz uchun eng yaxshi ta'lim tajribasi</p>
          </div>

          <div className="row g-4">
            {features.map((feature, index) => (
              <div key={index} className="col-6 col-lg-3">
                <div className="card border-0 rounded-4 h-100 text-center p-4" style={{ backgroundColor: feature.color }}>
                  <div className="rounded-4 p-3 bg-white shadow-sm mx-auto mb-3" style={{ width: 'fit-content' }}>
                    <span className="material-symbols-outlined" style={{ color: feature.iconColor, fontSize: '32px' }}>{feature.icon}</span>
                  </div>
                  <h4 className="fw-bold mb-2" style={{ fontSize: '1rem' }}>{feature.title}</h4>
                  <p className="small text-muted mb-0">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="px-3 px-lg-5 py-5">
        <div className="landing-container">
          <div className="text-center mb-5">
            <h2 className="h2 fw-bold mb-2">Qanday ishlaydi?</h2>
            <p className="text-muted">4 oddiy qadamda boshlang</p>
          </div>

          <div className="row g-4">
            {steps.map((step, index) => (
              <div key={index} className="col-12 col-md-6">
                <div
                  className="d-flex align-items-start gap-3 p-4 rounded-4 position-relative h-100"
                  style={{ backgroundColor: step.color }}
                >
                  <div className="rounded-4 p-2 bg-white shadow-sm flex-shrink-0">
                    <span className="material-symbols-outlined" style={{ color: step.iconColor, fontSize: '28px' }}>{step.icon}</span>
                  </div>
                  <div>
                    <h4 className="fw-bold mb-1" style={{ fontSize: '16px' }}>{step.title}</h4>
                    <p className="small text-muted mb-0">{step.desc}</p>
                  </div>
                  <span
                    className="position-absolute fw-bold opacity-25"
                    style={{ top: '1rem', right: '1rem', fontSize: '2.5rem', color: step.iconColor }}
                  >
                    {index + 1}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-3 px-lg-5 py-5">
        <div className="landing-container">
          <div className="card border-0 rounded-5 overflow-hidden" style={{ background: 'linear-gradient(135deg, #2b8cee 0%, #1e40af 100%)' }}>
            <div className="card-body text-white text-center p-5">
              <h2 className="h2 fw-bold mb-3">Hoziroq boshlang!</h2>
              <p className="mb-4 opacity-75">Bolangizning ingliz tilini o'rganish sayohatini bugun boshlang</p>
              <Link href="/register" className="btn btn-light btn-lg rounded-pill px-5 py-3 fw-bold">
                Bepul ro'yxatdan o'tish
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-top px-3 px-lg-5 py-4">
        <div className="landing-container">
          <div className="d-flex flex-column flex-md-row align-items-center justify-content-between gap-3">
            <Image src="/logo.png" alt="Bolajon.uz" width={120} height={40} style={{ objectFit: 'contain' }} />
            <p className="text-muted small mb-0">© 2024 Bolajon.uz. Barcha huquqlar himoyalangan.</p>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Navigation */}
      <nav className="bottom-nav d-md-none">
        <div className="d-flex justify-content-between align-items-center" style={{ maxWidth: '400px', margin: '0 auto' }}>
          <Link href="/" className="nav-link active">
            <span className="material-symbols-outlined filled">home</span>
            <span>Asosiy</span>
          </Link>
          <Link href="/login" className="nav-link">
            <span className="material-symbols-outlined">smart_display</span>
            <span>Darslar</span>
          </Link>
          <Link href="/login" className="nav-link">
            <span className="material-symbols-outlined">leaderboard</span>
            <span>Natijalar</span>
          </Link>
          <Link href="/login" className="nav-link">
            <span className="material-symbols-outlined">account_circle</span>
            <span>Profil</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
