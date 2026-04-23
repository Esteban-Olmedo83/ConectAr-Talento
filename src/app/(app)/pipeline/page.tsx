'use client'

import * as React from 'react'
import Link from 'next/link'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Plus, Search, Filter, ChevronDown, Clock } from 'lucide-react'
import { cn, getInitials } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { SupabaseProvider } from '@/lib/supabase/data-provider'
import { useUser } from '@/lib/context/user-context'
import type { Application, Candidate, Vacancy, VacancyStatus } from '@/types'

const STAGES: VacancyStatus[] = [
  'Nuevas Vacantes', 'En Proceso', 'Entrevistas', 'Oferta Enviada', 'Contratado',
]

const STAGE_COLORS: Record<VacancyStatus, string> = {
  'Nuevas Vacantes': 'bg-slate-100 border-slate-200',
  'En Proceso':      'bg-blue-50 border-blue-200',
  'Entrevistas':     'bg-violet-50 border-violet-200',
  'Oferta Enviada':  'bg-amber-50 border-amber-200',
  'Contratado':      'bg-emerald-50 border-emerald-200',
}

const STAGE_HEADER_COLORS: Record<VacancyStatus, string> = {
  'Nuevas Vacantes': 'bg-slate-500',
  'En Proceso':      'bg-blue-500',
  'Entrevistas':     'bg-violet-500',
  'Oferta Enviada':  'bg-amber-500',
  'Contratado':      'bg-emerald-500',
}

const SOURCE_COLORS: Record<string, string> = {
  LinkedIn:     'bg-blue-100 text-blue-700',
  Portal:       'bg-indigo-100 text-indigo-700',
  Referido:     'bg-purple-100 text-purple-700',
  Indeed:       'bg-orange-100 text-orange-700',
  Computrabajo: 'bg-red-100 text-red-700',
  ZonaJobs:     'bg-teal-100 text-teal-700',
  WhatsApp:     'bg-green-100 text-green-700',
  Manual:       'bg-gray-100 text-gray-700',
  Bumeran:      'bg-sky-100 text-sky-700',
}

interface HydratedApplication extends Application {
  candidate?: Candidate
  vacancyTitle?: string
}

function ScorePill({ score }: { score?: number }) {
  if (score == null) return null
  const color =
    score >= 85 ? 'bg-emerald-100 text-emerald-700' :
    score >= 70 ? 'bg-green-100 text-green-700' :
    score >= 50 ? 'bg-yellow-100 text-yellow-700' :
    'bg-red-100 text-red-700'
  return (
    <span className={cn('text-xs font-semibold px-1.5 py-0.5 rounded-full', color)}>
      {score}
    </span>
  )
}

function CandidateCard({ app, isDragging }: { app: HydratedApplication; isDragging?: boolean }) {
  const c = app.candidate
  if (!c) return null
  const daysSince = Math.floor((Date.now() - new Date(app.appliedAt).getTime()) / 86400000)
  return (
    <div className={cn(
      'bg-white rounded-lg border border-border p-3 shadow-sm cursor-grab select-none',
      isDragging && 'opacity-50 shadow-lg rotate-1'
    )}>
      <div className="flex items-start gap-2">
        <div className="shrink-0 w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-bold">
          {getInitials(c.fullName)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-semibold text-foreground truncate">{c.fullName}</span>
            <ScorePill score={c.atsScore} />
          </div>
          <p className="text-xs text-muted-foreground truncate mt-0.5">{app.vacancyTitle}</p>
        </div>
      </div>
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-border">
        <div className="flex items-center gap-1">
          <span className={cn('text-[10px] px-1.5 py-0.5 rounded-full font-medium', SOURCE_COLORS[c.source] ?? 'bg-gray-100 text-gray-700')}>
            {c.source}
          </span>
          <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
            <Clock className="h-2.5 w-2.5" />
            {daysSince === 0 ? 'Hoy' : `${daysSince}d`}
          </span>
        </div>
      </div>
    </div>
  )
}

function SortableCard({ app }: { app: HydratedApplication }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: app.id })
  return (
    <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }} {...attributes} {...listeners}>
      <CandidateCard app={app} isDragging={isDragging} />
    </div>
  )
}

function Lane({ stage, apps }: { stage: VacancyStatus; apps: HydratedApplication[] }) {
  return (
    <div className={cn('flex flex-col rounded-xl border min-w-[260px] w-[260px] flex-shrink-0', STAGE_COLORS[stage])}>
      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-inherit">
        <span className={cn('w-2 h-2 rounded-full', STAGE_HEADER_COLORS[stage])} />
        <span className="text-xs font-semibold text-foreground flex-1">{stage}</span>
        <span className="text-xs font-bold text-muted-foreground bg-white/60 rounded-full px-2 py-0.5">
          {apps.length}
        </span>
      </div>
      <SortableContext items={apps.map(a => a.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-2 p-2 flex-1 min-h-[120px]">
          {apps.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
              <div className="w-8 h-8 rounded-full bg-white/60 flex items-center justify-center">
                <Plus className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground">Sin postulantes</p>
            </div>
          )}
          {apps.map(app => <SortableCard key={app.id} app={app} />)}
        </div>
      </SortableContext>
    </div>
  )
}

function Skeleton() {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {STAGES.map(s => (
        <div key={s} className="min-w-[260px] w-[260px] rounded-xl border border-border bg-slate-50 animate-pulse">
          <div className="h-10 border-b border-border bg-slate-100 rounded-t-xl" />
          <div className="p-2 flex flex-col gap-2">
            {[0, 1, 2].map(i => <div key={i} className="h-16 rounded-lg bg-slate-200" />)}
          </div>
        </div>
      ))}
    </div>
  )
}

