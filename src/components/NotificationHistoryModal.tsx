import React from 'react';
import { ArrowLeft, Bell, Trash2, Clock } from 'lucide-react';

export interface NotificationRecord {
  id: string;
  title: string;
  body: string;
  timestamp: number;
  routineId?: string;
}

interface NotificationHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationRecord[];
  onClearHistory: () => void;
}

export const NotificationHistoryModal: React.FC<NotificationHistoryModalProps> = ({
  isOpen,
  onClose,
  notifications,
  onClearHistory,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col w-full h-full animate-in fade-in slide-in-from-bottom duration-200">
      {/* Full Screen Top Navigation Header */}
      <div className="p-3 sm:p-4 border-b border-zinc-200/80 dark:border-white/[0.08] bg-white/85 dark:bg-slate-950/70 dark:backdrop-blur-3xl flex items-center justify-between shadow-xs shrink-0">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-white/[0.06] hover:bg-zinc-200 dark:hover:bg-white/[0.12] text-zinc-700 dark:text-zinc-200 border border-zinc-200/60 dark:border-white/10 transition cursor-pointer flex items-center justify-center shrink-0 shadow-2xs"
            aria-label="Back to home"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2.2]" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs">
              <Bell className="w-3.5 h-3.5" />
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white leading-none">
                Notifications
              </h1>
              <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                Past 7 days activity logs
              </p>
            </div>
          </div>
        </div>

        {notifications.length > 0 && (
          <button
            type="button"
            onClick={onClearHistory}
            className="px-2.5 py-1 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-bold text-[11px] hover:bg-rose-100 transition flex items-center gap-1 cursor-pointer border border-rose-200 dark:border-rose-900/60"
          >
            <Trash2 className="w-3 h-3" />
            <span>Clear</span>
          </button>
        )}
      </div>

      {/* Full Screen Scrollable Content Body */}
      <div className="p-3 sm:p-4 max-w-3xl w-full mx-auto flex-1 overflow-y-auto space-y-2.5">
        {notifications.length === 0 ? (
          <div className="text-center py-20 text-zinc-400 dark:text-zinc-500 space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-white/[0.05] dark:border dark:border-white/10 flex items-center justify-center mx-auto text-zinc-400">
              <Bell className="w-6 h-6 stroke-[1.5]" />
            </div>
            <p className="text-xs sm:text-sm font-semibold text-zinc-700 dark:text-zinc-300">No notifications yet</p>
            <p className="text-[11px] text-zinc-400 max-w-xs mx-auto">
              Automatic alerts for class start and end times will appear here.
            </p>
          </div>
        ) : (
          notifications.map((n) => {
            const dateStr = new Date(n.timestamp).toLocaleString();
            return (
              <div
                key={n.id}
                className="p-3 sm:p-3.5 rounded-2xl bg-white/85 dark:bg-slate-900/55 dark:backdrop-blur-2xl border border-zinc-200/80 dark:border-white/10 shadow-xs dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.12),0_12px_28px_rgba(0,0,0,0.36)] space-y-1 transition-all"
              >
                <div className="flex items-center justify-between text-[10px] text-zinc-400 dark:text-zinc-500 font-mono">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-emerald-500" />
                    {dateStr}
                  </span>
                </div>
                <div className="text-xs sm:text-[13px] font-semibold text-zinc-900 dark:text-white leading-snug">
                  {n.title}
                </div>
                {n.body && (
                  <div className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    {n.body}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
