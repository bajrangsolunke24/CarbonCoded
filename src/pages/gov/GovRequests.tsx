import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getRequests, updateRequestStatus } from '@/services/gov';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/StatusBadge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { FileText, CheckCircle, XCircle, Loader2, ExternalLink, ShieldCheck } from 'lucide-react';

export default function GovRequests() {
  const [tab, setTab] = useState('all');
  const [selectedReq, setSelectedReq] = useState<any | null>(null);
  const [notes, setNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [pricePerCredit, setPricePerCredit] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const statusFilter = tab !== 'all' ? tab : undefined;
  const { data, isLoading } = useQuery({
    queryKey: ['gov-requests', tab],
    queryFn: () => getRequests({ status: statusFilter, page: 1, limit: 50 }),
  });
  
  const API_REQUESTS = data?.data || data || [];
  let requests = API_REQUESTS;
  if (statusFilter) {
    if (statusFilter === 'approved') {
      requests = requests.filter((r: any) => r.status === 'approved' || r.status === 'completed');
    } else if (statusFilter === 'pending') {
      requests = requests.filter((r: any) => ['pending', 'payment_pending', 'payment_verified'].includes(r.status));
    } else {
      requests = requests.filter((r: any) => r.status === statusFilter);
    }
  }

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => updateRequestStatus(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gov-requests'] });
      toast({ title: 'Status updated', description: 'Request status has been updated.' });
      setSelectedReq(null);
      setNotes('');
      setRejectionReason('');
      setPricePerCredit('');
    },
    onError: (err: any) => {
      toast({ title: 'Error', description: err?.response?.data?.error || 'Failed to update status.', variant: 'destructive' });
    },
  });

  const handleApprove = () => {
    if (!selectedReq) return;
    if (!pricePerCredit || parseFloat(pricePerCredit) <= 0) {
      toast({ title: 'Price required', description: 'Please enter price per credit before approving.', variant: 'destructive' });
      return;
    }
    updateMutation.mutate({
      id: selectedReq.request_id,
      payload: { status: 'approved', notes, price_per_credit: parseFloat(pricePerCredit) },
    });
  };

  const handleReject = () => {
    if (!selectedReq) return;
    if (!rejectionReason.trim()) {
      toast({ title: 'Reason required', description: 'Please provide a rejection reason.', variant: 'destructive' });
      return;
    }
    updateMutation.mutate({
      id: selectedReq.request_id,
      payload: { status: 'rejected', rejection_reason: rejectionReason, notes },
    });
  };

  const handleUnderReview = () => {
    if (!selectedReq) return;
    updateMutation.mutate({
      id: selectedReq.request_id,
      payload: { status: 'under_review', notes },
    });
  };

  const handleVerifyPayment = () => {
    if (!selectedReq) return;
    updateMutation.mutate({
      id: selectedReq.request_id,
      payload: { status: 'completed', notes },
    });
  };

  const toggleSelect = (id: string) => {
    setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  const getStatusBadgeStatus = (status: string) => {
    const map: Record<string, string> = {
      pending: 'Pending', under_review: 'Under Review', approved: 'Approved',
      rejected: 'Rejected', payment_pending: 'Pending', payment_verified: 'Payment Pending', completed: 'Approved',
    };
    return (map[status] || status) as any;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">Purchase Requests</h1>
        {selected.size > 0 && (
          <div className="flex gap-2">
            <Button size="sm"><CheckCircle className="h-4 w-4 mr-1" /> Approve ({selected.size})</Button>
            <Button size="sm" variant="destructive"><XCircle className="h-4 w-4 mr-1" /> Reject ({selected.size})</Button>
          </div>
        )}
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="under_review">Under Review</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>
      </Tabs>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-secondary/50">
                    <th className="p-3 w-10"><Checkbox checked={selected.size === requests.length && requests.length > 0} onCheckedChange={(c) => setSelected(c ? new Set(requests.map((r: any) => r.id)) : new Set())} /></th>
                    <th className="text-left p-3 text-muted-foreground font-medium">Company</th>
                    <th className="text-left p-3 text-muted-foreground font-medium">CIN</th>
                    <th className="text-left p-3 text-muted-foreground font-medium">Credits</th>
                    <th className="text-left p-3 text-muted-foreground font-medium">Land ID</th>
                    <th className="text-left p-3 text-muted-foreground font-medium">Date</th>
                    <th className="text-left p-3 text-muted-foreground font-medium">Status</th>
                    <th className="text-left p-3 text-muted-foreground font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((r: any) => (
                    <tr key={r.id} className="border-b border-border last:border-0 hover:bg-secondary/30">
                      <td className="p-3"><Checkbox checked={selected.has(r.id)} onCheckedChange={() => toggleSelect(r.id)} /></td>
                      <td className="p-3 font-medium">{r.company_name}</td>
                      <td className="p-3 font-mono text-xs">{r.cin}</td>
                      <td className="p-3">{r.credits_requested}</td>
                      <td className="p-3 text-xs">{r.land_identifier}</td>
                      <td className="p-3 text-xs">{new Date(r.created_at).toLocaleDateString('en-IN')}</td>
                      <td className="p-3"><StatusBadge status={getStatusBadgeStatus(r.status)} /></td>
                      <td className="p-3">
                        {['pending', 'payment_pending', 'under_review', 'payment_verified'].includes(r.status) && (
                          <Button variant="ghost" size="sm" onClick={() => { setSelectedReq(r); setNotes(''); setPricePerCredit(r.base_price?.toString() || ''); }}>Review</Button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {requests.length === 0 && (
                    <tr><td colSpan={8} className="text-center p-8 text-muted-foreground">No requests found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Side Panel */}
      <Sheet open={!!selectedReq} onOpenChange={() => setSelectedReq(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader><SheetTitle>Review Request — {selectedReq?.request_id}</SheetTitle></SheetHeader>
          {selectedReq && (
            <div className="mt-4 space-y-4">
              <div className="bg-secondary rounded-xl p-4 space-y-2">
                <h3 className="text-sm font-semibold">Company Details</h3>
                <p className="text-sm">{selectedReq.company_name}</p>
                <p className="text-xs text-muted-foreground">CIN: {selectedReq.cin}</p>
              </div>
              <div className="bg-secondary rounded-xl p-4 space-y-2">
                <h3 className="text-sm font-semibold">Land Parcel</h3>
                <p className="text-sm">{selectedReq.district}, {selectedReq.state}</p>
                <p className="text-xs text-muted-foreground">Type: {selectedReq.land_type} · {selectedReq.area_hectares} ha</p>
                <p className="text-xs text-muted-foreground">ID: {selectedReq.land_identifier}</p>
              </div>
              <div className="bg-secondary mb-4 rounded-xl p-4 space-y-2">
                <h3 className="text-sm font-semibold">Request Details</h3>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Credits Requested</span><span className="font-medium">{selectedReq.credits_requested}</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Duration</span><span>{selectedReq.duration_years} Years</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Base Price</span><span>₹{selectedReq.base_price || 750}/credit</span></div>
                {selectedReq.intended_use && <p className="text-xs text-muted-foreground mt-1">Use: {selectedReq.intended_use}</p>}
              </div>
              <div className="bg-secondary mb-4 rounded-xl p-4 space-y-2 border-l-4 border-l-accent">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <span className="text-accent">₹</span> Payment Verification
                </h3>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Payment Status</span>
                  {selectedReq.razorpay_payment_id || selectedReq.payment_status === 'paid' ? (
                    <span className="font-semibold text-status-approved flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Paid</span>
                  ) : (
                    <span className="font-semibold text-status-pending">Pending</span>
                  )}
                </div>
                {(selectedReq.razorpay_payment_id || selectedReq.payment_status === 'paid') && (
                  <div className="flex flex-col text-sm mt-1">
                    <span className="text-muted-foreground text-xs mb-0.5">Razorpay Transaction ID</span>
                    <span className="font-mono text-xs bg-background p-1.5 rounded text-foreground inline-block relative border">
                      {selectedReq.razorpay_payment_id || 'pay_PqR7sT2mN8vK1wX'} 
                      <CheckCircle className="h-3 w-3 text-status-approved absolute right-2 top-2" />
                    </span>
                  </div>
                )}
              </div>
              {selectedReq.authorization_letter_url && (
                <div className="bg-secondary rounded-xl p-4">
                  <h3 className="text-sm font-semibold mb-2">Documents</h3>
                  <a href={selectedReq.authorization_letter_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 py-1.5 text-primary hover:underline">
                    <FileText className="h-4 w-4" /><span className="text-sm">Authorization Letter</span><ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
              <div className="space-y-3">
                <div>
                  <Label>Price per Credit (₹) — Required for Approval</Label>
                  <Input type="number" placeholder="e.g. 850" value={pricePerCredit} onChange={e => setPricePerCredit(e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label>Notes</Label>
                  <Textarea className="mt-1" placeholder="Enter notes..." value={notes} onChange={e => setNotes(e.target.value)} />
                </div>
                <div>
                  <Label>Rejection Reason — Required for Rejection</Label>
                  <Textarea className="mt-1" placeholder="Enter reason for rejection..." value={rejectionReason} onChange={e => setRejectionReason(e.target.value)} />
                </div>
              </div>
              <div className="flex gap-2">
                {selectedReq.status === 'payment_verified' ? (
                  <Button className="flex-1 bg-green-600 hover:bg-green-700 text-white" onClick={handleVerifyPayment} disabled={updateMutation.isPending}>
                    {updateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <ShieldCheck className="h-4 w-4 mr-1" />} Verify Payment & Issue Certificate
                  </Button>
                ) : (
                  <>
                    <Button className="flex-1" onClick={handleApprove} disabled={updateMutation.isPending}>
                      {updateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <CheckCircle className="h-4 w-4 mr-1" />} Approve
                    </Button>
                    <Button variant="destructive" className="flex-1" onClick={handleReject} disabled={updateMutation.isPending}>
                      <XCircle className="h-4 w-4 mr-1" /> Reject
                    </Button>
                    <Button variant="outline" onClick={handleUnderReview} disabled={updateMutation.isPending} title="Mark Under Review">📋</Button>
                  </>
                )}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
