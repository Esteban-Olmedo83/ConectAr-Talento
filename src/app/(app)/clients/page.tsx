'use client'

import * as React from 'react'
import {
  Plus, Search, Building2, Briefcase, Mail, Phone,
  Globe, Pencil, Trash2, MoreVertical, X, ExternalLink, MapPin, Camera, Loader2,
  PowerOff, RotateCcw, Clock, ChevronDown, ChevronUp,
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { DraggableModal } from '@/components/ui/draggable-modal'
import { SupabaseProvider } from '@/lib/providers/supabase-provider'
import { useDraggable } from '@/hooks/useDraggable'
import { useUser } from '@/lib/context/user-context'
import { getPlanLimits } from '@/lib/plan-limits'
import type { Client, ClientEvent, Vacancy } from '@/types'

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
  const [logoUrl, setLogoUrl] = React.useState<string | undefined>(client?.logoUrl)
  const [uploadingLogo, setUploadingLogo] = React.useState(false)
  const [logoError, setLogoError] = React.useState<string | null>(null)
  const logoInputRef = React.useRef<HTMLInputElement>(null)
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
      setLogoUrl(client?.logoUrl)
      setLogoError(null)
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

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingLogo(true)
    setLogoError(null)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', 'logo')
      formData.append('id', client?.id ?? `new-${Date.now()}`)
      const res = await fetch('/api/upload/image', { method: 'POST', body: formData })
      const data = await res.json() as { ok?: boolean; url?: string; error?: string }
      if (data.ok && data.url) {
        setLogoUrl(data.url)
      } else {
        setLogoError(data.error ?? 'Error al subir el logo')
      }
    } catch {
      setLogoError('Error de red al subir el logo. Verificá tu conexión.')
    } finally {
      setUploadingLogo(false)
      e.target.value = ''
    }
  }

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
      logoUrl: logoUrl || undefined,
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

  const { style: dragStyle, headerStyle, onMouseDown } = useDraggable()

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 16,
          width: '100%',
          maxWidth: 'min(540px, 95vw)',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
          ...dragStyle,
        }}
      >
        {/* Header */}
        <div
          onMouseDown={onMouseDown}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '16px 20px', borderBottom: '1px solid var(--border)',
            ...headerStyle,
          }}
        >
          <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', margin: 0 }}>
            {client ? 'Editar cliente' : 'Nuevo cliente'}
          </h2>
          <button onClick={onClose} style={{ padding: 6, borderRadius: 6, background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--muted)' }}>
            <X style={{ width: 16, height: 16 }} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Logo upload */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div
              onClick={() => logoInputRef.current?.click()}
              style={{
                width: 72, height: 72, borderRadius: 12, flexShrink: 0,
                background: 'var(--surface2)', border: '2px dashed var(--border)',
                cursor: 'pointer', overflow: 'hidden', position: 'relative',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              {logoUrl
                ? <img src={logoUrl} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <Building2 style={{ width: 28, height: 28, color: 'var(--muted)' }} />
              }
              <div style={{
                position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                opacity: 0, transition: 'opacity 0.15s',
              }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '0')}
              >
                {uploadingLogo
                  ? <Loader2 style={{ width: 18, height: 18, color: '#fff' }} className="animate-spin" />
                  : <Camera style={{ width: 18, height: 18, color: '#fff' }} />
                }
              </div>
            </div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>Logo del cliente</p>
              <p style={{ fontSize: 11, color: 'var(--muted)' }}>PNG, JPG o WebP · Se muestra en tarjetas y reportes</p>
              <button type="button" onClick={() => logoInputRef.current?.click()}
                style={{ marginTop: 6, fontSize: 11, fontWeight: 600, color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                {logoUrl ? 'Cambiar logo' : 'Subir logo'}
              </button>
              {logoUrl && (
                <button type="button" onClick={() => setLogoUrl(undefined)}
                  style={{ marginTop: 6, marginLeft: 10, fontSize: 11, color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                  Quitar
                </button>
              )}
            </div>
            <input ref={logoInputRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} onChange={handleLogoUpload} />
          </div>
          {logoError && (
            <p style={{ fontSize: 11, color: '#ef4444', marginTop: -8 }}>{logoError}</p>
          )}
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
            <button
              type="submit"
              disabled={saving || !form.name.trim()}
              style={{ padding: '8px 18px', borderRadius: 8, background: 'var(--accent)', border: 'none', color: '#fff', cursor: saving || !form.name.trim() ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 600, opacity: saving || !form.name.trim() ? 0.6 : 1 }}
            >
              {saving ? 'Guardando...' : client ? 'Guardar cambios' : 'Crear cliente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Delete Confirm Dialog ────────────────────────────────────────────────────

interface DeleteCounts {
  vacancies: number
  applications: number
  interviews: number
  scorecards: number
}

function DeleteClientDialog({
  client, onConfirm, onClose,
}: {
  client: Client
  onConfirm: () => void
  onClose: () => void
}) {
  const provider = React.useMemo(() => new SupabaseProvider(), [])
  const [confirmed, setConfirmed] = React.useState(false)
  const [counts, setCounts] = React.useState<DeleteCounts | null>(null)

  React.useEffect(() => {
    let cancelled = false
    async function fetchCounts() {
      const result = await provider.getDeleteClientCounts(client.id)
      if (!cancelled) setCounts(result)
    }
    fetchCounts()
    return () => { cancelled = true }
  }, [client.id, provider])

  return (
    <DraggableModal open onClose={onClose} title={`Eliminar cliente: ${client.name}`} maxWidth="28rem">
        <div className="space-y-3">
          <p className="text-sm" style={{ color: 'var(--text)' }}>
            Estás a punto de eliminar permanentemente al cliente <strong>{client.name}</strong> y toda su información del sistema.
          </p>

          <div className="rounded-lg px-3 py-2.5 text-xs space-y-1" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}>
            <p className="font-semibold">Esta acción no se puede deshacer. Se perderán permanentemente:</p>
            <ul className="ml-3 mt-1 space-y-0.5 list-disc" style={{ color: 'var(--muted)' }}>
              <li>El perfil y datos de contacto del cliente</li>
              <li>
                {counts == null
                  ? 'Vacantes asociadas a este cliente'
                  : `${counts.vacancies} ${counts.vacancies === 1 ? 'vacante asociada' : 'vacantes asociadas'} a este cliente`}
              </li>
              <li>
                {counts == null
                  ? 'Postulaciones vinculadas a esas vacantes'
                  : `${counts.applications} ${counts.applications === 1 ? 'postulación vinculada' : 'postulaciones vinculadas'} a esas vacantes`}
              </li>
              <li>
                {counts == null
                  ? 'Entrevistas realizadas en esos procesos'
                  : `${counts.interviews} ${counts.interviews === 1 ? 'entrevista realizada' : 'entrevistas realizadas'} en esos procesos`}
              </li>
              <li>
                {counts == null
                  ? 'Evaluaciones (scorecards) completadas'
                  : `${counts.scorecards} ${counts.scorecards === 1 ? 'evaluación (scorecard) completada' : 'evaluaciones (scorecards) completadas'}`}
              </li>
              <li>Los candidatos con este cliente asignado quedarán desvinculados (no se eliminan)</li>
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
    </DraggableModal>
  )
}

// ─── Deactivate Confirm Dialog ────────────────────────────────────────────────

function DeactivateClientDialog({
  client, onConfirm, onClose,
}: {
  client: Client
  onConfirm: () => void
  onClose: () => void
}) {
  const [loading, setLoading] = React.useState(false)

  async function handleConfirm() {
    setLoading(true)
    await onConfirm()
    setLoading(false)
  }

  return (
    <DraggableModal open onClose={onClose} title={`Desactivar cliente: ${client.name}`} maxWidth="28rem">
      <div className="space-y-3">
        <p className="text-sm" style={{ color: 'var(--text)' }}>
          Vas a desactivar al cliente <strong>{client.name}</strong>. Esto lo moverá al historial de clientes.
        </p>
        <div className="rounded-lg px-3 py-2.5 text-xs space-y-1" style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.25)', color: '#fbbf24' }}>
          <p className="font-semibold">Al desactivar este cliente:</p>
          <ul className="ml-3 mt-1 space-y-0.5 list-disc" style={{ color: 'var(--muted)' }}>
            <li>Sus vacantes y candidatos quedarán ocultos de las vistas activas</li>
            <li>El historial y datos se conservan íntegramente</li>
            <li>Podés reactivarlo en cualquier momento desde el historial</li>
          </ul>
        </div>
      </div>
      <div className="flex justify-end gap-2 mt-4">
        <Button variant="ghost" onClick={onClose} style={{ color: 'var(--muted2)' }}>
          Cancelar
        </Button>
        <Button
          onClick={handleConfirm}
          disabled={loading}
          style={{ background: 'rgba(251,191,36,0.15)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.3)', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}
        >
          {loading ? 'Desactivando...' : 'Desactivar cliente'}
        </Button>
      </div>
    </DraggableModal>
  )
}

// ─── Active Client Card ───────────────────────────────────────────────────────

function ActiveClientCard({
  client, vacancyCount, onEdit, onDelete, onDeactivate,
}: {
  client: Client
  vacancyCount: number
  onEdit: () => void
  onDelete: () => void
  onDeactivate: () => void
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
              className="shrink-0 flex items-center justify-center rounded-xl text-white text-sm font-bold overflow-hidden"
              style={{
                width: 40,
                height: 40,
                background: client.logoUrl ? 'transparent' : 'linear-gradient(135deg, var(--accent), var(--accent-2))',
              }}
            >
              {client.logoUrl
                ? <img src={client.logoUrl} alt={client.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : client.name.charAt(0).toUpperCase()
              }
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3
                  className="font-semibold text-sm truncate group-hover:underline"
                  style={{ color: 'var(--text)' }}
                >
                  {client.name}
                </h3>
                <span className="shrink-0 text-xs px-1.5 py-0.5 rounded-full font-medium" style={{ background: 'rgba(34,197,94,0.12)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.25)' }}>
                  Activo
                </span>
              </div>
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
                className="absolute right-0 top-8 z-20 w-40 rounded-xl overflow-hidden shadow-xl"
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
                  onClick={() => { setMenuOpen(false); onDeactivate() }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-[var(--surface2)] transition-colors"
                  style={{ color: '#fbbf24' }}
                >
                  <PowerOff className="h-3.5 w-3.5" /> Desactivar
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

// ─── Inactive Client Card ─────────────────────────────────────────────────────

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })
}

function daysBetween(from: string, to: string) {
  const a = new Date(from).getTime()
  const b = new Date(to).getTime()
  return Math.round(Math.abs(b - a) / (1000 * 60 * 60 * 24))
}

const EVENT_LABELS: Record<string, string> = {
  created: 'Cliente creado',
  deactivated: 'Cliente desactivado',
  reactivated: 'Cliente reactivado',
  modified: 'Datos modificados',
}

function InactiveClientCard({
  client, onReactivate, onDelete, tenantId, provider,
}: {
  client: Client
  onReactivate: () => void
  onDelete: () => void
  tenantId: string
  provider: SupabaseProvider
}) {
  const [expanded, setExpanded] = React.useState(false)
  const [events, setEvents] = React.useState<ClientEvent[]>([])
  const [loadingEvents, setLoadingEvents] = React.useState(false)
  const [eventsLoaded, setEventsLoaded] = React.useState(false)

  async function loadEvents() {
    if (eventsLoaded) return
    setLoadingEvents(true)
    const res = await provider.getClientEvents(tenantId, client.id)
    if (res.data) setEvents(res.data)
    setEventsLoaded(true)
    setLoadingEvents(false)
  }

  function handleToggle() {
    const next = !expanded
    setExpanded(next)
    if (next) loadEvents()
  }

  const deactivatedAt = client.deactivatedAt ?? client.updatedAt
  const days = daysBetween(client.createdAt, deactivatedAt)

  return (
    <Card
      className="relative overflow-hidden transition-all duration-200"
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderLeft: '3px solid var(--muted)',
        opacity: 0.85,
      }}
    >
      <CardContent className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="shrink-0 flex items-center justify-center rounded-xl text-white text-sm font-bold overflow-hidden"
              style={{
                width: 40,
                height: 40,
                background: client.logoUrl ? 'transparent' : 'var(--surface2)',
                border: '1px solid var(--border)',
              }}
            >
              {client.logoUrl
                ? <img src={client.logoUrl} alt={client.name} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(0.5)' }} />
                : <span style={{ color: 'var(--muted)', fontSize: 16 }}>{client.name.charAt(0).toUpperCase()}</span>
              }
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-sm truncate" style={{ color: 'var(--text)' }}>
                  {client.name}
                </h3>
                <span className="shrink-0 text-xs px-1.5 py-0.5 rounded-full font-medium" style={{ background: 'rgba(100,116,139,0.15)', color: 'var(--muted)', border: '1px solid var(--border)' }}>
                  Inactivo
                </span>
              </div>
              {client.industry && (
                <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
                  {client.industry}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Deactivation info */}
        <div className="rounded-lg px-3 py-2 mb-3 text-xs" style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}>
          <div className="flex items-center gap-1.5 mb-1">
            <Clock className="h-3 w-3" style={{ color: 'var(--muted)' }} />
            <span style={{ color: 'var(--muted)' }}>Desactivado el {formatDate(deactivatedAt)}</span>
          </div>
          <p style={{ color: 'var(--muted2)', fontWeight: 500 }}>
            {days === 0 ? 'Menos de 1 día de servicio' : `${days} día${days === 1 ? '' : 's'} de servicio`}
          </p>
        </div>

        {/* Timeline toggle */}
        <button
          onClick={handleToggle}
          className="flex items-center gap-1.5 w-full text-xs mb-3 hover:opacity-80 transition-opacity"
          style={{ color: 'var(--muted2)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          {expanded ? 'Ocultar historial de eventos' : 'Ver historial de eventos'}
        </button>

        {/* Timeline */}
        {expanded && (
          <div className="mb-3">
            {loadingEvents ? (
              <div className="flex items-center gap-2 py-2 text-xs" style={{ color: 'var(--muted)' }}>
                <Loader2 className="h-3 w-3 animate-spin" /> Cargando eventos...
              </div>
            ) : events.length === 0 ? (
              <p className="text-xs" style={{ color: 'var(--muted)' }}>Sin eventos registrados.</p>
            ) : (
              <div className="space-y-2 pl-2" style={{ borderLeft: '2px solid var(--border)' }}>
                {events.map(ev => (
                  <div key={ev.id} className="pl-3 relative">
                    <div
                      className="absolute left-0 top-1.5 w-1.5 h-1.5 rounded-full"
                      style={{
                        background: ev.eventType === 'deactivated' ? '#fbbf24'
                          : ev.eventType === 'reactivated' ? '#4ade80'
                          : ev.eventType === 'created' ? 'var(--accent)'
                          : 'var(--muted)',
                        transform: 'translateX(-4px)',
                      }}
                    />
                    <p className="text-xs font-medium" style={{ color: 'var(--text)' }}>
                      {EVENT_LABELS[ev.eventType] ?? ev.eventType}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--muted)' }}>
                      {formatDate(ev.occurredAt)}
                      {ev.notes ? ` · ${ev.notes}` : ''}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2" style={{ borderTop: '1px solid var(--border)' }}>
          <button
            onClick={onReactivate}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors hover:opacity-90"
            style={{ background: 'rgba(34,197,94,0.12)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.25)', cursor: 'pointer' }}
          >
            <RotateCcw className="h-3 w-3" /> Reactivar
          </button>
          <button
            onClick={onDelete}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors hover:opacity-90"
            style={{ background: 'rgba(239,68,68,0.08)', color: 'var(--coral)', border: '1px solid rgba(239,68,68,0.2)', cursor: 'pointer' }}
          >
            <Trash2 className="h-3 w-3" /> Eliminar
          </button>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type PageTab = 'active' | 'history'

export default function ClientsPage() {
  const { user } = useUser()
  const provider = React.useMemo(() => new SupabaseProvider(), [])

  const [clients, setClients] = React.useState<Client[]>([])
  const [vacancies, setVacancies] = React.useState<Vacancy[]>([])
  const [loading, setLoading] = React.useState(true)
  const [search, setSearch] = React.useState('')
  const [activeTab, setActiveTab] = React.useState<PageTab>('active')
  const [formOpen, setFormOpen] = React.useState(false)
  const [editingClient, setEditingClient] = React.useState<Client | undefined>()
  const [deletingClient, setDeletingClient] = React.useState<Client | undefined>()
  const [deactivatingClient, setDeactivatingClient] = React.useState<Client | undefined>()

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

  const activeClients = React.useMemo(() => clients.filter(c => c.active !== false), [clients])
  const inactiveClients = React.useMemo(() => clients.filter(c => c.active === false), [clients])

  const filteredActive = React.useMemo(() => {
    const q = search.toLowerCase()
    if (!q) return activeClients
    return activeClients.filter(
      c =>
        c.name.toLowerCase().includes(q) ||
        c.industry?.toLowerCase().includes(q) ||
        c.contactName?.toLowerCase().includes(q) ||
        c.contactEmail?.toLowerCase().includes(q)
    )
  }, [activeClients, search])

  const filteredInactive = React.useMemo(() => {
    const q = search.toLowerCase()
    if (!q) return inactiveClients
    return inactiveClients.filter(
      c =>
        c.name.toLowerCase().includes(q) ||
        c.industry?.toLowerCase().includes(q) ||
        c.contactName?.toLowerCase().includes(q) ||
        c.contactEmail?.toLowerCase().includes(q)
    )
  }, [inactiveClients, search])

  function vacancyCountFor(clientId: string) {
    return vacancies.filter(v => v.clientId === clientId && v.status !== 'Contratado').length
  }

  async function handleSaved(c: Client) {
    const isNew = !clients.find(x => x.id === c.id)
    setClients(prev => {
      const idx = prev.findIndex(x => x.id === c.id)
      if (idx !== -1) {
        const next = [...prev]
        next[idx] = c
        window.dispatchEvent(new CustomEvent('client:updated'))
        return next
      }
      window.dispatchEvent(new CustomEvent('client:created'))
      return [c, ...prev]
    })
    if (isNew && user?.tenantId) {
      await provider.logClientEvent(user.tenantId, c.id, c.name, 'created')
      window.dispatchEvent(new CustomEvent('client:created'))
    } else {
      window.dispatchEvent(new CustomEvent('client:updated'))
    }
  }

  async function handleDeactivate(client: Client) {
    if (!user?.tenantId) return
    const result = await provider.deactivateClient(client.id, client.name, user.tenantId)
    if (result.data) {
      setClients(prev => prev.map(c => c.id === client.id ? result.data! : c))
      window.dispatchEvent(new CustomEvent('client:updated'))
    }
    setDeactivatingClient(undefined)
  }

  async function handleReactivate(client: Client) {
    if (!user?.tenantId) return
    const result = await provider.reactivateClient(client.id, client.name, user.tenantId)
    if (result.data) {
      setClients(prev => prev.map(c => c.id === client.id ? result.data! : c))
      window.dispatchEvent(new CustomEvent('client:updated'))
    }
  }

  async function handleDelete(client: Client) {
    const clientVacs = vacancies.filter(v => v.clientId === client.id)
    const clientVacancyIds = clientVacs.map(v => v.id)
    await Promise.all(clientVacs.map(v => provider.snapshotApplicationsForVacancy(v.id, v.title, client.name)))
    await provider.archiveCandidatesForClient(client.id, clientVacancyIds)
    await Promise.all(clientVacs.map(v => provider.deleteVacancy(v.id)))
    await provider.deleteClient(client.id)
    setClients(prev => prev.filter(c => c.id !== client.id))
    setVacancies(prev => prev.filter(v => v.clientId !== client.id))
    setDeletingClient(undefined)
    window.dispatchEvent(new CustomEvent('client:deleted', { detail: { clientId: client.id } }))
    window.dispatchEvent(new CustomEvent('vacancy:updated'))
  }

  const atLimit = activeClients.length >= limits.clients

  // ── KPIs ───────────────────────────────────────────────────────────────────
  const totalActive = activeClients.length
  const clientsWithVacancy = activeClients.filter(c => vacancyCountFor(c.id) > 0).length
  const totalActiveVacancies = vacancies.filter(v => {
    const c = clients.find(cl => cl.id === v.clientId)
    return c && c.active !== false && v.status !== 'Contratado'
  }).length
  const clientsWithCandidates = activeClients.filter(c => {
    return vacancies.some(v => v.clientId === c.id && v.status !== 'Contratado' && v.status !== 'Descartado')
  }).length

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
        {activeTab === 'active' && (
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
        )}
      </div>

      {/* Tab switcher */}
      <div className="flex items-center gap-2 mb-6">
        {([
          { key: 'active', label: 'Clientes Activos', count: activeClients.length },
          { key: 'history', label: 'Historial de Clientes', count: inactiveClients.length },
        ] as { key: PageTab; label: string; count: number }[]).map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: '6px 16px',
              borderRadius: 999,
              fontSize: 13,
              fontWeight: 600,
              border: '1px solid',
              cursor: 'pointer',
              transition: 'all 0.15s',
              background: activeTab === tab.key ? 'var(--accent)' : 'var(--surface)',
              color: activeTab === tab.key ? '#fff' : 'var(--muted)',
              borderColor: activeTab === tab.key ? 'var(--accent)' : 'var(--border)',
            }}
          >
            {tab.label}
            {tab.count > 0 && (
              <span
                className="ml-1.5 text-xs px-1.5 py-0.5 rounded-full"
                style={{
                  background: activeTab === tab.key ? 'rgba(255,255,255,0.2)' : 'var(--surface2)',
                  color: activeTab === tab.key ? '#fff' : 'var(--muted)',
                }}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Plan limit banner (active tab only) */}
      {activeTab === 'active' && atLimit && (
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

      {/* KPIs (active tab only) */}
      {activeTab === 'active' && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Clientes activos', value: totalActive, sub: `de ${limits.clients === Infinity ? '∞' : limits.clients} en tu plan` },
            { label: 'Con vacantes abiertas', value: clientsWithVacancy, sub: 'tienen procesos activos' },
            { label: 'Vacantes asignadas', value: totalActiveVacancies, sub: 'vinculadas a un cliente' },
            { label: 'Con candidatos en proceso', value: clientsWithCandidates, sub: 'con postulantes activos' },
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
      )}

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
      ) : activeTab === 'active' ? (
        filteredActive.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Building2 className="h-12 w-12 mb-4" style={{ color: 'var(--muted)' }} />
            <h3 className="font-semibold text-lg mb-1" style={{ color: 'var(--text)' }}>
              {search ? 'Sin resultados' : 'Todavía no tenés clientes activos'}
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
            {filteredActive.map(client => (
              <ActiveClientCard
                key={client.id}
                client={client}
                vacancyCount={vacancyCountFor(client.id)}
                onEdit={() => { setEditingClient(client); setFormOpen(true) }}
                onDelete={() => setDeletingClient(client)}
                onDeactivate={() => setDeactivatingClient(client)}
              />
            ))}
          </div>
        )
      ) : (
        // History tab
        filteredInactive.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Clock className="h-12 w-12 mb-4" style={{ color: 'var(--muted)' }} />
            <h3 className="font-semibold text-lg mb-1" style={{ color: 'var(--text)' }}>
              {search ? 'Sin resultados' : 'No hay clientes inactivos en el historial'}
            </h3>
            <p className="text-sm max-w-xs" style={{ color: 'var(--muted)' }}>
              {search
                ? 'Probá con otro término de búsqueda.'
                : 'Los clientes desactivados aparecerán aquí con su historial de eventos.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredInactive.map(client => (
              <InactiveClientCard
                key={client.id}
                client={client}
                onReactivate={() => handleReactivate(client)}
                onDelete={() => setDeletingClient(client)}
                tenantId={user?.tenantId ?? ''}
                provider={provider}
              />
            ))}
          </div>
        )
      )}

      {/* Dialogs */}
      <ClientFormDialog
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditingClient(undefined) }}
        client={editingClient}
        onSave={handleSaved}
      />

      {deactivatingClient && (
        <DeactivateClientDialog
          client={deactivatingClient}
          onConfirm={() => handleDeactivate(deactivatingClient)}
          onClose={() => setDeactivatingClient(undefined)}
        />
      )}

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
