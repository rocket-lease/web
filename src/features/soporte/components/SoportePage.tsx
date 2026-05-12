import { LifeBuoy } from 'lucide-react'
import { PageHeader } from '@/features/layout/components/PageHeader'
import { FaqSearch } from './FaqSearch'
import { FaqCategoryTabs } from './FaqCategoryTabs'
import { FaqAccordion } from './FaqAccordion'
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
        icon={<LifeBuoy className="h-5 w-5" />}
      />

      {/* Sticky search + category tabs */}
      <div
        className="sticky top-0 z-10 bg-surface-0/95 backdrop-blur-xl border-b border-white/6 px-4 pt-4 pb-3 space-y-3"
      >
        <FaqSearch value={query} onChange={setQuery} />
        <FaqCategoryTabs
          categories={categories}
          activeCategory={activeCategory}
          onSelect={setActiveCategory}
        />
      </div>

      {/* Content */}
      <div className="flex-1 px-4 py-4 space-y-4 pb-24">
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

      </div>
    </div>
  )
}
