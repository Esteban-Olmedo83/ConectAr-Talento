'use client'

import * as React from 'react'
import { Plus, Pencil, Trash2, Loader2, X, Copy, BookOpen } from 'lucide-react'
import { SupabaseProvider } from '@/lib/providers/supabase-provider'
import { useUser } from '@/lib/context/user-context'
import { useLanguage } from '@/lib/context/language-context'
import { skillsLibrary, rubros as builtinRubros } from '@/lib/skills'
import { DraggableModal } from '@/components/ui/draggable-modal'
import type { CustomJobProfile, JobRubro, CreateJobProfileInput, SkillProfile } from '@/types'

// ─── Types ────────────────────────────────────────────────────────────────────

type DisplayProfile =
  | { kind: 'builtin'; data: SkillProfile }
  | { kind: 'custom'; data: CustomJobProfile }

type NivelColor = {
  bg: string
  text: string
  border: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function nivelColors(nivel: string): NivelColor {
  switch (nivel) {
    case 'Junior':
      return { bg: 'rgba(96,165,250,0.15)', text: '#60a5fa', border: 'rgba(96,165,250,0.3)' }
    case 'Semi-Senior':
      return { bg: 'rgba(251,191,36,0.15)', text: '#fbbf24', border: 'rgba(251,191,36,0.3)' }
    case 'Senior':
      return { bg: 'rgba(52,211,153,0.15)', text: '#34d399', border: 'rgba(52,211,153,0.3)' }
    case 'Lead':
      return { bg: 'rgba(167,139,250,0.15)', text: '#a78bfa', border: 'rgba(167,139,250,0.3)' }
    default:
      return { bg: 'rgba(148,163,184,0.15)', text: 'var(--muted)', border: 'rgba(148,163,184,0.3)' }
  }
}

function chipList(items: string[], max: number) {
  const shown = items.slice(0, max)
  const remaining = items.length - shown.length
  return { shown, remaining }
}

const INPUT_CLASS =
  'bg-[var(--surface2)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)] w-full'

// ─── Chip Component ───────────────────────────────────────────────────────────

function Chip({ label }: { label: string }) {
  return (
    <span
      style={{
        background: 'var(--surface2)',
        border: '1px solid var(--border)',
        color: 'var(--text)',
        fontSize: '0.7rem',
        padding: '2px 8px',
        borderRadius: '9999px',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </span>
  )
}

function MoreChip({ count }: { count: number }) {
  return (
    <span
      style={{
        background: 'var(--surface2)',
        border: '1px solid var(--border)',
        color: 'var(--muted)',
        fontSize: '0.7rem',
        padding: '2px 8px',
        borderRadius: '9999px',
        whiteSpace: 'nowrap',
      }}
    >
      +{count} más
    </span>
  )
}

// ─── Profile Card ─────────────────────────────────────────────────────────────

function ProfileCard({
  profile,
  onEdit,
  onDelete,
  onPersonalizar,
}: {
  profile: DisplayProfile
  onEdit?: (p: CustomJobProfile) => void
  onDelete?: (id: string) => void
  onPersonalizar?: (p: SkillProfile) => void
}) {
  const isCustom = profile.kind === 'custom'
  const data = profile.data
  const nivel = data.nivel
  const colors = nivelColors(nivel)

  const tecnicas = isCustom
    ? (profile.data as CustomJobProfile).skills.tecnicas
    : (profile.data as SkillProfile).skills.tecnicas
  const blandas = isCustom
    ? (profile.data as CustomJobProfile).skills.blandas
    : (profile.data as SkillProfile).skills.blandas
  const herramientas = isCustom
    ? (profile.data as CustomJobProfile).skills.herramientas
    : (profile.data as SkillProfile).skills.herramientas

  const tecList = chipList(tecnicas, 5)
  const blaList = chipList(blandas, 3)
  const herList = chipList(herramientas, 3)

  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span
              style={{
                fontWeight: 700,
                fontSize: '0.95rem',
                color: 'var(--text)',
                lineHeight: 1.2,
              }}
            >
              {data.perfil}
            </span>
            <span
              style={{
                background: colors.bg,
                color: colors.text,
                border: `1px solid ${colors.border}`,
                fontSize: '0.68rem',
                fontWeight: 600,
                padding: '2px 8px',
                borderRadius: '9999px',
                whiteSpace: 'nowrap',
              }}
            >
              {nivel}
            </span>
          </div>
          <div
            style={{
              fontSize: '0.75rem',
              color: 'var(--muted)',
              marginTop: 2,
            }}
          >
            {data.rubro}
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
          {isCustom ? (
            <>
              <button
                onClick={() => onEdit?.(profile.data as CustomJobProfile)}
                title="Editar"
                style={{
                  background: 'none',
                  border: '1px solid var(--border)',
                  borderRadius: 6,
                  padding: '4px 6px',
                  cursor: 'pointer',
                  color: 'var(--muted)',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <Pencil size={13} />
              </button>
              <button
                onClick={() => onDelete?.((profile.data as CustomJobProfile).id)}
                title="Eliminar"
                style={{
                  background: 'none',
                  border: '1px solid var(--border)',
                  borderRadius: 6,
                  padding: '4px 6px',
                  cursor: 'pointer',
                  color: '#f87171',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <Trash2 size={13} />
              </button>
            </>
          ) : (
            <button
              onClick={() => onPersonalizar?.(profile.data as SkillProfile)}
              title="Personalizar"
              style={{
                background: 'none',
                border: '1px solid var(--border)',
                borderRadius: 6,
                padding: '4px 8px',
                cursor: 'pointer',
                color: 'var(--accent)',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                fontSize: '0.72rem',
                fontWeight: 500,
              }}
            >
              <Copy size={11} />
              Personalizar
            </button>
          )}
        </div>
      </div>

      {/* Skills Técnicas */}
      {tecnicas.length > 0 && (
        <div>
          <div
            style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}
          >
            Técnicas
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {tecList.shown.map((s) => (
              <Chip key={s} label={s} />
            ))}
            {tecList.remaining > 0 && <MoreChip count={tecList.remaining} />}
          </div>
        </div>
      )}

      {/* Skills Blandas */}
      {blandas.length > 0 && (
        <div>
          <div
            style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}
          >
            Blandas
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {blaList.shown.map((s) => (
              <Chip key={s} label={s} />
            ))}
            {blaList.remaining > 0 && <MoreChip count={blaList.remaining} />}
          </div>
        </div>
      )}

      {/* Herramientas */}
      {herramientas.length > 0 && (
        <div>
          <div
            style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}
          >
            Herramientas
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {herList.shown.map((s) => (
              <Chip key={s} label={s} />
            ))}
            {herList.remaining > 0 && <MoreChip count={herList.remaining} />}
          </div>
        </div>
      )}

      {/* Descripción típica */}
      {data.descripcionTipica && (
        <p
          style={{
            fontSize: '0.78rem',
            color: 'var(--muted)',
            fontStyle: 'italic',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            lineHeight: 1.5,
            margin: 0,
          }}
        >
          {data.descripcionTipica}
        </p>
      )}

      {/* Custom badge */}
      {isCustom && (
        <div>
          <span
            style={{
              background: 'rgba(var(--accent-rgb,99,102,241),0.12)',
              color: 'var(--accent)',
              border: '1px solid var(--accent-soft, rgba(99,102,241,0.3))',
              fontSize: '0.65rem',
              fontWeight: 600,
              padding: '2px 8px',
              borderRadius: '9999px',
              letterSpacing: '0.05em',
            }}
          >
            CUSTOM
          </span>
        </div>
      )}
    </div>
  )
}

// ─── Edit Rubro Modal ─────────────────────────────────────────────────────────

function EditRubroModal({
  rubro,
  onClose,
  onSave,
}: {
  rubro: JobRubro
  onClose: () => void
  onSave: (updated: JobRubro) => void
}) {
  const { t } = useLanguage()
  const provider = React.useMemo(() => new SupabaseProvider(), [])
  const [name, setName] = React.useState(rubro.name)
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    setName(rubro.name)
    setError(null)
  }, [rubro])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || name.trim() === rubro.name) { onClose(); return }
    setSaving(true)
    setError(null)
    const result = await provider.updateJobRubro(rubro.id, name.trim())
    setSaving(false)
    if (result.data) {
      onSave(result.data)
      onClose()
    } else {
      setError(result.error ?? 'Error al guardar')
    }
  }

  return (
    <DraggableModal open onClose={onClose} title="Editar Rubro" maxWidth="24rem">
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 500, color: 'var(--text)' }}>
              Nombre del rubro <span style={{ color: '#f87171' }}>*</span>
            </label>
            <input
              className={INPUT_CLASS}
              style={{ color: 'var(--text)' }}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Salud, Logística, Tecnología..."
              required
              autoFocus
            />
          </div>
          {error && (
            <p style={{ fontSize: '0.8rem', color: '#f87171' }}>{error}</p>
          )}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'none',
                border: '1px solid var(--border)',
                borderRadius: 8,
                padding: '8px 16px',
                fontSize: '0.85rem',
                color: 'var(--muted)',
                cursor: 'pointer',
              }}
            >
              {t.common.cancel}
            </button>
            <button
              type="submit"
              disabled={saving || !name.trim()}
              style={{
                background: 'var(--accent)',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                padding: '8px 18px',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: saving || !name.trim() ? 'not-allowed' : 'pointer',
                opacity: saving || !name.trim() ? 0.6 : 1,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              {saving && <Loader2 size={14} className="animate-spin" />}
              {t.common.save}
            </button>
          </div>
        </form>
    </DraggableModal>
  )
}

