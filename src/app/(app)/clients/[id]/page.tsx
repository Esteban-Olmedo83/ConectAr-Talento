'use client'

import { use } from 'react'
import * as React from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Building2, Briefcase, Mail, Phone, Globe,
  Pencil, Trash2, ExternalLink, Users, ChevronRight,
  AlertCircle, Clock, TrendingUp, History,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DraggableModal } from '@/components/ui/draggable-modal'
import { SupabaseProvider } from '@/lib/providers/supabase-provider'
import { useUser } from '@/lib/context/user-context'
import type { Client, Vacancy, Application, Candidate } from '@/types'

// ─── Constants ────────────────────────────────────────────────────────────────

const INDUSTRIES = [
  'Tecnología', 'Finanzas', 'Salud', 'Retail', 'Manufactura',
  'Educación', 'Consultoría', 'Marketing', 'Logística', 'Energía',
  'Construcción', 'Medios', 'Agro', 'Turismo', 'Otro',
]

const STAGE_COLORS: Record<string, { bg: string; text: string }> = {
  'Nuevas Vacantes': { bg: 'rgba(99,102,241,0.15)',  text: '#818cf8' },
  'En Proceso':      { bg: 'rgba(59,130,246,0.15)',  text: '#60a5fa' },
  'Entrevistas':     { bg: 'rgba(245,158,11,0.15)',  text: '#fbbf24' },
  'Oferta Enviada':  { bg: 'rgba(16,185,129,0.15)',  text: '#34d399' },
  'Contratado':      { bg: 'rgba(34,197,94,0.15)',   text: '#4ade80' },
}

const PRIORITY_COLORS: Record<string, { bg: string; text: string }> = {
  Alta:  { bg: 'rgba(239,68,68,0.12)',   text: '#f87171' },
  Media: { bg: 'rgba(251,191,36,0.12)',  text: '#fbbf24' },
  Baja:  { bg: 'rgba(99,102,241,0.12)', text: '#818cf8' },
}

const FINAL_STAGES = new Set(['Entrevistas', 'Oferta Enviada', 'Contratado'])

// ─── Edit Client Dialog ───────────────────────────────────────────────────────

