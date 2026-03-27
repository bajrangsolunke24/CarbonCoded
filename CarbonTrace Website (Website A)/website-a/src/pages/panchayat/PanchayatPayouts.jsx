import { useState, useEffect } from 'react';
import { Wallet, TrendingUp } from 'lucide-react';
import api from '../../utils/api';

const STATUS_META = {
  COMPLETED: { label: 'Paid',    cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
  PENDING:   { label: 'Pending', cls: 'bg-amber-500/10  text-amber-400  border-amber-500/30'  },
};

export default function PanchayatPayouts() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [payments, setPayments] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    api.get(`/gov/payouts/panchayat/${user.id}`)
      .then(r => setPayments(r.data))
      .catch(() => setPayments([]))
      .finally(() => setLoading(false));
  }, []);

  const totalReceived = payments.filter(p => p.status === 'COMPLETED').reduce((s, p) => s + parseFloat(p.amount || 0), 0);
  const totalPending  = payments.filter(p => p.status === 'PENDING').reduce((s, p) => s + parseFloat(p.amount || 0), 0);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-heading text-xl font-bold text-text-primary">My Payouts</h1>
        <p className="text-sm text-text-secondary mt-0.5">Carbon credit payments received for your lands</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="gov-card">
          <div className="flex items-center gap-2 mb-2"><Wallet size={14} className="text-emerald-400" /><p className="gov-stat-label">Total Received</p></div>
          <p className="gov-stat-value text-emerald-400">₹{totalReceived.toLocaleString('en-IN')}</p>
        </div>
        <div className="gov-card">
          <div className="flex items-center gap-2 mb-2"><TrendingUp size={14} className="text-amber-400" /><p className="gov-stat-label">Pending</p></div>
          <p className="gov-stat-value text-amber-400">₹{totalPending.toLocaleString('en-IN')}</p>
        </div>
      </div>

      {/* Table */}
      <div className="gov-card p-0">
        <div className="px-4 py-3 border-b border-gov-border flex items-center gap-2">
          <Wallet size={14} className="text-amber-400" />
          <h3 className="text-sm font-semibold text-text-primary font-heading">Payment History</h3>
        </div>
        <table className="gov-table">
          <thead>
            <tr>
              <th>Payout #</th>
              <th>Land ID</th>
              <th>Amount</th>
              <th>Quality Score</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="text-center py-8 text-text-muted text-xs">Loading...</td></tr>
            ) : payments.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-text-muted text-xs">
                  No payouts received yet. Payouts are issued after land verification and carbon credit allocation.
                </td>
              </tr>
            ) : (
              payments.map((p, i) => {
                const s = STATUS_META[p.status] || STATUS_META.PENDING;
                return (
                  <tr key={p.id || i}>
                    <td className="font-mono text-xs text-amber-400">PAY-{String(p.id).padStart(4, '0')}</td>
                    <td className="font-mono text-xs text-text-secondary">{p.land_id || '—'}</td>
                    <td className="font-semibold text-text-primary">₹{parseFloat(p.amount || 0).toLocaleString('en-IN')}</td>
                    <td>
                      <div className="flex items-center gap-1">
                        <div className="h-1.5 w-16 bg-gov-border rounded-full overflow-hidden">
                          <div className="h-full bg-amber-400 rounded-full" style={{ width: `${p.quality_score || 0}%` }} />
                        </div>
                        <span className="text-xs text-text-muted">{p.quality_score || 0}%</span>
                      </div>
                    </td>
                    <td><span className={`gov-badge ${s.cls} border`}>{s.label}</span></td>
                    <td className="text-text-muted text-xs">{new Date(p.paid_at || p.created_at).toLocaleDateString('en-IN')}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
