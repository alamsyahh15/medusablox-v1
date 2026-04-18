import { useEffect, useMemo, useState } from 'react';
import { Clock, Download, Search, X } from 'lucide-react';

interface Order {
  id: string;
  username: string;
  discord: string;
  method: 'group' | 'gamepass';
  robux: number;
  paymentProof: string;
  note?: string;
  createdAt: string;
}

export default function OrderHistory() {
  const [history, setHistory] = useState<Order[]>([]);
  const [query, setQuery] = useState('');

  useEffect(() => {
    // We poll localStorage every second to update if changes occur from order submit
    const interval = setInterval(() => {
      const data = localStorage.getItem('salvatore_history');
      if (data) {
        setHistory(JSON.parse(data));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const filteredHistory = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return history;
    return history.filter((order) => {
      const createdAtLocale = new Date(order.createdAt).toLocaleString('id-ID');
      const haystack = [
        order.id,
        order.username,
        order.discord,
        order.method,
        String(order.robux),
        createdAtLocale,
        order.note ?? '',
        order.paymentProof ?? ''
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [history, query]);

  const csvEscape = (value: unknown) => {
    const text = value == null ? '' : String(value);
    const escaped = text.replace(/"/g, '""');
    return `"${escaped}"`;
  };

  const downloadCsv = () => {
    const rows = filteredHistory.map((order) => ({
      id: order.id,
      username: order.username,
      discord: order.discord,
      method: order.method,
      robux: order.robux,
      paymentProof: order.paymentProof,
      note: order.note ?? '',
      createdAt: order.createdAt,
      createdAtLocal: new Date(order.createdAt).toLocaleString('id-ID')
    }));

    const headers = [
      'id',
      'username',
      'discord',
      'method',
      'robux',
      'paymentProof',
      'note',
      'createdAt',
      'createdAtLocal'
    ];

    const lines = [
      headers.map(csvEscape).join(','),
      ...rows.map((row) => headers.map((key) => csvEscape((row as Record<string, unknown>)[key])).join(','))
    ];

    const csv = lines.join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = objectUrl;
    a.download = `history-order-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(objectUrl);
  };

  if (history.length === 0) return null;

  return (
    <section id="history" className="py-20 relative">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-2">Riwayat Order</h2>
          <p className="text-text-dim">Order yang pernah Anda buat di browser ini</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between mb-6">
          <div className="relative w-full sm:max-w-md">
            <Search className="w-4 h-4 text-text-dim absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search: id, username, discord, metode, nominal..."
              className="w-full bg-input border border-border rounded-xl pl-11 pr-10 py-3 text-text-main focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
            {query.trim() && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg hover:bg-pack transition-colors"
              >
                <X className="w-4 h-4 text-text-dim" />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={downloadCsv}
            disabled={filteredHistory.length === 0}
            className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-pack border border-border text-text-main hover:border-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4 text-text-dim" />
            Download CSV
          </button>
        </div>

        {query.trim() && (
          <div className="text-xs text-text-dim mb-4">
            Menampilkan {filteredHistory.length} dari {history.length} order
          </div>
        )}

        <div className="space-y-4">
          {filteredHistory.map((order) => (
            <div key={order.id} className="bg-surface border border-border rounded-[24px] p-6 flex flex-col sm:flex-row gap-6 justify-between items-start sm:items-center">
              <div className="flex gap-4 items-start">
                <div className="p-3 bg-pack rounded-xl border border-border">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-bold text-lg text-text-main">{order.id}</span>
                    <span className="text-xs font-semibold px-2 py-1 rounded bg-pack text-text-dim border border-border">
                      {order.method === 'group' ? 'Group Instant' : 'Gamepass'}
                    </span>
                  </div>
                  <div className="text-sm text-text-dim">
                    User: <span className="text-text-main">{order.username}</span> • {new Date(order.createdAt).toLocaleString('id-ID')}
                  </div>
                </div>
              </div>
              
              <div className="text-left sm:text-right w-full sm:w-auto mt-4 sm:mt-0 flex justify-between sm:block">
                <div className="font-display font-bold text-xl text-text-main">
                  {order.robux.toLocaleString()} R$
                </div>
                {order.paymentProof && (
                  <a href={order.paymentProof} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline mt-1 inline-block">
                    Lihat Bukti
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
