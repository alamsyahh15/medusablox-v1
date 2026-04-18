import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

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

  if (history.length === 0) return null;

  return (
    <section id="history" className="py-20 relative">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-2">Riwayat Order</h2>
          <p className="text-text-dim">Order yang pernah Anda buat di browser ini</p>
        </div>

        <div className="space-y-4">
          {history.map((order) => (
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
