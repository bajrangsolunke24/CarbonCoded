import { Bell, LogOut, User, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/authStore';
import { useNotificationStore } from '@/stores/notificationStore';
import { useNavigate } from 'react-router-dom';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';

interface NotificationBellProps {
  variant?: 'company' | 'gov';
}

export function NotificationBell({ variant = 'company' }: NotificationBellProps) {
  const { notifications, unreadCount, markAsRead, markAllRead } = useNotificationStore();
  const navigate = useNavigate();
  const { logout } = useAuthStore();

  return (
    <div className="flex items-center gap-2">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                {unreadCount}
              </span>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle className="flex items-center justify-between">
              <span>Notifications</span>
              {unreadCount > 0 && (
                <Button variant="ghost" size="sm" onClick={markAllRead}>Mark all read</Button>
              )}
            </SheetTitle>
          </SheetHeader>
          <ScrollArea className="h-[calc(100vh-100px)] mt-4">
            <div className="space-y-3">
              {notifications.map(n => (
                <div
                  key={n.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    n.read ? 'bg-background' : 'bg-primary/5 border-primary/20'
                  }`}
                  onClick={() => markAsRead(n.id)}
                >
                  <p className="text-sm font-medium text-foreground">{n.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{n.message}</p>
                  <p className="text-xs text-muted-foreground mt-2">{new Date(n.timestamp).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => {
          logout();
          navigate('/');
        }}
      >
        <LogOut className="h-5 w-5" />
      </Button>
    </div>
  );
}
