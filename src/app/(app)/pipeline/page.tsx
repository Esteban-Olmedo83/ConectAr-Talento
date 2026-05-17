'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
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
  Calendar,
  ChevronDown,
  Mail,
  MessageCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
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

const STAGE_COLORS: Record<VacancyStatus, string> = {
  'Nuevas Vacantes': '#94a3b8',
  'En Proceso': '#38bdf8',
  'Entrevistas': '#a78bfa',
  'Oferta Enviada': '#fbbf24',
  'Contratado': '#34d399',
}

const AVATAR_GRADIENTS = [
  'linear-gradient(135deg, #6c63ff, #a78bfa)',
  'linear-gradient(135deg, #0ea5e9, #38bdf8)',
  'linear-gradient(135deg, #10b981, #34d399)',
  'linear-gradient(135deg, #f59e0b, #fbbf24)',
  'linear-gradient(135deg, #f43f5e, #fb7185)',
  'linear-gradient(135deg, #d946ef, #e879f9)',
]

function avatarGradient(name: string): string {
  let sum = 0
  for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i)
  return AVATAR_GRADIENTS[sum % AVATAR_GRADIENTS.length]
}

interface HydratedApplication extends Application {
  candidate?: Candidate
  vacancyTitle?: string
}

// ─── Source badge colors ──────────────────────────────────────────────────────
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

// ─── Stage pills bar ──────────────────────────────────────────────────────────
function StagePillsBar({
  stages,
  counts,
  activeStage,
  onSelect,
}: {
  stages: VacancyStatus[]
  counts: Record<VacancyStatus, number>
  activeStage: VacancyStatus | 'all'
  onSelect: (s: VacancyStatus | 'all') => void
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
      <button
        onClick={() => onSelect('all')}
        style={{
          padding: '5px 12px',
          borderRadius: 99,
          fontSize: 12,
          fontWeight: 600,
          border: '1px solid',
          borderColor: activeStage === 'all' ? 'var(--accent)' : 'var(--border)',
          background: activeStage === 'all' ? 'var(--accent-soft)' : 'transparent',
          color: activeStage === 'all' ? 'var(--accent-2)' : 'var(--muted2)',
          cursor: 'pointer',
          transition: 'all 0.15s',
        }}
      >
        Todos
      </button>
      {stages.map(stage => {
        const isActive = activeStage === stage
        const color = STAGE_COLORS[stage]
        return (
          <button
            key={stage}
            onClick={() => onSelect(stage)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              padding: '5px 12px',
              borderRadius: 99,
              fontSize: 12,
              fontWeight: 600,
              border: '1px solid',
              borderColor: isActive ? color : 'var(--border)',
              background: isActive ? `${color}18` : 'transparent',
              color: isActive ? color : 'var(--muted2)',
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            {stage}
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: 18,
                height: 18,
                borderRadius: 99,
                fontSize: 10,
                fontWeight: 900,
                fontFamily: 'var(--font-nunito, Nunito, sans-serif)',
                background: isActive ? color : 'var(--surface2)',
                color: isActive ? '#fff' : 'var(--muted2)',
                padding: '0 4px',
              }}
            >
              {counts[stage]}
            </span>
          </button>
        )
      })}
    </div>
  )
}

// ─── Candidate card ───────────────────────────────────────────────────────────
interface CardProps {
  app: HydratedApplication
  isDragging?: boolean
}

