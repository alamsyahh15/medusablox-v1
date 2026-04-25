import React, { useEffect, useRef, useState } from 'react';
import { Upload, CheckCircle, AlertCircle, Loader2, Copy, Download, XCircle } from 'lucide-react';
import qrisUrl from '../../assets/qr_payment.png';

interface Order {
  id: string;
  username: string;
  discord: string;
  method: 'group' | 'gamepass';
  robux: number | string;
  paymentProof: string;
  note?: string;
  createdAt: string;
}

export default function OrderForm() {
  const [method, setMethod] = useState<'group' | 'gamepass'>('group');
  const [robuxAmount, setRobuxAmount] = useState<string>('1000');
  const [customRobux, setCustomRobux] = useState<string>('');
  
  const [username, setUsername] = useState('');
  const [discord, setDiscord] = useState('');
  const [note, setNote] = useState('');
  const [proofUrl, setProofUrl] = useState('');
  
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [grossCopied, setGrossCopied] = useState(false);
  const [groupCheckStatus, setGroupCheckStatus] = useState<'idle' | 'checking' | 'valid' | 'invalid' | 'error'>('idle');
  const [groupCheckDays, setGroupCheckDays] = useState<number | null>(null);
  const [groupCheckMessage, setGroupCheckMessage] = useState('');
  const groupCheckRequestIdRef = useRef(0);
  const lastCheckedUsernameRef = useRef('');

  useEffect(() => {
    if (method !== 'group') {
      groupCheckRequestIdRef.current += 1;
      lastCheckedUsernameRef.current = '';
      setGroupCheckStatus('idle');
      setGroupCheckDays(null);
      setGroupCheckMessage('');
    }
  }, [method]);

  // Load from draft
  useEffect(() => {
    const draft = localStorage.getItem('salvatore_draft');
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        if (parsed.username) setUsername(parsed.username);
        if (parsed.discord) setDiscord(parsed.discord);
        if (parsed.method) setMethod(parsed.method);
      } catch (e) {}
    }
  }, []);

  // Save draft
  useEffect(() => {
    localStorage.setItem('salvatore_draft', JSON.stringify({
      username,
      discord,
      method
    }));
  }, [username, discord, method]);

  const activeRobux = robuxAmount === 'custom' ? parseInt(customRobux || '0') : parseInt(robuxAmount);

  const verifyGroupEligibility = async (rawUsername: string) => {
    if (method !== 'group') {
      setGroupCheckStatus('idle');
      setGroupCheckDays(null);
      setGroupCheckMessage('');
      return;
    }

    const normalizedUsername = rawUsername.trim();
    if (!normalizedUsername) {
      setGroupCheckStatus('idle');
      setGroupCheckDays(null);
      setGroupCheckMessage('');
      return;
    }

    if (
      normalizedUsername.toLowerCase() === lastCheckedUsernameRef.current.toLowerCase() &&
      (groupCheckStatus === 'valid' || groupCheckStatus === 'invalid')
    ) {
      return;
    }

    lastCheckedUsernameRef.current = normalizedUsername;
    const requestId = ++groupCheckRequestIdRef.current;

    setGroupCheckStatus('checking');
    setGroupCheckDays(null);
    setGroupCheckMessage('');

    try {
      const res = await fetch('/api/roblox-group-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: normalizedUsername })
      });

      const data = await res.json();

      if (requestId !== groupCheckRequestIdRef.current) return;

      if (!data?.ok) {
        setGroupCheckStatus('error');
        setGroupCheckDays(null);
        setGroupCheckMessage(data?.error || 'Gagal cek status group.');
        return;
      }

      const status = data?.status as string | undefined;
      const days = typeof data?.days === 'number' ? data.days : null;
      const message = typeof data?.message === 'string' ? data.message : '';

      setGroupCheckDays(days);
      setGroupCheckMessage(message);

      if (status === 'valid') setGroupCheckStatus('valid');
      else setGroupCheckStatus('invalid');
    } catch (err) {
      if (requestId !== groupCheckRequestIdRef.current) return;
      setGroupCheckStatus('error');
      setGroupCheckDays(null);
      setGroupCheckMessage('Gagal cek status group.');
    }
  };

  // Calculator Logic
  const getPrice = (method: string, amount: number) => {
    if (amount === 0 || isNaN(amount)) return 0;
    
    if (method === 'group') {
      if (amount === 1000) return 125000;
      if (amount === 2000) return 250000;
      if (amount === 5000) return 625000;
      if (amount === 10000) return 1200000;
      return amount * 125;
    } else {
      if (amount === 1000) return 120000;
      if (amount === 2000) return 240000;
      if (amount === 5000) return 600000;
      if (amount === 10000) return 1150000;
      return amount * 120;
    }
  };

  const baseHargaBayar = getPrice(method, activeRobux);
  const isAfterOrAtWibTime = (hour: number, minute: number) => {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Jakarta',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).formatToParts(new Date());

    const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
    const nowHour = Number(get('hour'));
    const nowMinute = Number(get('minute'));

    if (nowHour > hour) return true;
    if (nowHour < hour) return false;
    return nowMinute >= minute;
  };
  const promoDiscount = (() => {
    if (!isAfterOrAtWibTime(19, 45)) return 0;
    if (method === 'gamepass' && activeRobux >= 2000) return 20000;
    if (method !== 'group') return 0;
    if (activeRobux >= 2000) return 20000;
    if (activeRobux >= 4000) return 35000;
    if (activeRobux >= 5000) return 45000;
    if (activeRobux >= 10000) return 80000;
    return 0;
  })();
  const hargaBayar = Math.max(0, baseHargaBayar - promoDiscount);
  const grossRobux = method === 'gamepass' ? Math.ceil(activeRobux / 0.7) : activeRobux;

  const normalizeEnvString = (value: unknown) => {
    const raw = typeof value === 'string' ? value : '';
    const trimmed = raw.trim();
    const unquoted = trimmed.replace(/^['"](.*)['"]$/, '$1');
    return unquoted.trim();
  };

  const copyGrossRobux = async () => {
    if (method !== 'gamepass') return;
    const text = String(grossRobux);
    try {
      await navigator.clipboard.writeText(text);
      setGrossCopied(true);
      window.setTimeout(() => setGrossCopied(false), 1500);
    } catch {
      setUploadError('Gagal copy. Coba copy manual dari angka gross.');
    }
  };

  const downloadQris = async () => {
    try {
      const res = await fetch(qrisUrl);
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = 'qris-medusablox.png';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(objectUrl);
    } catch {
      window.open(qrisUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const cloudName = normalizeEnvString(import.meta.env.VITE_CLOUDINARY_CLOUD_NAME);
    const uploadPreset = normalizeEnvString(import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);

    if (!cloudName || !uploadPreset) {
      const missing: string[] = [];
      if (!cloudName) missing.push('VITE_CLOUDINARY_CLOUD_NAME');
      if (!uploadPreset) missing.push('VITE_CLOUDINARY_UPLOAD_PRESET');
      setUploadError(`Cloudinary config missing: ${missing.join(', ')}.`);
      return;
    }

    setIsUploading(true);
    setUploadError('');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.secure_url) {
        setProofUrl(data.secure_url);
      } else {
        const message =
          data?.error?.message === 'Upload preset not found'
            ? `Upload preset not found. Ensure VITE_CLOUDINARY_UPLOAD_PRESET matches an existing unsigned preset in Cloudinary, and VITE_CLOUDINARY_CLOUD_NAME is correct. (cloud: ${cloudName}, preset: ${uploadPreset})`
            : data?.error?.message || `Upload failed (HTTP ${res.status})`;
        setUploadError(message);
      }
    } catch (err: unknown) {
      setUploadError("Network error during upload");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !discord || !activeRobux || !proofUrl) {
      alert("Mohon isi semua field wajib dan upload bukti pembayaran.");
      return;
    }

    setIsSubmitting(true);
    
    // Save to history
    const orderRef = `ORD-${Date.now().toString().slice(-6)}`;
    const newOrder: Order = {
      id: orderRef,
      username,
      discord,
      method,
      robux: activeRobux,
      paymentProof: proofUrl,
      note,
      createdAt: new Date().toISOString()
    };

    const historyUrl = localStorage.getItem('salvatore_history');
    let history: Order[] = historyUrl ? JSON.parse(historyUrl) : [];
    history.unshift(newOrder);
    localStorage.setItem('salvatore_history', JSON.stringify(history));

    // Send to Discord
    const webhookUrl = import.meta.env.VITE_DISCORD_WEBHOOK_URL;
    if (webhookUrl) {
      const embed = {
        title: `Telah Terjadi Order Baru! (${orderRef})`,
        color: method === 'group' ? 65535 : 16766720,
        fields: [
          { name: 'Username Roblox', value: username, inline: true },
          { name: 'Discord', value: discord, inline: true },
          { name: 'Metode', value: method.toUpperCase(), inline: true },
          { name: 'Robux Net', value: activeRobux.toLocaleString(), inline: true },
          { name: 'Gross (Gamepass)', value: grossRobux.toLocaleString(), inline: true },
          { name: 'Total Harga', value: `Rp ${hargaBayar.toLocaleString()}`, inline: true },
          { name: 'Catatan', value: note || '-', inline: false },
        ],
        image: { url: proofUrl },
        timestamp: new Date().toISOString()
      };

      try {
        await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ embeds: [embed] })
        });
      } catch (err) {
        console.error("Discord webhook failed", err);
      }
    }

    setIsSubmitting(false);
    
    // Clear draft form
    localStorage.removeItem('salvatore_draft');
    setRobuxAmount('1000');
    setCustomRobux('');
    setUsername('');
    setDiscord('');
    setNote('');
    setProofUrl('');

    window.history.pushState({}, '', '/thank-you');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  return (
    <section id="order" className="py-20 relative">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="bg-surface border border-border rounded-[24px] p-6 sm:p-10 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] relative overflow-hidden">
          
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-2">Order Form</h2>
            <p className="text-text-dim">Silahkan isi detail order Anda di bawah ini</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Step 1: Kalilator */}
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-semibold text-text-dim mb-3 uppercase tracking-wider">1. Pilih Metode</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setMethod('group')}
                    className={`py-3 px-4 rounded-xl border transition-all ${method === 'group' ? 'border-primary bg-primary/5 text-text-main shadow-[inset_0_0_0_1px_var(--color-primary)]' : 'border-border bg-pack text-text-dim hover:border-gray-600'}`}
                  >
                    Group Instant
                  </button>
                  <button
                    type="button"
                    onClick={() => setMethod('gamepass')}
                    className={`py-3 px-4 rounded-xl border transition-all ${method === 'gamepass' ? 'border-primary bg-primary/5 text-text-main shadow-[inset_0_0_0_1px_var(--color-primary)]' : 'border-border bg-pack text-text-dim hover:border-gray-600'}`}
                  >
                    Gamepass
                  </button>
                </div>
              </div>

              {method === 'gamepass' && (
                <div className="border border-border rounded-2xl p-4 bg-input">
                  <p className="text-sm text-text-main">
                    Disini kak untuk caranya buat gamepass kak:
                  </p>
                  <ol className="mt-2 space-y-1 text-sm text-text-dim list-decimal list-inside">
                    <li>
                      Join group:{' '}
                      <a
                        href="https://www.roblox.com/share/g/704572305"
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary hover:underline"
                      >
                        https://www.roblox.com/share/g/704572305
                      </a>
                    </li>
                    <li>
                      🎥 Tutorial cara membuat Gamepass:{' '}
                      <a
                        href="https://www.youtube.com/watch?v=nuiYDwTrQlU"
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary hover:underline"
                      >
                        https://www.youtube.com/watch?v=nuiYDwTrQlU
                      </a>
                    </li>
                  </ol>
                  <div className="mt-4 rounded-xl overflow-hidden border border-border bg-surface">
                    <iframe
                      className="w-full aspect-video"
                      src="https://www.youtube.com/embed/nuiYDwTrQlU"
                      title="Tutorial Membuat Gamepass Roblox"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      referrerPolicy="strict-origin-when-cross-origin"
                      allowFullScreen
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-text-dim mb-3 uppercase tracking-wider">2. Pilih Nominal Robux</label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                  {['1000', '2000', '5000', '10000', 'custom'].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setRobuxAmount(val)}
                      className={`py-2 px-3 rounded-xl border transition-all text-sm font-display font-bold ${robuxAmount === val ? 'border-primary bg-primary/5 text-text-main shadow-[inset_0_0_0_1px_var(--color-primary)]' : 'border-border bg-pack text-text-dim hover:border-gray-600'}`}
                    >
                      {val === 'custom' ? 'Custom' : `${parseInt(val)/1000}K`}
                    </button>
                  ))}
                </div>
                {robuxAmount === 'custom' && (
                  <div className="mt-4">
                    <input
                      type="number"
                      placeholder="Masukkan jumlah robux..."
                      value={customRobux}
                      onChange={(e) => setCustomRobux(e.target.value)}
                      className="w-full bg-input border border-border rounded-xl px-4 py-3 text-text-main focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                  </div>
                )}
              </div>

              {/* Summary Calculator */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border border-border rounded-2xl bg-pack">
                <div className="flex flex-col gap-1 w-full sm:w-auto">
                  <span className="text-sm text-text-dim">Gross (Gamepass)</span>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-text-main">{method === 'gamepass' ? grossRobux.toLocaleString() : '-'}</span>
                    {method === 'gamepass' && (
                      <button
                        type="button"
                        onClick={copyGrossRobux}
                        className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg border border-border bg-input text-text-main hover:border-gray-600 transition-colors"
                      >
                        {grossCopied ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-text-dim" />}
                        {grossCopied ? 'Copied' : 'Copy'}
                      </button>
                    )}
                  </div>
                  {method === 'gamepass' && (
                    <span className="text-xs text-text-dim">Copy nominal ini didalam gamepass.</span>
                  )}
                </div>
                <div className="w-px h-10 bg-border hidden sm:block"></div>
                <div className="flex flex-col gap-1 w-full sm:w-auto text-right">
                  <span className="text-sm text-text-dim">Total Harga</span>
                  {hargaBayar < baseHargaBayar ? (
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-sm text-text-dim line-through">Rp {baseHargaBayar.toLocaleString()}</span>
                      <span className="font-display font-bold text-2xl text-text-main">Rp {hargaBayar.toLocaleString()}</span>
                    </div>
                  ) : (
                    <span className="font-display font-bold text-2xl text-text-main">Rp {hargaBayar.toLocaleString()}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Step 2: Form Data */}
            <div className="space-y-5">
              <label className="block text-xs font-semibold text-text-dim mb-2 uppercase tracking-wider">3. Detail Data</label>
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="Username Roblox"
                      value={username}
                      onChange={(e) => {
                        setUsername(e.target.value);
                        setGroupCheckStatus('idle');
                        setGroupCheckDays(null);
                        setGroupCheckMessage('');
                      }}
                      onBlur={() => {
                        if (method === 'group') void verifyGroupEligibility(username);
                      }}
                      className={`w-full bg-input border border-border rounded-xl px-4 py-3 ${method === 'group' ? 'pr-11' : ''} text-text-main focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary`}
                    />
                    {method === 'group' && groupCheckStatus === 'checking' && (
                      <Loader2 className="w-5 h-5 text-primary animate-spin absolute right-4 top-1/2 -translate-y-1/2" />
                    )}
                    {method === 'group' && groupCheckStatus === 'valid' && (
                      <CheckCircle className="w-5 h-5 text-green-500 absolute right-4 top-1/2 -translate-y-1/2" />
                    )}
                    {method === 'group' && groupCheckStatus === 'invalid' && (
                      <XCircle className="w-5 h-5 text-red-500 absolute right-4 top-1/2 -translate-y-1/2" />
                    )}
                    {method === 'group' && groupCheckStatus === 'error' && (
                      <AlertCircle className="w-5 h-5 text-yellow-500 absolute right-4 top-1/2 -translate-y-1/2" />
                    )}
                  </div>

                  {method === 'group' && groupCheckStatus === 'invalid' && (
                    <div className="mt-2 text-xs text-red-500">
                      <div>{groupCheckMessage || 'Join Group Komunitas Kami min 6 hari'}</div>
                      <a
                        href="https://www.roblox.com/share/g/704572305"
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary hover:underline"
                      >
                        Join Group Komunitas Kami min 6 hari
                      </a>
                    </div>
                  )}
                  {method === 'group' && (groupCheckStatus === 'checking' || groupCheckStatus === 'valid' || groupCheckStatus === 'error') && groupCheckMessage && (
                    <div className={`mt-2 text-xs ${groupCheckStatus === 'valid' ? 'text-green-500' : groupCheckStatus === 'error' ? 'text-yellow-500' : 'text-text-dim'}`}>
                      {groupCheckDays != null && groupCheckStatus === 'valid' ? `${groupCheckMessage} (${groupCheckDays} hari)` : groupCheckMessage}
                    </div>
                  )}
                </div>
                <div>
                  <input
                    type="text"
                    required
                    placeholder="Discord Username (#1234)"
                    value={discord}
                    onChange={(e) => setDiscord(e.target.value)}
                    className="w-full bg-input border border-border rounded-xl px-4 py-3 text-text-main focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
              <div>
                <textarea
                  placeholder="Catatan Tambahan (Opsional) - cth: ID Gamepass"
                  rows={3}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full bg-input border border-border rounded-xl px-4 py-3 text-text-main focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                ></textarea>
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-semibold text-text-dim uppercase tracking-wider">4. Payment Method (QRIS)</label>
              <div className="border border-border rounded-2xl p-4 sm:p-5 bg-input sm:max-w-md sm:mx-auto lg:max-w-sm">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <div className="text-sm font-semibold text-text-main">QRIS MedusaBlox</div>
                    <div className="text-xs text-text-dim mt-1">Scan QR ini untuk pembayaran QRIS</div>
                  </div>
                  <button
                    type="button"
                    onClick={downloadQris}
                    className="inline-flex items-center justify-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl bg-pack border border-border text-text-main hover:border-gray-600 transition-colors"
                  >
                    <Download className="w-4 h-4 text-text-dim" />
                    Unduh
                  </button>
                </div>
                <div className="mt-4 rounded-xl overflow-hidden border border-border bg-surface">
                  <img src={qrisUrl} alt="QRIS" className="w-full h-auto object-contain" />
                </div>
              </div>
            </div>

              {/* Step 3: Upload Payment */}
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-text-dim uppercase tracking-wider">5. Bukti Pembayaran</label>
              
              <div className="border-2 border-dashed border-border rounded-2xl p-6 relative hover:border-gray-600 transition-colors bg-input text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="flex flex-col items-center justify-center space-y-2 pointer-events-none">
                  {isUploading ? (
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                  ) : proofUrl ? (
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  ) : (
                    <Upload className="w-8 h-8 text-text-dim" />
                  )}
                  <span className="text-sm text-text-dim font-medium">
                    {isUploading ? "Uploading..." : proofUrl ? "Upload Berhasil!" : "Klik atau tap untuk upload (.jpg, .png)"}
                  </span>
                </div>
              </div>

              {uploadError && (
                <div className="flex items-center gap-2 text-red-500 text-sm mt-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>{uploadError}</span>
                </div>
              )}

              {proofUrl && (
                <div className="mt-4 rounded-xl overflow-hidden border border-border w-full max-w-[250px] mx-auto bg-surface sm:max-w-xs lg:max-w-[250px]">
                  <img src={proofUrl} alt="Bukti Transfer" className="w-full h-auto object-contain max-h-[420px]" />
                </div>
              )}
            </div>

            {/* Submit */}
            <div className="pt-4">
              {submitSuccess && (
                <div className="mb-4 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 flex items-center justify-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">Order berhasil dikirim! Silahkan hubungi admin di Discord.</span>
                </div>
              )}
              <button
                type="submit"
                disabled={isSubmitting || !proofUrl || !username || !discord}
                className="w-full py-4 px-6 rounded-xl bg-primary text-white font-display font-bold text-lg hover:opacity-90 transition-opacity shadow-[0_4px_15px_var(--color-primary-glow)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                {isSubmitting ? 'Memproses...' : 'Kirim Order Sekarang'}
              </button>
              <p className="text-[10px] text-text-dim text-center mt-4">
                By clicking, you agree to our Terms of Service.
              </p>
            </div>

          </form>
        </div>
      </div>
    </section>
  );
}
