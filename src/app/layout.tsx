import type { Metadata, Viewport } from 'next';
import './globals.css';
import PWARegister from '@/components/PWARegister';
import { LanguageProvider } from '@/context/LanguageContext';

export const metadata: Metadata = {
  title: 'DawaiSaathi (दवाई साथी) - Easy, Safe & Smart Healthcare',
  description: 'AI-assisted prescription reader, drug safety interaction checker, Jan Aushadhi generic alternatives, local voice medicine reminders, and health safety loop for families and elders.',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/icon-192.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#16a34a',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="DawaiSaathi" />
      </head>
      <body className="h-full flex flex-col font-sans antialiased text-gray-900 bg-slate-50 selection:bg-emerald-500 selection:text-white">
        <LanguageProvider>
          <PWARegister />
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
