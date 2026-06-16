import { Trophy } from '@phosphor-icons/react';

interface LevelCardProps {
  label: string;
  color: string;
  bgColor: string;
  isActive: boolean;
  isUnlocked: boolean;
  description: string;
}

export function LevelCard({ label, color, bgColor, isActive, isUnlocked, description }: LevelCardProps) {
  return (
    <div
      className={`flex items-center gap-3 rounded-xl px-4 py-3 ${
        isActive ? `${bgColor} border border-white/8` : 'bg-surface-1'
      }`}
    >
      <Trophy
        size={18}
        className={isUnlocked ? color : 'text-text-muted'}
        weight={isUnlocked ? 'fill' : 'regular'}
      />
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold ${isActive ? color : isUnlocked ? 'text-text-primary' : 'text-text-muted'}`}>
          {label}
        </p>
        <p className="text-xs text-text-muted truncate">{description}</p>
      </div>
      {isActive && (
        <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${bgColor} ${color}`}>
          Actual
        </span>
      )}
    </div>
  );
}
