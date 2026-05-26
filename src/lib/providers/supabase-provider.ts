import { createClient } from '@/lib/supabase/client'
import type {
  DataResult,
  Client,
  Vacancy,
  Candidate,
  Application,
  Interview,
  Scorecard,
  MessageTemplate,
  Integration,
  JobRubro,
  CustomJobProfile,
  CreateJobRubroInput,
  CreateJobProfileInput,
  VacancyStatus,
  CandidateDisposition,
  RejectionReason,
} from '@/types'
import type {
  DataProvider,
  CreateClientInput,
  UpdateClientInput,
  CreateVacancyInput,
  UpdateVacancyInput,
  CreateCandidateInput,
  UpdateCandidateInput,
  CreateApplicationInput,
  CreateInterviewInput,
  UpdateInterviewInput,
  CreateScorecardInput,
  CreateTemplateInput,
  UpdateTemplateInput,
  CreateIntegrationInput,
} from './data-provider'

function ok<T>(data: T): DataResult<T> { return { data, error: null } }
function err<T>(msg: string): DataResult<T> { return { data: null, error: msg } }

function mapClient(row: Record<string, unknown>): Client {
  return {
    id: row.id as string,
    tenantId: row.tenant_id as string,
    name: row.name as string,
    industry: (row.industry as string) ?? undefined,
    contactName: (row.contact_name as string) ?? undefined,
    contactEmail: (row.contact_email as string) ?? undefined,
    recruitmentEmail: (row.recruitment_email as string) ?? undefined,
    contactPhone: (row.contact_phone as string) ?? undefined,
    whatsappPhone: (row.whatsapp_phone as string) ?? undefined,
    address: (row.address as string) ?? undefined,
    interviewAddress: (row.interview_address as string) ?? undefined,
    interviewArrivalDetails: (row.interview_arrival_details as string) ?? undefined,
    website: (row.website as string) ?? undefined,
    logoUrl: (row.logo_url as string) ?? undefined,
    notes: (row.notes as string) ?? undefined,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  }
}

function mapVacancy(row: Record<string, unknown>): Vacancy {
  return {
    id: row.id as string,
    tenantId: row.tenant_id as string,
    clientId: (row.client_id as string) ?? undefined,
    client: row.client ? mapClient(row.client as Record<string, unknown>) : undefined,
    title: row.title as string,
    department: row.department as string,
    status: row.status as VacancyStatus,
    description: (row.description as string) ?? undefined,
    requirements: (row.requirements as string[]) ?? [],
    salaryMin: (row.salary_min as number) ?? undefined,
    salaryMax: (row.salary_max as number) ?? undefined,
    currency: (row.currency as string) ?? undefined,
    location: (row.location as string) ?? undefined,
    modality: row.modality as Vacancy['modality'],
    priority: row.priority as Vacancy['priority'],
    publishedAt: (row.published_at as string) ?? undefined,
    closingDate: (row.closing_date as string) ?? undefined,
    createdBy: (row.created_by as string) ?? undefined,
    createdAt: row.created_at as string,
    applications: [],
    rubro: (row.rubro as string) ?? '',
    perfil: (row.perfil as string) ?? '',
  }
}

function mapCandidate(row: Record<string, unknown>): Candidate {
  return {
    id: row.id as string,
    tenantId: row.tenant_id as string,
    clientId: (row.client_id as string) ?? undefined,
    client: row.client ? mapClient(row.client as Record<string, unknown>) : undefined,
    fullName: row.full_name as string,
    email: row.email as string,
    phone: (row.phone as string) ?? undefined,
    avatarUrl: (row.avatar_url as string) ?? undefined,
    cvUrl: (row.cv_url as string) ?? undefined,
    cvFileName: (row.cv_file_name as string) ?? undefined,
    atsScore: (row.ats_score as number) ?? undefined,
    skills: (row.skills as string[]) ?? [],
    experienceYears: (row.experience_years as number) ?? undefined,
    education: (row.education as string) ?? undefined,
    source: row.source as Candidate['source'],
    notes: (row.notes as string) ?? undefined,
    interviews: [],
    appliedAt: row.applied_at as string,
    createdAt: row.created_at as string,
    archived: (row.archived as boolean) ?? false,
  }
}

