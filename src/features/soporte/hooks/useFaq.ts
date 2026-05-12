import { useMemo, useState } from 'react'
import { faqData, faqCategories } from '../api/faq.data'
import type { FaqCategoryId, FaqItem } from '../types'

export function useFaq() {
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<FaqCategoryId | 'all'>('all')

  const filtered = useMemo<FaqItem[]>(() => {
    const q = query.trim().toLowerCase()
    return faqData.filter(item => {
      const matchesCategory = activeCategory === 'all' || item.categoryId === activeCategory
      if (!matchesCategory) return false
      if (!q) return true
      return (
        item.question.toLowerCase().includes(q) ||
        item.answer.toLowerCase().includes(q) ||
        item.tags.some(tag => tag.includes(q))
      )
    })
  }, [query, activeCategory])

  return {
    query,
    setQuery,
    activeCategory,
    setActiveCategory,
    filtered,
    categories: faqCategories,
    isEmpty: filtered.length === 0,
    isFiltering: query.length > 0 || activeCategory !== 'all',
  }
}