// ─── Nuevo Rubro Modal ────────────────────────────────────────────────────────

function NuevoRubroModal({
  open,
  onClose,
  onSave,
}: {
  open: boolean
  onClose: () => void
  onSave: (rubro: JobRubro) => void
}) {
  const { user } = useUser()
  const { t } = useLanguage()
  const provider = React.useMemo(() => new SupabaseProvider(), [])
  const [name, setName] = React.useState('')
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (open) {
      setName('')
      setError(null)
    }
  }, [open])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    setError(null)
    const result = await provider.createJobRubro({ tenantId: user?.tenantId ?? '', name: name.trim() })
    setSaving(false)
    if (result.data) {
      onSave(result.data)
      onClose()
    } else {
      setError(result.error ?? 'Error al guardar')
    }
  }

  return (
    <DraggableModal open={open} onClose={onClose} title="Nuevo Rubro" maxWidth="24rem">
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 500, color: 'var(--text)' }}>
              Nombre del rubro <span style={{ color: '#f87171' }}>*</span>
            </label>
            <input
              className={INPUT_CLASS}
              style={{ color: 'var(--text)' }}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Salud, Logística, Tecnología..."
              required
              autoFocus
            />
          </div>
          {error && (
            <p style={{ fontSize: '0.8rem', color: '#f87171' }}>{error}</p>
          )}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'none',
                border: '1px solid var(--border)',
                borderRadius: 8,
                padding: '8px 16px',
                fontSize: '0.85rem',
                color: 'var(--muted)',
                cursor: 'pointer',
              }}
            >
              {t.common.cancel}
            </button>
            <button
              type="submit"
              disabled={saving || !name.trim()}
              style={{
                background: 'var(--accent)',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                padding: '8px 18px',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: saving || !name.trim() ? 'not-allowed' : 'pointer',
                opacity: saving || !name.trim() ? 0.6 : 1,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              {saving && <Loader2 size={14} className="animate-spin" />}
              {t.common.save}
            </button>
          </div>
        </form>
    </DraggableModal>
  )
}

