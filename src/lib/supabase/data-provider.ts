import { createClient } from '@/lib/supabase/client'
import type {
  DataResult, Vacancy, Candidate, Application,
  Interview, Scorecard, MessageTemplate, Integration, VacancyStatus,
} from '@/types'
import type {
  DataProvider, CreateVacancyInput, UpdateVacancyInput,
  CreateCandidateInput, UpdateCandidateInput,
  CreateApplicationInput, CreateInterviewInput, UpdateInterviewInput,
  CreateScorecardInput, CreateTemplateInput, UpdateTemplateInput,
  CreateIntegrationInput,
} from '@/lib/providers/data-provider'

// ─── Mappers DB → TS ──────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapVacancy(r: any): Vacancy {
  return {
    id: r.id,
    tenantId: r.tenant_id,
    title: r.title,
    department: r.department,
    status: r.status,
    description: r.description ?? undefined,
    requirements: r.requirements ?? [],
    salaryMin: r.salary_min ?? undefined,
    salaryMax: r.salary_max ?? undefined,
    currency: r.currency ?? undefined,
    location: r.location ?? undefined,
    modality: r.modality,
    priority: r.priority,
    publishedAt: r.published_at ?? undefined,
    closingDate: r.closing_date ?? undefined,
    createdBy: r.created_by ?? undefined,
    createdAt: r.created_at,
    applications: [],
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapCandidate(r: any): Candidate {
  return {
    id: r.id,
    tenantId: r.tenant_id,
    fullName: r.full_name,
    email: r.email,
    phone: r.phone ?? undefined,
    avatarUrl: r.avatar_url ?? undefined,
    cvUrl: r.cv_url ?? undefined,
    cvFileName: r.cv_file_name ?? undefined,
    atsScore: r.ats_score ?? undefined,
    skills: r.skills ?? [],
    experienceYears: r.experience_years ?? undefined,
    education: r.education ?? undefined,
    source: r.source,
    notes: r.notes ?? undefined,
    appliedAt: r.applied_at,
    createdAt: r.created_at,
    interviews: [],
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapApplication(r: any): Application {
  return {
    id: r.id,
    vacancyId: r.vacancy_id,
    candidateId: r.candidate_id,
    status: r.status,
    positionInStage: r.position_in_stage,
    appliedAt: r.applied_at,
    updatedAt: r.updated_at,
    candidate: r.candidates ? mapCandidate(r.candidates) : undefined,
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapInterview(r: any): Interview {
  return {
    id: r.id,
    candidateId: r.candidate_id,
    vacancyId: r.vacancy_id,
    scheduledAt: r.scheduled_at,
    type: r.type,
    interviewerName: r.interviewer_name,
    interviewerEmail: r.interviewer_email ?? undefined,
    status: r.status,
    meetingPlatform: r.meeting_platform,
    meetingLink: r.meeting_link ?? undefined,
    notes: r.notes ?? undefined,
    scorecard: r.scorecards ? mapScorecard(r.scorecards) : undefined,
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapScorecard(r: any): Scorecard {
  return {
    id: r.id,
    interviewId: r.interview_id,
    overallRating: r.overall_rating,
    technicalSkills: r.technical_skills,
    communication: r.communication,
    culturalFit: r.cultural_fit,
    strengths: r.strengths,
    weaknesses: r.weaknesses,
    recommendation: r.recommendation,
    aiSummary: r.ai_summary ?? undefined,
    notes: r.notes ?? undefined,
    createdAt: r.created_at,
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapTemplate(r: any): MessageTemplate {
  return {
    id: r.id,
    tenantId: r.tenant_id,
    name: r.name,
    channel: r.channel,
    category: r.category,
    subject: r.subject ?? undefined,
    body: r.body,
    variables: r.variables ?? [],
    isDefault: r.is_default,
    createdAt: r.created_at,
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapIntegration(r: any): Integration {
  return {
    id: r.id,
    tenantId: r.tenant_id,
    platform: r.platform,
    accountName: r.account_name,
    accountEmail: r.account_email ?? undefined,
    status: r.status,
    expiresAt: r.expires_at ?? undefined,
    metadata: r.metadata ?? undefined,
    createdAt: r.created_at,
  }
}

function ok<T>(data: T): DataResult<T> { return { data, error: null } }
function err<T>(e: unknown): DataResult<T> {
  const msg = e instanceof Error ? e.message : String(e)
  return { data: null, error: msg }
}

// ─── SupabaseProvider ─────────────────────────────────────────────────────────

export class SupabaseProvider implements DataProvider {
  private get db() { return createClient() }

  // ── Vacancies ───────────────────────────────────────────────────────────────

  async getVacancies(tenantId: string): Promise<DataResult<Vacancy[]>> {
    try {
      const { data, error } = await this.db
        .from('vacancies')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false })
      if (error) return err(error.message)
      return ok((data ?? []).map(mapVacancy))
    } catch (e) { return err(e) }
  }

  async createVacancy(input: CreateVacancyInput): Promise<DataResult<Vacancy>> {
    try {
      const { data, error } = await this.db
        .from('vacancies')
        .insert({
          tenant_id: input.tenantId,
          title: input.title,
          department: input.department,
          status: input.status,
          description: input.description,
          requirements: input.requirements,
          salary_min: input.salaryMin,
          salary_max: input.salaryMax,
          currency: input.currency,
          location: input.location,
          modality: input.modality,
          priority: input.priority,
          published_at: input.publishedAt,
          closing_date: input.closingDate,
          created_by: input.createdBy,
        })
        .select()
        .single()
      if (error) return err(error.message)
      return ok(mapVacancy(data))
    } catch (e) { return err(e) }
  }

  async updateVacancy(id: string, input: UpdateVacancyInput): Promise<DataResult<Vacancy>> {
    try {
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
      if (input.publishedAt !== undefined) patch.published_at = input.publishedAt
      if (input.closingDate !== undefined) patch.closing_date = input.closingDate

      const { data, error } = await this.db
        .from('vacancies').update(patch).eq('id', id).select().single()
      if (error) return err(error.message)
      return ok(mapVacancy(data))
    } catch (e) { return err(e) }
  }

  async deleteVacancy(id: string): Promise<DataResult<void>> {
    try {
      const { error } = await this.db.from('vacancies').delete().eq('id', id)
      if (error) return err(error.message)
      return ok(undefined)
    } catch (e) { return err(e) }
  }

  // ── Candidates ──────────────────────────────────────────────────────────────

  async getCandidates(tenantId: string): Promise<DataResult<Candidate[]>> {
    try {
      const { data, error } = await this.db
        .from('candidates')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false })
      if (error) return err(error.message)
      return ok((data ?? []).map(mapCandidate))
    } catch (e) { return err(e) }
  }

  async createCandidate(input: CreateCandidateInput): Promise<DataResult<Candidate>> {
    try {
      const { data, error } = await this.db
        .from('candidates')
        .insert({
          tenant_id: input.tenantId,
          full_name: input.fullName,
          email: input.email,
          phone: input.phone,
          avatar_url: input.avatarUrl,
          cv_url: input.cvUrl,
          cv_file_name: input.cvFileName,
          ats_score: input.atsScore,
          skills: input.skills,
          experience_years: input.experienceYears,
          education: input.education,
          source: input.source,
          notes: input.notes,
          applied_at: input.appliedAt ?? new Date().toISOString(),
        })
        .select()
        .single()
      if (error) return err(error.message)
      return ok(mapCandidate(data))
    } catch (e) { return err(e) }
  }

  async updateCandidate(id: string, input: UpdateCandidateInput): Promise<DataResult<Candidate>> {
    try {
      const patch: Record<string, unknown> = {}
      if (input.fullName !== undefined) patch.full_name = input.fullName
      if (input.email !== undefined) patch.email = input.email
      if (input.phone !== undefined) patch.phone = input.phone
      if (input.avatarUrl !== undefined) patch.avatar_url = input.avatarUrl
      if (input.cvUrl !== undefined) patch.cv_url = input.cvUrl
      if (input.cvFileName !== undefined) patch.cv_file_name = input.cvFileName
      if (input.atsScore !== undefined) patch.ats_score = input.atsScore
      if (input.skills !== undefined) patch.skills = input.skills
      if (input.experienceYears !== undefined) patch.experience_years = input.experienceYears
      if (input.education !== undefined) patch.education = input.education
      if (input.source !== undefined) patch.source = input.source
      if (input.notes !== undefined) patch.notes = input.notes

      const { data, error } = await this.db
        .from('candidates').update(patch).eq('id', id).select().single()
      if (error) return err(error.message)
      return ok(mapCandidate(data))
    } catch (e) { return err(e) }
  }

  async deleteCandidate(id: string): Promise<DataResult<void>> {
    try {
      const { error } = await this.db.from('candidates').delete().eq('id', id)
      if (error) return err(error.message)
      return ok(undefined)
    } catch (e) { return err(e) }
  }

  // ── Applications ─────────────────────────────────────────────────────────────

  async getApplications(vacancyId?: string): Promise<DataResult<Application[]>> {
    try {
      let query = this.db
        .from('applications')
        .select('*, candidates(*)')
        .order('position_in_stage', { ascending: true })
      if (vacancyId) query = query.eq('vacancy_id', vacancyId)
      const { data, error } = await query
      if (error) return err(error.message)
      return ok((data ?? []).map(mapApplication))
    } catch (e) { return err(e) }
  }

  async createApplication(input: CreateApplicationInput): Promise<DataResult<Application>> {
    try {
      const { data, error } = await this.db
        .from('applications')
        .insert({
          vacancy_id: input.vacancyId,
          candidate_id: input.candidateId,
          status: input.status,
          position_in_stage: input.positionInStage,
        })
        .select('*, candidates(*)')
        .single()
      if (error) return err(error.message)
      return ok(mapApplication(data))
    } catch (e) { return err(e) }
  }

  async updateApplicationStatus(id: string, status: VacancyStatus): Promise<DataResult<Application>> {
    try {
      const { data, error } = await this.db
        .from('applications')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select('*, candidates(*)')
        .single()
      if (error) return err(error.message)
      return ok(mapApplication(data))
    } catch (e) { return err(e) }
  }

  // ── Interviews ───────────────────────────────────────────────────────────────

  async getInterviews(candidateId?: string): Promise<DataResult<Interview[]>> {
    try {
      let query = this.db
        .from('interviews')
        .select('*, scorecards(*)')
        .order('scheduled_at', { ascending: true })
      if (candidateId) query = query.eq('candidate_id', candidateId)
      const { data, error } = await query
      if (error) return err(error.message)
      return ok((data ?? []).map(mapInterview))
    } catch (e) { return err(e) }
  }

  async createInterview(input: CreateInterviewInput): Promise<DataResult<Interview>> {
    try {
      const { data, error } = await this.db
        .from('interviews')
        .insert({
          candidate_id: input.candidateId,
          vacancy_id: input.vacancyId,
          scheduled_at: input.scheduledAt,
          type: input.type,
          interviewer_name: input.interviewerName,
          interviewer_email: input.interviewerEmail,
          status: input.status,
          meeting_platform: input.meetingPlatform,
          meeting_link: input.meetingLink,
          notes: input.notes,
        })
        .select()
        .single()
      if (error) return err(error.message)
      return ok(mapInterview(data))
    } catch (e) { return err(e) }
  }

  async updateInterview(id: string, input: UpdateInterviewInput): Promise<DataResult<Interview>> {
    try {
      const patch: Record<string, unknown> = {}
      if (input.status !== undefined) patch.status = input.status
      if (input.notes !== undefined) patch.notes = input.notes
      if (input.meetingLink !== undefined) patch.meeting_link = input.meetingLink
      if (input.scheduledAt !== undefined) patch.scheduled_at = input.scheduledAt
      if (input.interviewerName !== undefined) patch.interviewer_name = input.interviewerName
      if (input.interviewerEmail !== undefined) patch.interviewer_email = input.interviewerEmail

      const { data, error } = await this.db
        .from('interviews').update(patch).eq('id', id).select('*, scorecards(*)').single()
      if (error) return err(error.message)
      return ok(mapInterview(data))
    } catch (e) { return err(e) }
  }

  // ── Scorecards ───────────────────────────────────────────────────────────────

  async createScorecard(input: CreateScorecardInput): Promise<DataResult<Scorecard>> {
    try {
      const { data, error } = await this.db
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
          ai_summary: input.aiSummary,
          notes: input.notes,
        }, { onConflict: 'interview_id' })
        .select()
        .single()
      if (error) return err(error.message)
      return ok(mapScorecard(data))
    } catch (e) { return err(e) }
  }

  // ── Templates ────────────────────────────────────────────────────────────────

  async getTemplates(tenantId: string): Promise<DataResult<MessageTemplate[]>> {
    try {
      const { data, error } = await this.db
        .from('message_templates')
        .select('*')
        .or(`is_default.eq.true,tenant_id.eq.${tenantId}`)
        .order('created_at', { ascending: false })
      if (error) return err(error.message)
      return ok((data ?? []).map(mapTemplate))
    } catch (e) { return err(e) }
  }

  async createTemplate(input: CreateTemplateInput): Promise<DataResult<MessageTemplate>> {
    try {
      const { data, error } = await this.db
        .from('message_templates')
        .insert({
          tenant_id: input.tenantId,
          name: input.name,
          channel: input.channel,
          category: input.category,
          subject: input.subject,
          body: input.body,
          variables: input.variables,
          is_default: input.isDefault,
        })
        .select()
        .single()
      if (error) return err(error.message)
      return ok(mapTemplate(data))
    } catch (e) { return err(e) }
  }

  async updateTemplate(id: string, input: UpdateTemplateInput): Promise<DataResult<MessageTemplate>> {
    try {
      const patch: Record<string, unknown> = {}
      if (input.name !== undefined) patch.name = input.name
      if (input.channel !== undefined) patch.channel = input.channel
      if (input.category !== undefined) patch.category = input.category
      if (input.subject !== undefined) patch.subject = input.subject
      if (input.body !== undefined) patch.body = input.body
      if (input.variables !== undefined) patch.variables = input.variables
      if (input.isDefault !== undefined) patch.is_default = input.isDefault

      const { data, error } = await this.db
        .from('message_templates').update(patch).eq('id', id).select().single()
      if (error) return err(error.message)
      return ok(mapTemplate(data))
    } catch (e) { return err(e) }
  }

  async deleteTemplate(id: string): Promise<DataResult<void>> {
    try {
      const { error } = await this.db.from('message_templates').delete().eq('id', id)
      if (error) return err(error.message)
      return ok(undefined)
    } catch (e) { return err(e) }
  }

  // ── Integrations ─────────────────────────────────────────────────────────────

  async getIntegrations(tenantId: string): Promise<DataResult<Integration[]>> {
    try {
      const { data, error } = await this.db
        .from('integrations')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false })
      if (error) return err(error.message)
      return ok((data ?? []).map(mapIntegration))
    } catch (e) { return err(e) }
  }

  async saveIntegration(input: CreateIntegrationInput): Promise<DataResult<Integration>> {
    try {
      const { data, error } = await this.db
        .from('integrations')
        .upsert({
          tenant_id: input.tenantId,
          platform: input.platform,
          account_name: input.accountName,
          account_email: input.accountEmail,
          status: input.status,
          expires_at: input.expiresAt,
          metadata: input.metadata,
        }, { onConflict: 'tenant_id,platform' })
        .select()
        .single()
      if (error) return err(error.message)
      return ok(mapIntegration(data))
    } catch (e) { return err(e) }
  }

  async deleteIntegration(id: string): Promise<DataResult<void>> {
    try {
      const { error } = await this.db.from('integrations').delete().eq('id', id)
      if (error) return err(error.message)
      return ok(undefined)
    } catch (e) { return err(e) }
  }
}
