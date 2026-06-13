import { useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { Ticket, ArrowRight } from '@phosphor-icons/react'
import { Badge } from '@/ui/badge'
import { t } from '@/i18n/es'
import { fmt } from '@/lib/formatters'
import type { TicketStatus } from '@rocket-lease/contracts'
import { useAdminTickets } from '../hooks/useAdminTickets'

const STATUS_STYLES: Record<TicketStatus, string> = {
  open: 'bg-info text-white border-info',
  under_review: 'bg-warning text-black border-warning',
  resolved: 'bg-success text-white border-success',
  rejected: 'bg-danger text-white border-danger',
}

const STATUS_LABEL_KEYS: Record<TicketStatus, 'admin.tickets.badge.open' | 'admin.tickets.badge.under_review' | 'admin.tickets.badge.resolved' | 'admin.tickets.badge.rejected'> = {
  open: 'admin.tickets.badge.open',
  under_review: 'admin.tickets.badge.under_review',
  resolved: 'admin.tickets.badge.resolved',
  rejected: 'admin.tickets.badge.rejected',
}

const TYPE_LABELS: Record<string, 'tickets.tipo.vehicle_issue' | 'tickets.tipo.counterpart_report' | 'tickets.tipo.support_request'> = {
  vehicle_issue: 'tickets.tipo.vehicle_issue',
  counterpart_report: 'tickets.tipo.counterpart_report',
  support_request: 'tickets.tipo.support_request',
}

type Filter = TicketStatus | 'all'

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all', label: t('admin.tickets.statusFilter.all') },
  { value: 'open', label: t('admin.tickets.badge.open') },
  { value: 'under_review', label: t('admin.tickets.badge.under_review') },
  { value: 'resolved', label: t('admin.tickets.badge.resolved') },
  { value: 'rejected', label: t('admin.tickets.badge.rejected') },
]

export function AdminTicketsPage() {
  const navigate = useNavigate()
  const { data: tickets, isLoading, isError, error } = useAdminTickets()
  const [filter, setFilter] = useState<Filter>('all')

  const apiError = error as { status?: number } | null
  if (apiError?.status === 403) {
    void navigate({ to: '/buscar' })
    return null
  }

  const visible = filter === 'all' ? tickets : tickets?.filter((tk) => tk.status === filter)

  return (
    <div className="flex-1 overflow-y-auto px-4 pb-10 pt-5">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400">
          <Ticket size={22} weight="duotone" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-text-primary">{t('admin.tickets.title')}</h1>
          {tickets && (
            <p className="text-xs text-text-muted">{tickets.length} tickets en total</p>
          )}
        </div>
      </div>

      {/* Filtros */}
      <div className="mb-5 flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {FILTERS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
              filter === value
                ? 'bg-amber-500 text-black'
                : 'bg-surface-2 text-text-secondary hover:text-text-primary'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      {isError && (
        <p className="text-sm text-danger">{t('admin.tickets.error')}</p>
      )}

      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-surface-2" />
          ))}
        </div>
      )}

      {!isLoading && !isError && visible?.length === 0 && (
        <p className="text-sm text-text-muted">{t('admin.tickets.empty')}</p>
      )}

      {!isLoading && !isError && visible && visible.length > 0 && (
        <div className="space-y-2">
          {visible.map((ticket) => (
            <Link
              key={ticket.id}
              to="/tickets/$id"
              params={{ id: ticket.id }}
              className="flex items-center gap-4 rounded-xl bg-surface-1 border border-white/6 px-4 py-3.5 transition-colors active:bg-surface-2"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge className={`${STATUS_STYLES[ticket.status]} shrink-0`}>
                    {t(STATUS_LABEL_KEYS[ticket.status])}
                  </Badge>
                  <span className="text-xs text-text-muted truncate">
                    {t(TYPE_LABELS[ticket.type])}
                  </span>
                </div>
                <p className="text-sm font-medium text-text-primary truncate">
                  {ticket.subject || ticket.description}
                </p>
                <p className="mt-0.5 text-xs text-text-muted">
                  {fmt.dateShort(ticket.createdAt)}
                </p>
              </div>
              <ArrowRight size={16} className="shrink-0 text-text-muted" />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
