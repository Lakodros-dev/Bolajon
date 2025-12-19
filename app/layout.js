import 'bootstrap/dist/css/bootstrap.min.css';
import './globals.css';
import { Suspense } from 'react';
import BootstrapClient from '@/components/BootstrapClient';
import TopLoader from '@/components/TopLoader';
import Providers from '@/components/Providers';
import StructuredData from '@/components/StructuredData';

export const metadata = {
  title: 'Bolajon.uz - Bolalar uchun ingliz tili | O\'zbek bolalari uchun English',
  description: "5-9 yoshli bolalarga ingliz tilini o'yinlar va interaktiv video darslar orqali o'rgatish platformasi. O'zbekistonda eng yaxshi bolalar uchun ingliz tili kursi.",
  keywords: ['ingliz tili', 'bolalar uchun ingliz', 'english for kids', 'uzbekistan', "o'zbek bolalari", 'interaktiv darslar', 'online english', 'bolajon'],
  authors: [{ name: 'Bolajon.uz' }],
  creator: 'Bolajon.uz',
  publisher: 'Bolajon.uz',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'uz_UZ',
    url: 'https://bolajoon.uz',
    siteName: 'Bolajon.uz',
    title: 'Bolajon.uz - Bolalar uchun ingliz tili',
    description: "5-9 yoshli bolalarga ingliz tilini o'yinlar va interaktiv video darslar orqali o'rgatish platformasi",
    images: [
      {
        url: 'https://bolajoon.uz/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Bolajon.uz - Bolalar uchun ingliz tili',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bolajon.uz - Bolalar uchun ingliz tili',
    description: "5-9 yoshli bolalarga ingliz tilini o'yinlar orqali o'rgatish",
    images: ['https://bolajoon.uz/og-image.png'],
  },
  alternates: {
    canonical: 'https://bolajoon.uz',
  },
  verification: {
    google: 'PqwMp9OW5NIa0nK4by80Gw62Tg2LIAKKqVLsrfQqrWQ',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="uz">
      <head>

        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preload" href="https://fonts.googleapis.com/css2?family=Lexend:wght@400;500;600;700&display=swap" as="style" />
        <link href="https://fonts.googleapis.com/css2?family=Lexend:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link rel="preload" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@400,0..1&display=swap" as="style" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@400,0..1&display=swap" rel="stylesheet" />
      </head>
      <body>
        <StructuredData />
        <Suspense fallback={null}>
          <TopLoader />
        </Suspense>
        <Providers>
          {children}
        </Providers>
        <BootstrapClient />
      </body>
    </html>
  );
}
