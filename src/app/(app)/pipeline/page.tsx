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
import { SupabaseProvider } from '@/lib/providers/supabase-provider'
import { useUser } from '@/lib/context/user-context'
import type { Application, Candidate, Vacancy, VacancyStatus } from '@/types'

// ─── Types ────────────────────────────────────────────────────────────────────
const STAGES: VacancyStatus[] = [
  'Nuevas Vacantes',
  'En Proceso',
  'Entrevistas',
  'Oferta Enviada',
  'Contratado',
]

const STAGE_ACCENT: Record<VacancyStatus, string> = {
  'Nuevas Vacantes': '#6b7280',
  'En Proceso': '#3b82f6',
  'Entrevistas': '#8b5cf6',
  'Oferta Enviada': '#f59e0b',
  'Contratado': '#10b981',
}

interface HydratedApplication extends Application {
  candidate?: Candidate
  vacancyTitle?: string
}

// ─── ATS Score pill ───────────────────────────────────────────────────────────
function ScorePill({ score }: { score?: number }) {
  if (score === undefined || score === null) return null
  const bg =
    score >= 85 ? 'rgba(52,211,153,0.15)' :
    score >= 70 ? 'rgba(52,211,153,0.1)' :
    score >= 50 ? 'rgba(251,191,36,0.15)' :
    'rgba(239,68,68,0.15)'
  const color =
    score >= 85 ? '#34d399' :
    score >= 70 ? '#34d399' :
    score >= 50 ? '#fbbf24' :
    '#ef4444'
  return (
    <span
      className="text-xs font-bold px-1.5 py-0.5 rounded-full"
      style={{ background: bg, color }}
    >
      {score}
    </span>
  )
}

