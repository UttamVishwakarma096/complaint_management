import { useEffect, useState } from "react";
import {
  getNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "../services/api";

const formatRelativeTime = (dateStr) => {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

export default function NotificationPopover({ isOpen, onClose, onUnreadCountChange }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchNotifs = async () => {
    try {
      setLoading(true);
      const res = await getNotifications();
      if (res.success) {
        setNotifications(res.notifications || []);
        const count = res.unreadCount || 0;
        setUnreadCount(count);
        onUnreadCountChange?.(count);
      }
    } catch (err) {
      console.error("Failed to load notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
    // Poll every 30 seconds
    const interval = setInterval(fetchNotifs, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await markNotificationAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((c) => {
        const next = Math.max(0, c - 1);
        onUnreadCountChange?.(next);
        return next;
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAll = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      onUnreadCountChange?.(0);
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="absolute right-0 top-12 z-50 w-80 sm:w-96 rounded-2xl glass-dropdown p-4 shadow-2xl text-slate-800 dark:text-slate-100 border border-white/60 dark:border-white/10 animate-in fade-in zoom-in-95 duration-200">
      <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/10">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-sm">Notifications</h3>
          {unreadCount > 0 && (
            <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-bold text-white shadow-xs shadow-emerald-600/30">
              {unreadCount} new
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={handleMarkAll}
            className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-medium cursor-pointer"
          >
            Mark all read
          </button>
        )}
      </div>

      <div className="mt-2 max-h-80 overflow-y-auto divide-y divide-black/5 dark:divide-white/5 pr-1">
        {loading && notifications.length === 0 ? (
          <p className="py-6 text-center text-xs text-slate-500 dark:text-slate-400">Loading notifications...</p>
        ) : notifications.length === 0 ? (
          <div className="py-8 text-center">
            <span className="text-2xl text-emerald-500">✓</span>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">All caught up! No notifications.</p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif._id}
              onClick={() => !notif.isRead && handleMarkAsRead(notif._id)}
              className={`p-3 transition rounded-xl cursor-pointer ${
                notif.isRead
                  ? "opacity-75 hover:bg-black/5 dark:hover:bg-white/5"
                  : "bg-emerald-500/10 dark:bg-emerald-500/15 hover:bg-emerald-500/20 dark:hover:bg-emerald-500/25 border border-emerald-500/20 my-1"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">{notif.title}</p>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 whitespace-nowrap">
                  {formatRelativeTime(notif.createdAt)}
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{notif.message}</p>
              {!notif.isRead && (
                <span className="mt-2 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
