import { NextRequest, NextResponse } from 'next/server'
import { extractCvText } from '@/lib/cv/extract-text'

export const runtime = 'nodejs'

interface AnalyzeCvRequest {
  cvText: string
  vacancyRequirements?: string[]
}

interface AnalyzeCvResponse {
  fullName: string
  email: string
  phone?: string
  atsScore: number
  skills: string[]
  experienceYears?: number
  education?: string
  strengths: string[]
  gaps: string[]
  summary: string
}

const FILENAME_STOP_WORDS = new Set([
  'cv',
  'curriculum',
  'curriculo',
  'resume',
  'generalista',
  'analistaderrhh',
  'analistade',
  'rrhh',
  'pdf',
  'htalsl',
  'htal',
  'sl',
])

const SKILL_KEYWORDS = [
  'Recruiting',
  'Selección',
  'Entrevistas',
  'Onboarding',
  'Capacitación',
  'Payroll',
  'Compensaciones',
  'Legajos',
  'Administración',
  'Office',
  'Excel',
  'Word',
  'PowerPoint',
  'Google Sheets',
  'Google Drive',
  'SAP',
  'Tango',
  'Bejerman',
  'Softland',
  'LinkedIn Recruiter',
  'ATS',
  'Búsqueda',
  'Evaluaciones psicotécnicas',
  'Psicología',
  'RRHH',
  'Recursos Humanos',
  'Customer Service',
  'Atención al cliente',
  'Comunicación',
  'Organización',
  'Trabajo en equipo',
  'Resolución de problemas',
]

function uniq(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))]
}

function extractEmail(text: string): string {
  const match = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)
  return match?.[0]?.trim() ?? ''
}

function extractPhone(text: string): string | undefined {
  const match = text.match(/(?:\+?\d[\d\s().-]{7,}\d)/)
  return match?.[0]?.replace(/\s+/g, ' ').trim() || undefined
}

function extractFullName(text: string): string {
  const lines = text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 12)

  const blocked = ['curriculum', 'cv', 'perfil', 'contacto', 'datos', 'experiencia', 'educacion']

  for (const line of lines) {
    const normalized = line.toLowerCase()
    if (blocked.some((word) => normalized.includes(word))) continue

    const words = line.replace(/[|•·,:;()]/g, ' ').split(/\s+/).filter(Boolean)
    if (words.length < 2 || words.length > 5) continue
    if (words.some((word) => /\d/.test(word))) continue
    if (words.every((word) => /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ'-]+$/.test(word))) {
      return words.map((word) => word[0] + word.slice(1).toLowerCase()).join(' ')
    }
  }

  return 'Nombre no identificado'
}

function titleCaseName(value: string): string {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.length === 1 ? word.toUpperCase() : word[0] + word.slice(1).toLowerCase())
    .join(' ')
}

function extractNameFromFilename(fileName?: string): string | undefined {
  if (!fileName) return undefined

  let base = fileName
    .replace(/\.[^.]+$/, '')
    .replace(/[_.,()[\]-]+/g, ' ')
    .replace(/([a-záéíóúñ])([A-ZÁÉÍÓÚÑ])/g, '$1 $2')
    .replace(/\s+/g, ' ')
    .trim()

  for (const stopWord of FILENAME_STOP_WORDS) {
    base = base.replace(new RegExp(stopWord, 'ig'), ' ')
  }

  base = base.replace(/\s+/g, ' ').trim()

  const words = base
    .split(' ')
    .map((word) => word.trim())
    .filter((word) => {
      const normalized = word.toLowerCase()
      if (!normalized) return false
      if (/^\d+$/.test(normalized)) return false
      if (FILENAME_STOP_WORDS.has(normalized)) return false
      return /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+$/.test(word)
    })
    .slice(0, 4)

  if (words.length < 2) return undefined
  return titleCaseName(words.join(' '))
}

function isLikelyCandidateName(value: string): boolean {
  if (!value || value === 'Nombre no identificado') return false

  const normalized = value.toLowerCase()
  const blockedTerms = ['curriculum', 'formacion', 'formación', 'academica', 'académica', 'habilidades', 'experiencia', 'educacion', 'educación', 'datos', 'referencias']
  if (blockedTerms.some((term) => normalized.includes(term))) return false

  const words = value.split(/\s+/).filter(Boolean)
  if (words.length < 2 || words.length > 4) return false
  if (['en', 'de', 'la', 'el', 'los', 'las', 'y'].includes(words[0].toLowerCase())) return false
  if (words.some((word) => /\d/.test(word))) return false

  return true
}

