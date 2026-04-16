'use client'

import React, { useState } from 'react'
import {
  Mail,
  Phone,
  FileText,
  Calendar,
  User,
  MessageCircle,
  XCircle,
  Sparkles,
  Plus,
  ChevronDown,
  Loader2,
  ExternalLink,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/input'
import { AtsScoreBadge } from './ats-score-badge'
import { cn, formatDate, getInitials } from '@/lib/utils'
import { LocalStorageProvider } from '@/lib/providers/data-provider'
import type { Candidate, Vacancy, VacancyStatus, Interview } from '@/types'

interface CandidateProfileModalProps {
  candidate: Candidate
  vacancy?: Vacancy
  open: boolean
  onClose: () => void
  onUpdate: (c: Candidate) => void
}

const PIPELINE_STAGES: VacancyStatus[] = [
  'Nuevas Vacantes',
  'En Proceso',
  'Entrevistas',
  'Oferta Enviada',
  'Contratado',
]

const SOURCE_COLORS: Record<string, string> = {
  LinkedIn: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  Portal: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  Referido: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  Indeed: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
  Manual: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
  WhatsApp: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
}

const INTERVIEW_STATUS_COLORS: Record<string, string> = {
  Programada: 'bg-blue-100 text-blue-700',
  Completada: 'bg-green-100 text-green-700',
  Cancelada: 'bg-red-100 text-red-700',
}

function InterviewCard({ interview }: { interview: Interview }) {
  return (
    <div className="rounded-lg border p-3 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium">{interview.type}</span>
        <span
          className={cn(
            'rounded-full px-2 py-0.5 text-xs font-medium',
            INTERVIEW_STATUS_COLORS[interview.status] ?? 'bg-muted text-muted-foreground'
          )}
        >
          {interview.status}
        </span>
      </div>
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          {formatDate(interview.scheduledAt, 'time')}
        </span>
        <span className="flex items-center gap-1">
          <User className="h-3 w-3" />
          {interview.interviewerName}
        </span>
      </div>
      {interview.meetingLink && (
        <a
          href={interview.meetingLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs text-primary hover:underline"
        >
          <ExternalLink className="h-3 w-3" />
          {interview.meetingPlatform}
        </a>
      )}
      {interview.scorecard && (
        <div className="flex items-center gap-2 pt-1 border-t">
          <AtsScoreBadge score={interview.scorecard.overallRating * 20} size="sm" />
          <span className="text-xs text-muted-foreground">
            {interview.scorecard.recommendation}
          </span>
        </div>
      )}
    </div>
  )
}

export function CandidateProfileModal({
  candidate: initialCandidate,
  vacancy,
  open,
  onClose,
  onUpdate,
}: CandidateProfileModalProps) {
  const [candidate, setCandidate] = useState<Candidate>(initialCandidate)
  const [notes, setNotes] = useState(initialCandidate.notes ?? '')
  const [selectedStage, setSelectedStage] = useState<VacancyStatus>('En Proceso')
  const [isSavingStage, setIsSavingStage] = useState(false)
  const [isSavingNotes, setIsSavingNotes] = useState(false)
  const [isRejectingOpen, setIsRejectingOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('perfil')

  const provider = new LocalStorageProvider()

  const initials = getInitials(candidate.fullName)
  const sourceColor =
    SOURCE_COLORS[candidate.source] ?? 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'

  const handleSaveNotes = async () => {
    setIsSavingNotes(true)
    try {
      const result = await provider.updateCandidate(candidate.id, { notes })
      if (result.data) {
        const updated = { ...candidate, notes }
        setCandidate(updated)
        onUpdate(updated)
      }
    } finally {
      setIsSavingNotes(false)
    }
  }

  const handleSaveStage = async () => {
    if (!vacancy) return
    setIsSavingStage(true)
    try {
      // Find the application and update its status
      const appsResult = await provider.getApplications(vacancy.id)
      const app = appsResult.data?.find((a) => a.candidateId === candidate.id)
      if (app) {
        await provider.updateApplicationStatus(app.id, selectedStage)
      }
    } finally {
      setIsSavingStage(false)
    }
  }

  const handleReject = async () => {
    const result = await provider.updateCandidate(candidate.id, { notes: `${notes}\n[Rechazado]` })
    if (result.data) {
      const updated = { ...candidate, notes: result.data.notes }
      setCandidate(updated)
      onUpdate(updated)
    }
    setIsRejectingOpen(false)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col gap-0 p-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="h-14 w-14 shrink-0 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl select-none">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-xl">{candidate.fullName}</DialogTitle>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                {candidate.email && (
                  <span className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Mail className="h-3.5 w-3.5" />
                    {candidate.email}
                  </span>
                )}
                {candidate.phone && (
                  <span className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Phone className="h-3.5 w-3.5" />
                    {candidate.phone}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-medium', sourceColor)}>
                  {candidate.source}
                </span>
                {vacancy && (
                  <Badge variant="outline" className="text-xs">
                    {vacancy.title}
                  </Badge>
                )}
                <span className="text-xs text-muted-foreground">
                  Aplicó {formatDate(candidate.appliedAt)}
                </span>
              </div>
            </div>
            {candidate.atsScore !== undefined && (
              <AtsScoreBadge score={candidate.atsScore} size="md" showLabel animated />
            )}
          </div>
        </DialogHeader>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex-1 flex flex-col overflow-hidden"
        >
          <TabsList className="mx-6 mt-4 mb-0 w-auto self-start">
            <TabsTrigger value="perfil">Perfil</TabsTrigger>
            <TabsTrigger value="cv">CV</TabsTrigger>
            <TabsTrigger value="entrevistas">
              Entrevistas
              {candidate.interviews.length > 0 && (
                <span className="ml-1.5 rounded-full bg-primary/20 px-1.5 py-0.5 text-xs text-primary">
                  {candidate.interviews.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="avanzar">Avanzar</TabsTrigger>
          </TabsList>

          {/* Tab: Perfil */}
          <TabsContent value="perfil" className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {/* Skills */}
            {candidate.skills.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                  Skills
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {candidate.skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Experience + Education */}
            <div className="grid grid-cols-2 gap-3">
              {candidate.experienceYears !== undefined && (
                <InfoBlock
                  label="Experiencia"
                  value={`${candidate.experienceYears} año${candidate.experienceYears !== 1 ? 's' : ''}`}
                />
              )}
              {candidate.education && (
                <InfoBlock label="Educación" value={candidate.education} />
              )}
            </div>

            {/* Notes */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                Notas del reclutador
              </p>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Agregar notas sobre el candidato..."
                rows={4}
                className="resize-none"
              />
              <Button
                size="sm"
                variant="outline"
                className="mt-2"
                onClick={handleSaveNotes}
                disabled={isSavingNotes}
              >
                {isSavingNotes && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Guardar notas
              </Button>
            </div>
          </TabsContent>

          {/* Tab: CV */}
          <TabsContent value="cv" className="flex-1 overflow-y-auto px-6 py-4">
            {candidate.cvUrl ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 rounded-lg border p-4">
                  <FileText className="h-8 w-8 text-primary" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {candidate.cvFileName ?? 'CV adjunto'}
                    </p>
                    <p className="text-xs text-muted-foreground">Archivo del candidato</p>
                  </div>
                  <a
                    href={candidate.cvUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" size="sm" className="gap-1.5">
                      <ExternalLink className="h-3.5 w-3.5" />
                      Ver CV
                    </Button>
                  </a>
                </div>
                <Button variant="outline" size="sm" className="gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" />
                  Re-analizar con IA
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
                <FileText className="h-12 w-12 text-muted-foreground/40" />
                <p className="text-sm font-medium text-muted-foreground">Sin CV adjunto</p>
                <p className="text-xs text-muted-foreground/70">
                  El candidato no tiene un CV cargado aún.
                </p>
              </div>
            )}
          </TabsContent>

          {/* Tab: Entrevistas */}
          <TabsContent value="entrevistas" className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
            {candidate.interviews.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
                <Calendar className="h-12 w-12 text-muted-foreground/40" />
                <p className="text-sm font-medium text-muted-foreground">Sin entrevistas agendadas</p>
              </div>
            ) : (
              <div className="space-y-2">
                {candidate.interviews.map((interview) => (
                  <InterviewCard key={interview.id} interview={interview} />
                ))}
              </div>
            )}
            <Button variant="outline" size="sm" className="w-full gap-2">
              <Plus className="h-4 w-4" />
              Agendar entrevista
            </Button>
          </TabsContent>

          {/* Tab: Avanzar */}
          <TabsContent value="avanzar" className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {vacancy ? (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Mover candidato a una nueva etapa del pipeline para{' '}
                  <span className="font-medium text-foreground">{vacancy.title}</span>
                </p>
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Nueva etapa
                  </p>
                  <Select
                    value={selectedStage}
                    onValueChange={(v) => setSelectedStage(v as VacancyStatus)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PIPELINE_STAGES.map((stage) => (
                        <SelectItem key={stage} value={stage}>
                          {stage}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleSaveStage} disabled={isSavingStage} className="w-full">
                  {isSavingStage && <Loader2 className="h-4 w-4 animate-spin" />}
                  Guardar cambio de etapa
                </Button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Para avanzar el candidato, abrí este perfil desde una vacante específica.
              </p>
            )}
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <DialogFooter className="px-6 py-4 border-t gap-2 flex-row">
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setIsRejectingOpen(true)}
            className="gap-1.5 mr-auto"
          >
            <XCircle className="h-4 w-4" />
            Rechazar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const subject = encodeURIComponent(`Proceso de selección - ${candidate.fullName}`)
              const body = encodeURIComponent(
                `Estimado/a ${candidate.fullName},\n\nNos comunicamos de ConectAr Talento...`
              )
              window.open(`mailto:${candidate.email}?subject=${subject}&body=${body}`)
            }}
            className="gap-1.5"
          >
            <Mail className="h-4 w-4" />
            Enviar Email
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const text = encodeURIComponent(
                `Hola ${candidate.fullName.split(' ')[0]}, te contactamos de ConectAr Talento en relación al proceso de selección.`
              )
              window.open(`https://wa.me/?text=${text}`, '_blank')
            }}
            className="gap-1.5 text-green-700 border-green-200 hover:bg-green-50"
          >
            <MessageCircle className="h-4 w-4" />
            WhatsApp
          </Button>
        </DialogFooter>
      </DialogContent>

      {/* Reject confirmation dialog */}
      {isRejectingOpen && (
        <Dialog open={isRejectingOpen} onOpenChange={setIsRejectingOpen}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Rechazar candidato</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">
              ¿Estás seguro que querés rechazar a{' '}
              <span className="font-semibold text-foreground">{candidate.fullName}</span>? Esta
              acción actualizará las notas del candidato.
            </p>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setIsRejectingOpen(false)}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={handleReject}>
                Confirmar rechazo
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </Dialog>
  )
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-muted/40 p-3">
      <p className="text-xs text-muted-foreground font-medium">{label}</p>
      <p className="text-sm font-semibold mt-0.5">{value}</p>
    </div>
  )
}
