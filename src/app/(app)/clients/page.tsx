'use client'

import * as React from 'react'
import {
  Plus, Search, Building2, Briefcase, Mail, Phone,
  Globe, Pencil, Trash2, MoreVertical, X, ExternalLink, MapPin,
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { SupabaseProvider } from '@/lib/providers/supabase-provider'
import { useUser } from '@/lib/context/user-context'
import { getPlanLimits } from '@/lib/plan-limits'
import type { Client, Vacancy } from '@/types'

const INDUSTRIES = [
  'Tecnología', 'Finanzas', 'Salud', 'Retail', 'Manufactura',
  'Educación', 'Consultoría', 'Marketing', 'Logística', 'Energía',
  'Construcción', 'Medios', 'Agro', 'Turismo', 'Otro',
]

// ─── Client Form Dialog ───────────────────────────────────────────────────────

function ClientFormDialog({
  open, onClose, client, onSave,
}: {
  open: boolean
  onClose: () => void
  client?: Client
  onSave: (c: Client) => void
}) {
  const { user } = useUser()
  const provider = React.useMemo(() => new SupabaseProvider(), [])
  const [saving, setSaving] = React.useState(false)
  const [saveError, setSaveError] = React.useState<string | null>(null)
  const [form, setForm] = React.useState({
    name: client?.name ?? '',
    industry: client?.industry ?? '',
    contactName: client?.contactName ?? '',
    contactEmail: client?.contactEmail ?? '',
    contactPhone: client?.contactPhone ?? '',
    website: client?.website ?? '',
    address: client?.address ?? '',
    interviewAddress: client?.interviewAddress ?? '',
    interviewArrivalDetails: client?.interviewArrivalDetails ?? '',
    notes: client?.notes ?? '',
  })

  React.useEffect(() => {
    if (open) {
      setForm({
        name: client?.name ?? '',
        industry: client?.industry ?? '',
        contactName: client?.contactName ?? '',
        contactEmail: client?.contactEmail ?? '',
        contactPhone: client?.contactPhone ?? '',
        website: client?.website ?? '',
        address: client?.address ?? '',
        interviewAddress: client?.interviewAddress ?? '',
        interviewArrivalDetails: client?.interviewArrivalDetails ?? '',
        notes: client?.notes ?? '',
      })
    }
  }, [open, client])

  function set(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) return
    setSaveError(null)
    setSaving(true)
    const input = {
      tenantId: user?.tenantId ?? '',
      name: form.name.trim(),
      industry: form.industry || undefined,
      contactName: form.contactName || undefined,
      contactEmail: form.contactEmail || undefined,
      contactPhone: form.contactPhone || undefined,
      website: form.website || undefined,
      address: form.address || undefined,
      interviewAddress: form.interviewAddress || undefined,
      interviewArrivalDetails: form.interviewArrivalDetails || undefined,
      notes: form.notes || undefined,
    }
    const result = client
      ? await provider.updateClient(client.id, input)
      : await provider.createClient(input)
    setSaving(false)
    if (result.data) {
      onSave(result.data)
      onClose()
    } else {
      setSaveError(result.error ?? 'Error al guardar')
    }
  }

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
      >
        <DialogHeader>
          <DialogTitle style={{ color: 'var(--text)' }}>
            {client ? 'Editar cliente' : 'Nuevo cliente'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* Name */}
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--muted2)' }}>
              Empresa *
            </label>
            <input
              value={form.name}
              onChange={e => set('name', e.target.value)}
              required
              placeholder="Nombre de la empresa"
              className="w-full rounded-lg px-3 py-2 text-sm outline-none focus:ring-2"
              style={{
                background: 'var(--surface2)',
                border: '1px solid var(--border)',
                color: 'var(--text)',
              }}
            />
          </div>

          {/* Industry */}
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--muted2)' }}>
              Industria
            </label>
            <select
              value={form.industry}
              onChange={e => set('industry', e.target.value)}
              className="w-full rounded-lg px-3 py-2 text-sm outline-none"
              style={{
                background: 'var(--surface2)',
                border: '1px solid var(--border)',
                color: 'var(--text)',
              }}
            >
              <option value="">Seleccionar...</option>
              {INDUSTRIES.map(i => (
                <option key={i} value={i}>{i}</option>
              ))}
            </select>
          </div>

          {/* Contact */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--muted2)' }}>
                Contacto
              </label>
              <input
                value={form.contactName}
                onChange={e => set('contactName', e.target.value)}
                placeholder="Nombre del contacto"
                className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                style={{
                  background: 'var(--surface2)',
                  border: '1px solid var(--border)',
                  color: 'var(--text)',
                }}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--muted2)' }}>
                Email
              </label>
              <input
                type="email"
                value={form.contactEmail}
                onChange={e => set('contactEmail', e.target.value)}
                placeholder="email@empresa.com"
                className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                style={{
                  background: 'var(--surface2)',
                  border: '1px solid var(--border)',
                  color: 'var(--text)',
                }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--muted2)' }}>
                Teléfono
              </label>
              <input
                value={form.contactPhone}
                onChange={e => set('contactPhone', e.target.value)}
                placeholder="+54 11..."
                className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                style={{
                  background: 'var(--surface2)',
                  border: '1px solid var(--border)',
                  color: 'var(--text)',
                }}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--muted2)' }}>
                Sitio web
              </label>
              <input
                value={form.website}
                onChange={e => set('website', e.target.value)}
                placeholder="www.empresa.com"
                className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                style={{
                  background: 'var(--surface2)',
                  border: '1px solid var(--border)',
                  color: 'var(--text)',
                }}
              />
            </div>
          </div>

          {/* Dirección de empresa */}
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--muted2)' }}>
              Dirección de la empresa
            </label>
            <input
              value={form.address}
              onChange={e => set('address', e.target.value)}
              placeholder="Ej: Av. Corrientes 1234, CABA"
              className="w-full rounded-lg px-3 py-2 text-sm outline-none focus:ring-2"
              style={{
                background: 'var(--surface2)',
                border: '1px solid var(--border)',
                color: 'var(--text)',
              }}
            />
          </div>

          {/* Dirección de entrevistas */}
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--muted2)' }}>
              Dirección para entrevistas
            </label>
            <input
              value={form.interviewAddress}
              onChange={e => set('interviewAddress', e.target.value)}
              placeholder="Ej: Misma dirección o piso específico"
              className="w-full rounded-lg px-3 py-2 text-sm outline-none focus:ring-2"
              style={{
                background: 'var(--surface2)',
                border: '1px solid var(--border)',
                color: 'var(--text)',
              }}
            />
          </div>

          {/* Instrucciones de llegada */}
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--muted2)' }}>
              Instrucciones al llegar
            </label>
            <textarea
              value={form.interviewArrivalDetails}
              onChange={e => set('interviewArrivalDetails', e.target.value)}
              rows={2}
              placeholder="Ej: Preguntar por Recepción, pedir por Recursos Humanos, mencionar que vas a entrevista con ConectAr..."
              className="w-full rounded-lg px-3 py-2 text-sm outline-none resize-none"
              style={{
                background: 'var(--surface2)',
                border: '1px solid var(--border)',
                color: 'var(--text)',
              }}
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--muted2)' }}>
              Notas internas
            </label>
            <textarea
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
              rows={3}
              placeholder="Contexto del cliente, preferencias, acuerdos..."
              className="w-full rounded-lg px-3 py-2 text-sm outline-none resize-none"
              style={{
                background: 'var(--surface2)',
                border: '1px solid var(--border)',
                color: 'var(--text)',
              }}
            />
          </div>

          {saveError && (
            <p className="text-xs px-3 py-2 rounded-lg" style={{ background: 'rgba(239,68,68,0.12)', color: '#f87171' }}>
              {saveError}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={onClose} style={{ color: 'var(--muted2)' }}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={saving || !form.name.trim()}
              style={{ background: 'var(--accent)', color: '#fff' }}
            >
              {saving ? 'Guardando...' : client ? 'Guardar cambios' : 'Crear cliente'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ─── Delete Confirm Dialog ────────────────────────────────────────────────────

function DeleteClientDialog({
  client, onConfirm, onClose,
}: {
  client: Client
  onConfirm: () => void
  onClose: () => void
}) {
  const [confirmed, setConfirmed] = React.useState(false)
  return (
    <Dialog open onOpenChange={v => !v && onClose()}>
      <DialogContent
        className="w-full max-w-md max-h-[90vh] overflow-y-auto"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
      >
        <DialogHeader>
          <DialogTitle style={{ color: 'var(--text)' }}>Eliminar cliente: {client.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 mt-2">
          <p className="text-sm" style={{ color: 'var(--text)' }}>
            Estás a punto de eliminar permanentemente al cliente <strong>{client.name}</strong> y toda su información del sistema.
          </p>

          <div className="rounded-lg px-3 py-2.5 text-xs space-y-1" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}>
            <p className="font-semibold">⚠ Esta acción no se puede deshacer. Se perderán permanentemente:</p>
            <ul className="ml-3 mt-1 space-y-0.5 list-disc" style={{ color: 'var(--muted)' }}>
              <li>El perfil y datos de contacto del cliente</li>
              <li>Todas las vacantes asociadas a este cliente</li>
              <li>Los procesos de reclutamiento y candidatos vinculados a esas vacantes</li>
              <li>Las entrevistas y evaluaciones (scorecards) realizadas</li>
              <li>Los candidatos que tengan este cliente asignado como referencia</li>
              <li>Todo el historial de actividad y comunicaciones</li>
            </ul>
          </div>

          <div className="flex items-start gap-2 pt-1">
            <input
              id="confirm-delete-client"
              type="checkbox"
              checked={confirmed}
              onChange={e => setConfirmed(e.target.checked)}
              className="mt-0.5"
            />
            <label htmlFor="confirm-delete-client" className="text-xs cursor-pointer" style={{ color: 'var(--muted)' }}>
              Entiendo que esta acción es <strong style={{ color: 'var(--text)' }}>irreversible</strong> y que todos los datos relacionados se perderán definitivamente. Solo los administradores pueden realizar esta operación.
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="ghost" onClick={onClose} style={{ color: 'var(--muted2)' }}>
            Cancelar
          </Button>
          <Button
            onClick={onConfirm}
            disabled={!confirmed}
            style={{ background: confirmed ? 'var(--coral)' : 'var(--surface2)', color: confirmed ? '#fff' : 'var(--muted)', cursor: confirmed ? 'pointer' : 'not-allowed' }}
          >
            Eliminar cliente
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─── Client Card ──────────────────────────────────────────────────────────────

function ClientCard({
  client, vacancyCount, onEdit, onDelete,
}: {
  client: Client
  vacancyCount: number
  onEdit: () => void
  onDelete: () => void
}) {
  const [menuOpen, setMenuOpen] = React.useState(false)
  const menuRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (!menuOpen) return
    function handler(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [menuOpen])

  return (
    <Card
      className="relative overflow-hidden transition-all duration-200 hover:shadow-md"
      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
    >
      <CardContent className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <Link href={`/clients/${client.id}`} className="flex items-center gap-3 min-w-0 group">
            <div
              className="shrink-0 flex items-center justify-center rounded-xl text-white text-sm font-bold"
              style={{
                width: 40,
                height: 40,
                background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
              }}
            >
              {client.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h3
                className="font-semibold text-sm truncate group-hover:underline"
                style={{ color: 'var(--text)' }}
              >
                {client.name}
              </h3>
              {client.industry && (
                <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
                  {client.industry}
                </p>
              )}
            </div>
          </Link>

          {/* Menu */}
          <div className="relative shrink-0" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(v => !v)}
              className="p-1.5 rounded-lg transition-colors hover:bg-[var(--surface2)]"
              style={{ color: 'var(--muted)' }}
            >
              <MoreVertical className="h-4 w-4" />
            </button>
            {menuOpen && (
              <div
                className="absolute right-0 top-8 z-20 w-36 rounded-xl overflow-hidden shadow-xl"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
              >
                <button
                  onClick={() => { setMenuOpen(false); onEdit() }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-[var(--surface2)] transition-colors"
                  style={{ color: 'var(--text)' }}
                >
                  <Pencil className="h-3.5 w-3.5" /> Editar
                </button>
                <button
                  onClick={() => { setMenuOpen(false); onDelete() }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-[var(--surface2)] transition-colors"
                  style={{ color: 'var(--coral)' }}
                >
                  <Trash2 className="h-3.5 w-3.5" /> Eliminar
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg mb-3"
          style={{ background: 'var(--surface2)' }}
        >
          <Briefcase className="h-3.5 w-3.5" style={{ color: 'var(--accent-2)' }} />
          <span className="text-xs font-medium" style={{ color: 'var(--text)' }}>
            {vacancyCount}
          </span>
          <span className="text-xs" style={{ color: 'var(--muted)' }}>
            {vacancyCount === 1 ? 'vacante activa' : 'vacantes activas'}
          </span>
        </div>

        {/* Contact info */}
        <div className="space-y-1.5">
          {client.contactName && (
            <div className="flex items-center gap-2">
              <span className="text-xs" style={{ color: 'var(--muted)' }}>
                {client.contactName}
              </span>
            </div>
          )}
          {client.contactEmail && (
            <a
              href={`mailto:${client.contactEmail}`}
              className="flex items-center gap-2 group"
            >
              <Mail className="h-3.5 w-3.5 shrink-0" style={{ color: 'var(--muted)' }} />
              <span
                className="text-xs truncate group-hover:underline"
                style={{ color: 'var(--muted2)' }}
              >
                {client.contactEmail}
              </span>
            </a>
          )}
          {client.contactPhone && (
            <div className="flex items-center gap-2">
              <Phone className="h-3.5 w-3.5 shrink-0" style={{ color: 'var(--muted)' }} />
              <span className="text-xs" style={{ color: 'var(--muted2)' }}>
                {client.contactPhone}
              </span>
            </div>
          )}
          {client.website && (
            <a
              href={client.website.startsWith('http') ? client.website : `https://${client.website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 group"
            >
              <Globe className="h-3.5 w-3.5 shrink-0" style={{ color: 'var(--muted)' }} />
              <span
                className="text-xs truncate group-hover:underline"
                style={{ color: 'var(--muted2)' }}
              >
                {client.website.replace(/^https?:\/\//, '')}
              </span>
              <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" style={{ color: 'var(--muted)' }} />
            </a>
          )}
        </div>

        {client.address && (
          <div className="flex items-start gap-2 mt-1.5">
            <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5" style={{ color: 'var(--muted)' }} />
            <span className="text-xs" style={{ color: 'var(--muted2)' }}>
              {client.address}
            </span>
          </div>
        )}
        {client.interviewAddress && (
          <div className="flex items-start gap-2 mt-1.5">
            <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5" style={{ color: 'var(--accent-2)' }} />
            <span className="text-xs" style={{ color: 'var(--muted2)' }}>
              Entrevistas: {client.interviewAddress}
            </span>
          </div>
        )}
        {client.interviewArrivalDetails && (
          <div className="flex items-start gap-2 mt-1.5">
            <span className="text-xs italic" style={{ color: 'var(--muted)', paddingLeft: '1.375rem' }}>
              {client.interviewArrivalDetails}
            </span>
          </div>
        )}

        {client.notes && (
          <p
            className="mt-3 pt-3 text-xs line-clamp-2"
            style={{
              color: 'var(--muted)',
              borderTop: '1px solid var(--border)',
            }}
          >
            {client.notes}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ClientsPage() {
  const { user } = useUser()
  const provider = React.useMemo(() => new SupabaseProvider(), [])

  const [clients, setClients] = React.useState<Client[]>([])
  const [vacancies, setVacancies] = React.useState<Vacancy[]>([])
  const [loading, setLoading] = React.useState(true)
  const [search, setSearch] = React.useState('')
  const [formOpen, setFormOpen] = React.useState(false)
  const [editingClient, setEditingClient] = React.useState<Client | undefined>()
  const [deletingClient, setDeletingClient] = React.useState<Client | undefined>()

  const limits = React.useMemo(() => getPlanLimits(user?.plan ?? 'free'), [user])

  async function load() {
    if (!user?.tenantId) return
    setLoading(true)
    const [cr, vr] = await Promise.all([
      provider.getClients(user.tenantId),
      provider.getVacancies(user.tenantId),
    ])
    if (cr.data) setClients(cr.data)
    if (vr.data) setVacancies(vr.data)
    setLoading(false)
  }

  React.useEffect(() => { load() }, [user?.tenantId])

  const filtered = React.useMemo(() => {
    const q = search.toLowerCase()
    if (!q) return clients
    return clients.filter(
      c =>
        c.name.toLowerCase().includes(q) ||
        c.industry?.toLowerCase().includes(q) ||
        c.contactName?.toLowerCase().includes(q) ||
        c.contactEmail?.toLowerCase().includes(q)
    )
  }, [clients, search])

  function vacancyCountFor(clientId: string) {
    return vacancies.filter(v => v.clientId === clientId).length
  }

  function handleSaved(c: Client) {
    setClients(prev => {
      const idx = prev.findIndex(x => x.id === c.id)
      if (idx !== -1) {
        const next = [...prev]
        next[idx] = c
        return next
      }
      return [c, ...prev]
    })
  }

  async function handleDelete(client: Client) {
    await provider.deleteClient(client.id)
    setClients(prev => prev.filter(c => c.id !== client.id))
    setVacancies(prev => prev.map(v => v.clientId === client.id ? { ...v, clientId: undefined, client: undefined } : v))
    setDeletingClient(undefined)
  }

  const atLimit = clients.length >= limits.clients

  // ── KPIs ───────────────────────────────────────────────────────────────────
  const totalClients = clients.length
  const clientsWithVacancy = clients.filter(c => vacancyCountFor(c.id) > 0).length
  const totalActiveVacancies = vacancies.filter(v => v.clientId).length

  return (
    <div
      className="min-h-full p-4 sm:p-6 lg:p-8"
      style={{ background: 'var(--bg)' }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
            Clientes
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--muted)' }}>
            Empresas para las que gestionás procesos de selección
          </p>
        </div>
        <Button
          onClick={() => {
            if (atLimit) {
              alert(`Tu plan ${user?.plan ?? 'free'} permite hasta ${limits.clients === 1 ? '1 cliente' : `${limits.clients} clientes`}. Actualizá para agregar más.`)
              return
            }
            setEditingClient(undefined)
            setFormOpen(true)
          }}
          className="shrink-0 flex items-center gap-2"
          style={{ background: 'var(--accent)', color: '#fff' }}
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Nuevo cliente</span>
        </Button>
      </div>

      {/* Plan limit banner */}
      {atLimit && (
        <div
          className="flex items-center gap-2 px-4 py-3 rounded-xl mb-6 text-sm"
          style={{ background: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.3)', color: '#fbbf24' }}
        >
          <Building2 className="h-4 w-4 shrink-0" />
          <span>
            Llegaste al límite de <strong>{limits.clients === 1 ? '1 cliente' : `${limits.clients} clientes`}</strong> de tu plan {user?.plan}.{' '}
            Actualizá para agregar más.
          </span>
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
        {[
          { label: 'Clientes activos', value: totalClients, sub: `de ${limits.clients === Infinity ? '∞' : limits.clients} en tu plan` },
          { label: 'Con vacantes abiertas', value: clientsWithVacancy, sub: 'tienen procesos activos' },
          { label: 'Vacantes asignadas', value: totalActiveVacancies, sub: 'vinculadas a un cliente' },
        ].map(kpi => (
          <div
            key={kpi.label}
            className="rounded-xl p-4"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
          >
            <p className="text-2xl font-bold" style={{ color: 'var(--accent-2)' }}>{kpi.value}</p>
            <p className="text-xs font-medium mt-0.5" style={{ color: 'var(--text)' }}>{kpi.label}</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div
        className="flex items-center gap-2 px-3 py-2 rounded-xl mb-6"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
      >
        <Search className="h-4 w-4 shrink-0" style={{ color: 'var(--muted)' }} />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por empresa, industria o contacto..."
          className="flex-1 bg-transparent text-sm outline-none"
          style={{ color: 'var(--text)' }}
        />
        {search && (
          <button onClick={() => setSearch('')}>
            <X className="h-4 w-4" style={{ color: 'var(--muted)' }} />
          </button>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-48 rounded-xl animate-pulse"
              style={{ background: 'var(--surface)' }}
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Building2 className="h-12 w-12 mb-4" style={{ color: 'var(--muted)' }} />
          <h3 className="font-semibold text-lg mb-1" style={{ color: 'var(--text)' }}>
            {search ? 'Sin resultados' : 'Todavía no tenés clientes'}
          </h3>
          <p className="text-sm max-w-xs" style={{ color: 'var(--muted)' }}>
            {search
              ? 'Probá con otro término de búsqueda.'
              : 'Creá tu primer cliente para asociarle vacantes y generar informes por empresa.'}
          </p>
          {!search && !atLimit && (
            <Button
              className="mt-4"
              onClick={() => { setEditingClient(undefined); setFormOpen(true) }}
              style={{ background: 'var(--accent)', color: '#fff' }}
            >
              <Plus className="h-4 w-4 mr-2" /> Crear primer cliente
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(client => (
            <ClientCard
              key={client.id}
              client={client}
              vacancyCount={vacancyCountFor(client.id)}
              onEdit={() => { setEditingClient(client); setFormOpen(true) }}
              onDelete={() => setDeletingClient(client)}
            />
          ))}
        </div>
      )}

      {/* Dialogs */}
      <ClientFormDialog
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditingClient(undefined) }}
        client={editingClient}
        onSave={handleSaved}
      />

      {deletingClient && (
        <DeleteClientDialog
          client={deletingClient}
          onConfirm={() => handleDelete(deletingClient)}
          onClose={() => setDeletingClient(undefined)}
        />
      )}
    </div>
  )
}