function EditClientDialog({ client, onClose, onSave }: {
  client: Client
  onClose: () => void
  onSave: (c: Client) => void
}) {
  const provider = React.useMemo(() => new SupabaseProvider(), [])
  const [saving, setSaving] = React.useState(false)
  const [saveError, setSaveError] = React.useState<string | null>(null)
  const [form, setForm] = React.useState({
    name: client.name,
    industry: client.industry ?? '',
    contactName: client.contactName ?? '',
    contactEmail: client.contactEmail ?? '',
    contactPhone: client.contactPhone ?? '',
    website: client.website ?? '',
    notes: client.notes ?? '',
  })

  function set(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) return
    setSaveError(null)
    setSaving(true)
    const result = await provider.updateClient(client.id, {
      name: form.name.trim(),
      industry: form.industry || undefined,
      contactName: form.contactName || undefined,
      contactEmail: form.contactEmail || undefined,
      contactPhone: form.contactPhone || undefined,
      website: form.website || undefined,
      notes: form.notes || undefined,
    })
    setSaving(false)
    if (result.data) {
      onSave(result.data)
      onClose()
    } else {
      setSaveError(result.error ?? 'Error al guardar')
    }
  }

  return (
    <DraggableModal open onClose={onClose} title="Editar cliente" maxWidth="32rem">
      <form onSubmit={handleSubmit} className="space-y-4 mt-2">
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
            style={{ background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)' }}
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: 'var(--muted2)' }}>
            Industria
          </label>
          <select
            value={form.industry}
            onChange={e => set('industry', e.target.value)}
            className="w-full rounded-lg px-3 py-2 text-sm outline-none"
            style={{ background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)' }}
          >
            <option value="">Seleccionar...</option>
            {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--muted2)' }}>Contacto</label>
            <input value={form.contactName} onChange={e => set('contactName', e.target.value)} placeholder="Nombre del contacto"
              className="w-full rounded-lg px-3 py-2 text-sm outline-none"
              style={{ background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)' }} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--muted2)' }}>Email</label>
            <input type="email" value={form.contactEmail} onChange={e => set('contactEmail', e.target.value)} placeholder="email@empresa.com"
              className="w-full rounded-lg px-3 py-2 text-sm outline-none"
              style={{ background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)' }} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--muted2)' }}>Teléfono</label>
            <input value={form.contactPhone} onChange={e => set('contactPhone', e.target.value)} placeholder="+54 11..."
              className="w-full rounded-lg px-3 py-2 text-sm outline-none"
              style={{ background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)' }} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--muted2)' }}>Sitio web</label>
            <input value={form.website} onChange={e => set('website', e.target.value)} placeholder="www.empresa.com"
              className="w-full rounded-lg px-3 py-2 text-sm outline-none"
              style={{ background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)' }} />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: 'var(--muted2)' }}>Notas internas</label>
          <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={3}
            placeholder="Contexto del cliente, preferencias, acuerdos..."
            className="w-full rounded-lg px-3 py-2 text-sm outline-none resize-none"
            style={{ background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)' }} />
        </div>
        {saveError && (
          <p className="text-xs px-3 py-2 rounded-lg" style={{ background: 'rgba(239,68,68,0.12)', color: '#f87171' }}>
            {saveError}
          </p>
        )}
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose} style={{ color: 'var(--muted2)' }}>Cancelar</Button>
          <Button type="submit" disabled={saving || !form.name.trim()} style={{ background: 'var(--accent)', color: '#fff' }}>
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </Button>
        </div>
      </form>
    </DraggableModal>
  )
}

// ─── Delete Confirm Dialog ────────────────────────────────────────────────────

function DeleteConfirmDialog({ name, onConfirm, onClose, deleting }: {
  name: string
  onConfirm: () => void
  onClose: () => void
  deleting: boolean
}) {
  return (
    <DraggableModal open onClose={onClose} title="Eliminar cliente" maxWidth="24rem">
      <p className="text-sm mt-2" style={{ color: 'var(--muted2)' }}>
        ¿Eliminar <strong style={{ color: 'var(--text)' }}>{name}</strong>? Las vacantes
        vinculadas quedarán sin cliente asignado.
      </p>
      <div className="flex justify-end gap-2 mt-4">
        <Button variant="ghost" onClick={onClose} style={{ color: 'var(--muted2)' }}>Cancelar</Button>
        <Button onClick={onConfirm} disabled={deleting} style={{ background: 'var(--coral)', color: '#fff' }}>
          {deleting ? 'Eliminando...' : 'Eliminar'}
        </Button>
      </div>
    </DraggableModal>
  )
}

// ─── Vacancy Row ──────────────────────────────────────────────────────────────