export default function PipelinePage() {
  const user = useUser()
  const provider = React.useMemo(() => new SupabaseProvider(), [])

  const [applications, setApplications] = React.useState<HydratedApplication[]>([])
  const [vacancies, setVacancies] = React.useState<Vacancy[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState('')
  const [activeApp, setActiveApp] = React.useState<HydratedApplication | null>(null)
  const [filterVacancy, setFilterVacancy] = React.useState('all')
  const [filterScore, setFilterScore] = React.useState('all')
  const [searchText, setSearchText] = React.useState('')

  const load = React.useCallback(async () => {
    setLoading(true)
    const [appsResult, vacResult] = await Promise.all([
      provider.getApplications(),
      provider.getVacancies(user.tenantId),
    ])
    if (appsResult.error) { setError(appsResult.error); setLoading(false); return }
    if (vacResult.error)  { setError(vacResult.error);  setLoading(false); return }

    const vacs = vacResult.data ?? []
    const vacMap = new Map(vacs.map(v => [v.id, v.title]))
    const hydrated: HydratedApplication[] = (appsResult.data ?? []).map(a => ({
      ...a,
      vacancyTitle: vacMap.get(a.vacancyId) ?? '',
    }))
    setApplications(hydrated)
    setVacancies(vacs)
    setLoading(false)
  }, [provider, user.tenantId])

  React.useEffect(() => { load() }, [load])

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  const filtered = React.useMemo(() => applications.filter(a => {
    const c = a.candidate
    if (!c) return false
    if (filterVacancy !== 'all' && a.vacancyId !== filterVacancy) return false
    if (filterScore === '80+' && (c.atsScore ?? 0) < 80) return false
    if (filterScore === '60-79' && ((c.atsScore ?? 0) < 60 || (c.atsScore ?? 0) >= 80)) return false
    if (filterScore === '<60' && (c.atsScore ?? 0) >= 60) return false
    if (searchText && !c.fullName.toLowerCase().includes(searchText.toLowerCase())) return false
    return true
  }), [applications, filterVacancy, filterScore, searchText])

  const byStage = React.useMemo(() => {
    const map: Record<VacancyStatus, HydratedApplication[]> = {
      'Nuevas Vacantes': [], 'En Proceso': [], 'Entrevistas': [], 'Oferta Enviada': [], 'Contratado': [],
    }
    filtered.forEach(a => { if (map[a.status]) map[a.status].push(a) })
    return map
  }, [filtered])

  function handleDragStart(event: DragStartEvent) {
    setActiveApp(applications.find(a => a.id === event.active.id) ?? null)
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveApp(null)
    if (!over) return
    const draggedApp = applications.find(a => a.id === active.id)
    if (!draggedApp) return
    let newStage: VacancyStatus | null = null
    for (const stage of STAGES) {
      if (over.id === stage || byStage[stage].some(a => a.id === over.id)) {
        newStage = stage; break
      }
    }
    if (!newStage || newStage === draggedApp.status) return
    setApplications(prev => prev.map(a => a.id === draggedApp.id ? { ...a, status: newStage! } : a))
    await provider.updateApplicationStatus(draggedApp.id, newStage)
  }

  if (loading) return (
    <div className="p-6">
      <div className="h-8 w-72 bg-muted rounded animate-pulse mb-6" />
      <Skeleton />
    </div>
  )

  if (error) return (
    <div className="p-6">
      <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
        Error cargando el tablero: {error}
      </div>
    </div>
  )

  const total = filtered.length

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-background">
        <div>
          <h1 className="text-xl font-bold text-foreground">Tablero de Búsquedas</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {total} postulante{total !== 1 ? 's' : ''} en el proceso
          </p>
        </div>
        <Link href="/vacancies">
          <Button size="sm" className="gap-1.5">
            <Plus className="h-4 w-4" />
            Nueva Búsqueda
          </Button>
        </Link>
      </div>

      <div className="flex items-center gap-3 px-6 py-3 border-b border-border bg-background flex-wrap">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar postulante..."
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            className="pl-8 pr-3 py-1.5 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring w-44"
          />
        </div>
        <div className="relative">
          <select
            value={filterVacancy}
            onChange={e => setFilterVacancy(e.target.value)}
            className="pl-3 pr-8 py-1.5 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring appearance-none"
          >
            <option value="all">Todas las búsquedas</option>
            {vacancies.map(v => <option key={v.id} value={v.id}>{v.title}</option>)}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
        </div>
        <div className="relative">
          <select
            value={filterScore}
            onChange={e => setFilterScore(e.target.value)}
            className="pl-3 pr-8 py-1.5 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring appearance-none"
          >
            <option value="all">Todos los scores</option>
            <option value="80+">Excelente (80+)</option>
            <option value="60-79">Bueno (60-79)</option>
            <option value="<60">Regular (&lt;60)</option>
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
        </div>
        {(filterVacancy !== 'all' || filterScore !== 'all' || searchText) && (
          <button
            onClick={() => { setFilterVacancy('all'); setFilterScore('all'); setSearchText('') }}
            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
          >
            <Filter className="h-3.5 w-3.5" /> Limpiar
          </button>
        )}
      </div>

      <div className="flex-1 overflow-auto p-6">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 h-full">
            {STAGES.map(stage => <Lane key={stage} stage={stage} apps={byStage[stage]} />)}
          </div>
          <DragOverlay>
            {activeApp && <CandidateCard app={activeApp} isDragging />}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  )
}
