import { PageHeader } from '@/features/layout/components/PageHeader'
import { NotificationBell } from '@/features/notificaciones/components/NotificationBell'
import { FaqSearch } from './FaqSearch'
import { FaqCategoryTabs } from './FaqCategoryTabs'
import { FaqAccordion } from './FaqAccordion'
import { MisTicketsSection } from './MisTicketsSection'
import { SoporteContactCard } from './SoporteContactCard'
import { useFaq } from '../hooks/useFaq'

export function SoportePage() {
  const {
    query,
    setQuery,
    activeCategory,
    setActiveCategory,
    filtered,
    categories,
    isEmpty,
  } = useFaq()

  return (
    <div className="flex flex-col min-h-full">
      <PageHeader
        title="Soporte"
        actions={<NotificationBell />}
      />

      {/* Sticky search + category tabs (se fija bajo la muesca al scrollear) */}
      <div
        className="sticky z-30 bg-surface-0/95 backdrop-blur-xl border-b border-white/6 px-4 pt-4 pb-3 space-y-3"
        style={{ top: 'env(safe-area-inset-top, 0px)' }}
      >
        <FaqSearch value={query} onChange={setQuery} />
        <FaqCategoryTabs
          categories={categories}
          activeCategory={activeCategory}
          onSelect={setActiveCategory}
        />
      </div>

      {/* Content */}
      <div className="flex-1 px-4 py-4 space-y-4 pb-6">
        {/* Result count */}
        {!isEmpty && (
          <p className="text-xs text-text-muted">
            {filtered.length} {filtered.length === 1 ? 'pregunta' : 'preguntas'}
            {query && <> para <span className="text-text-primary font-medium">"{query}"</span></>}
          </p>
        )}

        <FaqAccordion
          items={filtered}
          query={query}
          onClearSearch={() => {
            setQuery('')
            setActiveCategory('all')
          }}
        />

        <MisTicketsSection />

        <SoporteContactCard />
      </div>
    </div>
  )
}
