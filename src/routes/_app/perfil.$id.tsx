import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/perfil/$id')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_app/perfil/$id"!</div>
}
