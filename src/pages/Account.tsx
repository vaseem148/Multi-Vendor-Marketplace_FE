import { Lock, MapPin, Plus, Trash2, User } from 'lucide-react'
import { useEffect, useState } from 'react'

import { authApi } from '@/api/endpoints'
import type { Address } from '@/api/types'
import { PageHeader } from '@/components/layout'
import { Badge, Button, Card, Input, Modal, Select, Tabs } from '@/components/ui'
import { INDIAN_STATES } from '@/lib/constants'
import { apiError } from '@/lib/utils'
import { useAuth } from '@/store/auth'
import { toast } from '@/store/ui'

const BLANK_ADDRESS = {
  label: 'Home',
  full_name: '',
  phone: '',
  line1: '',
  line2: '',
  city: '',
  state: 'Tamil Nadu',
  postal_code: '',
  country: 'India',
  is_default: false,
}

export function Account() {
  const { user, setUser } = useAuth()
  const [tab, setTab] = useState('profile')

  return (
    <div className="mx-auto max-w-3xl px-4 py-9 lg:px-8">
      <PageHeader title="My account" description={user?.email} />
      <Tabs
        tabs={[
          { label: 'Profile', value: 'profile' },
          { label: 'Addresses', value: 'addresses' },
          { label: 'Password', value: 'password' },
        ]}
        value={tab}
        onChange={setTab}
        className="mb-7"
      />
      {tab === 'profile' && <ProfileTab />}
      {tab === 'addresses' && <AddressTab />}
      {tab === 'password' && <PasswordTab />}
    </div>
  )

  function ProfileTab() {
    const [form, setForm] = useState({
      full_name: user?.full_name ?? '',
      phone: user?.phone ?? '',
    })
    const [saving, setSaving] = useState(false)

    async function save(e: React.FormEvent) {
      e.preventDefault()
      setSaving(true)
      try {
        const { data } = await authApi.updateMe(form)
        setUser(data)
        toast.success('Profile updated')
      } catch (error) {
        toast.error(apiError(error))
      } finally {
        setSaving(false)
      }
    }

    return (
      <Card className="p-6">
        <h2 className="flex items-center gap-2.5 text-lg font-bold">
          <User className="size-5 text-[var(--primary)]" />
          Profile details
        </h2>
        <form onSubmit={save} className="mt-5 space-y-4">
          <Input label="Email" value={user?.email ?? ''} disabled hint="Email cannot be changed." />
          <Input
            label="Full name"
            value={form.full_name}
            onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
          />
          <Input
            label="Phone"
            type="tel"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
          />
          <Button type="submit" loading={saving}>
            Save changes
          </Button>
        </form>
      </Card>
    )
  }

  function PasswordTab() {
    const [form, setForm] = useState({ old_password: '', new_password: '' })
    const [saving, setSaving] = useState(false)

    async function save(e: React.FormEvent) {
      e.preventDefault()
      setSaving(true)
      try {
        await authApi.changePassword(form.old_password, form.new_password)
        toast.success('Password updated')
        setForm({ old_password: '', new_password: '' })
      } catch (error) {
        toast.error(apiError(error))
      } finally {
        setSaving(false)
      }
    }

    return (
      <Card className="p-6">
        <h2 className="flex items-center gap-2.5 text-lg font-bold">
          <Lock className="size-5 text-[var(--primary)]" />
          Change password
        </h2>
        <form onSubmit={save} className="mt-5 space-y-4">
          <Input
            label="Current password"
            type="password"
            required
            autoComplete="current-password"
            value={form.old_password}
            onChange={(e) => setForm((f) => ({ ...f, old_password: e.target.value }))}
          />
          <Input
            label="New password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            hint="At least 8 characters."
            value={form.new_password}
            onChange={(e) => setForm((f) => ({ ...f, new_password: e.target.value }))}
          />
          <Button type="submit" loading={saving}>
            Update password
          </Button>
        </form>
      </Card>
    )
  }

  function AddressTab() {
    const [addresses, setAddresses] = useState<Address[]>([])
    const [open, setOpen] = useState(false)
    const [form, setForm] = useState(BLANK_ADDRESS)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
      authApi.addresses().then(({ data }) => setAddresses(data)).catch(() => {})
    }, [])

    function set(key: keyof typeof BLANK_ADDRESS) {
      return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
        setForm((f) => ({ ...f, [key]: e.target.value }))
    }

    async function create() {
      setSaving(true)
      try {
        const { data } = await authApi.createAddress(form)
        setAddresses((list) => [data, ...list.map((a) => ({ ...a, is_default: a.is_default && !data.is_default }))])
        toast.success('Address saved')
        setOpen(false)
        setForm(BLANK_ADDRESS)
      } catch (error) {
        toast.error(apiError(error))
      } finally {
        setSaving(false)
      }
    }

    async function remove(id: number) {
      try {
        await authApi.deleteAddress(id)
        setAddresses((list) => list.filter((a) => a.id !== id))
        toast.success('Address removed')
      } catch (error) {
        toast.error(apiError(error))
      }
    }

    async function makeDefault(id: number) {
      try {
        await authApi.updateAddress(id, { is_default: true })
        setAddresses((list) => list.map((a) => ({ ...a, is_default: a.id === id })))
        toast.success('Default address updated')
      } catch (error) {
        toast.error(apiError(error))
      }
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2.5 text-lg font-bold">
            <MapPin className="size-5 text-[var(--primary)]" />
            Saved addresses
          </h2>
          <Button size="sm" onClick={() => setOpen(true)} icon={<Plus className="size-4" />}>
            Add address
          </Button>
        </div>

        {addresses.length === 0 ? (
          <Card className="p-10 text-center">
            <p className="font-semibold">No addresses saved</p>
            <p className="mt-1.5 text-sm text-muted">Add one to speed up checkout.</p>
          </Card>
        ) : (
          addresses.map((address) => (
            <Card key={address.id} className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold">{address.full_name}</span>
                    <Badge tone="neutral">{address.label}</Badge>
                    {address.is_default && <Badge tone="success">Default</Badge>}
                  </div>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted">{address.one_line}</p>
                  <p className="mt-0.5 text-sm text-muted">{address.phone}</p>
                </div>
                <div className="flex shrink-0 gap-1.5">
                  {!address.is_default && (
                    <Button size="sm" variant="ghost" onClick={() => makeDefault(address.id)}>
                      Set default
                    </Button>
                  )}
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label="Delete address"
                    onClick={() => remove(address.id)}
                  >
                    <Trash2 className="size-4 text-[var(--danger)]" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}

        <Modal
          open={open}
          onClose={() => setOpen(false)}
          title="Add an address"
          size="lg"
          footer={
            <>
              <Button variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button loading={saving} onClick={create}>
                Save address
              </Button>
            </>
          }
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Label" value={form.label} onChange={set('label')} placeholder="Home / Work" />
            <Input label="Full name" required value={form.full_name} onChange={set('full_name')} />
            <Input label="Phone" required type="tel" value={form.phone} onChange={set('phone')} />
            <Input label="PIN code" required value={form.postal_code} onChange={set('postal_code')} />
            <Input
              label="Address line 1"
              required
              className="sm:col-span-2"
              value={form.line1}
              onChange={set('line1')}
            />
            <Input
              label="Address line 2"
              className="sm:col-span-2"
              value={form.line2}
              onChange={set('line2')}
            />
            <Input label="City" required value={form.city} onChange={set('city')} />
            <Select
              label="State"
              options={INDIAN_STATES.map((s) => ({ label: s, value: s }))}
              value={form.state}
              onChange={set('state')}
            />
            <label className="flex items-center gap-2.5 text-sm font-medium sm:col-span-2">
              <input
                type="checkbox"
                checked={form.is_default}
                onChange={(e) => setForm((f) => ({ ...f, is_default: e.target.checked }))}
                className="size-4 rounded accent-[var(--primary)]"
              />
              Make this my default address
            </label>
          </div>
        </Modal>
      </div>
    )
  }
}
