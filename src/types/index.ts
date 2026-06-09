export type VacancyStatus =
  | 'Nuevas Vacantes'
  | 'En Proceso'
  | 'Entrevistas'
  | 'A considerar'
  | 'Oferta Enviada'
  | 'Contratado'
  | 'Descartado'

export type CandidateDisposition = 'a_considerar' | 'descartar_cv'

export type RejectionReason =
  | 'no_apto_perfil'
  | 'mejor_candidato'
  | 'candidato_declino'
  | 'fuera_rango_salarial'
  | 'decision_empresa'
  | 'otro'

export type VacancyModality = 'Presencial' | 'Remoto' | 'Híbrido'
export type VacancyPriority = 'Alta' | 'Media' | 'Baja'

export type CandidateSource =
  | 'LinkedIn'
  | 'Portal'
  | 'Referido'
  | 'Indeed'
  | 'Computrabajo'
  | 'ZonaJobs'
  | 'Bumeran'
  | 'Manual'
  | 'WhatsApp'

export type InterviewType =
  | 'Técnica'
  | 'RRHH'
  | 'Con Hiring Manager'
  | 'Cultural'

export type InterviewStatus = 'Programada' | 'Completada' | 'Cancelada'
export type MeetingPlatform = 'zoom' | 'google_meet' | 'teams' | 'presencial'
export type Recommendation = 'Avanzar' | 'Considerar' | 'Rechazar'

export type UserPlan = 'free' | 'starter' | 'pro' | 'business' | 'enterprise'

export type TemplateChannel = 'linkedin' | 'email' | 'whatsapp'

export type TemplateCategory =
  | 'vacancy_post'
  | 'interview_invite'
  | 'rejection'
  | 'offer'
  | 'welcome'
  | 'follow_up'

export type IntegrationPlatform =
  | 'linkedin'
  | 'gmail'
  | 'outlook'
  | 'smtp'
  | 'whatsapp'
  | 'zoom'
  | 'google_meet'
  | 'teams'
  | 'computrabajo'
  | 'zonajobs'
  | 'bumeran'
  | 'occ'
  | 'infojobs'
  | 'indeed'
  | 'linkedin_jobs'
  | 'getonboard'

export type IntegrationStatus = 'connected' | 'expired' | 'error' | 'pending'

export interface DataResult<T> {
  data: T | null
  error: string | null
}

export interface User {
  id: string
  email: string
  fullName: string
  avatarUrl?: string
  plan: UserPlan
  tenantId: string
  companyName: string
  googleDriveFolderId?: string
  googleSheetsDbId?: string
  createdAt: string
  groqApiKey?: string
  aiProvider?: string
}

export interface Scorecard {
  id: string
  interviewId: string
  overallRating: 1 | 2 | 3 | 4 | 5
  technicalSkills: number
  communication: number
  culturalFit: number
  strengths: string
  weaknesses: string
  recommendation: Recommendation
  aiSummary?: string
  notes?: string
  createdAt: string
}

export interface Interview {
  id: string
  candidateId: string
  vacancyId: string
  scheduledAt: string
  type: InterviewType
  interviewerName: string
  interviewerEmail?: string
  status: InterviewStatus
  meetingPlatform: MeetingPlatform
  meetingLink?: string
  notes?: string
  scorecard?: Scorecard
}

export interface Candidate {
  id: string
  tenantId: string
  clientId?: string
  client?: Client
  fullName: string
  email: string
  phone?: string
  avatarUrl?: string
  cvUrl?: string
  cvFileName?: string
  atsScore?: number
  skills: string[]
  experienceYears?: number
  education?: string
  source: CandidateSource
  notes?: string
  interviews: Interview[]
  appliedAt: string
  createdAt: string
  archived?: boolean
}

export interface Application {
  id: string
  vacancyId: string | null
  candidateId: string
  candidate?: Candidate
  status: VacancyStatus
  positionInStage: number
  appliedAt: string
  updatedAt: string
  disposition?: CandidateDisposition | null
  rejectionReason?: RejectionReason | null
  rejectionNote?: string | null
  // Preserved when the vacancy/client is deleted
  vacancyTitle?: string | null
  clientName?: string | null
}

export interface Client {
  id: string
  tenantId: string
  name: string
  industry?: string
  contactName?: string
  contactEmail?: string
  recruitmentEmail?: string
  contactPhone?: string
  whatsappPhone?: string
  address?: string
  interviewAddress?: string
  interviewArrivalDetails?: string
  website?: string
  logoUrl?: string
  notes?: string
  active: boolean
  deactivatedAt?: string | null
  createdAt: string
  updatedAt: string
}

export type ClientEventType = 'created' | 'deactivated' | 'reactivated' | 'modified'

export interface ClientEvent {
  id: string
  tenantId: string
  clientId: string
  clientName: string
  eventType: ClientEventType
  occurredAt: string
  notes?: string | null
}

export interface Vacancy {
  id: string
  tenantId: string
  clientId?: string
  client?: Client
  title: string
  department: string
  status: VacancyStatus
  description?: string
  requirements: string[]
  salaryMin?: number
  salaryMax?: number
  currency?: string
  location?: string
  modality: VacancyModality
  priority: VacancyPriority
  publishedAt?: string
  closingDate?: string
  createdBy?: string
  createdAt: string
  applications: Application[]
  rubro: string
  perfil: string
}

export interface SkillProfile {
  id: string
  rubro: string
  perfil: string
  nivel: 'Junior' | 'Semi-Senior' | 'Senior' | 'Lead'
  skills: {
    tecnicas: string[]
    blandas: string[]
    herramientas: string[]
    certificaciones?: string[]
  }
  descripcionTipica: string
}

export interface MessageTemplate {
  id: string
  tenantId: string
  name: string
  channel: TemplateChannel
  category: TemplateCategory
  subject?: string
  body: string
  variables: string[]
  isDefault: boolean
  createdAt: string
}

export interface Integration {
  id: string
  tenantId: string
  platform: IntegrationPlatform
  accountName: string
  accountEmail?: string
  status: IntegrationStatus
  expiresAt?: string
  metadata?: Record<string, unknown>
  createdAt: string
}

export interface JobRubro {
  id: string
  tenantId: string
  name: string
  createdAt: string
}

export interface CustomJobProfile {
  id: string
  tenantId: string
  rubro: string
  perfil: string
  nivel: string
  skills: {
    tecnicas: string[]
    blandas: string[]
    herramientas: string[]
    certificaciones: string[]
  }
  descripcionTipica: string
  createdAt: string
}

export interface CreateJobRubroInput {
  tenantId: string
  name: string
}

export interface CreateJobProfileInput {
  tenantId: string
  rubro: string
  perfil: string
  nivel: string
  skillsTecnicas?: string[]
  skillsBlandas?: string[]
  skillsHerramientas?: string[]
  skillsCertificaciones?: string[]
  descripcionTipica?: string
}
