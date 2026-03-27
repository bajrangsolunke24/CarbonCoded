import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/stores/authStore';
import { StatusBadge } from '@/components/StatusBadge';
import {
  ShoppingBag, FileCheck, MessageCircle, Leaf, Clock, AlertTriangle,
  BadgeCheck, Loader2, TrendingUp, TrendingDown, DollarSign, Award,
  ArrowRight, Activity, Globe, Zap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, Legend
} from 'recharts';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { getDashboard, getPurchaseChart, getBreakdownChart, getTransactions, getRequests } from '@/services/company';
import { createOrder, openRazorpayModal, simulatePay } from '@/services/payment';

const COLORS = ['hsl(150,55%,23%)', 'hsl(43,55%,54%)', 'hsl(217,91%,60%)', 'hsl(0,84%,60%)', 'hsl(38,50%,45%)'];

// Rich mock chart data for a lively dashboard
const MOCK_PURCHASE_DATA = [
  { month: 'Apr', credits: 420, co2: 630 },
  { month: 'May', credits: 680, co2: 1020 },
  { month: 'Jun', credits: 530, co2: 795 },
  { month: 'Jul', credits: 910, co2: 1365 },
  { month: 'Aug', credits: 1120, co2: 1680 },
  { month: 'Sep', credits: 875, co2: 1312 },
  { month: 'Oct', credits: 1340, co2: 2010 },
  { month: 'Nov', credits: 1680, co2: 2520 },
  { month: 'Dec', credits: 1450, co2: 2175 },
  { month: 'Jan', credits: 1920, co2: 2880 },
  { month: 'Feb', credits: 2100, co2: 3150 },
  { month: 'Mar', credits: 1850, co2: 2775 },
];

const MOCK_BREAKDOWN = [
  { name: 'Forest', value: 42 },
  { name: 'Agricultural', value: 28 },
  { name: 'Wetland', value: 18 },
  { name: 'Grassland', value: 12 },
];

const MOCK_RECENT_TXNS = [
  { id: '1', transaction_id: 'TXN-2025-083941', land_identifier: 'LND-UP-0008901', credits: 400, amount_inr: '232000', status: 'successful', created_at: '2025-03-18T09:22:00Z' },
  { id: '2', transaction_id: 'TXN-2025-071822', land_identifier: 'LND-MH-0023401', credits: 250, amount_inr: '175000', status: 'successful', created_at: '2025-03-12T14:05:00Z' },
  { id: '3', transaction_id: 'TXN-2025-060331', land_identifier: 'LND-KA-0011782', credits: 600, amount_inr: '318000', status: 'pending', created_at: '2025-03-08T11:30:00Z' },
  { id: '4', transaction_id: 'TXN-2025-049102', land_identifier: 'LND-GJ-0009201', credits: 150, amount_inr: '97500', status: 'successful', created_at: '2025-02-28T16:45:00Z' },
  { id: '5', transaction_id: 'TXN-2025-031887', land_identifier: 'LND-RJ-0017340', credits: 0, amount_inr: '0', status: 'failed', created_at: '2025-02-20T10:12:00Z' },
];

const RECENT_ACTIVITY = [
  { text: 'Purchase request approved for LND-MH-0023401', time: '2 hours ago', type: 'success' },
  { text: 'New certificate issued: CERT-IN-2025-00312', time: '1 day ago', type: 'info' },
  { text: 'Payment confirmed ₹1,75,000 via Razorpay', time: '3 days ago', type: 'success' },
  { text: 'Credit expiry alert: 200 credits expire in 14 days', time: '4 days ago', type: 'warning' },
  { text: 'CSR compliance report submitted to MoEFCC', time: '1 week ago', type: 'info' },
];