function resolveFullName(text: string, fileName?: string): string {
  const detected = extractFullName(text)
  if (isLikelyCandidateName(detected)) return detected

  const fileNameCandidate = extractNameFromFilename(fileName)
  if (isLikelyCandidateName(fileNameCandidate ?? '')) return fileNameCandidate as string

  return detected
}

function extractExperienceYears(text: string): number | undefined {
  const explicit = text.match(/(\d{1,2})\s*(?:años|anos)\s+de\s+experiencia/i)
  if (explicit) return Number(explicit[1])

  const years = [...text.matchAll(/\b(19|20)\d{2}\b/g)].map((match) => Number(match[0]))
  if (years.length >= 2) {
    const min = Math.min(...years)
    const max = Math.max(...years)
    const diff = max - min
    if (diff >= 1 && diff <= 45) return diff
  }

  return undefined
}

function extractEducation(text: string): string | undefined {
  const lines = text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)

  const keywords = ['lic', 'tecnic', 'univers', 'psicolog', 'master', 'posgrado', 'bachiller']
  const found = lines.find((line) => keywords.some((keyword) => line.toLowerCase().includes(keyword)))
  return found || undefined
}

function extractSkills(text: string): string[] {
  const lower = text.toLowerCase()
  return uniq(
    SKILL_KEYWORDS.filter((skill) => lower.includes(skill.toLowerCase())).slice(0, 15)
  )
}

function calculateHeuristicScore(skills: string[], experienceYears?: number, education?: string, requirements?: string[]): number {
  let score = 35

  score += Math.min(skills.length * 4, 28)
  score += Math.min((experienceYears ?? 0) * 3, 18)
  if (education) score += 8

  if (requirements?.length) {
    const lowerSkills = skills.map((skill) => skill.toLowerCase())
    const matches = requirements.filter((requirement) =>
      lowerSkills.some((skill) => requirement.toLowerCase().includes(skill) || skill.includes(requirement.toLowerCase()))
    ).length
    if (requirements.length > 0) {
      score += Math.round((matches / requirements.length) * 15)
    }
  }

  return Math.max(0, Math.min(100, score))
}

function buildFallbackAnalysis(cvText: string, vacancyRequirements?: string[], fileName?: string): AnalyzeCvResponse {
  const fullName = resolveFullName(cvText, fileName)
  const email = extractEmail(cvText)
  const phone = extractPhone(cvText)
  const skills = extractSkills(cvText)
  const experienceYears = extractExperienceYears(cvText)
  const education = extractEducation(cvText)
  const atsScore = calculateHeuristicScore(skills, experienceYears, education, vacancyRequirements)

  const strengths = uniq([
    skills.length ? `Muestra experiencia en ${skills.slice(0, 3).join(', ')}` : '',
    experienceYears ? `${experienceYears} años aproximados de experiencia detectados` : '',
    education ? 'Incluye formación académica relevante' : '',
  ]).slice(0, 3)

  const gaps = uniq([
    email ? '' : 'No se pudo detectar un email claro en el CV',
    phone ? '' : 'No se pudo detectar un teléfono claro en el CV',
    skills.length >= 4 ? '' : 'El CV muestra pocas skills explícitas para una evaluación automática',
  ]).slice(0, 3)

  return {
    fullName,
    email,
    phone,
    atsScore,
    skills,
    experienceYears,
    education,
    strengths,
    gaps,
    summary: `Análisis automático de respaldo para ${fullName}. Se detectaron ${skills.length || 'pocas'} skills explícitas${experienceYears ? ` y aproximadamente ${experienceYears} años de experiencia` : ''}.`,
  }
}

