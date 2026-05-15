'use client'

import * as React from 'react'
import {
  Search, Plus, Upload, Users, Brain, TrendingUp, Clock,
  Grid3X3, List, ChevronDown, Trash2, Calendar, Eye,
  X, Loader2, CheckCircle2
} from 'lucide-react'
import { cn, formatDate, formatRelativeDate, getInitials, generateId } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { SupabaseProvider } from '@/lib/providers/supabase-provider'
import { useUser } from '@/lib/context/user-context'
import type { Candidate, Vacancy, CandidateSource } from '@/types'

// ─── Score badge ──────────────────────────────────────────────────────────────
function ScoreBadge({ score }: { score?: number }) {
  if (score === undefined) return <span className="text-xs" style={{ color: 'var(--muted)' }}>—</span>
  const bg =
    score >= 85 ? 'rgba(52,211,153,0.15)' :
    score >= 70 ? 'rgba(52,211,153,0.1)' :
    score >= 50 ? 'rgba(251,191,36,0.15)' :
    'rgba(239,68,68,0.15)'
  const textColor =
    score >= 85 ? '#34d399' :
    score >= 70 ? '#34d399' :
    score >= 50 ? '#fbbf24' :
    '#ef4444'
  const label = score >= 85 ? 'Excelente' : score >= 70 ? 'Bueno' : score >= 50 ? 'Regular' : 'Bajo'
  return (
    <div
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
      style={{ background: bg, color: textColor }}
    >
      <span>{score}</span>
      <span className="font-normal opacity-75">· {label}</span>
    </div>
  )
}

