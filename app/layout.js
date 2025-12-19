import 'bootstrap/dist/css/bootstrap.min.css';
import './globals.css';
import { Suspense } from 'react';
import BootstrapClient from '@/components/BootstrapClient';
import TopLoader from '@/components/TopLoader';
import Providers from '@/components/Providers';

export const metadata = {
  title: 'Bolajon.uz - Bolalar uchun ingliz tili',
  description: "5-9 yoshli bolalarga ingliz tilini o'yinlar va interaktiv hikoyalar orqali o'rgatish platformasi",
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
