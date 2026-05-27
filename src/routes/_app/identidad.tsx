import { createFileRoute } from '@tanstack/react-router'
import { AuthGate } from '@/features/auth/components/AuthGate'
import { IdentityVerificationPage } from '@/features/identity/components/IdentityVerificationPage'

export const Route = createFileRoute('/_app/identidad')({
  component: () => (
    <AuthGate>
      <IdentityVerificationPage />
    </AuthGate>
  ),
})