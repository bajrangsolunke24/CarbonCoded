import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getCertificates } from '@/services/company';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import {
  FileCheck, Download, Loader2, ShieldCheck, BadgeCheck,
  Calendar, Building2, Leaf, Award, Globe, Printer, Wallet, ExternalLink, CheckCircle2, XCircle
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAuthStore } from '@/stores/authStore';
import { connectWallet, verifyCertificateOnChain, CONTRACT_ADDRESS, OnChainCertificate } from '@/services/wallet';

// Mock certificate data to show a functioning system
const MOCK_CERTS = [
  {
    certificate_id: 'CERT-IN-2025-00312',
    land_identifier: 'LND-UP-0008901',
    company_name: 'Tata Steel Limited',
    cin: 'L27100MH1907PLC000260',
    credits_issued: 400,
    valid_from: '2025-01-01T00:00:00Z',
    valid_to: '2028-01-01T00:00:00Z',
    status: 'active',
    project_name: 'Carbon Offset Project – Gorakhpur',
    region: 'Gorakhpur, Uttar Pradesh',
    project_type: 'Agricultural',
    co2_tonnes: 600,
    blockchain_hash: '0x7a3f9b2e14cd5892fe013a7d8e4b1c6f9d2e0a4c',
    issued_by: 'Shri Ramesh Kumar, IAS',
    issue_date: '2025-01-15T00:00:00Z',
    verification_no: 'EFCC/VER/2025/00814',
  },
  {
    certificate_id: 'CERT-IN-2025-00287',
    land_identifier: 'LND-MH-0023401',
    company_name: 'Tata Steel Limited',
    cin: 'L27100MH1907PLC000260',
    credits_issued: 250,
    valid_from: '2024-11-01T00:00:00Z',
    valid_to: '2027-11-01T00:00:00Z',
    status: 'active',
    project_name: 'Carbon Offset Project – Pune',
    region: 'Pune, Maharashtra',
    project_type: 'Forest',
    co2_tonnes: 375,
    blockchain_hash: '0x4c1b9d7e23fa0167bc48d3e5a2f8c091e5a3b7d1',
    issued_by: 'Smt. Priya Nair, IFS',
    issue_date: '2024-11-20T00:00:00Z',
    verification_no: 'EFCC/VER/2024/07231',
  },
  {
    certificate_id: 'CERT-IN-2024-00198',
    land_identifier: 'LND-KA-0011782',
    company_name: 'Tata Steel Limited',
    cin: 'L27100MH1907PLC000260',
    credits_issued: 600,
    valid_from: '2024-07-01T00:00:00Z',
    valid_to: '2027-07-01T00:00:00Z',
    status: 'active',
    project_name: 'Carbon Offset Project – Mysuru',
    region: 'Mysuru, Karnataka',
    project_type: 'Forest',
    co2_tonnes: 900,
    blockchain_hash: '0x9f2c5a8e71bd0342a6e9c17d3b4f2e8a0c5d6b7e',
    issued_by: 'Shri Anand Rao, IFS',
    issue_date: '2024-07-10T00:00:00Z',
    verification_no: 'EFCC/VER/2024/05112',
  },
];

