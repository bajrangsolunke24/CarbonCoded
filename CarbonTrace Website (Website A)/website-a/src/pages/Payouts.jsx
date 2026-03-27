import { Wallet, ArrowUpRight, Clock, CheckCircle2, XCircle, IndianRupee, Building2 } from 'lucide-react';

const MOCK_PAYOUTS = [
  { id: 1, ngo: 'Coastal Green Foundation', panchayat: 'Gram Panchayat Ratnagiri', landId: 'GOV-2024-MH-0001', amount: 285000, quality: 92.5, status: 'COMPLETED', paidAt: '2025-02-15', razorpay: 'pout_xyz123' },
  { id: 2, ngo: 'Mangrove Mission India', panchayat: 'Gram Panchayat Sindhudurg', landId: 'GOV-2024-MH-0002', amount: 198000, quality: 87.3, status: 'COMPLETED', paidAt: '2025-02-18', razorpay: 'pout_abc456' },
  { id: 3, ngo: 'EcoRestore NGO', panchayat: 'Gram Panchayat Kannur', landId: 'GOV-2024-KL-0003', amount: 340000, quality: 95.1, status: 'PROCESSING', paidAt: null, razorpay: null },
  { id: 4, ngo: 'Blue Carbon Trust', panchayat: 'Gram Panchayat Kasaragod', landId: 'GOV-2024-KL-0004', amount: 156000, quality: 78.6, status: 'PENDING', paidAt: null, razorpay: null },
  { id: 5, ngo: 'VanaRaksha Society', panchayat: 'Gram Panchayat Kutch', landId: 'GOV-2024-GJ-0005', amount: 420000, quality: 91.2, status: 'COMPLETED', paidAt: '2025-01-28', razorpay: 'pout_def789' },
  { id: 6, ngo: 'Coastal Green Foundation', panchayat: 'Gram Panchayat Surat', landId: 'GOV-2024-GJ-0006', amount: 265000, quality: 84.7, status: 'PENDING', paidAt: null, razorpay: null },
  { id: 7, ngo: 'Mangrove Mission India', panchayat: 'Gram Panchayat Alibaug', landId: 'GOV-2024-MH-0007', amount: 312000, quality: 89.9, status: 'COMPLETED', paidAt: '2025-02-22', razorpay: 'pout_ghi012' },
  { id: 8, ngo: 'EcoRestore NGO', panchayat: 'Gram Panchayat Murud', landId: 'GOV-2024-MH-0008', amount: 178000, quality: 76.3, status: 'FAILED', paidAt: null, razorpay: null },
];

const STATUS_MAP = {
  COMPLETED: { bg: 'bg-accent-emerald/10', text: 'text-accent-emerald', border: 'border-accent-emerald/30', icon: CheckCircle2 },
  PROCESSING: { bg: 'bg-accent-blue/10', text: 'text-accent-blue', border: 'border-accent-blue/30', icon: Clock },
  PENDING: { bg: 'bg-accent-amber/10', text: 'text-accent-amber', border: 'border-accent-amber/30', icon: Clock },
  FAILED: { bg: 'bg-accent-red/10', text: 'text-accent-red', border: 'border-accent-red/30', icon: XCircle },
};

const fmtINR = (n) => `₹${(n / 100000).toFixed(1)}L`;

export default function Payouts() {
  const totalPaid = MOCK_PAYOUTS.filter((p) => p.status === 'COMPLETED').reduce((s, p) => s + p.amount, 0);
  const totalPending = MOCK_PAYOUTS.filter((p) => ['PENDING', 'PROCESSING'].includes(p.status)).reduce((s, p) => s + p.amount, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-ct-text">NGO / Panchayat Payouts</h1>
          <p className="text-ct-muted text-sm mt-0.5">Quality-based payout tracking via Razorpay</p>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="gov-card">
          <div className="flex items-center gap-2 mb-2">
            <IndianRupee size={14} className="text-gov-blue" />
            <p className="text-xs text-gray-500 uppercase font-semibold">Total Paid</p>
          </div>
          <p className="text-2xl font-bold text-gov-navy">{fmtINR(totalPaid)}</p>
        </div>
        <div className="gov-card">
          <div className="flex items-center gap-2 mb-2">
            <Clock size={14} className="text-gov-blue" />
            <p className="text-xs text-gray-500 uppercase font-semibold">Pending / Processing</p>
          </div>
          <p className="text-2xl font-bold text-gov-navy">{fmtINR(totalPending)}</p>
        </div>
        <div className="gov-card">
          <div className="flex items-center gap-2 mb-2">
            <Building2 size={14} className="text-gov-blue" />
            <p className="text-xs text-gray-500 uppercase font-semibold">Active NGOs</p>
          </div>
          <p className="text-2xl font-bold text-gov-navy">{new Set(MOCK_PAYOUTS.map((p) => p.ngo)).size}</p>
        </div>
      </div>

      {/* Table */}
      <div className="ct-card overflow-hidden">
        <table className="ct-table">
          <thead>
            <tr>
              <th>Payout #</th>
              <th>NGO</th>
              <th>Panchayat</th>
              <th>Land ID</th>
              <th>Amount</th>
              <th>Quality</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_PAYOUTS.map((p) => {
              const st = STATUS_MAP[p.status];
              const StIcon = st.icon;
              return (
                <tr key={p.id}>
                  <td className="font-mono text-xs text-gov-blue">PAY-{String(p.id).padStart(4, '0')}</td>
                  <td className="font-medium">{p.ngo}</td>
                  <td className="text-gray-600 text-xs">{p.panchayat}</td>
                  <td className="font-mono text-xs text-gray-500">{p.landId}</td>
                  <td className="font-mono font-semibold">₹{p.amount.toLocaleString('en-IN')}</td>
                  <td>
                    <span className={`text-xs font-semibold ${p.quality >= 90 ? 'text-green-700' : p.quality >= 80 ? 'text-amber-700' : 'text-red-700'}`}>
                      {p.quality}%
                    </span>
                  </td>
                  <td>
                    <span className={p.status === 'COMPLETED' ? 'ct-badge-approved' : p.status === 'FAILED' ? 'ct-badge-rejected' : 'ct-badge-pending'}>
                      <StIcon size={10} className="mr-1" />
                      {p.status}
                    </span>
                  </td>
                  <td className="text-xs text-gray-500">
                    {p.paidAt || '—'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