function VacancyRow({ vacancy, applications, clientId }: {
  vacancy: Vacancy
  applications: Application[]
  clientId: string
}) {
  const stageCount = React.useMemo(() => {
    const counts: Record<string, number> = {}
    applications.forEach(a => {
      counts[a.status] = (counts[a.status] ?? 0) + 1
    })
    return counts
  }, [applications])

  const stagePill = STAGE_COLORS[vacancy.status] ?? STAGE_COLORS['Nuevas Vacantes']
  const priorityPill = PRIORITY_COLORS[vacancy.priority] ?? PRIORITY_COLORS['Media']

  return (
    <div
      className="flex items-start justify-between gap-4 p-4 rounded-xl transition-colors hover:bg-[var(--surface2)]"
      style={{ border: '1px solid var(--border)' }}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1.5">
          <span
            className="text-sm font-semibold truncate"
            style={{ color: 'var(--text)' }}
          >
            {vacancy.title}
          </span>
          <span
            className="shrink-0 text-xs px-2 py-0.5 rounded-full font-medium"
            style={{ background: stagePill.bg, color: stagePill.text }}
          >
            {vacancy.status}
          </span>
          <span
            className="shrink-0 text-xs px-2 py-0.5 rounded-full"
            style={{ background: priorityPill.bg, color: priorityPill.text }}
          >
            {vacancy.priority}
          </span>
        </div>
        <p className="text-xs mb-2" style={{ color: 'var(--muted)' }}>{vacancy.department}</p>

        {/* Stage breakdown */}
        {applications.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            {Object.entries(stageCount).map(([stage, count]) => {
              const c = STAGE_COLORS[stage]
              return (
                <span
                  key={stage}
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{ background: c?.bg ?? 'var(--surface2)', color: c?.text ?? 'var(--muted2)' }}
                >
                  {count} {stage}
                </span>
              )
            })}
          </div>
        )}
        {applications.length === 0 && (
          <span className="text-xs" style={{ color: 'var(--muted)' }}>Sin candidatos aún</span>
        )}
      </div>

      <Link
        href={`/pipeline?client=${clientId}&vacancy=${vacancy.id}`}
        className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors hover:bg-[var(--surface)]"
        style={{ color: 'var(--accent)', border: '1px solid var(--border)' }}
      >
        <Briefcase className="h-3.5 w-3.5" />
        Pipeline
        <ChevronRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  )
}

// ─── Candidate Row ────────────────────────────────────────────────────────────