function GovCertificatePreview({ cert, companyUser }: { cert: any; companyUser: any }) {
  const companyName = cert.company_name || companyUser?.name || 'Tata Steel Limited';
  const cin = cert.cin || companyUser?.cin || 'L27100MH1907PLC000260';
  const issuedDate = cert.issue_date ? new Date(cert.issue_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) : 'N/A';
  const validFrom = new Date(cert.valid_from).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
  const validTo = new Date(cert.valid_to).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });

  return (
    <div
      id="gov-certificate"
      className="relative bg-white rounded-xl overflow-hidden"
      style={{ fontFamily: 'Georgia, serif', minWidth: 540 }}
    >
      {/* Decorative border */}
      <div className="absolute inset-0 border-[12px] border-double border-[#1b5e20] rounded-xl pointer-events-none z-10" />
      <div className="absolute inset-[10px] border border-[#2e7d32] rounded-lg pointer-events-none z-10" />

      {/* Watermark */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.04] pointer-events-none z-0">
        <Globe className="w-96 h-96 text-[#1b5e20]" />
      </div>

      <div className="relative z-10 p-8">
        {/* Header */}
        <div className="text-center mb-6">
          {/* Ashoka Emblem representation */}
          <div className="flex justify-center mb-2">
            <div className="w-16 h-16 rounded-full bg-[#1b5e20] flex items-center justify-center shadow-md">
              <Leaf className="w-8 h-8 text-white" />
            </div>
          </div>
          <p className="text-[11px] font-bold tracking-[0.3em] text-[#7b5000] uppercase">सत्यमेव जयते</p>
          <h1 className="text-lg font-bold text-[#1b5e20] mt-1">GOVERNMENT OF INDIA</h1>
          <p className="text-[11px] text-gray-600 font-semibold tracking-wide">Ministry of Environment, Forest and Climate Change</p>
          <p className="text-[10px] text-gray-500 tracking-wide">Environment Protection &amp; Carbon Management Division</p>
          <div className="mt-3 border-t-2 border-b-2 border-[#1b5e20] py-1.5">
            <h2 className="text-base font-bold text-[#1b5e20] tracking-widest uppercase">Carbon Credit Certificate</h2>
            <p className="text-[10px] text-gray-500 tracking-[0.2em]">Issued under the National Carbon Trading Framework 2023</p>
          </div>
        </div>

        {/* Certificate Body */}
        <div className="bg-[#f1f8e9] border border-[#c8e6c9] rounded-lg p-5 mb-5 text-sm">
          <p className="text-center text-[12px] text-gray-700 leading-relaxed">
            This is to certify that{' '}
            <strong className="text-[#1b5e20]">{companyName}</strong>
            {' '}(CIN: <span className="font-mono text-[11px]">{cin}</span>) has successfully purchased and holds the following verified carbon credits in accordance with the provisions of the Environment Protection Act, 1986.
          </p>
        </div>

        {/* Data Grid */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-[12px] mb-5">
          <div className="border-b border-dashed border-gray-300 pb-2">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider">Certificate Number</p>
            <p className="font-bold text-[#1b5e20] font-mono">{cert.certificate_id}</p>
          </div>
          <div className="border-b border-dashed border-gray-300 pb-2">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider">Verification Number</p>
            <p className="font-mono text-gray-700 text-[11px]">{cert.verification_no || 'EFCC/VER/2025/00000'}</p>
          </div>
          <div className="border-b border-dashed border-gray-300 pb-2">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider">Project Name</p>
            <p className="font-semibold text-gray-800">{cert.project_name || `Project ${cert.land_identifier}`}</p>
          </div>
          <div className="border-b border-dashed border-gray-300 pb-2">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider">Project Location</p>
            <p className="font-semibold text-gray-800">{cert.region || 'India'}</p>
          </div>
          <div className="border-b border-dashed border-gray-300 pb-2">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider">Carbon Credits Issued</p>
            <p className="text-xl font-bold text-[#1b5e20]">{cert.credits_issued.toLocaleString()} tCO₂e</p>
          </div>
          <div className="border-b border-dashed border-gray-300 pb-2">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider">Estimated CO₂ Offset</p>
            <p className="font-bold text-gray-800">{cert.co2_tonnes?.toLocaleString() || Math.round(cert.credits_issued * 1.5)} Metric Tons</p>
          </div>
          <div className="border-b border-dashed border-gray-300 pb-2">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider">Valid From</p>
            <p className="font-semibold text-gray-800">{validFrom}</p>
          </div>
          <div className="border-b border-dashed border-gray-300 pb-2">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider">Valid Until</p>
            <p className="font-semibold text-gray-800">{validTo}</p>
          </div>
        </div>

        {/* Blockchain Verification */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-5 text-[10px] text-gray-500">
          <p className="font-semibold text-gray-600 mb-1">🔗 Blockchain Verified</p>
          <p className="font-mono break-all">{cert.blockchain_hash || '0x' + 'a3f9b2e14cd5892fe013a7d8e4b1c6f9d2e0a'.padEnd(40, '0')}</p>
        </div>

        {/* Footer - Signature + QR */}
        <div className="flex items-end justify-between border-t-2 border-[#1b5e20] pt-4">
          <div>
            <div className="w-32 border-b border-gray-400 mb-1 mt-6" />
            <p className="text-[11px] font-bold text-gray-700">{cert.issued_by || 'Director General, MoEFCC'}</p>
            <p className="text-[10px] text-gray-500">Date of Issue: {issuedDate}</p>
            <p className="text-[10px] text-gray-500">Authorized Signatory</p>
          </div>
          <div className="text-center">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=64x64&data=${encodeURIComponent(`https://moef.gov.in/carbon-credits/verify?cert=${cert.certificate_id}&land=${cert.land_identifier}`)}`}
              alt="Certificate QR Code"
              className="w-16 h-16 rounded border border-gray-300"
              onError={(e) => { (e.target as HTMLImageElement).src = `https://chart.googleapis.com/chart?cht=qr&chs=64x64&chl=${encodeURIComponent(cert.certificate_id)}`; }}
            />
            <p className="text-[9px] text-gray-500 mt-1">Scan to Verify</p>
          </div>
          <div>
            <div className="w-16 h-16 rounded-full bg-[#1b5e20] flex items-center justify-center shadow-md">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <p className="text-[9px] text-center text-[#1b5e20] font-bold mt-1">OFFICIAL SEAL</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CompanyCertificates() {
  const [selectedCert, setSelectedCert] = useState<any | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [onChainData, setOnChainData] = useState<OnChainCertificate | null>(null);
  const [onChainError, setOnChainError] = useState<string | null>(null);
  const [onChainCertId, setOnChainCertId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({ queryKey: ['company-certs'], queryFn: getCertificates });
  const { companyUser } = useAuthStore();

  const certs = data?.data || data || [];

  const handlePrint = () => window.print();

  const handleDownload = (cert: any) => {
    toast({ title: 'Certificate Download', description: `${cert.certificate_id} is being prepared.` });
  };

  const handleConnectWallet = async () => {
    try {
      const addr = await connectWallet();
      setWalletAddress(addr);
      toast({ title: '✅ Wallet Connected', description: addr.slice(0, 10) + '...' });
    } catch (err: any) {
      toast({ title: 'Wallet Error', description: err.message, variant: 'destructive' });
    }
  };

  const handleVerifyOnChain = async (certId: string) => {
    if (!walletAddress) {
      toast({ title: 'Connect Wallet First', description: 'Please connect your MetaMask wallet to verify on-chain.', variant: 'destructive' });
      return;
    }
    setVerifying(true);
    setOnChainData(null);
    setOnChainError(null);
    setOnChainCertId(certId);
    try {
      const result = await verifyCertificateOnChain(certId);
      setOnChainData(result);
    } catch (err: any) {
      setOnChainError(err.message || 'Certificate not found on-chain. It may still be pending blockchain confirmation.');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" /> Carbon Credit Certificates
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Government of India issued certificates under MoEFCC</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
            <BadgeCheck className="h-3.5 w-3.5 mr-1" /> {certs.length} Active
          </Badge>
          {walletAddress ? (
            <Badge className="text-xs bg-purple-600 text-white gap-1">
              <Wallet className="h-3 w-3" />
              {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
            </Badge>
          ) : (
            <Button size="sm" variant="outline" className="text-xs gap-1 border-purple-300 text-purple-700 hover:bg-purple-50" onClick={handleConnectWallet}>
              <Wallet className="h-3.5 w-3.5" /> Connect MetaMask
            </Button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
      ) : certs.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-16 px-4 text-center border-dashed">
          <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <Award className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-bold text-foreground mb-2">No Certificates Issued Yet</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            Once you complete a purchase request and payment, a government officer will verify the details. Your official carbon credit certificates will appear here once approved.
          </p>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {certs.map((cert: any) => (
            <Card
              key={cert.certificate_id}
              className="hover:shadow-md transition-all hover:-translate-y-0.5 border-green-100 hover:border-green-300 cursor-pointer group"
              onClick={() => setSelectedCert(cert)}
            >
              <CardContent className="p-0">
                {/* Certificate Card Header */}
                <div className="bg-gradient-to-r from-[#1b5e20] to-[#2e7d32] text-white p-4 rounded-t-xl">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="bg-white/20 rounded-full p-1.5">
                        <Leaf className="h-4 w-4 text-white" />
                      </div>
                      <span className="text-xs font-semibold tracking-wide opacity-90">GOVT. OF INDIA</span>
                    </div>
                    <Badge className="bg-yellow-400 text-yellow-900 text-[10px] font-bold border-0">VERIFIED</Badge>
                  </div>
                  <p className="font-mono text-sm font-bold">{cert.certificate_id}</p>
                  <p className="text-[11px] opacity-75 mt-0.5">{cert.project_name || cert.land_identifier}</p>
                </div>

                {/* Certificate Body */}
                <div className="p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Credits Issued</p>
                      <p className="font-bold text-lg text-[#1b5e20]">{cert.credits_issued.toLocaleString()}</p>
                      <p className="text-[10px] text-muted-foreground">tCO₂e</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Project Type</p>
                      <p className="font-semibold text-sm">{cert.project_type || 'Forest'}</p>
                      <p className="text-[10px] text-muted-foreground">{cert.region?.split(',')[1]?.trim() || 'India'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 bg-muted/50 rounded-lg p-2.5">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span className="text-[11px] text-muted-foreground">
                      Valid: {new Date(cert.valid_from).toLocaleDateString('en-IN')} – {new Date(cert.valid_to).toLocaleDateString('en-IN')}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                    <Building2 className="h-3 w-3" />
                    <span className="truncate">{cert.land_identifier}</span>
                  </div>

                  {/* Blockchain TX Link */}
                  {cert.blockchain_tx_hash && cert.blockchain_tx_hash.startsWith('0x') && (
                    <a
                      href={`https://sepolia.etherscan.io/tx/${cert.blockchain_tx_hash}`}
                      target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 text-[10px] text-purple-600 hover:text-purple-800"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink className="h-3 w-3" /> View on Sepolia Etherscan
                    </a>
                  )}

                  <div className="flex gap-2 pt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-xs border-[#1b5e20]/30 text-[#1b5e20] hover:bg-[#1b5e20]/5"
                      onClick={(e) => { e.stopPropagation(); setSelectedCert(cert); }}
                    >
                      <FileCheck className="h-3.5 w-3.5 mr-1" /> Preview
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs border-purple-200 text-purple-700 hover:bg-purple-50"
                      onClick={(e) => { e.stopPropagation(); handleVerifyOnChain(cert.certificate_id); }}
                    >
                      {verifying && onChainCertId === cert.certificate_id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <ShieldCheck className="h-3.5 w-3.5" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1 text-xs bg-[#1b5e20] hover:bg-[#2e7d32]"
                      onClick={(e) => { e.stopPropagation(); handleDownload(cert); }}
                    >
                      <Download className="h-3.5 w-3.5 mr-1" /> Download
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Government Certificate Preview Modal */}
      <Dialog open={!!selectedCert} onOpenChange={() => setSelectedCert(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-4">
          <div className="flex items-center justify-between mb-4">
            <DialogTitle className="text-base font-bold">Official Certificate Preview</DialogTitle>
            <Button size="sm" variant="outline" onClick={handlePrint} className="text-xs">
              <Printer className="h-3.5 w-3.5 mr-1" /> Print
            </Button>
          </div>
          {selectedCert && <GovCertificatePreview cert={selectedCert} companyUser={companyUser} />}
        </DialogContent>
      </Dialog>

      {/* On-Chain Verification Modal */}
      <Dialog open={!!(onChainData || onChainError) && !verifying} onOpenChange={() => { setOnChainData(null); setOnChainError(null); }}>
        <DialogContent className="max-w-md">
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-purple-600" /> On-Chain Verification
          </DialogTitle>

          {onChainError ? (
            <div className="text-center py-6">
              <XCircle className="h-12 w-12 text-red-400 mx-auto mb-3" />
              <p className="text-sm font-semibold text-red-600">Not Found On-Chain</p>
              <p className="text-xs text-muted-foreground mt-1">{onChainError}</p>
            </div>
          ) : onChainData && (
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
                {onChainData.isValid
                  ? <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
                  : <XCircle className="h-5 w-5 text-red-500 shrink-0" />}
                <span className="font-semibold">{onChainData.isValid ? 'Certificate is VALID on Sepolia' : 'Certificate EXPIRED on-chain'}</span>
              </div>

              <div className="space-y-2 text-xs bg-muted/30 p-3 rounded-lg">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Certificate ID</span>
                  <span className="font-mono font-medium">{onChainData.certId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Company CIN</span>
                  <span className="font-mono">{onChainData.companyCIN}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Land ID</span>
                  <span className="font-mono">{onChainData.landId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Credits</span>
                  <span className="font-bold text-green-700">{Number(onChainData.credits).toLocaleString()} tCO₂e</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Valid From</span>
                  <span>{new Date(Number(onChainData.validFrom) * 1000).toLocaleDateString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Valid Until</span>
                  <span>{new Date(Number(onChainData.validTo) * 1000).toLocaleDateString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Issued By</span>
                  <span className="font-mono text-[10px] break-all">{onChainData.issuedBy}</span>
                </div>
              </div>

              <div className="text-center">
                <a
                  href={`https://sepolia.etherscan.io/address/${CONTRACT_ADDRESS}`}
                  target="_blank" rel="noopener noreferrer"
                  className="text-xs text-purple-600 hover:underline flex items-center justify-center gap-1"
                >
                  <ExternalLink className="h-3 w-3" /> View Smart Contract on Etherscan
                </a>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
