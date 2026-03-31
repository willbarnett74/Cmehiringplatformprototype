/**
 * NotificationBell — Spec 9
 *
 * Top-nav bell icon with unread badge + dropdown panel.
 * Used in both the Employer and Applicant portals.
 *
 * Props:
 *   userId     — 'employer-1' or 'candidate-1' in the prototype
 *   onNavigate — optional callback when user clicks an action URL
 */

import { useState, useEffect, useRef } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import {
  Notification,
  NotificationType,
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  subscribeToNotifications,
  formatTimeAgo,
} from '../../lib/notificationService';

const typeConfig: Record<NotificationType, { label: string; color: string; bg: string }> = {
  review_due:    { label: 'Review Due',     color: '#F59E0B', bg: '#FFFBEB' },
  pulse_check:   { label: 'Pulse Check',    color: '#7DBBFF', bg: '#EFF6FF' },
  stage_change:  { label: 'Status Update',  color: '#8B5CF6', bg: '#F5F3FF' },
  reminder:      { label: 'Reminder',       color: '#EF4444', bg: '#FEF2F2' },
  insight_update:{ label: 'New Insight',    color: '#10B981', bg: '#F0FDF4' },
};

interface NotificationBellProps {
  userId: string;
  onNavigate?: (url: string) => void;
}

export function NotificationBell({ userId, onNavigate }: NotificationBellProps) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);

  // Load notifications and subscribe to changes
  useEffect(() => {
    const refresh = () => {
      setNotifications(getNotifications(userId));
      setUnreadCount(getUnreadCount(userId));
    };
    refresh();
    const unsubscribe = subscribeToNotifications(refresh);
    return unsubscribe;
  }, [userId]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleClick = (n: Notification) => {
    markAsRead(n.id);
    if (n.actionUrl && onNavigate) onNavigate(n.actionUrl);
    setOpen(false);
  };

  const handleMarkAllRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    markAllAsRead(userId);
  };

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative p-2 hover:bg-[#fafafa] transition-colors"
        style={{ borderRadius: '10px' }}
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
      >
        <Bell className="w-5 h-5 text-[#6B7280]" strokeWidth={1.5} />
        {unreadCount > 0 && (
          <span
            className="absolute top-1 right-1 min-w-[16px] h-4 flex items-center justify-center px-1 text-[10px] font-bold text-white bg-[#EF4444] rounded-full leading-none"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-[360px] bg-white border border-black/[0.08] shadow-xl z-50 overflow-hidden"
          style={{ borderRadius: '16px' }}
        >
          {/* Panel header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-black/[0.06]">
            <span className="text-sm text-[#111827] font-semibold">Notifications</span>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="flex items-center gap-1.5 text-xs text-[#7DBBFF] hover:text-[#5BA3E8] transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5" strokeWidth={2} />
                Mark all read
              </button>
            )}
          </div>

          {/* Notification list */}
          <div className="max-h-[380px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <Bell className="w-8 h-8 text-[#D1D5DB] mx-auto mb-2" strokeWidth={1} />
                <p className="text-sm text-[#9CA3AF]">No notifications yet</p>
              </div>
            ) : (
              notifications.map((n) => {
                const cfg = typeConfig[n.type];
                return (
                  <button
                    key={n.id}
                    onClick={() => handleClick(n)}
                    className={`w-full text-left px-4 py-3 border-b border-black/[0.04] hover:bg-[#FAFAFA] transition-colors flex gap-3 ${
                      !n.read ? 'bg-[#F8FAFF]' : 'bg-white'
                    }`}
                  >
                    {/* Unread dot */}
                    <div className="pt-1.5 shrink-0">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: n.read ? 'transparent' : cfg.color }}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Type badge */}
                      <span
                        className="inline-block text-[10px] font-semibold px-2 py-0.5 mb-1"
                        style={{
                          color: cfg.color,
                          backgroundColor: cfg.bg,
                          borderRadius: '5px',
                        }}
                      >
                        {cfg.label}
                      </span>
                      {/* Message */}
                      <p className="text-xs text-[#374151] leading-relaxed">{n.message}</p>
                      {/* Time */}
                      <p className="text-[10px] text-[#9CA3AF] mt-1">{formatTimeAgo(n.createdAt)}</p>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-2.5 border-t border-black/[0.06] bg-[#FAFAFA]">
              <p className="text-[10px] text-[#9CA3AF] text-center">
                Showing last {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
