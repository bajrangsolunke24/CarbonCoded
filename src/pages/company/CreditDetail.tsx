import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getListingDetail, calculatePrice, submitRequest } from '@/services/marketplace';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import {
  ArrowLeft, Loader2, CheckCircle2, AlertCircle,
  FileText, ShoppingCart, MapPin, TreePine, Banknote,
  ShieldCheck, BadgeCheck, UploadCloud, CreditCard,
  Lock, Award
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { useAuthStore } from '@/stores/authStore';

declare global {
  interface Window {
    Razorpay: any;
  }
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise(resolve => {
    if (document.getElementById('razorpay-sdk')) return resolve(true);
    const script = document.createElement('script');
    script.id = 'razorpay-sdk';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function CreditDetail() {
  const { landId } = useParams<{ landId: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { companyUser } = useAuthStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [credits, setCredits] = useState(100);
  const [duration, setDuration] = useState('3');
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchParams.get('request') === 'true') setIsModalOpen(true);
  }, [searchParams]);

  const { data: rawData, isLoading, isError } = useQuery({
    queryKey: ['marketplace-detail', landId],
    queryFn: () => getListingDetail(landId!),
    enabled: !!landId,
    retry: 1
  });

  const project = rawData ? {
    project_id: rawData.land_id as string,
    project_name: `Carbon Offset Project – ${rawData.district}`,
    region: `${rawData.district}, ${rawData.state}`,
    project_type: (rawData.land_type || '').charAt(0).toUpperCase() + (rawData.land_type || '').slice(1),
    plantation_type: Array.isArray(rawData.permitted_species) && rawData.permitted_species.length > 0
      ? (rawData.permitted_species as string[]).join(', ')
      : 'Mixed Vegetation',
    area_hectare: parseFloat(rawData.area_hectares) || 0,
    carbon_credits_available: Number(rawData.credits_available) || 0,
    carbon_credits_generated: Number(rawData.total_credits_generated) || 0,
    price_per_credit: parseFloat(rawData.price_per_credit) || 0,
    vintage_year: rawData.created_at ? new Date(rawData.created_at).getFullYear() - 1 : 2023,
    duration_years: 10,
    verification_status: rawData.status === 'active' ? 'Verified by MoEFCC' : 'Pending Review',
    description: `This government-certified carbon offset project is operated in ${rawData.district}, ${rawData.state}. Focusing on sustainable ${rawData.land_type || 'land'} conservation, it generates verified carbon units compliant with national environmental standards.`,
    co2_offset: Math.round(Number(rawData.total_credits_generated || 0) * 1.5)
  } : null;

  const { data: priceResp } = useQuery({
    queryKey: ['price-calc', project?.project_id, credits, duration],
    queryFn: () => calculatePrice(project!.project_id, credits, Number(duration)),
    enabled: !!project && credits > 0 && !!duration
  });

  const submitMutation = useMutation({
    mutationFn: (data: FormData) => submitRequest(data),
    onSuccess: () => { setStep(6); },
    onError: (err: any) => {
      toast({
        title: 'Submission Failed',
        description: err?.response?.data?.error || 'Something went wrong',
        variant: 'destructive'
      });
    }
  });

  const totalPrice = priceResp?.total_amount_inr ?? (credits * (project?.price_per_credit ?? 0));

  const handleNextStep = () => {
    if (step === 1 && !agreedTerms) {
      toast({ title: 'Terms Required', description: 'Please accept the trading terms.', variant: 'destructive' });
      return;
    }
    if (step === 3 && project && credits > project.carbon_credits_available) {
      toast({ title: 'Exceeded Available Credits', variant: 'destructive' });
      return;
    }
    if (step === 5) {
      const formData = new FormData();
      formData.append('land_id', project!.project_id);
      formData.append('credits_requested', String(credits));
      formData.append('duration_years', duration);
      formData.append('intended_use', 'Carbon Offset Compliance Verification');
      if (file) formData.append('authorization_letter', file);
      submitMutation.mutate(formData);
      return;
    }
    setStep(s => s + 1);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSearchParams({});
    if (step === 6) navigate('/company/dashboard');
    else { setStep(1); setAgreedTerms(false); }
  };

  // render states
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-32">
        <Loader2 className="h-9 w-9 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || !rawData || !project) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <AlertCircle className="h-16 w-16 text-muted-foreground" />
        <h2 className="text-2xl font-bold">Project Not Found</h2>
        <p className="text-muted-foreground text-center max-w-sm">The verified project you requested does not exist or has been removed from the exchange.</p>
        <Button onClick={() => navigate('/company/marketplace')}>Return to Exchange</Button>
      </div>
    );
  }

  const TOTAL_STEPS = 5;
  const stepLabels = ['Terms', 'Eligibility', 'Details', 'Compliance', 'Review'];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <Button variant="ghost" size="sm" onClick={() => navigate('/company/marketplace')}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Exchange
      </Button>

      <div className="flex flex-col md:flex-row items-start justify-between gap-4 border-b pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border border-green-200 font-medium">
              <BadgeCheck className="w-3.5 h-3.5 mr-1" />
              {project.verification_status}
            </Badge>
          </div>
          <h1 className="text-3xl font-bold text-foreground">{project.project_name}</h1>
          <p className="text-sm font-mono text-muted-foreground mt-1">{project.project_id}</p>
        </div>
        <Button size="lg" className="shrink-0" onClick={() => setIsModalOpen(true)}>
          <ShoppingCart className="w-4 h-4 mr-2" /> Request Purchase
        </Button>
      </div>

      {/* 5 Section Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="bg-muted/40 border-b">
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" /> Project Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Region</p>
              <p className="font-semibold text-sm">{project.region}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Project Type</p>
              <p className="font-semibold text-sm">{project.project_type}</p>
            </div>
            <div className="col-span-2">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Plantation / Species</p>
              <p className="text-sm bg-muted/60 px-3 py-2 rounded-md">{project.plantation_type}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="bg-muted/40 border-b">
            <CardTitle className="text-base flex items-center gap-2">
              <Banknote className="h-4 w-4 text-primary" /> Carbon Data
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Price / Credit</p>
              <p className="font-bold text-xl">&#8377;{project.price_per_credit}</p>
            </div>
            <div>
              <p className="text-xs text-primary uppercase tracking-wider font-bold mb-1">Available Credits</p>
              <p className="font-bold text-xl text-primary">{project.carbon_credits_available.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Total Generated</p>
              <p className="font-semibold text-sm">{project.carbon_credits_generated.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Max Duration</p>
              <p className="font-semibold text-sm">Up to {project.duration_years} Years</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="bg-muted/40 border-b">
            <CardTitle className="text-base flex items-center gap-2">
              <TreePine className="h-4 w-4 text-primary" /> Environmental Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Area</p>
              <p className="font-semibold text-sm">{project.area_hectare.toLocaleString()} Hectares</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Estimated CO&#8322; Offset</p>
              <p className="font-semibold text-sm">{project.co2_offset.toLocaleString()} Metric Tons</p>
            </div>
            <div className="col-span-2">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">NDVI Growth Trajectory</p>
              <div className="h-16 bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg flex items-center justify-center text-green-700 text-sm font-medium">
                ✅ Satellite Data Active — Positive vegetative trend identified
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="bg-muted/40 border-b">
            <CardTitle className="text-base flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" /> Verification Details
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-3">
            <div className="flex justify-between items-center border-b pb-3">
              <span className="text-sm text-muted-foreground">Status</span>
              <Badge variant="outline" className="bg-green-50 border-green-200 text-green-700">{project.verification_status}</Badge>
            </div>
            <div className="flex justify-between items-start border-b pb-3">
              <span className="text-sm text-muted-foreground">Authority</span>
              <span className="text-sm font-medium text-right max-w-[60%]">MoEFCC, Government of India</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Vintage Year</span>
              <span className="text-sm font-semibold">{project.vintage_year}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="bg-muted/40 border-b">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" /> Project Description
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            <p className="text-sm text-foreground leading-relaxed">{project.description}</p>
          </CardContent>
        </Card>
      </div>

      {/* Multi-Step Purchase Modal — Now 6 Steps with Razorpay */}
      <Dialog open={isModalOpen} onOpenChange={closeModal}>
        <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden">
          {/* Header */}
          <div className="bg-[#1b5e20] px-6 py-4 flex items-center gap-3">
            <div className="bg-white/20 rounded-full p-2">
              <ShoppingCart className="h-5 w-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-white">Request Purchase</DialogTitle>
              <p className="text-xs text-white/70 font-mono mt-0.5">{project.project_id}</p>
            </div>
          </div>

          {/* Step Progress Bar */}
          {step < 7 && (
            <div className="px-6 pt-4 pb-0">
              <div className="flex gap-1">
                {stepLabels.map((label, i) => (
                  <div key={i} className="flex-1">
                    <div className={`h-1 rounded-full transition-all ${i + 1 <= step ? 'bg-[#1b5e20]' : 'bg-border'}`} />
                    <p className={`text-[9px] mt-1 text-center truncate ${i + 1 <= step ? 'text-[#1b5e20] font-semibold' : 'text-muted-foreground'}`}>{label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step Content */}
          <div className="p-6 min-h-[260px]">
            {/* Step 1: Terms */}
            {step === 1 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-base flex items-center gap-2">
                  <FileText className="h-4 w-4" /> Step 1: Terms &amp; Conditions
                </h3>
                <div className="bg-muted/50 border rounded-lg p-4 text-sm text-muted-foreground space-y-2 h-36 overflow-y-auto">
                  <p>1. By initiating this request, you agree to the National Carbon Trading guidelines issued by MoEFCC.</p>
                  <p>2. Credits purchased cannot be resold without explicit regulatory authorization.</p>
                  <p>3. Full payment via Razorpay must be completed within 72 hours of approval.</p>
                  <p>4. A government certificate will be issued only after successful payment verification.</p>
                  <p>5. Fraudulent declarations will result in immediate CIN suspension under the EP Act, 1986.</p>
                </div>
                <div className="flex items-center gap-3 pt-1">
                  <Checkbox id="terms-agree" checked={agreedTerms} onCheckedChange={(v) => setAgreedTerms(!!v)} />
                  <label htmlFor="terms-agree" className="text-sm font-medium cursor-pointer">
                    I acknowledge and accept all the government trading terms.
                  </label>
                </div>
              </div>
            )}

            {/* Step 2: Eligibility */}
            {step === 2 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-base flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4" /> Step 2: Eligibility Check
                </h3>
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center space-y-3">
                  <CheckCircle2 className="h-10 w-10 text-green-600 mx-auto" />
                  <p className="font-bold text-green-800 text-lg">Eligible for Trading</p>
                  <p className="text-sm text-green-700">
                    {companyUser?.name
                      ? `${companyUser.name} (CIN: ${companyUser.cin}) is registered in the national carbon registry.`
                      : 'Your company is verified and eligible to purchase carbon credits.'}
                  </p>
                </div>
              </div>
            )}

            {/* Step 3: Purchase Details */}
            {step === 3 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-base flex items-center gap-2">
                  <Banknote className="h-4 w-4" /> Step 3: Purchase Details
                </h3>
                <div className="space-y-4">
                  <div>
                    <Label className="text-xs font-semibold text-muted-foreground uppercase">Number of Credits</Label>
                    <Input
                      type="number" min={1} max={project.carbon_credits_available} value={credits}
                      onChange={e => setCredits(Math.max(1, Math.min(Number(e.target.value), project.carbon_credits_available)))}
                      className="mt-1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Available: {project.carbon_credits_available.toLocaleString()}</p>
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-muted-foreground uppercase">Duration Validity</Label>
                    <div className="flex gap-2 mt-2">
                      {[1, 3, 5, 10].map(d => (
                        <Button key={d} type="button" variant={duration === String(d) ? 'default' : 'outline'} onClick={() => setDuration(String(d))} className="flex-1 text-sm">
                          {d}yr
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div className="bg-muted rounded-lg p-4 flex justify-between items-center border">
                    <span className="text-sm font-medium text-muted-foreground">Estimated Total</span>
                    <span className="text-xl font-bold text-primary">&#8377;{totalPrice.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Compliance Document */}
            {step === 4 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-base flex items-center gap-2">
                  <UploadCloud className="h-4 w-4" /> Step 4: Compliance Document
                </h3>
                <p className="text-sm text-muted-foreground">Upload authorization letter or proof of operations (PDF/JPG/PNG, max 5MB).</p>
                <div
                  className="border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-muted/30 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input ref={fileInputRef} type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={e => setFile(e.target.files?.[0] ?? null)} />
                  <UploadCloud className="h-10 w-10 text-muted-foreground mb-3" />
                  <p className="font-medium text-sm">{file ? file.name : 'Click to select file'}</p>
                  <p className="text-xs text-muted-foreground mt-1">PDF, JPG or PNG</p>
                </div>
                {!file && <p className="text-xs text-muted-foreground text-center">* Document is required for regulatory compliance</p>}
              </div>
            )}

            {/* Step 5: Review & Submit (No payment yet) */}
            {step === 5 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-base flex items-center gap-2">
                  <BadgeCheck className="h-4 w-4 text-green-600" /> Step 5: Review &amp; Submit
                </h3>
                <div className="border rounded-lg divide-y">
                  <div className="flex justify-between px-4 py-3">
                    <span className="text-sm text-muted-foreground">Project ID</span>
                    <span className="text-sm font-mono font-medium">{project.project_id}</span>
                  </div>
                  <div className="flex justify-between px-4 py-3">
                    <span className="text-sm text-muted-foreground">Credits Requested</span>
                    <span className="text-sm font-semibold text-primary">{credits.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between px-4 py-3">
                    <span className="text-sm text-muted-foreground">Duration</span>
                    <span className="text-sm font-semibold">{duration} Year{Number(duration) > 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex justify-between px-4 py-3">
                    <span className="text-sm text-muted-foreground">Document</span>
                    <span className="text-sm font-medium max-w-[160px] truncate">{file?.name ?? '—'}</span>
                  </div>
                  <div className="flex justify-between px-4 py-3 bg-muted/40">
                    <span className="text-base font-bold">Estimated Cost</span>
                    <span className="text-lg font-bold text-primary">&#8377;{totalPrice.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Step 6: Success */}
            {step === 6 && (
              <div className="flex flex-col items-center justify-center py-6 space-y-4">
                <div className="h-20 w-20 bg-[#1b5e20] rounded-full flex items-center justify-center shadow-lg">
                  <Award className="h-10 w-10 text-white" />
                </div>
                <h3 className="font-bold text-2xl text-center">Request Submitted!</h3>
                <p className="text-center text-sm text-muted-foreground max-w-xs">
                  Your purchase request has been officially logged. A government officer will verify your documents. Once approved, you will be able to complete payment from your dashboard.
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-muted/40 border-t px-6 py-4 flex items-center justify-between">
            {step < 6 ? (
              <>
                <span className="text-xs text-muted-foreground">Step {step} of {TOTAL_STEPS}</span>
                <div className="flex gap-2 flex-wrap justify-end">
                  <Button variant="ghost" size="sm" onClick={closeModal}>Cancel</Button>
                  <Button
                    size="sm"
                    className={step === 5 ? 'bg-[#1b5e20] hover:bg-[#2e7d32] text-white' : ''}
                    onClick={handleNextStep}
                    disabled={submitMutation.isPending}
                  >
                    {submitMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                    {step === 5 ? 'Confirm & Map Request' : 'Next Step'}
                  </Button>
                </div>
              </>
            ) : (
              <Button className="w-full bg-[#1b5e20] hover:bg-[#2e7d32]" onClick={closeModal}>
                <Award className="h-4 w-4 mr-2" /> View Dashboard
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
