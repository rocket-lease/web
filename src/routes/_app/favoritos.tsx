import { createFileRoute } from '@tanstack/react-router'
import { FavoritosPage } from '@/features/favoritos/components/FavoritosPage'

export const Route = createFileRoute('/_app/favoritos')({
  component: FavoritosPage,
})