function CandidateCard({ app, isDragging }: CardProps) {
  const c = app.candidate
  if (!c) return null
  const [hovered, setHovered] = React.useState(false)

  const stageColor = STAGE_COLORS[app.status]
  const score = c.atsScore ?? 0
  const scoreColor =
    score >= 85 ? '#34d399' :
    score >= 70 ? 'var(--accent-2)' :
    '#fbbf24'

  const daysSince = Math.floor(
    (Date.now() - new Date(app.appliedAt).getTime()) / 86400000
  )

  const skills = c.skills ?? []
  const visibleSkills = skills.slice(0, 3)
  const extraSkills = skills.length - 3

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn('select-none cursor-grab', isDragging && 'opacity-50 rotate-1')}
      style={{
        position: 'relative',
        background: 'var(--surface2)',
        border: `1px solid ${hovered && !isDragging ? stageColor : 'var(--border)'}`,
        borderRadius: 12,
        padding: '12px 12px 10px 16px',
        transform: hovered && !isDragging ? 'translateY(-2px)' : 'none',
        boxShadow: hovered && !isDragging
          ? `0 6px 20px rgba(0,0,0,0.3), 0 0 0 1px ${stageColor}30`
          : isDragging
          ? '0 8px 24px rgba(0,0,0,0.4)'
          : '0 1px 3px rgba(0,0,0,0.2)',
        transition: 'all 0.15s ease',
        overflow: 'hidden',
      }}
    >
      {/* Left accent bar */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          bottom: 0,
          width: 3,
          background: stageColor,
          borderRadius: '12px 0 0 12px',
        }}
      />

      {/* Avatar + name row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        {/* Avatar with score badge */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 11,
              background: avatarGradient(c.fullName),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: 14,
              fontWeight: 700,
              fontFamily: 'var(--font-nunito, Nunito, sans-serif)',
            }}
          >
            {getInitials(c.fullName)}
          </div>
          {score > 0 && (
            <div
              style={{
                position: 'absolute',
                bottom: -4,
                right: -4,
                background: 'var(--surface)',
                border: `1.5px solid var(--border)`,
                borderRadius: 6,
                padding: '1px 4px',
                fontSize: 10,
                fontWeight: 900,
                fontFamily: 'var(--font-nunito, Nunito, sans-serif)',
                color: scoreColor,
                lineHeight: 1.3,
              }}
            >
              {score}
            </div>
          )}
        </div>

        {/* Name + vacancy */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 2 }}>
            {c.fullName}
          </p>
          <p style={{ fontSize: 11, color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {app.vacancyTitle}
          </p>
        </div>
      </div>

      {/* Skills chips */}
      {visibleSkills.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 9 }}>
          {visibleSkills.map(skill => (
            <span
              key={skill}
              style={{
                fontSize: 10,
                padding: '2px 7px',
                borderRadius: 99,
                background: 'var(--accent-soft)',
                color: 'var(--accent-2)',
                border: '1px solid rgba(var(--accent-rgb), 0.18)',
                fontWeight: 500,
              }}
            >
              {skill}
            </span>
          ))}
          {extraSkills > 0 && (
            <span
              style={{
                fontSize: 10,
                padding: '2px 7px',
                borderRadius: 99,
                background: 'var(--surface3, var(--surface2))',
                color: 'var(--muted)',
                border: '1px solid var(--border)',
                fontWeight: 500,
              }}
            >
              +{extraSkills}
            </span>
          )}
        </div>
      )}

      {/* Bottom meta row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: 9,
          paddingTop: 8,
          borderTop: '1px solid var(--border)',
        }}
      >
        {/* Source + days */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          {c.source && (
            <span
              style={{
                fontSize: 9,
                padding: '1.5px 6px',
                borderRadius: 99,
                fontWeight: 600,
                background: SOURCE_BG[c.source] ?? 'rgba(107,114,128,0.15)',
                color: SOURCE_TEXT[c.source] ?? '#9ca3af',
              }}
            >
              {c.source}
            </span>
          )}
          <span style={{ fontSize: 10, color: 'var(--muted)' }}>
            {daysSince === 0 ? 'Hoy' : `${daysSince}d`}
          </span>
        </div>

        {/* Quick action buttons */}
        <div
          style={{
            display: 'flex',
            gap: 4,
            opacity: hovered ? 1 : 0,
            transition: 'opacity 0.15s',
          }}
        >
          <button
            onClick={e => e.stopPropagation()}
            style={{
              width: 22,
              height: 22,
              borderRadius: 6,
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--muted2)',
            }}
            title="Enviar email"
          >
            <Mail style={{ width: 11, height: 11 }} />
          </button>
          <button
            onClick={e => e.stopPropagation()}
            style={{
              width: 22,
              height: 22,
              borderRadius: 6,
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--muted2)',
            }}
            title="Agendar entrevista"
          >
            <Calendar style={{ width: 11, height: 11 }} />
          </button>
          <button
            onClick={e => e.stopPropagation()}
            style={{
              width: 22,
              height: 22,
              borderRadius: 6,
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--muted2)',
            }}
            title="WhatsApp"
          >
            <MessageCircle style={{ width: 11, height: 11 }} />
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
  const stageColor = STAGE_COLORS[stage]
  return (
    <div
      className="flex flex-col rounded-xl min-w-[270px] w-[270px] flex-shrink-0"
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        '--lane-color': stageColor,
        overflow: 'hidden',
      } as React.CSSProperties}
    >
      {/* Lane header — 3px top bar + title row */}
      <div
        style={{
          position: 'relative',
          borderBottom: '1px solid var(--border)',
        }}
      >
        {/* 3px top color bar */}
        <div style={{ height: 3, background: stageColor }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 12px' }}>
          {/* Stage dot */}
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: stageColor, flexShrink: 0 }} />
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', flex: 1 }}>{stage}</span>
          {/* Count badge */}
          <span
            style={{
              fontSize: 11,
              fontWeight: 900,
              fontFamily: 'var(--font-nunito, Nunito, sans-serif)',
              padding: '1px 8px',
              borderRadius: 99,
              background: `${stageColor}22`,
              color: stageColor,
            }}
          >
            {apps.length}
          </span>
          {/* Add button */}
          <button
            style={{
              width: 20,
              height: 20,
              borderRadius: 6,
              background: 'var(--surface2)',
              border: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--muted)',
              flexShrink: 0,
            }}
          >
            <Plus style={{ width: 11, height: 11 }} />
          </button>
        </div>
      </div>

      <SortableContext items={apps.map(a => a.id)} strategy={verticalListSortingStrategy}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 8, flex: 1, minHeight: 120 }}>
          {apps.length === 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '28px 0', textAlign: 'center' }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Plus style={{ width: 14, height: 14, color: 'var(--muted)' }} />
              </div>
              <p style={{ fontSize: 11, color: 'var(--muted)' }}>Sin candidatos</p>
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

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────
function Skeleton() {
  return (
    <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 16 }}>
      {STAGES.map(s => (
        <div
          key={s}
          style={{
            minWidth: 270,
            width: 270,
            borderRadius: 12,
            border: '1px solid var(--border)',
            background: 'var(--surface)',
            overflow: 'hidden',
            animation: 'pulse 1.5s ease-in-out infinite',
          }}
        >
          <div style={{ height: 3, background: `${STAGE_COLORS[s]}55` }} />
          <div style={{ height: 40, background: 'var(--surface2)', borderBottom: '1px solid var(--border)' }} />
          <div style={{ padding: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{ height: 90, borderRadius: 10, background: 'var(--surface2)' }} />
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
  const [activeStage, setActiveStage] = React.useState<VacancyStatus | 'all'>('all')

  const { user } = useUser()
  const provider = React.useMemo(() => new SupabaseProvider(), [])
  const pathname = usePathname()

  const load = React.useCallback(async () => {
    const tenantId = user?.tenantId ?? ''
    const [appsResult, vacResult, candResult, intResult] = await Promise.all([
      provider.getApplications(undefined, tenantId),
      provider.getVacancies(tenantId),
      provider.getCandidates(tenantId),
      provider.getInterviews(undefined, tenantId),
    ])
    const vacs = vacResult.data ?? []
    const vacMap = new Map(vacs.map(v => [v.id, v.title]))

    // Build set of candidate IDs that already have a real application
    const realApps = appsResult.data ?? []
    const candidateIdsWithApp = new Set(realApps.map(a => a.candidateId))

    // Build set of candidate IDs that have at least one interview scheduled
    const interviews = intResult.data ?? []
    const candidateIdsWithInterview = new Set(interviews.map(i => i.candidateId))

    // Hydrate real applications
    const hydrated: HydratedApplication[] = realApps.map(a => {
      // If candidate has an interview and is still in early stages, promote to Entrevistas
      const effectiveStatus: VacancyStatus =
        candidateIdsWithInterview.has(a.candidateId) &&
        (a.status === 'Nuevas Vacantes' || a.status === 'En Proceso')
          ? 'Entrevistas'
          : a.status
      return {
        ...a,
        status: effectiveStatus,
        vacancyTitle: vacMap.get(a.vacancyId) ?? '',
      }
    })

    // Create virtual applications for candidates that have no real application
    const allCandidates = candResult.data ?? []
    const now = new Date().toISOString()
    const virtualApps: HydratedApplication[] = allCandidates
      .filter(c => !candidateIdsWithApp.has(c.id))
      .map(c => {
        // Place in Entrevistas if they have an interview, otherwise Nuevas Vacantes
        const stage: VacancyStatus = candidateIdsWithInterview.has(c.id)
          ? 'Entrevistas'
          : 'Nuevas Vacantes'
        return {
          id: `virtual-${c.id}`,
          vacancyId: '',
          candidateId: c.id,
          candidate: c,
          status: stage,
          positionInStage: 0,
          appliedAt: c.appliedAt ?? c.createdAt ?? now,
          updatedAt: c.createdAt ?? now,
          vacancyTitle: '',
        }
      })

    setApplications([...hydrated, ...virtualApps])
    setVacancies(vacs)
    setLoading(false)
  }, [provider, user])

  // Initial load + refetch whenever the pathname resolves to /pipeline (covers
  // Next.js router-cache hits where the component does not fully remount).
  React.useEffect(() => {
    if (pathname === '/pipeline') {
      load()
    }
  }, [load, pathname])

  // Also refetch when the browser tab regains focus (handles new-tab or
  // window-switch scenarios where the user created a vacancy elsewhere).
  React.useEffect(() => {
    function handleVisibilityChange() {
      if (document.visibilityState === 'visible') {
        load()
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [load])

  // Refetch when a vacancy is created or updated from another page in the same
  // session (e.g. /vacancies → /pipeline via sidebar SPA navigation where the
  // pipeline component may remain alive in the Next.js router cache and therefore
  // does not remount).
  React.useEffect(() => {
    function handleVacancyChange() {
      load()
    }
    window.addEventListener('vacancy:created', handleVacancyChange)
    window.addEventListener('vacancy:updated', handleVacancyChange)
    return () => {
      window.removeEventListener('vacancy:created', handleVacancyChange)
      window.removeEventListener('vacancy:updated', handleVacancyChange)
    }
  }, [load])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  const filtered = React.useMemo(() => {
    return applications.filter(a => {
      const c = a.candidate
      if (!c) return false
      if (activeStage !== 'all' && a.status !== activeStage) return false
      if (filterVacancy !== 'all' && a.vacancyId !== filterVacancy) return false
      if (filterScore === '80+' && (c.atsScore ?? 0) < 80) return false
      if (filterScore === '60-79' && ((c.atsScore ?? 0) < 60 || (c.atsScore ?? 0) >= 80)) return false
      if (filterScore === '<60' && (c.atsScore ?? 0) >= 60) return false
      if (searchText && !c.fullName.toLowerCase().includes(searchText.toLowerCase())) return false
      return true
    })
  }, [applications, activeStage, filterVacancy, filterScore, searchText])

  // Counts per stage (from ALL applications, not filtered, for pills)
  const stageCounts = React.useMemo(() => {
    const map: Record<VacancyStatus, number> = {
      'Nuevas Vacantes': 0,
      'En Proceso': 0,
      'Entrevistas': 0,
      'Oferta Enviada': 0,
      'Contratado': 0,
    }
    applications.forEach(a => {
      if (map[a.status] !== undefined) map[a.status]++
    })
    return map
  }, [applications])

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

    let newStage: VacancyStatus | null = null
    for (const stage of STAGES) {
      if (over.id === stage || byStage[stage].some(a => a.id === over.id)) {
        newStage = stage
        break
      }
    }
    if (!newStage || newStage === draggedApp.status) return

    // Optimistically update UI
    setApplications(prev =>
      prev.map(a => a.id === draggedApp.id ? { ...a, status: newStage! } : a)
    )

    // Virtual applications (no vacancy assigned) have no real DB record.
    // We update state optimistically; a real record can only be persisted once
    // the candidate is linked to a vacancy.
    const isVirtual = draggedApp.id.startsWith('virtual-')
    if (!isVirtual) {
      await provider.updateApplicationStatus(draggedApp.id, newStage)
    }
  }

  if (loading) return (
    <div style={{ padding: 24 }}>
      <div style={{ height: 36, width: 280, borderRadius: 8, background: 'var(--surface2)', marginBottom: 16, animation: 'pulse 1.5s ease-in-out infinite' }} />
      <Skeleton />
    </div>
  )

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
      {/* Stage pills bar */}
      <div
        style={{
          padding: '10px 0 10px',
          borderBottom: '1px solid var(--border)',
          marginBottom: 0,
        }}
      >
        <StagePillsBar
          stages={STAGES}
          counts={stageCounts}
          activeStage={activeStage}
          onSelect={setActiveStage}
        />
      </div>

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
        {(filterVacancy !== 'all' || filterScore !== 'all' || searchText || activeStage !== 'all') && (
          <button
            onClick={() => { setFilterVacancy('all'); setFilterScore('all'); setSearchText(''); setActiveStage('all') }}
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
