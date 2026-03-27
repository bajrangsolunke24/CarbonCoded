import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, CheckCircle2, Clock, XCircle, Wallet, Plus } from 'lucide-react';
import api from '../../utils/api';

const STATUS_BADGE = {
  APPROVED: { label: 'Approved', cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
  PENDING:  { label: 'Pending',  cls: 'bg-amber-500/10  text-amber-400  border-amber-500/30'  },
  REJECTED: { label: 'Rejected', cls: 'bg-red-500/10    text-red-400    border-red-500/30'    },
};

export default function PanchayatDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/gov/land-requests')
      .then(r => {
        // Filter by panchayat name
        const mine = r.data.filter(req =>
          req.panchayat?.name?.toLowerCase().includes(user.name?.toLowerCase()) ||
          req.panchayat_id === user.id
        );
        setRequests(mine);
      })
      .catch(() => setRequests([]))
      .finally(() => setLoading(false));
  }, []);

  const approved = requests.filter(r => r.status === 'APPROVED').length;
  const pending  = requests.filter(r => r.status === 'PENDING').length;
  const recent   = requests.slice(0, 5);

  const stats = [
    { label: 'Total Submissions', value: requests.length, color: 'text-amber-400',   icon: MapPin         },
    { label: 'Approved',          value: approved,         color: 'text-emerald-400', icon: CheckCircle2   },
    { label: 'Pending Review',    value: pending,          color: 'text-amber-400',   icon: Clock          },
    { label: 'Rejected',          value: requests.length - approved - pending, color: 'text-red-400', icon: XCircle },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-heading text-xl font-bold text-text-primary">Panchayat Dashboard</h1>
          <p className="text-sm text-text-secondary mt-0.5">Welcome back, {user.name}</p>
        </div>
        <button
          onClick={() => navigate('/panchayat/submit')}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gov-navy bg-amber-400 hover:bg-amber-300 transition-colors"
        >
          <Plus size={14} /> Submit New Request
        </button>
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

      {/* Recent Requests */}
      <div className="gov-card p-0">
        <div className="px-4 py-3 border-b border-gov-border flex items-center gap-2">
          <MapPin size={14} className="text-amber-400" />
          <h3 className="text-sm font-semibold text-text-primary font-heading">Recent Submissions</h3>
        </div>
        <table className="gov-table">
          <thead>
            <tr>
              <th>Request #</th>
              <th>Owner</th>
              <th>Area (ha)</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="text-center text-text-muted py-8 text-xs">Loading...</td></tr>
            ) : recent.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center text-text-muted py-8 text-xs">
                  No submissions yet.{' '}
                  <button onClick={() => navigate('/panchayat/submit')} className="text-amber-400 hover:underline">
                    Submit your first land request →
                  </button>
                </td>
              </tr>
            ) : (
              recent.map(req => {
                const s = STATUS_BADGE[req.status] || STATUS_BADGE.PENDING;
                return (
                  <tr key={req.id}>
                    <td className="font-mono text-xs text-amber-400">REQ-{String(req.id).padStart(4, '0')}</td>
                    <td>{req.owner_name}</td>
                    <td>{req.area_hectares}</td>
                    <td>
                      <span className={`gov-badge ${s.cls} border`}>{s.label}</span>
                    </td>
                    <td className="text-text-muted text-xs">
                      {new Date(req.created_at).toLocaleDateString('en-IN')}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Quick tip */}
      <div className="border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-xs text-amber-400">
        💡 <strong>Tip:</strong> After submitting a request, the government will review within 3–5 working days.
        Track progress in <button onClick={() => navigate('/panchayat/requests')} className="underline">My Land Requests</button>.
      </div>
    </div>
  );
}
