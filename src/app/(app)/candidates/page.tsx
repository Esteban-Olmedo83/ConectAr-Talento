'use client'

import * as React from 'react'
import {
  Search, Plus, Upload, Users, Brain, TrendingUp, Clock,
  Grid3X3, List, ChevronDown, Trash2, Calendar, Eye,
  X, Loader2, CheckCircle2, Mail, Phone, FileText, AlertTriangle,
  ExternalLink, Award, Briefcase, BookOpen, ArrowRight,
  Video, CheckCheck, XCircle, Star
} from 'lucide-react'
import { cn, formatRelativeDate, getInitials } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { DraggableModal } from '@/components/ui/draggable-modal'
import { SupabaseProvider } from '@/lib/providers/supabase-provider'
import { useUser } from '@/lib/context/user-context'
import { getPlanLimits } from '@/lib/plan-limits'
import type { Candidate, Vacancy, VacancyStatus, CandidateSource, InterviewType, MeetingPlatform, Application, Interview } from '@/types'
import { useLanguage } from '@/lib/context/language-context'

// ─── Score badge ──────────────────────────────────────────────────────────────
function ScoreBadge({ score }: { score?: number }) {
  const { t } = useLanguage()
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
  const label =
    score >= 85 ? t.candidates.scoreLabels.excellent :
    score >= 70 ? t.candidates.scoreLabels.good :
    score >= 50 ? t.candidates.scoreLabels.fair :
    t.candidates.scoreLabels.low
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

// ─── View Profile Dialog ──────────────────────────────────────────────────────
function ViewProfileDialog({ candidate: candidateProp, open, onClose, onUpdate, vacancies, clients }: {
  candidate: Candidate | null
  open: boolean
  onClose: () => void
  onUpdate?: (c: Candidate) => void
  vacancies?: Vacancy[]
  clients?: import('@/types').Client[]
}) {
  const [candidate, setCandidate] = React.useState<Candidate | null>(null)
  const [editMode, setEditMode] = React.useState(false)
  const [editName, setEditName] = React.useState('')
  const [editEmail, setEditEmail] = React.useState('')
  const [editPhone, setEditPhone] = React.useState('')
  const [editExperience, setEditExperience] = React.useState('')
  const [editEducation, setEditEducation] = React.useState('')
  const [editSkills, setEditSkills] = React.useState('')
  const [editClientId, setEditClientId] = React.useState('')
  const [editSource, setEditSource] = React.useState<CandidateSource>('Manual')
  const [isSaving, setIsSaving] = React.useState(false)
  const [saveError, setSaveError] = React.useState('')
  const cvInputRef = React.useRef<HTMLInputElement>(null)
  const [uploadingCv, setUploadingCv] = React.useState(false)
  const avatarInputRef = React.useRef<HTMLInputElement>(null)
  const [uploadingAvatar, setUploadingAvatar] = React.useState(false)
  const provider = React.useMemo(() => new SupabaseProvider(), [])
  const { t } = useLanguage()

  // Process info state
  const [applications, setApplications] = React.useState<Application[]>([])
  const [interviews, setInterviews] = React.useState<Interview[]>([])
  const [loadingProcess, setLoadingProcess] = React.useState(false)

  React.useEffect(() => {
    if (open && candidateProp) {
      setCandidate(candidateProp)
      setEditName(candidateProp.fullName)
      setEditEmail(candidateProp.email)
      setEditPhone(candidateProp.phone ?? '')
      setEditExperience(candidateProp.experienceYears != null ? String(candidateProp.experienceYears) : '')
      setEditEducation(candidateProp.education ?? '')
      setEditSkills(candidateProp.skills.join(', '))
      setEditClientId(candidateProp.clientId ?? '')
      setEditSource(candidateProp.source ?? 'Manual')
      setEditMode(false)
      setSaveError('')
      // Load process info
      setLoadingProcess(true)
      Promise.all([
        provider.getApplicationsByCandidateId(candidateProp.id),
        provider.getInterviews(candidateProp.id),
      ]).then(([appRes, intRes]) => {
        setApplications(appRes.data ?? [])
        setInterviews(intRes.data ?? [])
        setLoadingProcess(false)
      })
    }
  }, [open, candidateProp, provider])

  // Reload process info when stage changes in another tab/page
  React.useEffect(() => {
    if (!open || !candidateProp) return
    function reloadProcess() {
      if (!candidateProp) return
      setLoadingProcess(true)
      Promise.all([
        provider.getApplicationsByCandidateId(candidateProp.id),
        provider.getInterviews(candidateProp.id),
      ]).then(([appRes, intRes]) => {
        setApplications(appRes.data ?? [])
        setInterviews(intRes.data ?? [])
        setLoadingProcess(false)
      })
    }
    window.addEventListener('application:stage-changed', reloadProcess)
    window.addEventListener('interview:scheduled', reloadProcess)
    return () => {
      window.removeEventListener('application:stage-changed', reloadProcess)
      window.removeEventListener('interview:scheduled', reloadProcess)
    }
  }, [open, candidateProp, provider])

  async function handleCvUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !candidate) return
    setUploadingCv(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('vacancyRequirements', JSON.stringify([]))
      const aiHeaders: Record<string, string> = {}
      try {
        const raw = localStorage.getItem('ct_ai_config')
        if (raw) {
          const cfg = JSON.parse(raw) as { apiKey?: string }
          if (cfg.apiKey) aiHeaders['x-ai-api-key'] = cfg.apiKey
        }
      } catch { /* noop */ }
      const res = await fetch('/api/upload/cv', { method: 'POST', body: formData, headers: aiHeaders })
      const data = await res.json() as { ok?: boolean; cvUrl?: string; cvFileName?: string; avatarUrl?: string; error?: string }
      if (!res.ok || !data.ok) { console.error(data.error); return }
      const patch: { cvUrl?: string; cvFileName?: string; avatarUrl?: string } = {
        cvUrl: data.cvUrl,
        cvFileName: data.cvFileName,
      }
      if (data.avatarUrl && !candidate.avatarUrl) {
        patch.avatarUrl = data.avatarUrl
      }
      const result = await provider.updateCandidate(candidate.id, patch)
      if (result.data) {
        setCandidate(result.data)
        onUpdate?.(result.data)
      }
    } catch (err) { console.error(err) }
    finally { setUploadingCv(false) }
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !candidate) return
    setUploadingAvatar(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', 'avatar')
      formData.append('id', candidate.id)
      const res = await fetch('/api/upload/image', { method: 'POST', body: formData })
      const data = await res.json() as { ok?: boolean; url?: string; error?: string }
      if (!data.ok || !data.url) { console.error(data.error); return }
      const result = await provider.updateCandidate(candidate.id, { avatarUrl: data.url })
      if (result.data) {
        setCandidate(result.data)
        onUpdate?.(result.data)
        window.dispatchEvent(new CustomEvent('candidate:updated'))
      }
    } catch (err) { console.error(err) }
    finally { setUploadingAvatar(false); e.target.value = '' }
  }

  if (!candidate) return null

  const inputCls = 'w-full px-3 py-2 text-sm rounded-md border border-input bg-background'
  const inputEditCls = 'w-full px-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring'
  const labelCls = 'text-xs font-medium mb-1 block'

  async function handleSave() {
    if (!candidate) return
    setIsSaving(true)
    setSaveError('')
    const result = await provider.updateCandidate(candidate.id, {
      fullName: editName,
      email: editEmail,
      phone: editPhone || undefined,
      experienceYears: Number(editExperience) || undefined,
      education: editEducation || undefined,
      skills: editSkills.split(',').map(s => s.trim()).filter(Boolean),
      clientId: editClientId || undefined,
      source: editSource,
    })
    setIsSaving(false)
    if (result.error) {
      setSaveError(result.error)
    } else if (result.data) {
      onUpdate?.(result.data)
      setEditMode(false)
    }
  }

  return (
    <DraggableModal
      open={open}
      onClose={onClose}
      title={
        <div className="flex items-center justify-between w-full">
          <span>{t.candidates.profile.title}</span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => { setEditMode(e => !e); setSaveError('') }}
            className="ml-4"
          >
            {editMode ? t.common.cancel : t.common.edit}
          </Button>
        </div>
      }
      maxWidth="32rem"
    >
        <div className="mt-2 space-y-4">
          {/* Avatar + name */}
          <div className="flex items-center gap-3">
            <div className="relative shrink-0 group">
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
              />
              {candidate.avatarUrl ? (
                <img
                  src={candidate.avatarUrl}
                  alt={candidate.fullName}
                  className="w-14 h-14 rounded-full object-cover"
                />
              ) : (
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center text-white text-lg font-bold"
                  style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-2))' }}
                >
                  {getInitials(editMode ? editName : candidate.fullName)}
                </div>
              )}
              {editMode && (
                <button
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  title={t.candidates.addDialog.changeAvatar}
                >
                  {uploadingAvatar
                    ? <span className="text-white text-xs">...</span>
                    : <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  }
                </button>
              )}
            </div>
            <div>
              {editMode ? (
                <input
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className={cn(inputEditCls, 'text-base font-bold')}
                  placeholder={t.candidates.placeholderFullName}
                />
              ) : (
                <p className="text-base font-bold" style={{ color: 'var(--text)' }}>{candidate.fullName}</p>
              )}
              {!editMode && candidate.education && (
                <p className="text-xs" style={{ color: 'var(--muted)' }}>{candidate.education}</p>
              )}
              <div className="mt-1"><ScoreBadge score={candidate.atsScore} /></div>
            </div>
          </div>

          {/* Contact */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls} style={{ color: 'var(--muted)' }}>
                <Mail className="inline h-3 w-3 mr-1" />Email
              </label>
              {editMode ? (
                <input
                  type="text"
                  value={editEmail}
                  onChange={e => setEditEmail(e.target.value)}
                  className={inputEditCls}
                  placeholder="email@ejemplo.com"
                />
              ) : (
                <p className={inputCls} style={{ color: 'var(--text)' }}>{candidate.email}</p>
              )}
            </div>
            <div>
              <label className={labelCls} style={{ color: 'var(--muted)' }}>
                <Phone className="inline h-3 w-3 mr-1" />{t.candidates.addDialog.phone}
              </label>
              {editMode ? (
                <input
                  type="text"
                  value={editPhone}
                  onChange={e => setEditPhone(e.target.value)}
                  className={inputEditCls}
                  placeholder="+54 11 1234-5678"
                />
              ) : (
                <p className={inputCls} style={{ color: 'var(--text)' }}>{candidate.phone || '—'}</p>
              )}
            </div>
          </div>

          {/* Experience + Source */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls} style={{ color: 'var(--muted)' }}>
                <Briefcase className="inline h-3 w-3 mr-1" />{t.candidates.profile.experience}
              </label>
              {editMode ? (
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={editExperience}
                  onChange={e => setEditExperience(e.target.value)}
                  className={inputEditCls}
                  placeholder={t.candidates.placeholderYears}
                />
              ) : (
                <p className={inputCls} style={{ color: 'var(--text)' }}>
                  {candidate.experienceYears != null ? `${candidate.experienceYears} ${t.candidates.profile.experienceYears}` : '—'}
                </p>
              )}
            </div>
            <div>
              <label className={labelCls} style={{ color: 'var(--muted)' }}>
                <Award className="inline h-3 w-3 mr-1" />{t.candidates.addDialog.source}
              </label>
              {editMode ? (
                <select
                  value={editSource}
                  onChange={e => setEditSource(e.target.value as CandidateSource)}
                  className={inputEditCls}
                >
                  {['LinkedIn','Portal','Referido','Indeed','Computrabajo','ZonaJobs','Bumeran','WhatsApp','Manual'].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              ) : (
                <p className={inputCls} style={{ color: 'var(--text)' }}>{candidate.source}</p>
              )}
            </div>
          </div>

          {/* Client */}
          <div>
            <label className={labelCls} style={{ color: 'var(--muted)' }}>
              <Briefcase className="inline h-3 w-3 mr-1" />{t.candidates.clientLabel}
            </label>
            {editMode && clients && clients.length > 0 ? (
              <select
                value={editClientId}
                onChange={e => setEditClientId(e.target.value)}
                className={inputEditCls}
              >
                <option value="">{t.candidates.noClientAssigned}</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            ) : (
              <p className={inputCls} style={{ color: candidate.client ? 'var(--text)' : 'var(--muted)' }}>
                {candidate.client?.name ?? (editClientId ? clients?.find(c => c.id === editClientId)?.name : '—') ?? '—'}
              </p>
            )}
          </div>

          {/* Education */}
          {(editMode || candidate.education) && (
            <div>
              <label className={labelCls} style={{ color: 'var(--muted)' }}>
                <BookOpen className="inline h-3 w-3 mr-1" />{t.candidates.profile.education}
              </label>
              {editMode ? (
                <input
                  type="text"
                  value={editEducation}
                  onChange={e => setEditEducation(e.target.value)}
                  className={inputEditCls}
                  placeholder={t.candidates.placeholderEducation}
                />
              ) : (
                <p className={inputCls} style={{ color: 'var(--text)' }}>{candidate.education}</p>
              )}
            </div>
          )}

          {/* Skills */}
          {editMode ? (
            <div>
              <label className={labelCls} style={{ color: 'var(--muted)' }}>{t.candidates.addDialog.skills}</label>
              <textarea
                value={editSkills}
                onChange={e => setEditSkills(e.target.value)}
                className={cn(inputEditCls, 'resize-none h-16')}
                placeholder={t.candidates.addDialog.skillsPlaceholder}
              />
            </div>
          ) : (
            candidate.skills.length > 0 && (
              <div>
                <label className={labelCls} style={{ color: 'var(--muted)' }}>{t.candidates.profile.skills}</label>
                <div className="flex gap-1.5 flex-wrap mt-1">
                  {candidate.skills.map(s => (
                    <span key={s} className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{s}</span>
                  ))}
                </div>
              </div>
            )
          )}

          {/* Notes */}
          {candidate.notes && (
            <div>
              <label className={labelCls} style={{ color: 'var(--muted)' }}>{t.candidates.addDialog.notes}</label>
              <p className="text-sm px-3 py-2 rounded-md border border-input bg-background whitespace-pre-wrap" style={{ color: 'var(--text)' }}>{candidate.notes}</p>
            </div>
          )}

          {/* CV */}
          {editMode ? (
            <div>
              <label className={labelCls} style={{ color: 'var(--muted)' }}>{t.candidates.profile.cvFile}</label>
              {candidate.cvUrl && (
                <div className="flex items-center gap-2 mb-2">
                  <a href={candidate.cvUrl} target="_blank" rel="noopener noreferrer"
                    className="text-xs underline" style={{ color: 'var(--accent-2)' }}>
                    {candidate.cvFileName ?? t.candidates.cvViewCurrent}
                  </a>
                </div>
              )}
              <input
                ref={cvInputRef}
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={handleCvUpload}
              />
              <button
                type="button"
                onClick={() => cvInputRef.current?.click()}
                disabled={uploadingCv}
                className="w-full px-3 py-2 text-sm rounded-md border border-dashed text-center transition-colors"
                style={{ borderColor: 'var(--accent)', color: 'var(--accent-2)', background: 'var(--accent-soft)' }}
              >
                {uploadingCv ? t.candidates.cvUploading : candidate.cvUrl ? t.candidates.cvChangePdf : t.candidates.cvUploadPdf}
              </button>
            </div>
          ) : candidate.cvUrl ? (
            <div>
              <label className={labelCls} style={{ color: 'var(--muted)' }}>
                <FileText className="inline h-3 w-3 mr-1" />{t.candidates.profile.cvFile}
              </label>
              <a
                href={candidate.cvUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm px-3 py-2 rounded-md border transition-opacity hover:opacity-80"
                style={{ borderColor: 'var(--accent)', color: 'var(--accent-2)', background: 'var(--accent-soft)' }}
              >
                <FileText className="h-3.5 w-3.5" />
                {candidate.cvFileName || t.candidates.cvView}
                <ExternalLink className="h-3 w-3 ml-auto" />
              </a>
            </div>
          ) : null}

          {/* Process info cards */}
          {(loadingProcess || applications.length > 0 || interviews.length > 0) && (
            <div>
              <p className="text-xs font-semibold mb-2" style={{ color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {t.candidates.processStatus}
              </p>
              {loadingProcess ? (
                <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--muted)' }}>
                  <Loader2 className="h-3 w-3 animate-spin" /> {t.common.loading}
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {applications.map(app => {
                    const vacancy = vacancies?.find(v => v.id === app.vacancyId)
                    const appInterviews = interviews.filter(i => i.vacancyId === app.vacancyId)
                    const completed = appInterviews.filter(i => i.status === 'Completada')
                    const pending = appInterviews.filter(i => i.status === 'Programada')
                    const STATUS_STYLE: Record<string, { bg: string; color: string; icon: React.ElementType; label: string }> = {
                      'Nuevas Vacantes': { bg: 'rgba(96,165,250,0.1)',  color: '#60a5fa', icon: Clock,       label: 'Nuevo' },
                      'En Proceso':      { bg: 'rgba(167,114,250,0.1)', color: '#a78bfa', icon: TrendingUp,  label: 'En proceso' },
                      'Entrevistas':     { bg: 'rgba(251,146,60,0.1)',  color: '#fb923c', icon: Video,       label: 'Entrevistas' },
                      'Oferta Enviada':  { bg: 'rgba(52,211,153,0.1)',  color: '#34d399', icon: CheckCheck,  label: 'Oferta enviada' },
                      'Contratado':      { bg: 'rgba(16,185,129,0.1)',  color: '#10b981', icon: CheckCircle2, label: 'Contratado' },
                      'Descartado':      { bg: 'rgba(248,113,113,0.1)', color: '#f87171', icon: XCircle,     label: 'Descartado' },
                    }
                    const style = STATUS_STYLE[app.status] ?? STATUS_STYLE['En Proceso']
                    const StatusIcon = style.icon
                    const avgScore = completed.length > 0
                      ? Math.round(completed.reduce((s, i) => {
                          const sc = i.scorecard
                          if (!sc) return s
                          return s + ((sc.technicalSkills + sc.communication + sc.culturalFit) / 3)
                        }, 0) / completed.filter(i => i.scorecard).length || 0)
                      : null
                    return (
                      <a
                        key={app.id}
                        href="/pipeline"
                        className="flex items-center gap-3 rounded-xl border p-3 transition-all hover:opacity-90 cursor-pointer no-underline"
                        style={{ background: style.bg, borderColor: `${style.color}33` }}
                      >
                        <div className="flex items-center justify-center w-8 h-8 rounded-lg shrink-0" style={{ background: `${style.color}20` }}>
                          <StatusIcon className="h-4 w-4" style={{ color: style.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate" style={{ color: 'var(--text)' }}>
                            {vacancy?.title ?? 'Vacante'}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                            <span className="text-xs font-medium" style={{ color: style.color }}>{style.label}</span>
                            {appInterviews.length > 0 && (
                              <span className="text-xs" style={{ color: 'var(--muted)' }}>
                                · {completed.length}/{appInterviews.length} entrevista{appInterviews.length !== 1 ? 's' : ''}
                                {pending.length > 0 && ` (${pending.length} pendiente${pending.length !== 1 ? 's' : ''})`}
                              </span>
                            )}
                            {avgScore != null && avgScore > 0 && (
                              <span className="inline-flex items-center gap-0.5 text-xs" style={{ color: '#fbbf24' }}>
                                <Star className="h-2.5 w-2.5 fill-current" />
                                {avgScore}
                              </span>
                            )}
                          </div>
                        </div>
                        <ArrowRight className="h-3.5 w-3.5 shrink-0" style={{ color: 'var(--muted)' }} />
                      </a>
                    )
                  })}
                  {applications.length === 0 && interviews.length > 0 && (
                    <a
                      href="/interviews"
                      className="flex items-center gap-3 rounded-xl border p-3 transition-all hover:opacity-90 cursor-pointer no-underline"
                      style={{ background: 'rgba(251,146,60,0.1)', borderColor: 'rgba(251,146,60,0.2)' }}
                    >
                      <div className="flex items-center justify-center w-8 h-8 rounded-lg" style={{ background: 'rgba(251,146,60,0.2)' }}>
                        <Video className="h-4 w-4" style={{ color: '#fb923c' }} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Entrevistas</p>
                        <p className="text-xs" style={{ color: 'var(--muted)' }}>
                          {interviews.filter(i => i.status === 'Completada').length} completada{interviews.filter(i => i.status === 'Completada').length !== 1 ? 's' : ''} · {interviews.filter(i => i.status === 'Programada').length} programada{interviews.filter(i => i.status === 'Programada').length !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <ArrowRight className="h-3.5 w-3.5 shrink-0" style={{ color: 'var(--muted)' }} />
                    </a>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Dates */}
          <p className="text-xs" style={{ color: 'var(--muted)' }}>
            {t.candidates.addedOn.replace('{date}', formatRelativeDate(candidate.createdAt))}
          </p>

          {/* Save error */}
          {saveError && (
            <p className="text-xs px-3 py-2 rounded-md" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>
              {saveError}
            </p>
          )}

          {editMode ? (
            <Button
              className="w-full"
              disabled={isSaving}
              onClick={handleSave}
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {t.common.save}
            </Button>
          ) : (
            <div className="flex justify-end pt-1">
              <Button variant="outline" onClick={onClose}>{t.common.close}</Button>
            </div>
          )}
        </div>
    </DraggableModal>
  )
}

// ─── Schedule Interview Dialog ────────────────────────────────────────────────
function ScheduleInterviewDialog({ candidate, vacancies, open, onClose, provider }: {
  candidate: Candidate | null
  vacancies: Vacancy[]
  open: boolean
  onClose: () => void
  provider: SupabaseProvider
}) {
  const { user } = useUser()
  const { t } = useLanguage()
  const [form, setForm] = React.useState({
    date: '',
    time: '',
    type: 'RRHH' as InterviewType,
    vacancyId: '',
    interviewerName: '',
    interviewerEmail: '',
    meetingPlatform: 'presencial' as MeetingPlatform,
    meetingLink: '',
    notes: '',
  })
  const [saving, setSaving] = React.useState(false)
  const [saved, setSaved] = React.useState(false)
  const [error, setError] = React.useState('')

  React.useEffect(() => {
    if (open) {
      setForm({
        date: '',
        time: '',
        type: 'RRHH',
        vacancyId: '',
        interviewerName: user?.fullName ?? '',
        interviewerEmail: user?.email ?? '',
        meetingPlatform: 'presencial',
        meetingLink: '',
        notes: '',
      })
      setSaved(false)
      setError('')
    }
  }, [open, user])

  if (!candidate) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!candidate) return
    setSaving(true)
    setError('')
    const result = await provider.createInterview({
      candidateId: candidate.id,
      vacancyId: form.vacancyId || (vacancies[0]?.id ?? ''),
      scheduledAt: new Date(`${form.date}T${form.time}`).toISOString(),
      type: form.type,
      interviewerName: form.interviewerName,
      interviewerEmail: form.interviewerEmail || undefined,
      status: 'Programada',
      meetingPlatform: form.meetingPlatform,
      meetingLink: form.meetingLink || undefined,
      notes: form.notes || undefined,
    })
    setSaving(false)
    if (result.error) {
      setError(result.error)
    } else {
      // Promote application status to Entrevistas in DB
      const vacancyId = form.vacancyId || (vacancies[0]?.id ?? '')
      if (vacancyId) {
        const appRes = await provider.getApplicationsByCandidateId(candidate.id)
        const app = appRes.data?.find(a => a.vacancyId === vacancyId && a.status === 'Nuevas Vacantes')
        if (app) await provider.updateApplicationStatus(app.id, 'Entrevistas')
      }
      window.dispatchEvent(new CustomEvent('interview:scheduled'))
      setSaved(true)
      setTimeout(onClose, 1200)
    }
  }

  const inputCls = 'w-full px-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring'
  const labelCls = 'text-xs font-medium text-muted-foreground mb-1 block'

  return (
    <DraggableModal open={open} onClose={onClose} title={t.pipeline.scheduleInterview} maxWidth="28rem">
        <p className="text-sm text-muted-foreground -mt-1">
          {t.candidates.candidateLabel}: <strong style={{ color: 'var(--text)' }}>{candidate.fullName}</strong>
        </p>
        {saved ? (
          <div className="flex flex-col items-center gap-3 py-8">
            <CheckCircle2 className="h-10 w-10" style={{ color: '#34d399' }} />
            <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>¡Entrevista agendada!</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3 mt-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>{t.pipeline.interviewForm.date} *</label>
                <input
                  required
                  type="date"
                  value={form.date}
                  min={new Date().toISOString().slice(0, 10)}
                  onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>{t.pipeline.interviewForm.time} *</label>
                <input
                  required
                  type="time"
                  value={form.time}
                  onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
                  className={inputCls}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>{t.pipeline.interviewForm.type} *</label>
                <select
                  value={form.type}
                  onChange={e => setForm(f => ({ ...f, type: e.target.value as InterviewType }))}
                  className={inputCls}
                >
                  <option value="RRHH">{t.pipeline.interviewTypes.rrhh}</option>
                  <option value="Técnica">{t.pipeline.interviewTypes.technical}</option>
                  <option value="Con Hiring Manager">{t.pipeline.interviewTypes.hiring}</option>
                  <option value="Cultural">{t.pipeline.interviewTypes.cultural}</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>{t.pipeline.interviewForm.platform} *</label>
                <select
                  value={form.meetingPlatform}
                  onChange={e => setForm(f => ({ ...f, meetingPlatform: e.target.value as MeetingPlatform }))}
                  className={inputCls}
                >
                  <option value="presencial">{t.pipeline.platforms.presencial}</option>
                  <option value="zoom">{t.pipeline.platforms.zoom}</option>
                  <option value="google_meet">{t.pipeline.platforms.meet}</option>
                  <option value="teams">{t.pipeline.platforms.teams}</option>
                </select>
              </div>
            </div>
            {vacancies.length > 0 && (
              <div>
                <label className={labelCls}>{t.candidates.vacancyLabel}</label>
                <select
                  value={form.vacancyId}
                  onChange={e => setForm(f => ({ ...f, vacancyId: e.target.value }))}
                  className={inputCls}
                >
                  <option value="">{t.candidates.noSpecificVacancy}</option>
                  {vacancies.map(v => <option key={v.id} value={v.id}>{v.title}</option>)}
                </select>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>{t.pipeline.interviewForm.interviewer} *</label>
                <input
                  required
                  value={form.interviewerName}
                  onChange={e => setForm(f => ({ ...f, interviewerName: e.target.value }))}
                  className={inputCls}
                  placeholder={t.candidates.placeholderInterviewerName}
                />
              </div>
              <div>
                <label className={labelCls}>{t.pipeline.interviewForm.interviewerEmail}</label>
                <input
                  type="email"
                  value={form.interviewerEmail}
                  onChange={e => setForm(f => ({ ...f, interviewerEmail: e.target.value }))}
                  className={inputCls}
                  placeholder="email@empresa.com"
                />
              </div>
            </div>
            {(form.meetingPlatform === 'zoom' || form.meetingPlatform === 'google_meet' || form.meetingPlatform === 'teams') && (
              <div>
                <label className={labelCls}>{t.pipeline.interviewForm.meetingLink}</label>
                <input
                  value={form.meetingLink}
                  onChange={e => setForm(f => ({ ...f, meetingLink: e.target.value }))}
                  className={inputCls}
                  placeholder="https://..."
                />
              </div>
            )}
            <div>
              <label className={labelCls}>{t.pipeline.interviewForm.notes}</label>
              <textarea
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                className={cn(inputCls, 'resize-none h-16')}
                placeholder={t.candidates.placeholderInterviewNotes}
              />
            </div>
            {error && (
              <p className="text-xs px-3 py-2 rounded-md" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>
                {error}
              </p>
            )}
            <div className="flex justify-end gap-2 pt-1">
              <Button type="button" variant="outline" onClick={onClose}>{t.common.cancel}</Button>
              <Button type="submit" disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Calendar className="h-4 w-4 mr-2" />}
                {t.pipeline.scheduleInterview}
              </Button>
            </div>
          </form>
        )}
    </DraggableModal>
  )
}

// ─── Delete Confirmation Dialog ───────────────────────────────────────────────
function DeleteConfirmDialog({ candidate, open, onClose, onConfirm, deleting }: {
  candidate: Candidate | null
  open: boolean
  onClose: () => void
  onConfirm: () => void
  deleting: boolean
}) {
  const { t } = useLanguage()
  if (!candidate) return null
  return (
    <DraggableModal
      open={open}
      onClose={onClose}
      title={<span className="flex items-center gap-2"><AlertTriangle className="h-5 w-5" style={{ color: '#ef4444' }} />{t.candidates.deleteConfirm.title}</span>}
      maxWidth="24rem"
    >
        <div className="space-y-3">
          <p className="text-sm" style={{ color: 'var(--text)' }}>
            {t.candidates.deleteConfirm.message}
          </p>
          <div className="px-3 py-2.5 rounded-lg text-xs space-y-1" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}>
            <p className="font-semibold">⚠ {t.candidates.deleteConfirm.message}</p>
            <ul className="ml-3 space-y-0.5 list-disc" style={{ color: 'var(--muted)' }}>
              <li>{t.candidates.deleteConfirm.bulletProfile}</li>
              <li>{t.candidates.deleteConfirm.bulletInterviews}</li>
              <li>{t.candidates.deleteConfirm.bulletHistory}</li>
              <li>{t.candidates.deleteConfirm.bulletFiles}</li>
            </ul>
          </div>
          <p className="text-xs" style={{ color: 'var(--muted)' }}>
            {t.candidates.deleteConfirm.adminOnly}
          </p>
        </div>
        <div className="flex justify-end gap-2 mt-2">
          <Button variant="outline" onClick={onClose} disabled={deleting}>{t.candidates.deleteConfirm.cancel}</Button>
          <Button
            onClick={onConfirm}
            disabled={deleting}
            className="bg-red-600 hover:bg-red-700 text-white border-0"
          >
            {deleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
            {t.candidates.deleteConfirm.delete}
          </Button>
        </div>
    </DraggableModal>
  )
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KpiCard({ icon: Icon, label, value, sub, accentColor }: {
  icon: React.ElementType; label: string; value: string | number; sub?: string; accentColor: string
}) {
  return (
    <div
      className="rounded-xl border p-4 flex items-center gap-3 relative overflow-hidden"
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

// ─── Add candidate dialog ─────────────────────────────────────────────────────
function AddCandidateDialog({
  open,
  onClose,
  vacancies,
  clients,
  prefill,
  onSave,
}: {
  open: boolean
  onClose: () => void
  vacancies: Vacancy[]
  clients?: import('@/types').Client[]
  prefill?: Partial<Candidate>
  onSave: (c: Candidate) => void
}) {
  const { user } = useUser()
  const { t } = useLanguage()
  const provider = React.useMemo(() => new SupabaseProvider(), [])
  const avatarInputRef = React.useRef<HTMLInputElement>(null)
  const cvInputRef = React.useRef<HTMLInputElement>(null)
  const [uploadingAvatar, setUploadingAvatar] = React.useState(false)
  const [avatarError, setAvatarError] = React.useState<string | null>(null)
  const [uploadingCvManual, setUploadingCvManual] = React.useState(false)
  const [cvUploadError, setCvUploadError] = React.useState<string | null>(null)
  const [form, setForm] = React.useState({
    fullName: prefill?.fullName ?? '',
    email: prefill?.email ?? '',
    phone: prefill?.phone ?? '',
    vacancyId: '',
    clientId: prefill?.clientId ?? '',
    source: 'LinkedIn' as CandidateSource,
    notes: '',
    skills: prefill?.skills?.join(', ') ?? '',
    experienceYears: prefill?.experienceYears ?? '',
    education: prefill?.education ?? '',
    atsScore: prefill?.atsScore ?? '',
    cvUrl: prefill?.cvUrl ?? '',
    cvFileName: prefill?.cvFileName ?? '',
    avatarUrl: prefill?.avatarUrl ?? '',
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
        cvUrl: prefill.cvUrl ?? f.cvUrl,
        cvFileName: prefill.cvFileName ?? f.cvFileName,
        avatarUrl: prefill.avatarUrl ?? f.avatarUrl,
      }))
    }
  }, [prefill])

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingAvatar(true)
    setAvatarError(null)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', 'avatar')
      formData.append('id', `new-${Date.now()}`)
      const res = await fetch('/api/upload/image', { method: 'POST', body: formData })
      const data = await res.json() as { ok?: boolean; url?: string; error?: string }
      if (data.ok && data.url) {
        setForm(f => ({ ...f, avatarUrl: data.url! }))
      } else {
        setAvatarError(data.error ?? t.candidates.photoUploadError)
      }
    } catch {
      setAvatarError(t.candidates.photoNetworkError)
    } finally {
      setUploadingAvatar(false)
      e.target.value = ''
    }
  }

  async function handleCvUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingCvManual(true)
    setCvUploadError(null)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('skipAnalysis', 'true')
      const res = await fetch('/api/upload/cv', { method: 'POST', body: fd })
      const data = await res.json() as { ok?: boolean; cvUrl?: string; cvFileName?: string; error?: string }
      if (data.ok && data.cvUrl) {
        setForm(f => ({ ...f, cvUrl: data.cvUrl!, cvFileName: data.cvFileName ?? file.name }))
      } else {
        setCvUploadError(data.error ?? 'No se pudo subir el archivo.')
      }
    } catch {
      setCvUploadError('Sin conexión al servidor.')
    } finally {
      setUploadingCvManual(false)
      e.target.value = ''
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const tenantId = user?.tenantId ?? ''
    const result = await provider.createCandidate({
      tenantId,
      clientId: form.clientId || undefined,
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
      cvUrl: form.cvUrl || undefined,
      cvFileName: form.cvFileName || undefined,
      avatarUrl: form.avatarUrl || undefined,
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
      window.dispatchEvent(new CustomEvent('candidate:created'))
      onSave(result.data)
      onClose()
    }
  }

  const inputCls = 'w-full px-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring'
  const labelCls = 'text-xs font-medium text-muted-foreground mb-1 block'

  return (
    <DraggableModal open={open} onClose={onClose} title={t.candidates.addDialog.title} maxWidth="32rem">
        <form onSubmit={handleSubmit} className="space-y-3 mt-2">
          {/* Avatar upload */}
          <div className="flex items-center gap-3">
            <div className="relative shrink-0 group">
              <input ref={avatarInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleAvatarUpload} />
              {form.avatarUrl ? (
                <img src={form.avatarUrl} alt="foto" className="w-14 h-14 rounded-full object-cover" />
              ) : (
                <div className="w-14 h-14 rounded-full flex items-center justify-center text-white text-lg font-bold"
                  style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-2, #a78bfa))' }}>
                  {form.fullName ? getInitials(form.fullName) : '?'}
                </div>
              )}
              <button type="button" onClick={() => avatarInputRef.current?.click()} disabled={uploadingAvatar}
                className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                title={t.candidates.addDialog.changeAvatar}>
                {uploadingAvatar
                  ? <Loader2 className="h-4 w-4 text-white animate-spin" />
                  : <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                }
              </button>
            </div>
            <div className="flex-1">
              {form.avatarUrl ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium" style={{ color: '#34d399' }}>{t.candidates.photoLoaded}</span>
                  <button type="button" onClick={() => setForm(f => ({ ...f, avatarUrl: '' }))}
                    className="text-xs" style={{ color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                    {t.candidates.removePhoto}
                  </button>
                </div>
              ) : (
                <button type="button" onClick={() => avatarInputRef.current?.click()}
                  className="text-xs font-medium" style={{ color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                  {t.candidates.addPhoto}
                </button>
              )}
              <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
                {form.avatarUrl && prefill?.avatarUrl === form.avatarUrl ? t.candidates.photoExtracted : form.avatarUrl ? t.candidates.photoAttached : t.candidates.photoOptional}
              </p>
              {avatarError && <p className="text-xs mt-1" style={{ color: '#ef4444' }}>{avatarError}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>{t.candidates.addDialog.fullName} *</label>
              <input required value={form.fullName} onChange={e => setForm(f => ({...f, fullName: e.target.value}))} className={inputCls} placeholder="Valentina Rodríguez" />
            </div>
            <div>
              <label className={labelCls}>{t.candidates.addDialog.email} *</label>
              <input required type="email" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} className={inputCls} placeholder="email@ejemplo.com" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>{t.candidates.addDialog.phone}</label>
              <input value={form.phone} onChange={e => setForm(f => ({...f, phone: e.target.value}))} className={inputCls} placeholder="+54 11 1234-5678" />
            </div>
            <div>
              <label className={labelCls}>{t.candidates.addDialog.source}</label>
              <select value={form.source} onChange={e => setForm(f => ({...f, source: e.target.value as CandidateSource}))} className={inputCls}>
                {['LinkedIn','Portal','Referido','Indeed','Computrabajo','ZonaJobs','Bumeran','WhatsApp','Manual'].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>{t.candidates.clientLabel}</label>
              <select value={form.clientId} onChange={e => {
                const newClientId = e.target.value
                setForm(f => ({
                  ...f,
                  clientId: newClientId,
                  // Clear vacancy if it doesn't belong to the new client
                  vacancyId: (!newClientId || vacancies.find(v => v.id === f.vacancyId)?.clientId === newClientId)
                    ? f.vacancyId
                    : '',
                }))
              }} className={inputCls}>
                <option value="">{t.candidates.noClientAssigned}</option>
                {(clients ?? []).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>{t.candidates.addDialog.vacancy}</label>
              <select value={form.vacancyId} onChange={e => setForm(f => ({...f, vacancyId: e.target.value}))} className={inputCls}>
                <option value="">{t.candidates.noVacancyAssigned}</option>
                {(form.clientId
                  ? vacancies.filter(v => v.clientId === form.clientId)
                  : vacancies
                ).map(v => <option key={v.id} value={v.id}>{v.title}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className={labelCls}>{t.candidates.addDialog.skills}</label>
            <input value={form.skills} onChange={e => setForm(f => ({...f, skills: e.target.value}))} className={inputCls} placeholder={t.candidates.addDialog.skillsPlaceholder} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>{t.candidates.profile.experience}</label>
              <input type="number" min="0" max="50" step="1" value={form.experienceYears} onChange={e => setForm(f => ({...f, experienceYears: String(Math.round(Number(e.target.value)))}))} className={inputCls} placeholder="3" />
            </div>
            <div>
              <label className={labelCls}>{t.candidates.addDialog.score}</label>
              <input type="number" min="0" max="100" value={form.atsScore} onChange={e => setForm(f => ({...f, atsScore: e.target.value}))} className={inputCls} placeholder={t.candidates.placeholderScoreAuto} />
            </div>
          </div>
          <div>
            <label className={labelCls}>{t.candidates.profile.education}</label>
            <input value={form.education} onChange={e => setForm(f => ({...f, education: e.target.value}))} className={inputCls} placeholder={t.candidates.placeholderEducation} />
          </div>
          <div>
            <label className={labelCls}>{t.candidates.addDialog.notes}</label>
            <textarea value={form.notes} onChange={e => setForm(f => ({...f, notes: e.target.value}))} className={cn(inputCls, 'resize-none h-16')} placeholder={t.candidates.addDialog.notesPlaceholder} />
          </div>
          {/* CV upload */}
          <div>
            <label className={labelCls}>CV (PDF, DOC, DOCX)</label>
            <input ref={cvInputRef} type="file" accept=".pdf,.doc,.docx,.rtf,.txt" className="hidden" onChange={handleCvUpload} />
            {form.cvFileName ? (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs" style={{ background: 'var(--accent-soft)', color: 'var(--accent-2)', border: '1px solid var(--accent)' }}>
                <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                <span className="flex-1 truncate"><strong>{form.cvFileName}</strong></span>
                {form.cvUrl && <a href={form.cvUrl} target="_blank" rel="noopener noreferrer" className="shrink-0 underline hover:opacity-80">Ver</a>}
                <button type="button" onClick={() => setForm(f => ({ ...f, cvUrl: '', cvFileName: '' }))} className="shrink-0 ml-1 opacity-60 hover:opacity-100" style={{ color: 'var(--coral)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 12 }}>✕</button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => cvInputRef.current?.click()}
                disabled={uploadingCvManual}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs border cursor-pointer transition-colors"
                style={{ background: 'var(--surface2)', borderColor: 'var(--border)', color: 'var(--muted2)' }}
              >
                {uploadingCvManual
                  ? <><Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" />Subiendo...</>
                  : <><svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>Adjuntar CV (sin análisis IA)</>
                }
              </button>
            )}
            {cvUploadError && <p className="text-xs mt-1" style={{ color: 'var(--coral)' }}>{cvUploadError}</p>}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>{t.common.cancel}</Button>
            <Button type="submit" disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {t.candidates.addDialog.add}
            </Button>
          </div>
        </form>
    </DraggableModal>
  )
}

// ─── CV Analyzer Drop Zone ────────────────────────────────────────────────────
function CvDropZone({ vacancies, clients, onCandidateAdded, onLimitReached }: { vacancies: Vacancy[]; clients: import('@/types').Client[]; onCandidateAdded: (c: Candidate) => void; onLimitReached: () => boolean }) {
  const { t } = useLanguage()
  const [isDragging, setIsDragging] = React.useState(false)
  const [status, setStatus] = React.useState<'idle' | 'analyzing' | 'done' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = React.useState('')
  const [prefill, setPrefill] = React.useState<Partial<Candidate> | null>(null)
  const [showAdd, setShowAdd] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [aiUsage, setAiUsage] = React.useState<{ remaining: number | null; isUnlimited: boolean } | null>(null)

  React.useEffect(() => {
    fetch('/api/ai/usage-today')
      .then(r => r.ok ? r.json() : null)
      .then(d => d && setAiUsage({ remaining: d.remaining, isUnlimited: d.isUnlimited }))
      .catch(() => {})
  }, [])

  async function analyzeFile(file: File) {
    if (onLimitReached()) return
    setStatus('analyzing')
    setErrorMsg('')
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('vacancyRequirements', JSON.stringify([]))

      const aiHeaders: Record<string, string> = {}
      try {
        const raw = localStorage.getItem('ct_ai_config')
        if (raw) {
          const cfg = JSON.parse(raw) as { provider?: string; apiKey?: string }
          if (cfg.apiKey) aiHeaders['x-ai-api-key'] = cfg.apiKey
        }
      } catch { /* noop */ }

      const res = await fetch('/api/upload/cv', { method: 'POST', body: formData, headers: aiHeaders })
      const data = await res.json()

      if (!res.ok || !data.ok) {
        setErrorMsg(data.error ?? t.candidates.cvAnalyzeError)
        setStatus('error')
        // Give extra time to read plan-limit messages
        setTimeout(() => { setStatus('idle'); setErrorMsg('') }, data.planLimit ? 10000 : 5000)
        return
      }

      const { analysis, cvUrl, cvFileName, avatarUrl } = data
      setPrefill({
        fullName: analysis.fullName ?? '',
        email: analysis.email ?? '',
        phone: analysis.phone ?? '',
        skills: analysis.skills ?? [],
        experienceYears: analysis.experienceYears,
        education: analysis.education ?? '',
        atsScore: analysis.atsScore,
        cvUrl,
        cvFileName,
        avatarUrl,
      })
      setStatus('done')
      setShowAdd(true)
    } catch (error) {
      const raw = error instanceof Error ? error.message : ''
      const friendly = raw === 'Failed to fetch'
        ? 'Sin conexión al servidor. Verificá tu internet e intentá de nuevo.'
        : (raw || t.candidates.cvNetworkError)
      setErrorMsg(friendly)
      setStatus('error')
      setTimeout(() => { setStatus('idle'); setErrorMsg('') }, 6000)
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
        title={status === 'error' && errorMsg ? errorMsg : undefined}
        onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => { if (aiUsage && !aiUsage.isUnlimited && aiUsage.remaining === 0) return; inputRef.current?.click() }}
        className="border-2 border-dashed rounded-xl p-4 flex flex-wrap items-center gap-4 transition-all mb-4"
        style={{
          borderColor: isDragging ? 'var(--accent)' : 'var(--border2)',
          background: isDragging ? 'var(--accent-soft)' : 'var(--surface2)',
          cursor: (aiUsage && !aiUsage.isUnlimited && aiUsage.remaining === 0) ? 'not-allowed' : 'pointer',
          opacity: (aiUsage && !aiUsage.isUnlimited && aiUsage.remaining === 0) ? 0.65 : 1,
        }}
      >
        <input ref={inputRef} type="file" accept=".pdf,.doc,.docx,.rtf,.txt,.md" className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) analyzeFile(f) }} />
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
          style={{ background: 'var(--accent-soft)' }}
        >
          {status === 'analyzing' ? <Loader2 className="h-5 w-5 animate-spin" style={{ color: 'var(--accent-2)' }} /> :
           status === 'done' ? <CheckCircle2 className="h-5 w-5" style={{ color: '#34d399' }} /> :
           <Upload className="h-5 w-5" style={{ color: 'var(--accent-2)' }} />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium" style={{ color: status === 'error' ? 'var(--coral)' : 'var(--text)' }}>
            {status === 'analyzing' ? t.candidates.analyzingCV :
             status === 'done' ? t.candidates.cvAnalyzedSuccess :
             status === 'error' ? (errorMsg || t.candidates.cvAnalyzeError) :
             t.candidates.dragCV}
          </p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>{t.candidates.dragCVSub}</p>
        </div>
        <div className="shrink-0 ml-auto">
          {aiUsage && !aiUsage.isUnlimited ? (
            <span
              className="text-[10px] px-2 py-0.5 rounded-full border font-medium"
              style={{
                background: aiUsage.remaining === 0 ? 'rgba(239,68,68,0.1)' : 'var(--accent-soft)',
                color: aiUsage.remaining === 0 ? '#ef4444' : 'var(--accent-2)',
                borderColor: aiUsage.remaining === 0 ? '#ef4444' : 'var(--accent)',
              }}
            >
              {aiUsage.remaining === 0 ? '🔒 Sin análisis hoy' : `✨ ${aiUsage.remaining} análisis hoy`}
            </span>
          ) : (
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
          )}
        </div>
      </div>
      <AddCandidateDialog
        open={showAdd}
        onClose={() => { setShowAdd(false); setStatus('idle') }}
        vacancies={vacancies}
        clients={clients}
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
  const [clients, setClients] = React.useState<import('@/types').Client[]>([])
  const [applications, setApplications] = React.useState<import('@/types').Application[]>([])
  const [filterClient, setFilterClient] = React.useState('all')
  const [loading, setLoading] = React.useState(true)
  const [view, setView] = React.useState<'table' | 'grid'>('table')
  const [search, setSearch] = React.useState('')
  const [filterScore, setFilterScore] = React.useState('all')
  const [filterSource, setFilterSource] = React.useState('all')
  const [showAdd, setShowAdd] = React.useState(false)
  const [limitToast, setLimitToast] = React.useState<string | null>(null)
  const [metricsNowIso] = React.useState(() => new Date().toISOString())

  // Action dialog state
  const [viewCandidate, setViewCandidate] = React.useState<Candidate | null>(null)
  const [scheduleCandidate, setScheduleCandidate] = React.useState<Candidate | null>(null)
  const [deleteCandidate, setDeleteCandidate] = React.useState<Candidate | null>(null)
  const [deleting, setDeleting] = React.useState(false)

  const { user } = useUser()
  const { t } = useLanguage()
  const provider = React.useMemo(() => new SupabaseProvider(), [])
  const planLimits = React.useMemo(() => getPlanLimits(user?.plan ?? 'free'), [user])

  const load = React.useCallback(async () => {
    const tid = user?.tenantId ?? ''
    const [cRes, vRes, clRes, appRes] = await Promise.all([
      provider.getCandidates(tid),
      provider.getVacancies(tid),
      provider.getClients(tid),
      provider.getApplications(undefined, tid),
    ])
    setCandidates(cRes.data ?? [])
    setVacancies(vRes.data ?? [])
    setClients(clRes.data ?? [])
    setApplications(appRes.data ?? [])
    setLoading(false)
  }, [provider, user])

  React.useEffect(() => { load() }, [load])

  React.useEffect(() => {
    function handleClientChanged() { load() }
    function handleVisibility() {
      if (document.visibilityState === 'visible') load()
    }
    window.addEventListener('client:deleted', handleClientChanged)
    window.addEventListener('client:updated', handleClientChanged)
    document.addEventListener('visibilitychange', handleVisibility)
    return () => {
      window.removeEventListener('client:deleted', handleClientChanged)
      window.removeEventListener('client:updated', handleClientChanged)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [load])

  const filtered = React.useMemo(() => {
    const TERMINAL: VacancyStatus[] = ['Contratado', 'Descartado']
    const closedVacancyIds = new Set(vacancies.filter(v => v.status === 'Contratado').map(v => v.id))
    const activeClientIds = new Set(clients.filter(cl => cl.active !== false).map(cl => cl.id))
    return candidates.filter(c => {
      // Hide archived candidates (their company was deleted)
      if (c.archived) return false
      // Hide candidates whose assigned client is inactive or was deleted
      if (c.clientId && !activeClientIds.has(c.clientId)) return false
      // Hide orphaned candidates: all applications point to deleted vacancies (vacancyId = null)
      const candidateApps = applications.filter(a => a.candidateId === c.id)
      if (candidateApps.length > 0 && candidateApps.every(a => a.vacancyId === null)) return false
      // Hide candidates whose all applications are in terminal state and vacancy is closed
      if (
        candidateApps.length > 0 &&
        candidateApps.every(a => TERMINAL.includes(a.status as VacancyStatus)) &&
        candidateApps.every(a => a.vacancyId !== null && closedVacancyIds.has(a.vacancyId!))
      ) return false
      if (filterClient !== 'all') {
        const clientVacancyIds = new Set(vacancies.filter(v => v.clientId === filterClient).map(v => v.id))
        const appliedToClient = applications.some(a => a.candidateId === c.id && a.vacancyId !== null && clientVacancyIds.has(a.vacancyId))
        if (c.clientId !== filterClient && !appliedToClient) return false
      }
      if (search && !c.fullName.toLowerCase().includes(search.toLowerCase()) && !c.email.toLowerCase().includes(search.toLowerCase())) return false
      if (filterScore === '80+' && (c.atsScore ?? 0) < 80) return false
      if (filterScore === '60-79' && ((c.atsScore ?? 0) < 60 || (c.atsScore ?? 0) >= 80)) return false
      if (filterScore === '40-59' && ((c.atsScore ?? 0) < 40 || (c.atsScore ?? 0) >= 60)) return false
      if (filterScore === '<40' && (c.atsScore ?? 0) >= 40) return false
      if (filterSource !== 'all' && c.source !== filterSource) return false
      return true
    })
  }, [candidates, vacancies, applications, clients, filterClient, search, filterScore, filterSource])

  const kpis = React.useMemo(() => {
    const total = filtered.length
    const withScore = filtered.filter(c => c.atsScore !== undefined).length
    const avgScore = withScore > 0
      ? Math.round(filtered.reduce((s, c) => s + (c.atsScore ?? 0), 0) / withScore)
      : 0
    const weekAgo = new Date(new Date(metricsNowIso).getTime() - 7 * 86400000).toISOString()
    const newThisWeek = filtered.filter(c => c.createdAt >= weekAgo).length
    return { total, withScore, avgScore, newThisWeek }
  }, [filtered, metricsNowIso])

  function checkCandidateLimit(): boolean {
    if (candidates.length >= planLimits.candidates) {
      const limitStr = planLimits.candidates === Infinity ? '' : String(planLimits.candidates)
      setLimitToast(
        planLimits.candidates === Infinity
          ? t.candidates.planLimitReached
          : t.candidates.planLimitReachedSub.replace('{limit}', limitStr)
      )
      return true
    }
    return false
  }

  function handleOpenAddCandidate() {
    if (checkCandidateLimit()) return
    setShowAdd(true)
  }

  async function handleDeleteConfirm() {
    if (!deleteCandidate) return
    setDeleting(true)
    await provider.deleteCandidate(deleteCandidate.id)
    setCandidates(prev => prev.filter(c => c.id !== deleteCandidate.id))
    window.dispatchEvent(new CustomEvent('candidate:deleted'))
    setDeleting(false)
    setDeleteCandidate(null)
  }

  if (loading) return (
    <div className="space-y-4">
      <div className="h-8 w-48 bg-muted rounded animate-pulse" />
      <div className="flex gap-4">
        {[0,1,2,3].map(i => <div key={i} className="h-20 flex-1 bg-muted rounded-lg animate-pulse" />)}
      </div>
      <div className="h-64 bg-muted rounded-lg animate-pulse" />
    </div>
  )

  return (
    <div className="space-y-5">
      {limitToast && <PlanLimitToast message={limitToast} onClose={() => setLimitToast(null)} />}
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-foreground">{t.nav.candidates}</h1>
          <p className="text-sm text-muted-foreground">
            {filterClient !== 'all' || filterScore !== 'all' || filterSource !== 'all' || search
              ? t.candidates.pageSubtitleFiltered.replace('{n}', String(kpis.total))
              : t.candidates.pageSubtitle.replace('{n}', String(kpis.total))}
          </p>
        </div>
        <Button onClick={handleOpenAddCandidate} className="gap-1.5 shrink-0">
          <Plus className="h-4 w-4" /> <span className="hidden sm:inline">{t.candidates.addCandidate}</span><span className="sm:hidden">{t.candidates.addCandidate}</span>
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard icon={Users} label={t.candidates.kpis.total} value={kpis.total} accentColor="var(--accent)" />
        <KpiCard icon={Brain} label={t.candidates.kpis.withAI} value={kpis.withScore} sub={t.candidates.kpis.aiSub.replace('{n}', String(kpis.total > 0 ? Math.round(kpis.withScore/kpis.total*100) : 0))} accentColor="var(--accent-2)" />
        <KpiCard icon={TrendingUp} label={t.candidates.kpis.avgScore} value={kpis.avgScore} sub={t.candidates.kpis.avgScoreSub} accentColor="#34d399" />
        <KpiCard icon={Clock} label={t.candidates.kpis.thisWeek} value={kpis.newThisWeek} accentColor="#fbbf24" />
      </div>

      {/* CV Drop Zone */}
      <CvDropZone vacancies={vacancies} clients={clients} onCandidateAdded={c => setCandidates(prev => [c, ...prev])} onLimitReached={checkCandidateLimit} />

      {/* Filters + View Toggle */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t.candidates.searchPlaceholder}
            className="pl-8 pr-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring w-full"
          />
        </div>
        <div className="relative">
          <select value={filterScore} onChange={e => setFilterScore(e.target.value)}
            className="pl-3 pr-8 py-2 text-sm rounded-md border border-input bg-background focus:outline-none appearance-none">
            <option value="all">{t.candidates.filters.allScores}</option>
            <option value="80+">{t.candidates.scoreFilter.excellent}</option>
            <option value="60-79">{t.candidates.scoreFilter.good}</option>
            <option value="40-59">{t.candidates.scoreFilter.fair}</option>
            <option value="<40">{t.candidates.scoreLabels.low} (&lt;40)</option>
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
        </div>
        <div className="relative">
          <select value={filterSource} onChange={e => setFilterSource(e.target.value)}
            className="pl-3 pr-8 py-2 text-sm rounded-md border border-input bg-background focus:outline-none appearance-none">
            <option value="all">{t.candidates.filters.allSources}</option>
            {['LinkedIn','Portal','Referido','Indeed','Computrabajo','ZonaJobs','WhatsApp','Manual'].map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
        </div>
        {clients.length > 0 && (
          <div className="relative">
            <select value={filterClient} onChange={e => setFilterClient(e.target.value)} className="pl-3 pr-8 py-2 text-sm rounded-md border border-input bg-background focus:outline-none appearance-none">
              <option value="all">{t.candidates.filters.allClients}</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          </div>
        )}
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
          <h3 className="text-base font-semibold text-foreground mb-1">{t.candidates.noResults}</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            {search || filterScore !== 'all' || filterSource !== 'all'
              ? t.candidates.noResultsSub
              : t.candidates.addFirstSub}
          </p>
        </div>
      )}

      {/* Table view */}
      {view === 'table' && filtered.length > 0 && (
        <div className="rounded-xl border border-border overflow-hidden bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">{t.candidates.columns.name}</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">{t.candidates.columns.score}</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground hidden md:table-cell">{t.candidates.columns.skills}</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground hidden lg:table-cell">{t.candidates.columns.source}</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground hidden lg:table-cell">{t.candidates.columns.date}</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground">{t.candidates.actionsColumn}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map(c => (
                <tr key={c.id} className="hover:bg-muted/30 transition-colors group cursor-pointer" onClick={() => setViewCandidate(c)}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 overflow-hidden"
                        style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-2))' }}
                      >
                        {c.avatarUrl
                          ? <img src={c.avatarUrl} alt="" className="w-full h-full object-cover" />
                          : getInitials(c.fullName)
                        }
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
                      <button onClick={e => { e.stopPropagation(); setViewCandidate(c) }} className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground" title={t.pipeline.actions.viewProfile}>
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={e => { e.stopPropagation(); setScheduleCandidate(c) }} className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground" title={t.pipeline.scheduleInterview}>
                        <Calendar className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={e => { e.stopPropagation(); setDeleteCandidate(c) }} className="p-1.5 rounded hover:bg-red-50 text-muted-foreground hover:text-red-600" title={t.common.delete}>
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
            <Card key={c.id} className="hover:shadow-md transition-shadow cursor-pointer group" onClick={() => setViewCandidate(c)}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm overflow-hidden"
                      style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-2))' }}
                    >
                      {c.avatarUrl
                        ? <img src={c.avatarUrl} alt="" className="w-full h-full object-cover" />
                        : getInitials(c.fullName)
                      }
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-foreground leading-tight">{c.fullName}</p>
                      <p className="text-xs text-muted-foreground truncate max-w-[120px]">{c.email}</p>
                    </div>
                  </div>
                  <button onClick={e => { e.stopPropagation(); setDeleteCandidate(c) }} className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-50 text-muted-foreground hover:text-red-600">
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
        clients={clients}
        onSave={c => setCandidates(prev => [c, ...prev])}
      />

      {/* View profile dialog */}
      <ViewProfileDialog
        candidate={viewCandidate}
        open={viewCandidate !== null}
        onClose={() => setViewCandidate(null)}
        onUpdate={c => { setCandidates(prev => prev.map(x => x.id === c.id ? c : x)); window.dispatchEvent(new CustomEvent('candidate:updated')) }}
        vacancies={vacancies}
        clients={clients}
      />

      {/* Schedule interview dialog */}
      <ScheduleInterviewDialog
        candidate={scheduleCandidate}
        vacancies={vacancies}
        open={scheduleCandidate !== null}
        onClose={() => setScheduleCandidate(null)}
        provider={provider}
      />

      {/* Delete confirmation dialog */}
      <DeleteConfirmDialog
        candidate={deleteCandidate}
        open={deleteCandidate !== null}
        onClose={() => setDeleteCandidate(null)}
        onConfirm={handleDeleteConfirm}
        deleting={deleting}
      />
    </div>
  )
}
