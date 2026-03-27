import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Leaf, Shield, ArrowLeft, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useNotificationStore } from '@/stores/notificationStore';
import { useToast } from '@/hooks/use-toast';

export default function CompanyLogin() {
  const [cin, setCin] = useState('L27100MH1907PLC000260');
  const [password, setPassword] = useState('TataSteel@123');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const { startPolling } = useNotificationStore();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login('company', cin, password);
      startPolling();
      toast({ title: 'Login successful', description: 'Welcome to the Carbon Credit Portal.' });
      navigate('/company/dashboard');
    } catch (err: any) {
      const msg = err?.response?.data?.error || 'Login failed. Please check your credentials.';
      toast({ title: 'Login failed', description: msg, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center gradient-hero p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-3">
          <div className="mx-auto w-14 h-14 rounded-xl gradient-hero flex items-center justify-center">
            <Leaf className="h-7 w-7 text-primary-foreground" />
          </div>
          <CardTitle className="text-xl">Company Portal Login</CardTitle>
          <CardDescription>Access the Carbon Credit Exchange Platform</CardDescription>
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground bg-secondary rounded-full px-3 py-1.5">
            <Shield className="h-3.5 w-3.5 text-primary" />
            Secure Government Portal
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cin">Company CIN Number</Label>
              <Input id="cin" value={cin} onChange={e => setCin(e.target.value)} placeholder="Enter CIN (e.g. L27100MH1907PLC000260)" required disabled={loading} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required disabled={loading} />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing in...</> : 'Sign In'}
            </Button>
            <div className="flex items-center justify-between text-sm">
              <button type="button" className="text-primary hover:underline" onClick={() => navigate('/company/register')}>New Company? Register</button>
            </div>
          </form>
          <div className="mt-4 p-3 bg-secondary rounded-lg text-xs text-muted-foreground">
            <p className="font-medium mb-1">Demo Credentials:</p>
            <p>CIN: L27100MH1907PLC000260 | Password: TataSteel@123</p>
          </div>
          <Button variant="ghost" size="sm" className="mt-4 w-full text-muted-foreground" onClick={() => navigate('/')}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
