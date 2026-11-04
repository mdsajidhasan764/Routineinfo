import React from 'react';

interface DepartmentBackgroundProps {
  departmentName?: string;
}

export const DepartmentBackground: React.FC<DepartmentBackgroundProps> = () => {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none"
    >
      {/* Subtle Dot Grid */}
      <div
        className="absolute inset-0 opacity-[0.20] dark:opacity-[0.08]"
        style={{
          backgroundImage: `radial-gradient(currentColor 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
          color: 'rgba(148, 163, 184, 0.4)',
        }}
      />

      {/* Dark Mode Luminous Mesh Orbs for authentic frosted glass refraction */}
      {/* Top Left: Deep Emerald Glow */}
      <div
        className="absolute -top-36 -left-32 w-96 h-96 sm:w-[580px] sm:h-[580px] rounded-full blur-[110px] sm:blur-[140px] opacity-70 dark:opacity-85 pointer-events-none transition-all duration-700"
        style={{ backgroundColor: 'rgba(16, 185, 129, 0.22)' }}
      />

      {/* Top Right: Electric Cyan & Deep Teal Glow */}
      <div
        className="absolute top-1/4 -right-32 w-80 h-80 sm:w-[520px] sm:h-[520px] rounded-full blur-[110px] sm:blur-[150px] opacity-60 dark:opacity-75 pointer-events-none transition-all duration-700"
        style={{ backgroundColor: 'rgba(20, 184, 166, 0.20)' }}
      />

      {/* Center Left: Subtle Deep Indigo / Slate Accent */}
      <div
        className="absolute top-2/3 -left-20 w-80 h-80 sm:w-[460px] sm:h-[460px] rounded-full blur-[120px] sm:blur-[160px] opacity-40 dark:opacity-65 pointer-events-none transition-all duration-700"
        style={{ backgroundColor: 'rgba(14, 165, 233, 0.16)' }}
      />

      {/* Bottom Center: Luminous Emerald Depth */}
      <div
        className="absolute -bottom-40 left-1/3 w-96 h-96 sm:w-[560px] sm:h-[560px] rounded-full blur-[120px] sm:blur-[160px] opacity-50 dark:opacity-70 pointer-events-none transition-all duration-700"
        style={{ backgroundColor: 'rgba(5, 150, 105, 0.18)' }}
      />
    </div>
  );
};
