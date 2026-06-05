'use client'

import * as React from 'react'
import {
  Plus, Search, Briefcase, Users, Clock, BarChart2,
  ChevronDown, MapPin, Laptop, Building2, Pencil,
  Archive, Rocket, MoreVertical, Globe, UserPlus, Check, X, Loader2,
  FileText, Calendar, AlertTriangle, Copy, ExternalLink, Share2,
} from 'lucide-react'
import { cn, formatRelativeDate, generateId } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { DraggableModal } from '@/components/ui/draggable-modal'
import { SupabaseProvider } from '@/lib/providers/supabase-provider'
import { useUser } from '@/lib/context/user-context'
import { getPlanLimits } from '@/lib/plan-limits'
import type { Client, Vacancy, VacancyModality, VacancyPriority, Candidate, CustomJobProfile, Interview, VacancyStatus, Application, RejectionReason } from '@/types'
import { rubros, getProfilesByRubro } from '@/lib/skills'
import { useLanguage } from '@/lib/context/language-context'

const PRIORITY_CONFIG: Record<VacancyPriority, { label: string; bg: string; color: string }> = {
  Alta: { label: 'Alta', bg: 'rgba(239,68,68,0.15)', color: '#f87171' },
  Media: { label: 'Media', bg: 'rgba(251,191,36,0.15)', color: '#fbbf24' },
  Baja: { label: 'Baja', bg: 'rgba(107,114,128,0.15)', color: '#9ca3af' },
}

const MODALITY_ICONS: Record<VacancyModality, React.ElementType> = {
  Presencial: Building2,
  Remoto: Laptop,
  Híbrido: Globe,
}

const STAGE_COLORS: Record<string, string> = {
  'Nuevas Vacantes': '#94a3b8',
  'En Proceso': '#38bdf8',
  'Entrevistas': '#a78bfa',
  'Oferta Enviada': '#fbbf24',
  'Contratado': '#34d399',
  'Descartado': '#6b7280',
}

const STAGE_ORDER_SUMMARY: VacancyStatus[] = ['Contratado', 'Oferta Enviada', 'Entrevistas', 'En Proceso', 'Nuevas Vacantes', 'Descartado']

function scoreColorUI(s: number) {
  return s >= 85 ? '#34d399' : s >= 70 ? '#a78bfa' : s >= 50 ? '#fbbf24' : '#9ca3af'
}

