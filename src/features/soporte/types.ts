import type { LucideIcon } from 'lucide-react'

export type FaqCategoryId = 'reservas' | 'pagos' | 'vehiculos' | 'cuenta' | 'disputas'

export interface FaqItem {
  id: string
  categoryId: FaqCategoryId
  question: string
  answer: string
  tags: string[]
}

export interface FaqCategory {
  id: FaqCategoryId | 'all'
  label: string
  icon: LucideIcon
  count: number
}
