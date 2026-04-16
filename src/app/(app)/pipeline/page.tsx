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
import {
  Plus,
  Search,
  Filter,
  User2,
  Calendar,
  ChevronDown,
  Briefcase,
  Clock,
  ExternalLink,
} from 'lucide-react'
import { cn, formatRelativeDate, getInitials, generateId } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { LocalStorageProvider } from '@/lib/providers/data-provider'
import type { Application, Candidate, Vacancy, VacancyStatus } from '@/types'

// ─── Seed data ────────────────────────────────────────────────────────────────
const TENANT_ID = 'demo'

function seedIfEmpty(provider: LocalStorageProvider) {
  if (typeof window === 'undefined') return
  const existing = localStorage.getItem('ct_vacancies')
  if (existing && JSON.parse(existing).length > 0) return

  const now = new Date().toISOString()
  const vacancies: Omit<Vacancy, 'applications'>[] = [
    { id: 'v1', tenantId: TENANT_ID, title: 'Frontend Developer Senior', department: 'Tecnología', status: 'Nuevas Vacantes', requirements: ['React', 'TypeScript', 'Next.js'], modality: 'Remoto', priority: 'Alta', createdAt: now },
    { id: 'v2', tenantId: TENANT_ID, title: 'Marketing Digital Manager', department: 'Marketing', status: 'Nuevas Vacantes', requirements: ['SEO', 'Google Ads', 'Analytics'], modality: 'Híbrido', priority: 'Media', createdAt: now },
    { id: 'v3', tenantId: TENANT_ID, title: 'Analista de RRHH', department: 'RRHH', status: 'Nuevas Vacantes', requirements: ['Reclutamiento', 'HRIS', 'Liquidación'], modality: 'Presencial', priority: 'Baja', createdAt: now },
  ]
  const candidates: Omit<Candidate, 'interviews'>[] = [
    { id: 'c1', tenantId: TENANT_ID, fullName: 'Valentina Rodríguez', email: 'vrodriguez@email.com', atsScore: 88, skills: ['React', 'TypeScript', 'Node.js'], source: 'LinkedIn', appliedAt: new Date(Date.now() - 2 * 86400000).toISOString(), createdAt: now },
    { id: 'c2', tenantId: TENANT_ID, fullName: 'Matías González', email: 'mgonzalez@email.com', atsScore: 72, skills: ['React', 'CSS', 'Figma'], source: 'Portal', appliedAt: new Date(Date.now() - 5 * 86400000).toISOString(), createdAt: now },
    { id: 'c3', tenantId: TENANT_ID, fullName: 'Lucía Fernández', email: 'lfernandez@email.com', atsScore: 95, skills: ['SEO', 'Google Ads', 'HubSpot'], source: 'LinkedIn', appliedAt: new Date(Date.now() - 1 * 86400000).toISOString(), createdAt: now },
    { id: 'c4', tenantId: TENANT_ID, fullName: 'Santiago Pérez', email: 'sperez@email.com', atsScore: 61, skills: ['Google Ads', 'Facebook Ads', 'Analytics'], source: 'Referido', appliedAt: new Date(Date.now() - 8 * 86400000).toISOString(), createdAt: now },
    { id: 'c5', tenantId: TENANT_ID, fullName: 'Camila López', email: 'clopez@email.com', atsScore: 79, skills: ['Reclutamiento', 'HRIS', 'Evaluación'], source: 'LinkedIn', appliedAt: new Date(Date.now() - 3 * 86400000).toISOString(), createdAt: now },
    { id: 'c6', tenantId: TENANT_ID, fullName: 'Nicolás Martínez', email: 'nmartinez@email.com', atsScore: 83, skills: ['React', 'TypeScript', 'GraphQL'], source: 'Indeed', appliedAt: new Date(Date.now() - 12 * 86400000).toISOString(), createdAt: now },
    { id: 'c7', tenantId: TENANT_ID, fullName: 'Florencia Sánchez', email: 'fsanchez@email.com', atsScore: 68, skills: ['SEO', 'Content', 'Analytics'], source: 'Portal', appliedAt: new Date(Date.now() - 7 * 86400000).toISOString(), createdAt: now },
    { id: 'c8', tenantId: TENANT_ID, fullName: 'Agustín Torres', email: 'atorres@email.com', atsScore: 91, skills: ['React', 'Next.js', 'TypeScript', 'AWS'], source: 'LinkedIn', appliedAt: new Date(Date.now() - 15 * 86400000).toISOString(), createdAt: now },
  ]
  const applications: Application[] = [
    { id: 'a1', vacancyId: 'v1', candidateId: 'c1', status: 'Nuevas Vacantes', positionInStage: 0, appliedAt: now, updatedAt: now },
    { id: 'a2', vacancyId: 'v1', candidateId: 'c2', status: 'Nuevas Vacantes', positionInStage: 1, appliedAt: now, updatedAt: now },
    { id: 'a3', vacancyId: 'v2', candidateId: 'c3', status: 'En Proceso', positionInStage: 0, appliedAt: now, updatedAt: now },
    { id: 'a4', vacancyId: 'v2', candidateId: 'c4', status: 'En Proceso', positionInStage: 1, appliedAt: now, updatedAt: now },
    { id: 'a5', vacancyId: 'v3', candidateId: 'c5', status: 'Entrevistas', positionInStage: 0, appliedAt: now, updatedAt: now },
    { id: 'a6', vacancyId: 'v1', candidateId: 'c6', status: 'Entrevistas', positionInStage: 1, appliedAt: now, updatedAt: now },
    { id: 'a7', vacancyId: 'v2', candidateId: 'c7', status: 'Oferta Enviada', positionInStage: 0, appliedAt: now, updatedAt: now },
    { id: 'a8', vacancyId: 'v1', candidateId: 'c8', status: 'Contratado', positionInStage: 0, appliedAt: now, updatedAt: now },
  ]

  localStorage.setItem('ct_vacancies', JSON.stringify(vacancies.map(v => ({ ...v, applications: [] }))))
  localStorage.setItem('ct_candidates', JSON.stringify(candidates.map(c => ({ ...c, interviews: [] }))))
  localStorage.setItem('ct_applications', JSON.stringify(applications))
}

