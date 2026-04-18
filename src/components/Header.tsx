import { ShoppingBag } from 'lucide-react';
import logoUrl from '../../assets/ic_logo.png';

export default function Header() {
  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-bg/80 backdrop-blur-md border-b border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <a href="#" className="flex items-center gap-2">
          <img src={logoUrl} alt="Logo" className="w-8 h-8 rounded-lg object-contain" />
          <span className="font-sans font-bold text-xl tracking-tight hidden sm:block text-text-main">
            MedusaBlox
          </span>
        </a>
        
        <nav className="hidden md:flex items-center gap-8">
          <a href="#pricing" className="text-sm font-medium text-text-dim hover:text-primary transition-colors">Pricing</a>
          <a href="#order" className="text-sm font-medium text-text-dim hover:text-primary transition-colors">Self Order</a>
        </nav>
        
        <div className="flex items-center gap-4">
          <a href="#order" className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-primary rounded-xl hover:opacity-90 transition-opacity shadow-[0_4px_15px_var(--color-primary-glow)]">
            <ShoppingBag className="w-4 h-4" />
            Top Up
          </a>
        </div>
      </div>
    </header>
  );
}
