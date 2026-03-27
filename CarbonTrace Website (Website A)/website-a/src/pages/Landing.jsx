import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Coins, Leaf, MapPinned, Satellite, ShieldCheck } from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();
  const [creditCount, setCreditCount] = useState(45230);
  const [lands, setLands] = useState(10);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/gov/credits/count`)
      .then((r) => r.json())
      .then((d) => {
        if (d.total_issued) setCreditCount(d.total_issued);
      })
      .catch(() => {});

    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/gov/lands`)
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d)) setLands(d.length);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-[#f3f6f1] text-[#173629]">
      <div className="h-1 w-full bg-[linear-gradient(90deg,#ff9933_0%,#ff9933_33%,#ffffff_33%,#ffffff_66%,#138808_66%,#138808_100%)]" />

      <header className="border-b border-[#d5dfd7] bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-[16px] bg-[#145a36] text-white shadow-[0_10px_24px_rgba(20,90,54,0.15)]">
              <Leaf size={24} />
            </div>
            <div>
              <p className="text-lg font-semibold tracking-[-0.02em] text-[#173629]">CarbonTrace</p>
              <p className="text-xs uppercase tracking-[0.18em] text-[#6c7e75]">
                Government Carbon Operations Portal
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="rounded-full border border-[#d5dfd7] px-5 py-3 text-sm font-medium text-[#173629] hover:bg-[#145a36]/5">
              Notifications
            </button>
            <button
              onClick={() => navigate('/login')}
              className="rounded-full bg-[#145a36] px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(20,90,54,0.14)]"
            >
              Official Login
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <section className="grid gap-6 xl:grid-cols-[320px_1fr]">
          <aside className="rounded-[30px] border border-[#d5dfd7] bg-white p-6 shadow-[0_10px_24px_rgba(20,90,54,0.04)]">
            <div className="rounded-[24px] bg-[#145a36] p-5 text-white">
              <p className="text-xs uppercase tracking-[0.18em] text-white/65">Program Status</p>
              <p className="mt-3 text-3xl font-semibold tracking-[-0.04em]">Operational</p>
              <p className="mt-2 text-sm text-white/78">Official registry workflow active.</p>
            </div>

            <div className="mt-5 space-y-3">
              {[
                { label: 'Registered Parcels', value: lands, icon: MapPinned, tone: 'text-[#145a36]' },
                { label: 'Credits Issued', value: creditCount.toLocaleString('en-IN'), icon: Coins, tone: 'text-[#b88916]' },
                { label: 'National Registry', value: 'Active', icon: ShieldCheck, tone: 'text-[#145a36]' },
              ].map((item) => (
                <div key={item.label} className="rounded-[22px] bg-[#f4f7f2] p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-white shadow-[0_4px_10px_rgba(20,90,54,0.04)]">
                      <item.icon size={18} className={item.tone} />
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[#7a8e83]">Live</span>
                  </div>
                  <p className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-[#173629]">{item.value}</p>
                  <p className="mt-1 text-sm text-[#6c7e75]">{item.label}</p>
                </div>
              ))}
            </div>
          </aside>

          <div className="space-y-6">
            <section className="overflow-hidden rounded-[34px] border border-[#d5dfd7] bg-white shadow-[0_14px_30px_rgba(20,90,54,0.05)]">
              <div className="grid lg:grid-cols-[1.15fr_0.85fr]">
                <div className="bg-[linear-gradient(135deg,#145a36_0%,#1b6a43_100%)] px-8 py-10 text-white">
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2">
                    <ShieldCheck size={15} />
                    <span className="text-sm font-medium">Government-supervised Carbon Program Interface</span>
                  </div>

                  <h1 className="mt-8 max-w-3xl text-5xl font-semibold leading-[1.02] tracking-[-0.05em] md:text-6xl">
                    Monitor. Verify. Issue.
                  </h1>

                  <p className="mt-6 max-w-2xl text-lg leading-8 text-white/80">Official portal for carbon project administration.</p>

                  <div className="mt-8 flex flex-wrap gap-4">
                    <button
                      onClick={() => navigate('/login')}
                      className="flex items-center gap-2 rounded-full bg-[#d2ab3f] px-7 py-4 text-sm font-semibold text-[#173629] shadow-[0_12px_28px_rgba(210,171,63,0.24)]"
                    >
                      Open Official Workspace
                      <ArrowRight size={16} />
                    </button>
                    <div className="rounded-full border border-white/14 bg-white/8 px-5 py-4 text-sm font-medium text-white/85">Official access only</div>
                  </div>
                </div>

                <div className="grid gap-5 bg-[#eef4ee] p-8 sm:grid-cols-2 lg:grid-cols-1">
                  <div className="rounded-[24px] bg-[#fff4e8] p-5 shadow-[0_8px_22px_rgba(255,153,51,0.08)]">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b96d17]">Review</p>
                    <p className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-[#5e3d10]">
                      Land requests and document verification
                    </p>
                  </div>
                  <div className="rounded-[24px] bg-[#eaf2ff] p-5 shadow-[0_8px_22px_rgba(47,109,203,0.08)]">
                    <div className="flex h-11 w-11 items-center justify-center rounded-[16px] bg-white text-[#2f6dcb] shadow-[0_4px_10px_rgba(47,109,203,0.08)]">
                      <Satellite size={20} />
                    </div>
                    <p className="mt-4 text-2xl font-semibold tracking-[-0.03em] text-[#183829]">
                      Monitoring with satellite-backed oversight
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </section>
      </main>
    </div>
  );
}
