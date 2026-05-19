import { createFileRoute } from '@tanstack/react-router'
import { VoucherVerifyPage } from '../features/reservas/components/VoucherVerifyPage'

export const Route = createFileRoute('/voucher/verify/$token')({
  component: VoucherVerifyPage,
})