function mapScorecard(row: Record<string, unknown>): Scorecard {
  return {
    id: row.id as string,
    interviewId: row.interview_id as string,
    overallRating: row.overall_rating as Scorecard['overallRating'],
    technicalSkills: row.technical_skills as number,
    communication: row.communication as number,
    culturalFit: row.cultural_fit as number,
    strengths: row.strengths as string,
    weaknesses: row.weaknesses as string,
    recommendation: row.recommendation as Scorecard['recommendation'],
    aiSummary: (row.ai_summary as string) ?? undefined,
    notes: (row.notes as string) ?? undefined,
    createdAt: row.created_at as string,
  }
}

function mapInterview(row: Record<string, unknown>): Interview {
  return {
    id: row.id as string,
    candidateId: row.candidate_id as string,
    vacancyId: row.vacancy_id as string,
    scheduledAt: row.scheduled_at as string,
    type: row.type as Interview['type'],
    interviewerName: row.interviewer_name as string,
    interviewerEmail: (row.interviewer_email as string) ?? undefined,
    status: row.status as Interview['status'],
    meetingPlatform: row.meeting_platform as Interview['meetingPlatform'],
    meetingLink: (row.meeting_link as string) ?? undefined,
    notes: (row.notes as string) ?? undefined,
    scorecard: row.scorecard ? mapScorecard(row.scorecard as Record<string, unknown>) : undefined,
  }
}

function mapApplication(row: Record<string, unknown>): Application {
  return {
    id: row.id as string,
    vacancyId: (row.vacancy_id as string | null) ?? null,
    candidateId: row.candidate_id as string,
    status: row.status as VacancyStatus,
    positionInStage: row.position_in_stage as number,
    appliedAt: row.applied_at as string,
    updatedAt: row.updated_at as string,
    candidate: row.candidate ? mapCandidate(row.candidate as Record<string, unknown>) : undefined,
    disposition: (row.disposition as CandidateDisposition | null) ?? null,
    rejectionReason: (row.rejection_reason as RejectionReason | null) ?? null,
    rejectionNote: (row.rejection_note as string | null) ?? undefined,
    vacancyTitle: (row.vacancy_title as string | null) ?? null,
    clientName: (row.client_name as string | null) ?? null,
  }
}

function mapTemplate(row: Record<string, unknown>): MessageTemplate {
  return {
    id: row.id as string,
    tenantId: row.tenant_id as string,
    name: row.name as string,
    channel: row.channel as MessageTemplate['channel'],
    category: row.category as MessageTemplate['category'],
    subject: (row.subject as string) ?? undefined,
    body: row.body as string,
    variables: (row.variables as string[]) ?? [],
    isDefault: row.is_default as boolean,
    createdAt: row.created_at as string,
  }
}

function mapIntegration(row: Record<string, unknown>): Integration {
  return {
    id: row.id as string,
    tenantId: row.tenant_id as string,
    platform: row.platform as Integration['platform'],
    accountName: row.account_name as string,
    accountEmail: (row.account_email as string) ?? undefined,
    status: row.status as Integration['status'],
    expiresAt: (row.expires_at as string) ?? undefined,
    metadata: (row.metadata as Record<string, unknown>) ?? undefined,
    createdAt: row.created_at as string,
  }
}

function mapJobRubro(row: Record<string, unknown>): JobRubro {
  return {
    id: row.id as string,
    tenantId: row.tenant_id as string,
    name: row.name as string,
    createdAt: row.created_at as string,
  }
}

function mapCustomJobProfile(row: Record<string, unknown>): CustomJobProfile {
  return {
    id: row.id as string,
    tenantId: row.tenant_id as string,
    rubro: row.rubro as string,
    perfil: row.perfil as string,
    nivel: row.nivel as string,
    skills: {
      tecnicas: (row.skills_tecnicas as string[]) ?? [],
      blandas: (row.skills_blandas as string[]) ?? [],
      herramientas: (row.skills_herramientas as string[]) ?? [],
      certificaciones: (row.skills_certificaciones as string[]) ?? [],
    },
    descripcionTipica: (row.descripcion_tipica as string) ?? '',
    createdAt: row.created_at as string,
  }
}

export class SupabaseProvider implements DataProvider {
  private get sb() { return createClient() }

  // ── Clients ──────────────────────────────────────────────────────────────