function LiveRequestsPanel() {
  const { toast } = useToast();
  const [payingReqId, setPayingReqId] = useState<string | null>(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['company-live-requests'],
    queryFn: getRequests,
    refetchInterval: 8000, // poll every 8s for near-realtime
  });

  const handlePayNow = async (reqId: string) => {
    try {
      setPayingReqId(reqId);
      const orderData = await createOrder(reqId);



      openRazorpayModal(
        orderData,
        () => {
          toast({ title: 'Payment Successful', description: 'Your payment was verified. Awaiting government issuance.' });
          refetch();
          setPayingReqId(null);
        },
        (err: any) => {
          toast({ title: 'Payment Failed', description: err.message || 'Payment cancelled or failed', variant: 'destructive' });
          setPayingReqId(null);
        }
      );
    } catch (err: any) {
      toast({ title: 'Error', description: err?.response?.data?.error || 'Could not initiate payment', variant: 'destructive' });
      setPayingReqId(null);
    }
  };

  const handleSimulatePay = async (reqId: string) => {
    try {
      setPayingReqId(reqId);
      const orderData = await createOrder(reqId);
      const result = await simulatePay(orderData.order_id);
      toast({ title: '✅ Payment Simulated', description: result.message || 'Test payment done. Awaiting government verification.' });
      refetch();
    } catch (err: any) {
      toast({ title: 'Error', description: err?.response?.data?.error || 'Could not simulate payment', variant: 'destructive' });
    } finally {
      setPayingReqId(null);
    }
  };

  const requests = (data?.data || data || []).slice(0, 5);
  const statusColor: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    under_review: 'bg-purple-100 text-purple-800',
    payment_verified: 'bg-orange-100 text-orange-800',
  };
  if (isLoading) return <div className="p-4 text-xs text-muted-foreground">Fetching requests...</div>;
  if (!requests.length) return <div className="p-4 text-xs text-muted-foreground">No requests yet. Go to Marketplace to start!</div>;
  return (
    <div className="divide-y">
      {requests.map((r: any) => (
        <div key={r.id || r.request_id} className="px-4 py-3">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-mono text-muted-foreground">{r.request_id}</p>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusColor[r.status] || 'bg-gray-100 text-gray-700'}`}>{r.status?.replace('_', ' ').toUpperCase()}</span>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium">{r.credits_requested} credits · {r.duration_years}yr</p>
            {r.status === 'approved' && (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="h-7 text-[10px] px-3 border-green-600 text-green-700 hover:bg-green-50" onClick={() => handleSimulatePay(r.id || r.request_id)} disabled={payingReqId === (r.id || r.request_id)}>
                  Test: Mark Done
                </Button>
                <Button size="sm" className="h-7 text-[10px] px-3 bg-green-600 hover:bg-green-700" onClick={() => handlePayNow(r.id || r.request_id)} disabled={payingReqId === (r.id || r.request_id)}>
                  {payingReqId === (r.id || r.request_id) ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <DollarSign className="h-3 w-3 mr-1" />} Pay Now
                </Button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function CompanyDashboard() {
  const { companyUser } = useAuthStore();
  const navigate = useNavigate();

  const { data: dashboardData, isLoading: isDashboardLoading } = useQuery({
    queryKey: ['company-dashboard'],
    queryFn: getDashboard,
  });
  const { data: purchaseRaw } = useQuery({ queryKey: ['company-purchase-chart'], queryFn: getPurchaseChart });
  const { data: breakdownRaw } = useQuery({ queryKey: ['company-breakdown-chart'], queryFn: getBreakdownChart });
  const { data: txnsData } = useQuery({ queryKey: ['company-recent-txns'], queryFn: () => getTransactions({}) });

  // Use API data if available, else rich mock data
  const purchaseData = (purchaseRaw && purchaseRaw.length > 0) ? purchaseRaw : MOCK_PURCHASE_DATA;
  const breakdownData = (breakdownRaw && breakdownRaw.length > 0) ? breakdownRaw : MOCK_BREAKDOWN;
  const recentTxns = (txnsData && (txnsData.data?.length > 0 || txnsData.length > 0))
    ? (txnsData.data || txnsData)
    : MOCK_RECENT_TXNS;

  const stats = {
    totalCreditsPurchased: dashboardData?.totalCreditsPurchased || 14875,
    activeCertificates: dashboardData?.activeCertificates || 7,
    pendingRequests: dashboardData?.pendingRequests || 2,
    creditsExpiringSoon: dashboardData?.creditsExpiringSoon || 200,
  };

  const kpis = [
    {
      label: 'Credits Purchased',
      value: stats.totalCreditsPurchased.toLocaleString(),
      icon: Leaf,
      color: 'text-primary',
      bg: 'bg-primary/10',
      trend: '+12.4%',
      trendUp: true,
    },
    {
      label: 'Active Certificates',
      value: stats.activeCertificates,
      icon: FileCheck,
      color: 'text-green-600',
      bg: 'bg-green-50',
      trend: '+2 this month',
      trendUp: true,
    },
    {
      label: 'Pending Requests',
      value: stats.pendingRequests,
      icon: Clock,
      color: 'text-yellow-600',
      bg: 'bg-yellow-50',
      trend: 'Awaiting review',
      trendUp: null,
    },
    {
      label: 'Expiring Soon',
      value: stats.creditsExpiringSoon,
      icon: AlertTriangle,
      color: 'text-red-500',
      bg: 'bg-red-50',
      trend: 'In 14 days',
      trendUp: false,
    },
  ];

  if (isDashboardLoading) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="gradient-hero rounded-xl p-6 text-primary-foreground relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-full opacity-10">
          <Globe className="w-full h-full" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold">Welcome, {companyUser?.name || 'Tata Steel Ltd.'}</h1>
              <BadgeCheck className="h-6 w-6 text-yellow-300" />
            </div>
            <p className="text-sm opacity-80">CIN: {companyUser?.cin || 'L27100MH1907PLC000260'} · Verified Carbon Buyer</p>
            <div className="flex gap-3 mt-3">
              <span className="bg-white/20 text-white text-xs px-3 py-1 rounded-full flex items-center gap-1">
                <Zap className="h-3 w-3" /> CSR Compliant 2025
              </span>
              <span className="bg-white/20 text-white text-xs px-3 py-1 rounded-full flex items-center gap-1">
                <Award className="h-3 w-3" /> Carbon Neutral Tier 2
              </span>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="border-white/40 text-white hover:bg-white/20 hover:text-white"
              onClick={() => navigate('/company/marketplace')}
            >
              <ShoppingBag className="h-4 w-4 mr-2" /> Buy Credits
            </Button>
            <Button
              className="bg-white text-primary hover:bg-white/90"
              onClick={() => navigate('/company/certificates')}
            >
              <FileCheck className="h-4 w-4 mr-2" /> My Certificates
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map(kpi => (
          <Card key={kpi.label} className="hover:shadow-md transition-all hover:-translate-y-0.5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className={`${kpi.bg} ${kpi.color} p-2 rounded-lg`}>
                  <kpi.icon className="h-4 w-4" />
                </div>
                {kpi.trendUp === true && <span className="text-xs text-green-600 font-medium flex items-center gap-0.5"><TrendingUp className="h-3 w-3" />{kpi.trend}</span>}
                {kpi.trendUp === false && <span className="text-xs text-red-500 font-medium flex items-center gap-0.5"><TrendingDown className="h-3 w-3" />{kpi.trend}</span>}
                {kpi.trendUp === null && <span className="text-xs text-yellow-600 font-medium">{kpi.trend}</span>}
              </div>
              <p className="text-2xl font-bold text-foreground">{kpi.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{kpi.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="md:col-span-2">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">Credits Purchased &amp; CO₂ Offset (12 Months)</CardTitle>
            <Badge variant="outline" className="text-xs">FY 2024-25</Badge>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={230}>
              <AreaChart data={purchaseData}>
                <defs>
                  <linearGradient id="creditsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(150,55%,23%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(150,55%,23%)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="co2Grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(43,55%,54%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(43,55%,54%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))' }} />
                <Legend />
                <Area type="monotone" dataKey="credits" stroke="hsl(150,55%,23%)" strokeWidth={2} fill="url(#creditsGrad)" name="Credits" />
                <Area type="monotone" dataKey="co2" stroke="hsl(43,55%,54%)" strokeWidth={2} fill="url(#co2Grad)" name="CO₂ (ton)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Portfolio by Land Type</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={230}>
              <PieChart>
                <Pie data={breakdownData} dataKey="value" nameKey="name" cx="50%" cy="45%" innerRadius={50} outerRadius={80} paddingAngle={3}>
                  {breakdownData.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend iconSize={10} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row - Transactions + Activity Feed */}
      <div className="grid md:grid-cols-3 gap-4">
        {/* Recent Transactions */}
        <Card className="md:col-span-2">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-primary" /> Recent Transactions
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate('/company/transactions')} className="text-xs">
              View All <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="text-left px-4 py-2.5 text-xs text-muted-foreground font-medium">Txn ID</th>
                    <th className="text-left px-4 py-2.5 text-xs text-muted-foreground font-medium">Project</th>
                    <th className="text-left px-4 py-2.5 text-xs text-muted-foreground font-medium">Credits</th>
                    <th className="text-left px-4 py-2.5 text-xs text-muted-foreground font-medium">Amount</th>
                    <th className="text-left px-4 py-2.5 text-xs text-muted-foreground font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(Array.isArray(recentTxns) ? recentTxns : recentTxns.data || []).slice(0, 5).map((t: any) => (
                    <tr key={t.id} className="border-b border-border last:border-0 hover:bg-secondary/40 transition-colors cursor-pointer">
                      <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">{t.transaction_id}</td>
                      <td className="px-4 py-2.5 text-xs font-medium">{t.land_identifier}</td>
                      <td className="px-4 py-2.5 text-sm font-semibold">{t.credits?.toLocaleString() || t.credits}</td>
                      <td className="px-4 py-2.5 text-sm font-semibold">₹{parseFloat(t.amount_inr).toLocaleString()}</td>
                      <td className="px-4 py-2.5"><StatusBadge status={t.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Live Purchase Requests Status */}
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary animate-pulse" /> My Requests
              <span className="text-[9px] text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full font-bold ml-1">LIVE</span>
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate('/company/transactions')} className="text-xs">
              All <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <LiveRequestsPanel />
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-3">
        <Button variant="outline" className="h-auto py-4 flex-col gap-2 hover:bg-primary/5 hover:border-primary/30" onClick={() => navigate('/company/marketplace')}>
          <ShoppingBag className="h-5 w-5 text-primary" />
          <span className="text-xs font-medium">Browse Credits</span>
        </Button>
        <Button variant="outline" className="h-auto py-4 flex-col gap-2 hover:bg-primary/5 hover:border-primary/30" onClick={() => navigate('/company/enquire')}>
          <MessageCircle className="h-5 w-5 text-primary" />
          <span className="text-xs font-medium">Make Enquiry</span>
        </Button>
        <Button variant="outline" className="h-auto py-4 flex-col gap-2 hover:bg-primary/5 hover:border-primary/30" onClick={() => navigate('/company/certificates')}>
          <FileCheck className="h-5 w-5 text-primary" />
          <span className="text-xs font-medium">View Certificates</span>
        </Button>
      </div>
    </div>
  );
}
