import React from 'react';
import { Clock, MapPin, User, Phone } from 'lucide-react';
import { LiveRoutineStatus } from '../utils/notificationService';

interface LiveClassBannerProps {
  status: LiveRoutineStatus;
}

export const LiveClassBanner: React.FC<LiveClassBannerProps> = ({ status }) => {
  const { currentClass, minutesRemainingInClass, nextClass, minutesUntilNextClass } = status;

  if (currentClass) {
    return (
      <div className="bg-emerald-600 text-white rounded-xl p-3.5 sm:p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-black/20 px-2 py-0.5 rounded">
                Live Now
              </span>
              {currentClass.code && (
                <span className="text-xs font-mono font-bold bg-white/20 px-2 py-0.5 rounded">
                  {currentClass.code}
                </span>
              )}
              <span className="text-xs font-medium text-emerald-100">
                {minutesRemainingInClass} min remaining
              </span>
            </div>
            <h2 className="text-base font-bold text-white break-words mt-1">
              {currentClass.subjectName}
            </h2>
            <div className="flex items-center gap-3 mt-1.5 text-xs text-emerald-50 flex-wrap">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>{currentClass.startTime} – {currentClass.endTime}</span>
              </span>
              {currentClass.room && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{currentClass.room}</span>
                </span>
              )}
              {currentClass.teacherName && (
                <span className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5" />
                  <span>{currentClass.teacherName}</span>
                </span>
              )}
            </div>
          </div>

          {currentClass.teacherPhone && (
            <a
              href={`tel:${currentClass.teacherPhone}`}
              className="self-start sm:self-center shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-white text-emerald-800 rounded-lg font-bold text-xs hover:bg-emerald-50 transition"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call Teacher</span>
            </a>
          )}
        </div>
      </div>
    );
  }

  if (nextClass) {
    return (
      <div className="bg-slate-900 text-white rounded-xl p-3 sm:p-3.5 shadow-xs">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded">
            Next Class
          </span>
          <span className="text-xs font-bold text-slate-100 break-words">
            {nextClass.subjectName} {nextClass.code ? `[${nextClass.code}]` : ''}
          </span>
          <span className="text-xs text-slate-400">
            at {nextClass.startTime} (in {minutesUntilNextClass} min)
          </span>
          {nextClass.room && (
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-rose-400" />
              <span>{nextClass.room}</span>
            </span>
          )}
        </div>
      </div>
    );
  }

  return null;
};
