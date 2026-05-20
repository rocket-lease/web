import { createFileRoute } from '@tanstack/react-router'
import { VoucherReturnPage } from '../features/reservas/components/VoucherReturnPage'

export const Route = createFileRoute('/voucher/return/$token')({
  component: VoucherReturnPage,
})
