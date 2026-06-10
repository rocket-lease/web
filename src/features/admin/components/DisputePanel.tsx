import { useState } from 'react'
import { toast } from 'sonner'
import { Gavel, Info, Warning } from '@phosphor-icons/react'
import { Button } from '@/ui/button'
import { t } from '@/i18n/es'
import type { DisputeResolutionResponse, PenaltyType } from '@rocket-lease/contracts'
import { useDisputeActions } from '../hooks/useDisputeActions'

interface DisputePanelProps {
  ticketId: string
  dispute: DisputeResolutionResponse
  ticketStatus: 'open' | 'under_review' | 'resolved' | 'rejected'
  conductorId: string
  rentadorId: string
}

const DISPUTE_STATUS_LABELS: Record<DisputeResolutionResponse['status'], string> = {
  escalated: t('dispute.status.escalated'),
  awaiting_info: t('dispute.status.awaiting_info'),
  ruled: t('dispute.status.ruled'),
  appealed: t('dispute.status.appealed'),
  closed: t('dispute.status.closed'),
}

export function DisputePanel({ ticketId, dispute, ticketStatus, conductorId, rentadorId }: DisputePanelProps) {
  const { requestInfo, issueVerdict } = useDisputeActions(ticketId)

  const [infoTarget, setInfoTarget] = useState<'conductor' | 'rentador'>('conductor')
  const [infoMessage, setInfoMessage] = useState('')
  const [showInfoForm, setShowInfoForm] = useState(false)

  const [showVerdictForm, setShowVerdictForm] = useState(false)
  const [verdictText, setVerdictText] = useState('')
  const [responsibleUserId, setResponsibleUserId] = useState('')
  const [penaltyType, setPenaltyType] = useState<PenaltyType | 'none'>('none')
  const [penaltyAmount, setPenaltyAmount] = useState('')
  const [penaltyPercentage, setPenaltyPercentage] = useState('')

  const isFinal =
    dispute.status === 'ruled' ||
    dispute.status === 'closed' ||
    ticketStatus === 'resolved' ||
    ticketStatus === 'rejected'

  async function handleRequestInfo() {
    if (!infoMessage.trim() || requestInfo.isPending) return
    const targetParticipantId = infoTarget === 'conductor' ? conductorId : rentadorId
    try {
      await requestInfo.mutateAsync({ targetParticipantId, message: infoMessage.trim() })
      setInfoMessage('')
      setShowInfoForm(false)
      toast.success('Solicitud enviada. Plazo: 48 horas.')
    } catch {
      toast.error('No se pudo enviar la solicitud.')
    }
  }

  async function handleVerdict() {
    if (!verdictText.trim() || issueVerdict.isPending) return
    const penalty =
      penaltyType === 'none'
        ? null
        : penaltyType === 'fixed'
          ? { type: 'fixed' as const, amountCents: Math.round(parseFloat(penaltyAmount) * 100) }
          : { type: 'percentage' as const, percentage: parseFloat(penaltyPercentage) }

    try {
      await issueVerdict.mutateAsync({
        verdict: verdictText.trim(),
        responsibleUserId: responsibleUserId.trim() || null,
        penalty,
      })
      setShowVerdictForm(false)
      toast.success('Fallo emitido.')
    } catch {
      toast.error('No se pudo emitir el fallo.')
    }
  }

  return (
    <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Gavel size={16} weight="duotone" className="text-amber-400" />
          <p className="text-sm font-semibold text-amber-400">Disputa activa</p>
        </div>
        <span className="rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-semibold text-amber-300">
          {DISPUTE_STATUS_LABELS[dispute.status]}
        </span>
      </div>

      {/* Info deadline */}
      {dispute.status === 'awaiting_info' && dispute.infoDeadlineAt && (
        <div className="flex items-center gap-2 rounded-xl bg-surface-2 px-3 py-2">
          <Info size={14} className="text-warning shrink-0" />
          <p className="text-xs text-text-secondary">
            {t('admin.disputa.plazo')}: {new Date(dispute.infoDeadlineAt).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' })}
          </p>
        </div>
      )}

      {/* Verdict info */}
      {(dispute.status === 'ruled' || dispute.status === 'appealed' || dispute.status === 'closed') && dispute.verdict && (
        <div className="rounded-xl bg-surface-2 px-3 py-2 space-y-1">
          <p className="text-xs font-semibold text-text-secondary">Fallo:</p>
          <p className="text-xs text-text-primary">{dispute.verdict}</p>
          {dispute.penaltyAmountCents !== null && (
            <p className="text-xs text-danger">
              Penalización: ${(dispute.penaltyAmountCents / 100).toFixed(2)}
              {dispute.responsibleUserId && ` — responsable: ${dispute.responsibleUserId.slice(0, 8)}…`}
            </p>
          )}
          {dispute.appealCount > 0 && (
            <p className="text-xs text-text-muted">Apelaciones usadas: {dispute.appealCount}/1</p>
          )}
        </div>
      )}

      {!isFinal && (
        <div className="space-y-2">
          {/* Solicitar info */}
          {!showVerdictForm && (
            <>
              {!showInfoForm ? (
                <Button
                  size="sm"
                  variant="secondary"
                  className="w-full text-xs border-warning/30 text-warning"
                  onClick={() => setShowInfoForm(true)}
                >
                  {t('admin.disputa.pedirInfo')}
                </Button>
              ) : (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    {(['conductor', 'rentador'] as const).map((role) => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => setInfoTarget(role)}
                        className={`flex-1 rounded-lg px-2 py-1.5 text-xs font-medium capitalize transition-colors ${infoTarget === role ? 'bg-warning text-black' : 'bg-surface-2 text-text-secondary'}`}
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={infoMessage}
                    onChange={(e) => setInfoMessage(e.target.value)}
                    placeholder="Describí qué información se necesita..."
                    rows={3}
                    maxLength={1000}
                    className="w-full resize-none rounded-xl bg-surface-2 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                  <div className="flex gap-2">
                    <Button size="sm" variant="secondary" className="flex-1 text-xs" onClick={() => { setShowInfoForm(false); setInfoMessage('') }}>
                      {t('general.cancel')}
                    </Button>
                    <Button size="sm" className="flex-1 text-xs" disabled={!infoMessage.trim() || requestInfo.isPending} onClick={handleRequestInfo}>
                      {requestInfo.isPending ? 'Enviando...' : 'Enviar solicitud'}
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Emitir fallo */}
          {!showInfoForm && (
            <>
              {!showVerdictForm ? (
                <Button
                  size="sm"
                  variant="secondary"
                  className="w-full text-xs border-amber-500/30 text-amber-400"
                  onClick={() => setShowVerdictForm(true)}
                >
                  {t('admin.disputa.emitirFallo')}
                </Button>
              ) : (
                <div className="space-y-3">
                  <textarea
                    value={verdictText}
                    onChange={(e) => setVerdictText(e.target.value)}
                    placeholder="Describí el fallo y la resolución del caso..."
                    rows={4}
                    maxLength={2000}
                    className="w-full resize-none rounded-xl bg-surface-2 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />

                  <div className="space-y-1.5">
                    <p className="text-xs font-medium text-text-secondary">{t('admin.disputa.responsable')} (ID, opcional)</p>
                    <input
                      type="text"
                      value={responsibleUserId}
                      onChange={(e) => setResponsibleUserId(e.target.value)}
                      placeholder="UUID del usuario responsable"
                      className="w-full rounded-xl bg-surface-2 px-3 py-2 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <p className="text-xs font-medium text-text-secondary">{t('admin.disputa.penalizacion.tipo')}</p>
                    <div className="flex gap-2">
                      {(['none', 'fixed', 'percentage'] as const).map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setPenaltyType(opt)}
                          className={`flex-1 rounded-lg px-2 py-1.5 text-xs font-medium transition-colors ${penaltyType === opt ? 'bg-amber-500 text-black' : 'bg-surface-2 text-text-secondary'}`}
                        >
                          {opt === 'none' ? 'Sin penalización' : opt === 'fixed' ? t('admin.disputa.penalizacion.fija') : t('admin.disputa.penalizacion.porcentaje')}
                        </button>
                      ))}
                    </div>
                  </div>

                  {penaltyType === 'fixed' && (
                    <div className="space-y-1.5">
                      <p className="text-xs font-medium text-text-secondary">Monto (ARS)</p>
                      <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={penaltyAmount}
                        onChange={(e) => setPenaltyAmount(e.target.value)}
                        placeholder="Ej: 5000.00"
                        className="w-full rounded-xl bg-surface-2 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                    </div>
                  )}

                  {penaltyType === 'percentage' && (
                    <div className="space-y-1.5">
                      <p className="text-xs font-medium text-text-secondary">Porcentaje (1–100)</p>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        step="1"
                        value={penaltyPercentage}
                        onChange={(e) => setPenaltyPercentage(e.target.value)}
                        placeholder="Ej: 10"
                        className="w-full rounded-xl bg-surface-2 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                    </div>
                  )}

                  {penaltyType !== 'none' && !responsibleUserId.trim() && (
                    <div className="flex items-center gap-1.5 text-xs text-warning">
                      <Warning size={12} weight="duotone" />
                      <span>Ingresá el ID del responsable para aplicar la penalización</span>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button size="sm" variant="secondary" className="flex-1 text-xs" onClick={() => { setShowVerdictForm(false); setVerdictText(''); setPenaltyType('none') }}>
                      {t('general.cancel')}
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1 text-xs bg-amber-500 text-black hover:bg-amber-400"
                      disabled={
                        !verdictText.trim() ||
                        (penaltyType !== 'none' && !responsibleUserId.trim()) ||
                        (penaltyType === 'fixed' && !penaltyAmount) ||
                        (penaltyType === 'percentage' && !penaltyPercentage) ||
                        issueVerdict.isPending
                      }
                      onClick={handleVerdict}
                    >
                      {issueVerdict.isPending ? 'Enviando...' : 'Emitir fallo'}
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