  async getClients(_tenantId: string): Promise<DataResult<Client[]>> {
    // Rely on RLS for tenant scoping — the tenant_id stored in the clients table
    // may differ from the profile's tenant_id (e.g. when the row was seeded with
    // auth.uid() instead of profile.tenant_id), so an explicit eq filter can
    // silently return empty results.
    const { data, error } = await this.sb
      .from('clients')
      .select('*')
      .order('name', { ascending: true })
    if (error) return err(error.message)
    return ok((data ?? []).map(mapClient))
  }

  async createClient(input: CreateClientInput): Promise<DataResult<Client>> {
    const { data, error } = await this.sb
      .from('clients')
      .insert({
        tenant_id: input.tenantId,
        name: input.name,
        industry: input.industry ?? null,
        contact_name: input.contactName ?? null,
        contact_email: input.contactEmail ?? null,
        recruitment_email: input.recruitmentEmail ?? null,
        contact_phone: input.contactPhone ?? null,
        whatsapp_phone: input.whatsappPhone ?? null,
        address: input.address || undefined,
        interview_address: input.interviewAddress || undefined,
        interview_arrival_details: input.interviewArrivalDetails || undefined,
        website: input.website ?? null,
        logo_url: input.logoUrl ?? null,
        notes: input.notes ?? null,
      })
      .select()
      .single()
    if (error) return err(error.message)
    return ok(mapClient(data as Record<string, unknown>))
  }

  async updateClient(id: string, input: UpdateClientInput): Promise<DataResult<Client>> {
    const patch: Record<string, unknown> = {}
    if (input.name !== undefined) patch.name = input.name
    if (input.industry !== undefined) patch.industry = input.industry
    if (input.contactName !== undefined) patch.contact_name = input.contactName
    if (input.contactEmail !== undefined) patch.contact_email = input.contactEmail
    if (input.recruitmentEmail !== undefined) patch.recruitment_email = input.recruitmentEmail
    if (input.contactPhone !== undefined) patch.contact_phone = input.contactPhone
    if (input.whatsappPhone !== undefined) patch.whatsapp_phone = input.whatsappPhone
    if (input.address !== undefined) patch.address = input.address
    if (input.interviewAddress !== undefined) patch.interview_address = input.interviewAddress
    if (input.interviewArrivalDetails !== undefined) patch.interview_arrival_details = input.interviewArrivalDetails
    if (input.website !== undefined) patch.website = input.website
    if (input.logoUrl !== undefined) patch.logo_url = input.logoUrl
    if (input.notes !== undefined) patch.notes = input.notes
    patch.updated_at = new Date().toISOString()
    const { data, error } = await this.sb
      .from('clients')
      .update(patch)
      .eq('id', id)
      .select()
      .single()
    if (error) return err(error.message)
    return ok(mapClient(data as Record<string, unknown>))
  }

  async deleteClient(id: string): Promise<DataResult<void>> {
    // DB cascades handle: vacancies → applications → interviews → scorecards
    // candidates.client_id is SET NULL by the FK constraint
    const { error } = await this.sb.from('clients').delete().eq('id', id)
    if (error) return err(error.message)
    return ok(undefined)
  }

  async getDeleteClientCounts(clientId: string): Promise<{ vacancies: number; applications: number; interviews: number; scorecards: number }> {
    // Get vacancy IDs for this client
    const { data: vacancyRows } = await this.sb
      .from('vacancies')
      .select('id')
      .eq('client_id', clientId)
    const vacancyIds = (vacancyRows ?? []).map((v: { id: string }) => v.id)
    const vacancyCount = vacancyIds.length

    if (vacancyCount === 0) {
      return { vacancies: 0, applications: 0, interviews: 0, scorecards: 0 }
    }

    // Count applications for those vacancies
    const { count: appCount } = await this.sb
      .from('applications')
      .select('id', { count: 'exact', head: true })
      .in('vacancy_id', vacancyIds)

    // Get interview IDs for those vacancies
    const { data: interviewRows } = await this.sb
      .from('interviews')
      .select('id')
      .in('vacancy_id', vacancyIds)
    const interviewIds = (interviewRows ?? []).map((i: { id: string }) => i.id)
    const interviewCount = interviewIds.length

    // Count scorecards for those interviews
    let scorecardCount = 0
    if (interviewCount > 0) {
      const { count } = await this.sb
        .from('scorecards')
        .select('id', { count: 'exact', head: true })
        .in('interview_id', interviewIds)
      scorecardCount = count ?? 0
    }

    return {
      vacancies: vacancyCount,
      applications: appCount ?? 0,
      interviews: interviewCount,
      scorecards: scorecardCount,
    }
  }

