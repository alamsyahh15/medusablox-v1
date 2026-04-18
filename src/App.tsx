/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { CheckCircle } from 'lucide-react';
import Header from './components/Header';
import Hero from './components/Hero';
import Pricing from './components/Pricing';
import OrderForm from './components/OrderForm';
import OrderHistory from './components/OrderHistory';
import Footer from './components/Footer';

export default function App() {
  const discordInviteUrl = 'https://discord.com/invite/Afs5b76ejR';

  const normalizePath = (value: string) => {
    const trimmed = value.trim();
    const withoutTrailingSlash = trimmed.replace(/\/+$/, '');
    return withoutTrailingSlash === '' ? '/' : withoutTrailingSlash;
  };

  const [path, setPath] = useState(() => normalizePath(window.location.pathname));

  useEffect(() => {
    const onPopState = () => setPath(normalizePath(window.location.pathname));
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const navigate = (to: string) => {
    const next = normalizePath(to);
    if (next === path) return;
    window.history.pushState({}, '', next);
    setPath(next);
    window.scrollTo(0, 0);
  };

  const isHistoryPage = path === '/history-order';
  const isThankYouPage = path === '/thank-you';

  if (isThankYouPage) {
    return (
      <div className="min-h-[100vh] bg-bg font-sans text-text-main selection:bg-primary selection:text-white flex flex-col">
        <header className="bg-bg/80 backdrop-blur-md border-b border-border">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                navigate('/');
              }}
              className="text-sm font-semibold text-text-dim hover:text-primary transition-colors"
            >
              Kembali
            </a>
            <span className="font-sans font-bold text-xl tracking-tight text-text-main">
              Thank You
            </span>
            <div className="w-[64px]" />
          </div>
        </header>

        <main className="flex-1">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-20">
            <div className="bg-surface border border-border rounded-[24px] p-6 sm:p-10 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] text-center">
              <div className="flex justify-center">
                <CheckCircle className="w-12 h-12 text-green-500" />
              </div>
              <h2 className="text-3xl font-bold mt-4">Terima kasih!</h2>
              <p className="text-text-dim mt-2">
                Order kamu sudah terkirim. Untuk konfirmasi lebih cepat, klik tombol di bawah ini.
              </p>
              <div className="mt-8 flex justify-center">
                <a
                  href={discordInviteUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-bold text-white bg-primary rounded-xl hover:opacity-90 transition-opacity shadow-[0_4px_15px_var(--color-primary-glow)]"
                >
                  Konfirmasi Lebih Cepat
                </a>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  if (isHistoryPage) {
    return (
      <div className="min-h-[100vh] bg-bg font-sans text-text-main selection:bg-primary selection:text-white flex flex-col">
        <header className="bg-bg/80 backdrop-blur-md border-b border-border">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                navigate('/');
              }}
              className="text-sm font-semibold text-text-dim hover:text-primary transition-colors"
            >
              Kembali
            </a>
            <span className="font-sans font-bold text-xl tracking-tight text-text-main">
              History Order
            </span>
            <div className="w-[64px]" />
          </div>
        </header>

        <main className="flex-1">
          <OrderHistory />
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-[100vh] bg-bg font-sans text-text-main selection:bg-primary selection:text-white flex flex-col">
      <Header />
      <main className="flex-1">
        <Hero />
        <Pricing />
        <OrderForm />
      </main>
      <Footer />
    </div>
  );
}
