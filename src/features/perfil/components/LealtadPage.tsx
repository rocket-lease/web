import { Link } from '@tanstack/react-router'
import { Skeleton } from '@/ui/skeleton'
import { Trophy, CaretRight } from '@phosphor-icons/react'
import { PageHeader } from '@/features/layout/components/PageHeader'
import { t } from '@/i18n/es'
import { useLoyaltyProfile, useLoyaltyTransactions } from '@/features/lealtad/hooks/useLoyaltyProfile'
import { LevelProgressBar } from '@/features/lealtad/components/LevelProgressBar'
import { LevelCard } from '@/features/lealtad/components/LevelCard'
import type { ExperienceTransaction } from '@rocket-lease/contracts'

const LEVELS = [
  { key: 'bronze', label: 'Bronce', color: 'text-amber-600', bgColor: 'bg-amber-500/15', description: 'Nivel inicial. Completá tus primeras reservas para subir.' },
  { key: 'silver', label: 'Plata', color: 'text-slate-300', bgColor: 'bg-slate-300/15', description: 'Miembro activo con historial sólido.' },
  { key: 'gold', label: 'Oro', color: 'text-yellow-400', bgColor: 'bg-yellow-400/15', description: 'Usuario de confianza con excelente reputación.' },
  { key: 'platinum', label: 'Platino', color: 'text-cyan-300', bgColor: 'bg-cyan-300/15', description: 'Nivel máximo. Acceso a beneficios exclusivos.' },
] as const

function formatDateRange(startAt: string, endAt: string) {
  const start = new Date(startAt)
  const end = new Date(endAt)
  const opts: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short', timeZone: 'America/Argentina/Buenos_Aires' }
  const fmt = new Intl.DateTimeFormat('es-AR', opts)
  return `${fmt.format(start)} - ${fmt.format(end)}`
}

export function LealtadPage() {
  const { data: profile, isLoading } = useLoyaltyProfile()
  const { data: transactions } = useLoyaltyTransactions()

  const currentIndex = LEVELS.findIndex((l) => l.key === profile?.level)
  const pendingCount = transactions?.filter((tx: ExperienceTransaction) => tx.status === 'pending').length ?? 0

  return (
    <div className="flex flex-col pb-6">
      <PageHeader title={t('lealtad.title')} showBack sticky />

      {isLoading && (
        <div className="px-4 mt-6 space-y-5">
          <Skeleton className="h-20 w-full rounded-2xl" />
          <Skeleton className="h-28 w-full rounded-2xl" />
        </div>
      )}

      {profile && (
        <>
          {/* Barra de progreso */}
          <div className="px-4 mt-6">
            <LevelProgressBar
              totalXp={profile.totalXp}
              xpForNextLevel={profile.xpForNextLevel}
              progress={profile.progress}
              pendingXp={profile.pendingXp}
              pendingCount={pendingCount}
              level={profile.level}
            />
          </div>

          {/* Nivel actual card */}
          <div className="px-4 mt-5">
            {(() => {
              const current = LEVELS[currentIndex]
              if (!current) return null
              return (
                <div className={`rounded-2xl ${current.bgColor} border border-white/8 p-6 flex items-center gap-4`}>
                  <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-black/20`}>
                    <Trophy size={28} className={current.color} weight="fill" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-text-secondary">{t('lealtad.currentLevel')}</p>
                    <p className={`text-2xl font-bold ${current.color}`}>{current.label}</p>
                    <p className="text-sm text-text-secondary mt-0.5">{current.description}</p>
                  </div>
                </div>
              )
            })()}
          </div>

          {/* Beneficios activos */}
          {profile.benefits.length > 0 && (
            <div className="px-4 mt-6">
              <p className="text-xs font-medium text-text-secondary mb-3">
                {t('lealtad.benefits.title').replace('{level}', LEVELS[currentIndex]?.label ?? profile.level)}
              </p>
              <div className="space-y-1.5">
                {profile.benefits.map((benefit, i) => (
                  <div key={i} className="flex items-center gap-2 rounded-lg bg-surface-1 px-3 py-2.5">
                    <Trophy size={14} className="shrink-0 text-success" weight="fill" />
                    <span className="text-xs text-text-primary">{benefit.description}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Todos los niveles */}
          <div className="px-4 mt-8">
            <p className="text-xs font-medium text-text-secondary mb-3">{t('perfil.lealtad.allLevels')}</p>
            <div className="space-y-2">
              {LEVELS.map((level, i) => (
                <LevelCard
                  key={level.key}
                  label={level.label}
                  color={level.color}
                  bgColor={level.bgColor}
                  isActive={level.key === profile.level}
                  isUnlocked={i <= currentIndex}
                  description={level.description}
                />
              ))}
            </div>
          </div>

          {/* Transacciones recientes */}
          {transactions && transactions.length > 0 && (
            <div className="px-4 mt-8">
              <p className="text-xs font-medium text-text-secondary mb-3">{t('lealtad.transactions')}</p>
              <div className="space-y-1.5">
                {transactions.slice(0, 10).map((tx: ExperienceTransaction) => (
                  <div key={tx.id} className="rounded-lg bg-surface-1 px-3 py-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-text-primary truncate">{tx.reservation.vehicleName}</p>
                        <p className="text-[11px] text-text-muted mt-0.5">
                          {formatDateRange(tx.reservation.startAt, tx.reservation.endAt)}
                        </p>
                      </div>
                      <div className="shrink-0 text-right ml-3">
                        <span className={`text-xs font-semibold tabular-nums ${tx.status === 'pending' ? 'text-warning' : 'text-success'}`}>
                          +{tx.amount.toLocaleString('es-AR')} XP
                        </span>
                        <p className={`text-[10px] mt-0.5 ${tx.status === 'pending' ? 'text-warning/70' : 'text-text-muted'}`}>
                          {tx.status === 'pending' ? t('lealtad.transaction.pending') : t('lealtad.transaction.claimed')}
                        </p>
                      </div>
                    </div>
                    {tx.status === 'pending' && (
                      <Link
                        to="/reservas/$id"
                        params={{ id: tx.reservation.id }}
                        className="mt-2 flex items-center gap-1 text-xs font-semibold text-client hover:text-client/80 transition-colors"
                      >
                        {t('lealtad.leaveReview')}
                        <CaretRight size={12} weight="bold" />
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