function CandidateRow({ application, candidate, vacancyTitle }: {
  application: Application | null
  candidate: Candidate | null
  vacancyTitle: string
}) {
  const resolvedCandidate = candidate ?? application?.candidate ?? null
  const stagePill = application
    ? (STAGE_COLORS[application.status] ?? STAGE_COLORS['Nuevas Vacantes'])
    : null
  const fallbackId = application?.candidateId ?? resolvedCandidate?.id ?? 'unknown'
  const name = resolvedCandidate?.fullName ?? `Candidato ${fallbackId.slice(0, 6)}`
  const email = resolvedCandidate?.email
  const score = resolvedCandidate?.atsScore

  return (
    <div
      className="flex items-center gap-3 p-3 rounded-xl"
      style={{ border: '1px solid var(--border)' }}
    >
      <div
        className="shrink-0 flex items-center justify-center rounded-full text-white text-xs font-bold"
        style={{
          width: 36,
          height: 36,
          background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
        }}
      >
        {name.charAt(0).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate" style={{ color: 'var(--text)' }}>{name}</p>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          {email && (
            <span className="text-xs truncate" style={{ color: 'var(--muted)' }}>{email}</span>
          )}
          <span className="text-xs" style={{ color: 'var(--muted2)' }}>·</span>
          <span className="text-xs truncate" style={{ color: 'var(--muted)' }}>{vacancyTitle}</span>
        </div>
      </div>
      <div className="shrink-0 flex items-center gap-2">
        {score !== undefined && score !== null && (
          <span
            className="text-xs px-2 py-0.5 rounded-full font-medium"
            style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8' }}
          >
            {score}%
          </span>
        )}
        {stagePill && application ? (
          <span
            className="text-xs px-2 py-0.5 rounded-full"
            style={{ background: stagePill.bg, color: stagePill.text }}
          >
            {application.status}
          </span>
        ) : (
          <span
            className="text-xs px-2 py-0.5 rounded-full"
            style={{ background: 'var(--surface2)', color: 'var(--muted2)' }}
          >
            Sin postulación
          </span>
        )}
      </div>
    </div>
  )
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="min-h-full p-4 sm:p-6 lg:p-8 space-y-6" style={{ background: 'var(--bg)' }}>
      <div className="h-8 w-32 rounded-lg animate-pulse" style={{ background: 'var(--surface)' }} />
      <div className="h-32 rounded-2xl animate-pulse" style={{ background: 'var(--surface)' }} />
      <div className="grid grid-cols-3 gap-3">
        {[0,1,2].map(i => (
          <div key={i} className="h-20 rounded-xl animate-pulse" style={{ background: 'var(--surface)' }} />
        ))}
      </div>
      <div className="space-y-3">
        {[0,1,2].map(i => (
          <div key={i} className="h-24 rounded-xl animate-pulse" style={{ background: 'var(--surface)' }} />
        ))}
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { user } = useUser()
  const provider = React.useMemo(() => new SupabaseProvider(), [])

  const [client, setClient] = React.useState<Client | null>(null)
  const [vacancies, setVacancies] = React.useState<Vacancy[]>([])
  const [applications, setApplications] = React.useState<Application[]>([])
  const [directCandidates, setDirectCandidates] = React.useState<Candidate[]>([])
  const [loading, setLoading] = React.useState(true)
  const [notFound, setNotFound] = React.useState(false)
  const [tab, setTab] = React.useState<'vacantes' | 'candidatos' | 'historial'>('vacantes')
  const [editOpen, setEditOpen] = React.useState(false)
  const [deleteOpen, setDeleteOpen] = React.useState(false)
  const [deleting, setDeleting] = React.useState(false)

  const load = React.useCallback(async () => {
    if (!user?.tenantId) return
    setLoading(true)
    const [cr, vr, ar, candResult] = await Promise.all([
      provider.getClients(user.tenantId),
      provider.getVacancies(user.tenantId),
      provider.getApplications(undefined, user.tenantId),
      provider.getCandidates(user.tenantId),
    ])
    const found = cr.data?.find(c => c.id === id) ?? null
    if (!found) {
      setNotFound(true)
      setLoading(false)
      return
    }
    setClient(found)
    const clientVacancies = (vr.data ?? []).filter(v => v.clientId === id)
    setVacancies(clientVacancies)
    const vacancyIds = new Set(clientVacancies.map(v => v.id))
    setApplications((ar.data ?? []).filter(a => a.vacancyId !== null && vacancyIds.has(a.vacancyId)))
    const directCands = (candResult.data ?? []).filter(c => c.clientId === id)
    setDirectCandidates(directCands)
    setLoading(false)
  }, [provider, user?.tenantId, id])

  React.useEffect(() => { load() }, [load])

  React.useEffect(() => {
    function handleChange() { load() }
    function handleVisibility() { if (document.visibilityState === 'visible') load() }
    const events = ['application:stage-changed', 'interview:scheduled', 'candidate:created', 'candidate:updated', 'vacancy:created', 'vacancy:updated']
    events.forEach(e => window.addEventListener(e, handleChange))
    document.addEventListener('visibilitychange', handleVisibility)
    return () => {
      events.forEach(e => window.removeEventListener(e, handleChange))
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [load])

  async function handleDelete() {
    if (!client) return
    setDeleting(true)
    await provider.deleteClient(client.id)
    setDeleting(false)
    router.push('/clients')
  }

  // ── Derived data ───────────────────────────────────────────────────────────
  const totalCandidates = React.useMemo(() => {
    const ids = new Set(applications.map(a => a.candidateId))
    directCandidates.forEach(c => ids.add(c.id))
    return ids.size
  }, [applications, directCandidates])
  const shortlisted = applications.filter(a => FINAL_STAGES.has(a.status)).length

  const appsByVacancy = React.useMemo(() => {
    const map = new Map<string, Application[]>()
    applications.forEach(a => {
      if (!a.vacancyId) return
      if (!map.has(a.vacancyId)) map.set(a.vacancyId, [])
      map.get(a.vacancyId)!.push(a)
    })
    return map
  }, [applications])

  const uniqueCandidateApps = React.useMemo(() => {
    const seen = new Set<string>()
    const result: Array<{ application: Application | null; candidate: Candidate | null; vacancyTitle: string }> = []
    // First, candidates via applications (sorted by most recently updated)
    applications
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      .forEach(a => {
        if (!seen.has(a.candidateId)) {
          seen.add(a.candidateId)
          const vacancy = vacancies.find(v => v.id === a.vacancyId)
          result.push({ application: a, candidate: a.candidate ?? null, vacancyTitle: vacancy?.title ?? '—' })
        }
      })
    // Then, directly-assigned candidates without an application
    directCandidates.forEach(c => {
      if (!seen.has(c.id)) {
        seen.add(c.id)
        result.push({ application: null, candidate: c, vacancyTitle: '—' })
      }
    })
    return result
  }, [applications, vacancies, directCandidates])

  const historialEntries = React.useMemo(() => {
    // All applications sorted by updatedAt DESC — one entry per application (not deduplicated)
    return [...applications]
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      .map(a => ({
        application: a,
        candidate: a.candidate ?? null,
        vacancy: vacancies.find(v => v.id === a.vacancyId) ?? null,
      }))
  }, [applications, vacancies])

  if (loading) return <Skeleton />

  if (notFound) {
    return (
      <div className="min-h-full flex flex-col items-center justify-center gap-4 p-8" style={{ background: 'var(--bg)' }}>
        <AlertCircle className="h-12 w-12" style={{ color: 'var(--muted)' }} />
        <h2 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>Cliente no encontrado</h2>
        <Button onClick={() => router.push('/clients')} style={{ background: 'var(--accent)', color: '#fff' }}>
          Volver a Clientes
        </Button>
      </div>
    )
  }

  if (!client) return null

  return (
    <div className="min-h-full p-4 sm:p-6 lg:p-8" style={{ background: 'var(--bg)' }}>
      {/* Back nav */}
      <Link
        href="/clients"
        className="inline-flex items-center gap-1.5 text-sm mb-6 hover:underline"
        style={{ color: 'var(--muted2)' }}
      >
        <ArrowLeft className="h-4 w-4" />
        Clientes
      </Link>

      {/* Header card */}
      <div
        className="rounded-2xl p-6 mb-6"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className="shrink-0 flex items-center justify-center rounded-2xl text-white text-2xl font-bold"
              style={{
                width: 64,
                height: 64,
                background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
              }}
            >
              {client.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
                {client.name}
              </h1>
              {client.industry && (
                <p className="text-sm mt-0.5" style={{ color: 'var(--muted)' }}>{client.industry}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEditOpen(true)}
              className="flex items-center gap-1.5"
              style={{ color: 'var(--muted2)' }}
            >
              <Pencil className="h-4 w-4" /> Editar
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDeleteOpen(true)}
              className="flex items-center gap-1.5"
              style={{ color: 'var(--coral)' }}
            >
              <Trash2 className="h-4 w-4" /> Eliminar
            </Button>
          </div>
        </div>

        {/* Contact row */}
        {(client.contactName || client.contactEmail || client.contactPhone || client.website) && (
          <div className="flex items-center gap-4 mt-4 pt-4 flex-wrap" style={{ borderTop: '1px solid var(--border)' }}>
            {client.contactName && (
              <span className="flex items-center gap-1.5 text-sm" style={{ color: 'var(--muted2)' }}>
                <Users className="h-4 w-4" style={{ color: 'var(--muted)' }} />
                {client.contactName}
              </span>
            )}
            {client.contactEmail && (
              <a href={`mailto:${client.contactEmail}`} className="flex items-center gap-1.5 text-sm hover:underline" style={{ color: 'var(--muted2)' }}>
                <Mail className="h-4 w-4" style={{ color: 'var(--muted)' }} />
                {client.contactEmail}
              </a>
            )}
            {client.contactPhone && (
              <span className="flex items-center gap-1.5 text-sm" style={{ color: 'var(--muted2)' }}>
                <Phone className="h-4 w-4" style={{ color: 'var(--muted)' }} />
                {client.contactPhone}
              </span>
            )}
            {client.website && (
              <a
                href={client.website.startsWith('http') ? client.website : `https://${client.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-sm hover:underline"
                style={{ color: 'var(--muted2)' }}
              >
                <Globe className="h-4 w-4" style={{ color: 'var(--muted)' }} />
                {client.website.replace(/^https?:\/\//, '')}
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
        )}

        {client.notes && (
          <p
            className="mt-4 pt-4 text-sm"
            style={{ color: 'var(--muted)', borderTop: '1px solid var(--border)' }}
          >
            {client.notes}
          </p>
        )}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: 'Vacantes', value: vacancies.length, sub: 'en este cliente', icon: Briefcase },
          { label: 'Candidatos', value: totalCandidates, sub: 'en total', icon: Users },
          { label: 'En shortlist', value: shortlisted, sub: 'en etapas finales', icon: Building2 },
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

      {/* Tabs */}
      <div className="flex gap-1 mb-4 p-1 rounded-xl w-fit" style={{ background: 'var(--surface)' }}>
        {([
          { key: 'vacantes', label: `Vacantes (${vacancies.length})` },
          { key: 'candidatos', label: `Candidatos (${totalCandidates})` },
          { key: 'historial', label: `Historial (${historialEntries.length})` },
        ] as const).map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={tab === t.key
              ? { background: 'var(--accent)', color: '#fff' }
              : { color: 'var(--muted2)' }
            }
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab: Vacantes */}
      {tab === 'vacantes' && (
        <div className="space-y-3">
          {vacancies.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-center">
              <Briefcase className="h-10 w-10 mb-3" style={{ color: 'var(--muted)' }} />
              <p className="font-medium" style={{ color: 'var(--text)' }}>Sin vacantes asignadas</p>
              <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
                Asigná este cliente al crear o editar una vacante.
              </p>
              <Link href="/vacancies">
                <Button className="mt-4" style={{ background: 'var(--accent)', color: '#fff' }}>
                  Ir a Vacantes
                </Button>
              </Link>
            </div>
          ) : (
            vacancies.map(v => (
              <VacancyRow
                key={v.id}
                vacancy={v}
                applications={appsByVacancy.get(v.id) ?? []}
                clientId={id}
              />
            ))
          )}
        </div>
      )}

      {/* Tab: Candidatos */}
      {tab === 'candidatos' && (
        <div className="space-y-2">
          {uniqueCandidateApps.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-center">
              <Users className="h-10 w-10 mb-3" style={{ color: 'var(--muted)' }} />
              <p className="font-medium" style={{ color: 'var(--text)' }}>Sin candidatos aún</p>
              <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
                Los candidatos aparecerán aquí cuando se los agregue a las vacantes de este cliente.
              </p>
            </div>
          ) : (
            uniqueCandidateApps.map(({ application, candidate, vacancyTitle }, idx) => (
              <CandidateRow
                key={application?.id ?? candidate?.id ?? idx}
                application={application}
                candidate={candidate}
                vacancyTitle={vacancyTitle}
              />
            ))
          )}
        </div>
      )}

      {/* Tab: Historial */}
      {tab === 'historial' && (
        <div className="space-y-2">
          {historialEntries.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-center">
              <History className="h-10 w-10 mb-3" style={{ color: 'var(--muted)' }} />
              <p className="font-medium" style={{ color: 'var(--text)' }}>Sin historial</p>
              <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
                Aquí aparecerá el registro de todos los candidatos que participaron en procesos para este cliente.
              </p>
            </div>
          ) : (
            historialEntries.map(({ application: app, candidate: c, vacancy: v }) => {
              const STAGE_COLORS_LOCAL: Record<string, { bg: string; text: string }> = {
                'Nuevas Vacantes': { bg: 'rgba(99,102,241,0.12)',  text: '#818cf8' },
                'En Proceso':      { bg: 'rgba(59,130,246,0.12)',  text: '#60a5fa' },
                'Entrevistas':     { bg: 'rgba(245,158,11,0.12)',  text: '#fbbf24' },
                'Oferta Enviada':  { bg: 'rgba(16,185,129,0.12)',  text: '#34d399' },
                'Contratado':      { bg: 'rgba(34,197,94,0.12)',   text: '#4ade80' },
                'Descartado':      { bg: 'rgba(107,114,128,0.12)', text: '#9ca3af' },
              }
              const stagePill = STAGE_COLORS_LOCAL[app.status] ?? STAGE_COLORS_LOCAL['En Proceso']
              const updatedDays = Math.floor((Date.now() - new Date(app.updatedAt).getTime()) / 86400000)
              const addedDays = Math.floor((Date.now() - new Date(app.appliedAt).getTime()) / 86400000)
              const candidateName = c?.fullName ?? '—'
              const initials = candidateName.split(/\s+/).filter(Boolean).map((p: string) => p[0]).slice(0, 2).join('').toUpperCase()
              return (
                <div
                  key={app.id}
                  className="rounded-xl p-4"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12 }}
                >
                  {/* Avatar */}
                  <div
                    style={{
                      width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                      background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff', fontSize: 13, fontWeight: 700,
                    }}
                  >
                    {initials}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p className="font-semibold text-sm" style={{ color: 'var(--text)' }}>{candidateName}</p>
                    <p className="text-xs" style={{ color: 'var(--muted)' }}>{v?.title ?? 'Sin vacante'}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
                      <span
                        style={{
                          fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 99,
                          background: stagePill.bg, color: stagePill.text,
                        }}
                      >
                        {app.status}
                      </span>
                      <span style={{ fontSize: 10, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Clock style={{ width: 10, height: 10 }} />
                        {updatedDays === 0 ? 'Hoy' : `Hace ${updatedDays}d`}
                      </span>
                      {addedDays !== updatedDays && (
                        <span style={{ fontSize: 10, color: 'var(--muted)' }}>
                          · Ingresó hace {addedDays}d
                        </span>
                      )}
                    </div>
                  </div>

                  {/* ATS score */}
                  {c?.atsScore != null && c.atsScore > 0 && (
                    <div
                      style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center',
                        padding: '6px 10px', borderRadius: 8, flexShrink: 0,
                        background: c.atsScore >= 80 ? 'rgba(52,211,153,0.1)' : c.atsScore >= 60 ? 'rgba(251,191,36,0.1)' : 'rgba(248,113,113,0.1)',
                        border: `1px solid ${c.atsScore >= 80 ? 'rgba(52,211,153,0.3)' : c.atsScore >= 60 ? 'rgba(251,191,36,0.3)' : 'rgba(248,113,113,0.3)'}`,
                      }}
                    >
                      <span style={{ fontSize: 14, fontWeight: 900, fontFamily: 'var(--font-nunito, Nunito, sans-serif)', color: c.atsScore >= 80 ? '#34d399' : c.atsScore >= 60 ? '#fbbf24' : '#f87171' }}>
                        {c.atsScore}
                      </span>
                      <span style={{ fontSize: 9, color: 'var(--muted)', fontWeight: 600 }}>ATS</span>
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      )}

      {/* Dialogs */}
      {editOpen && (
        <EditClientDialog
          client={client}
          onClose={() => setEditOpen(false)}
          onSave={updated => setClient(updated)}
        />
      )}
      {deleteOpen && (
        <DeleteConfirmDialog
          name={client.name}
          onConfirm={handleDelete}
          onClose={() => setDeleteOpen(false)}
          deleting={deleting}
        />
      )}
    </div>
  )
}
