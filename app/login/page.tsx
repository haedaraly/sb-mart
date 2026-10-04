import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth'
import LoginForm from '@/components/auth/LoginForm'

export default function LoginPage({
  searchParams,
}: {
  searchParams?: { next?: string }
}) {
  if (getUser()) {
    redirect(searchParams?.next && searchParams.next.startsWith('/') ? searchParams.next : '/pembelian')
  }

  return <LoginForm />
}
