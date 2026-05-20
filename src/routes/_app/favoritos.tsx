import { createFileRoute } from '@tanstack/react-router'
import { FavoritosPage } from '@/features/favoritos/components/FavoritosPage'
import { AuthGate } from '@/features/auth/components/AuthGate'

function FavoritosRoute() {
  return (
    <AuthGate>
      <FavoritosPage />
    </AuthGate>
  )
}

export const Route = createFileRoute('/_app/favoritos')({
  component: FavoritosRoute,
})
