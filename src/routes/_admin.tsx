import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_admin')({
  beforeLoad: () => {
    const token = localStorage.getItem('rocket_lease:access_token')
    if (!token) throw redirect({ to: '/login' })
  },
  component: () => (
    <div className="min-h-dvh bg-surface-0">
      <Outlet />
    </div>
  ),
})