// ─── Profile Form Modal ───────────────────────────────────────────────────────

type ProfileFormState = {
  rubro: string
  rubroOtro: string
  perfil: string
  nivel: string
  tecnicas: string
  blandas: string
  herramientas: string
  certificaciones: string
  descripcionTipica: string
}

const EMPTY_FORM: ProfileFormState = {
  rubro: '',
  rubroOtro: '',
  perfil: '',
  nivel: 'Junior',
  tecnicas: '',
  blandas: '',
  herramientas: '',
  certificaciones: '',
  descripcionTipica: '',
}

function profileToForm(p: CustomJobProfile): ProfileFormState {
  return {
    rubro: p.rubro,
    rubroOtro: '',
    perfil: p.perfil,
    nivel: p.nivel,
    tecnicas: p.skills.tecnicas.join(', '),
    blandas: p.skills.blandas.join(', '),
    herramientas: p.skills.herramientas.join(', '),
    certificaciones: p.skills.certificaciones.join(', '),
    descripcionTipica: p.descripcionTipica,
  }
}

function skillProfileToForm(p: SkillProfile): ProfileFormState {
  return {
    rubro: p.rubro,
    rubroOtro: '',
    perfil: p.perfil,
    nivel: p.nivel,
    tecnicas: p.skills.tecnicas.join(', '),
    blandas: p.skills.blandas.join(', '),
    herramientas: p.skills.herramientas.join(', '),
    certificaciones: (p.skills.certificaciones ?? []).join(', '),
    descripcionTipica: p.descripcionTipica,
  }
}

