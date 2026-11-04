import React from 'react';

interface DepartmentBackgroundProps {
  departmentName?: string;
}

export const DepartmentBackground: React.FC<DepartmentBackgroundProps> = ({
  departmentName = 'Computer Science & Technology',
}) => {
  const deptLower = (departmentName || '').toLowerCase();

  const isComputer =
    deptLower.includes('computer') ||
    deptLower.includes('cst') ||
    deptLower.includes('software') ||
    deptLower.includes('data');

  const isElectrical =
    deptLower.includes('electrical') ||
    deptLower.includes('electronics') ||
    deptLower.includes('et') ||
    deptLower.includes('telecommunication');

  const isCivil =
    deptLower.includes('civil') ||
    deptLower.includes('architecture') ||
    deptLower.includes('construction');

  const isMechanical =
    deptLower.includes('mechanical') ||
    deptLower.includes('automobile') ||
    deptLower.includes('power') ||
    deptLower.includes('rac') ||
    deptLower.includes('mechatronics');

  // Modern atmospheric color palette based on department
  const ambientColors = isComputer
    ? {
        primary: 'rgba(16, 185, 129, 0.12)', // Emerald
        secondary: 'rgba(20, 184, 166, 0.08)', // Teal
        accent: 'rgba(52, 211, 153, 0.05)',
      }
    : isElectrical
    ? {
        primary: 'rgba(59, 130, 246, 0.12)', // Blue
        secondary: 'rgba(99, 102, 241, 0.08)', // Indigo
        accent: 'rgba(147, 197, 253, 0.05)',
      }
    : isCivil
    ? {
        primary: 'rgba(6, 182, 212, 0.12)', // Cyan
        secondary: 'rgba(2, 132, 199, 0.08)', // Sky
        accent: 'rgba(103, 232, 249, 0.05)',
      }
    : isMechanical
    ? {
        primary: 'rgba(245, 158, 11, 0.12)', // Amber
        secondary: 'rgba(249, 115, 22, 0.08)', // Orange
        accent: 'rgba(252, 211, 77, 0.05)',
      }
    : {
        primary: 'rgba(16, 185, 129, 0.10)',
        secondary: 'rgba(59, 130, 246, 0.08)',
        accent: 'rgba(148, 163, 184, 0.05)',
      };

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none"
    >
      {/* Ultra-subtle modern dot grid */}
      <div
        className="absolute inset-0 opacity-[0.25] dark:opacity-[0.18]"
        style={{
          backgroundImage: `radial-gradient(currentColor 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
          color: 'var(--grid-color, rgba(148, 163, 184, 0.4))',
        }}
      />

      {/* Modern Ambient Mesh Light Blobs - Zero Text, Pure Sleek Aesthetics */}
      <div
        className="absolute -top-32 -left-32 w-96 h-96 sm:w-[500px] sm:h-[500px] rounded-full blur-[100px] sm:blur-[130px] transition-all duration-700"
        style={{ backgroundColor: ambientColors.primary }}
      />

      <div
        className="absolute top-1/3 -right-32 w-80 h-80 sm:w-[450px] sm:h-[450px] rounded-full blur-[100px] sm:blur-[140px] transition-all duration-700"
        style={{ backgroundColor: ambientColors.secondary }}
      />

      <div
        className="absolute -bottom-32 left-1/4 w-80 h-80 sm:w-[500px] sm:h-[500px] rounded-full blur-[110px] sm:blur-[150px] transition-all duration-700"
        style={{ backgroundColor: ambientColors.accent }}
      />
    </div>
  );
};