// ─── Types ────────────────────────────────────────────────────────────────────
const STAGES: VacancyStatus[] = [
  'Nuevas Vacantes',
  'En Proceso',
  'Entrevistas',
  'Oferta Enviada',
  'Contratado',
]

const STAGE_COLORS: Record<VacancyStatus, string> = {
  'Nuevas Vacantes': 'bg-slate-100 border-slate-200',
  'En Proceso': 'bg-blue-50 border-blue-200',
  'Entrevistas': 'bg-violet-50 border-violet-200',
  'Oferta Enviada': 'bg-amber-50 border-amber-200',
  'Contratado': 'bg-emerald-50 border-emerald-200',
}

const STAGE_HEADER_COLORS: Record<VacancyStatus, string> = {
  'Nuevas Vacantes': 'bg-slate-500',
  'En Proceso': 'bg-blue-500',
  'Entrevistas': 'bg-violet-500',
  'Oferta Enviada': 'bg-amber-500',
  'Contratado': 'bg-emerald-500',
}

interface HydratedApplication extends Application {
  candidate?: Candidate
  vacancyTitle?: string
}

// ─── ATS Score pill ───────────────────────────────────────────────────────────
function ScorePill({ score }: { score?: number }) {
  if (score === undefined || score === null) return null
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

// ─── Source badge ─────────────────────────────────────────────────────────────
const SOURCE_COLORS: Record<string, string> = {
  LinkedIn: 'bg-blue-100 text-blue-700',
  Portal: 'bg-indigo-100 text-indigo-700',
  Referido: 'bg-purple-100 text-purple-700',
  Indeed: 'bg-orange-100 text-orange-700',
  Computrabajo: 'bg-red-100 text-red-700',
  ZonaJobs: 'bg-teal-100 text-teal-700',
  WhatsApp: 'bg-green-100 text-green-700',
  Manual: 'bg-gray-100 text-gray-700',
  Bumeran: 'bg-sky-100 text-sky-700',
}

// ─── Candidate card ───────────────────────────────────────────────────────────
interface CardProps {
  app: HydratedApplication
  isDragging?: boolean
}

function CandidateCard({ app, isDragging }: CardProps) {
  const c = app.candidate
  if (!c) return null
  const daysSince = Math.floor(
    (Date.now() - new Date(app.appliedAt).getTime()) / 86400000
  )
  return (
    <div
      className={cn(
        'bg-white rounded-lg border border-border p-3 shadow-sm cursor-grab select-none',
        isDragging && 'opacity-50 shadow-lg rotate-1'
      )}
    >
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
        <div className="flex gap-1">
          <button className="text-[10px] text-indigo-600 hover:text-indigo-800 font-medium">Ver</button>
          <button className="text-[10px] text-muted-foreground hover:text-foreground font-medium">
            <Calendar className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Sortable card ────────────────────────────────────────────────────────────
function SortableCard({ app }: { app: HydratedApplication }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: app.id })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <CandidateCard app={app} isDragging={isDragging} />
    </div>
  )
}

