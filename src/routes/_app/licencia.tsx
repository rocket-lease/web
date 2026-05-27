import { createFileRoute } from '@tanstack/react-router'
import { DriverLicenseVerificationPage } from '@/features/license/components/DriverLicenseVerificationPage'

export const Route = createFileRoute('/_app/licencia')({
  component: DriverLicenseVerificationPage,
})