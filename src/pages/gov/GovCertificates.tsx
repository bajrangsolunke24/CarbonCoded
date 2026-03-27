import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCertificates, revokeCertificate } from '@/services/gov';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/StatusBadge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Search, FileCheck, Ban, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

export default function GovCertificates() {
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);
  const [revokeCert, setRevokeCert] = useState<any | null>(null);
  const [revokeReason, setRevokeReason] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const filters = {
    ...(search ? { search } : {}),
    page,
    limit: 20
  };

  const { data, isLoading } = useQuery({ queryKey: ['gov-certs', filters], queryFn: () => getCertificates(filters) });
  
  const MOCK_CERTS = [
    { id: 'c1', certificate_id: 'CERT-IN-2025-00312', company_name: 'Tata Steel', land_identifier: 'LND-MH-003322', credits_issued: 3500, valid_from: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(), valid_to: new Date(Date.now() + 1000 * 60 * 60 * 24 * 335).toISOString(), status: 'active' },
    { id: 'c2', certificate_id: 'CERT-IN-2025-00287', company_name: 'Reliance Ind.', land_identifier: 'LND-GJ-009911', credits_issued: 10000, valid_from: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60).toISOString(), valid_to: new Date(Date.now() + 1000 * 60 * 60 * 24 * 305).toISOString(), status: 'active' },
    { id: 'c3', certificate_id: 'CERT-IN-2025-00104', company_name: 'Adani Green Energy', land_identifier: 'LND-GJ-008129', credits_issued: 5000, valid_from: new Date(Date.now() - 1000 * 60 * 60 * 24 * 400).toISOString(), valid_to: new Date(Date.now() - 1000 * 60 * 60 * 24 * 35).toISOString(), status: 'expired' },
  ];
  
  const API_CERTS = data?.data || [];
  let certs = API_CERTS.length > 0 ? API_CERTS : MOCK_CERTS;
  if (search) {
    certs = certs.filter((c: any) => c.certificate_id.toLowerCase().includes(search.toLowerCase()) || c.company_name.toLowerCase().includes(search.toLowerCase()));
  }
  
  const totalPages = data?.pages || 1;

  const revokeMutation = useMutation({
    mutationFn: () => revokeCertificate(revokeCert.certificate_id, revokeReason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gov-certs'] });
      toast({ title: 'Certificate Revoked', description: `Certificate ${revokeCert.certificate_id} has been revoked.` });
      setRevokeCert(null);
      setRevokeReason('');
    },
    onError: (err: any) => {
      toast({ title: 'Revocation Failed', description: err.response?.data?.error || 'Something went wrong', variant: 'destructive' });
    }
  });

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-foreground">Certificate Management</h1>

      <div className="relative flex gap-2 max-w-md">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-10" placeholder="Search by ID or Company..." value={searchInput} onChange={e => setSearchInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { setSearch(searchInput); setPage(1); } }} />
        </div>
        <Button size="sm" onClick={() => { setSearch(searchInput); setPage(1); }}>Search</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-secondary/50">
                    <th className="text-left p-3 text-muted-foreground font-medium">Certificate ID</th>
                    <th className="text-left p-3 text-muted-foreground font-medium">Company</th>
                    <th className="text-left p-3 text-muted-foreground font-medium">Land ID</th>
                    <th className="text-left p-3 text-muted-foreground font-medium">Credits</th>
                    <th className="text-left p-3 text-muted-foreground font-medium">Valid Dates</th>
                    <th className="text-left p-3 text-muted-foreground font-medium">Status</th>
                    <th className="text-left p-3 text-muted-foreground font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {certs.map((c: any) => (
                    <tr key={c.id} className="border-b border-border last:border-0 hover:bg-secondary/30">
                      <td className="p-3 font-mono text-xs">{c.certificate_id}</td>
                      <td className="p-3">{c.company_name}</td>
                      <td className="p-3 text-xs">{c.land_identifier}</td>
                      <td className="p-3">{c.credits_issued.toLocaleString()}</td>
                      <td className="p-3 text-xs">{new Date(c.valid_from).toLocaleDateString()} → <br/>{new Date(c.valid_to).toLocaleDateString()}</td>
                      <td className="p-3"><StatusBadge status={c.status} /></td>
                      <td className="p-3">
                        {!['expired', 'revoked'].includes(c.status) && (
                          <Button variant="ghost" size="sm" className="text-destructive h-auto py-1" onClick={() => setRevokeCert(c)}>
                            <Ban className="h-3.5 w-3.5 mr-1" /> Revoke
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {certs.length === 0 && (<tr><td colSpan={7} className="p-8 text-center text-muted-foreground">No certificates found.</td></tr>)}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
          <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
        </div>
      )}

      <Dialog open={!!revokeCert} onOpenChange={() => { setRevokeCert(null); setRevokeReason(''); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive">Revoke Certificate</DialogTitle>
            <DialogDescription>
              Are you sure you want to revoke certificate <span className="font-mono">{revokeCert?.certificate_id}</span>? 
              This will update the blockchain and cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Reason for Revocation *</label>
              <Textarea placeholder="Explain why this certificate is being revoked..." value={revokeReason} onChange={e => setRevokeReason(e.target.value)} required />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setRevokeCert(null); setRevokeReason(''); }} disabled={revokeMutation.isPending}>Cancel</Button>
            <Button variant="destructive" onClick={() => revokeMutation.mutate()} disabled={revokeMutation.isPending || !revokeReason.trim()}>
              {revokeMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null} Revoke Completely
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
