import { Bell, Check, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

export type NotificationType = 'announcement' | 'match';

export interface NotificationItem {
  _id: string;
  title: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
  metadata?: {
    roomId?: string | null;
    matchId?: string | null;
    matchTitle?: string | null;
    matchIndex?: string | null;
    matchDate?: string | null;
    matchTime?: string | null;
    matchPassword?: string | null;
    slotNumber?: string | null;
    message?: string | null;
  };
}

interface Props {
  byBookings?: boolean;
  onOpenMatch: (n: NotificationItem) => void;
}

export default function NotificationBell({ byBookings, onOpenMatch }: Props) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const apiBase = import.meta.env.VITE_API_URL;

  const unreadCount = useMemo(() => items.filter(i => !i.isRead).length, [items]);

  const fetchNotifications = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await fetch(`${apiBase}/api/notification/by-bookings`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok && data.status) setItems(data.notifications || []); else setError(data.message || 'Failed to load notifications');
    } catch (e) {
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const markAsRead = async (id: string) => {
    if (!token) return;
    try {
      console.log('Marking notification as read:', id);
      const res = await fetch(`${apiBase}/api/notification/${id}/read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      console.log('Mark as read response:', { status: res.status, data });
      if (res.ok && data.status) {
        setItems(prev => prev.map(n => (n._id === id ? { ...n, isRead: true } : n)));
      } else {
        console.error('Failed to mark as read:', data);
      }
    } catch (e) {
      console.error('Error marking as read:', e);
    }
  };

  const markAllAsRead = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${apiBase}/api/notification/read-all`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setItems(prev => prev.map(n => ({ ...n, isRead: true })));
      }
    } catch {}
  };

  const deleteNotification = async (id: string) => {
    if (!token) return;
    try {
      const res = await fetch(`${apiBase}/api/notification/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.status) {
        setItems(prev => prev.filter(n => n._id !== id));
      }
    } catch {}
  };

  const handleItemClick = (n: NotificationItem) => {
    if (n.type === 'match') {
      onOpenMatch(n);
    }
  };

  if (!token) return null;

  return (
    <div className="relative">
      <button className="notification-bell-button" onClick={() => setOpen(o => !o)} aria-label="Notifications">
        <Bell className="notification-bell-icon" />
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount}</span>
        )}
      </button>
      {open && (
        <div className="notification-dropdown">
          <div className="notification-dropdown-content">
            <div className="notification-dropdown-header">
              <div className="notification-dropdown-title">Notifications</div>
              <div className="notification-dropdown-actions">
                <button className="notification-dropdown-action" onClick={markAllAsRead}>
                  Mark all as read
                </button>
              </div>
            </div>
            {loading && <div className="p-3 text-sm">Loading...</div>}
            {error && <div className="p-3 text-sm text-red-500">{error}</div>}
            {!loading && items.length === 0 && <div className="p-3 text-sm">No notifications</div>}
            <ul className="max-h-80 overflow-auto">
              {items.map(n => (
                <li key={n._id} className={`p-2 rounded cursor-pointer`}
                    onClick={() => handleItemClick(n)}>
                  <div className="flex items-center justify-between">
                    <div className="font-medium text-sm text-black"> Title: {n.title}</div>
                    <div className="flex items-center gap-2">
                      {!n.isRead && (
                        <button className="text-blue-500" aria-label="Mark as read" title="Mark as read" onClick={(e) => { e.stopPropagation(); markAsRead(n._id); }}>
                          <Check size={16} />
                        </button>
                      )}
                      <button className="text-red-500" aria-label="Delete" title="Delete" onClick={(e)=>{ e.stopPropagation(); deleteNotification(n._id); }}>
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                  {/* <div className="text-xs text-black capitalize">{n.type}</div> */}
                  {n.type === 'announcement' && n.metadata?.message && (
                    <div className="text-[12px] text-black mt-1"> Message: {n.metadata.message}</div>
                  )}
                  {n.type === 'match' && (
                    <div className="text-[12px] text-black mt-1">
                      {(n.metadata?.matchTitle || n.metadata?.matchIndex) && (
                        <div>
                          {n.metadata?.matchTitle && <div>Title: {n.metadata.matchTitle}</div>}
                          {n.metadata?.matchIndex && <div>Match #: {n.metadata.matchIndex}</div>}
                        </div>
                      )}
                      <div className="flex items-center justify-between gap-2">
                        <span>Room ID: {(n.metadata as any)?.roomId ?? (n.metadata as any)?.id ?? '-'}</span>
                        {((n.metadata as any)?.roomId ?? (n.metadata as any)?.id) && (
                          <button
                            className="text-xs text-blue-600 underline"
                            onClick={(e) => {
                              e.stopPropagation();
                              const val = (n.metadata as any)?.roomId ?? (n.metadata as any)?.id;
                              navigator.clipboard.writeText(String(val));
                            }}
                          >
                            Copy
                          </button>
                        )}
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span>Password: {n.metadata?.matchPassword || '-'}</span>
                        {n.metadata?.matchPassword && (
                          <button
                            className="text-xs text-blue-600 underline"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigator.clipboard.writeText(String(n.metadata?.matchPassword));
                            }}
                          >
                            Copy
                          </button>
                        )}
                      </div>
                      <div>Slot: {n.metadata?.slotNumber || '-'}</div>
                      <div>Match Date: {n.metadata?.matchDate ? new Date(n.metadata.matchDate).toLocaleDateString() : '-'}</div>
                      <div>Match Time: {n.metadata?.matchTime ? new Date(n.metadata.matchTime).toLocaleTimeString() : '-'}</div>
                    </div>
                  )}
                  <div className="text-[10px] text-black">{new Date(n.createdAt).toLocaleString()}</div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
      {open && <div className="dropdown-overlay" onClick={() => setOpen(false)} />}
    </div>
  );
}