  // ── Vacancies ─────────────────────────────────────────────────────────────

  async getVacancies(tenantId: string): Promise<DataResult<Vacancy[]>> {
    const { data, error } = await this.sb
      .from('vacancies')
      .select('*, client:clients(*)')
      .eq('tenant_id', tenantId)
      .not('client_id', 'is', null)
      .order('created_at', { ascending: false })
    if (error) return err(error.message)
    return ok((data ?? []).map(mapVacancy))
  }

  async createVacancy(input: CreateVacancyInput): Promise<DataResult<Vacancy>> {
    const { data, error } = await this.sb
      .from('vacancies')
      .insert({
        tenant_id: input.tenantId,
        client_id: input.clientId ?? null,
        title: input.title,
        department: input.department,
        status: input.status,
        description: input.description ?? null,
        requirements: input.requirements,
        salary_min: input.salaryMin ?? null,
        salary_max: input.salaryMax ?? null,
        currency: input.currency ?? null,
        location: input.location ?? null,
        modality: input.modality,
        priority: input.priority,
        closing_date: input.closingDate ?? null,
        rubro: input.rubro ?? null,
        perfil: input.perfil ?? null,
      })
      .select('*, client:clients(*)')
      .single()
    if (error) return err(error.message)
    return ok(mapVacancy(data as Record<string, unknown>))
  }

  async updateVacancy(id: string, input: UpdateVacancyInput): Promise<DataResult<Vacancy>> {
    const patch: Record<string, unknown> = {}
    if (input.clientId !== undefined) patch.client_id = input.clientId ?? null
    if (input.title !== undefined) patch.title = input.title
    if (input.department !== undefined) patch.department = input.department
    if (input.status !== undefined) patch.status = input.status
    if (input.description !== undefined) patch.description = input.description
    if (input.requirements !== undefined) patch.requirements = input.requirements
    if (input.salaryMin !== undefined) patch.salary_min = input.salaryMin
    if (input.salaryMax !== undefined) patch.salary_max = input.salaryMax
    if (input.currency !== undefined) patch.currency = input.currency
    if (input.location !== undefined) patch.location = input.location
    if (input.modality !== undefined) patch.modality = input.modality
    if (input.priority !== undefined) patch.priority = input.priority
    if (input.closingDate !== undefined) patch.closing_date = input.closingDate
    if (input.rubro !== undefined) patch.rubro = input.rubro
    if (input.perfil !== undefined) patch.perfil = input.perfil
    const { data, error } = await this.sb
      .from('vacancies')
      .update(patch)
      .eq('id', id)
      .select('*, client:clients(*)')
      .single()
    if (error) return err(error.message)
    return ok(mapVacancy(data as Record<string, unknown>))
  }

  async deleteVacancy(id: string): Promise<DataResult<void>> {
    const { error } = await this.sb.from('vacancies').delete().eq('id', id)
    if (error) return err(error.message)
    return ok(undefined)
  }

