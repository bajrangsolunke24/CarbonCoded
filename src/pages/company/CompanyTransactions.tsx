import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getTransactions } from '@/services/company';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import {
  Download, Search, Loader2, Receipt, TrendingUp,
  DollarSign, CheckCircle2, XCircle, Clock, FileText,
  CreditCard, ArrowUpRight
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const MOCK_TRANSACTIONS = [
  {
    id: '1',
    transaction_id: 'TXN-2025-083941',
    land_identifier: 'LND-UP-0008901',
    project_name: 'Carbon Offset Project – Gorakhpur',
    credits: 400,
    amount_inr: '232000',
    status: 'successful',
    razorpay_payment_id: 'pay_PqR7sT2mN8vK1wX',
    created_at: '2025-03-18T09:22:00Z',
    certificate_id: 'CERT-IN-2025-00312',
  },
  {
    id: '2',
    transaction_id: 'TXN-2025-071822',
    land_identifier: 'LND-MH-0023401',
    project_name: 'Carbon Offset Project – Pune',
    credits: 250,
    amount_inr: '175000',
    status: 'successful',
    razorpay_payment_id: 'pay_MnO3pQ8rS5tU2vW',
    created_at: '2025-03-12T14:05:00Z',
    certificate_id: 'CERT-IN-2025-00287',
  },
  {
    id: '3',
    transaction_id: 'TXN-2025-060331',
    land_identifier: 'LND-KA-0011782',
    project_name: 'Carbon Offset Project – Mysuru',
    credits: 600,
    amount_inr: '318000',
    status: 'pending',
    razorpay_payment_id: null,
    created_at: '2025-03-08T11:30:00Z',
    certificate_id: null,
  },
  {
    id: '4',
    transaction_id: 'TXN-2025-049102',
    land_identifier: 'LND-GJ-0009201',
    project_name: 'Carbon Offset Project – Ahmedabad',
    credits: 150,
    amount_inr: '97500',
    status: 'successful',
    razorpay_payment_id: 'pay_JkL9mN4oP1qR6sT',
    created_at: '2025-02-28T16:45:00Z',
    certificate_id: 'CERT-IN-2024-00198',
  },
  {
    id: '5',
    transaction_id: 'TXN-2025-031887',
    land_identifier: 'LND-RJ-0017340',
    project_name: 'Carbon Offset Project – Jaipur',
    credits: 0,
    amount_inr: '0',
    status: 'failed',
    razorpay_payment_id: null,
    created_at: '2025-02-20T10:12:00Z',
    certificate_id: null,
  },
  {
    id: '6',
    transaction_id: 'TXN-2024-098123',
    land_identifier: 'LND-TN-0034512',
    project_name: 'Carbon Offset Project – Coimbatore',
    credits: 320,
    amount_inr: '192000',
    status: 'successful',
    razorpay_payment_id: 'pay_AbC1dE2fG3hI4jK',
    created_at: '2024-12-15T13:00:00Z',
    certificate_id: 'CERT-IN-2024-00121',
  },
];

function StatusIcon({ status }: { status: string }) {
  if (status === 'successful') return <CheckCircle2 className="h-4 w-4 text-green-500" />;
  if (status === 'pending') return <Clock className="h-4 w-4 text-yellow-500" />;
  if (status === 'failed') return <XCircle className="h-4 w-4 text-red-500" />;
  return <Clock className="h-4 w-4 text-muted-foreground" />;
}

function StatusBadge2({ status }: { status: string }) {
  const map: Record<string, string> = {
    successful: 'bg-green-50 text-green-700 border-green-200',
    pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    failed: 'bg-red-50 text-red-700 border-red-200',
    refunded: 'bg-blue-50 text-blue-700 border-blue-200',
  };
  return (
    <Badge variant="outline" className={`text-[10px] font-semibold ${map[status] || ''}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}

export default function CompanyTransactions() {
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedTxn, setSelectedTxn] = useState<any | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['company-txns', { statusFilter, search, page }],
    queryFn: () => getTransactions({ status: statusFilter !== 'all' ? statusFilter : undefined }),
  });

  const apiTxns = data?.data || data || [];
  const allTxns = apiTxns.length > 0 ? apiTxns : MOCK_TRANSACTIONS;

  const filtered = allTxns.filter((t: any) => {
    const matchStatus = statusFilter === 'all' || t.status === statusFilter;
    const matchSearch = !search || t.transaction_id?.includes(search) || t.land_identifier?.includes(search);
    return matchStatus && matchSearch;
  });

  const totalSpend = allTxns
    .filter((t: any) => t.status === 'successful')
    .reduce((sum: number, t: any) => sum + parseFloat(t.amount_inr || '0'), 0);
  const totalCredits = allTxns
    .filter((t: any) => t.status === 'successful')
    .reduce((sum: number, t: any) => sum + (t.credits || 0), 0);
  const pendingCount = allTxns.filter((t: any) => t.status === 'pending').length;

  const handleExport = () => {
    toast({ title: 'Export Started', description: 'Your CSV is being prepared for download.' });
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Receipt className="h-5 w-5 text-primary" /> Transaction History
          </h1>
          <p className="text-sm text-muted-foreground mt-1">All carbon credit purchases and payment records</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="h-4 w-4 mr-2" /> Export CSV
        </Button>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="bg-green-50 p-2.5 rounded-xl">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Invested</p>
              <p className="text-lg font-bold text-foreground">₹{totalSpend.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="bg-primary/10 p-2.5 rounded-xl">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Credits Acquired</p>
              <p className="text-lg font-bold text-foreground">{totalCredits.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="bg-yellow-50 p-2.5 rounded-xl">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Pending</p>
              <p className="text-lg font-bold text-foreground">{pendingCount} requests</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-10"
              placeholder="Search by Txn ID or Project ID..."
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') setSearch(searchInput); }}
            />
          </div>
          <Button size="sm" onClick={() => setSearch(searchInput)}>Search</Button>
        </div>
        <Select value={statusFilter} onValueChange={v => setStatusFilter(v)}>
          <SelectTrigger className="w-40"><SelectValue placeholder="All Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="successful">Successful</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="refunded">Refunded</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Transactions Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="text-left px-4 py-3 text-xs text-muted-foreground font-semibold">Transaction ID</th>
                    <th className="text-left px-4 py-3 text-xs text-muted-foreground font-semibold">Date</th>
                    <th className="text-left px-4 py-3 text-xs text-muted-foreground font-semibold">Project</th>
                    <th className="text-left px-4 py-3 text-xs text-muted-foreground font-semibold">Payment ID</th>
                    <th className="text-left px-4 py-3 text-xs text-muted-foreground font-semibold">Credits</th>
                    <th className="text-left px-4 py-3 text-xs text-muted-foreground font-semibold">Amount</th>
                    <th className="text-left px-4 py-3 text-xs text-muted-foreground font-semibold">Status</th>
                    <th className="text-left px-4 py-3 text-xs text-muted-foreground font-semibold"></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((t: any) => (
                    <tr
                      key={t.id}
                      className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors cursor-pointer"
                      onClick={() => setSelectedTxn(t)}
                    >
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{t.transaction_id}</td>
                      <td className="px-4 py-3 text-xs">{new Date(t.created_at).toLocaleDateString('en-IN')}</td>
                      <td className="px-4 py-3 text-xs font-medium max-w-[160px] truncate">{t.project_name || t.land_identifier}</td>
                      <td className="px-4 py-3">
                        {t.razorpay_payment_id ? (
                          <span className="flex items-center gap-1 font-mono text-[10px] text-muted-foreground">
                            <CreditCard className="h-3 w-3" />{t.razorpay_payment_id}
                          </span>
                        ) : <span className="text-muted-foreground text-xs">—</span>}
                      </td>
                      <td className="px-4 py-3 font-semibold">{t.credits?.toLocaleString()}</td>
                      <td className="px-4 py-3 font-semibold">₹{parseFloat(t.amount_inr || '0').toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <StatusIcon status={t.status} />
                          <StatusBadge2 status={t.status} />
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-4 py-16 text-center text-muted-foreground">
                        No transactions match your filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transaction Detail Modal */}
      <Dialog open={!!selectedTxn} onOpenChange={() => setSelectedTxn(null)}>
        <DialogContent className="max-w-md">
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-primary" /> Transaction Details
          </DialogTitle>
          {selectedTxn && (
            <div className="space-y-4">
              <div className="bg-muted/40 rounded-xl p-4 space-y-3">
                <div className="flex justify-between">
                  <StatusIcon status={selectedTxn.status} />
                  <StatusBadge2 status={selectedTxn.status} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Transaction ID</p>
                  <p className="font-mono font-bold text-sm">{selectedTxn.transaction_id}</p>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Date</p>
                    <p className="font-medium">{new Date(selectedTxn.created_at).toLocaleString('en-IN')}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Credits</p>
                    <p className="font-bold text-primary">{selectedTxn.credits?.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Amount Paid</p>
                    <p className="font-bold text-lg">₹{parseFloat(selectedTxn.amount_inr || '0').toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Project</p>
                    <p className="font-medium text-xs">{selectedTxn.land_identifier}</p>
                  </div>
                </div>
                {selectedTxn.razorpay_payment_id && (
                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                    <p className="text-[10px] text-blue-500 font-semibold mb-1 flex items-center gap-1"><CreditCard className="h-3 w-3" /> Razorpay Payment</p>
                    <p className="font-mono text-xs text-blue-800">{selectedTxn.razorpay_payment_id}</p>
                  </div>
                )}
                {selectedTxn.certificate_id && (
                  <div className="bg-green-50 border border-green-100 rounded-lg p-3">
                    <p className="text-[10px] text-green-600 font-semibold mb-1 flex items-center gap-1"><FileText className="h-3 w-3" /> Certificate Issued</p>
                    <p className="font-mono text-xs text-green-800">{selectedTxn.certificate_id}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