const SOURCE_BG: Record<string, string> = {
  LinkedIn: 'rgba(59,130,246,0.15)',
  Portal: 'rgba(108,99,255,0.15)',
  Referido: 'rgba(139,92,246,0.15)',
  Indeed: 'rgba(249,115,22,0.15)',
  WhatsApp: 'rgba(34,197,94,0.15)',
  Manual: 'rgba(107,114,128,0.15)',
  Computrabajo: 'rgba(239,68,68,0.15)',
  ZonaJobs: 'rgba(20,184,166,0.15)',
  Bumeran: 'rgba(14,165,233,0.15)',
}
const SOURCE_TEXT: Record<string, string> = {
  LinkedIn: '#60a5fa',
  Portal: '#a78bfa',
  Referido: '#c084fc',
  Indeed: '#fb923c',
  WhatsApp: '#4ade80',
  Manual: '#9ca3af',
  Computrabajo: '#f87171',
  ZonaJobs: '#2dd4bf',
  Bumeran: '#38bdf8',
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KpiCard({ icon: Icon, label, value, sub, accentColor }: {
  icon: React.ElementType; label: string; value: string | number; sub?: string; accentColor: string
}) {
  return (
    <div
      className="flex-1 min-w-[150px] rounded-xl border p-4 flex items-center gap-3 relative overflow-hidden"
      style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
    >
      {/* top accent bar */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px]"
        style={{ background: accentColor }}
      />
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
        style={{ background: `${accentColor}22` }}
      >
        <Icon className="h-5 w-5" style={{ color: accentColor }} />
      </div>
      <div>
        <p className="text-xs" style={{ color: 'var(--muted)' }}>{label}</p>
        <p className="text-xl font-bold" style={{ color: 'var(--text)' }}>{value}</p>
        {sub && <p className="text-xs" style={{ color: 'var(--muted)' }}>{sub}</p>}
      </div>
    </div>
  )
}

// ─── Add candidate dialog ─────────────────────────────────────────────────────
function AddCandidateDialog({
  open,
  onClose,
  vacancies,
  prefill,
  onSave,
}: {
  open: boolean
  onClose: () => void
  vacancies: Vacancy[]
  prefill?: Partial<Candidate>
  onSave: (c: Candidate) => void
}) {
  const { user } = useUser()
  const provider = React.useMemo(() => new SupabaseProvider(), [])
  const [form, setForm] = React.useState({
    fullName: prefill?.fullName ?? '',
    email: prefill?.email ?? '',
    phone: prefill?.phone ?? '',
    vacancyId: '',
    source: 'LinkedIn' as CandidateSource,
    notes: '',
    skills: prefill?.skills?.join(', ') ?? '',
    experienceYears: prefill?.experienceYears ?? '',
    education: prefill?.education ?? '',
    atsScore: prefill?.atsScore ?? '',
  })
  const [saving, setSaving] = React.useState(false)

  React.useEffect(() => {
    if (prefill) {
      setForm(f => ({
        ...f,
        fullName: prefill.fullName ?? f.fullName,
        email: prefill.email ?? f.email,
        phone: prefill.phone ?? f.phone,
        skills: prefill.skills?.join(', ') ?? f.skills,
        experienceYears: prefill.experienceYears ?? f.experienceYears,
        education: prefill.education ?? f.education,
        atsScore: prefill.atsScore ?? f.atsScore,
      }))
    }
  }, [prefill])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const tenantId = user?.tenantId ?? ''
    const result = await provider.createCandidate({
      tenantId,
      fullName: form.fullName,
      email: form.email,
      phone: form.phone || undefined,
      skills: form.skills.split(',').map(s => s.trim()).filter(Boolean),
      source: form.source,
      notes: form.notes || undefined,
      experienceYears: Number(form.experienceYears) || undefined,
      education: form.education || undefined,
      atsScore: Number(form.atsScore) || undefined,
      appliedAt: new Date().toISOString(),
    })
    setSaving(false)
    if (result.data) {
      if (form.vacancyId) {
        await provider.createApplication({
          vacancyId: form.vacancyId,
          candidateId: result.data.id,
          status: 'Nuevas Vacantes',
          positionInStage: 0,
        })
      }
      onSave(result.data)
      onClose()
    }
  }

  const inputCls = 'w-full px-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring'
  const labelCls = 'text-xs font-medium text-muted-foreground mb-1 block'

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Agregar candidato</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3 mt-2">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Nombre completo *</label>
              <input required value={form.fullName} onChange={e => setForm(f => ({...f, fullName: e.target.value}))} className={inputCls} placeholder="Valentina Rodríguez" />
            </div>
            <div>
              <label className={labelCls}>Email *</label>
              <input required type="email" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} className={inputCls} placeholder="email@ejemplo.com" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Teléfono</label>
              <input value={form.phone} onChange={e => setForm(f => ({...f, phone: e.target.value}))} className={inputCls} placeholder="+54 11 1234-5678" />
            </div>
            <div>
              <label className={labelCls}>Fuente</label>
              <select value={form.source} onChange={e => setForm(f => ({...f, source: e.target.value as CandidateSource}))} className={inputCls}>
                {['LinkedIn','Portal','Referido','Indeed','Computrabajo','ZonaJobs','Bumeran','WhatsApp','Manual'].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className={labelCls}>Vacante</label>
            <select value={form.vacancyId} onChange={e => setForm(f => ({...f, vacancyId: e.target.value}))} className={inputCls}>
              <option value="">Sin vacante asignada</option>
              {vacancies.map(v => <option key={v.id} value={v.id}>{v.title}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Skills (separadas por coma)</label>
            <input value={form.skills} onChange={e => setForm(f => ({...f, skills: e.target.value}))} className={inputCls} placeholder="React, TypeScript, Node.js" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Años de experiencia</label>
              <input type="number" min="0" max="50" value={form.experienceYears} onChange={e => setForm(f => ({...f, experienceYears: e.target.value}))} className={inputCls} placeholder="3" />
            </div>
            <div>
              <label className={labelCls}>Score ATS (0-100)</label>
              <input type="number" min="0" max="100" value={form.atsScore} onChange={e => setForm(f => ({...f, atsScore: e.target.value}))} className={inputCls} placeholder="Auto si analizás CV" />
            </div>
          </div>
          <div>
            <label className={labelCls}>Educación</label>
            <input value={form.education} onChange={e => setForm(f => ({...f, education: e.target.value}))} className={inputCls} placeholder="Lic. en Ciencias de la Computación" />
          </div>
          <div>
            <label className={labelCls}>Notas</label>
            <textarea value={form.notes} onChange={e => setForm(f => ({...f, notes: e.target.value}))} className={cn(inputCls, 'resize-none h-16')} placeholder="Notas internas sobre el candidato..." />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Guardar candidato
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ─── CV Analyzer Drop Zone ────────────────────────────────────────────────────
function CvDropZone({ vacancies, onCandidateAdded }: { vacancies: Vacancy[]; onCandidateAdded: (c: Candidate) => void }) {
  const [isDragging, setIsDragging] = React.useState(false)
  const [status, setStatus] = React.useState<'idle' | 'analyzing' | 'done' | 'error'>('idle')
  const [prefill, setPrefill] = React.useState<Partial<Candidate> | null>(null)
  const [showAdd, setShowAdd] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)

  async function analyzeFile(file: File) {
    setStatus('analyzing')
    const text = await file.text()
    try {
      const res = await fetch('/api/ai/analyze-cv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cvText: text, vacancyRequirements: [] }),
      })
      const data = await res.json()
      setPrefill({
        fullName: data.fullName ?? '',
        email: data.email ?? '',
        phone: data.phone ?? '',
        skills: data.skills ?? [],
        experienceYears: data.experienceYears,
        education: data.education ?? '',
        atsScore: data.atsScore,
      })
      setStatus('done')
      setShowAdd(true)
    } catch {
      setStatus('error')
      setTimeout(() => setStatus('idle'), 3000)
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) analyzeFile(file)
  }

  return (
    <>
      <div
        onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed rounded-xl p-4 flex items-center gap-4 cursor-pointer transition-all mb-4"
        style={{
          borderColor: isDragging ? 'var(--accent)' : 'var(--border2)',
          background: isDragging ? 'var(--accent-soft)' : 'var(--surface2)',
        }}
      >
        <input ref={inputRef} type="file" accept=".pdf,.docx,.txt" className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) analyzeFile(f) }} />
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
          style={{ background: 'var(--accent-soft)' }}
        >
          {status === 'analyzing' ? <Loader2 className="h-5 w-5 animate-spin" style={{ color: 'var(--accent-2)' }} /> :
           status === 'done' ? <CheckCircle2 className="h-5 w-5" style={{ color: '#34d399' }} /> :
           <Upload className="h-5 w-5" style={{ color: 'var(--accent-2)' }} />}
        </div>
        <div>
          <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>
            {status === 'analyzing' ? 'Analizando CV con IA...' :
             status === 'done' ? '¡CV analizado! Abriendo formulario...' :
             status === 'error' ? 'Error al analizar. Intentá de nuevo.' :
             'Arrastrá un CV aquí o hacé clic para seleccionar'}
          </p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>PDF, DOCX o TXT · La IA extrae nombre, skills y calcula score ATS</p>
        </div>
        <div className="ml-auto">
          <span
            className="text-[10px] px-2 py-0.5 rounded-full border font-medium"
            style={{
              background: 'var(--accent-soft)',
              color: 'var(--accent-2)',
              borderColor: 'var(--accent)',
            }}
          >
            ✨ IA
          </span>
        </div>
      </div>
      <AddCandidateDialog
        open={showAdd}
        onClose={() => { setShowAdd(false); setStatus('idle') }}
        vacancies={vacancies}
        prefill={prefill ?? undefined}
        onSave={c => { onCandidateAdded(c); setPrefill(null) }}
      />
    </>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function CandidatesPage() {
  const [candidates, setCandidates] = React.useState<Candidate[]>([])
  const [vacancies, setVacancies] = React.useState<Vacancy[]>([])
  const [loading, setLoading] = React.useState(true)
  const [view, setView] = React.useState<'table' | 'grid'>('table')
  const [search, setSearch] = React.useState('')
  const [filterScore, setFilterScore] = React.useState('all')
  const [filterSource, setFilterSource] = React.useState('all')
  const [showAdd, setShowAdd] = React.useState(false)

  const { user } = useUser()
  const provider = React.useMemo(() => new SupabaseProvider(), [])

  const load = React.useCallback(async () => {
    const tid = user?.tenantId ?? ''
    const [cRes, vRes] = await Promise.all([
      provider.getCandidates(tid),
      provider.getVacancies(tid),
    ])
    setCandidates(cRes.data ?? [])
    setVacancies(vRes.data ?? [])
    setLoading(false)
  }, [provider, user])

  React.useEffect(() => { load() }, [load])

  const filtered = React.useMemo(() => {
    return candidates.filter(c => {
      if (search && !c.fullName.toLowerCase().includes(search.toLowerCase()) && !c.email.toLowerCase().includes(search.toLowerCase())) return false
      if (filterScore === '80+' && (c.atsScore ?? 0) < 80) return false
      if (filterScore === '60-79' && ((c.atsScore ?? 0) < 60 || (c.atsScore ?? 0) >= 80)) return false
      if (filterScore === '40-59' && ((c.atsScore ?? 0) < 40 || (c.atsScore ?? 0) >= 60)) return false
      if (filterScore === '<40' && (c.atsScore ?? 0) >= 40) return false
      if (filterSource !== 'all' && c.source !== filterSource) return false
      return true
    })
  }, [candidates, search, filterScore, filterSource])

  const kpis = React.useMemo(() => {
    const total = candidates.length
    const withScore = candidates.filter(c => c.atsScore !== undefined).length
    const avgScore = withScore > 0
      ? Math.round(candidates.reduce((s, c) => s + (c.atsScore ?? 0), 0) / withScore)
      : 0
    const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString()
    const newThisWeek = candidates.filter(c => c.createdAt >= weekAgo).length
    return { total, withScore, avgScore, newThisWeek }
  }, [candidates])

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar este candidato?')) return
    await provider.deleteCandidate(id)
    setCandidates(prev => prev.filter(c => c.id !== id))
  }

  if (loading) return (
    <div className="p-6 space-y-4">
      <div className="h-8 w-48 bg-muted rounded animate-pulse" />
      <div className="flex gap-4">
        {[0,1,2,3].map(i => <div key={i} className="h-20 flex-1 bg-muted rounded-lg animate-pulse" />)}
      </div>
      <div className="h-64 bg-muted rounded-lg animate-pulse" />
    </div>
  )

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Candidatos</h1>
          <p className="text-sm text-muted-foreground">{kpis.total} candidatos en la base de datos</p>
        </div>
        <Button onClick={() => setShowAdd(true)} className="gap-1.5">
          <Plus className="h-4 w-4" /> Agregar candidato
        </Button>
      </div>

      {/* KPIs */}
      <div className="flex gap-4 flex-wrap">
        <KpiCard icon={Users} label="Total Candidatos" value={kpis.total} accentColor="var(--accent)" />
        <KpiCard icon={Brain} label="CVs Analizados con IA" value={kpis.withScore} sub={`${kpis.total > 0 ? Math.round(kpis.withScore/kpis.total*100) : 0}% del total`} accentColor="var(--accent-2)" />
        <KpiCard icon={TrendingUp} label="Score Promedio" value={kpis.avgScore} sub="sobre 100" accentColor="#34d399" />
        <KpiCard icon={Clock} label="Nuevos Esta Semana" value={kpis.newThisWeek} accentColor="#fbbf24" />
      </div>

      {/* CV Drop Zone */}
      <CvDropZone vacancies={vacancies} onCandidateAdded={c => setCandidates(prev => [c, ...prev])} />

      {/* Filters + View Toggle */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nombre o email..."
            className="pl-8 pr-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring w-full"
          />
        </div>
        <div className="relative">
          <select value={filterScore} onChange={e => setFilterScore(e.target.value)}
            className="pl-3 pr-8 py-2 text-sm rounded-md border border-input bg-background focus:outline-none appearance-none">
            <option value="all">Todos los scores</option>
            <option value="80+">Excelente (80+)</option>
            <option value="60-79">Bueno (60-79)</option>
            <option value="40-59">Regular (40-59)</option>
            <option value="<40">Bajo (&lt;40)</option>
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
        </div>
        <div className="relative">
          <select value={filterSource} onChange={e => setFilterSource(e.target.value)}
            className="pl-3 pr-8 py-2 text-sm rounded-md border border-input bg-background focus:outline-none appearance-none">
            <option value="all">Todas las fuentes</option>
            {['LinkedIn','Portal','Referido','Indeed','Computrabajo','ZonaJobs','WhatsApp','Manual'].map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
        </div>
        <div className="flex rounded-md border border-input overflow-hidden ml-auto">
          <button onClick={() => setView('table')} className={cn('px-2.5 py-2', view === 'table' ? 'bg-primary text-primary-foreground' : 'bg-background text-muted-foreground hover:bg-muted')}>
            <List className="h-4 w-4" />
          </button>
          <button onClick={() => setView('grid')} className={cn('px-2.5 py-2', view === 'grid' ? 'bg-primary text-primary-foreground' : 'bg-background text-muted-foreground hover:bg-muted')}>
            <Grid3X3 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <Users className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-base font-semibold text-foreground mb-1">Sin candidatos</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            {search || filterScore !== 'all' || filterSource !== 'all'
              ? 'No hay candidatos que coincidan con los filtros.'
              : 'Agregá tu primer candidato o arrastrá un CV arriba para analizarlo con IA.'}
          </p>
        </div>
      )}

      {/* Table view */}
      {view === 'table' && filtered.length > 0 && (
        <div className="rounded-xl border border-border overflow-hidden bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Candidato</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Score ATS</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground hidden md:table-cell">Skills</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground hidden lg:table-cell">Fuente</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground hidden lg:table-cell">Fecha</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map(c => (
                <tr key={c.id} className="hover:bg-muted/30 transition-colors group">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                        style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-2))' }}
                      >
                        {getInitials(c.fullName)}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{c.fullName}</p>
                        <p className="text-xs text-muted-foreground">{c.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3"><ScoreBadge score={c.atsScore} /></td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <div className="flex gap-1 flex-wrap max-w-[200px]">
                      {c.skills.slice(0, 3).map(s => (
                        <span key={s} className="text-[10px] px-1.5 py-0.5 bg-muted rounded-full text-muted-foreground">{s}</span>
                      ))}
                      {c.skills.length > 3 && <span className="text-[10px] text-muted-foreground">+{c.skills.length - 3}</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{
                        background: SOURCE_BG[c.source] ?? 'rgba(107,114,128,0.15)',
                        color: SOURCE_TEXT[c.source] ?? '#9ca3af',
                      }}
                    >
                      {c.source}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground hidden lg:table-cell">{formatRelativeDate(c.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground" title="Ver perfil">
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                      <button className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground" title="Agendar entrevista">
                        <Calendar className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => handleDelete(c.id)} className="p-1.5 rounded hover:bg-red-50 text-muted-foreground hover:text-red-600" title="Eliminar">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Grid view */}
      {view === 'grid' && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(c => (
            <Card key={c.id} className="hover:shadow-md transition-shadow cursor-pointer group">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                      style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-2))' }}
                    >
                      {getInitials(c.fullName)}
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-foreground leading-tight">{c.fullName}</p>
                      <p className="text-xs text-muted-foreground truncate max-w-[120px]">{c.email}</p>
                    </div>
                  </div>
                  <button onClick={() => handleDelete(c.id)} className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-50 text-muted-foreground hover:text-red-600">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="mb-2"><ScoreBadge score={c.atsScore} /></div>
                <div className="flex gap-1 flex-wrap mb-3">
                  {c.skills.slice(0, 4).map(s => (
                    <span key={s} className="text-[10px] px-1.5 py-0.5 bg-muted rounded-full text-muted-foreground">{s}</span>
                  ))}
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span
                    className="px-1.5 py-0.5 rounded-full font-medium text-[10px]"
                    style={{
                      background: SOURCE_BG[c.source] ?? 'rgba(107,114,128,0.15)',
                      color: SOURCE_TEXT[c.source] ?? '#9ca3af',
                    }}
                  >
                    {c.source}
                  </span>
                  <span style={{ color: 'var(--muted)' }}>{formatRelativeDate(c.createdAt)}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add dialog */}
      <AddCandidateDialog
        open={showAdd}
        onClose={() => setShowAdd(false)}
        vacancies={vacancies}
        onSave={c => setCandidates(prev => [c, ...prev])}
      />
    </div>
  )
}
