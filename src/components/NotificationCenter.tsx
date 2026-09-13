import React, { useState, useRef, useEffect } from 'react';
import { InAppNotification, Language, NavigationTab } from '../types';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  CreditCard,
  FileCheck2,
  Trash2,
  Check,
  ExternalLink,
  Sparkles,
  Info,
  Clock,
} from 'lucide-react';

interface NotificationCenterProps {
  notifications: InAppNotification[];
  language: Language;
  onMarkAsRead: (notificationId: string) => void;
  onMarkAllAsRead: () => void;
  onDeleteNotification: (notificationId: string) => void;
  onNavigateTab: (tab: NavigationTab) => void;
  isAuthenticated: boolean;
  onOpenAuthModal?: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notifications,
  language,
  onMarkAsRead,
  onMarkAllAsRead,
  onDeleteNotification,
  onNavigateTab,
  isAuthenticated,
  onOpenAuthModal,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isBn = language === 'bn';
  const unreadCount = notifications.filter((n) => n.status === 'unread').length;

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'unread') return n.status === 'unread';
    return true;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'AUDIT_COMPLETED':
        return <FileCheck2 className="w-4 h-4 text-emerald-600" />;
      case 'SUBSCRIPTION_CHANGED':
        return <CreditCard className="w-4 h-4 text-indigo-600" />;
      case 'USAGE_ALERT':
        return <AlertTriangle className="w-4 h-4 text-amber-600" />;
      default:
        return <Info className="w-4 h-4 text-blue-600" />;
    }
  };

  const formatTimestamp = (createdAt: any) => {
    if (!createdAt) return isBn ? 'এখনই' : 'Just now';
    if (createdAt.seconds) {
      const date = new Date(createdAt.seconds * 1000);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return isBn ? 'এখনই' : 'Just now';
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        type="button"
        id="notification-center-trigger-btn"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={isBn ? 'ইন-অ্যাপ নোটিফিকেশন সেন্টার' : 'In-App Notification Center'}
        className={`relative p-2 rounded-xl transition-all border cursor-pointer ${
          isOpen
            ? 'bg-blue-50 border-blue-300 text-blue-700 shadow-2xs'
            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 shadow-2xs'
        }`}
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span
            id="notification-unread-badge"
            className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white shadow-xs animate-pulse"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          id="notification-dropdown-panel"
          className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white border border-slate-200 shadow-xl z-50 overflow-hidden animate-fadeIn"
        >
          {/* Header */}
          <div className="px-4 py-3 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-blue-400" />
              <h3 className="text-xs font-bold tracking-tight">
                {isBn ? 'ইন-অ্যাপ নোটিফিকেশন' : 'In-App Notifications'}
              </h3>
              {unreadCount > 0 && (
                <span className="text-[10px] font-semibold bg-rose-500/90 text-white px-1.5 py-0.2 rounded-full">
                  {unreadCount} {isBn ? 'নতুন' : 'new'}
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                id="mark-all-read-btn"
                onClick={onMarkAllAsRead}
                className="text-[11px] font-medium text-blue-200 hover:text-white flex items-center gap-1 transition cursor-pointer"
              >
                <Check className="w-3 h-3" />
                <span>{isBn ? 'সব পঠিত করুন' : 'Mark all read'}</span>
              </button>
            )}
          </div>

          {/* Sub-header / Filter */}
          <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs">
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => setFilter('all')}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition ${
                  filter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                {isBn ? 'সব' : 'All'} ({notifications.length})
              </button>
              <button
                type="button"
                onClick={() => setFilter('unread')}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition ${
                  filter === 'unread'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                {isBn ? 'অপঠিত' : 'Unread'} ({unreadCount})
              </button>
            </div>

            <span className="text-[10px] font-mono text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded font-semibold">
              Firestore Synced
            </span>
          </div>

          {/* Notification List Container */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {!isAuthenticated ? (
              <div className="p-6 text-center text-slate-500">
                <Info className="w-8 h-8 text-blue-500 mx-auto mb-2 opacity-80" />
                <p className="text-xs font-semibold text-slate-700">
                  {isBn
                    ? 'ফায়ারবেস একাউন্টে সাইন-ইন নেই'
                    : 'Not Signed In to Workspace'}
                </p>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  {isBn
                    ? 'রিয়েল-টাইম ক্লাউড নোটিফিকেশন পেতে সাইন-ইন বা রেজিস্টার করুন।'
                    : 'Sign in or register to receive real-time persistent Firestore notifications.'}
                </p>
                {onOpenAuthModal && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      onOpenAuthModal();
                    }}
                    className="mt-3 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition"
                  >
                    {isBn ? 'লগইন / রেজিস্টার' : 'Sign In / Register'}
                  </button>
                )}
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <CheckCircle2 className="w-8 h-8 text-emerald-500/80 mx-auto mb-2" />
                <p className="text-xs font-medium text-slate-600">
                  {filter === 'unread'
                    ? isBn
                      ? 'কোনো অপঠিত নোটিফিকেশন নেই'
                      : 'No unread notifications'
                    : isBn
                    ? 'কোনো নোটিফিকেশন লগ পাওয়া যায়নি'
                    : 'No notifications recorded yet'}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {isBn
                    ? 'ডকুমেন্ট অডিট সম্পন্ন বা সাবস্ক্রিপশন পরিবর্তনের সাথে সাথে এখানে সতর্কতা আসবে।'
                    : 'Alerts will appear automatically when document audits complete or subscriptions change.'}
                </p>
              </div>
            ) : (
              filteredNotifications.map((n) => {
                const isUnread = n.status === 'unread';
                return (
                  <div
                    key={n.id || Math.random().toString()}
                    className={`p-3.5 transition-colors relative flex gap-3 ${
                      isUnread ? 'bg-blue-50/40 hover:bg-blue-50/70' : 'bg-white hover:bg-slate-50'
                    }`}
                  >
                    {/* Status indicator dot */}
                    {isUnread && (
                      <span className="w-2 h-2 rounded-full bg-blue-600 absolute top-4 left-2 ring-2 ring-blue-100" />
                    )}

                    {/* Icon container */}
                    <div className="shrink-0 w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center border border-slate-200 mt-0.5">
                      {getIcon(n.type)}
                    </div>

                    {/* Content area */}
                    <div className="flex-1 min-w-0 pr-1">
                      <div className="flex items-start justify-between gap-1">
                        <h4
                          className={`text-xs leading-snug line-clamp-1 ${
                            isUnread ? 'font-bold text-slate-900' : 'font-semibold text-slate-700'
                          }`}
                        >
                          {isBn ? n.titleBn : n.titleEn}
                        </h4>
                        <span className="text-[10px] text-slate-400 font-mono whitespace-nowrap flex items-center gap-0.5">
                          <Clock className="w-2.5 h-2.5" />
                          {formatTimestamp(n.createdAt)}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-600 leading-relaxed mt-1 line-clamp-2">
                        {isBn ? n.messageBn : n.messageEn}
                      </p>

                      {/* Action buttons */}
                      <div className="mt-2 flex items-center justify-between pt-1 border-t border-slate-100/80">
                        {n.linkTab ? (
                          <button
                            type="button"
                            onClick={() => {
                              if (n.id && isUnread) onMarkAsRead(n.id);
                              if (n.linkTab) onNavigateTab(n.linkTab);
                              setIsOpen(false);
                            }}
                            className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                          >
                            <span>
                              {n.linkTab === 'drive'
                                ? isBn
                                  ? 'অডিট রিপোর্টে যান'
                                  : 'View Audit'
                                : n.linkTab === 'billing'
                                ? isBn
                                  ? 'বিলিং পেজ দেখুন'
                                  : 'View Billing'
                                : isBn
                                ? 'বিবরণ দেখুন'
                                : 'View Details'}
                            </span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </button>
                        ) : (
                          <span />
                        )}

                        <div className="flex items-center gap-1">
                          {isUnread && n.id && (
                            <button
                              type="button"
                              onClick={() => onMarkAsRead(n.id!)}
                              title={isBn ? 'পঠিত মার্ক করুন' : 'Mark as read'}
                              className="p-1 text-slate-400 hover:text-blue-600 rounded transition"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {n.id && (
                            <button
                              type="button"
                              onClick={() => onDeleteNotification(n.id!)}
                              title={isBn ? 'মুছে ফেলুন' : 'Delete'}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 text-center text-[10px] text-slate-400 font-medium flex items-center justify-between">
            <span>{isBn ? 'স্বয়ংক্রিয় ক্লাউড সিঙ্ক' : 'Auto Cloud Sync'}</span>
            <span className="font-mono text-slate-500">Firestore v9 SDK</span>
          </div>
        </div>
      )}
    </div>
  );
};
