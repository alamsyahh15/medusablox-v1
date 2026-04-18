import { ShoppingCart, ShieldCheck, Zap } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden bg-bg">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--color-surface)_0%,_transparent_70%)] opacity-50"></div>
      
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 text-sm font-medium border rounded-full bg-surface text-text-dim border-border">
          <Zap className="w-4 h-4 text-primary" />
          <span>V1 Cepat Launch</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-tight">
          Top Up Robux <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-text-dim">Murah & Aman</span>
        </h1>
        
        <p className="max-w-2xl mx-auto text-xl text-text-dim mb-10">
          Fast Process • Trusted • Cheap Price
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <a href="#order" className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-bold text-white bg-primary rounded-xl hover:opacity-90 transition-opacity shadow-[0_4px_15px_var(--color-primary-glow)]">
            <ShoppingCart className="w-5 h-5" />
            Order Sekarang
          </a>
          <a href="https://discord.com/invite/Afs5b76ejR" target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-bold text-text-main bg-surface border border-border rounded-xl hover:bg-[#1e293b] transition-colors">
            Join Discord
          </a>
        </div>

        <div className="mt-20 flex flex-wrap justify-center gap-4 px-4 max-w-4xl mx-auto pt-8">
          <div className="flex items-center gap-2 py-3 px-6 bg-surface border border-border rounded-full hover:border-primary/50 transition-colors">
            <span className="text-primary text-[10px]">●</span>
            <span className="font-semibold text-sm text-text-dim">Instant Delivery</span>
          </div>
          <div className="flex items-center gap-2 py-3 px-6 bg-surface border border-border rounded-full hover:border-primary/50 transition-colors">
            <span className="text-primary text-[10px]">●</span>
            <span className="font-semibold text-sm text-text-dim">100% Aman</span>
          </div>
          <div className="flex items-center gap-2 py-3 px-6 bg-surface border border-border rounded-full hover:border-primary/50 transition-colors">
            <span className="text-primary text-[10px]">●</span>
            <span className="font-semibold text-sm text-text-dim">24/7 Support</span>
          </div>
          <div className="flex items-center gap-2 py-3 px-6 bg-surface border border-border rounded-full hover:border-primary/50 transition-colors">
            <span className="text-primary text-[10px]">●</span>
            <span className="font-semibold text-sm text-text-dim">Harga Termurah</span>
          </div>
        </div>
      </div>
    </section>
  );
}