  async getCandidates(tenantId: string): Promise<DataResult<Candidate[]>> {
    const { data, error } = await this.sb
      .from('candidates')
      .select('*, client:clients(*)')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false })
    if (error) return err(error.message)
    return ok((data ?? []).map(mapCandidate))
  }

  async createCandidate(input: CreateCandidateInput): Promise<DataResult<Candidate>> {
    const { data, error } = await this.sb
      .from('candidates')
      .insert({
        tenant_id: input.tenantId,
        client_id: input.clientId ?? null,
        full_name: input.fullName,
        email: input.email,
        phone: input.phone ?? null,
        avatar_url: input.avatarUrl ?? null,
        ats_score: input.atsScore ?? null,
        skills: input.skills,
        experience_years: input.experienceYears ?? null,
        education: input.education ?? null,
        source: input.source,
        notes: input.notes ?? null,
        applied_at: input.appliedAt,
        cv_url: input.cvUrl ?? null,
        cv_file_name: input.cvFileName ?? null,
      })
      .select('*, client:clients(*)')
      .single()
    if (error) return err(error.message)
    return ok(mapCandidate(data as Record<string, unknown>))
  }

  async updateCandidate(id: string, input: UpdateCandidateInput): Promise<DataResult<Candidate>> {
    const patch: Record<string, unknown> = {}
    if (input.fullName !== undefined) patch.full_name = input.fullName
    if (input.email !== undefined) patch.email = input.email
    if (input.phone !== undefined) patch.phone = input.phone
    if (input.atsScore !== undefined) patch.ats_score = input.atsScore
    if (input.skills !== undefined) patch.skills = input.skills
    if (input.experienceYears !== undefined) patch.experience_years = input.experienceYears
    if (input.education !== undefined) patch.education = input.education
    if (input.source !== undefined) patch.source = input.source
    if (input.notes !== undefined) patch.notes = input.notes
    if (input.cvUrl !== undefined) patch.cv_url = input.cvUrl
    if (input.cvFileName !== undefined) patch.cv_file_name = input.cvFileName
    if (input.avatarUrl !== undefined) patch.avatar_url = input.avatarUrl
    if (input.clientId !== undefined) patch.client_id = input.clientId ?? null
    const { data, error } = await this.sb
      .from('candidates')
      .update(patch)
      .eq('id', id)
      .select('*, client:clients(*)')
      .single()
    if (error) return err(error.message)
    return ok(mapCandidate(data as Record<string, unknown>))
  }

  async deleteCandidate(id: string): Promise<DataResult<void>> {
    const { error } = await this.sb.from('candidates').delete().eq('id', id)
    if (error) return err(error.message)
    return ok(undefined)
  }

  async updateCandidateNotes(id: string, notes: string): Promise<DataResult<Candidate>> {
    const { data, error } = await this.sb
      .from('candidates')
      .update({ notes })
      .eq('id', id)
      .select()
      .single()
    if (error) return err(error.message)
    return ok(mapCandidate(data as Record<string, unknown>))
  }

  async getApplications(vacancyId?: string, _tenantId?: string): Promise<DataResult<Application[]>> {
    let q = this.sb
      .from('applications')
      .select('*, candidate:candidates(*)')
      .order('applied_at', { ascending: false })
    if (vacancyId) q = q.eq('vacancy_id', vacancyId)
    // Tenant isolation is handled by RLS on the applications and candidates tables
    const { data, error } = await q
    if (error) return err(error.message)
    return ok((data ?? []).map(mapApplication))
  }

  async createApplication(input: CreateApplicationInput): Promise<DataResult<Application>> {
    const { data, error } = await this.sb
      .from('applications')
      .insert({
        vacancy_id: input.vacancyId,
        candidate_id: input.candidateId,
        status: input.status,
        position_in_stage: input.positionInStage,
      })
      .select('*, candidate:candidates(*)')
      .single()
    if (error) return err(error.message)
    return ok(mapApplication(data as Record<string, unknown>))
  }

  async updateApplicationStatus(id: string, status: VacancyStatus): Promise<DataResult<Application>> {
    const { data, error } = await this.sb
      .from('applications')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*, candidate:candidates(*)')
      .single()
    if (error) return err(error.message)
    return ok(mapApplication(data as Record<string, unknown>))
  }

  async updateApplicationDisposition(
    id: string,
    disposition: CandidateDisposition | null
  ): Promise<DataResult<Application>> {
    const { data, error } = await this.sb
      .from('applications')
      .update({ disposition, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*, candidate:candidates(*)')
      .single()
    if (error) return err(error.message)
    return ok(mapApplication(data as Record<string, unknown>))
  }

  async updateApplicationRejection(
    id: string,
    reason: RejectionReason,
    note?: string
  ): Promise<DataResult<Application>> {
    const { data, error } = await this.sb
      .from('applications')
      .update({
        status: 'Descartado',
        rejection_reason: reason,
        rejection_note: note ?? null,
        disposition: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('*, candidate:candidates(*)')
      .single()
    if (error) return err(error.message)
    return ok(mapApplication(data as Record<string, unknown>))
  }

  async snapshotApplicationsForVacancy(vacancyId: string, vacancyTitle: string, clientName: string): Promise<void> {
    await this.sb
      .from('applications')
      .update({ vacancy_title: vacancyTitle, client_name: clientName })
      .eq('vacancy_id', vacancyId)
  }

  async archiveCandidatesForClient(clientId: string, clientVacancyIds: string[]): Promise<void> {
    if (clientVacancyIds.length === 0) return
    // Candidates whose ONLY vacancy applications were for this client's vacancies
    // First get all candidates with apps for these vacancies
    const { data: clientApps } = await this.sb
      .from('applications')
      .select('candidate_id')
      .in('vacancy_id', clientVacancyIds)
    if (!clientApps?.length) return
    const candidateIds = [...new Set(clientApps.map(a => a.candidate_id as string))]
    // Of those, find any that have OTHER applications not in this client's vacancies
    const { data: otherApps } = await this.sb
      .from('applications')
      .select('candidate_id')
      .in('candidate_id', candidateIds)
      .not('vacancy_id', 'in', `(${clientVacancyIds.map(id => `"${id}"`).join(',')})`)
      .not('vacancy_id', 'is', null)
    const stillActiveIds = new Set((otherApps ?? []).map(a => a.candidate_id as string))
    // Also keep candidates who have a direct clientId pointing to another existing client
    const { data: directClients } = await this.sb
      .from('candidates')
      .select('id, client_id')
      .in('id', candidateIds)
      .not('client_id', 'is', null)
      .neq('client_id', clientId)
    ;(directClients ?? []).forEach(c => stillActiveIds.add(c.id as string))
    const toArchive = candidateIds.filter(id => !stillActiveIds.has(id))
    if (toArchive.length === 0) return
    await this.sb.from('candidates').update({ archived: true }).in('id', toArchive)
  }

  // Stage mapping used by the pipeline drag-and-drop.
  // The DB stores the Spanish VacancyStatus labels directly, so we just
  // delegate to updateApplicationStatus after mapping the short key.
  private static readonly STAGE_MAP: Record<string, VacancyStatus> = {
    new: 'Nuevas Vacantes',
    screening: 'En Proceso',
    interview: 'Entrevistas',
    offer: 'Oferta Enviada',
    hired: 'Contratado',
  }

  async updateApplicationStage(applicationId: string, stage: string): Promise<void> {
    const vacancyStatus: VacancyStatus =
      SupabaseProvider.STAGE_MAP[stage] ?? (stage as VacancyStatus)
    await this.sb
      .from('applications')
      .update({ status: vacancyStatus, updated_at: new Date().toISOString() })
      .eq('id', applicationId)
  }

  async getInterviews(candidateId?: string, tenantId?: string): Promise<DataResult<Interview[]>> {
    // Join candidates so we can filter by tenant_id explicitly (RLS alone can be unreliable
    // for cross-table policies; explicit filter ensures correct tenant scoping).
    let q = this.sb
      .from('interviews')
      .select('*, candidate:candidates!candidate_id(tenant_id), scorecard:scorecards(*), vacancy:vacancies!vacancy_id(client_id)')
      .not('vacancy_id', 'is', null)
      .not('vacancy.client_id', 'is', null)
      .order('scheduled_at', { ascending: false })
    if (candidateId) q = q.eq('candidate_id', candidateId)
    if (tenantId) q = q.eq('candidate.tenant_id', tenantId)
    const { data, error } = await q
    if (error) return err(error.message)
    return ok((data ?? []).map(mapInterview))
  }

  async createInterview(input: CreateInterviewInput): Promise<DataResult<Interview>> {
    const { data, error } = await this.sb
      .from('interviews')
      .insert({
        candidate_id: input.candidateId,
        vacancy_id: input.vacancyId,
        scheduled_at: input.scheduledAt,
        type: input.type,
        interviewer_name: input.interviewerName,
        interviewer_email: input.interviewerEmail ?? null,
        status: input.status,
        meeting_platform: input.meetingPlatform,
        meeting_link: input.meetingLink ?? null,
        notes: input.notes ?? null,
      })
      .select('*, scorecard:scorecards(*)')
      .single()
    if (error) return err(error.message)
    return ok(mapInterview(data as Record<string, unknown>))
  }

  async updateInterview(id: string, input: UpdateInterviewInput): Promise<DataResult<Interview>> {
    const patch: Record<string, unknown> = {}
    if (input.status !== undefined) patch.status = input.status
    if (input.scheduledAt !== undefined) patch.scheduled_at = input.scheduledAt
    if (input.notes !== undefined) patch.notes = input.notes
    if (input.meetingLink !== undefined) patch.meeting_link = input.meetingLink
    if (input.type !== undefined) patch.type = input.type
    if (input.interviewerName !== undefined) patch.interviewer_name = input.interviewerName
    if (input.meetingPlatform !== undefined) patch.meeting_platform = input.meetingPlatform
    const { data, error } = await this.sb
      .from('interviews')
      .update(patch)
      .eq('id', id)
      .select('*, scorecard:scorecards(*)')
      .single()
    if (error) return err(error.message)
    return ok(mapInterview(data as Record<string, unknown>))
  }

  async createScorecard(input: CreateScorecardInput): Promise<DataResult<Scorecard>> {
    const { data, error } = await this.sb
      .from('scorecards')
      .upsert({
        interview_id: input.interviewId,
        overall_rating: input.overallRating,
        technical_skills: input.technicalSkills,
        communication: input.communication,
        cultural_fit: input.culturalFit,
        strengths: input.strengths,
        weaknesses: input.weaknesses,
        recommendation: input.recommendation,
        ai_summary: input.aiSummary ?? null,
        notes: input.notes ?? null,
      }, { onConflict: 'interview_id' })
      .select()
      .single()
    if (error) return err(error.message)
    return ok(mapScorecard(data as Record<string, unknown>))
  }

  async getTemplates(_tenantId: string): Promise<DataResult<MessageTemplate[]>> {
    const { data, error } = await this.sb
      .from('message_templates')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) return err(error.message)
    return ok((data ?? []).map(mapTemplate))
  }

  async createTemplate(input: CreateTemplateInput): Promise<DataResult<MessageTemplate>> {
    const { data, error } = await this.sb
      .from('message_templates')
      .insert({
        tenant_id: input.tenantId,
        name: input.name,
        channel: input.channel,
        category: input.category,
        subject: input.subject ?? null,
        body: input.body,
        variables: input.variables,
        is_default: input.isDefault,
      })
      .select()
      .single()
    if (error) return err(error.message)
    return ok(mapTemplate(data as Record<string, unknown>))
  }

  async updateTemplate(id: string, input: UpdateTemplateInput): Promise<DataResult<MessageTemplate>> {
    const patch: Record<string, unknown> = {}
    if (input.name !== undefined) patch.name = input.name
    if (input.channel !== undefined) patch.channel = input.channel
    if (input.category !== undefined) patch.category = input.category
    if (input.subject !== undefined) patch.subject = input.subject
    if (input.body !== undefined) patch.body = input.body
    if (input.variables !== undefined) patch.variables = input.variables
    if (input.isDefault !== undefined) patch.is_default = input.isDefault
    const { data, error } = await this.sb
      .from('message_templates')
      .update(patch)
      .eq('id', id)
      .select()
      .single()
    if (error) return err(error.message)
    return ok(mapTemplate(data as Record<string, unknown>))
  }

  async deleteTemplate(id: string): Promise<DataResult<void>> {
    const { error } = await this.sb.from('message_templates').delete().eq('id', id)
    if (error) return err(error.message)
    return ok(undefined)
  }

  async getIntegrations(_tenantId: string): Promise<DataResult<Integration[]>> {
    const { data, error } = await this.sb
      .from('integrations')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) return err(error.message)
    return ok((data ?? []).map(mapIntegration))
  }

  async saveIntegration(input: CreateIntegrationInput): Promise<DataResult<Integration>> {
    const { data, error } = await this.sb
      .from('integrations')
      .upsert(
        {
          tenant_id: input.tenantId,
          platform: input.platform,
          account_name: input.accountName,
          account_email: input.accountEmail ?? null,
          status: input.status,
          expires_at: input.expiresAt ?? null,
          metadata: input.metadata ?? null,
        },
        { onConflict: 'tenant_id,platform' }
      )
      .select()
      .single()
    if (error) return err(error.message)
    return ok(mapIntegration(data as Record<string, unknown>))
  }

  async deleteIntegration(id: string): Promise<DataResult<void>> {
    const { error } = await this.sb.from('integrations').delete().eq('id', id)
    if (error) return err(error.message)
    return ok(undefined)
  }

  async getApplicationsByCandidateId(candidateId: string): Promise<DataResult<Application[]>> {
    const { data, error } = await this.sb
      .from('applications')
      .select('*, candidate:candidates(*, client:clients(*))')
      .eq('candidate_id', candidateId)
      .order('applied_at', { ascending: false })
    if (error) return err(error.message)
    return ok((data ?? []).map(mapApplication))
  }

  async closeVacancy(id: string): Promise<DataResult<Vacancy>> {
    const { data, error } = await this.sb
      .from('vacancies')
      .update({ status: 'Contratado', closing_date: new Date().toISOString().slice(0, 10) })
      .eq('id', id)
      .select()
      .single()
    if (error) return err(error.message)
    return ok(mapVacancy(data as Record<string, unknown>))
  }

  // ── Job Rubros ──
  async getJobRubros(_tenantId: string): Promise<DataResult<JobRubro[]>> {
    const { data, error } = await this.sb
      .from('job_rubros')
      .select('*')
      .order('created_at', { ascending: true })
    if (error) return err(error.message)
    return ok((data ?? []).map(mapJobRubro))
  }

  async createJobRubro(input: CreateJobRubroInput): Promise<DataResult<JobRubro>> {
    const { data, error } = await this.sb
      .from('job_rubros')
      .insert({ tenant_id: input.tenantId, name: input.name })
      .select()
      .single()
    if (error) return err(error.message)
    return ok(mapJobRubro(data as Record<string, unknown>))
  }

  async deleteJobRubro(id: string): Promise<DataResult<void>> {
    const { error } = await this.sb.from('job_rubros').delete().eq('id', id)
    if (error) return err(error.message)
    return ok(undefined)
  }

  async updateJobRubro(id: string, name: string): Promise<DataResult<JobRubro>> {
    const { data, error } = await this.sb
      .from('job_rubros')
      .update({ name })
      .eq('id', id)
      .select()
      .single()
    if (error) return err(error.message)
    return ok(mapJobRubro(data as Record<string, unknown>))
  }

  // ── Job Profiles ──
  async getJobProfiles(_tenantId: string, rubro?: string): Promise<DataResult<CustomJobProfile[]>> {
    let q = this.sb.from('job_profiles').select('*')
    if (rubro) q = q.eq('rubro', rubro)
    const { data, error } = await q.order('perfil', { ascending: true })
    if (error) return err(error.message)
    return ok((data ?? []).map(mapCustomJobProfile))
  }

  async createJobProfile(input: CreateJobProfileInput): Promise<DataResult<CustomJobProfile>> {
    const { data, error } = await this.sb
      .from('job_profiles')
      .insert({
        tenant_id: input.tenantId,
        rubro: input.rubro,
        perfil: input.perfil,
        nivel: input.nivel,
        skills_tecnicas: input.skillsTecnicas ?? [],
        skills_blandas: input.skillsBlandas ?? [],
        skills_herramientas: input.skillsHerramientas ?? [],
        skills_certificaciones: input.skillsCertificaciones ?? [],
        descripcion_tipica: input.descripcionTipica ?? '',
      })
      .select()
      .single()
    if (error) return err(error.message)
    return ok(mapCustomJobProfile(data as Record<string, unknown>))
  }

  async updateJobProfile(id: string, input: Partial<CreateJobProfileInput>): Promise<DataResult<CustomJobProfile>> {
    const patch: Record<string, unknown> = {}
    if (input.perfil !== undefined) patch.perfil = input.perfil
    if (input.nivel !== undefined) patch.nivel = input.nivel
    if (input.rubro !== undefined) patch.rubro = input.rubro
    if (input.skillsTecnicas !== undefined) patch.skills_tecnicas = input.skillsTecnicas
    if (input.skillsBlandas !== undefined) patch.skills_blandas = input.skillsBlandas
    if (input.skillsHerramientas !== undefined) patch.skills_herramientas = input.skillsHerramientas
    if (input.skillsCertificaciones !== undefined) patch.skills_certificaciones = input.skillsCertificaciones
    if (input.descripcionTipica !== undefined) patch.descripcion_tipica = input.descripcionTipica
    const { data, error } = await this.sb
      .from('job_profiles')
      .update(patch)
      .eq('id', id)
      .select()
      .single()
    if (error) return err(error.message)
    return ok(mapCustomJobProfile(data as Record<string, unknown>))
  }

  async deleteJobProfile(id: string): Promise<DataResult<void>> {
    const { error } = await this.sb.from('job_profiles').delete().eq('id', id)
    if (error) return err(error.message)
    return ok(undefined)
  }
}
