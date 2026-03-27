import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, FileCheck, MessageCircle, History, Leaf, Menu, X } from 'lucide-react';
import { NotificationBell } from '@/components/NotificationBell';
import { useAuthStore } from '@/stores/authStore';
import { CreditCounterWidget } from '@/components/CreditCounterWidget';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

const navItems = [
  { to: '/company/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/company/marketplace', label: 'Marketplace', icon: ShoppingBag },
  { to: '/company/certificates', label: 'Certificates', icon: FileCheck },
  { to: '/company/enquire', label: 'Enquiry', icon: MessageCircle },
  { to: '/company/transactions', label: 'Transactions', icon: History },
];

export default function CompanyLayout() {
  const { companyUser } = useAuthStore();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-secondary/30">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col bg-card border-r border-border">
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Leaf className="h-6 w-6 text-primary" />
            <div>
              <h2 className="font-semibold text-sm text-foreground">Carbon Credit Portal</h2>
              <p className="text-xs text-muted-foreground">Company Portal</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                )
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        {companyUser && (
          <div className="p-4 border-t border-border">
            <p className="text-sm font-medium text-foreground truncate">{companyUser.name}</p>
            <p className="text-xs text-muted-foreground truncate">CIN: {companyUser.cin}</p>
          </div>
        )}
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-foreground/20" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-card border-r border-border flex flex-col">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Leaf className="h-6 w-6 text-primary" />
                <h2 className="font-semibold text-sm text-foreground">Carbon Credit Portal</h2>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <nav className="flex-1 p-3 space-y-1">
              {navItems.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                      isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                    )
                  }
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-border bg-card flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
            <div className="text-sm">
              <span className="text-muted-foreground">
                {navItems.find(n => location.pathname.startsWith(n.to))?.label || 'Dashboard'}
              </span>
            </div>
          </div>
          <NotificationBell variant="company" />
        </header>
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
      <CreditCounterWidget />
    </div>
  );
}
