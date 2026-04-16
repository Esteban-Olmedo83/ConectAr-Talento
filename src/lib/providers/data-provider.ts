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

// ─── Input types (omit server-generated fields) ──────────────────────────────

export type CreateVacancyInput = Omit<Vacancy, 'id' | 'createdAt' | 'applications'>
export type UpdateVacancyInput = Partial<Omit<Vacancy, 'id' | 'createdAt' | 'tenantId'>>

export type CreateCandidateInput = Omit<Candidate, 'id' | 'createdAt' | 'interviews'>
export type UpdateCandidateInput = Partial<Omit<Candidate, 'id' | 'createdAt' | 'tenantId'>>

export type CreateApplicationInput = Omit<Application, 'id' | 'appliedAt' | 'updatedAt' | 'candidate'>
export type CreateInterviewInput = Omit<Interview, 'id' | 'scorecard'>
export type UpdateInterviewInput = Partial<Omit<Interview, 'id'>>

export type CreateScorecardInput = Omit<Scorecard, 'id' | 'createdAt'>

export type CreateTemplateInput = Omit<MessageTemplate, 'id' | 'createdAt'>
export type UpdateTemplateInput = Partial<Omit<MessageTemplate, 'id' | 'createdAt' | 'tenantId'>>

export type CreateIntegrationInput = Omit<Integration, 'id' | 'createdAt'>

// ─── DataProvider interface ───────────────────────────────────────────────────

export interface DataProvider {
  // Vacancies
  getVacancies(tenantId: string): Promise<DataResult<Vacancy[]>>
  createVacancy(input: CreateVacancyInput): Promise<DataResult<Vacancy>>
  updateVacancy(id: string, input: UpdateVacancyInput): Promise<DataResult<Vacancy>>
  deleteVacancy(id: string): Promise<DataResult<void>>

  // Candidates
  getCandidates(tenantId: string): Promise<DataResult<Candidate[]>>
  createCandidate(input: CreateCandidateInput): Promise<DataResult<Candidate>>
  updateCandidate(id: string, input: UpdateCandidateInput): Promise<DataResult<Candidate>>
  deleteCandidate(id: string): Promise<DataResult<void>>

  // Applications
  getApplications(vacancyId?: string): Promise<DataResult<Application[]>>
  createApplication(input: CreateApplicationInput): Promise<DataResult<Application>>
  updateApplicationStatus(id: string, status: VacancyStatus): Promise<DataResult<Application>>

  // Interviews
  getInterviews(candidateId?: string): Promise<DataResult<Interview[]>>
  createInterview(input: CreateInterviewInput): Promise<DataResult<Interview>>
  updateInterview(id: string, input: UpdateInterviewInput): Promise<DataResult<Interview>>

  // Scorecards
  createScorecard(input: CreateScorecardInput): Promise<DataResult<Scorecard>>

  // Templates
  getTemplates(tenantId: string): Promise<DataResult<MessageTemplate[]>>
  createTemplate(input: CreateTemplateInput): Promise<DataResult<MessageTemplate>>
  updateTemplate(id: string, input: UpdateTemplateInput): Promise<DataResult<MessageTemplate>>
  deleteTemplate(id: string): Promise<DataResult<void>>

  // Integrations
  getIntegrations(tenantId: string): Promise<DataResult<Integration[]>>
  saveIntegration(input: CreateIntegrationInput): Promise<DataResult<Integration>>
  deleteIntegration(id: string): Promise<DataResult<void>>
}

// ─── Storage keys ─────────────────────────────────────────────────────────────

const KEYS = {
  vacancies: 'ct_vacancies',
  candidates: 'ct_candidates',
  applications: 'ct_applications',
  interviews: 'ct_interviews',
  scorecards: 'ct_scorecards',
  templates: 'ct_templates',
  integrations: 'ct_integrations',
} as const

// ─── Helpers ─────────────────────────────────────────────────────────────────

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

function now(): string {
  return new Date().toISOString()
}

function ok<T>(data: T): DataResult<T> {
  return { data, error: null }
}

function err<T>(message: string): DataResult<T> {
  return { data: null, error: message }
}

function readCollection<T>(key: string): T[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return []
    return JSON.parse(raw) as T[]
  } catch {
    return []
  }
}

