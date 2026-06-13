import { createFileRoute } from '@tanstack/react-router'
import { AdminPerfilPage } from '@/features/admin/components/AdminPerfilPage'

export const Route = createFileRoute('/_admin/admin/perfil')({
  component: AdminPerfilPage,
})
