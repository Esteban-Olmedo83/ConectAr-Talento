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
  VacancyModality,
  VacancyPriority,
  CandidateSource,
  InterviewType,
  InterviewStatus,
  MeetingPlatform,
  Recommendation,
  TemplateChannel,
  TemplateCategory,
  IntegrationPlatform,
  IntegrationStatus,
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

// ─── Sheet names ──────────────────────────────────────────────────────────────

const SHEETS = {
  vacancies: 'Vacantes',
  candidates: 'Candidatos',
  applications: 'Aplicaciones',
  interviews: 'Entrevistas',
  scorecards: 'Scorecards',
  templates: 'Templates',
  integrations: 'Integraciones',
} as const

// ─── Column definitions ───────────────────────────────────────────────────────
// Order matters — it maps to spreadsheet column positions (A, B, C…)

const VACANCY_COLS = [
  'id', 'tenantId', 'title', 'department', 'status', 'description',
  'requirements', 'salaryMin', 'salaryMax', 'currency', 'location',
  'modality', 'priority', 'publishedAt', 'closingDate', 'createdBy', 'createdAt',
] as const

const CANDIDATE_COLS = [
  'id', 'tenantId', 'fullName', 'email', 'phone', 'avatarUrl', 'cvUrl',
  'cvFileName', 'atsScore', 'skills', 'experienceYears', 'education',
  'source', 'notes', 'appliedAt', 'createdAt',
] as const

const APPLICATION_COLS = [
  'id', 'vacancyId', 'candidateId', 'status', 'positionInStage', 'appliedAt', 'updatedAt',
] as const

const INTERVIEW_COLS = [
  'id', 'candidateId', 'vacancyId', 'scheduledAt', 'type', 'interviewerName',
  'interviewerEmail', 'status', 'meetingPlatform', 'meetingLink', 'notes',
] as const

const SCORECARD_COLS = [
  'id', 'interviewId', 'overallRating', 'technicalSkills', 'communication',
  'culturalFit', 'strengths', 'weaknesses', 'recommendation', 'aiSummary', 'notes', 'createdAt',
] as const

const TEMPLATE_COLS = [
  'id', 'tenantId', 'name', 'channel', 'category', 'subject',
  'body', 'variables', 'isDefault', 'createdAt',
] as const

const INTEGRATION_COLS = [
  'id', 'tenantId', 'platform', 'accountName', 'accountEmail',
  'status', 'expiresAt', 'metadata', 'createdAt',
] as const

// ─── Raw row type (all strings from Sheets API) ───────────────────────────────

type RawRow = string[]

// ─── Helper utilities ─────────────────────────────────────────────────────────

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

function nowIso(): string {
  return new Date().toISOString()
}

function ok<T>(data: T): DataResult<T> {
  return { data, error: null }
}

function err<T>(message: string): DataResult<T> {
  return { data: null, error: message }
}