function buildPrompt(cvText: string, vacancyRequirements?: string[]): string {
  const requirementsSection =
    vacancyRequirements && vacancyRequirements.length > 0
      ? `\n\nREQUISITOS DE LA VACANTE (para calcular el ATS score):\n${vacancyRequirements.map((r) => `- ${r}`).join('\n')}`
      : ''

  return `Eres un sistema ATS (Applicant Tracking System) experto en análisis de CVs para el mercado latinoamericano.

Analiza el siguiente CV y extrae la información estructurada. Responde ÚNICAMENTE con un objeto JSON válido, sin markdown, sin texto adicional.${requirementsSection}

CV A ANALIZAR:
---
${cvText}
---

INSTRUCCIONES:
1. Extrae el nombre completo, email y teléfono del candidato.
2. Identifica todas las habilidades técnicas y blandas mencionadas.
3. Calcula los años totales de experiencia laboral relevante.
4. Identifica el nivel de educación más alto alcanzado.
5. Calcula el ATS score (0-100):
   ${
     vacancyRequirements && vacancyRequirements.length > 0
       ? '- Basa el score en qué tan bien las habilidades del candidato coinciden con los requisitos de la vacante.\n   - 85-100: Excelente match (≥80% de requisitos cubiertos)\n   - 70-84: Buen match (60-79% cubiertos)\n   - 50-69: Match regular (40-59% cubiertos)\n   - 30-49: Match bajo (20-39% cubiertos)\n   - 0-29: Muy bajo match (<20% cubiertos)'
       : '- Basa el score en la calidad general del CV: experiencia, habilidades, educación, claridad.'
   }
6. Identifica 2-3 fortalezas principales del candidato.
7. Identifica 1-3 brechas o áreas de mejora.
8. Escribe un resumen profesional en español de 2-3 oraciones.

FORMATO JSON REQUERIDO:
{
  "fullName": "string",
  "email": "string",
  "phone": "string o null",
  "atsScore": número entre 0 y 100,
  "skills": ["array de strings"],
  "experienceYears": número o null,
  "education": "string o null",
  "strengths": ["array de 2-3 strings"],
  "gaps": ["array de 1-3 strings"],
  "summary": "string"
}`
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const contentType = request.headers.get('content-type') ?? ''
    let cvText = ''
    let vacancyRequirements: string[] | undefined
    let sourceFileName: string | undefined

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData()
      const file = formData.get('file')
      const rawRequirements = formData.get('vacancyRequirements')

      if (!(file instanceof File)) {
        return NextResponse.json({ error: 'No se recibió ningún archivo de CV.' }, { status: 400 })
      }

      sourceFileName = file.name

      try {
        cvText = await extractCvText(file)
      } catch (error) {
        const message = error instanceof Error
          ? error.message
          : 'No se pudo extraer texto del CV.'

        return NextResponse.json({ error: message }, { status: 400 })
      }

      if (typeof rawRequirements === 'string' && rawRequirements.trim()) {
        try {
          const parsed = JSON.parse(rawRequirements) as unknown
          vacancyRequirements = Array.isArray(parsed)
            ? parsed.map((item) => String(item)).filter(Boolean)
            : undefined
        } catch {
          vacancyRequirements = undefined
        }
      }
    } else {
      const body = (await request.json()) as AnalyzeCvRequest
      cvText = body.cvText
      vacancyRequirements = body.vacancyRequirements
    }

    if (!cvText || cvText.trim().length < 50) {
      return NextResponse.json({ error: 'El texto del CV es demasiado corto o está vacío.' }, { status: 400 })
    }

    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) {
      return NextResponse.json(buildFallbackAnalysis(cvText, vacancyRequirements, sourceFileName))
    }

    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: 'Responde siempre con JSON valido y sin markdown.' },
          { role: 'user', content: buildPrompt(cvText, vacancyRequirements) },
        ],
        temperature: 0.2,
        max_tokens: 1024,
      }),
    })

    if (!groqRes.ok) {
      const errorText = await groqRes.text()
      console.error('Groq API error:', errorText)
      return NextResponse.json(buildFallbackAnalysis(cvText, vacancyRequirements, sourceFileName))
    }

    const groqData = await groqRes.json()
    const rawText: string = groqData.choices?.[0]?.message?.content ?? ''

    if (!rawText) {
      return NextResponse.json({ error: 'Respuesta vacía de Groq.' }, { status: 502 })
    }

    const jsonMatch = rawText.match(/\{[\s\S]*\}/)
    const jsonText = jsonMatch ? jsonMatch[0] : rawText

    let parsed: AnalyzeCvResponse
    try {
      parsed = JSON.parse(jsonText) as AnalyzeCvResponse
    } catch {
      console.error('JSON parse error. Raw text:', rawText)
      return NextResponse.json(buildFallbackAnalysis(cvText, vacancyRequirements, sourceFileName))
    }

    return NextResponse.json({
      fullName: String(parsed.fullName ?? '').trim() || 'Nombre no identificado',
      email: String(parsed.email ?? '').trim(),
      phone: parsed.phone ? String(parsed.phone).trim() : undefined,
      atsScore: Math.min(100, Math.max(0, Number(parsed.atsScore) || 0)),
      skills: Array.isArray(parsed.skills) ? parsed.skills.map((s) => String(s)).filter(Boolean) : [],
      experienceYears: typeof parsed.experienceYears === 'number' ? parsed.experienceYears : undefined,
      education: parsed.education ? String(parsed.education).trim() : undefined,
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths.map((s) => String(s)).filter(Boolean) : [],
      gaps: Array.isArray(parsed.gaps) ? parsed.gaps.map((s) => String(s)).filter(Boolean) : [],
      summary: String(parsed.summary ?? '').trim(),
    })
  } catch (error) {
    console.error('analyze-cv route error:', error)
    return NextResponse.json({ error: 'Error interno del servidor al analizar el CV.' }, { status: 500 })
  }
}
