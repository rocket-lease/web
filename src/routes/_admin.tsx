import { createFileRoute, Outlet, Link, useRouterState } from '@tanstack/react-router'
import { ShieldCheck, Ticket, MapTrifold, ArrowLeft } from '@phosphor-icons/react'
import { useIsAdmin } from '@/features/admin/hooks/useIsAdmin'
import { t } from '@/i18n/es'

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

  const isTickets = pathname === '/tickets' || pathname.startsWith('/tickets/')
  const isPricing = pathname.startsWith('/admin/pricing')

  return (
    <div className="flex h-dvh flex-col bg-surface-0">
      {/* Admin top bar */}
      <div
        className="shrink-0 border-b border-white/6 bg-surface-0/95 backdrop-blur-sm"
        style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
      >
        {/* Brand row */}
        <div className="flex items-center justify-between px-4 py-2.5">
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} weight="duotone" className="text-amber-400" />
            <span className="text-sm font-semibold text-amber-400">
              {t('admin.portal.title')}
            </span>
          </div>
          <Link
            to="/buscar"
            className="flex items-center gap-1 text-xs text-text-muted transition-colors hover:text-text-secondary"
          >
            <ArrowLeft size={14} />
            {t('admin.portal.back')}
          </Link>
        </div>

        {/* Tab bar */}
        <div className="flex px-2">
          <Link
            to="/tickets"
            className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
              isTickets
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-text-muted hover:text-text-secondary'
            }`}
          >
            <Ticket size={15} />
            {t('admin.nav.tickets')}
          </Link>
          <Link
            to="/admin/pricing"
            className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
              isPricing
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-text-muted hover:text-text-secondary'
            }`}
          >
            <MapTrifold size={15} />
            {t('admin.nav.pricing')}
          </Link>
        </div>
      </div>

      {/* Page content */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <Outlet />
      </div>
    </div>
  )
}

export const Route = createFileRoute('/_admin')({
  component: AdminLayout,
})