// ─── Vacancy Form ─────────────────────────────────────────────────────────────
function VacancyFormDialog({
  open, onClose, vacancy, onSave
}: {
  open: boolean
  onClose: () => void
  vacancy?: Vacancy
  onSave: (v: Vacancy) => void
}) {
  const { user } = useUser()
  const { t } = useLanguage()
  const provider = React.useMemo(() => new SupabaseProvider(), [])
  const [clients, setClients] = React.useState<Client[]>([])
  const [customProfiles, setCustomProfiles] = React.useState<CustomJobProfile[]>([])
  const [customRubros, setCustomRubros] = React.useState<string[]>([])
  const [manualPerfil, setManualPerfil] = React.useState(false)
  const [form, setForm] = React.useState({
    clientId: vacancy?.clientId ?? '',
    title: vacancy?.title ?? '',
    department: vacancy?.department ?? '',
    rubro: vacancy?.rubro ?? '',
    perfil: vacancy?.perfil ?? '',
    modality: (vacancy?.modality ?? 'Remoto') as VacancyModality,
    priority: (vacancy?.priority ?? 'Media') as VacancyPriority,
    location: vacancy?.location ?? '',
    salaryMin: vacancy?.salaryMin?.toString() ?? '',
    salaryMax: vacancy?.salaryMax?.toString() ?? '',
    currency: vacancy?.currency ?? 'ARS',
    requirements: vacancy?.requirements.join(', ') ?? '',
    description: vacancy?.description ?? '',
    closingDate: vacancy?.closingDate?.slice(0, 10) ?? '',
  })
  const [generating, setGenerating] = React.useState(false)
  const [saving, setSaving] = React.useState(false)

  React.useEffect(() => {
    if (open && user?.tenantId) {
      provider.getClients(user.tenantId).then(r => { if (r.data) setClients(r.data) })
      provider.getJobProfiles(user.tenantId).then(r => {
        if (r.data) {
          setCustomProfiles(r.data)
          // Extract unique rubros from custom profiles
          const uniqueRubros = [...new Set(r.data.map(p => p.rubro).filter(Boolean))]
          setCustomRubros(uniqueRubros)
        }
      })
      provider.getJobRubros(user.tenantId).then(r => {
        if (r.data) {
          setCustomRubros(prev => [...new Set([...prev, ...r.data!.map(r => r.name)])])
        }
      })
    }
  }, [open, user?.tenantId])

  React.useEffect(() => {
    if (!open) return
    setManualPerfil(false)
    setForm({
      clientId: vacancy?.clientId ?? '',
      title: vacancy?.title ?? '',
      department: vacancy?.department ?? '',
      rubro: vacancy?.rubro ?? '',
      perfil: vacancy?.perfil ?? '',
      modality: (vacancy?.modality ?? 'Remoto') as VacancyModality,
      priority: (vacancy?.priority ?? 'Media') as VacancyPriority,
      location: vacancy?.location ?? '',
      salaryMin: vacancy?.salaryMin?.toString() ?? '',
      salaryMax: vacancy?.salaryMax?.toString() ?? '',
      currency: vacancy?.currency ?? 'ARS',
      requirements: vacancy?.requirements?.join(', ') ?? '',
      description: vacancy?.description ?? '',
      closingDate: vacancy?.closingDate?.slice(0, 10) ?? '',
    })
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  const profileOptions = React.useMemo(() => {
    if (!form.rubro) return []
    const builtin = getProfilesByRubro(form.rubro).map(p => ({ id: p.id, label: `${p.perfil} · ${p.nivel}`, perfil: p.perfil, skills: [...p.skills.tecnicas, ...p.skills.blandas] }))
    const custom = customProfiles.filter(p => p.rubro === form.rubro).map(p => ({ id: p.id, label: `${p.perfil} · ${p.nivel} ★`, perfil: p.perfil, skills: [...p.skills.tecnicas, ...p.skills.blandas] }))
    return [...builtin, ...custom]
  }, [form.rubro, customProfiles])

  function handleProfileSelect(value: string) {
    if (value === '__manual__') { setManualPerfil(true); setForm(f => ({...f, perfil: ''})); return }
    setManualPerfil(false)
    const opt = profileOptions.find(o => o.perfil === value)
    if (!opt) return
    setForm(f => ({
      ...f,
      perfil: opt.perfil,
      title: f.title || opt.perfil,
      requirements: opt.skills.join(', '),
    }))
  }

  async function generateDescription() {
    if (!form.title) return
    setGenerating(true)
    try {
      const aiHeaders: Record<string, string> = { 'Content-Type': 'application/json' }
      try {
        const raw = localStorage.getItem('ct_ai_config')
        if (raw) {
          const cfg = JSON.parse(raw) as { provider?: string; apiKey?: string }
          if (cfg.apiKey) aiHeaders['x-ai-api-key'] = cfg.apiKey
        }
      } catch { /* noop */ }

      const res = await fetch('/api/ai/generate-jd', {
        method: 'POST',
        headers: aiHeaders,
        body: JSON.stringify({
          title: form.title,
          department: form.department,
          modality: form.modality,
          requirements: form.requirements.split(',').map(s => s.trim()).filter(Boolean),
          salaryRange: form.salaryMin ? `${form.currency} ${form.salaryMin} - ${form.salaryMax}` : undefined,
        }),
      })
      const data = await res.json()
      setForm(f => ({ ...f, description: data.jobDescription ?? f.description }))
    } catch { /* noop */ }
    finally { setGenerating(false) }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const tenantId = user?.tenantId ?? ''
    const input = {
      tenantId,
      clientId: form.clientId || undefined,
      title: form.title,
      department: form.department,
      status: vacancy ? vacancy.status : 'Nuevas Vacantes' as const,
      modality: form.modality,
      priority: form.priority,
      location: form.location || undefined,
      salaryMin: form.salaryMin ? Number(form.salaryMin) : undefined,
      salaryMax: form.salaryMax ? Number(form.salaryMax) : undefined,
      currency: form.currency || undefined,
      requirements: form.requirements.split(',').map(s => s.trim()).filter(Boolean),
      description: form.description || undefined,
      closingDate: form.closingDate || undefined,
      rubro: form.rubro,
      perfil: form.perfil,
    }
    const result = vacancy
      ? await provider.updateVacancy(vacancy.id, input)
      : await provider.createVacancy(input)
    setSaving(false)
    if (result.data) {
      // Notify any alive pipeline page instance so it refetches even when served
      // from the Next.js router cache (no full remount occurs in that case).
      window.dispatchEvent(new CustomEvent(vacancy ? 'vacancy:updated' : 'vacancy:created'))
      onSave(result.data)
      onClose()
    }
  }

  const inputCls = 'w-full px-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring'
  const labelCls = 'text-xs font-medium text-muted-foreground mb-1 block'

  return (
    <DraggableModal open={open} onClose={onClose} title={vacancy ? t.vacancies.dialog.editTitle : t.vacancies.dialog.createTitle} maxWidth="42rem">
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* Rubro + Perfil selector */}
          <div
            className="grid grid-cols-2 gap-3 p-3 rounded-lg border"
            style={{ background: 'var(--accent-soft)', borderColor: 'var(--accent)' }}
          >
            <div>
              <label className={cn(labelCls)} style={{ color: 'var(--accent-2)' }}>{t.vacancies.fields.area}</label>
              <select value={form.rubro} onChange={e => setForm(f => ({...f, rubro: e.target.value, perfil: ''}))}
                className={inputCls}>
                <option value="">Seleccioná un rubro</option>
                {[...new Set([...rubros, ...customRubros])].map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className={cn(labelCls, 'truncate')} style={{ color: 'var(--accent-2)' }}>Perfil del puesto</label>
              {manualPerfil ? (
                <div className="flex gap-1">
                  <input
                    value={form.perfil}
                    onChange={e => setForm(f => ({...f, perfil: e.target.value}))}
                    placeholder="Escribí el nombre del perfil"
                    className={cn(inputCls, 'flex-1')}
                  />
                  <button type="button" onClick={() => { setManualPerfil(false); setForm(f => ({...f, perfil: ''})) }}
                    className="px-2 rounded-md border border-input text-muted-foreground hover:bg-muted">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <select value={form.perfil} onChange={e => handleProfileSelect(e.target.value)}
                  disabled={!form.rubro}
                  className={cn(inputCls, 'disabled:opacity-50')}>
                  <option value="">Seleccioná un perfil</option>
                  {profileOptions.map(p => <option key={p.id} value={p.perfil}>{p.label}</option>)}
                  <option value="__manual__">✏️ Ingresar manualmente...</option>
                </select>
              )}
            </div>
          </div>

          {/* Client selector */}
          <div>
            <label className={labelCls}>{t.vacancies.fields.client}</label>
            <select
              value={form.clientId}
              onChange={e => setForm(f => ({...f, clientId: e.target.value}))}
              className={inputCls}
            >
              <option value="">Sin cliente asignado</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>{t.vacancies.fields.title} *</label>
              <input required value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))} className={inputCls} placeholder="Frontend Developer Senior" />
            </div>
            <div>
              <label className={labelCls}>Departamento *</label>
              <input required value={form.department} onChange={e => setForm(f => ({...f, department: e.target.value}))} className={inputCls} placeholder="Tecnología" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={labelCls}>{t.vacancies.fields.modality}</label>
              <select value={form.modality} onChange={e => setForm(f => ({...f, modality: e.target.value as VacancyModality}))} className={inputCls}>
                <option>Remoto</option><option>Presencial</option><option>Híbrido</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>{t.vacancies.fields.priority}</label>
              <select value={form.priority} onChange={e => setForm(f => ({...f, priority: e.target.value as VacancyPriority}))} className={inputCls}>
                <option>Alta</option><option>Media</option><option>Baja</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Fecha de cierre</label>
              <input type="date" value={form.closingDate} onChange={e => setForm(f => ({...f, closingDate: e.target.value}))} className={inputCls} />
            </div>
          </div>

          <div>
            <label className={labelCls}>{t.vacancies.fields.location}</label>
            <input value={form.location} onChange={e => setForm(f => ({...f, location: e.target.value}))} className={inputCls} placeholder="Buenos Aires, Argentina" />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={labelCls}>Moneda</label>
              <select value={form.currency} onChange={e => setForm(f => ({...f, currency: e.target.value}))} className={inputCls}>
                <option value="ARS">ARS</option><option value="USD">USD</option><option value="MXN">MXN</option><option value="COP">COP</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Salario mínimo</label>
              <input type="number" value={form.salaryMin} onChange={e => setForm(f => ({...f, salaryMin: e.target.value}))} className={inputCls} placeholder="800000" />
            </div>
            <div>
              <label className={labelCls}>Salario máximo</label>
              <input type="number" value={form.salaryMax} onChange={e => setForm(f => ({...f, salaryMax: e.target.value}))} className={inputCls} placeholder="1200000" />
            </div>
          </div>

          <div>
            <label className={labelCls}>{t.vacancies.fields.requirements}</label>
            <input value={form.requirements} onChange={e => setForm(f => ({...f, requirements: e.target.value}))} className={inputCls} placeholder="React, TypeScript, 3 años de experiencia, inglés intermedio" />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className={labelCls}>{t.vacancies.fields.description}</label>
              <Button type="button" variant="outline" size="sm" onClick={generateDescription} disabled={!form.title || generating}
                className="text-xs gap-1 h-6 px-2">
                {generating ? '⏳ Generando...' : '✨ Generar con IA'}
              </Button>
            </div>
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({...f, description: e.target.value}))}
              className={cn(inputCls, 'resize-none h-32')}
              placeholder="Describí el puesto, responsabilidades y lo que ofrecés..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>{t.common.cancel}</Button>
            <Button type="submit" disabled={saving}>
              {saving ? '⏳ Guardando...' : vacancy ? t.common.save : t.vacancies.dialog.createTitle}
            </Button>
          </div>
        </form>
    </DraggableModal>
  )
}

