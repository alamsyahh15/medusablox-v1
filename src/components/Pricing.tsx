export default function Pricing() {
  const groupPackages = [
    { robux: '1K', price: '125K', highlight: false },
    { robux: '2K', price: '250K', highlight: false },
    { robux: '5K', price: '625K', highlight: true },
    { robux: '10K', price: '1.200K', highlight: false },
  ];

  const gamepassPackages = [
    { robux: '1K', price: '120K', highlight: false },
    { robux: '2K', price: '240K', highlight: false },
    { robux: '5K', price: '600K', highlight: true },
    { robux: '10K', price: '1.150K', highlight: false },
  ];

  return (
    <section id="pricing" className="py-20 relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">Daftar Harga</h2>
          <p className="text-text-dim max-w-2xl mx-auto">
            Pilih metode top up yang sesuai dengan kebutuhanmu.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-16">
          {/* Group Instant */}
          <div className="bg-surface border border-border rounded-[24px] p-8 hover:border-primary/50 transition-colors shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)]">
            <div className="mb-8 border-b border-border pb-6 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-text-main mb-2">Group Instant</h3>
                <p className="text-sm text-text-dim">Proses instan tanpa nunggu 5 hari</p>
              </div>
              <div className="bg-primary/10 text-primary border border-primary/20 font-bold px-4 py-2 rounded-xl text-sm">
                Instan
              </div>
            </div>
            
            <div className="space-y-4">
              {groupPackages.map((pkg, i) => (
                <div 
                  key={i} 
                  className={`flex justify-between items-center p-4 rounded-xl border ${pkg.highlight ? 'border-primary bg-primary/5 shadow-[inset_0_0_0_1px_var(--color-primary)]' : 'border-border bg-pack'}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-display font-bold text-xl text-text-main">{pkg.robux}</span>
                    <span className="text-text-dim font-medium">Robux</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm text-text-dim block">Rp</span>
                    <span className={`font-display font-bold text-xl ${pkg.highlight ? 'text-primary' : 'text-text-main'}`}>{pkg.price}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Gamepass */}
          <div className="bg-surface border border-border rounded-[24px] p-8 hover:border-primary/50 transition-colors shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] relative overflow-hidden">
            <div className="mb-8 border-b border-border pb-6 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-text-main mb-2">Gamepass</h3>
                <p className="text-sm text-text-dim">Lebih murah, proses 5 hari (Pending)</p>
              </div>
              <div className="bg-primary/10 text-primary border border-primary/20 font-bold px-4 py-2 rounded-xl text-sm">
                Hemat
              </div>
            </div>
            
            <div className="space-y-4">
              {gamepassPackages.map((pkg, i) => (
                <div 
                  key={i} 
                  className={`flex justify-between items-center p-4 rounded-xl border ${pkg.highlight ? 'border-primary bg-primary/5 shadow-[inset_0_0_0_1px_var(--color-primary)]' : 'border-border bg-pack'}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-display font-bold text-xl text-text-main">{pkg.robux}</span>
                    <span className="text-text-dim font-medium">Robux</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm text-text-dim block">Rp</span>
                    <span className={`font-display font-bold text-xl ${pkg.highlight ? 'text-primary' : 'text-text-main'}`}>{pkg.price}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
