import { useEffect, useState } from 'react'
import { Button } from '@/ui/button'
import { Input } from '@/ui/input'
import { t } from '@/i18n/es'
import type { PricingDiscountTier } from '@rocket-lease/contracts'

export interface DiscountTiersEditorProps {
  value: PricingDiscountTier[]
  onChange: (value: PricingDiscountTier[]) => void
  disabled?: boolean
}

const DEFAULT_TIER: PricingDiscountTier = {
  minimumDays: 7,
  discountPercentage: 5,
}

export function normalizeDiscountTiers(
  tiers: PricingDiscountTier[],
): PricingDiscountTier[] {
  return tiers
    .map((tier) => ({
      minimumDays: Math.max(
        1,
        Math.trunc(Number(tier.minimumDays) || 0),
      ),
      discountPercentage: Math.min(
        50,
        Math.max(
          1,
          Math.trunc(Number(tier.discountPercentage) || 0),
        ),
      ),
    }))
    .sort((left, right) => left.minimumDays - right.minimumDays)
}

export function areDiscountTiersValid(
  tiers: PricingDiscountTier[],
): boolean {
  if (tiers.length === 0) return true

  for (let index = 0; index < tiers.length; index += 1) {
    const current = tiers[index]

    if (
      !Number.isInteger(current.minimumDays) ||
      current.minimumDays < 1
    ) {
      return false
    }

    if (
      !Number.isInteger(current.discountPercentage) ||
      current.discountPercentage < 1 ||
      current.discountPercentage > 50
    ) {
      return false
    }

    if (index === 0) continue

    const previous = tiers[index - 1]

    if (current.minimumDays <= previous.minimumDays) {
      return false
    }

    if (
      current.discountPercentage <
      previous.discountPercentage
    ) {
      return false
    }
  }

  return true
}

export function getDiscountTiersValidationError(
  tiers: PricingDiscountTier[],
): string | null {
  if (tiers.length === 0) return null

  for (let index = 1; index < tiers.length; index += 1) {
    const previous = tiers[index - 1]
    const current = tiers[index]

    if (current.minimumDays <= previous.minimumDays) {
      return 'Los días mínimos deben ser crecientes.'
    }

    if (
      current.discountPercentage <
      previous.discountPercentage
    ) {
      return 'Los descuentos deben aumentar a medida que aumentan los días.'
    }
  }

  return null
}

type DraftTier = {
  minimumDays: string
  discountPercentage: string
}

export function DiscountTiersEditor({
  value,
  onChange,
  disabled = false,
}: DiscountTiersEditorProps) {
  const tiers = value.length > 0 ? value : []

  const [draftTiers, setDraftTiers] = useState<DraftTier[]>([])

  useEffect(() => {
    setDraftTiers(
      tiers.map((tier) => ({
        minimumDays: String(tier.minimumDays),
        discountPercentage: String(tier.discountPercentage),
      })),
    )
  }, [tiers])

  const validationError =
    getDiscountTiersValidationError(tiers)

  const valid = validationError === null

  const commitTier = (index: number) => {
    const next = draftTiers.map((tier) => ({
      minimumDays: Math.max(
        1,
        Number(tier.minimumDays || 0),
      ),
      discountPercentage: Math.max(
        1,
        Math.min(
          50,
          Number(tier.discountPercentage || 0),
        ),
      ),
    }))

    onChange(normalizeDiscountTiers(next))
  }

  const addTier = () => {
    onChange(
      normalizeDiscountTiers([
        ...tiers,
        DEFAULT_TIER,
      ]),
    )
  }

  const removeTier = (index: number) => {
    onChange(
      tiers.filter(
        (_, currentIndex) => currentIndex !== index,
      ),
    )
  }

  return (
    <div className="space-y-3 rounded-2xl border border-white/8 bg-surface-2 p-4">
      <div className="space-y-1">
        <p className="text-sm font-semibold text-text-primary">
          {t('vehiculo.discountTiers.title')}
        </p>
        <p className="text-xs text-text-muted">
          {t('vehiculo.discountTiers.description')}
        </p>
      </div>

      <div className="space-y-3">
        {tiers.length === 0 ? (
          <p className="text-sm text-text-muted">
            {t('vehiculo.discountTiers.empty')}
          </p>
        ) : null}

        {tiers.map((tier, index) => {
          const previousDays =
            index > 0
              ? tiers[index - 1].minimumDays
              : null

          return (
            <div
              key={`${tier.minimumDays}-${index}`}
              className="rounded-xl border border-white/8 bg-surface-1 p-3"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-text-primary">
                  {t(
                    'vehiculo.discountTiers.tierLabel',
                  ).replace(
                    '{index}',
                    String(index + 1),
                  )}
                </p>

                <button
                  type="button"
                  onClick={() => removeTier(index)}
                  disabled={disabled}
                  className="text-xs font-medium text-text-muted hover:text-danger disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {t('general.delete')}
                </button>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-text-secondary">
                    {t(
                      'vehiculo.discountTiers.minimumDays',
                    )}
                  </label>

                  <Input
                    type="number"
                    min="1"
                    step="1"
                    disabled={disabled}
                    value={
                      draftTiers[index]?.minimumDays ??
                      ''
                    }
                    onChange={(event) => {
                      const next = [...draftTiers]

                      next[index] = {
                        ...next[index],
                        minimumDays:
                          event.target.value,
                      }

                      setDraftTiers(next)
                    }}
                    onBlur={() => commitTier(index)}
                  />

                  {previousDays !== null ? (
                    <p className="text-[11px] text-text-muted">
                      {t(
                        'vehiculo.discountTiers.afterPrevious',
                      ).replace(
                        '{days}',
                        String(previousDays),
                      )}
                    </p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-text-secondary">
                    {t(
                      'vehiculo.discountTiers.discountPercentage',
                    )}
                  </label>

                  <Input
                    type="number"
                    min="1"
                    max="50"
                    step="1"
                    disabled={disabled}
                    value={
                      draftTiers[index]
                        ?.discountPercentage ?? ''
                    }
                    onChange={(event) => {
                      const next = [...draftTiers]

                      next[index] = {
                        ...next[index],
                        discountPercentage:
                          event.target.value,
                      }

                      setDraftTiers(next)
                    }}
                    onBlur={() => commitTier(index)}
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex items-center justify-between gap-3">
        <p
          className={`text-xs ${
            valid
              ? 'text-text-muted'
              : 'text-danger'
          }`}
        >
          {valid
            ? t(
                'vehiculo.discountTiers.validHint',
              )
            : validationError}
        </p>

        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={addTier}
          disabled={disabled}
        >
          {t('vehiculo.discountTiers.add')}
        </Button>
      </div>
    </div>
  )
}