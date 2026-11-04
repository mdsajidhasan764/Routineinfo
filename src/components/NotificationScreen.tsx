import React from 'react';
import { Bell, Trash2, Clock, CheckCircle2 } from 'lucide-react';
import { NotificationRecord } from './NotificationHistoryModal';

interface NotificationScreenProps {
  notifications: NotificationRecord[];
  onClearHistory: () => void;
}

export const NotificationScreen: React.FC<NotificationScreenProps> = ({
  notifications,
  onClearHistory,
}) => {
  return (
    <div className="space-y-2.5 animate-in fade-in duration-200">
      {/* Header Bar */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-6 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
            <Bell className="w-3.5 h-3.5" />
          </div>
          <h2 className="text-xs font-bold text-zinc-900 dark:text-white tracking-tight">
            Notifications
          </h2>
          <span className="text-[10px] font-mono font-medium text-zinc-500 dark:text-zinc-400 bg-white/40 dark:bg-zinc-800/50 px-1.5 py-0.5 rounded-full border border-white/30 dark:border-zinc-800/40">
            Past 7 Days ({notifications.length})
          </span>
        </div>

        {notifications.length > 0 && (
          <button
            type="button"
            onClick={onClearHistory}
            className="text-[10px] font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 flex items-center gap-0.5 px-2 py-0.5 rounded-lg bg-rose-500/10 border border-rose-500/20 transition cursor-pointer"
          >
            <Trash2 className="w-3 h-3" />
            <span>Clear</span>
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="space-y-1.5">
        {notifications.length === 0 ? (
          <div className="bg-white/40 dark:bg-zinc-950/40 backdrop-blur-3xl rounded-2xl border border-white/40 dark:border-zinc-800/50 p-6 text-center text-zinc-400 dark:text-zinc-500 shadow-2xs">
            <Bell className="w-6 h-6 mx-auto opacity-30 stroke-[1.5]" />
            <h3 className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 mt-1.5">No alerts yet</h3>
            <p className="text-[10px] text-zinc-400 mt-0.5">
              Class start and end reminder notifications will appear here.
            </p>
          </div>
        ) : (
          notifications.map((item) => {
            const timeFormatted = new Date(item.timestamp).toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              hour12: true,
            });

            return (
              <div
                key={item.id}
                className="bg-white/40 dark:bg-zinc-950/40 backdrop-blur-3xl rounded-2xl p-2.5 border border-white/40 dark:border-zinc-800/50 shadow-2xs flex items-start gap-2.5 transition"
              >
                <div className="w-6 h-6 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                  <CheckCircle2 className="w-3 h-3" />
                </div>
                <div className="min-w-0 flex-1 space-y-0.5">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-[11px] font-bold text-zinc-900 dark:text-white leading-snug truncate">
                      {item.title}
                    </h4>
                    <span className="text-[9px] font-mono text-zinc-400 shrink-0 flex items-center gap-0.5">
                      <Clock className="w-2.5 h-2.5" />
                      {timeFormatted}
                    </span>
                  </div>
                  {item.body && (
                    <p className="text-[10px] text-zinc-600 dark:text-zinc-400 leading-normal">
                      {item.body}
                    </p>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
