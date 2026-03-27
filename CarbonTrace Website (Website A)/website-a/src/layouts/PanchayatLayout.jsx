import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  LayoutDashboard, MapPin, Plus, Wallet, LogOut, Leaf, Bell,
} from 'lucide-react';

const navItems = [
  { to: '/panchayat/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/panchayat/requests', label: 'My Land Requests', icon: MapPin },
  { to: '/panchayat/submit', label: 'Submit Request', icon: Plus },
  { to: '/panchayat/payouts', label: 'My Payouts', icon: Wallet },
];

export default function PanchayatLayout() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    try {
      const stored = localStorage.getItem('user');
      if (stored) setUser(JSON.parse(stored));
    } catch {
      /* ignore */
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const initials = user?.name
    ? user.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
    : '??';

  return (
    <div className="flex h-screen overflow-hidden bg-[#f8faf7] text-[#163b2b]">
      <aside className="w-72 flex-shrink-0 border-r border-[#d9e3dc] bg-white">
        <div className="flex h-[92px] items-center gap-3 border-b border-[#d9e3dc] px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#165f38]/15 bg-[#165f38]/5">
            <Leaf size={20} className="text-[#165f38]" />
          </div>
          <div>
            <p className="text-[15px] font-semibold text-[#163b2b]">CarbonTrace Portal</p>
            <p className="text-xs text-[#6a7b75]">Panchayat Workspace</p>
          </div>
        </div>

        <nav className="space-y-2 px-4 py-5">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-[#165f38] text-white shadow-[0_10px_25px_rgba(22,95,56,0.14)]'
                    : 'text-[#62758f] hover:bg-[#165f38]/5 hover:text-[#163b2b]'
                }`
              }
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto border-t border-[#d9e3dc] p-4">
          <div className="flex items-center gap-3 rounded-2xl border border-[#d9e3dc] bg-[#f8faf7] p-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#165f38] text-xs font-bold text-white">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-[#163b2b]">{user?.name || 'Panchayat User'}</p>
              <p className="text-xs text-[#6a7b75]">{user?.district || user?.village || 'Panchayat'}</p>
            </div>
            <button onClick={handleLogout} className="text-[#62758f] hover:text-[#c45437]">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      <div className="flex flex-1 flex-col min-w-0">
        <header className="flex h-[74px] items-center justify-between border-b border-[#d9e3dc] bg-white px-6">
          <h2 className="text-sm font-medium text-[#6a7b75]">Panchayat Dashboard</h2>
          <div className="flex items-center gap-4">
            <button className="relative text-[#163b2b]">
              <Bell size={18} />
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#e94b4b] text-[10px] font-bold text-white">
                1
              </span>
            </button>
            <button
              onClick={handleLogout}
              className="rounded-full border border-[#d9e3dc] px-4 py-2 text-sm font-medium text-[#163b2b] transition-colors hover:bg-[#165f38]/5"
            >
              Logout
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-[#f8faf7] p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
