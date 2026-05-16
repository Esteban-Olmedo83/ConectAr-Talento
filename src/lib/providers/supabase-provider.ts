import { createClient } from '@/lib/supabase/client'
import type {
  DataResult,
  Vacancy,
  Candidate,
  Application,
  Interview,
  Scorecard,
  MessageTemplate,
  Integration,
  VacancyStatus,
} from '@/types'
import type {
  DataProvider,
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

function mapVacancy(row: Record<string, unknown>): Vacancy {
  return {
    id: row.id as string,
    tenantId: row.tenant_id as string,
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
  }
}

function mapCandidate(row: Record<string, unknown>): Candidate {
  return {
    id: row.id as string,
    tenantId: row.tenant_id as string,
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
    vacancyId: row.vacancy_id as string,
    candidateId: row.candidate_id as string,
    status: row.status as VacancyStatus,
    positionInStage: row.position_in_stage as number,
    appliedAt: row.applied_at as string,
    updatedAt: row.updated_at as string,
    candidate: row.candidate ? mapCandidate(row.candidate as Record<string, unknown>) : undefined,
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

export class SupabaseProvider implements DataProvider {
  private get sb() { return createClient() }

  async getVacancies(_tenantId: string): Promise<DataResult<Vacancy[]>> {
    const { data, error } = await this.sb
      .from('vacancies')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) return err(error.message)
    return ok((data ?? []).map(mapVacancy))
  }

  async createVacancy(input: CreateVacancyInput): Promise<DataResult<Vacancy>> {
    const { data, error } = await this.sb
      .from('vacancies')
      .insert({
        tenant_id: input.tenantId,
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
      })
      .select()
      .single()
    if (error) return err(error.message)
    return ok(mapVacancy(data as Record<string, unknown>))
  }

  async updateVacancy(id: string, input: UpdateVacancyInput): Promise<DataResult<Vacancy>> {
    const patch: Record<string, unknown> = {}
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
    const { data, error } = await this.sb
      .from('vacancies')
      .update(patch)
      .eq('id', id)
      .select()
      .single()
    if (error) return err(error.message)
    return ok(mapVacancy(data as Record<string, unknown>))
  }

  async deleteVacancy(id: string): Promise<DataResult<void>> {
    const { error } = await this.sb.from('vacancies').delete().eq('id', id)
    if (error) return err(error.message)
    return ok(undefined)
  }

  async getCandidates(_tenantId: string): Promise<DataResult<Candidate[]>> {
    const { data, error } = await this.sb
      .from('candidates')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) return err(error.message)
    return ok((data ?? []).map(mapCandidate))
  }

  async createCandidate(input: CreateCandidateInput): Promise<DataResult<Candidate>> {
    const { data, error } = await this.sb
      .from('candidates')
      .insert({
        tenant_id: input.tenantId,
        full_name: input.fullName,
        email: input.email,
        phone: input.phone ?? null,
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
      .select()
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
    const { data, error } = await this.sb
      .from('candidates')
      .update(patch)
      .eq('id', id)
      .select()
      .single()
    if (error) return err(error.message)
    return ok(mapCandidate(data as Record<string, unknown>))
  }

  async deleteCandidate(id: string): Promise<DataResult<void>> {
    const { error } = await this.sb.from('candidates').delete().eq('id', id)
    if (error) return err(error.message)
    return ok(undefined)
  }

  async getApplications(vacancyId?: string): Promise<DataResult<Application[]>> {
    let q = this.sb
      .from('applications')
      .select('*, candidate:candidates(*)')
      .order('applied_at', { ascending: false })
    if (vacancyId) q = q.eq('vacancy_id', vacancyId)
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

  async getInterviews(candidateId?: string): Promise<DataResult<Interview[]>> {
    let q = this.sb
      .from('interviews')
      .select('*, scorecard:scorecards(*)')
      .order('scheduled_at', { ascending: false })
    if (candidateId) q = q.eq('candidate_id', candidateId)
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
      .insert({
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
      })
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
}
