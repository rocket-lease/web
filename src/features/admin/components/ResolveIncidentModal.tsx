import { useState } from 'react'
import { toast } from 'sonner'
import { CheckCircle, WarningCircle, X } from '@phosphor-icons/react'
import { Button } from '@/ui/button'
import { t } from '@/i18n/es'
import type { ResolveTicketRequest, TicketResponse } from '@rocket-lease/contracts'
import { useResolveTicket } from '../hooks/useResolveTicket'

interface Props {
  open: boolean
  onClose: () => void
  ticket: TicketResponse
}

type ResolutionType = 'close' | 'fault'
type EconomicType = 'absolute' | 'percentage'

interface PartyForm {
  economicEnabled: boolean
  economicType: EconomicType
  amountCents: string
  percentage: string
  reputationEnabled: boolean
  scoreDeduction: string
}

const emptyParty = (): PartyForm => ({
  economicEnabled: false,
  economicType: 'absolute',
  amountCents: '',
  percentage: '',
  reputationEnabled: false,
  scoreDeduction: '1.0',
})

export function ResolveIncidentModal({ open, onClose, ticket }: Props) {
  const [step, setStep] = useState<ResolutionType | null>(null)
  const [primaryUserId, setPrimaryUserId] = useState(ticket.conductorId ?? ticket.reporterId)
  const [primaryRole, setPrimaryRole] = useState<'conductor' | 'rentador'>(
    ticket.reportedBy === 'rentador' ? 'rentador' : 'conductor',
  )
  const [primary, setPrimary] = useState<PartyForm>(emptyParty())

  const hasCounterpart = Boolean(ticket.conductorId && ticket.rentadorId)
  const counterpartId = ticket.conductorId === primaryUserId ? ticket.rentadorId : ticket.conductorId
  const counterpartRole: 'conductor' | 'rentador' = primaryRole === 'conductor' ? 'rentador' : 'conductor'
  const [counterpart, setCounterpart] = useState<PartyForm>(emptyParty())

  const resolve = useResolveTicket(ticket.id)

  const isReservationTicket = Boolean(ticket.reservationId)

  function handleClose() {
    setStep(null)
    setPrimary(emptyParty())
    setCounterpart(emptyParty())
    onClose()
  }

  function mirrorEconomic() {
    const amount = parseFloat(primary.amountCents)
    if (!isNaN(amount) && amount !== 0) {
      setCounterpart((prev) => ({
        ...prev,
        economicEnabled: true,
        economicType: 'absolute',
        amountCents: String(-amount),
      }))
    }
  }

  function buildPartyImpact(form: PartyForm, userId: string, role: 'conductor' | 'rentador') {
    const economic = form.economicEnabled
      ? form.economicType === 'absolute'
        ? { type: 'absolute' as const, amountCents: Math.round(parseFloat(form.amountCents) * 100) }
        : { type: 'percentage' as const, percentage: parseFloat(form.percentage) }
      : undefined

    const reputation = form.reputationEnabled
      ? { scoreDeduction: parseFloat(form.scoreDeduction) }
      : undefined

    if (!economic && !reputation) return null

    return { userId, role, economic, reputation }
  }

  async function handleSubmit() {
    if (!step) return

    let dto: ResolveTicketRequest

    if (step === 'close') {
      dto = { type: 'close' }
    } else {
      const primaryImpact = buildPartyImpact(primary, primaryUserId ?? ticket.reporterId, primaryRole)
      if (!primaryImpact) {
        toast.error('Configurá al menos un tipo de impacto para el usuario principal.')
        return
      }

      const counterpartImpact =
        hasCounterpart && counterpartId && (counterpart.economicEnabled || counterpart.reputationEnabled)
          ? buildPartyImpact(counterpart, counterpartId, counterpartRole)
          : undefined

      dto = {
        type: 'fault',
        primary: primaryImpact,
        ...(counterpartImpact ? { counterpart: counterpartImpact } : {}),
      }
    }

    try {
      await resolve.mutateAsync(dto)
      toast.success(
        step === 'close' ? t('admin.resolve.success.close') : t('admin.resolve.success.fault'),
      )
      handleClose()
    } catch {
      toast.error(t('admin.resolve.error'))
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 bg-black/60" onClick={handleClose} />
      <div className="relative z-10 w-full max-w-lg rounded-t-3xl sm:rounded-2xl bg-surface-1 border border-white/8 p-5 max-h-[90dvh] overflow-y-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-text-primary">{t('admin.resolve.title')}</h2>
          <button
            onClick={handleClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-surface-2 text-text-muted hover:text-text-primary"
          >
            <X size={14} />
          </button>
        </div>

        {/* Step 1: choose type */}
        {!step && (
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setStep('close')}
              className="flex flex-col items-center gap-2 rounded-2xl border border-white/8 bg-surface-2 p-4 hover:border-text-muted/30 transition-colors"
            >
              <CheckCircle size={28} weight="duotone" className="text-success" />
              <span className="text-sm font-semibold text-text-primary">{t('admin.resolve.close.label')}</span>
              <span className="text-xs text-text-muted text-center">{t('admin.resolve.close.description')}</span>
            </button>
            <button
              onClick={() => setStep('fault')}
              className="flex flex-col items-center gap-2 rounded-2xl border border-white/8 bg-surface-2 p-4 hover:border-warning/30 transition-colors"
            >
              <WarningCircle size={28} weight="duotone" className="text-warning" />
              <span className="text-sm font-semibold text-text-primary">{t('admin.resolve.fault.label')}</span>
              <span className="text-xs text-text-muted text-center">Aplica impactos económicos y/o de reputación.</span>
            </button>
          </div>
        )}

        {/* Step 2: close confirmation */}
        {step === 'close' && (
          <>
            <p className="text-sm text-text-secondary">{t('admin.resolve.close.description')}</p>
            <div className="flex gap-2">
              <Button variant="secondary" className="flex-1" onClick={() => setStep(null)}>
                {t('general.back')}
              </Button>
              <Button
                className="flex-1 bg-success text-white hover:bg-success/90"
                disabled={resolve.isPending}
                onClick={() => void handleSubmit()}
              >
                {resolve.isPending ? 'Confirmando...' : t('admin.resolve.confirm')}
              </Button>
            </div>
          </>
        )}

        {/* Step 2: fault form */}
        {step === 'fault' && (
          <>
            {/* Primary party */}
            <div className="rounded-xl bg-surface-2 p-4 space-y-3">
              <p className="text-sm font-semibold text-amber-400">{t('admin.resolve.fault.primaryParty')}</p>

              {hasCounterpart && (
                <div className="flex gap-2">
                  {(['conductor', 'rentador'] as const).map((role) => (
                    <button
                      key={role}
                      onClick={() => {
                        setPrimaryRole(role)
                        setPrimaryUserId(role === 'conductor' ? ticket.conductorId! : ticket.rentadorId!)
                      }}
                      className={`flex-1 rounded-lg py-1.5 text-xs font-semibold border transition-colors ${
                        primaryRole === role
                          ? role === 'conductor'
                            ? 'border-brand-500 bg-brand-500/10 text-brand-400'
                            : 'border-amber-500 bg-amber-500/10 text-amber-400'
                          : 'border-white/8 text-text-muted'
                      }`}
                    >
                      {role === 'conductor' ? 'Conductor' : 'Rentador'}
                    </button>
                  ))}
                </div>
              )}

              <PartyImpactForm
                form={primary}
                onChange={setPrimary}
                showPercentage={isReservationTicket}
              />
            </div>

            {/* Counterpart */}
            {hasCounterpart && (
              <div className="rounded-xl bg-surface-2 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-text-secondary">{t('admin.resolve.fault.counterpart.label')}</p>
                  <button
                    onClick={mirrorEconomic}
                    className="text-xs text-amber-400 hover:text-amber-300 transition-colors"
                  >
                    {t('admin.resolve.fault.mirrorEconomic')}
                  </button>
                </div>
                <PartyImpactForm
                  form={counterpart}
                  onChange={setCounterpart}
                  showPercentage={false}
                />
              </div>
            )}

            <div className="flex gap-2">
              <Button variant="secondary" className="flex-1" onClick={() => setStep(null)}>
                {t('general.back')}
              </Button>
              <Button
                className="flex-1 bg-warning text-black hover:bg-warning/90"
                disabled={resolve.isPending}
                onClick={() => void handleSubmit()}
              >
                {resolve.isPending ? 'Confirmando...' : t('admin.resolve.confirm')}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

interface PartyImpactFormProps {
  form: PartyForm
  onChange: (update: PartyForm) => void
  showPercentage: boolean
}

function PartyImpactForm({ form, onChange, showPercentage }: PartyImpactFormProps) {
  function set(patch: Partial<PartyForm>) {
    onChange({ ...form, ...patch })
  }

  return (
    <div className="space-y-3">
      {/* Economic */}
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={form.economicEnabled}
          onChange={(e) => set({ economicEnabled: e.target.checked })}
          className="accent-amber-500"
        />
        <span className="text-xs font-medium text-text-secondary">
          {t('admin.resolve.fault.economic.label')}
        </span>
      </label>

      {form.economicEnabled && (
        <div className="pl-4 space-y-2">
          <div className="flex gap-2">
            <button
              onClick={() => set({ economicType: 'absolute' })}
              className={`flex-1 rounded-lg py-1 text-xs font-semibold border transition-colors ${
                form.economicType === 'absolute' ? 'border-amber-500 text-amber-400' : 'border-white/8 text-text-muted'
              }`}
            >
              {t('admin.resolve.fault.economic.type.absolute')}
            </button>
            {showPercentage && (
              <button
                onClick={() => set({ economicType: 'percentage' })}
                className={`flex-1 rounded-lg py-1 text-xs font-semibold border transition-colors ${
                  form.economicType === 'percentage' ? 'border-amber-500 text-amber-400' : 'border-white/8 text-text-muted'
                }`}
              >
                {t('admin.resolve.fault.economic.type.percentage')}
              </button>
            )}
          </div>

          {form.economicType === 'absolute' ? (
            <>
              <input
                type="number"
                step="0.01"
                value={form.amountCents}
                onChange={(e) => set({ amountCents: e.target.value })}
                placeholder="Ej: -5000.00"
                className="w-full rounded-xl bg-surface-0 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
              <p className="text-xs text-text-muted">{t('admin.resolve.fault.economic.amountHint')}</p>
            </>
          ) : (
            <input
              type="number"
              min="1"
              max="100"
              value={form.percentage}
              onChange={(e) => set({ percentage: e.target.value })}
              placeholder="Ej: 10"
              className="w-full rounded-xl bg-surface-0 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          )}
        </div>
      )}

      {/* Reputation */}
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={form.reputationEnabled}
          onChange={(e) => set({ reputationEnabled: e.target.checked })}
          className="accent-amber-500"
        />
        <span className="text-xs font-medium text-text-secondary">
          {t('admin.resolve.fault.reputation.label')}
        </span>
      </label>

      {form.reputationEnabled && (
        <div className="pl-4">
          <input
            type="number"
            min="0.1"
            max="5"
            step="0.1"
            value={form.scoreDeduction}
            onChange={(e) => set({ scoreDeduction: e.target.value })}
            placeholder="1.0"
            className="w-full rounded-xl bg-surface-0 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
          <p className="mt-1 text-xs text-text-muted">{t('admin.resolve.fault.reputation.deltaLabel')}</p>
        </div>
      )}
    </div>
  )
}
