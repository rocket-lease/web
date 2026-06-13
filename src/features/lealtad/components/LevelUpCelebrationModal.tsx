import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from '@tanstack/react-router';
import { Trophy, Tag, X } from '@phosphor-icons/react';
import { Button } from '@/ui/button';
import { t } from '@/i18n/es';
import type { BenefitInfo } from '@rocket-lease/contracts';

interface LevelUpCelebrationModalProps {
  open: boolean;
  onClose: () => void;
  oldLevel: string;
  newLevel: string;
  benefits: BenefitInfo[];
}

const LEVEL_LABELS: Record<string, string> = {
  bronze: t('perfil.level.bronze'),
  silver: t('perfil.level.silver'),
  gold: t('perfil.level.gold'),
  platinum: t('perfil.level.platinum'),
};

const LEVEL_COLORS: Record<string, string> = {
  bronze: 'text-amber-600',
  silver: 'text-slate-300',
  gold: 'text-yellow-400',
  platinum: 'text-cyan-300',
};

export function LevelUpCelebrationModal({ open, onClose, newLevel, benefits }: LevelUpCelebrationModalProps) {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => setVisible(true), 50);
      return () => clearTimeout(timer);
    }
    setVisible(false);
  }, [open]);

  if (!open) return null;

  const levelLabel = LEVEL_LABELS[newLevel] ?? newLevel;
  const levelColor = LEVEL_COLORS[newLevel] ?? 'text-brand-400';

  return createPortal(
    <div
      className={`fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm transition-opacity duration-300 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div
        className={`relative mx-4 w-full max-w-sm rounded-2xl bg-surface-1 p-6 shadow-2xl transition-all duration-300 ${
          visible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
        }`}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-surface-2 text-text-muted hover:text-text-primary transition-colors"
          aria-label="Cerrar"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex flex-col items-center text-center">
          <Trophy size={48} className={levelColor} weight="fill" />
          <h2 className="mt-4 text-xl font-bold text-text-primary">{t('lealtad.levelUp.title')}</h2>
          <p className={`mt-1 text-lg font-semibold ${levelColor}`}>
            {t('lealtad.levelUp.subtitle').replace('{level}', levelLabel)}
          </p>
        </div>

        {benefits.length > 0 && (
          <div className="mt-6 space-y-2">
            <p className="text-xs font-medium text-text-secondary">{t('lealtad.levelUp.benefits')}</p>
            <div className="space-y-1.5">
              {benefits.map((benefit, i) => (
                <div key={i} className="flex items-center gap-2 rounded-lg bg-surface-2 px-3 py-2">
                  {benefit.type === 'badge' ? (
                    <Trophy size={16} className="shrink-0 text-success" weight="fill" />
                  ) : (
                    <Tag size={16} className="shrink-0 text-brand-400" weight="fill" />
                  )}
                  <span className="text-xs text-text-primary">{benefit.description}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 grid grid-cols-2 gap-3">
          <Button variant="secondary" onClick={onClose}>
            {t('lealtad.levelUp.close')}
          </Button>
          <Button onClick={() => { onClose(); void navigate({ to: '/perfil/lealtad' }); }}>
            {t('lealtad.levelUp.cta')}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