// ─── Source badge ─────────────────────────────────────────────────────────────
const SOURCE_BG: Record<string, string> = {
  LinkedIn: 'rgba(59,130,246,0.15)',
  Portal: 'rgba(108,99,255,0.15)',
  Referido: 'rgba(139,92,246,0.15)',
  Indeed: 'rgba(249,115,22,0.15)',
  Computrabajo: 'rgba(239,68,68,0.15)',
  ZonaJobs: 'rgba(20,184,166,0.15)',
  WhatsApp: 'rgba(34,197,94,0.15)',
  Manual: 'rgba(107,114,128,0.15)',
  Bumeran: 'rgba(14,165,233,0.15)',
}
const SOURCE_TEXT: Record<string, string> = {
  LinkedIn: '#60a5fa',
  Portal: '#a78bfa',
  Referido: '#c084fc',
  Indeed: '#fb923c',
  Computrabajo: '#f87171',
  ZonaJobs: '#2dd4bf',
  WhatsApp: '#4ade80',
  Manual: '#9ca3af',
  Bumeran: '#38bdf8',
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
        'rounded-xl border p-3 cursor-grab select-none transition-all',
        isDragging && 'opacity-50 rotate-1'
      )}
      style={{
        background: 'var(--surface2)',
        borderColor: 'var(--border)',
        boxShadow: isDragging ? '0 8px 24px rgba(0,0,0,0.4)' : '0 1px 3px rgba(0,0,0,0.2)',
      }}
    >
      <div className="flex items-start gap-2">
        <div
          className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
          style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-2))' }}
        >
          {getInitials(c.fullName)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-semibold truncate" style={{ color: 'var(--text)' }}>{c.fullName}</span>
            <ScorePill score={c.atsScore} />
          </div>
          <p className="text-xs truncate mt-0.5" style={{ color: 'var(--muted)' }}>{app.vacancyTitle}</p>
        </div>
      </div>
      <div
        className="flex items-center justify-between mt-2 pt-2"
        style={{ borderTop: '1px solid var(--border)' }}
      >
        <div className="flex items-center gap-1">
          <span
            className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
            style={{
              background: SOURCE_BG[c.source] ?? 'rgba(107,114,128,0.15)',
              color: SOURCE_TEXT[c.source] ?? '#9ca3af',
            }}
          >
            {c.source}
          </span>
          <span className="text-[10px] flex items-center gap-0.5" style={{ color: 'var(--muted)' }}>
            <Clock className="h-2.5 w-2.5" />
            {daysSince === 0 ? 'Hoy' : `${daysSince}d`}
          </span>
        </div>
        <div className="flex gap-1">
          <button
            className="text-[10px] font-medium transition-colors hover:opacity-80"
            style={{ color: 'var(--accent-2)' }}
          >
            Ver
          </button>
          <button
            className="text-[10px] transition-colors hover:opacity-80"
            style={{ color: 'var(--muted)' }}
          >
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
  const accent = STAGE_ACCENT[stage]
  return (
    <div
      className="flex flex-col rounded-xl min-w-[260px] w-[260px] flex-shrink-0 border"
      style={{
        background: 'var(--surface)',
        borderColor: 'var(--border)',
      }}
    >
      {/* Lane header with colored top bar */}
      <div
        className="relative flex items-center gap-2 px-3 py-2.5"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        {/* Accent top bar */}
        <div
          className="absolute top-0 left-4 right-4 h-[2px] rounded-b"
          style={{ background: accent }}
        />
        <span
          className="w-2 h-2 rounded-full shrink-0"
          style={{ background: accent }}
        />
        <span className="text-xs font-semibold flex-1" style={{ color: 'var(--text)' }}>{stage}</span>
        <span
          className="text-xs font-bold rounded-full px-2 py-0.5"
          style={{
            background: `${accent}22`,
            color: accent,
          }}
        >
          {apps.length}
        </span>
      </div>
      <SortableContext items={apps.map(a => a.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-2 p-2 flex-1 min-h-[120px]">
          {apps.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: 'var(--surface2)' }}
              >
                <Plus className="h-4 w-4" style={{ color: 'var(--muted)' }} />
              </div>
              <p className="text-xs" style={{ color: 'var(--muted)' }}>Sin candidatos</p>
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
        <div
          key={s}
          className="min-w-[260px] w-[260px] rounded-xl border animate-pulse"
          style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
        >
          <div
            className="h-10 rounded-t-xl"
            style={{ background: 'var(--surface2)', borderBottom: '1px solid var(--border)' }}
          />
          <div className="p-2 flex flex-col gap-2">
            {[0, 1, 2].map(i => (
              <div key={i} className="h-16 rounded-lg" style={{ background: 'var(--surface3)' }} />
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

  const { user } = useUser()
  const provider = React.useMemo(() => new SupabaseProvider(), [])

  const load = React.useCallback(async () => {
    const tenantId = user?.tenantId ?? ''
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
  }, [provider, user])

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
      <div className="h-8 w-64 rounded animate-pulse mb-6" style={{ background: 'var(--surface2)' }} />
      <Skeleton />
    </div>
  )

  const total = filtered.length

  const inputStyle: React.CSSProperties = {
    background: 'var(--surface2)',
    border: '1px solid var(--border)',
    color: 'var(--text)',
    borderRadius: 8,
    fontSize: 13,
    padding: '6px 12px',
    outline: 'none',
  }

  return (
    <div className="flex flex-col h-full">
      {/* Filters */}
      <div
        className="flex items-center gap-3 py-3 flex-wrap shrink-0"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <div className="relative">
          <Search
            className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5"
            style={{ color: 'var(--muted)' }}
          />
          <input
            type="text"
            placeholder="Buscar candidato..."
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            style={{ ...inputStyle, paddingLeft: 32 }}
            className="w-44"
          />
        </div>
        <div className="relative">
          <select
            value={filterVacancy}
            onChange={e => setFilterVacancy(e.target.value)}
            style={{ ...inputStyle, paddingRight: 28, appearance: 'none' as const }}
          >
            <option value="all">Todas las vacantes</option>
            {vacancies.map(v => (
              <option key={v.id} value={v.id}>{v.title}</option>
            ))}
          </select>
          <ChevronDown
            className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 pointer-events-none"
            style={{ color: 'var(--muted)' }}
          />
        </div>
        <div className="relative">
          <select
            value={filterScore}
            onChange={e => setFilterScore(e.target.value)}
            style={{ ...inputStyle, paddingRight: 28, appearance: 'none' as const }}
          >
            <option value="all">Todos los scores</option>
            <option value="80+">Excelente (80+)</option>
            <option value="60-79">Bueno (60-79)</option>
            <option value="<60">Regular (&lt;60)</option>
          </select>
          <ChevronDown
            className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 pointer-events-none"
            style={{ color: 'var(--muted)' }}
          />
        </div>
        {(filterVacancy !== 'all' || filterScore !== 'all' || searchText) && (
          <button
            onClick={() => { setFilterVacancy('all'); setFilterScore('all'); setSearchText('') }}
            className="text-xs flex items-center gap-1 transition-colors hover:opacity-80"
            style={{ color: 'var(--muted)' }}
          >
            <Filter className="h-3.5 w-3.5" /> Limpiar
          </button>
        )}
        <div className="ml-auto">
          <Link href="/vacancies">
            <Button size="sm" className="gap-1.5">
              <Plus className="h-4 w-4" />
              Nueva Vacante
            </Button>
          </Link>
        </div>
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
