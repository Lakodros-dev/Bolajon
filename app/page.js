'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UserPlus, BookOpen, PlayCircle, TrendingUp, Gamepad2, Trophy, BarChart3, Menu, Hand, Rocket, LogIn, CheckCircle, Star, Play, Globe, MapPin, Code, Heart, Home, Video, Users } from 'lucide-react';

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
    { icon: UserPlus, title: "1. Bepul a'zo bo'ling", desc: "Ota-ona yoki o'qituvchi hisobini soniyalar ichida yarating.", color: '#E0F2FE', iconColor: '#0284c7' },
    { icon: BookOpen, title: '2. Darajani tanlang', desc: "Bolaning yoshi va qobiliyatiga qarab darslarni tanlang.", color: '#FEF3C7', iconColor: '#d97706' },
    { icon: PlayCircle, title: "3. O'qishni boshlang", desc: "Interaktiv videolarni tomosha qiling va qiziqarli o'yinlar o'ynang.", color: '#DCFCE7', iconColor: '#16a34a' },
    { icon: TrendingUp, title: '4. Natijani kuzating', desc: "O'zlashtirish darajasini real vaqtda kuzatib boring!", color: '#F3E8FF', iconColor: '#9333ea' },
  ];

  const features = [
    { icon: PlayCircle, title: 'Video darslar', desc: "Professional o'qituvchilar tomonidan tayyorlangan", color: '#E0F2FE', iconColor: '#0284c7' },
    { icon: Gamepad2, title: "Interaktiv o'yinlar", desc: "O'yin orqali o'rganish metodikasi", color: '#DCFCE7', iconColor: '#16a34a' },
    { icon: Trophy, title: 'Mukofotlar', desc: "Yulduzlar va sovg'alar tizimi", color: '#FEF3C7', iconColor: '#d97706' },
    { icon: BarChart3, title: 'Statistika', desc: "Bolaning rivojlanishini kuzating", color: '#F3E8FF', iconColor: '#9333ea' },
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
              <Menu size={20} />
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
              <div className="d-inline-flex align-items-center gap-2 px-3 py-2 rounded-pill mb-3" style={{ backgroundColor: 'rgba(43, 140, 238, 0.1)' }}>
                <Hand size={20} className="text-primary" />
                <span className="fw-semibold text-primary">Xush kelibsiz!</span>
              </div>

              <h1 className="display-5 fw-bold mb-3" style={{ lineHeight: 1.2 }}>
                Bolalar uchun <br className="d-none d-lg-block" />
                <span style={{
                  background: 'linear-gradient(135deg, #2b8cee 0%, #7c3aed 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>Ingliz tili platformasi</span>
              </h1>

              <p className="text-muted mb-4 fs-5">
                5-9 yoshli bolalarga ingliz tilini o'yinlar, qo'shiqlar va interaktiv video darslar orqali o'rgatamiz. Bolangiz o'ynab-kulib o'rganadi!
              </p>

              {/* CTA Buttons */}
              <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center justify-content-lg-start">
                <Link href="/register" className="btn btn-primary btn-lg rounded-4 py-3 px-4 fw-bold d-flex align-items-center justify-content-center gap-2 shadow">
                  <Rocket size={20} />
                  Bepul boshlash
                </Link>
                <Link href="/login" className="btn btn-light btn-lg rounded-4 py-3 px-4 fw-bold d-flex align-items-center justify-content-center gap-2 border">
                  <LogIn size={20} className="text-primary" />
                  Kirish
                </Link>
              </div>

              {/* Trust badges */}
              <div className="d-flex align-items-center gap-3 mt-4 justify-content-center justify-content-lg-start">
                <div className="d-flex align-items-center gap-2 px-3 py-2 rounded-3" style={{ backgroundColor: '#dcfce7' }}>
                  <CheckCircle size={20} className="text-success" />
                  <span className="small fw-medium text-success">7 kun bepul</span>
                </div>
                <div className="d-flex align-items-center gap-2 px-3 py-2 rounded-3" style={{ backgroundColor: '#fef3c7' }}>
                  <Star size={20} style={{ color: '#d97706' }} />
                  <span className="small fw-medium" style={{ color: '#b45309' }}>500+ o'quvchi</span>
                </div>
              </div>
            </div>

            {/* Hero Image */}
            <div className="col-12 col-lg-6">
              <div className="position-relative">
                <div
                  className="rounded-5 shadow-lg mx-auto overflow-hidden"
                  style={{
                    maxWidth: '480px',
                    aspectRatio: '4/3',
                    backgroundImage: 'url("https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                />
                {/* Floating cards */}
                <div
                  className="position-absolute bg-white rounded-4 shadow-lg p-3 d-none d-lg-flex align-items-center gap-2"
                  style={{ bottom: '-20px', left: '-30px' }}
                >
                  <div className="rounded-circle bg-success d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                    <Play size={20} className="text-white" />
                  </div>
                  <div>
                    <p className="fw-bold mb-0 small">50+ video darslar</p>
                    <p className="text-muted mb-0" style={{ fontSize: '12px' }}>Professional o'qituvchilar</p>
                  </div>
                </div>
                <div
                  className="position-absolute bg-white rounded-4 shadow-lg p-3 d-none d-lg-flex align-items-center gap-2"
                  style={{ top: '20px', right: '-20px' }}
                >
                  <span style={{ fontSize: '28px' }}>🎮</span>
                  <div>
                    <p className="fw-bold mb-0 small">O'yin orqali</p>
                    <p className="text-muted mb-0" style={{ fontSize: '12px' }}>o'rganish</p>
                  </div>
                </div>
              </div>
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
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div key={index} className="col-6 col-lg-3">
                  <div className="card border-0 rounded-4 h-100 text-center p-4" style={{ backgroundColor: feature.color }}>
                    <div className="rounded-4 p-3 bg-white shadow-sm mx-auto mb-3" style={{ width: 'fit-content' }}>
                      <IconComponent size={32} style={{ color: feature.iconColor }} />
                    </div>
                    <h4 className="fw-bold mb-2" style={{ fontSize: '1rem' }}>{feature.title}</h4>
                    <p className="small text-muted mb-0">{feature.desc}</p>
                  </div>
                </div>
              );
            })}
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
            {steps.map((step, index) => {
              const IconComponent = step.icon;
              return (
                <div key={index} className="col-12 col-md-6">
                  <div
                    className="d-flex align-items-start gap-3 p-4 rounded-4 position-relative h-100"
                    style={{ backgroundColor: step.color }}
                  >
                    <div className="rounded-4 p-2 bg-white shadow-sm flex-shrink-0">
                      <IconComponent size={28} style={{ color: step.iconColor }} />
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
              );
            })}
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
      <footer className="bg-dark text-white px-3 px-lg-5 py-5">
        <div className="landing-container">
          <div className="row g-4 mb-4">
            {/* About */}
            <div className="col-12 col-md-4">
              <Image src="/logo.png" alt="Bolajon.uz" width={120} height={40} style={{ objectFit: 'contain' }} />
              <p className="text-white-50 mt-3 small">
                Bolajon.uz - O'zbekistondagi bolalar uchun ingliz tili o'rgatish platformasi.
                Interaktiv darslar, qiziqarli o'yinlar va professional o'qituvchilar bilan bolangizning kelajagiga sarmoya qiling.
              </p>
            </div>

            {/* Quick Links */}
            <div className="col-6 col-md-2">
              <h6 className="fw-bold mb-3">Sahifalar</h6>
              <ul className="list-unstyled">
                <li className="mb-2"><Link href="/" className="text-white-50 text-decoration-none small">Bosh sahifa</Link></li>
                <li className="mb-2"><Link href="#features" className="text-white-50 text-decoration-none small">Imkoniyatlar</Link></li>
                <li className="mb-2"><Link href="#how-it-works" className="text-white-50 text-decoration-none small">Qanday ishlaydi</Link></li>
                <li className="mb-2"><Link href="/login" className="text-white-50 text-decoration-none small">Kirish</Link></li>
              </ul>
            </div>

            {/* Contact */}
            <div className="col-6 col-md-3">
              <h6 className="fw-bold mb-3">Bog'lanish</h6>
              <ul className="list-unstyled">
                <li className="mb-2 d-flex align-items-center gap-2">
                  <Globe size={18} className="text-white-50" />
                  <span className="text-white-50 small">bolajoon.uz</span>
                </li>
                <li className="mb-2 d-flex align-items-center gap-2">
                  <MapPin size={18} className="text-white-50" />
                  <span className="text-white-50 small">O'zbekiston</span>
                </li>
              </ul>
            </div>

            {/* Developer */}
            <div className="col-12 col-md-3">
              <h6 className="fw-bold mb-3">Ishlab chiquvchi</h6>
              <div className="d-flex align-items-center gap-3 p-3 rounded-3" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                <div className="rounded-circle bg-primary d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                  <Code size={20} className="text-white" />
                </div>
                <div>
                  <p className="fw-semibold mb-0 small">Lakodros</p>
                  <p className="text-white-50 mb-0" style={{ fontSize: '12px' }}>Prox Company</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom */}
          <div className="border-top border-secondary pt-4">
            <div className="d-flex flex-column flex-md-row align-items-center justify-content-between gap-2">
              <p className="text-white-50 small mb-0">© 2024 Bolajon.uz. Barcha huquqlar himoyalangan.</p>
              <p className="text-white-50 small mb-0 d-flex align-items-center gap-1">
                <Heart size={14} />
                O'zbekistonda ishlab chiqilgan
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Navigation */}
      <nav className="bottom-nav d-md-none">
        <div className="d-flex justify-content-between align-items-center" style={{ maxWidth: '400px', margin: '0 auto' }}>
          <Link href="/" className="nav-link active">
            <Home size={24} />
            <span>Asosiy</span>
          </Link>
          <Link href="/login" className="nav-link">
            <Video size={24} />
            <span>Darslar</span>
          </Link>
          <Link href="/login" className="nav-link">
            <BarChart3 size={24} />
            <span>Natijalar</span>
          </Link>
          <Link href="/login" className="nav-link">
            <Users size={24} />
            <span>Profil</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
