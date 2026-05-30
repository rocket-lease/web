import { createFileRoute } from '@tanstack/react-router'
import { AuthGate } from '@/features/auth/components/AuthGate'
import { WalletPage } from '@/features/wallet/components/WalletPage'

function WalletRoute() {
  return (
    <AuthGate>
      <WalletPage />
    </AuthGate>
  )
}

export const Route = createFileRoute('/_app/saldo')({
  component: WalletRoute,
})