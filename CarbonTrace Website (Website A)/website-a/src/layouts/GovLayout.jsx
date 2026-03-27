import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  MapPin,
  FileCheck2,
  Satellite,
  Coins,
  Wallet,
  Shield,
  LogOut,
  Bell,
  ChevronRight,
  Leaf,
} from 'lucide-react';
import WalletConnect from '../components/WalletConnect';

const navItems = [
  { path: '/gov/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/gov/land-requests', label: 'Land Requests', icon: MapPin },
  { path: '/gov/documents', label: 'Documents', icon: FileCheck2 },
  { path: '/gov/ndvi', label: 'NDVI Monitoring', icon: Satellite },
  { path: '/gov/credits', label: 'Credit Issuance', icon: Coins },
  { path: '/gov/payouts', label: 'Payouts', icon: Wallet },
  { path: '/gov/audit', label: 'Blockchain Audit', icon: Shield },
];

export default function GovLayout() {
  const navigate = useNavigate();
  const location = useLocation();
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
  const currentPageTitle = navItems.find((item) => item.path === location.pathname)?.label || 'Portal';

  return (
    <div className="flex h-screen overflow-hidden bg-[#f8faf7] text-[#163b2b]">
      <aside className="w-72 flex-shrink-0 border-r border-[#d9e3dc] bg-white">
        <div className="flex h-[92px] items-center gap-3 border-b border-[#d9e3dc] px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#165f38]/15 bg-[#165f38]/5">
            <Leaf size={20} className="text-[#165f38]" />
          </div>
          <div>
            <p className="text-[15px] font-semibold text-[#163b2b]">CarbonTrace Portal</p>
            <p className="text-xs text-[#6a7b75]">Government Workspace</p>
          </div>
        </div>

        <nav className="space-y-2 px-4 py-5">
          {navItems.map(({ path, label, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
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
              <p className="truncate text-sm font-semibold text-[#163b2b]">{user?.name || 'Government User'}</p>
              <p className="text-xs text-[#6a7b75]">{user?.role || 'GOVERNMENT'}</p>
            </div>
            <button onClick={handleLogout} className="text-[#62758f] hover:text-[#c45437]">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-[74px] items-center justify-between border-b border-[#d9e3dc] bg-white px-6">
          <div className="flex items-center gap-3 text-sm text-[#6a7b75]">
            <span>Portal</span>
            <ChevronRight size={14} />
            <span className="font-medium text-[#163b2b]">{currentPageTitle}</span>
          </div>

          <div className="flex items-center gap-4">
            <WalletConnect />
            <button className="relative text-[#163b2b]">
              <Bell size={18} />
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#e94b4b] text-[10px] font-bold text-white">
                1
              </span>
            </button>
            <span className="rounded-full border border-[#d2ab3f]/35 bg-[#d2ab3f]/12 px-4 py-2 text-xs font-semibold text-[#165f38]">
              {user?.state || 'National'}
            </span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