// ─── Lane ─────────────────────────────────────────────────────────────────────
function Lane({
  stage,
  apps,
}: {
  stage: VacancyStatus
  apps: HydratedApplication[]
}) {
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
              <p className="text-xs text-muted-foreground">Sin candidatos</p>
            </div>
          )}
          {apps.map(app => (
            <SortableCard key={app.id} app={app} />
          ))}
        </div>
      </SortableContext>
    </div>
  )
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────
function Skeleton() {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {STAGES.map(s => (
        <div key={s} className="min-w-[260px] w-[260px] rounded-xl border border-border bg-slate-50 animate-pulse">
          <div className="h-10 border-b border-border bg-slate-100 rounded-t-xl" />
          <div className="p-2 flex flex-col gap-2">
            {[0, 1, 2].map(i => (
              <div key={i} className="h-16 rounded-lg bg-slate-200" />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function PipelinePage() {
  const [applications, setApplications] = React.useState<HydratedApplication[]>([])
  const [vacancies, setVacancies] = React.useState<Vacancy[]>([])
  const [loading, setLoading] = React.useState(true)
  const [activeApp, setActiveApp] = React.useState<HydratedApplication | null>(null)
  const [filterVacancy, setFilterVacancy] = React.useState<string>('all')
  const [filterScore, setFilterScore] = React.useState<string>('all')
  const [searchText, setSearchText] = React.useState('')

  const provider = React.useMemo(() => new LocalStorageProvider(), [])

  const getTenantId = () => {
    try {
      const raw = localStorage.getItem('ct_user')
      if (raw) return JSON.parse(raw).tenantId ?? TENANT_ID
    } catch { /* noop */ }
    return TENANT_ID
  }

  const load = React.useCallback(async () => {
    const tenantId = getTenantId()
    seedIfEmpty(provider)
    const [appsResult, vacResult] = await Promise.all([
      provider.getApplications(),
      provider.getVacancies(tenantId),
    ])
    const vacs = vacResult.data ?? []
    const vacMap = new Map(vacs.map(v => [v.id, v.title]))
    const hydrated: HydratedApplication[] = (appsResult.data ?? []).map(a => ({
      ...a,
      vacancyTitle: vacMap.get(a.vacancyId) ?? '',
    }))
    setApplications(hydrated)
    setVacancies(vacs)
    setLoading(false)
  }, [provider])

  React.useEffect(() => { load() }, [load])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  const filtered = React.useMemo(() => {
    return applications.filter(a => {
      const c = a.candidate
      if (!c) return false
      if (filterVacancy !== 'all' && a.vacancyId !== filterVacancy) return false
      if (filterScore === '80+' && (c.atsScore ?? 0) < 80) return false
      if (filterScore === '60-79' && ((c.atsScore ?? 0) < 60 || (c.atsScore ?? 0) >= 80)) return false
      if (filterScore === '<60' && (c.atsScore ?? 0) >= 60) return false
      if (searchText && !c.fullName.toLowerCase().includes(searchText.toLowerCase())) return false
      return true
    })
  }, [applications, filterVacancy, filterScore, searchText])

  const byStage = React.useMemo(() => {
    const map: Record<VacancyStatus, HydratedApplication[]> = {
      'Nuevas Vacantes': [],
      'En Proceso': [],
      'Entrevistas': [],
      'Oferta Enviada': [],
      'Contratado': [],
    }
    filtered.forEach(a => {
      if (map[a.status]) map[a.status].push(a)
    })
    return map
  }, [filtered])

  function handleDragStart(event: DragStartEvent) {
    const app = applications.find(a => a.id === event.active.id)
    setActiveApp(app ?? null)
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveApp(null)
    if (!over) return
    const draggedApp = applications.find(a => a.id === active.id)
    if (!draggedApp) return

    // Find which stage the drop target belongs to
    let newStage: VacancyStatus | null = null
    for (const stage of STAGES) {
      if (over.id === stage || byStage[stage].some(a => a.id === over.id)) {
        newStage = stage
        break
      }
    }
    if (!newStage || newStage === draggedApp.status) return

    // Optimistic update
    setApplications(prev =>
      prev.map(a => a.id === draggedApp.id ? { ...a, status: newStage! } : a)
    )
    await provider.updateApplicationStatus(draggedApp.id, newStage)
  }

  if (loading) return (
    <div className="p-6">
      <div className="h-8 w-64 bg-muted rounded animate-pulse mb-6" />
      <Skeleton />
    </div>
  )

  const total = filtered.length

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-background">
        <div>
          <h1 className="text-xl font-bold text-foreground">Pipeline de Reclutamiento</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {total} candidato{total !== 1 ? 's' : ''} en proceso
          </p>
        </div>
        <Link href="/vacancies">
          <Button size="sm" className="gap-1.5">
            <Plus className="h-4 w-4" />
            Nueva Vacante
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 px-6 py-3 border-b border-border bg-background flex-wrap">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar candidato..."
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
            <option value="all">Todas las vacantes</option>
            {vacancies.map(v => (
              <option key={v.id} value={v.id}>{v.title}</option>
            ))}
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

      {/* Kanban board */}
      <div className="flex-1 overflow-auto p-6">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 h-full">
            {STAGES.map(stage => (
              <Lane key={stage} stage={stage} apps={byStage[stage]} />
            ))}
          </div>
          <DragOverlay>
            {activeApp && <CandidateCard app={activeApp} isDragging />}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  )
}
