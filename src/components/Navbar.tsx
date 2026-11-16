'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  PhoneCall,
  MessageCircle,
  Sparkles,
  Menu,
  X,
  Heart,
  Pill,
  Calendar,
  Activity,
  ShieldAlert,
  Coins,
  Info,
} from 'lucide-react';
import { useLanguage, SUPPORTED_LANGUAGES, Language } from '@/context/LanguageContext';

interface NavbarProps {
  isDemoMode: boolean;
  onToggleDemoMode: () => void;
  emergencyPhone?: string;
  patientName?: string;
}

export default function Navbar({
  isDemoMode,
  onToggleDemoMode,
  emergencyPhone = '+919876543210',
  patientName = 'Ram Prasad Sharma',
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { language, setLanguage, t } = useLanguage();

  const cleanPhone = emergencyPhone.replace(/[^0-9]/g, '');
  const emergencyWhatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
    t('emergency.whatsappText', { name: patientName })
  )}`;

  const navLinks = [
    { href: '/', label: t('nav.home'), icon: Heart },
    { href: '/prescription', label: t('nav.scan'), icon: Pill },
    { href: '/schedule', label: t('nav.schedule'), icon: Calendar },
    { href: '/health', label: t('nav.vitals'), icon: Activity },
    { href: '/safety', label: t('nav.safety'), icon: ShieldAlert },
    { href: '/generics', label: t('nav.generics'), icon: Coins },
    { href: '/limits', label: t('nav.limits'), icon: Info },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b-2 border-emerald-100 shadow-sm">
      {/* Top Emergency Action Strip (Always visible for safety) */}
      <div className="bg-red-600 text-white px-3 py-1.5 flex items-center justify-between text-xs sm:text-sm font-semibold">
        <div className="flex items-center gap-1.5">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
          <span>{t('emergency.barTitle')}</span>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="tel:108"
            className="flex items-center gap-1 bg-white text-red-600 px-2.5 py-0.5 rounded-full font-bold shadow hover:bg-red-50 transition active:scale-95"
            title={t('emergency.call108Full')}
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>108</span>
          </a>
          <a
            href={emergencyWhatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 bg-emerald-500 text-white px-2.5 py-0.5 rounded-full font-bold shadow hover:bg-emerald-600 transition active:scale-95"
            title={t('emergency.sendSosWhatsapp')}
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">{t('emergency.sosWhatsapp')}</span>
          </a>
        </div>
      </div>

      {/* Main Navbar Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <Pill className="w-6 h-6 transform -rotate-45" />
            </div>
            <div>
              <span className="text-xl sm:text-2xl font-black text-emerald-950 tracking-tight flex items-center gap-1">
                {t('common.appName')}
                <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-md">
                  {t('common.vibexBadge')}
                </span>
              </span>
              <p className="text-[11px] text-gray-500 hidden sm:block leading-none">
                {t('common.tagline')}
              </p>
            </div>
          </Link>

          {/* Controls: Language Selector & Demo Mode Toggle */}
          <div className="hidden md:flex items-center gap-3">
            {/* Demo Mode Toggle */}
            <button
              onClick={onToggleDemoMode}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                isDemoMode
                  ? 'bg-amber-100 border-amber-300 text-amber-900 shadow-sm'
                  : 'bg-gray-100 border-gray-200 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Sparkles className={`w-3.5 h-3.5 ${isDemoMode ? 'text-amber-600' : 'text-gray-400'}`} />
              <span>
                {t('common.demoMode')}: {isDemoMode ? t('common.on') : t('common.off')}
              </span>
            </button>

            {/* Language Selector: Names in their own native script */}
            <div className="relative inline-block">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                className="bg-emerald-50 border-2 border-emerald-300 text-emerald-950 font-bold text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer shadow-sm"
                aria-label={t('nav.selectLanguage')}
              >
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code} className="font-semibold text-gray-900">
                    {lang.nativeName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Mobile hamburger menu and quick controls */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={onToggleDemoMode}
              className={`px-2 py-1 rounded text-xs font-bold border ${
                isDemoMode ? 'bg-amber-100 text-amber-900' : 'bg-gray-100 text-gray-600'
              }`}
            >
              {isDemoMode ? t('common.on') : t('common.off')}
            </button>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              className="bg-emerald-50 border border-emerald-300 text-emerald-900 font-bold text-xs rounded px-2 py-1"
              aria-label={t('nav.selectLanguage')}
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.nativeName}
                </option>
              ))}
            </select>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-gray-700 hover:bg-emerald-50 focus:outline-none"
              aria-label={mobileMenuOpen ? t('nav.closeMenu') : t('nav.openMenu')}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Desktop Navigation Sub-bar */}
        <nav className="hidden md:flex space-x-1 border-t border-gray-100 py-1.5 overflow-x-auto">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow'
                    : 'text-gray-700 hover:bg-emerald-50 hover:text-emerald-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-emerald-100 bg-white px-4 pt-2 pb-4 space-y-1 shadow-lg">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-base font-bold transition-colors ${
                  isActive
                    ? 'bg-emerald-600 text-white'
                    : 'text-gray-800 hover:bg-emerald-50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
