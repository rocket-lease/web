import { Tag } from '@phosphor-icons/react';
import { t } from '@/i18n/es';

interface LevelDiscountBadgeProps {
  discountPercentage: number;
}

export function LevelDiscountBadge({ discountPercentage }: LevelDiscountBadgeProps) {
  const pct = discountPercentage;
  const isHigh = pct >= 10;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${
        isHigh
          ? 'bg-success text-white'
          : 'bg-brand-500/80 text-white'
      }`}
      title={t('vehiculos.levelDiscountTooltip').replace('{level}', '')}
    >
      <Tag size={10} weight="fill" />
      {t('vehiculos.levelDiscount').replace('{pct}', String(pct))}
    </span>
  );
}
