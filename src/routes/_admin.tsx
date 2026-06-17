import { createFileRoute, Outlet, Link, useRouterState } from '@tanstack/react-router'
import { ArrowLeft, ShieldCheck, Ticket, MapTrifold, UserCircle } from '@phosphor-icons/react'
import { useIsAdmin } from '@/features/admin/hooks/useIsAdmin'
import { t } from '@/i18n/es'

const ADMIN_TABS = [
  { to: '/tickets',       icon: Ticket,       labelKey: 'admin.nav.tickets' as const },
  { to: '/admin/pricing', icon: MapTrifold,   labelKey: 'admin.nav.pricing' as const },
  { to: '/admin/perfil',  icon: UserCircle,   labelKey: 'admin.nav.perfil'  as const },
]

function AdminLayout() {
  const { isAdmin, isLoading } = useIsAdmin()
  const pathname = useRouterState({ select: (s) => s.location.pathname })

  if (isLoading) {
    return <div className="min-h-dvh bg-surface-0" />
  }

  if (!isAdmin) {
    window.location.href = '/buscar'
    return null
  }

  function isActive(to: string) {
    if (to === '/tickets') return pathname === '/tickets' || pathname.startsWith('/tickets/')
    return pathname.startsWith(to)
  }

  return (
    <div className="flex h-dvh flex-col bg-surface-0">
      {/* Admin top bar — solo branding */}
      <div
        className="shrink-0 border-b border-white/6 bg-surface-0/95 backdrop-blur-sm flex items-center gap-2 px-4 py-3"
        style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 0.75rem)' }}
      >
        <Link
          to="/buscar"
          aria-label={t('admin.portal.back')}
          className="-ml-1.5 flex h-8 w-8 items-center justify-center rounded-full text-text-secondary transition-transform active:scale-90"
        >
          <ArrowLeft size={20} weight="bold" />
        </Link>
        <ShieldCheck size={18} weight="duotone" className="text-amber-400" />
        <span className="text-sm font-semibold text-amber-400">
          {t('admin.portal.title')}
        </span>
      </div>

      {/* Page content */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden pb-[calc(env(safe-area-inset-bottom,0px)+4rem)]">
        <Outlet />
      </div>

      {/* Bottom nav — misma estructura que BottomNav general */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 bottom-nav"
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 8px)' }}
      >
        <div className="flex w-full">
          {ADMIN_TABS.map(({ to, icon: Icon, labelKey }) => {
            const active = isActive(to)
            return (
              <Link
                key={to}
                to={to}
                className="flex flex-1 flex-col items-center justify-center gap-1 py-3 transition-colors duration-150"
              >
                <Icon
                  size={22}
                  weight={active ? 'duotone' : 'regular'}
                  className={active ? 'text-amber-400' : 'text-text-muted'}
                />
                <span className={`text-[10px] font-medium leading-none ${active ? 'text-amber-400' : 'text-text-muted'}`}>
                  {t(labelKey)}
                </span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}

export const Route = createFileRoute('/_admin')({
  component: AdminLayout,
})