function safeParseJson<T>(raw: string | undefined, fallback: T): T {
  if (!raw || raw.trim() === '') return fallback
  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function boolFromStr(val: string | undefined): boolean {
  return val === 'true' || val === '1'
}

function numFromStr(val: string | undefined): number | undefined {
  if (!val || val.trim() === '') return undefined
  const n = Number(val)
  return isNaN(n) ? undefined : n
}

function strOrUndef(val: string | undefined): string | undefined {
  return val && val.trim() !== '' ? val : undefined
}

// ─── Row ↔ Object mappers ─────────────────────────────────────────────────────

function rowToVacancy(row: RawRow): Vacancy {
  const [
    id, tenantId, title, department, status, description,
    requirements, salaryMin, salaryMax, currency, location,
    modality, priority, publishedAt, closingDate, createdBy, createdAt,
  ] = row
  return {
    id,
    tenantId,
    title,
    department,
    status: status as VacancyStatus,
    description: strOrUndef(description),
    requirements: safeParseJson<string[]>(requirements, []),
    salaryMin: numFromStr(salaryMin),
    salaryMax: numFromStr(salaryMax),
    currency: strOrUndef(currency),
    location: strOrUndef(location),
    modality: modality as VacancyModality,
    priority: priority as VacancyPriority,
    publishedAt: strOrUndef(publishedAt),
    closingDate: strOrUndef(closingDate),
    createdBy: strOrUndef(createdBy),
    createdAt,
    applications: [],
  }
}

function vacancyToRow(v: Vacancy): RawRow {
  return [
    v.id,
    v.tenantId,
    v.title,
    v.department,
    v.status,
    v.description ?? '',
    JSON.stringify(v.requirements),
    v.salaryMin !== undefined ? String(v.salaryMin) : '',
    v.salaryMax !== undefined ? String(v.salaryMax) : '',
    v.currency ?? '',
    v.location ?? '',
    v.modality,
    v.priority,
    v.publishedAt ?? '',
    v.closingDate ?? '',
    v.createdBy ?? '',
    v.createdAt,
  ]
}

function rowToCandidate(row: RawRow): Candidate {
  const [
    id, tenantId, fullName, email, phone, avatarUrl, cvUrl,
    cvFileName, atsScore, skills, experienceYears, education,
    source, notes, appliedAt, createdAt,
  ] = row
  return {
    id,
    tenantId,
    fullName,
    email,
    phone: strOrUndef(phone),
    avatarUrl: strOrUndef(avatarUrl),
    cvUrl: strOrUndef(cvUrl),
    cvFileName: strOrUndef(cvFileName),
    atsScore: numFromStr(atsScore),
    skills: safeParseJson<string[]>(skills, []),
    experienceYears: numFromStr(experienceYears),
    education: strOrUndef(education),
    source: source as CandidateSource,
    notes: strOrUndef(notes),
    interviews: [],
    appliedAt,
    createdAt,
  }
}

function candidateToRow(c: Candidate): RawRow {
  return [
    c.id,
    c.tenantId,
    c.fullName,
    c.email,
    c.phone ?? '',
    c.avatarUrl ?? '',
    c.cvUrl ?? '',
    c.cvFileName ?? '',
    c.atsScore !== undefined ? String(c.atsScore) : '',
    JSON.stringify(c.skills),
    c.experienceYears !== undefined ? String(c.experienceYears) : '',
    c.education ?? '',
    c.source,
    c.notes ?? '',
    c.appliedAt,
    c.createdAt,
  ]
}

function rowToApplication(row: RawRow): Application {
  const [id, vacancyId, candidateId, status, positionInStage, appliedAt, updatedAt] = row
  return {
    id,
    vacancyId,
    candidateId,
    status: status as VacancyStatus,
    positionInStage: Number(positionInStage) || 0,
    appliedAt,
    updatedAt,
  }
}

function applicationToRow(a: Application): RawRow {
  return [
    a.id,
    a.vacancyId,
    a.candidateId,
    a.status,
    String(a.positionInStage),
    a.appliedAt,
    a.updatedAt,
  ]
}

function rowToInterview(row: RawRow): Interview {
  const [
    id, candidateId, vacancyId, scheduledAt, type, interviewerName,
    interviewerEmail, status, meetingPlatform, meetingLink, notes,
  ] = row
  return {
    id,
    candidateId,
    vacancyId,
    scheduledAt,
    type: type as InterviewType,
    interviewerName,
    interviewerEmail: strOrUndef(interviewerEmail),
    status: status as InterviewStatus,
    meetingPlatform: meetingPlatform as MeetingPlatform,
    meetingLink: strOrUndef(meetingLink),
    notes: strOrUndef(notes),
  }
}

function interviewToRow(i: Interview): RawRow {
  return [
    i.id,
    i.candidateId,
    i.vacancyId,
    i.scheduledAt,
    i.type,
    i.interviewerName,
    i.interviewerEmail ?? '',
    i.status,
    i.meetingPlatform,
    i.meetingLink ?? '',
    i.notes ?? '',
  ]
}

function rowToScorecard(row: RawRow): Scorecard {
  const [
    id, interviewId, overallRating, technicalSkills, communication,
    culturalFit, strengths, weaknesses, recommendation, aiSummary, notes, createdAt,
  ] = row
  return {
    id,
    interviewId,
    overallRating: (Number(overallRating) || 3) as 1 | 2 | 3 | 4 | 5,
    technicalSkills: Number(technicalSkills) || 0,
    communication: Number(communication) || 0,
    culturalFit: Number(culturalFit) || 0,
    strengths,
    weaknesses,
    recommendation: recommendation as Recommendation,
    aiSummary: strOrUndef(aiSummary),
    notes: strOrUndef(notes),
    createdAt,
  }
}

function scorecardToRow(s: Scorecard): RawRow {
  return [
    s.id,
    s.interviewId,
    String(s.overallRating),
    String(s.technicalSkills),
    String(s.communication),
    String(s.culturalFit),
    s.strengths,
    s.weaknesses,
    s.recommendation,
    s.aiSummary ?? '',
    s.notes ?? '',
    s.createdAt,
  ]
}

function rowToTemplate(row: RawRow): MessageTemplate {
  const [
    id, tenantId, name, channel, category, subject,
    body, variables, isDefault, createdAt,
  ] = row
  return {
    id,
    tenantId,
    name,
    channel: channel as TemplateChannel,
    category: category as TemplateCategory,
    subject: strOrUndef(subject),
    body,
    variables: safeParseJson<string[]>(variables, []),
    isDefault: boolFromStr(isDefault),
    createdAt,
  }
}

function templateToRow(t: MessageTemplate): RawRow {
  return [
    t.id,
    t.tenantId,
    t.name,
    t.channel,
    t.category,
    t.subject ?? '',
    t.body,
    JSON.stringify(t.variables),
    String(t.isDefault),
    t.createdAt,
  ]
}

function rowToIntegration(row: RawRow): Integration {
  const [
    id, tenantId, platform, accountName, accountEmail,
    status, expiresAt, metadata, createdAt,
  ] = row
  return {
    id,
    tenantId,
    platform: platform as IntegrationPlatform,
    accountName,
    accountEmail: strOrUndef(accountEmail),
    status: status as IntegrationStatus,
    expiresAt: strOrUndef(expiresAt),
    metadata: safeParseJson<Record<string, unknown>>(metadata, {}),
    createdAt,
  }
}

function integrationToRow(i: Integration): RawRow {
  return [
    i.id,
    i.tenantId,
    i.platform,
    i.accountName,
    i.accountEmail ?? '',
    i.status,
    i.expiresAt ?? '',
    i.metadata ? JSON.stringify(i.metadata) : '',
    i.createdAt,
  ]
}

// ─── Sheets API response types ────────────────────────────────────────────────

interface SheetsValuesResponse {
  values?: string[][]
}

interface BatchUpdateRequest {
  deleteDimension: {
    range: {
      sheetId: number
      dimension: 'ROWS'
      startIndex: number
      endIndex: number
    }
  }
}

interface SpreadsheetMetaResponse {
  sheets: Array<{
    properties: {
      title: string
      sheetId: number
    }
  }>
}

// ─── GoogleSheetsProvider ─────────────────────────────────────────────────────

export class GoogleSheetsProvider implements DataProvider {
  private readonly baseUrl = 'https://sheets.googleapis.com/v4/spreadsheets'
  private readonly accessToken: string
  private readonly spreadsheetId: string

  // Cached sheetId → numeric id map (needed for batchUpdate delete)
  private sheetIdCache: Map<string, number> = new Map()

  constructor(accessToken: string, spreadsheetId: string) {
    this.accessToken = accessToken
    this.spreadsheetId = spreadsheetId
  }

  // ─── Private HTTP helpers ────────────────────────────────────────────────

  private authHeaders(): HeadersInit {
    return {
      Authorization: `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json',
    }
  }

  private async readSheet(sheetName: string): Promise<string[][]> {
    const encodedSheet = encodeURIComponent(sheetName)
    const url = `${this.baseUrl}/${this.spreadsheetId}/values/${encodedSheet}`
    const res = await fetch(url, { headers: this.authHeaders() })
    if (!res.ok) {
      const text = await res.text()
      throw new Error(`readSheet(${sheetName}) HTTP ${res.status}: ${text}`)
    }
    const json = (await res.json()) as SheetsValuesResponse
    const rows = json.values ?? []
    // Skip header row (index 0) — data starts at index 1
    return rows.length > 1 ? rows.slice(1) : []
  }

  private async appendRow(sheetName: string, values: RawRow): Promise<void> {
    const encodedSheet = encodeURIComponent(sheetName)
    const url =
      `${this.baseUrl}/${this.spreadsheetId}/values/${encodedSheet}:append` +
      `?valueInputOption=RAW&insertDataOption=INSERT_ROWS`
    const body = JSON.stringify({ values: [values] })
    const res = await fetch(url, { method: 'POST', headers: this.authHeaders(), body })
    if (!res.ok) {
      const text = await res.text()
      throw new Error(`appendRow(${sheetName}) HTTP ${res.status}: ${text}`)
    }
  }

  private async updateRow(sheetName: string, rowIndex: number, values: RawRow): Promise<void> {
    // rowIndex is 0-based data index; header is row 1, so data row 0 = sheet row 2
    const sheetRow = rowIndex + 2
    const colCount = values.length
    const endCol = String.fromCharCode(64 + colCount) // A=65, so col count → letter
    const range = `${sheetName}!A${sheetRow}:${endCol}${sheetRow}`
    const encodedRange = encodeURIComponent(range)
    const url =
      `${this.baseUrl}/${this.spreadsheetId}/values/${encodedRange}` +
      `?valueInputOption=RAW`
    const body = JSON.stringify({ values: [values] })
    const res = await fetch(url, { method: 'PUT', headers: this.authHeaders(), body })
    if (!res.ok) {
      const text = await res.text()
      throw new Error(`updateRow(${sheetName}, row ${sheetRow}) HTTP ${res.status}: ${text}`)
    }
  }

  private async getNumericSheetId(sheetName: string): Promise<number> {
    if (this.sheetIdCache.has(sheetName)) {
      return this.sheetIdCache.get(sheetName)!
    }
    const url = `${this.baseUrl}/${this.spreadsheetId}?fields=sheets.properties`
    const res = await fetch(url, { headers: this.authHeaders() })
    if (!res.ok) {
      const text = await res.text()
      throw new Error(`getNumericSheetId HTTP ${res.status}: ${text}`)
    }
    const meta = (await res.json()) as SpreadsheetMetaResponse
    for (const sheet of meta.sheets) {
      this.sheetIdCache.set(sheet.properties.title, sheet.properties.sheetId)
    }
    const numericId = this.sheetIdCache.get(sheetName)
    if (numericId === undefined) {
      throw new Error(`Sheet "${sheetName}" not found in spreadsheet`)
    }
    return numericId
  }

  private async deleteRow(sheetName: string, rowIndex: number): Promise<void> {
    // rowIndex is 0-based data index; header is row 0, so data row 0 = dimension index 1
    const dimensionIndex = rowIndex + 1
    const sheetId = await this.getNumericSheetId(sheetName)
    const url = `${this.baseUrl}/${this.spreadsheetId}:batchUpdate`
    const request: BatchUpdateRequest = {
      deleteDimension: {
        range: {
          sheetId,
          dimension: 'ROWS',
          startIndex: dimensionIndex,
          endIndex: dimensionIndex + 1,
        },
      },
    }
    const body = JSON.stringify({ requests: [request] })
    const res = await fetch(url, { method: 'POST', headers: this.authHeaders(), body })
    if (!res.ok) {
      const text = await res.text()
      throw new Error(`deleteRow(${sheetName}, ${rowIndex}) HTTP ${res.status}: ${text}`)
    }
  }

  // ─── Vacancies ─────────────────────────────────────────────────────────────

  async getVacancies(tenantId: string): Promise<DataResult<Vacancy[]>> {
    try {
      const rows = await this.readSheet(SHEETS.vacancies)
      const vacancies = rows
        .filter((r) => r[1] === tenantId)
        .map(rowToVacancy)
      return ok(vacancies)
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
        createdAt: nowIso(),
      }
      await this.appendRow(SHEETS.vacancies, vacancyToRow(vacancy))
      return ok(vacancy)
    } catch (e) {
      return err(`createVacancy failed: ${String(e)}`)
    }
  }

  async updateVacancy(id: string, input: UpdateVacancyInput): Promise<DataResult<Vacancy>> {
    try {
      const rows = await this.readSheet(SHEETS.vacancies)
      const idx = rows.findIndex((r) => r[0] === id)
      if (idx === -1) return err(`Vacancy ${id} not found`)
      const existing = rowToVacancy(rows[idx])
      const updated: Vacancy = { ...existing, ...input }
      await this.updateRow(SHEETS.vacancies, idx, vacancyToRow(updated))
      return ok(updated)
    } catch (e) {
      return err(`updateVacancy failed: ${String(e)}`)
    }
  }

  async deleteVacancy(id: string): Promise<DataResult<void>> {
    try {
      const rows = await this.readSheet(SHEETS.vacancies)
      const idx = rows.findIndex((r) => r[0] === id)
      if (idx === -1) return err(`Vacancy ${id} not found`)
      await this.deleteRow(SHEETS.vacancies, idx)
      return ok(undefined)
    } catch (e) {
      return err(`deleteVacancy failed: ${String(e)}`)
    }
  }

  // ─── Candidates ────────────────────────────────────────────────────────────

  async getCandidates(tenantId: string): Promise<DataResult<Candidate[]>> {
    try {
      const rows = await this.readSheet(SHEETS.candidates)
      const candidates = rows
        .filter((r) => r[1] === tenantId)
        .map(rowToCandidate)
      return ok(candidates)
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
        createdAt: nowIso(),
      }
      await this.appendRow(SHEETS.candidates, candidateToRow(candidate))
      return ok(candidate)
    } catch (e) {
      return err(`createCandidate failed: ${String(e)}`)
    }
  }

  async updateCandidate(id: string, input: UpdateCandidateInput): Promise<DataResult<Candidate>> {
    try {
      const rows = await this.readSheet(SHEETS.candidates)
      const idx = rows.findIndex((r) => r[0] === id)
      if (idx === -1) return err(`Candidate ${id} not found`)
      const existing = rowToCandidate(rows[idx])
      const updated: Candidate = { ...existing, ...input }
      await this.updateRow(SHEETS.candidates, idx, candidateToRow(updated))
      return ok(updated)
    } catch (e) {
      return err(`updateCandidate failed: ${String(e)}`)
    }
  }

  async deleteCandidate(id: string): Promise<DataResult<void>> {
    try {
      const rows = await this.readSheet(SHEETS.candidates)
      const idx = rows.findIndex((r) => r[0] === id)
      if (idx === -1) return err(`Candidate ${id} not found`)
      await this.deleteRow(SHEETS.candidates, idx)
      return ok(undefined)
    } catch (e) {
      return err(`deleteCandidate failed: ${String(e)}`)
    }
  }

  // ─── Applications ──────────────────────────────────────────────────────────

  async getApplications(vacancyId?: string): Promise<DataResult<Application[]>> {
    try {
      const rows = await this.readSheet(SHEETS.applications)
      const filtered = vacancyId ? rows.filter((r) => r[1] === vacancyId) : rows
      const applications = filtered.map(rowToApplication)
      return ok(applications)
    } catch (e) {
      return err(`getApplications failed: ${String(e)}`)
    }
  }

  async createApplication(input: CreateApplicationInput): Promise<DataResult<Application>> {
    try {
      const rows = await this.readSheet(SHEETS.applications)
      const duplicate = rows.find(
        (r) => r[1] === input.vacancyId && r[2] === input.candidateId
      )
      if (duplicate) return err('Candidate already applied to this vacancy')

      const application: Application = {
        ...input,
        id: generateId(),
        appliedAt: nowIso(),
        updatedAt: nowIso(),
      }
      await this.appendRow(SHEETS.applications, applicationToRow(application))
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
      const rows = await this.readSheet(SHEETS.applications)
      const idx = rows.findIndex((r) => r[0] === id)
      if (idx === -1) return err(`Application ${id} not found`)
      const existing = rowToApplication(rows[idx])
      const updated: Application = { ...existing, status, updatedAt: nowIso() }
      await this.updateRow(SHEETS.applications, idx, applicationToRow(updated))
      return ok(updated)
    } catch (e) {
      return err(`updateApplicationStatus failed: ${String(e)}`)
    }
  }

  // ─── Interviews ────────────────────────────────────────────────────────────

  async getInterviews(candidateId?: string): Promise<DataResult<Interview[]>> {
    try {
      const rows = await this.readSheet(SHEETS.interviews)
      const filtered = candidateId ? rows.filter((r) => r[1] === candidateId) : rows
      const interviews = filtered.map(rowToInterview)
      return ok(interviews)
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
      await this.appendRow(SHEETS.interviews, interviewToRow(interview))
      return ok(interview)
    } catch (e) {
      return err(`createInterview failed: ${String(e)}`)
    }
  }

  async updateInterview(id: string, input: UpdateInterviewInput): Promise<DataResult<Interview>> {
    try {
      const rows = await this.readSheet(SHEETS.interviews)
      const idx = rows.findIndex((r) => r[0] === id)
      if (idx === -1) return err(`Interview ${id} not found`)
      const existing = rowToInterview(rows[idx])
      const updated: Interview = { ...existing, ...input }
      await this.updateRow(SHEETS.interviews, idx, interviewToRow(updated))
      return ok(updated)
    } catch (e) {
      return err(`updateInterview failed: ${String(e)}`)
    }
  }

  // ─── Scorecards ────────────────────────────────────────────────────────────

  async createScorecard(input: CreateScorecardInput): Promise<DataResult<Scorecard>> {
    try {
      const rows = await this.readSheet(SHEETS.scorecards)
      const duplicate = rows.find((r) => r[1] === input.interviewId)
      if (duplicate) return err('Scorecard already exists for this interview')

      const scorecard: Scorecard = {
        ...input,
        id: generateId(),
        createdAt: nowIso(),
      }
      await this.appendRow(SHEETS.scorecards, scorecardToRow(scorecard))
      return ok(scorecard)
    } catch (e) {
      return err(`createScorecard failed: ${String(e)}`)
    }
  }

  // ─── Templates ─────────────────────────────────────────────────────────────

  async getTemplates(tenantId: string): Promise<DataResult<MessageTemplate[]>> {
    try {
      const rows = await this.readSheet(SHEETS.templates)
      const templates = rows
        .filter((r) => r[1] === tenantId || r[8] === 'true')
        .map(rowToTemplate)
      return ok(templates)
    } catch (e) {
      return err(`getTemplates failed: ${String(e)}`)
    }
  }

  async createTemplate(input: CreateTemplateInput): Promise<DataResult<MessageTemplate>> {
    try {
      const template: MessageTemplate = {
        ...input,
        id: generateId(),
        createdAt: nowIso(),
      }
      await this.appendRow(SHEETS.templates, templateToRow(template))
      return ok(template)
    } catch (e) {
      return err(`createTemplate failed: ${String(e)}`)
    }
  }

  async updateTemplate(id: string, input: UpdateTemplateInput): Promise<DataResult<MessageTemplate>> {
    try {
      const rows = await this.readSheet(SHEETS.templates)
      const idx = rows.findIndex((r) => r[0] === id)
      if (idx === -1) return err(`Template ${id} not found`)
      const existing = rowToTemplate(rows[idx])
      const updated: MessageTemplate = { ...existing, ...input }
      await this.updateRow(SHEETS.templates, idx, templateToRow(updated))
      return ok(updated)
    } catch (e) {
      return err(`updateTemplate failed: ${String(e)}`)
    }
  }

  async deleteTemplate(id: string): Promise<DataResult<void>> {
    try {
      const rows = await this.readSheet(SHEETS.templates)
      const idx = rows.findIndex((r) => r[0] === id)
      if (idx === -1) return err(`Template ${id} not found`)
      await this.deleteRow(SHEETS.templates, idx)
      return ok(undefined)
    } catch (e) {
      return err(`deleteTemplate failed: ${String(e)}`)
    }
  }

  // ─── Integrations ──────────────────────────────────────────────────────────

  async getIntegrations(tenantId: string): Promise<DataResult<Integration[]>> {
    try {
      const rows = await this.readSheet(SHEETS.integrations)
      const integrations = rows
        .filter((r) => r[1] === tenantId)
        .map(rowToIntegration)
      return ok(integrations)
    } catch (e) {
      return err(`getIntegrations failed: ${String(e)}`)
    }
  }

  async saveIntegration(input: CreateIntegrationInput): Promise<DataResult<Integration>> {
    try {
      const rows = await this.readSheet(SHEETS.integrations)
      const existingIdx = rows.findIndex(
        (r) => r[1] === input.tenantId && r[2] === input.platform
      )

      if (existingIdx !== -1) {
        const existing = rowToIntegration(rows[existingIdx])
        const updated: Integration = { ...existing, ...input }
        await this.updateRow(SHEETS.integrations, existingIdx, integrationToRow(updated))
        return ok(updated)
      }

      const integration: Integration = {
        ...input,
        id: generateId(),
        createdAt: nowIso(),
      }
      await this.appendRow(SHEETS.integrations, integrationToRow(integration))
      return ok(integration)
    } catch (e) {
      return err(`saveIntegration failed: ${String(e)}`)
    }
  }

  async deleteIntegration(id: string): Promise<DataResult<void>> {
    try {
      const rows = await this.readSheet(SHEETS.integrations)
      const idx = rows.findIndex((r) => r[0] === id)
      if (idx === -1) return err(`Integration ${id} not found`)
      await this.deleteRow(SHEETS.integrations, idx)
      return ok(undefined)
    } catch (e) {
      return err(`deleteIntegration failed: ${String(e)}`)
    }
  }
}

// ─── Column header exports (for sheet initialization) ────────────────────────
// Use these when creating the spreadsheet for the first time to write header rows.

export const SHEET_HEADERS = {
  [SHEETS.vacancies]: [...VACANCY_COLS],
  [SHEETS.candidates]: [...CANDIDATE_COLS],
  [SHEETS.applications]: [...APPLICATION_COLS],
  [SHEETS.interviews]: [...INTERVIEW_COLS],
  [SHEETS.scorecards]: [...SCORECARD_COLS],
  [SHEETS.templates]: [...TEMPLATE_COLS],
  [SHEETS.integrations]: [...INTEGRATION_COLS],
} as const
