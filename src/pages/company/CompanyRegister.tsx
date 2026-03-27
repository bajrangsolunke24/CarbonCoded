import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Leaf, Shield, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useNotificationStore } from '@/stores/notificationStore';
import { useToast } from '@/hooks/use-toast';
import { registerCompany } from '@/services/auth';

export default function CompanyRegister() {
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    cin: '',
    name: '',
    contact_email: '',
    password: '',
    confirm_password: '',
    contact_phone: '',
    registered_address: '',
  });
  const navigate = useNavigate();
  const { setAuthFromResponse } = useAuthStore();
  const { startPolling } = useNotificationStore();
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm_password) {
      toast({ title: 'Password mismatch', description: 'Passwords do not match.', variant: 'destructive' });
      return;
    }
    if (form.cin.length < 21) {
      toast({ title: 'Invalid CIN', description: 'CIN must be 21 characters (e.g. L27100MH1907PLC000260)', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      const resp = await registerCompany({
        cin: form.cin.trim().toUpperCase(),
        name: form.name.trim(),
        contact_email: form.contact_email.trim().toLowerCase(),
        password: form.password,
        contact_phone: form.contact_phone || undefined,
        registered_address: form.registered_address || undefined,
      });
      setAuthFromResponse?.(resp);
      startPolling();
      setStep('success');
      toast({ title: '🎉 Registration Successful!', description: 'Welcome to the Carbon Credit Portal.' });
      setTimeout(() => navigate('/company/dashboard'), 2400);
    } catch (err: any) {
      const msg = err?.response?.data?.error || 'Registration failed. Check your CIN or try a different email.';
      toast({ title: 'Registration Failed', description: msg, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  if (step === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-hero p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center py-12 gap-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold">Registration Successful!</h2>
            <p className="text-muted-foreground text-center text-sm">
              Your company has been registered. Redirecting to your dashboard…
            </p>
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center gradient-hero p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center space-y-3">
          <div className="mx-auto w-14 h-14 rounded-xl gradient-hero flex items-center justify-center">
            <Leaf className="h-7 w-7 text-primary-foreground" />
          </div>
          <CardTitle className="text-xl">Register Your Company</CardTitle>
          <CardDescription>Join the National Carbon Credit Exchange Platform</CardDescription>
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground bg-secondary rounded-full px-3 py-1.5">
            <Shield className="h-3.5 w-3.5 text-primary" />
            Regulated by MoEFCC, Government of India
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                <Label htmlFor="cin">Company CIN Number *</Label>
                <Input id="cin" name="cin" value={form.cin} onChange={handleChange}
                  placeholder="L27100MH1907PLC000260" required disabled={loading}
                  className="font-mono uppercase" maxLength={21} />
                <p className="text-xs text-muted-foreground">21-character Corporate Identification Number</p>
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="name">Company Name *</Label>
                <Input id="name" name="name" value={form.name} onChange={handleChange}
                  placeholder="e.g. Mahindra & Mahindra Ltd" required disabled={loading} />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="contact_email">Official Contact Email *</Label>
                <Input id="contact_email" name="contact_email" type="email" value={form.contact_email} onChange={handleChange}
                  placeholder="csr@yourcompany.com" required disabled={loading} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <Input id="password" name="password" type="password" value={form.password} onChange={handleChange}
                  placeholder="Min. 8 characters" required disabled={loading} minLength={8} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm_password">Confirm Password *</Label>
                <Input id="confirm_password" name="confirm_password" type="password" value={form.confirm_password} onChange={handleChange}
                  placeholder="Repeat password" required disabled={loading} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact_phone">Contact Phone</Label>
                <Input id="contact_phone" name="contact_phone" type="tel" value={form.contact_phone} onChange={handleChange}
                  placeholder="+91 98765 43210" disabled={loading} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="registered_address">Registered Address</Label>
                <Input id="registered_address" name="registered_address" value={form.registered_address} onChange={handleChange}
                  placeholder="City, State" disabled={loading} />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Registering...</> : '🌿 Register & Access Platform'}
            </Button>

            <div className="flex items-center justify-between text-sm pt-1">
              <span className="text-muted-foreground">Already registered?</span>
              <button type="button" className="text-primary hover:underline font-medium" onClick={() => navigate('/company/login')}>
                Sign In
              </button>
            </div>
          </form>

          <div className="mt-4 p-3 bg-secondary rounded-lg text-xs text-muted-foreground">
            <p className="font-medium mb-1">ℹ️ Note:</p>
            <p>Government officer accounts cannot be created here. This portal is for company CSR registration only.</p>
          </div>

          <Button variant="ghost" size="sm" className="mt-4 w-full text-muted-foreground" onClick={() => navigate('/')}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