// ─── Vacancy Process Summary Modal ───────────────────────────────────────────
function VacancyProcessSummaryModal({ vacancy, onClose }: {
  vacancy: Vacancy
  onClose: () => void
}) {
  const provider = React.useMemo(() => new SupabaseProvider(), [])
  const [interviews, setInterviews] = React.useState<Interview[]>([])
  const [loading, setLoading] = React.useState(true)

  const apps = vacancy.applications ?? []

  React.useEffect(() => {
    let cancelled = false
    async function fetchInterviews() {
      const candidateIds = [...new Set(apps.map(a => a.candidateId))]
      if (candidateIds.length === 0) {
        if (!cancelled) setLoading(false)
        return
      }
      const results = await Promise.all(candidateIds.map(id => provider.getInterviews(id)))
      if (!cancelled) {
        setInterviews(results.flatMap(r => r.data ?? []))
        setLoading(false)
      }
    }
    fetchInterviews()
    return () => { cancelled = true }
  }, [vacancy.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const byStage = React.useMemo(() => {
    const groups = {} as Record<VacancyStatus, typeof apps>
    for (const stage of STAGE_ORDER_SUMMARY) {
      const stageApps = apps.filter(a => a.status === stage)
      if (stageApps.length > 0) groups[stage] = stageApps
    }
    return groups
  }, [apps])

  function handlePrint() {
    const today = new Date().toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })
    const closingDate = vacancy.closingDate
      ? new Date(vacancy.closingDate).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })
      : '—'

    const stagesHtml = STAGE_ORDER_SUMMARY
      .filter(stage => byStage[stage]?.length > 0)
      .map(stage => {
        const stageColor = STAGE_COLORS[stage] ?? '#6b7280'
        return `
          <div style="margin-bottom:28px;">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;padding-bottom:8px;border-bottom:2px solid ${stageColor}55;">
              <div style="width:10px;height:10px;border-radius:50%;background:${stageColor};flex-shrink:0;"></div>
              <h3 style="font-size:13px;font-weight:700;color:${stageColor};text-transform:uppercase;letter-spacing:0.06em;margin:0;">
                ${stage} — ${byStage[stage].length} candidato${byStage[stage].length !== 1 ? 's' : ''}
              </h3>
            </div>
            ${byStage[stage].map(app => {
              const c = app.candidate
              if (!c) return ''
              const cInterviews = interviews.filter(i => i.candidateId === c.id)
              return `
                <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;padding:14px 16px;margin-bottom:10px;">
                  <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:6px;">
                    <div>
                      <p style="font-size:15px;font-weight:700;color:#111827;margin:0;">${c.fullName}</p>
                      <p style="font-size:12px;color:#6b7280;margin:3px 0 0;">${c.email}${c.phone ? ' · ' + c.phone : ''}</p>
                    </div>
                    ${c.atsScore ? `<span style="font-size:12px;font-weight:700;padding:3px 10px;border-radius:6px;background:${scoreColorUI(c.atsScore)}22;color:${scoreColorUI(c.atsScore)};white-space:nowrap;flex-shrink:0;">${c.atsScore} pts</span>` : ''}
                  </div>
                  ${c.skills?.length ? `<p style="font-size:11px;color:#6b7280;margin:4px 0;">Skills: ${c.skills.join(', ')}</p>` : ''}
                  <p style="font-size:11px;color:#9ca3af;margin:4px 0 0;">
                    Ingreso: ${new Date(app.appliedAt).toLocaleDateString('es-AR')} · Actualizado: ${new Date(app.updatedAt).toLocaleDateString('es-AR')}
                  </p>
                  ${cInterviews.length > 0 ? `
                    <div style="margin-top:10px;padding-top:10px;border-top:1px solid #e5e7eb;">
                      <p style="font-size:11px;font-weight:600;color:#a78bfa;text-transform:uppercase;letter-spacing:0.04em;margin:0 0 6px;">Entrevistas</p>
                      ${cInterviews.map(i => `
                        <div style="display:flex;align-items:center;gap:6px;font-size:11px;color:#6b7280;margin-bottom:4px;">
                          <span style="color:#a78bfa;font-weight:600;">${i.type}</span>
                          <span>·</span><span>${i.meetingPlatform}</span>
                          <span>·</span><span>${new Date(i.scheduledAt).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                          ${i.interviewerName ? `<span>· <strong>${i.interviewerName}</strong></span>` : ''}
                          ${i.notes ? `<br/><span style="color:#9ca3af;padding-left:4px;">Nota: "${i.notes}"</span>` : ''}
                        </div>
                      `).join('')}
                    </div>
                  ` : ''}
                </div>
              `
            }).join('')}
          </div>
        `
      }).join('')

    const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8"/>
  <title>Informe de Proceso — ${vacancy.title}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #111; background: #fff; padding: 32px; max-width: 800px; margin: 0 auto; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <div style="background:linear-gradient(135deg,#5D50D6,#8B7EFF);padding:28px 32px;border-radius:14px;margin-bottom:28px;color:#fff;">
    <p style="font-size:11px;font-weight:600;opacity:0.65;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:8px;">Informe de Proceso de Selección</p>
    <h1 style="font-size:26px;font-weight:800;margin-bottom:6px;">${vacancy.title}</h1>
    ${vacancy.client?.name ? `<p style="font-size:15px;opacity:0.85;margin-bottom:4px;">${vacancy.client.name}</p>` : ''}
    <p style="font-size:13px;opacity:0.65;">${vacancy.department} · ${vacancy.modality}${vacancy.location ? ' · ' + vacancy.location : ''}</p>
    <div style="display:flex;gap:24px;margin-top:14px;padding-top:14px;border-top:1px solid rgba(255,255,255,0.2);">
      <div><p style="font-size:22px;font-weight:800;">${apps.length}</p><p style="font-size:11px;opacity:0.65;">Candidatos totales</p></div>
      <div><p style="font-size:22px;font-weight:800;color:#86efac;">${apps.filter(a => a.status === 'Contratado').length}</p><p style="font-size:11px;opacity:0.65;">Contratados</p></div>
      <div><p style="font-size:22px;font-weight:800;color:#c4b5fd;">${apps.filter(a => a.status === 'Entrevistas').length}</p><p style="font-size:11px;opacity:0.65;">Entrevistados</p></div>
      <div><p style="font-size:22px;font-weight:800;color:#fcd34d;">${apps.filter(a => a.status === 'Oferta Enviada').length}</p><p style="font-size:11px;opacity:0.65;">Con oferta</p></div>
    </div>
    <p style="font-size:11px;opacity:0.45;margin-top:12px;">Fecha de cierre: ${closingDate} · Generado: ${today}</p>
  </div>

  ${stagesHtml}

  <div style="margin-top:32px;padding-top:16px;border-top:1px solid #e5e7eb;text-align:center;">
    <p style="font-size:11px;color:#9ca3af;">ConectAr Talento · Informe generado el ${today}</p>
  </div>
  <script>window.onload = function(){ window.print(); }</script>
</body>
</html>`
    const win = window.open('', '_blank')
    if (win) { win.document.write(html); win.document.close() }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      
    >
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, width: '100%', maxWidth: 'min(680px, 95vw)', maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 64px rgba(0,0,0,0.5)', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(93,80,214,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Briefcase style={{ width: 15, height: 15, color: 'var(--accent-2)' }} />
            </div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>Resumen del proceso</p>
              <p style={{ fontSize: 12, color: 'var(--muted)' }}>{vacancy.title}{vacancy.client?.name ? ` · ${vacancy.client.name}` : ''}</p>
            </div>
          </div>
          <button onClick={onClose} style={{ padding: 6, borderRadius: 6, background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--muted)' }}>
            <X style={{ width: 16, height: 16 }} />
          </button>
        </div>

        {/* Stats strip */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)' }}>
          {[
            { label: 'Total', value: apps.length, color: 'var(--text)' },
            { label: 'Contratados', value: apps.filter(a => a.status === 'Contratado').length, color: '#34d399' },
            { label: 'Entrevistados', value: apps.filter(a => a.status === 'Entrevistas').length, color: '#a78bfa' },
            { label: 'Descartados', value: apps.filter(a => a.status === 'Descartado').length, color: '#6b7280' },
          ].map((s, i) => (
            <div key={s.label} style={{ flex: 1, padding: '10px 8px', textAlign: 'center', background: 'var(--surface2)', borderRight: i < 3 ? '1px solid var(--border)' : 'none' }}>
              <p style={{ fontSize: 20, fontWeight: 800, color: s.color, margin: 0 }}>{s.value}</p>
              <p style={{ fontSize: 10, color: 'var(--muted)', margin: 0 }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 0' }}>
              <Loader2 style={{ width: 24, height: 24, color: 'var(--muted)' }} className="animate-spin" />
            </div>
          ) : apps.length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--muted)', textAlign: 'center', padding: '40px 0' }}>No hay candidatos registrados en este proceso.</p>
          ) : (
            STAGE_ORDER_SUMMARY
              .filter(stage => byStage[stage]?.length > 0)
              .map(stage => {
                const stageColor = STAGE_COLORS[stage] ?? '#6b7280'
                return (
                  <div key={stage}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: stageColor, flexShrink: 0 }} />
                      <p style={{ fontSize: 11, fontWeight: 700, color: stageColor, textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>
                        {stage} ({byStage[stage].length})
                      </p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, paddingLeft: 16 }}>
                      {byStage[stage].map(app => {
                        const c = app.candidate
                        if (!c) return null
                        const cInterviews = interviews.filter(i => i.candidateId === c.id)
                        return (
                          <div key={app.id} style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 14px' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                              <div style={{ minWidth: 0 }}>
                                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', margin: 0 }}>{c.fullName}</p>
                                <p style={{ fontSize: 11, color: 'var(--muted)', margin: '2px 0 0' }}>{c.email}{c.phone ? ` · ${c.phone}` : ''}</p>
                              </div>
                              {c.atsScore ? (
                                <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 6, background: `${scoreColorUI(c.atsScore)}22`, color: scoreColorUI(c.atsScore), flexShrink: 0 }}>
                                  {c.atsScore}
                                </span>
                              ) : null}
                            </div>
                            {c.skills && c.skills.length > 0 && (
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 6 }}>
                                {c.skills.slice(0, 5).map(s => (
                                  <span key={s} style={{ fontSize: 10, padding: '1px 6px', borderRadius: 99, background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--muted)' }}>{s}</span>
                                ))}
                                {c.skills.length > 5 && <span style={{ fontSize: 10, color: 'var(--muted2)' }}>+{c.skills.length - 5}</span>}
                              </div>
                            )}
                            <p style={{ fontSize: 11, color: 'var(--muted2)', margin: '6px 0 0' }}>
                              Ingreso: {new Date(app.appliedAt).toLocaleDateString('es-AR')} · Act: {new Date(app.updatedAt).toLocaleDateString('es-AR')}
                            </p>
                            {cInterviews.length > 0 && (
                              <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--border)' }}>
                                {cInterviews.map(i => (
                                  <div key={i.id} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--muted)', marginBottom: 3 }}>
                                    <Calendar style={{ width: 10, height: 10, color: '#a78bfa', flexShrink: 0 }} />
                                    <span style={{ color: '#a78bfa', fontWeight: 600 }}>{i.type}</span>
                                    <span>·</span>
                                    <span>{i.meetingPlatform}</span>
                                    <span>·</span>
                                    <span>{new Date(i.scheduledAt).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                                    {i.interviewerName && <><span>·</span><span>{i.interviewerName}</span></>}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '8px 16px', borderRadius: 8, background: 'transparent', border: '1px solid var(--border)', color: 'var(--muted)', cursor: 'pointer', fontSize: 13 }}>
            Cerrar
          </button>
          <button
            onClick={handlePrint}
            disabled={loading}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, background: 'rgba(93,80,214,0.15)', border: '1px solid rgba(93,80,214,0.3)', color: 'var(--accent-2)', cursor: loading ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 600, opacity: loading ? 0.6 : 1 }}
          >
            <FileText style={{ width: 13, height: 13 }} />
            Imprimir informe
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Publicar en Portales Modal ───────────────────────────────────────────────
const PORTALS = [
  {
    key: 'linkedin',
    name: 'LinkedIn',
    color: '#0A66C2',
    url: 'https://www.linkedin.com/jobs/post/',
    charLimit: 2000,
    formatHint: 'LinkedIn valora descripciones con emojis, bullets y secciones claras.',
  },
  {
    key: 'computrabajo',
    name: 'Computrabajo',
    color: '#E8003D',
    url: 'https://ar.computrabajo.com/empresa/publicar-empleo/',
    charLimit: 3000,
    formatHint: 'Computrabajo prefiere texto plano sin HTML. Incluí franja salarial para más visibilidad.',
  },
  {
    key: 'zonajobs',
    name: 'ZonaJobs',
    color: '#FF6B00',
    url: 'https://empresa.zonajobs.com.ar/',
    charLimit: 3000,
    formatHint: 'ZonaJobs indexa mejor con palabras clave del puesto en el título y primer párrafo.',
  },
  {
    key: 'bumeran',
    name: 'Bumeran',
    color: '#0066CC',
    url: 'https://www.bumeran.com.ar/empleos-publicar.html',
    charLimit: 2500,
    formatHint: 'Bumeran recomienda títulos cortos (máx. 60 caracteres) y descripción estructurada.',
  },
  {
    key: 'getonboard',
    name: 'GetOnBoard',
    color: '#00B4A2',
    url: 'https://www.getonbrd.com/employers',
    charLimit: 4000,
    formatHint: 'GetOnBoard es técnico — detallá el stack, metodología y cultura de trabajo.',
  },
  {
    key: 'indeed',
    name: 'Indeed',
    color: '#2164F3',
    url: 'https://employers.indeed.com/jobposting',
    charLimit: 5000,
    formatHint: 'Indeed rankea mejor con títulos estándar (sin creatividad). Incluí ubicación exacta.',
  },
]

function formatVacancyForPortal(vacancy: Vacancy, portalKey: string): string {
  const salary = vacancy.salaryMin
    ? `${vacancy.currency ?? 'ARS'} ${(vacancy.salaryMin / 1000).toFixed(0)}K${vacancy.salaryMax ? ` – ${(vacancy.salaryMax / 1000).toFixed(0)}K` : '+'}`
    : 'A convenir'

  const location = vacancy.location ?? (vacancy.modality === 'Remoto' ? 'Remoto / Argentina' : 'Argentina')
  const reqs = vacancy.requirements.length > 0
    ? vacancy.requirements.map(r => `• ${r}`).join('\n')
    : '• Se detallarán en la entrevista'

  const desc = vacancy.description?.trim() || 'Nos encontramos en búsqueda de un/a profesional con ganas de sumarse a nuestro equipo.'

  if (portalKey === 'linkedin') {
    return `🚀 ${vacancy.title}
📍 ${location} | ${vacancy.modality}
💰 ${salary}
🏢 ${vacancy.department}

📋 DESCRIPCIÓN DEL PUESTO
${desc}

✅ REQUISITOS
${reqs}

📩 ¿Te interesa? Postulate directamente por LinkedIn o escribinos.

#${vacancy.department.replace(/\s/g, '')} #Empleos #Argentina #RRHH`
  }

  if (portalKey === 'getonboard') {
    return `## ${vacancy.title}

**Modalidad:** ${vacancy.modality} | **Ubicación:** ${location}
**Área:** ${vacancy.department} | **Salario:** ${salary}

### Sobre el rol
${desc}

### Requisitos
${reqs}

### ¿Por qué sumarte?
Formá parte de un equipo comprometido con el crecimiento profesional y personal.

*Postulaciones abiertas — revisamos todos los perfiles recibidos.*`
  }

  // Formato genérico para Computrabajo, ZonaJobs, Bumeran, Indeed
  return `PUESTO: ${vacancy.title}
ÁREA: ${vacancy.department}
MODALIDAD: ${vacancy.modality}
UBICACIÓN: ${location}
SALARIO: ${salary}

DESCRIPCIÓN:
${desc}

REQUISITOS:
${reqs}

CONDICIONES:
- Modalidad: ${vacancy.modality}
- Ubicación: ${location}
- Remuneración: ${salary}

Interesados enviar CV actualizado. ¡Esperamos tu postulación!`
}