function splitSkills(raw: string): string[] {
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

function ProfileFormModal({
  open,
  onClose,
  editProfile,
  allRubros,
  onSave,
  tenantId,
}: {
  open: boolean
  onClose: () => void
  editProfile: CustomJobProfile | null
  allRubros: string[]
  onSave: (p: CustomJobProfile) => void
  tenantId: string
}) {
  const { t } = useLanguage()
  const provider = React.useMemo(() => new SupabaseProvider(), [])
  const [form, setForm] = React.useState<ProfileFormState>(EMPTY_FORM)
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (open) {
      setForm(editProfile ? profileToForm(editProfile) : EMPTY_FORM)
      setError(null)
    }
  }, [open, editProfile])

  function set<K extends keyof ProfileFormState>(field: K, value: ProfileFormState[K]) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  const isOtroRubro = form.rubro === '__otro__'
  const effectiveRubro = isOtroRubro ? form.rubroOtro.trim() : form.rubro

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.perfil.trim() || !effectiveRubro) return
    setSaving(true)
    setError(null)

    const input: CreateJobProfileInput = {
      tenantId,
      rubro: effectiveRubro,
      perfil: form.perfil.trim(),
      nivel: form.nivel,
      skillsTecnicas: splitSkills(form.tecnicas),
      skillsBlandas: splitSkills(form.blandas),
      skillsHerramientas: splitSkills(form.herramientas),
      skillsCertificaciones: splitSkills(form.certificaciones),
      descripcionTipica: form.descripcionTipica.trim(),
    }

    const result = editProfile && editProfile.id
      ? await provider.updateJobProfile(editProfile.id, input)
      : await provider.createJobProfile(input)

    setSaving(false)
    if (result.data) {
      onSave(result.data)
      onClose()
    } else {
      setError(result.error ?? 'Error al guardar')
    }
  }

  return (
    <DraggableModal open={open} onClose={onClose} title={editProfile ? t.jobProfiles.dialog.editTitle : t.jobProfiles.dialog.createTitle} maxWidth="32rem">

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 8 }}>
          {/* Rubro */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 500, color: 'var(--text)' }}>
              Rubro <span style={{ color: '#f87171' }}>*</span>
            </label>
            <select
              className={INPUT_CLASS}
              style={{ color: 'var(--text)' }}
              value={form.rubro}
              onChange={(e) => set('rubro', e.target.value)}
              required={!isOtroRubro}
            >
              <option value="" disabled>Seleccionar rubro...</option>
              {allRubros.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
              <option value="__otro__">Otro...</option>
            </select>
            {isOtroRubro && (
              <input
                className={INPUT_CLASS}
                style={{ color: 'var(--text)', marginTop: 6 }}
                placeholder="Nombre del nuevo rubro"
                value={form.rubroOtro}
                onChange={(e) => set('rubroOtro', e.target.value)}
                required
                autoFocus
              />
            )}
          </div>

          {/* Nombre del perfil */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 500, color: 'var(--text)' }}>
              Nombre del perfil <span style={{ color: '#f87171' }}>*</span>
            </label>
            <input
              className={INPUT_CLASS}
              style={{ color: 'var(--text)' }}
              value={form.perfil}
              onChange={(e) => set('perfil', e.target.value)}
              placeholder="Ej: Frontend Developer, Analista Contable..."
              required
            />
          </div>

          {/* Nivel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 500, color: 'var(--text)' }}>
              Nivel
            </label>
            <select
              className={INPUT_CLASS}
              style={{ color: 'var(--text)' }}
              value={form.nivel}
              onChange={(e) => set('nivel', e.target.value)}
            >
              <option value="Junior">Junior</option>
              <option value="Semi-Senior">Semi-Senior</option>
              <option value="Senior">Senior</option>
              <option value="Lead">Lead</option>
            </select>
          </div>

          {/* Skills Técnicas */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 500, color: 'var(--text)' }}>
              Skills técnicas{' '}
              <span style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: 400 }}>
                — Separadas por coma
              </span>
            </label>
            <textarea
              className={INPUT_CLASS}
              style={{ color: 'var(--text)', resize: 'vertical', minHeight: 64 }}
              value={form.tecnicas}
              onChange={(e) => set('tecnicas', e.target.value)}
              placeholder="React, TypeScript, SQL..."
              rows={2}
            />
          </div>

          {/* Skills Blandas */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 500, color: 'var(--text)' }}>
              Skills blandas{' '}
              <span style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: 400 }}>
                — Separadas por coma
              </span>
            </label>
            <textarea
              className={INPUT_CLASS}
              style={{ color: 'var(--text)', resize: 'vertical', minHeight: 64 }}
              value={form.blandas}
              onChange={(e) => set('blandas', e.target.value)}
              placeholder="Trabajo en equipo, Comunicación..."
              rows={2}
            />
          </div>

          {/* Herramientas */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 500, color: 'var(--text)' }}>
              Herramientas{' '}
              <span style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: 400 }}>
                — Separadas por coma
              </span>
            </label>
            <textarea
              className={INPUT_CLASS}
              style={{ color: 'var(--text)', resize: 'vertical', minHeight: 48 }}
              value={form.herramientas}
              onChange={(e) => set('herramientas', e.target.value)}
              placeholder="Git, Jira, Figma..."
              rows={2}
            />
          </div>

          {/* Certificaciones */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 500, color: 'var(--text)' }}>
              Certificaciones{' '}
              <span style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: 400 }}>
                — Separadas por coma
              </span>
            </label>
            <textarea
              className={INPUT_CLASS}
              style={{ color: 'var(--text)', resize: 'vertical', minHeight: 48 }}
              value={form.certificaciones}
              onChange={(e) => set('certificaciones', e.target.value)}
              placeholder="AWS Certified, PMP..."
              rows={2}
            />
          </div>

          {/* Descripción típica */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 500, color: 'var(--text)' }}>
              Descripción típica
            </label>
            <textarea
              className={INPUT_CLASS}
              style={{ color: 'var(--text)', resize: 'vertical' }}
              value={form.descripcionTipica}
              onChange={(e) => set('descripcionTipica', e.target.value)}
              placeholder="Descripción del perfil y sus responsabilidades..."
              rows={3}
            />
          </div>

          {error && (
            <p style={{ fontSize: '0.8rem', color: '#f87171', margin: 0 }}>{error}</p>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, paddingTop: 4 }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'none',
                border: '1px solid var(--border)',
                borderRadius: 8,
                padding: '8px 16px',
                fontSize: '0.85rem',
                color: 'var(--muted)',
                cursor: 'pointer',
              }}
            >
              {t.common.cancel}
            </button>
            <button
              type="submit"
              disabled={saving}
              style={{
                background: 'var(--accent)',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                padding: '8px 20px',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: saving ? 'not-allowed' : 'pointer',
                opacity: saving ? 0.6 : 1,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              {saving && <Loader2 size={14} className="animate-spin" />}
              {t.common.save}
            </button>
          </div>
        </form>
    </DraggableModal>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function JobProfilesPage() {
  const { user } = useUser()
  const { t } = useLanguage()
  const provider = React.useMemo(() => new SupabaseProvider(), [])

  // State
  const [customProfiles, setCustomProfiles] = React.useState<CustomJobProfile[]>([])
  const [customRubros, setCustomRubros] = React.useState<JobRubro[]>([])
  const [loading, setLoading] = React.useState(true)
  const [loadError, setLoadError] = React.useState<string | null>(null)

  // UI state
  const [selectedRubro, setSelectedRubro] = React.useState<string>('all')
  const [rubroModalOpen, setRubroModalOpen] = React.useState(false)
  const [profileModalOpen, setProfileModalOpen] = React.useState(false)
  const [editingProfile, setEditingProfile] = React.useState<CustomJobProfile | null>(null)
  const [rubroToDelete, setRubroToDelete] = React.useState<JobRubro | null>(null)
  const [rubroToEdit, setRubroToEdit] = React.useState<JobRubro | null>(null)

  // Load data
  React.useEffect(() => {
    if (!user?.tenantId) return
    async function load() {
      setLoading(true)
      setLoadError(null)
      const [profilesRes, rubrosRes] = await Promise.all([
        provider.getJobProfiles(user!.tenantId),
        provider.getJobRubros(user!.tenantId),
      ])
      setLoading(false)
      if (profilesRes.error) setLoadError(profilesRes.error)
      else setCustomProfiles(profilesRes.data ?? [])
      if (rubrosRes.data) setCustomRubros(rubrosRes.data)
    }
    load()
  }, [user?.tenantId, provider])

  // All rubros (deduped)
  const allRubroNames = React.useMemo(() => {
    const customNames = customRubros.map((r) => r.name)
    return [...new Set([...builtinRubros, ...customNames])]
  }, [customRubros])

  // Display profiles filtered by rubro
  const displayProfiles = React.useMemo((): DisplayProfile[] => {
    const builtins: DisplayProfile[] = skillsLibrary
      .filter((p) => selectedRubro === 'all' || p.rubro === selectedRubro)
      .map((p) => ({ kind: 'builtin', data: p }))

    const customs: DisplayProfile[] = customProfiles
      .filter((p) => selectedRubro === 'all' || p.rubro === selectedRubro)
      .map((p) => ({ kind: 'custom', data: p }))

    return [...builtins, ...customs]
  }, [customProfiles, selectedRubro])

  // Stats
  const totalPerfiles = skillsLibrary.length + customProfiles.length
  const totalRubros = allRubroNames.length

  // Handlers
  function handleRubroSaved(rubro: JobRubro) {
    setCustomRubros((prev) => {
      const exists = prev.some((r) => r.id === rubro.id)
      return exists ? prev : [...prev, rubro]
    })
  }

  function handleProfileSaved(profile: CustomJobProfile) {
    setCustomProfiles((prev) => {
      const idx = prev.findIndex((p) => p.id === profile.id)
      if (idx !== -1) {
        const next = [...prev]
        next[idx] = profile
        return next
      }
      return [...prev, profile]
    })
  }

  function handleEditProfile(p: CustomJobProfile) {
    setEditingProfile(p)
    setProfileModalOpen(true)
  }

  async function handleDeleteProfile(id: string) {
    if (!confirm('¿Eliminar este perfil? Esta acción no se puede deshacer.')) return
    const result = await provider.deleteJobProfile(id)
    if (result.error) {
      alert(result.error)
    } else {
      setCustomProfiles((prev) => prev.filter((p) => p.id !== id))
    }
  }

  function handlePersonalizar(p: SkillProfile) {
    // Open edit modal pre-filled with built-in profile data (as new custom profile)
    const fakeCustom: CustomJobProfile = {
      id: '',
      tenantId: user?.tenantId ?? '',
      rubro: p.rubro,
      perfil: p.perfil,
      nivel: p.nivel,
      skills: {
        tecnicas: p.skills.tecnicas,
        blandas: p.skills.blandas,
        herramientas: p.skills.herramientas,
        certificaciones: p.skills.certificaciones ?? [],
      },
      descripcionTipica: p.descripcionTipica,
      createdAt: '',
    }
    setEditingProfile(fakeCustom)
    setProfileModalOpen(true)
  }

  function handleNewProfile() {
    setEditingProfile(null)
    setProfileModalOpen(true)
  }

  function handleProfileModalClose() {
    setProfileModalOpen(false)
    setEditingProfile(null)
  }

  // When saving from "Personalizar", we need to ensure id is empty so it creates new
  function handleProfileModalSave(p: CustomJobProfile) {
    handleProfileSaved(p)
  }

  async function handleDeleteRubro(rubro: JobRubro) {
    const result = await provider.deleteJobRubro(rubro.id)
    if (result.error) { alert(result.error); return }
    setCustomRubros(prev => prev.filter(r => r.id !== rubro.id))
    setCustomProfiles(prev => prev.filter(p => p.rubro !== rubro.name))
    if (selectedRubro === rubro.name) setSelectedRubro('all')
    setRubroToDelete(null)
  }

  function handleRubroEdited(updated: JobRubro) {
    const oldName = rubroToEdit?.name
    setCustomRubros(prev => prev.map(r => r.id === updated.id ? updated : r))
    if (oldName && oldName !== updated.name) {
      setCustomProfiles(prev => prev.map(p => p.rubro === oldName ? { ...p, rubro: updated.name } : p))
      if (selectedRubro === oldName) setSelectedRubro(updated.name)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg)',
        color: 'var(--text)',
        padding: '24px 16px',
        maxWidth: 1100,
        margin: '0 auto',
      }}
    >
      {/* ── Header ── */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 16,
          marginBottom: 24,
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <BookOpen size={22} style={{ color: 'var(--accent)' }} />
            <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text)', margin: 0 }}>
              Perfiles de Puestos
            </h1>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--muted)', margin: 0 }}>
            {totalPerfiles} perfiles · {totalRubros} rubros
          </p>
        </div>

        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          <button
            onClick={() => setRubroModalOpen(true)}
            style={{
              background: 'none',
              border: '1px solid var(--border)',
              borderRadius: 8,
              padding: '8px 14px',
              fontSize: '0.85rem',
              color: 'var(--text)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontWeight: 500,
            }}
          >
            <Plus size={15} />
            Nuevo Rubro
          </button>
          <button
            onClick={handleNewProfile}
            style={{
              background: 'var(--accent)',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '8px 16px',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <Plus size={15} />
            {t.jobProfiles.new}
          </button>
        </div>
      </div>

      {/* ── Rubro Tabs ── */}
      <div
        style={{
          marginBottom: 24,
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
          {/* "Todos" tab */}
          <button
            key="all"
            onClick={() => setSelectedRubro('all')}
            style={{
              background: selectedRubro === 'all' ? 'var(--accent)' : 'var(--surface)',
              color: selectedRubro === 'all' ? '#fff' : 'var(--muted)',
              border: selectedRubro === 'all' ? '1px solid var(--accent)' : '1px solid var(--border)',
              borderRadius: 20,
              padding: '6px 14px',
              fontSize: '0.82rem',
              fontWeight: selectedRubro === 'all' ? 600 : 400,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s',
            }}
          >
            Todos
          </button>

          {/* Builtin rubros (no edit/delete) */}
          {builtinRubros.map((rubro) => {
            const isActive = selectedRubro === rubro
            return (
              <button
                key={`builtin-${rubro}`}
                onClick={() => setSelectedRubro(rubro)}
                style={{
                  background: isActive ? 'var(--accent)' : 'var(--surface)',
                  color: isActive ? '#fff' : 'var(--muted)',
                  border: isActive ? '1px solid var(--accent)' : '1px solid var(--border)',
                  borderRadius: 20,
                  padding: '6px 14px',
                  fontSize: '0.82rem',
                  fontWeight: isActive ? 600 : 400,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s',
                }}
              >
                {rubro}
              </button>
            )
          })}

          {/* Custom rubros (with edit/delete) */}
          {customRubros.map((rubroObj) => {
            const rubro = rubroObj.name
            const isActive = selectedRubro === rubro
            return (
              <div key={`custom-${rubroObj.id}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
                <button
                  onClick={() => setSelectedRubro(rubro)}
                  style={{
                    background: isActive ? 'var(--accent)' : 'var(--surface)',
                    color: isActive ? '#fff' : 'var(--muted)',
                    border: isActive ? '1px solid var(--accent)' : '1px solid var(--border)',
                    borderRadius: 20,
                    padding: '6px 14px',
                    fontSize: '0.82rem',
                    fontWeight: isActive ? 600 : 400,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s',
                  }}
                >
                  {rubro}
                </button>
                <button
                  onClick={() => setRubroToEdit(rubroObj)}
                  title="Editar"
                  style={{
                    background: 'none',
                    border: 'none',
                    borderRadius: 6,
                    padding: '3px 4px',
                    cursor: 'pointer',
                    color: 'var(--muted)',
                    display: 'flex',
                    alignItems: 'center',
                    lineHeight: 1,
                  }}
                >
                  <Pencil size={11} />
                </button>
                <button
                  onClick={() => setRubroToDelete(rubroObj)}
                  title="Eliminar"
                  style={{
                    background: 'none',
                    border: 'none',
                    borderRadius: 6,
                    padding: '3px 4px',
                    cursor: 'pointer',
                    color: '#f87171',
                    display: 'flex',
                    alignItems: 'center',
                    lineHeight: 1,
                  }}
                >
                  <Trash2 size={11} />
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Content ── */}
      {loading ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            padding: '60px 0',
            color: 'var(--muted)',
          }}
        >
          <Loader2 size={20} className="animate-spin" />
          <span style={{ fontSize: '0.9rem' }}>Cargando perfiles...</span>
        </div>
      ) : loadError ? (
        <div
          style={{
            textAlign: 'center',
            padding: '60px 0',
            color: '#f87171',
            fontSize: '0.9rem',
          }}
        >
          <p>Error al cargar perfiles: {loadError}</p>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: 12,
              background: 'none',
              border: '1px solid var(--border)',
              borderRadius: 8,
              padding: '6px 16px',
              fontSize: '0.82rem',
              color: 'var(--muted)',
              cursor: 'pointer',
            }}
          >
            Reintentar
          </button>
        </div>
      ) : displayProfiles.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '60px 0',
            color: 'var(--muted)',
          }}
        >
          <BookOpen size={40} style={{ opacity: 0.3, marginBottom: 12 }} />
          <p style={{ fontSize: '0.95rem', marginBottom: 4 }}>
            {selectedRubro === 'all'
              ? t.jobProfiles.noProfiles
              : `${t.jobProfiles.noProfiles} · ${selectedRubro}`}
          </p>
          <p style={{ fontSize: '0.82rem', opacity: 0.7 }}>
            {t.jobProfiles.noProfilesSub}
          </p>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: 16,
          }}
        >
          {displayProfiles.map((profile) => {
            const key =
              profile.kind === 'builtin'
                ? `builtin-${profile.data.id}`
                : `custom-${profile.data.id}`
            return (
              <ProfileCard
                key={key}
                profile={profile}
                onEdit={handleEditProfile}
                onDelete={handleDeleteProfile}
                onPersonalizar={handlePersonalizar}
              />
            )
          })}
        </div>
      )}

      {/* ── Modals ── */}
      <NuevoRubroModal
        open={rubroModalOpen}
        onClose={() => setRubroModalOpen(false)}
        onSave={handleRubroSaved}
      />

      <ProfileFormModal
        open={profileModalOpen}
        onClose={handleProfileModalClose}
        editProfile={editingProfile}
        allRubros={allRubroNames}
        onSave={handleProfileModalSave}
        tenantId={user?.tenantId ?? ''}
      />

      {/* Delete rubro confirmation dialog */}
      {rubroToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setRubroToDelete(null)}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 16,
              padding: 24,
              maxWidth: 400,
              width: '100%',
            }}
          >
            <h3 style={{ color: 'var(--text)', fontSize: '1rem', fontWeight: 700, margin: 0 }}>
              Eliminar rubro &quot;{rubroToDelete.name}&quot;
            </h3>
            <p style={{ color: 'var(--muted)', fontSize: '0.875rem', marginTop: 8 }}>
              Todos los perfiles personalizados de este rubro también serán eliminados. Esta acción no se puede deshacer.
            </p>
            <div style={{ display: 'flex', gap: 8, marginTop: 20, justifyContent: 'flex-end' }}>
              <button
                onClick={() => setRubroToDelete(null)}
                style={{
                  background: 'none',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  padding: '8px 16px',
                  fontSize: '0.85rem',
                  color: 'var(--muted)',
                  cursor: 'pointer',
                }}
              >
                {t.common.cancel}
              </button>
              <button
                onClick={() => handleDeleteRubro(rubroToDelete)}
                style={{
                  background: '#ef4444',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  padding: '8px 16px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {t.common.delete}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit rubro modal */}
      {rubroToEdit && (
        <EditRubroModal
          rubro={rubroToEdit}
          onClose={() => setRubroToEdit(null)}
          onSave={(updated) => {
            handleRubroEdited(updated)
            setRubroToEdit(null)
          }}
        />
      )}
    </div>
  )
}
