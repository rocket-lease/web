import { Trophy, Star } from '@phosphor-icons/react'
import { PageHeader } from '@/features/layout/components/PageHeader'
import { useMyProfile } from '@/features/perfil/hooks/useMyProfile'
import { t } from '@/i18n/es'

const LEVELS = [
  { key: 'bronze', label: 'Bronce', color: 'text-amber-600', bgColor: 'bg-amber-500/15', description: 'Nivel inicial. Completá tus primeras reservas para subir.' },
  { key: 'silver', label: 'Plata', color: 'text-slate-300', bgColor: 'bg-slate-300/15', description: 'Miembro activo con historial sólido.' },
  { key: 'gold', label: 'Oro', color: 'text-yellow-400', bgColor: 'bg-yellow-400/15', description: 'Usuario de confianza con excelente reputación.' },
  { key: 'platinum', label: 'Platino', color: 'text-cyan-300', bgColor: 'bg-cyan-300/15', description: 'Nivel máximo. Acceso a beneficios exclusivos.' },
] as const

export function LealtadPage() {
  const { data: profile, isLoading } = useMyProfile()

  const currentIndex = LEVELS.findIndex((l) => l.key === profile?.level)
  const current = LEVELS[currentIndex]

  return (
    <div className="flex flex-col pb-6">
      <PageHeader title={t('perfil.lealtad.title')} showBack sticky />

      {isLoading && (
        <div className="px-4 py-8 text-sm text-text-muted">{t('general.loading')}</div>
      )}

      {profile && current && (
        <>
          {/* Nivel actual */}
          <div className="px-4 mt-6">
            <div className={`rounded-2xl ${current.bgColor} border border-white/8 p-6 flex items-center gap-4`}>
              <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-black/20`}>
                <Trophy size={28} className={current.color} weight="fill" />
              </div>
              <div>
                <p className="text-xs font-medium text-text-secondary">Nivel actual</p>
                <p className={`text-2xl font-bold ${current.color}`}>{current.label}</p>
                <p className="text-sm text-text-secondary mt-0.5">{current.description}</p>
              </div>
            </div>
          </div>

          {/* Reputación */}
          <div className="px-4 mt-5">
            <div className="flex items-center gap-3 rounded-xl bg-surface-1 px-4 py-3.5">
              <Star size={20} className="text-warning shrink-0" weight="fill" />
              <div className="flex-1">
                <p className="text-sm font-medium text-text-primary">Reputación</p>
                <p className="text-xs text-text-muted">Basada en reseñas de conductores y rentadores</p>
              </div>
              <p className="text-xl font-bold text-text-primary tabular-nums">{0}</p>
            </div>
          </div>

          {/* Todos los niveles */}
          <div className="px-4 mt-8">
            <p className="text-xs font-medium text-text-secondary mb-3">{t('perfil.lealtad.allLevels')}</p>
            <div className="space-y-2">
              {LEVELS.map((level, i) => {
                const isActive = level.key === profile.level
                const isUnlocked = i <= currentIndex
                return (
                  <div
                    key={level.key}
                    className={`flex items-center gap-3 rounded-xl px-4 py-3 ${isActive ? `${level.bgColor} border border-white/8` : 'bg-surface-1'}`}
                  >
                    <Trophy
                      size={18}
                      className={isUnlocked ? level.color : 'text-text-muted'}
                      weight={isUnlocked ? 'fill' : 'regular'}
                    />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold ${isActive ? level.color : isUnlocked ? 'text-text-primary' : 'text-text-muted'}`}>
                        {level.label}
                      </p>
                      <p className="text-xs text-text-muted truncate">{level.description}</p>
                    </div>
                    {isActive && (
                      <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${level.bgColor} ${level.color}`}>
                        Actual
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