function PublicarPortalesModal({ vacancy, onClose }: { vacancy: Vacancy; onClose: () => void }) {
  const [activePortal, setActivePortal] = React.useState(PORTALS[0].key)
  const [copied, setCopied] = React.useState<string | null>(null)

  const portal = PORTALS.find(p => p.key === activePortal)!
  const text = formatVacancyForPortal(vacancy, activePortal)

  const handleCopy = async (content: string, field: string) => {
    await navigator.clipboard.writeText(content)
    setCopied(field)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <DraggableModal open onClose={onClose} title="Publicar en portales de empleo" maxWidth="54rem">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Vacante resumida */}
        <div style={{ padding: '10px 14px', borderRadius: 8, background: 'var(--accent-soft)', border: '1px solid var(--accent-soft)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>{vacancy.title}</span>
            <span style={{ fontSize: 12, color: 'var(--muted)', marginLeft: 8 }}>{vacancy.department} · {vacancy.modality}</span>
          </div>
          <span style={{ fontSize: 12, color: 'var(--muted)' }}>
            {vacancy.salaryMin ? `${vacancy.currency ?? 'ARS'} ${(vacancy.salaryMin / 1000).toFixed(0)}K${vacancy.salaryMax ? `–${(vacancy.salaryMax / 1000).toFixed(0)}K` : '+'}` : 'Salario a convenir'}
          </span>
        </div>

        <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0 }}>
          Seleccioná el portal, copiá el texto generado y pegalo directamente al publicar la vacante.
        </p>

        {/* Tabs portales */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {PORTALS.map(p => (
            <button
              key={p.key}
              onClick={() => setActivePortal(p.key)}
              style={{
                padding: '5px 12px',
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                border: activePortal === p.key ? `2px solid ${p.color}` : '2px solid transparent',
                background: activePortal === p.key ? `${p.color}18` : 'var(--surface2)',
                color: activePortal === p.key ? p.color : 'var(--muted)',
                transition: 'all 0.15s',
              }}
            >
              {p.name}
            </button>
          ))}
        </div>

        {/* Hint */}
        <div style={{ padding: '8px 12px', borderRadius: 8, background: `${portal.color}10`, border: `1px solid ${portal.color}30`, fontSize: 12, color: 'var(--muted)' }}>
          💡 {portal.formatHint}
        </div>

        {/* Texto generado */}
        <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)' }}>
              Texto para {portal.name} · {text.length} / {portal.charLimit} caracteres
            </span>
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                onClick={() => handleCopy(text, 'text')}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px',
                  borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  background: copied === 'text' ? '#34d39920' : 'var(--accent-soft)',
                  border: `1px solid ${copied === 'text' ? '#34d399' : 'rgba(93,80,214,0.3)'}`,
                  color: copied === 'text' ? '#34d399' : 'var(--accent-2)',
                  transition: 'all 0.2s',
                }}
              >
                {copied === 'text' ? <Check style={{ width: 12, height: 12 }} /> : <Copy style={{ width: 12, height: 12 }} />}
                {copied === 'text' ? '¡Copiado!' : 'Copiar texto'}
              </button>
              <a
                href={portal.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px',
                  borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  background: `${portal.color}15`,
                  border: `1px solid ${portal.color}40`,
                  color: portal.color,
                  textDecoration: 'none',
                }}
              >
                <ExternalLink style={{ width: 12, height: 12 }} />
                Ir a {portal.name}
              </a>
            </div>
          </div>

          <textarea
            readOnly
            value={text}
            rows={14}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: 8,
              border: '1px solid var(--border)',
              background: 'var(--surface2)',
              color: 'var(--text)',
              fontSize: 13,
              fontFamily: 'monospace',
              resize: 'vertical',
              lineHeight: 1.6,
              outline: 'none',
            }}
            onClick={e => (e.target as HTMLTextAreaElement).select()}
          />

          {/* Barra de progreso de caracteres */}
          <div style={{ marginTop: 4, height: 3, borderRadius: 2, background: 'var(--border)', overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${Math.min((text.length / portal.charLimit) * 100, 100)}%`,
              background: text.length > portal.charLimit ? '#f87171' : text.length > portal.charLimit * 0.8 ? '#fbbf24' : portal.color,
              transition: 'width 0.3s',
            }} />
          </div>
          {text.length > portal.charLimit && (
            <p style={{ fontSize: 11, color: '#f87171', marginTop: 4 }}>
              ⚠️ El texto supera el límite recomendado de {portal.charLimit} caracteres. Considerá acortarlo.
            </p>
          )}
        </div>

        {/* Campos individuales copiables */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {[
            { label: 'Título del puesto', value: vacancy.title },
            { label: 'Área / Departamento', value: vacancy.department },
            { label: 'Modalidad', value: vacancy.modality },
            { label: 'Ubicación', value: vacancy.location ?? (vacancy.modality === 'Remoto' ? 'Remoto / Argentina' : 'Argentina') },
          ].map(field => (
            <div
              key={field.label}
              style={{ padding: '8px 10px', borderRadius: 8, background: 'var(--surface2)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}
            >
              <div style={{ minWidth: 0 }}>
                <p style={{ fontSize: 10, color: 'var(--muted)', margin: 0 }}>{field.label}</p>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{field.value}</p>
              </div>
              <button
                onClick={() => handleCopy(field.value, field.label)}
                style={{ flexShrink: 0, padding: 4, borderRadius: 4, border: 'none', background: 'transparent', cursor: 'pointer', color: copied === field.label ? '#34d399' : 'var(--muted)' }}
              >
                {copied === field.label ? <Check style={{ width: 12, height: 12 }} /> : <Copy style={{ width: 12, height: 12 }} />}
              </button>
            </div>
          ))}
        </div>

        <div style={{ fontSize: 11, color: 'var(--muted)', textAlign: 'center', paddingTop: 4 }}>
          Copiá el texto → abrí el portal → pegá en la descripción. Así de simple.
        </div>
      </div>
    </DraggableModal>
  )
}

// ─── Vacancy Card ─────────────────────────────────────────────────────────────
function VacancyCard({ vacancy, onEdit, onArchive, onAssign, onViewSummary, onCloseVacancy, onPublish }: {
  vacancy: Vacancy
  onEdit: () => void
  onArchive: () => void | Promise<void>
  onAssign: () => void
  onViewSummary: () => void
  onCloseVacancy: () => void | Promise<void>
  onPublish: () => void
}) {
  const { t } = useLanguage()
  const isClosed = vacancy.status === 'Contratado'
  const hasHired = !isClosed && vacancy.applications.some((a: { status: string }) => a.status === 'Contratado')
  const ModalityIcon = MODALITY_ICONS[vacancy.modality]
  const days = Math.floor((Date.now() - new Date(vacancy.createdAt).getTime()) / 86400000)
  const salaryStr = vacancy.salaryMin
    ? `${vacancy.currency ?? 'ARS'} ${(vacancy.salaryMin/1000).toFixed(0)}K – ${((vacancy.salaryMax ?? vacancy.salaryMin)/1000).toFixed(0)}K`
    : 'A convenir'

  return (
    <Card
      className="hover:shadow-md transition-shadow group relative"
      style={isClosed ? { opacity: 0.75, cursor: 'default' } : { cursor: 'pointer' }}
      onClick={isClosed ? undefined : onEdit}
    >
      <CardContent className="p-4">
        {/* Badge row */}
        <div className="flex items-start justify-between mb-2">
          {isClosed ? (
            <span
              className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
              style={{ background: 'rgba(107,114,128,0.2)', color: '#9ca3af' }}
            >
              Vacante Cerrada
            </span>
          ) : hasHired ? (
            <span
              className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
              style={{ background: 'rgba(52,211,153,0.15)', color: '#34d399' }}
            >
              ✓ Candidato contratado
            </span>
          ) : (
            <span
              className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
              style={{
                background: (PRIORITY_CONFIG[vacancy.priority] ?? PRIORITY_CONFIG['Media']).bg,
                color: (PRIORITY_CONFIG[vacancy.priority] ?? PRIORITY_CONFIG['Media']).color,
              }}
            >
              {vacancy.priority}
            </span>
          )}
          {!isClosed && (
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={e => { e.stopPropagation(); onEdit() }} className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground">
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <button onClick={e => { e.stopPropagation(); onArchive() }} className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground">
                <Archive className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>

        <h3 className="font-bold text-base leading-tight mb-1" style={{ color: isClosed ? 'var(--muted)' : 'var(--text)' }}>
          {vacancy.title}
        </h3>

        {vacancy.client && (
          <div className="flex items-center gap-1 mb-1">
            <Building2 className="h-3 w-3 shrink-0" style={{ color: isClosed ? 'var(--muted2)' : 'var(--accent-2)' }} />
            <span className="text-xs font-medium" style={{ color: isClosed ? 'var(--muted2)' : 'var(--accent-2)' }}>
              {vacancy.client.name}
            </span>
          </div>
        )}

        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{vacancy.department}</span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <ModalityIcon className="h-3 w-3" />{vacancy.modality}
          </span>
          {vacancy.location && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" />{vacancy.location}
            </span>
          )}
        </div>

        {!isClosed && <div className="text-xs font-semibold mb-3" style={{ color: '#34d399' }}>{salaryStr}</div>}

        {/* Skills */}
        {vacancy.requirements.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {vacancy.requirements.slice(0, 3).map(s => (
              <span
                key={s}
                className="text-[10px] px-1.5 py-0.5 rounded-full"
                style={{ background: isClosed ? 'var(--surface2)' : 'var(--accent-soft)', color: isClosed ? 'var(--muted2)' : 'var(--accent-2)' }}
              >
                {s}
              </span>
            ))}
            {vacancy.requirements.length > 3 && (
              <span className="text-[10px] text-muted-foreground">+{vacancy.requirements.length - 3}</span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {isClosed && vacancy.closingDate
              ? `Cerrada: ${new Date(vacancy.closingDate).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })}`
              : days === 0 ? t.vacancies.createdToday : t.vacancies.openFor.replace('{n}', String(days))}
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {vacancy.applications.length} {t.vacancies.candidates}
          </span>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t border-border">
          {isClosed ? (
            <Button
              size="sm"
              className="w-full text-xs h-7 gap-1"
              style={{ background: 'rgba(93,80,214,0.15)', color: 'var(--accent-2)', border: '1px solid rgba(93,80,214,0.3)' }}
              variant="outline"
              onClick={e => { e.stopPropagation(); onViewSummary() }}
            >
              <FileText className="h-3 w-3" /> Ver resumen del proceso
            </Button>
          ) : hasHired ? (
            <>
              <Button variant="outline" size="sm" className="flex-1 text-xs h-7" onClick={e => { e.stopPropagation(); window.location.href = `/pipeline?vacancy=${vacancy.id}` }}>
                {t.vacancies.actions.viewPipeline}
              </Button>
              <Button
                size="sm"
                className="flex-1 text-xs h-7 gap-1"
                style={{ background: 'rgba(52,211,153,0.15)', color: '#34d399', border: '1px solid rgba(52,211,153,0.3)' }}
                variant="outline"
                onClick={e => { e.stopPropagation(); onCloseVacancy() }}
              >
                ✓ Cerrar vacante
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" className="flex-1 text-xs h-7" onClick={e => { e.stopPropagation(); window.location.href = `/pipeline?vacancy=${vacancy.id}` }}>
                {t.vacancies.actions.viewPipeline}
              </Button>
              <Button size="sm" className="flex-1 text-xs h-7 gap-1" onClick={e => { e.stopPropagation(); onAssign() }}>
                <UserPlus className="h-3 w-3" /> {t.vacancies.actions.assign}
              </Button>
              <Button
                size="sm"
                className="text-xs h-7 px-2"
                variant="outline"
                title="Publicar en portales"
                onClick={e => { e.stopPropagation(); onPublish() }}
                style={{ borderColor: 'rgba(93,80,214,0.4)', color: 'var(--accent-2)' }}
              >
                <Share2 className="h-3 w-3" />
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Assign Candidates Modal ──────────────────────────────────────────────────
const AVATAR_GRADIENTS = [
  'linear-gradient(135deg,#6c63ff,#a78bfa)',
  'linear-gradient(135deg,#0ea5e9,#38bdf8)',
  'linear-gradient(135deg,#10b981,#34d399)',
  'linear-gradient(135deg,#f59e0b,#fbbf24)',
  'linear-gradient(135deg,#f43f5e,#fb7185)',
]
function candidateGradient(name: string) {
  let s = 0; for (const c of name) s += c.charCodeAt(0)
  return AVATAR_GRADIENTS[s % AVATAR_GRADIENTS.length]
}
function candidateInitials(name: string) {
  const p = name.trim().split(/\s+/)
  return (p[0][0] + (p[1]?.[0] ?? '')).toUpperCase()
}

const REJECTION_REASON_LABELS: Record<string, string> = {
  no_apto_perfil: 'No cumple el perfil',
  mejor_candidato: 'Mejor candidato seleccionado',
  candidato_declino: 'Candidato declinó',
  fuera_rango_salarial: 'Fuera de rango salarial',
  decision_empresa: 'Decisión empresarial',
  otro: 'Otro motivo',
}

function AssignCandidatesModal({ vacancy, onClose, onAssigned }: {
  vacancy: Vacancy
  onClose: () => void
  onAssigned: (vacancyId: string, newCount: number) => void
}) {
  const { user } = useUser()
  const { t } = useLanguage()
  const provider = React.useMemo(() => new SupabaseProvider(), [])

  const [candidates, setCandidates] = React.useState<Candidate[]>([])
  const [assignedIds, setAssignedIds] = React.useState<Set<string>>(new Set())
  const [allCandidateApps, setAllCandidateApps] = React.useState<Application[]>([])
  const [loadingCandidates, setLoadingCandidates] = React.useState(true)
  const [assigning, setAssigning] = React.useState<Set<string>>(new Set())
  const [search, setSearch] = React.useState('')

  React.useEffect(() => {
    async function load() {
      const tenantId = user?.tenantId ?? user?.id ?? ''
      const [candRes, appRes, allAppsRes] = await Promise.all([
        provider.getCandidates(tenantId),
        provider.getApplications(vacancy.id),
        provider.getApplications(undefined, tenantId),
      ])
      setCandidates(candRes.data ?? [])
      setAssignedIds(new Set((appRes.data ?? []).map(a => a.candidateId)))
      setAllCandidateApps(allAppsRes.data ?? [])
      setLoadingCandidates(false)
    }
    load()
  }, [provider, user, vacancy.id])

  const filtered = React.useMemo(() => {
    const q = search.toLowerCase()
    return candidates.filter(c =>
      !q ||
      c.fullName.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q)
    )
  }, [candidates, search])

  async function handleAssign(candidate: Candidate) {
    setAssigning(prev => new Set(prev).add(candidate.id))
    const maxPos = assignedIds.size
    const res = await provider.createApplication({
      vacancyId: vacancy.id,
      candidateId: candidate.id,
      status: 'Nuevas Vacantes',
      positionInStage: maxPos,
    })
    if (!res.error) {
      setAssignedIds(prev => new Set(prev).add(candidate.id))
      onAssigned(vacancy.id, assignedIds.size + 1)
    }
    setAssigning(prev => { const s = new Set(prev); s.delete(candidate.id); return s })
  }

  const scoreColor = (s: number) =>
    s >= 85 ? '#34d399' : s >= 70 ? '#a78bfa' : s >= 50 ? '#fbbf24' : '#9ca3af'

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4" onClick={onClose}>
      <div
        className="w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl flex flex-col max-h-[85vh]"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <div>
            <p className="font-semibold text-sm" style={{ color: 'var(--text)' }}>{t.vacancies.assignCandidatesTitle}</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>{vacancy.title}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[var(--surface2)] transition-colors" style={{ color: 'var(--muted)' }}>
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Search */}
        <div className="px-5 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5" style={{ color: 'var(--muted)' }} />
            <input
              autoFocus
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por nombre o email..."
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg outline-none"
              style={{ background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)' }}
            />
          </div>
        </div>

        {/* Candidate list */}
        <div className="flex-1 overflow-y-auto px-3 py-2">
          {loadingCandidates ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-5 w-5 animate-spin" style={{ color: 'var(--muted)' }} />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Users className="h-8 w-8 mb-2" style={{ color: 'var(--muted)' }} />
              <p className="text-sm" style={{ color: 'var(--muted)' }}>
                {search ? t.vacancies.noResultsAssign : t.vacancies.noCandidatesDB}
              </p>
            </div>
          ) : (
            filtered.map(c => {
              const isAssigned = assignedIds.has(c.id)
              const isAssigning = assigning.has(c.id)
              const score = c.atsScore ?? 0
              const prevRejections = allCandidateApps.filter(a =>
                a.candidateId === c.id &&
                a.vacancyId !== vacancy.id &&
                a.status === 'Descartado' &&
                (a as Application & { rejectionReason?: RejectionReason }).rejectionReason
              )
              return (
                <div
                  key={c.id}
                  className="flex items-center gap-3 px-2 py-2.5 rounded-xl transition-colors"
                  style={{ background: isAssigned ? 'rgba(52,211,153,0.06)' : undefined }}
                >
                  {/* Avatar */}
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
                    style={{ background: candidateGradient(c.fullName) }}
                  >
                    {candidateInitials(c.fullName)}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: 'var(--text)' }}>{c.fullName}</p>
                    <p className="text-xs truncate" style={{ color: 'var(--muted)' }}>{c.email}</p>
                    {prevRejections.length > 0 && (
                      <p className="text-xs mt-0.5 flex items-center gap-1" style={{ color: '#fbbf24' }}>
                        <AlertTriangle className="h-3 w-3 shrink-0" />
                        Descartado en {prevRejections.length} proceso{prevRejections.length !== 1 ? 's' : ''} anterior{prevRejections.length !== 1 ? 'es' : ''}: {REJECTION_REASON_LABELS[(prevRejections[0] as Application & { rejectionReason?: RejectionReason }).rejectionReason as string] ?? prevRejections[0].status}
                      </p>
                    )}
                  </div>

                  {/* Score badge */}
                  {score > 0 && (
                    <span
                      className="text-xs font-bold px-1.5 py-0.5 rounded-md shrink-0"
                      style={{ color: scoreColor(score), background: `${scoreColor(score)}22` }}
                    >
                      {score}
                    </span>
                  )}

                  {/* Action */}
                  {isAssigned ? (
                    <span className="flex items-center gap-1 text-xs font-medium shrink-0 px-2 py-1 rounded-lg" style={{ color: '#34d399', background: 'rgba(52,211,153,0.12)' }}>
                      <Check className="h-3.5 w-3.5" /> Asignado
                    </span>
                  ) : (
                    <button
                      onClick={() => handleAssign(c)}
                      disabled={isAssigning}
                      className="flex items-center gap-1 text-xs font-semibold shrink-0 px-3 py-1.5 rounded-lg transition-opacity disabled:opacity-60"
                      style={{ background: 'var(--accent)', color: '#fff' }}
                    >
                      {isAssigning ? <Loader2 className="h-3 w-3 animate-spin" /> : <UserPlus className="h-3 w-3" />}
                      {t.vacancies.actions.assign}
                    </button>
                  )}
                </div>
              )
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t text-xs" style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}>
          {assignedIds.size} candidato{assignedIds.size !== 1 ? 's' : ''} asignado{assignedIds.size !== 1 ? 's' : ''} a esta vacante
        </div>
      </div>
    </div>
  )
}

// ─── Plan limit toast ─────────────────────────────────────────────────────────
function PlanLimitToast({ message, onClose }: { message: string; onClose: () => void }) {
  React.useEffect(() => {
    const t = setTimeout(onClose, 6000)
    return () => clearTimeout(t)
  }, [onClose])
  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-amber-600 text-white px-4 py-3 rounded-xl shadow-xl animate-in slide-in-from-bottom-2 max-w-sm">
      <svg className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M12 3a9 9 0 110 18A9 9 0 0112 3z" /></svg>
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose} className="ml-2 p-0.5 hover:opacity-70 transition-opacity flex-shrink-0">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
      </button>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function VacanciesPage() {
  const [vacancies, setVacancies] = React.useState<Vacancy[]>([])
  const [loading, setLoading] = React.useState(true)
  const [showForm, setShowForm] = React.useState(false)
  const [editVacancy, setEditVacancy] = React.useState<Vacancy | undefined>()
  const [assignVacancy, setAssignVacancy] = React.useState<Vacancy | undefined>()
  const [search, setSearch] = React.useState('')
  const [filterStatus, setFilterStatus] = React.useState('all')
  const [filterPriority, setFilterPriority] = React.useState('all')
  const [clients, setClients] = React.useState<Client[]>([])
  const [filterClient, setFilterClient] = React.useState('all')
  const [limitToast, setLimitToast] = React.useState<string | null>(null)
  const [summaryVacancy, setSummaryVacancy] = React.useState<Vacancy | undefined>()
  const [publishVacancy, setPublishVacancy] = React.useState<Vacancy | undefined>()

  const { user } = useUser()
  const { t } = useLanguage()
  const provider = React.useMemo(() => new SupabaseProvider(), [])

  const load = React.useCallback(async () => {
    const tid = user?.tenantId ?? ''
    const [vRes, aRes, clRes] = await Promise.all([
      provider.getVacancies(tid),
      provider.getApplications(undefined, tid),
      provider.getClients(tid),
    ])
    const apps = aRes.data ?? []
    const hydrated = (vRes.data ?? []).map(v => ({
      ...v,
      applications: apps.filter(a => a.vacancyId === v.id),
    }))
    setVacancies(hydrated)
    setClients(clRes.data ?? [])
    setLoading(false)
  }, [provider, user])

  React.useEffect(() => { load() }, [load])

  React.useEffect(() => {
    const handle = () => load()
    function handleVisibility() {
      if (document.visibilityState === 'visible') load()
    }
    window.addEventListener('application:stage-changed', handle)
    window.addEventListener('vacancy:created', handle)
    window.addEventListener('vacancy:updated', handle)
    window.addEventListener('client:updated', handle)
    document.addEventListener('visibilitychange', handleVisibility)
    return () => {
      window.removeEventListener('application:stage-changed', handle)
      window.removeEventListener('vacancy:created', handle)
      window.removeEventListener('vacancy:updated', handle)
      window.removeEventListener('client:updated', handle)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [load])

  const filtered = React.useMemo(() => vacancies.filter(v => {
    // Hide vacancies belonging to inactive clients
    const clientOfVac = v.clientId ? clients.find(c => c.id === v.clientId) : undefined
    if (clientOfVac && clientOfVac.active === false) return false
    if (filterClient !== 'all' && v.clientId !== filterClient) return false
    if (search && !v.title.toLowerCase().includes(search.toLowerCase()) && !v.department.toLowerCase().includes(search.toLowerCase())) return false
    if (filterPriority !== 'all' && v.priority !== filterPriority) return false
    return true
  }), [vacancies, search, filterPriority, filterClient, clients])

  const kpis = React.useMemo(() => ({
    total: vacancies.length,
    open: vacancies.filter(v => v.status !== 'Contratado').length,
    totalCandidates: new Set(
      (filtered.length === vacancies.length ? vacancies : filtered)
        .flatMap(v => v.applications.map(a => a.candidateId))
    ).size,
    avgDays: vacancies.length > 0
      ? Math.round(vacancies.reduce((s, v) => s + Math.floor((Date.now() - new Date(v.createdAt).getTime()) / 86400000), 0) / vacancies.length)
      : 0,
  }), [vacancies, filtered])

  const planLimits = React.useMemo(() => getPlanLimits(user?.plan ?? 'free'), [user])

  function openNewVacancyForm() {
    const activeCount = vacancies.filter(v => v.status !== 'Contratado').length
    if (activeCount >= planLimits.vacancies) {
      setLimitToast(
        planLimits.vacancies === Infinity
          ? 'Límite alcanzado.'
          : `Límite de tu plan alcanzado (${planLimits.vacancies} vacantes activas). Actualizá para más.`
      )
      return
    }
    setEditVacancy(undefined)
    setShowForm(true)
  }

  async function handleArchive(id: string) {
    await provider.deleteVacancy(id)
    setVacancies(prev => prev.filter(v => v.id !== id))
    window.dispatchEvent(new CustomEvent('vacancy:deleted'))
  }

  async function handleCloseVacancy(id: string) {
    await provider.closeVacancy(id)
    setVacancies(prev => prev.map(v => v.id === id ? { ...v, status: 'Contratado' as const, closingDate: new Date().toISOString().slice(0, 10) } : v))
    window.dispatchEvent(new CustomEvent('vacancy:closed'))
  }

  function handleSaved(v: Vacancy) {
    setVacancies(prev => {
      const idx = prev.findIndex(x => x.id === v.id)
      if (idx !== -1) { const next = [...prev]; next[idx] = v; return next }
      return [v, ...prev]
    })
  }

  function handleAssigned(vacancyId: string, newCount: number) {
    setVacancies(prev => prev.map(v => {
      if (v.id !== vacancyId) return v
      const current = v.applications.length
      const extra = newCount - current
      if (extra <= 0) return v
      const now = new Date().toISOString()
      const placeholders = Array.from({ length: extra }, (_, i) => ({
        id: `__temp_${Date.now()}_${i}`,
        vacancyId,
        candidateId: '',
        status: 'Nuevas Vacantes' as const,
        positionInStage: current + i,
        appliedAt: now,
        updatedAt: now,
      }))
      return { ...v, applications: [...v.applications, ...placeholders] }
    }))
  }

  if (loading) return (
    <div className="space-y-4">
      <div className="h-8 w-48 bg-muted rounded animate-pulse" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[0,1,2,3].map(i => <div key={i} className="h-48 bg-muted rounded-xl animate-pulse" />)}
      </div>
    </div>
  )

  return (
    <div className="space-y-5">
      {limitToast && <PlanLimitToast message={limitToast} onClose={() => setLimitToast(null)} />}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-foreground">{t.pageTitles.vacancies}</h1>
          <p className="text-sm text-muted-foreground">{t.vacancies.pageSub.replace('{n}', String(kpis.open))}</p>
        </div>
        <Button onClick={openNewVacancyForm} className="gap-1.5 shrink-0">
          <Plus className="h-4 w-4" /> <span className="hidden sm:inline">{t.vacancies.newVacancy}</span><span className="sm:hidden">{t.vacancies.newVacancy}</span>
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Briefcase, label: t.vacancies.stats.total, value: kpis.total, accentColor: 'var(--accent)' },
          { icon: Globe, label: t.vacancies.stats.open, value: kpis.open, accentColor: '#34d399' },
          { icon: Users, label: t.vacancies.stats.totalCandidates, value: kpis.totalCandidates, accentColor: 'var(--accent-2)' },
          { icon: Clock, label: t.vacancies.stats.avgDaysOpen, value: `${kpis.avgDays}d`, accentColor: '#fbbf24' },
        ].map(k => (
          <div
            key={k.label}
            className="rounded-xl border p-4 flex items-center gap-3 relative overflow-hidden"
            style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
          >
            <div
              className="absolute top-0 left-0 right-0 h-[2px]"
              style={{ background: k.accentColor }}
            />
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: `${k.accentColor}22` }}
            >
              <k.icon className="h-4 w-4" style={{ color: k.accentColor }} />
            </div>
            <div>
              <p className="text-xs" style={{ color: 'var(--muted)' }}>{k.label}</p>
              <p className="text-lg font-bold" style={{ color: 'var(--text)' }}>{k.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t.vacancies.searchPlaceholder} className="pl-8 pr-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring w-full" />
        </div>
        {clients.length > 0 && (
          <div className="relative">
            <select value={filterClient} onChange={e => setFilterClient(e.target.value)} className="pl-3 pr-8 py-2 text-sm rounded-md border border-input bg-background focus:outline-none appearance-none">
              <option value="all">{t.vacancies.filters.allClients}</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          </div>
        )}
        <div className="relative">
          <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)} className="pl-3 pr-8 py-2 text-sm rounded-md border border-input bg-background focus:outline-none appearance-none">
            <option value="all">{t.vacancies.filters.allPriorities}</option>
            <option value="Alta">Alta</option>
            <option value="Media">Media</option>
            <option value="Baja">Baja</option>
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
        </div>
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ background: 'var(--accent-soft)' }}>
            <Briefcase className="h-8 w-8" style={{ color: 'var(--accent-2)' }} />
          </div>
          <h3 className="font-semibold text-foreground mb-1">
            {search ? t.vacancies.noResultsAssign : t.vacancies.noVacancies}
          </h3>
          <p className="text-sm text-muted-foreground max-w-sm mb-4">
            {search ? t.vacancies.noVacanciesSub : t.vacancies.emptyStateSub}
          </p>
          {!search && <Button onClick={openNewVacancyForm} className="gap-1.5"><Plus className="h-4 w-4" /> {t.vacancies.newVacancy}</Button>}
        </div>
      )}

      {/* Grid */}
      {filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(v => (
            <VacancyCard
              key={v.id}
              vacancy={v}
              onEdit={() => { setEditVacancy(v); setShowForm(true) }}
              onArchive={() => handleArchive(v.id)}
              onAssign={() => setAssignVacancy(v)}
              onViewSummary={() => setSummaryVacancy(v)}
              onCloseVacancy={() => handleCloseVacancy(v.id)}
              onPublish={() => setPublishVacancy(v)}
            />
          ))}
        </div>
      )}

      <VacancyFormDialog
        open={showForm}
        onClose={() => setShowForm(false)}
        vacancy={editVacancy}
        onSave={handleSaved}
      />

      {assignVacancy && (
        <AssignCandidatesModal
          vacancy={assignVacancy}
          onClose={() => setAssignVacancy(undefined)}
          onAssigned={handleAssigned}
        />
      )}

      {summaryVacancy && (
        <VacancyProcessSummaryModal
          vacancy={summaryVacancy}
          onClose={() => setSummaryVacancy(undefined)}
        />
      )}

      {publishVacancy && (
        <PublicarPortalesModal
          vacancy={publishVacancy}
          onClose={() => setPublishVacancy(undefined)}
        />
      )}
    </div>
  )
}
