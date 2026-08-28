import { Search, Users } from 'lucide-react'
import { useEffect, useState } from 'react'

import { api, cleanParams } from '@/api/client'
import type { Paginated } from '@/api/types'
import { PageHeader } from '@/components/layout'
import { Badge, Card, EmptyState, Pagination, Spinner, Tabs } from '@/components/ui'
import { formatDate, money } from '@/lib/utils'

interface AdminUser {
  id: number
  email: string
  full_name: string
  display_name: string
  initials: string
  role: 'CUSTOMER' | 'VENDOR' | 'ADMIN'
  phone: string
  is_active: boolean
  orders_count: number
  total_spent: string
  shop_name: string | null
  created_at: string
}

const ROLE_TONE = {
  CUSTOMER: 'neutral',
  VENDOR: 'info',
  ADMIN: 'brand',
} as const

const TABS = [
  { label: 'Everyone', value: '' },
  { label: 'Customers', value: 'CUSTOMER' },
  { label: 'Vendors', value: 'VENDOR' },
  { label: 'Admins', value: 'ADMIN' },
]

export function AdminCustomers() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [role, setRole] = useState('')
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [meta, setMeta] = useState({ count: 0, numPages: 1 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setQuery(search)
      setPage(1)
    }, 350)
    return () => clearTimeout(timer)
  }, [search])

  useEffect(() => {
    setLoading(true)
    api
      .get<Paginated<AdminUser>>('/auth/admin/users/', {
        params: cleanParams({ role, search: query, page, page_size: 12 }),
      })
      .then(({ data }) => {
        setUsers(data.results)
        setMeta({ count: data.count, numPages: data.num_pages })
      })
      .catch(() => setUsers([]))
      .finally(() => setLoading(false))
  }, [role, query, page])

  return (
    <div>
      <PageHeader
        title="Customers"
        description={`${meta.count} accounts registered`}
        action={
          <div className="relative w-full sm:w-64">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-[var(--text-subtle)]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Name, email or phone"
              className="h-10 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] pr-3 pl-10 text-sm focus:border-[var(--primary)] focus:outline-none"
            />
          </div>
        }
      />

      <Tabs
        tabs={TABS}
        value={role}
        onChange={(v) => {
          setRole(v)
          setPage(1)
        }}
        className="mb-6"
      />

      {loading ? (
        <Spinner />
      ) : users.length === 0 ? (
        <EmptyState icon={<Users className="size-7" />} title="No accounts found" />
      ) : (
        <>
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-sm">
                <thead className="border-b border-[var(--border)] bg-[var(--surface-2)]">
                  <tr className="text-left text-[11px] font-bold tracking-wider text-muted uppercase">
                    <th className="px-5 py-3">Account</th>
                    <th className="px-3 py-3">Role</th>
                    <th className="px-3 py-3">Orders</th>
                    <th className="px-3 py-3">Lifetime spend</th>
                    <th className="px-5 py-3">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {users.map((user) => (
                    <tr key={user.id} className="transition-colors hover:bg-[var(--surface-2)]">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[var(--primary-soft)] text-xs font-bold text-[var(--primary)]">
                            {user.initials}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate font-semibold">{user.display_name}</p>
                            <p className="truncate text-xs text-subtle">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3.5">
                        <Badge tone={ROLE_TONE[user.role] ?? 'neutral'}>{user.role}</Badge>
                        {user.shop_name && (
                          <p className="mt-1 text-xs text-subtle">{user.shop_name}</p>
                        )}
                      </td>
                      <td className="px-3 py-3.5 font-semibold">{user.orders_count}</td>
                      <td className="px-3 py-3.5 font-semibold">{money(user.total_spent)}</td>
                      <td className="px-5 py-3.5 text-[13px] text-muted">
                        {formatDate(user.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
          <Pagination page={page} numPages={meta.numPages} onChange={setPage} />
        </>
      )}
    </div>
  )
}
