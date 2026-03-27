import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getLiveTotal, getPublicStats } from '@/services/ledger';
import { Button } from '@/components/ui/button';
import { Leaf, ArrowRight, Building2, Shield } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const faqs = [
  {
    q: "How does the Carbon Credit Exchange work?",
    a: "The Government of India allocates verified land parcels (forests, wetlands, etc.) across various states. These parcels generate carbon credits based on their carbon sequestration capabilities (NDVI scores and independent audits). Companies can browse these parcels and purchase credits directly to offset their emissions."
  },
  {
    q: "Who is eligible to purchase carbon credits?",
    a: "Any registered company operating in India with a valid Corporate Identification Number (CIN) can register on the platform. After a quick verification by the Ministry authorities, companies can start purchasing credits to meet their ESG goals."
  },
  {
    q: "Are these carbon credits internationally recognized?",
    a: "Yes. The credits are generated following strict UNFCCC guidelines and national afforestation metrics. Every issued certificate is securely logged on an immutable blockchain ledger to prevent double-counting, ensuring high transparency and integrity."
  },
  {
    q: "How is the pricing determined?",
    a: "The base price per credit is fixed by the central authority. The final cost depends on the number of credits and the validity duration chosen by the purchaser."
  },
  {
    q: "What happens after I submit a purchase request?",
    a: "Your request is sent to the regional government officer overseeing that specific land parcel. They will review your intended use case and authorization letter. Once approved, you will receive an invoice to complete the payment via RazorPay or UPI. Upon successful payment, an official PDF certificate is generated and logged on the blockchain."
  }
];

function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (target === 0) return;
    const duration = 2000;
    const steps = 60;
    const inc = target / steps;
    let c = 0;
    const t = setInterval(() => {
      c += inc;
      if (c >= target) { setCount(target); clearInterval(t); }
      else setCount(Math.floor(c));
    }, duration / steps);
    return () => clearInterval(t);
  }, [target]);
  return <span className="tabular-nums">{count.toLocaleString('en-IN')}{suffix}</span>;
}

export default function LandingPage() {
  const navigate = useNavigate();

  // Fetch real national stats
  const { data: totalsData } = useQuery({ 
    queryKey: ['public-totals'], 
    queryFn: getLiveTotal,
    refetchInterval: 60000 
  });
  
  const { data: statsData } = useQuery({
    queryKey: ['public-stats'], 
    queryFn: getPublicStats,
    refetchInterval: 120000 
  });

  const totalCredits = totalsData?.total_available || 0;
  const issuedCredits = totalsData?.total_issued || 0;
  const activeParcels = statsData?.topParcels?.length || 0; // rough estimation for landing page
  const registeredCompanies = 120; // This could be fetched via API as well, hardcoded for now

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Leaf className="h-7 w-7 text-primary" />
            <span className="font-bold text-lg text-foreground">Carbon Credit Exchange</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => navigate('/company/login')}>Company Login</Button>
            <Button size="sm" onClick={() => navigate('/gov/login')}>Gov Login</Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="gradient-hero text-primary-foreground py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-primary-foreground/10 border border-primary-foreground/20 rounded-full px-4 py-1.5 mb-6">
            <Shield className="h-4 w-4" />
            <span className="text-sm font-medium">Government of India Initiative</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight max-w-4xl mx-auto">
            India's Official Carbon Credit Exchange Platform
          </h1>
          <p className="text-lg md:text-xl opacity-90 mt-6 max-w-2xl mx-auto">
            A transparent marketplace connecting businesses with verified carbon credits from national land parcels.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
            <Button
              size="lg"
              className="bg-accent text-accent-foreground hover:bg-accent/90 font-semibold text-base px-8"
              onClick={() => navigate('/company/login')}
            >
              <Building2 className="mr-2 h-5 w-5" />
              Login as Company
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 font-semibold text-base px-8"
              onClick={() => navigate('/gov/login')}
            >
              <Shield className="mr-2 h-5 w-5" />
              Login as Government Officer
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { label: 'Total Credits Available', value: totalCredits },
            { label: 'Credits Issued', value: issuedCredits },
            { label: 'Registered Companies', value: registeredCompanies },
            { label: 'Active Land Parcels', value: activeParcels },
          ].map(stat => (
            <div key={stat.label}>
              <p className="text-3xl md:text-4xl font-extrabold text-primary">
                <AnimatedCounter target={stat.value} />
              </p>
              <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 md:py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Company Registers', desc: 'Register with your CIN number and get verified by the government authority.' },
              { step: '02', title: 'Browse Credits', desc: 'Explore carbon credits from verified land parcels across India with transparent pricing.' },
              { step: '03', title: 'Purchase & Get Certificate', desc: 'Submit purchase request, complete payment, and receive your official carbon credit certificate.' },
            ].map(item => (
              <div key={item.step} className="bg-card rounded-xl p-6 border border-border hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-xl gradient-hero flex items-center justify-center text-primary-foreground font-bold text-lg mb-4">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Marquee */}
      <section className="py-8 bg-secondary/50 border-y border-border overflow-hidden">
        <div className="flex animate-marquee whitespace-nowrap">
          {['Tata Steel', 'Reliance Industries', 'Infosys', 'Mahindra Group', 'Adani Green', 'Wipro', 'HCL Tech', 'L&T', 'Bharti Airtel', 'ITC Limited', 'Tata Steel', 'Reliance Industries', 'Infosys', 'Mahindra Group', 'Adani Green', 'Wipro', 'HCL Tech', 'L&T', 'Bharti Airtel', 'ITC Limited'].map((name, i) => (
            <span key={i} className="mx-8 text-muted-foreground font-medium text-lg">{name}</span>
          ))}
        </div>
      </section>

      {/* Public Counter CTA */}
      <section className="py-16 bg-background">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">Live National Carbon Credit Counter</h2>
          <p className="text-muted-foreground mb-6">View real-time data on carbon credits across all states</p>
          <Button size="lg" variant="outline" onClick={() => navigate('/credits')}>
            View Public Counter <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 md:py-24 bg-secondary/30">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">Frequently Asked Questions</h2>
          <Accordion type="single" collapsible className="space-y-2">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="bg-card rounded-xl border border-border px-4">
                <AccordionTrigger className="text-sm font-medium text-foreground hover:no-underline">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-background py-12">
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Leaf className="h-6 w-6" />
              <span className="font-bold text-lg">Carbon Credit Exchange</span>
            </div>
            <p className="text-sm opacity-70">An initiative by the Government of India under the Ministry of Environment, Forest and Climate Change.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Quick Links</h4>
            <ul className="space-y-2 text-sm opacity-70">
              <li className="cursor-pointer hover:opacity-100" onClick={() => navigate('/credits')}>Public Credit Counter</li>
              <li className="cursor-pointer hover:opacity-100" onClick={() => navigate('/company/login')}>Company Portal</li>
              <li className="cursor-pointer hover:opacity-100" onClick={() => navigate('/gov/login')}>Government Portal</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Contact</h4>
            <ul className="space-y-2 text-sm opacity-70">
              <li>📞 1800-123-4567 (Toll Free)</li>
              <li>📧 carbon.credits@gov.in</li>
              <li>🏛️ Ministry of Environment, New Delhi</li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 mt-8 pt-8 border-t border-background/20 text-sm text-center opacity-50">
          © 2024 Government of India. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
