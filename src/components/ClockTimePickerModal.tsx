import React, { useState, useEffect, useRef } from 'react';
import { X, Check } from 'lucide-react';

interface ClockTimePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTime: (timeString: string) => void;
  initialTime?: string; // e.g. "04:15 PM" or "09:00 AM"
  title?: string;
  departmentName?: string;
}

const ITEM_HEIGHT = 52; // Height of each number row in px
const VISIBLE_COUNT = 5; // 2 above, 1 selected in middle, 2 below
const CONTAINER_HEIGHT = ITEM_HEIGHT * VISIBLE_COUNT; // 260px

export const ClockTimePickerModal: React.FC<ClockTimePickerModalProps> = ({
  isOpen,
  onClose,
  onSelectTime,
  initialTime = '09:00 AM',
  title = 'Select Class Time',
  departmentName = 'Computer Science & Technology',
}) => {
  // Parse initial time
  const parseInitial = () => {
    try {
      const match = initialTime.match(/(\d+):(\d+)\s*(AM|PM)/i);
      if (match) {
        return {
          h: parseInt(match[1], 10),
          m: parseInt(match[2], 10),
          period: match[3].toUpperCase() as 'AM' | 'PM',
        };
      }
    } catch {
      // fallback
    }
    return { h: 9, m: 0, period: 'AM' as const };
  };

  const initial = parseInitial();
  const [selectedPeriod, setSelectedPeriod] = useState<'AM' | 'PM'>(initial.period);
  const [selectedHour, setSelectedHour] = useState<number>(initial.h);
  const [selectedMinute, setSelectedMinute] = useState<number>(initial.m);

  // Scroll container refs
  const periodRef = useRef<HTMLDivElement>(null);
  const hourRef = useRef<HTMLDivElement>(null);
  const minuteRef = useRef<HTMLDivElement>(null);
  const matrixCanvasRef = useRef<HTMLCanvasElement>(null);

  // Department checks
  const deptLower = (departmentName || '').toLowerCase();
  const isComputer =
    deptLower.includes('computer') ||
    deptLower.includes('cst') ||
    deptLower.includes('software') ||
    deptLower.includes('data');
  const isElectrical =
    deptLower.includes('electrical') ||
    deptLower.includes('electronics') ||
    deptLower.includes('et');
  const isCivil =
    deptLower.includes('civil') ||
    deptLower.includes('architecture');
  const isMechanical =
    deptLower.includes('mechanical') ||
    deptLower.includes('automobile') ||
    deptLower.includes('power');

  const hoursList = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  const minutesList = Array.from({ length: 60 }, (_, i) => i);
  const periodsList: ('AM' | 'PM')[] = ['AM', 'PM'];

  // Initialize and synchronize scrolls on open
  useEffect(() => {
    if (isOpen) {
      const p = parseInitial();
      setSelectedPeriod(p.period);
      setSelectedHour(p.h);
      setSelectedMinute(p.m);

      // Scroll wheels into position after render
      setTimeout(() => {
        if (hourRef.current) {
          const hIdx = hoursList.indexOf(p.h);
          if (hIdx !== -1) {
            hourRef.current.scrollTop = hIdx * ITEM_HEIGHT;
          }
        }
        if (minuteRef.current) {
          minuteRef.current.scrollTop = p.m * ITEM_HEIGHT;
        }
        if (periodRef.current) {
          const pIdx = periodsList.indexOf(p.period);
          if (pIdx !== -1) {
            periodRef.current.scrollTop = pIdx * ITEM_HEIGHT;
          }
        }
      }, 50);
    }
  }, [isOpen, initialTime]);

  // Matrix Rain animation for Computer Science & Technology
  useEffect(() => {
    if (!isOpen || !isComputer) return;
    const canvas = matrixCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    const chars = '01CSTBTEB_CODE{}[]<>=/0101#@!';
    const fontSize = 14;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 360);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 420);

    const columns = Math.floor(width / fontSize);
    const drops: number[] = Array.from({ length: columns }, () => Math.floor(Math.random() * -30));

    const draw = () => {
      ctx.fillStyle = 'rgba(10, 15, 20, 0.16)';
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = '#10b981'; // Vivid green matrix text
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        ctx.fillText(text, x, y);

        if (y > height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isOpen, isComputer]);

  if (!isOpen) return null;

  const formattedHour = selectedHour < 10 ? `0${selectedHour}` : `${selectedHour}`;
  const formattedMin = selectedMinute < 10 ? `0${selectedMinute}` : `${selectedMinute}`;
  const fullTimeString = `${formattedHour}:${formattedMin} ${selectedPeriod}`;

  // Scroll handlers for native scrolling
  const handleHourScroll = () => {
    if (!hourRef.current) return;
    const index = Math.round(hourRef.current.scrollTop / ITEM_HEIGHT);
    const clamped = Math.max(0, Math.min(hoursList.length - 1, index));
    const h = hoursList[clamped];
    if (h && h !== selectedHour) {
      setSelectedHour(h);
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(10);
      }
    }
  };

  const handleMinuteScroll = () => {
    if (!minuteRef.current) return;
    const index = Math.round(minuteRef.current.scrollTop / ITEM_HEIGHT);
    const clamped = Math.max(0, Math.min(minutesList.length - 1, index));
    if (clamped !== selectedMinute) {
      setSelectedMinute(clamped);
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(10);
      }
    }
  };

  const handlePeriodScroll = () => {
    if (!periodRef.current) return;
    const index = Math.round(periodRef.current.scrollTop / ITEM_HEIGHT);
    const clamped = Math.max(0, Math.min(periodsList.length - 1, index));
    const p = periodsList[clamped];
    if (p && p !== selectedPeriod) {
      setSelectedPeriod(p);
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(10);
      }
    }
  };

  // Scroll smoothly when user taps an item
  const scrollToHour = (hour: number) => {
    setSelectedHour(hour);
    const idx = hoursList.indexOf(hour);
    if (hourRef.current && idx !== -1) {
      hourRef.current.scrollTo({ top: idx * ITEM_HEIGHT, behavior: 'smooth' });
    }
  };

  const scrollToMinute = (min: number) => {
    setSelectedMinute(min);
    if (minuteRef.current) {
      minuteRef.current.scrollTo({ top: min * ITEM_HEIGHT, behavior: 'smooth' });
    }
  };

  const scrollToPeriod = (p: 'AM' | 'PM') => {
    setSelectedPeriod(p);
    const idx = periodsList.indexOf(p);
    if (periodRef.current && idx !== -1) {
      periodRef.current.scrollTo({ top: idx * ITEM_HEIGHT, behavior: 'smooth' });
    }
  };

  const handleConfirm = () => {
    onSelectTime(fullTimeString);
    onClose();
  };

  // Department theme styling
  const deptTheme = isComputer
    ? {
        name: 'Computer Science & Technology',
        sub: 'CST HACKING / MATRIX ALARM CLOCK',
        badgeColor: 'bg-emerald-950/80 text-emerald-400 border-emerald-500/40',
        lensGlow: 'border-emerald-500/40 bg-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.2)]',
        btnBg: 'bg-emerald-600 hover:bg-emerald-500',
        textHighlight: 'text-emerald-400',
      }
    : isElectrical
    ? {
        name: 'Electrical Technology',
        sub: 'CIRCUIT NODE FREQUENCY CLOCK',
        badgeColor: 'bg-blue-950/80 text-blue-400 border-blue-500/40',
        lensGlow: 'border-blue-500/40 bg-blue-500/10 shadow-[0_0_20px_rgba(59,130,246,0.2)]',
        btnBg: 'bg-blue-600 hover:bg-blue-500',
        textHighlight: 'text-blue-400',
      }
    : isCivil
    ? {
        name: 'Civil Technology',
        sub: 'BLUEPRINT ELEVATION SCHEMATIC',
        badgeColor: 'bg-cyan-950/80 text-cyan-400 border-cyan-500/40',
        lensGlow: 'border-cyan-500/40 bg-cyan-500/10 shadow-[0_0_20px_rgba(6,182,212,0.2)]',
        btnBg: 'bg-cyan-600 hover:bg-cyan-500',
        textHighlight: 'text-cyan-400',
      }
    : isMechanical
    ? {
        name: 'Mechanical Technology',
        sub: 'PRECISION GEAR CNC CLOCK',
        badgeColor: 'bg-amber-950/80 text-amber-400 border-amber-500/40',
        lensGlow: 'border-amber-500/40 bg-amber-500/10 shadow-[0_0_20px_rgba(245,158,11,0.2)]',
        btnBg: 'bg-amber-600 hover:bg-amber-500',
        textHighlight: 'text-amber-400',
      }
    : {
        name: departmentName,
        sub: 'POLYTECHNIC SCHEDULE CLOCK',
        badgeColor: 'bg-neutral-800 text-neutral-300 border-neutral-700',
        lensGlow: 'border-white/20 bg-white/5 shadow-[0_0_15px_rgba(255,255,255,0.1)]',
        btnBg: 'bg-blue-600 hover:bg-blue-500',
        textHighlight: 'text-white',
      };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm bg-[#111418] text-white rounded-[32px] shadow-2xl overflow-hidden border border-neutral-800 flex flex-col select-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Department Background Inside The Clock Screen */}
        {isComputer ? (
          /* Matrix Rain Canvas & Cyber Terminal lines */
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 opacity-40">
            <canvas ref={matrixCanvasRef} className="w-full h-full" />
            <div className="absolute top-2 left-4 text-[10px] font-mono text-emerald-400/80">
              &gt; CST_ALARM_CORE [ONLINE]
            </div>
            <div className="absolute bottom-16 right-4 text-[10px] font-mono text-emerald-400/80">
              01000011 01010011 01010100
            </div>
          </div>
        ) : isElectrical ? (
          /* Glowing Electrical Circuit Background */
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 opacity-30">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `radial-gradient(rgba(59, 130, 246, 0.7) 1.5px, transparent 1.5px)`,
                backgroundSize: '24px 24px',
              }}
            />
            <div className="absolute top-3 left-4 text-[10px] font-mono text-blue-400">
              ⚡ 50Hz • 230V AC
            </div>
          </div>
        ) : isCivil ? (
          /* Architectural Blueprint Grid */
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 opacity-30">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `linear-gradient(to right, rgba(6, 182, 212, 0.5) 1px, transparent 1px), linear-gradient(to bottom, rgba(6, 182, 212, 0.5) 1px, transparent 1px)`,
                backgroundSize: '24px 24px',
              }}
            />
            <div className="absolute top-3 left-4 text-[10px] font-mono text-cyan-400">
              📐 BLUEPRINT 1:100
            </div>
          </div>
        ) : isMechanical ? (
          /* Mechanical Precision Gear Blueprint */
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 opacity-30">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `linear-gradient(45deg, rgba(245, 158, 11, 0.5) 1px, transparent 1px)`,
                backgroundSize: '28px 28px',
              }}
            />
            <div className="absolute top-3 left-4 text-[10px] font-mono text-amber-400">
              ⚙️ CNC MODULE m=4
            </div>
          </div>
        ) : null}

        {/* Top Header */}
        <div className="relative z-10 px-5 pt-4 pb-2 flex items-center justify-between border-b border-white/10 bg-black/30 backdrop-blur-sm">
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white transition rounded-full hover:bg-white/10"
            aria-label="Cancel"
          >
            <X className="w-6 h-6 stroke-[2]" />
          </button>

          <div className="text-center">
            <h2 className="text-base font-semibold text-white tracking-wide">{title}</h2>
            <div
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium border mt-0.5 ${deptTheme.badgeColor}`}
            >
              <span>{deptTheme.sub}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleConfirm}
            className={`p-1.5 transition rounded-full hover:bg-white/10 ${deptTheme.textHighlight}`}
            aria-label="Confirm time"
          >
            <Check className="w-6 h-6 stroke-[2.5]" />
          </button>
        </div>

        {/* Column Labels: AM/PM, H, M */}
        <div className="relative z-10 px-8 pt-4 pb-1 grid grid-cols-3 text-center text-xs font-mono font-bold text-neutral-400">
          <div>PERIOD</div>
          <div>HOURS (H)</div>
          <div>MINUTES (M)</div>
        </div>

        {/* PURE SCROLLING DRUM WHEEL PICKER (No +- buttons, pure wheel/touch scroll) */}
        <div className="relative z-10 px-4 py-2 flex items-center justify-center my-2">
          {/* Glassy Center Lens Highlight (Shows the selected time) */}
          <div
            className={`pointer-events-none absolute left-4 right-4 h-[52px] rounded-2xl border-y z-20 backdrop-blur-none ${deptTheme.lensGlow}`}
            style={{
              top: '50%',
              transform: 'translateY(-50%)',
            }}
          />

          {/* Top & Bottom Fade Gradients to create 3D Drum Wheel effect */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-[#111418] to-transparent z-20" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#111418] to-transparent z-20" />

          {/* Three Pure Scroll Columns */}
          <div
            className="w-full grid grid-cols-3 gap-2"
            style={{ height: `${CONTAINER_HEIGHT}px` }}
          >
            {/* Column 1: AM / PM Scroll Wheel */}
            <div
              ref={periodRef}
              onScroll={handlePeriodScroll}
              className="h-full overflow-y-auto scroll-smooth snap-y snap-mandatory scrollbar-none flex flex-col items-center select-none"
            >
              {/* Spacers to center items */}
              <div style={{ height: `${ITEM_HEIGHT * 2}px` }} className="shrink-0" />

              {periodsList.map((p) => {
                const isSelected = selectedPeriod === p;
                return (
                  <div
                    key={p}
                    onClick={() => scrollToPeriod(p)}
                    style={{ height: `${ITEM_HEIGHT}px` }}
                    className={`shrink-0 flex items-center justify-center snap-center cursor-pointer font-bold text-2xl transition-all duration-150 ${
                      isSelected
                        ? 'text-white scale-110 drop-shadow-md'
                        : 'text-neutral-500 opacity-40 hover:opacity-80 scale-90'
                    }`}
                  >
                    {p}
                  </div>
                );
              })}

              <div style={{ height: `${ITEM_HEIGHT * 2}px` }} className="shrink-0" />
            </div>

            {/* Column 2: Hours (1 to 12) Scroll Wheel */}
            <div
              ref={hourRef}
              onScroll={handleHourScroll}
              className="h-full overflow-y-auto scroll-smooth snap-y snap-mandatory scrollbar-none flex flex-col items-center select-none font-mono"
            >
              <div style={{ height: `${ITEM_HEIGHT * 2}px` }} className="shrink-0" />

              {hoursList.map((h) => {
                const isSelected = selectedHour === h;
                const formatted = h < 10 ? `0${h}` : `${h}`;
                return (
                  <div
                    key={h}
                    onClick={() => scrollToHour(h)}
                    style={{ height: `${ITEM_HEIGHT}px` }}
                    className={`shrink-0 flex items-center justify-center snap-center cursor-pointer text-3xl transition-all duration-150 ${
                      isSelected
                        ? 'text-white font-black text-4xl scale-110 drop-shadow-md'
                        : 'text-neutral-500 font-medium opacity-40 hover:opacity-80 scale-90'
                    }`}
                  >
                    {formatted}
                  </div>
                );
              })}

              <div style={{ height: `${ITEM_HEIGHT * 2}px` }} className="shrink-0" />
            </div>

            {/* Column 3: Minutes (00 to 59) Scroll Wheel */}
            <div
              ref={minuteRef}
              onScroll={handleMinuteScroll}
              className="h-full overflow-y-auto scroll-smooth snap-y snap-mandatory scrollbar-none flex flex-col items-center select-none font-mono"
            >
              <div style={{ height: `${ITEM_HEIGHT * 2}px` }} className="shrink-0" />

              {minutesList.map((m) => {
                const isSelected = selectedMinute === m;
                const formatted = m < 10 ? `0${m}` : `${m}`;
                return (
                  <div
                    key={m}
                    onClick={() => scrollToMinute(m)}
                    style={{ height: `${ITEM_HEIGHT}px` }}
                    className={`shrink-0 flex items-center justify-center snap-center cursor-pointer text-3xl transition-all duration-150 ${
                      isSelected
                        ? 'text-white font-black text-4xl scale-110 drop-shadow-md'
                        : 'text-neutral-500 font-medium opacity-40 hover:opacity-80 scale-90'
                    }`}
                  >
                    {formatted}
                  </div>
                );
              })}

              <div style={{ height: `${ITEM_HEIGHT * 2}px` }} className="shrink-0" />
            </div>
          </div>
        </div>

        {/* Selected Time Banner */}
        <div className="relative z-10 px-6 py-2 text-center border-t border-white/10 bg-black/40">
          <div className="text-[11px] font-mono text-neutral-400">
            Selected Time: <span className="font-bold text-white text-sm">{fullTimeString}</span>
          </div>
          <p className="text-[10px] text-neutral-500 mt-0.5">
            Scroll up/down or swipe to change time
          </p>
        </div>

        {/* Single Confirm Button */}
        <div className="relative z-10 p-4 pt-2">
          <button
            type="button"
            onClick={handleConfirm}
            className={`w-full py-3.5 rounded-2xl text-white font-bold text-sm shadow-lg transition active:scale-[0.99] flex items-center justify-center gap-2 ${deptTheme.btnBg}`}
          >
            <Check className="w-4 h-4 stroke-[2.5]" />
            Set Time: {fullTimeString}
          </button>
        </div>
      </div>
    </div>
  );
};
