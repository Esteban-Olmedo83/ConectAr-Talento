'use client'

import * as React from 'react'
import {
  Plus, Search, Briefcase, Users, Clock, BarChart2,
  ChevronDown, MapPin, Laptop, Building2, Pencil,
  Archive, Rocket, MoreVertical, Globe
} from 'lucide-react'
import { cn, formatRelativeDate, generateId } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { LocalStorageProvider } from '@/lib/providers/data-provider'
import type { Vacancy, VacancyModality, VacancyPriority } from '@/types'
import { rubros, getProfilesByRubro } from '@/lib/skills'

const TENANT_ID = 'demo'
const getTenantId = () => {
  try { const r = localStorage.getItem('ct_user'); if (r) return JSON.parse(r).tenantId ?? TENANT_ID } catch {}
  return TENANT_ID
}

const PRIORITY_CONFIG: Record<VacancyPriority, { label: string; cls: string }> = {
  Alta: { label: 'Alta', cls: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-500/15 dark:text-red-300 dark:border-red-500/25' },
  Media: { label: 'Media', cls: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/25' },
  Baja: { label: 'Baja', cls: 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-500/15 dark:text-gray-400 dark:border-gray-500/25' },
}

const MODALITY_ICONS: Record<VacancyModality, React.ElementType> = {
  Presencial: Building2,
  Remoto: Laptop,
  Híbrido: Globe,
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
  const provider = React.useMemo(() => new LocalStorageProvider(), [])
  const [form, setForm] = React.useState({
    title: vacancy?.title ?? '',
    department: vacancy?.department ?? '',
    rubro: '',
    perfil: '',
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

  const profileOptions = React.useMemo(() => {
    if (!form.rubro) return []
    return getProfilesByRubro(form.rubro)
  }, [form.rubro])

  function handleProfileSelect(perfil: string) {
    const profiles = getProfilesByRubro(form.rubro)
    const p = profiles.find(p => p.perfil === perfil)
    if (!p) return
    const allSkills = [...p.skills.tecnicas, ...p.skills.blandas]
    setForm(f => ({
      ...f,
      perfil,
      title: f.title || p.perfil,
      requirements: allSkills.join(', '),
    }))
  }

  async function generateDescription() {
    if (!form.title) return
    setGenerating(true)
    try {
      const res = await fetch('/api/ai/generate-jd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
    const tenantId = getTenantId()
    const input = {
      tenantId,
      title: form.title,
      department: form.department,
      status: 'Nuevas Vacantes' as const,
      modality: form.modality,
      priority: form.priority,
      location: form.location || undefined,
      salaryMin: form.salaryMin ? Number(form.salaryMin) : undefined,
      salaryMax: form.salaryMax ? Number(form.salaryMax) : undefined,
      currency: form.currency || undefined,
      requirements: form.requirements.split(',').map(s => s.trim()).filter(Boolean),
      description: form.description || undefined,
      closingDate: form.closingDate || undefined,
    }
    const result = vacancy
      ? await provider.updateVacancy(vacancy.id, input)
      : await provider.createVacancy(input)
    setSaving(false)
    if (result.data) { onSave(result.data); onClose() }
  }

  const inputCls = 'w-full px-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring'
  const labelCls = 'text-xs font-medium text-muted-foreground mb-1 block'

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{vacancy ? 'Editar vacante' : 'Nueva vacante'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* Rubro + Perfil selector */}
          <div className="grid grid-cols-2 gap-3 p-3 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg border border-indigo-100 dark:border-indigo-500/20">
            <div>
              <label className={cn(labelCls, 'text-indigo-700 dark:text-indigo-300')}>Rubro</label>
              <select value={form.rubro} onChange={e => setForm(f => ({...f, rubro: e.target.value, perfil: ''}))}
                className={cn(inputCls, 'border-indigo-500/30')}>
                <option value="">Seleccioná un rubro</option>
                {rubros.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className={cn(labelCls, 'text-indigo-300')}>Perfil (auto-completa skills)</label>
              <select value={form.perfil} onChange={e => handleProfileSelect(e.target.value)}
                disabled={!form.rubro}
                className={cn(inputCls, 'border-indigo-500/30 disabled:opacity-50')}>
                <option value="">Seleccioná un perfil</option>
                {profileOptions.map(p => <option key={p.id} value={p.perfil}>{p.perfil} · {p.nivel}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Título del puesto *</label>
              <input required value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))} className={inputCls} placeholder="Frontend Developer Senior" />
            </div>
            <div>
              <label className={labelCls}>Departamento *</label>
              <input required value={form.department} onChange={e => setForm(f => ({...f, department: e.target.value}))} className={inputCls} placeholder="Tecnología" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={labelCls}>Modalidad</label>
              <select value={form.modality} onChange={e => setForm(f => ({...f, modality: e.target.value as VacancyModality}))} className={inputCls}>
                <option>Remoto</option><option>Presencial</option><option>Híbrido</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Prioridad</label>
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
            <label className={labelCls}>Ubicación</label>
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
            <label className={labelCls}>Skills requeridas (separadas por coma)</label>
            <input value={form.requirements} onChange={e => setForm(f => ({...f, requirements: e.target.value}))} className={inputCls} placeholder="React, TypeScript, 3 años de experiencia, inglés intermedio" />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className={labelCls}>Descripción del puesto</label>
              <Button type="button" variant="outline" size="sm" onClick={generateDescription} disabled={!form.title || generating}
                className="text-xs gap-1 h-6 px-2 border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/10">
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
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={saving}>
              {saving ? '⏳ Guardando...' : vacancy ? 'Guardar cambios' : 'Crear vacante'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ─── Vacancy Card ─────────────────────────────────────────────────────────────
function VacancyCard({ vacancy, onEdit, onArchive }: {
  vacancy: Vacancy
  onEdit: () => void
  onArchive: () => void
}) {
  const ModalityIcon = MODALITY_ICONS[vacancy.modality]
  const days = Math.floor((Date.now() - new Date(vacancy.createdAt).getTime()) / 86400000)
  const salaryStr = vacancy.salaryMin
    ? `${vacancy.currency ?? 'ARS'} ${(vacancy.salaryMin/1000).toFixed(0)}K – ${((vacancy.salaryMax ?? vacancy.salaryMin)/1000).toFixed(0)}K`
    : 'A convenir'

  return (
    <Card className="hover:shadow-md transition-shadow group relative">
      <CardContent className="p-4">
        {/* Priority badge */}
        <div className="flex items-start justify-between mb-2">
          <span className={cn('text-[10px] px-2 py-0.5 rounded-full border font-semibold', PRIORITY_CONFIG[vacancy.priority].cls)}>
            {vacancy.priority}
          </span>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={onEdit} className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground">
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button onClick={onArchive} className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground">
              <Archive className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <h3 className="font-bold text-foreground text-base leading-tight mb-1 cursor-pointer hover:text-indigo-600 transition-colors" onClick={onEdit}>
          {vacancy.title}
        </h3>

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

        <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-3">{salaryStr}</div>

        {/* Skills */}
        {vacancy.requirements.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {vacancy.requirements.slice(0, 3).map(s => (
              <span key={s} className="text-[10px] px-1.5 py-0.5 bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300 rounded-full">{s}</span>
            ))}
            {vacancy.requirements.length > 3 && (
              <span className="text-[10px] text-muted-foreground">+{vacancy.requirements.length - 3}</span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {days === 0 ? 'Creada hoy' : `Abierta hace ${days} día${days !== 1 ? 's' : ''}`}
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {vacancy.applications.length} candidatos
          </span>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t border-border">
          <Button variant="outline" size="sm" className="flex-1 text-xs h-7" onClick={() => window.location.href = '/pipeline'}>
            Ver pipeline
          </Button>
          <Button size="sm" className="flex-1 text-xs h-7 gap-1 bg-indigo-600 hover:bg-indigo-700">
            <Rocket className="h-3 w-3" /> Publicar
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function VacanciesPage() {
  const [vacancies, setVacancies] = React.useState<Vacancy[]>([])
  const [loading, setLoading] = React.useState(true)
  const [showForm, setShowForm] = React.useState(false)
  const [editVacancy, setEditVacancy] = React.useState<Vacancy | undefined>()
  const [search, setSearch] = React.useState('')
  const [filterStatus, setFilterStatus] = React.useState('all')
  const [filterPriority, setFilterPriority] = React.useState('all')

  const provider = React.useMemo(() => new LocalStorageProvider(), [])

  const load = React.useCallback(async () => {
    const tid = getTenantId()
    const res = await provider.getVacancies(tid)
    setVacancies(res.data ?? [])
    setLoading(false)
  }, [provider])

  React.useEffect(() => { load() }, [load])

  const filtered = React.useMemo(() => vacancies.filter(v => {
    if (search && !v.title.toLowerCase().includes(search.toLowerCase()) && !v.department.toLowerCase().includes(search.toLowerCase())) return false
    if (filterPriority !== 'all' && v.priority !== filterPriority) return false
    return true
  }), [vacancies, search, filterPriority])

  const kpis = React.useMemo(() => ({
    total: vacancies.length,
    open: vacancies.filter(v => v.status !== 'Contratado').length,
    totalCandidates: vacancies.reduce((s, v) => s + v.applications.length, 0),
    avgDays: vacancies.length > 0
      ? Math.round(vacancies.reduce((s, v) => s + Math.floor((Date.now() - new Date(v.createdAt).getTime()) / 86400000), 0) / vacancies.length)
      : 0,
  }), [vacancies])

  async function handleArchive(id: string) {
    await provider.deleteVacancy(id)
    setVacancies(prev => prev.filter(v => v.id !== id))
  }

  function handleSaved(v: Vacancy) {
    setVacancies(prev => {
      const idx = prev.findIndex(x => x.id === v.id)
      if (idx !== -1) { const next = [...prev]; next[idx] = v; return next }
      return [v, ...prev]
    })
  }

  if (loading) return (
    <div className="p-6 space-y-4">
      <div className="h-8 w-48 bg-muted rounded animate-pulse" />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[0,1,2,3].map(i => <div key={i} className="h-48 bg-muted rounded-xl animate-pulse" />)}
      </div>
    </div>
  )

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Gestión de Vacantes</h1>
          <p className="text-sm text-muted-foreground">{kpis.open} vacantes abiertas</p>
        </div>
        <Button onClick={() => { setEditVacancy(undefined); setShowForm(true) }} className="gap-1.5">
          <Plus className="h-4 w-4" /> Nueva Vacante
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Briefcase, label: 'Total Vacantes', value: kpis.total, color: 'bg-indigo-500' },
          { icon: Globe, label: 'Abiertas', value: kpis.open, color: 'bg-emerald-500' },
          { icon: Users, label: 'Candidatos Totales', value: kpis.totalCandidates, color: 'bg-violet-500' },
          { icon: Clock, label: 'Días Promedio Abierta', value: `${kpis.avgDays}d`, color: 'bg-amber-500' },
        ].map(k => (
          <Card key={k.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center shrink-0', k.color)}>
                <k.icon className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{k.label}</p>
                <p className="text-lg font-bold">{k.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar vacante..." className="pl-8 pr-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring w-full" />
        </div>
        <div className="relative">
          <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)} className="pl-3 pr-8 py-2 text-sm rounded-md border border-input bg-background focus:outline-none appearance-none">
            <option value="all">Todas las prioridades</option>
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
          <div className="w-16 h-16 rounded-full bg-indigo-500/10 flex items-center justify-center mb-4">
            <Briefcase className="h-8 w-8 text-indigo-400" />
          </div>
          <h3 className="font-semibold text-foreground mb-1">
            {search ? 'No se encontraron vacantes' : 'Creá tu primera búsqueda'}
          </h3>
          <p className="text-sm text-muted-foreground max-w-sm mb-4">
            {search ? 'Probá con otros términos.' : 'Publicá una vacante y empezá a recibir candidatos hoy.'}
          </p>
          {!search && <Button onClick={() => setShowForm(true)} className="gap-1.5"><Plus className="h-4 w-4" /> Nueva Vacante</Button>}
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
    </div>
  )
}