function writeCollection<T>(key: string, items: T[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(key, JSON.stringify(items))
}

// ─── LocalStorageProvider ─────────────────────────────────────────────────────

export class LocalStorageProvider implements DataProvider {
  // ── Vacancies ──────────────────────────────────────────────────────────────

  async getVacancies(tenantId: string): Promise<DataResult<Vacancy[]>> {
    try {
      const all = readCollection<Vacancy>(KEYS.vacancies)
      return ok(all.filter((v) => v.tenantId === tenantId))
    } catch (e) {
      return err(`getVacancies failed: ${String(e)}`)
    }
  }

  async createVacancy(input: CreateVacancyInput): Promise<DataResult<Vacancy>> {
    try {
      const vacancy: Vacancy = {
        ...input,
        id: generateId(),
        applications: [],
        createdAt: now(),
      }
      const all = readCollection<Vacancy>(KEYS.vacancies)
      all.push(vacancy)
      writeCollection(KEYS.vacancies, all)
      return ok(vacancy)
    } catch (e) {
      return err(`createVacancy failed: ${String(e)}`)
    }
  }

  async updateVacancy(id: string, input: UpdateVacancyInput): Promise<DataResult<Vacancy>> {
    try {
      const all = readCollection<Vacancy>(KEYS.vacancies)
      const idx = all.findIndex((v) => v.id === id)
      if (idx === -1) return err(`Vacancy ${id} not found`)
      const updated: Vacancy = { ...all[idx], ...input }
      all[idx] = updated
      writeCollection(KEYS.vacancies, all)
      return ok(updated)
    } catch (e) {
      return err(`updateVacancy failed: ${String(e)}`)
    }
  }

  async deleteVacancy(id: string): Promise<DataResult<void>> {
    try {
      const all = readCollection<Vacancy>(KEYS.vacancies)
      const filtered = all.filter((v) => v.id !== id)
      writeCollection(KEYS.vacancies, filtered)
      // Cascade: remove associated applications
      const apps = readCollection<Application>(KEYS.applications)
      writeCollection(KEYS.applications, apps.filter((a) => a.vacancyId !== id))
      return ok(undefined)
    } catch (e) {
      return err(`deleteVacancy failed: ${String(e)}`)
    }
  }

  // ── Candidates ─────────────────────────────────────────────────────────────

  async getCandidates(tenantId: string): Promise<DataResult<Candidate[]>> {
    try {
      const all = readCollection<Candidate>(KEYS.candidates)
      return ok(all.filter((c) => c.tenantId === tenantId))
    } catch (e) {
      return err(`getCandidates failed: ${String(e)}`)
    }
  }

  async createCandidate(input: CreateCandidateInput): Promise<DataResult<Candidate>> {
    try {
      const candidate: Candidate = {
        ...input,
        id: generateId(),
        interviews: [],
        createdAt: now(),
      }
      const all = readCollection<Candidate>(KEYS.candidates)
      all.push(candidate)
      writeCollection(KEYS.candidates, all)
      return ok(candidate)
    } catch (e) {
      return err(`createCandidate failed: ${String(e)}`)
    }
  }

  async updateCandidate(id: string, input: UpdateCandidateInput): Promise<DataResult<Candidate>> {
    try {
      const all = readCollection<Candidate>(KEYS.candidates)
      const idx = all.findIndex((c) => c.id === id)
      if (idx === -1) return err(`Candidate ${id} not found`)
      const updated: Candidate = { ...all[idx], ...input }
      all[idx] = updated
      writeCollection(KEYS.candidates, all)
      return ok(updated)
    } catch (e) {
      return err(`updateCandidate failed: ${String(e)}`)
    }
  }

  async deleteCandidate(id: string): Promise<DataResult<void>> {
    try {
      const all = readCollection<Candidate>(KEYS.candidates)
      writeCollection(KEYS.candidates, all.filter((c) => c.id !== id))
      // Cascade: remove associated applications and interviews
      const apps = readCollection<Application>(KEYS.applications)
      writeCollection(KEYS.applications, apps.filter((a) => a.candidateId !== id))
      const interviews = readCollection<Interview>(KEYS.interviews)
      writeCollection(KEYS.interviews, interviews.filter((i) => i.candidateId !== id))
      return ok(undefined)
    } catch (e) {
      return err(`deleteCandidate failed: ${String(e)}`)
    }
  }

  // ── Applications ───────────────────────────────────────────────────────────

  async getApplications(vacancyId?: string): Promise<DataResult<Application[]>> {
    try {
      const all = readCollection<Application>(KEYS.applications)
      const result = vacancyId ? all.filter((a) => a.vacancyId === vacancyId) : all

      // Hydrate candidate field
      const candidates = readCollection<Candidate>(KEYS.candidates)
      const candidateMap = new Map(candidates.map((c) => [c.id, c]))
      const hydrated = result.map((a) => ({
        ...a,
        candidate: candidateMap.get(a.candidateId),
      }))
      return ok(hydrated)
    } catch (e) {
      return err(`getApplications failed: ${String(e)}`)
    }
  }

  async createApplication(input: CreateApplicationInput): Promise<DataResult<Application>> {
    try {
      const application: Application = {
        ...input,
        id: generateId(),
        appliedAt: now(),
        updatedAt: now(),
      }
      const all = readCollection<Application>(KEYS.applications)
      // Prevent duplicate application for same candidate + vacancy
      const duplicate = all.find(
        (a) => a.vacancyId === input.vacancyId && a.candidateId === input.candidateId
      )
      if (duplicate) return err('Candidate already applied to this vacancy')
      all.push(application)
      writeCollection(KEYS.applications, all)
      return ok(application)
    } catch (e) {
      return err(`createApplication failed: ${String(e)}`)
    }
  }

  async updateApplicationStatus(
    id: string,
    status: VacancyStatus
  ): Promise<DataResult<Application>> {
    try {
      const all = readCollection<Application>(KEYS.applications)
      const idx = all.findIndex((a) => a.id === id)
      if (idx === -1) return err(`Application ${id} not found`)
      const updated: Application = { ...all[idx], status, updatedAt: now() }
      all[idx] = updated
      writeCollection(KEYS.applications, all)
      return ok(updated)
    } catch (e) {
      return err(`updateApplicationStatus failed: ${String(e)}`)
    }
  }

  // ── Interviews ─────────────────────────────────────────────────────────────

  async getInterviews(candidateId?: string): Promise<DataResult<Interview[]>> {
    try {
      const all = readCollection<Interview>(KEYS.interviews)
      const result = candidateId ? all.filter((i) => i.candidateId === candidateId) : all

      // Hydrate scorecard field
      const scorecards = readCollection<Scorecard>(KEYS.scorecards)
      const scorecardMap = new Map(scorecards.map((s) => [s.interviewId, s]))
      const hydrated = result.map((i) => ({
        ...i,
        scorecard: scorecardMap.get(i.id),
      }))
      return ok(hydrated)
    } catch (e) {
      return err(`getInterviews failed: ${String(e)}`)
    }
  }

  async createInterview(input: CreateInterviewInput): Promise<DataResult<Interview>> {
    try {
      const interview: Interview = {
        ...input,
        id: generateId(),
      }
      const all = readCollection<Interview>(KEYS.interviews)
      all.push(interview)
      writeCollection(KEYS.interviews, all)
      return ok(interview)
    } catch (e) {
      return err(`createInterview failed: ${String(e)}`)
    }
  }

  async updateInterview(id: string, input: UpdateInterviewInput): Promise<DataResult<Interview>> {
    try {
      const all = readCollection<Interview>(KEYS.interviews)
      const idx = all.findIndex((i) => i.id === id)
      if (idx === -1) return err(`Interview ${id} not found`)
      const updated: Interview = { ...all[idx], ...input }
      all[idx] = updated
      writeCollection(KEYS.interviews, all)
      return ok(updated)
    } catch (e) {
      return err(`updateInterview failed: ${String(e)}`)
    }
  }

  // ── Scorecards ─────────────────────────────────────────────────────────────

  async createScorecard(input: CreateScorecardInput): Promise<DataResult<Scorecard>> {
    try {
      // Only one scorecard per interview
      const all = readCollection<Scorecard>(KEYS.scorecards)
      const existing = all.find((s) => s.interviewId === input.interviewId)
      if (existing) return err('Scorecard already exists for this interview')

      const scorecard: Scorecard = {
        ...input,
        id: generateId(),
        createdAt: now(),
      }
      all.push(scorecard)
      writeCollection(KEYS.scorecards, all)
      return ok(scorecard)
    } catch (e) {
      return err(`createScorecard failed: ${String(e)}`)
    }
  }

  // ── Templates ──────────────────────────────────────────────────────────────

  async getTemplates(tenantId: string): Promise<DataResult<MessageTemplate[]>> {
    try {
      const all = readCollection<MessageTemplate>(KEYS.templates)
      return ok(all.filter((t) => t.tenantId === tenantId || t.isDefault))
    } catch (e) {
      return err(`getTemplates failed: ${String(e)}`)
    }
  }

  async createTemplate(input: CreateTemplateInput): Promise<DataResult<MessageTemplate>> {
    try {
      const template: MessageTemplate = {
        ...input,
        id: generateId(),
        createdAt: now(),
      }
      const all = readCollection<MessageTemplate>(KEYS.templates)
      all.push(template)
      writeCollection(KEYS.templates, all)
      return ok(template)
    } catch (e) {
      return err(`createTemplate failed: ${String(e)}`)
    }
  }

  async updateTemplate(
    id: string,
    input: UpdateTemplateInput
  ): Promise<DataResult<MessageTemplate>> {
    try {
      const all = readCollection<MessageTemplate>(KEYS.templates)
      const idx = all.findIndex((t) => t.id === id)
      if (idx === -1) return err(`Template ${id} not found`)
      const updated: MessageTemplate = { ...all[idx], ...input }
      all[idx] = updated
      writeCollection(KEYS.templates, all)
      return ok(updated)
    } catch (e) {
      return err(`updateTemplate failed: ${String(e)}`)
    }
  }

  async deleteTemplate(id: string): Promise<DataResult<void>> {
    try {
      const all = readCollection<MessageTemplate>(KEYS.templates)
      writeCollection(KEYS.templates, all.filter((t) => t.id !== id))
      return ok(undefined)
    } catch (e) {
      return err(`deleteTemplate failed: ${String(e)}`)
    }
  }

  // ── Integrations ───────────────────────────────────────────────────────────

  async getIntegrations(tenantId: string): Promise<DataResult<Integration[]>> {
    try {
      const all = readCollection<Integration>(KEYS.integrations)
      return ok(all.filter((i) => i.tenantId === tenantId))
    } catch (e) {
      return err(`getIntegrations failed: ${String(e)}`)
    }
  }

  async saveIntegration(input: CreateIntegrationInput): Promise<DataResult<Integration>> {
    try {
      const all = readCollection<Integration>(KEYS.integrations)
      // Upsert: replace existing integration for same tenant + platform
      const existingIdx = all.findIndex(
        (i) => i.tenantId === input.tenantId && i.platform === input.platform
      )
      const integration: Integration = {
        ...input,
        id: existingIdx !== -1 ? all[existingIdx].id : generateId(),
        createdAt: existingIdx !== -1 ? all[existingIdx].createdAt : now(),
      }
      if (existingIdx !== -1) {
        all[existingIdx] = integration
      } else {
        all.push(integration)
      }
      writeCollection(KEYS.integrations, all)
      return ok(integration)
    } catch (e) {
      return err(`saveIntegration failed: ${String(e)}`)
    }
  }

  async deleteIntegration(id: string): Promise<DataResult<void>> {
    try {
      const all = readCollection<Integration>(KEYS.integrations)
      writeCollection(KEYS.integrations, all.filter((i) => i.id !== id))
      return ok(undefined)
    } catch (e) {
      return err(`deleteIntegration failed: ${String(e)}`)
    }
  }

  // ── Sync helpers (for client-side React state initialization) ──────────────

  getVacanciesSync(): Vacancy[] {
    return readCollection<Vacancy>(KEYS.vacancies)
  }

  getCandidatesSync(): Candidate[] {
    return readCollection<Candidate>(KEYS.candidates)
  }

  getApplicationsSync(): Application[] {
    return readCollection<Application>(KEYS.applications)
  }

  getInterviewsSync(): Interview[] {
    return readCollection<Interview>(KEYS.interviews)
  }

  getTemplatesSync(): MessageTemplate[] {
    return readCollection<MessageTemplate>(KEYS.templates)
  }

  getIntegrationsSync(): Integration[] {
    return readCollection<Integration>(KEYS.integrations)
  }

  // Convenience alias for createIntegration (same as saveIntegration but accepts full object)
  createIntegration(integration: Integration): void {
    const all = readCollection<Integration>(KEYS.integrations)
    all.push(integration)
    writeCollection(KEYS.integrations, all)
  }

  // Convenience: update template by passing full object
  updateTemplateObj(template: MessageTemplate): void {
    const all = readCollection<MessageTemplate>(KEYS.templates)
    const idx = all.findIndex((t) => t.id === template.id)
    if (idx !== -1) {
      all[idx] = template
      writeCollection(KEYS.templates, all)
    }
  }

  // Convenience: create template from full object
  createTemplateObj(template: MessageTemplate): void {
    const all = readCollection<MessageTemplate>(KEYS.templates)
    all.push(template)
    writeCollection(KEYS.templates, all)
  }
}
