import { useState, useEffect } from 'react';
import { Wallet, TrendingUp, Calendar } from 'lucide-react';
import api from '../../utils/api';

const STATUS_META = {
  COMPLETED: { label: 'Paid',    cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
  PENDING:   { label: 'Pending', cls: 'bg-amber-500/10  text-amber-400  border-amber-500/30'  },
};

export default function NgoPayments() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [payments, setPayments] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    api.get(`/gov/payouts/ngo/${user.id}`)
      .then(r => setPayments(r.data))
      .catch(() => setPayments([]))
      .finally(() => setLoading(false));
  }, []);

  const totalReceived = payments.filter(p => p.status === 'COMPLETED').reduce((s, p) => s + parseFloat(p.amount || 0), 0);
  const totalPending  = payments.filter(p => p.status === 'PENDING').reduce((s, p) => s + parseFloat(p.amount || 0), 0);
  const thisMonth     = payments.filter(p => {
    const d = new Date(p.paid_at || p.created_at);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() && p.status === 'COMPLETED';
  }).reduce((s, p) => s + parseFloat(p.amount || 0), 0);

  const stats = [
    { label: 'Total Received', value: `₹${totalReceived.toLocaleString('en-IN')}`, color: 'text-emerald-400', icon: Wallet   },
    { label: 'Pending',        value: `₹${totalPending.toLocaleString('en-IN')}`,  color: 'text-amber-400',   icon: TrendingUp },
    { label: 'This Month',     value: `₹${thisMonth.toLocaleString('en-IN')}`,     color: 'text-emerald-400', icon: Calendar },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-heading text-xl font-bold text-text-primary">My Payments</h1>
        <p className="text-sm text-text-secondary mt-0.5">Carbon credit payments from Government of India</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {stats.map(({ label, value, color, icon: Icon }) => (
          <div key={label} className="gov-card">
            <div className="flex items-center gap-2 mb-2"><Icon size={14} className={color} /><p className="gov-stat-label">{label}</p></div>
            <p className={`gov-stat-value ${color}`}>{loading ? '—' : value}</p>
          </div>
        ))}
      </div>

      <div className="gov-card p-0">
        <div className="px-4 py-3 border-b border-gov-border flex items-center gap-2">
          <Wallet size={14} className="text-emerald-400" />
          <h3 className="text-sm font-semibold text-text-primary font-heading">Payment History</h3>
        </div>
        <table className="gov-table">
          <thead>
            <tr>
              <th>Payment #</th>
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
                  No payments yet. Payments are issued after carbon credit verification.
                </td>
              </tr>
            ) : (
              payments.map((p, i) => {
                const s = STATUS_META[p.status] || STATUS_META.PENDING;
                return (
                  <tr key={p.id || i}>
                    <td className="font-mono text-xs text-emerald-400">PAY-{String(p.id).padStart(4, '0')}</td>
                    <td className="font-mono text-xs text-text-secondary">{p.land_id || '—'}</td>
                    <td className="font-semibold text-text-primary">₹{parseFloat(p.amount || 0).toLocaleString('en-IN')}</td>
                    <td>
                      <div className="flex items-center gap-1">
                        <div className="h-1.5 w-16 bg-gov-border rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${p.quality_score || 0}%` }} />
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
