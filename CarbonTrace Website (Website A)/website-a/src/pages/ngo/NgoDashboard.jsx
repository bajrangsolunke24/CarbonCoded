import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trees, Coins, Wallet, Upload, TrendingUp } from 'lucide-react';
import api from '../../utils/api';

export default function NgoDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [lands, setLands]       = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/gov/lands').catch(() => ({ data: [] })),
      api.get(`/gov/payouts/ngo/${user.id}`).catch(() => ({ data: [] })),
    ]).then(([landsRes, payRes]) => {
      setLands(landsRes.data);
      setPayments(payRes.data);
    }).finally(() => setLoading(false));
  }, []);

  const totalCredits   = lands.reduce((s, l) => s + (l.ndviRecords?.length ? 10 : 0), 0);
  const totalReceived  = payments.filter(p => p.status === 'COMPLETED').reduce((s, p) => s + parseFloat(p.amount || 0), 0);
  const active         = lands.filter(l => l.status === 'ACTIVE').length;

  const stats = [
    { label: 'Assigned Lands',       value: lands.length,                color: 'text-emerald-400', icon: Trees    },
    { label: 'Active Projects',       value: active,                      color: 'text-emerald-400', icon: TrendingUp },
    { label: 'Credits Generated',     value: `${totalCredits || 0} CC`,   color: 'text-emerald-400', icon: Coins    },
    { label: 'Payments Received',     value: `₹${totalReceived.toLocaleString('en-IN')}`, color: 'text-emerald-400', icon: Wallet },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-heading text-xl font-bold text-text-primary">NGO Dashboard</h1>
        <p className="text-sm text-text-secondary mt-0.5">Welcome back, {user.name}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map(({ label, value, color, icon: Icon }) => (
          <div key={label} className="gov-card">
            <div className="flex items-center gap-2 mb-2">
              <Icon size={14} className={color} />
              <p className="gov-stat-label">{label}</p>
            </div>
            <p className={`gov-stat-value ${color}`}>{loading ? '—' : value}</p>
          </div>
        ))}
      </div>

      {/* Lands table */}
      <div className="gov-card p-0">
        <div className="px-4 py-3 border-b border-gov-border flex items-center gap-2">
          <Trees size={14} className="text-emerald-400" />
          <h3 className="text-sm font-semibold text-text-primary font-heading">Assigned Lands</h3>
        </div>
        <table className="gov-table">
          <thead>
            <tr>
              <th>Land ID</th>
              <th>Location</th>
              <th>Area (ha)</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="text-center py-8 text-text-muted text-xs">Loading...</td></tr>
            ) : lands.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-8 text-text-muted text-xs">No lands assigned yet</td></tr>
            ) : (
              lands.slice(0, 5).map(land => (
                <tr key={land.id}>
                  <td className="font-mono text-xs text-emerald-400">{land.land_id_gov}</td>
                  <td className="text-xs text-text-secondary max-w-xs truncate">{land.landRequest?.location_description || '—'}</td>
                  <td>{land.landRequest?.area_hectares || '—'}</td>
                  <td>
                    <span className={`gov-badge border ${land.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-gov-border/20 text-text-muted border-gov-border'}`}>
                      {land.status}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => navigate(`/ngo/mrv?land=${land.land_id_gov}`)}
                      className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
                    >
                      <Upload size={11} /> Upload MRV
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
