import { getResend, FROM_EMAIL } from './client'
import {
  welcomeEmailHtml,
  interviewScheduledEmailHtml,
  stageChangedEmailHtml,
  type WelcomeEmailData,
  type InterviewScheduledEmailData,
  type StageChangedEmailData,
} from './templates'

type SendResult = { ok: true } | { ok: false; error: string }

function isEmailEnabled(): boolean {
  return !!process.env.RESEND_API_KEY
}

export async function sendWelcomeEmail(data: WelcomeEmailData): Promise<SendResult> {
  if (!isEmailEnabled()) return { ok: true }
  try {
    const resend = getResend()
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: data.email,
      subject: `¡Bienvenido/a a ConectAr Talento, ${data.fullName.split(' ')[0]}!`,
      html: welcomeEmailHtml(data),
    })
    if (error) return { ok: false, error: error.message }
    return { ok: true }
  } catch (e) {
    return { ok: false, error: String(e) }
  }
}

export async function sendInterviewScheduledEmail(
  data: InterviewScheduledEmailData
): Promise<SendResult> {
  if (!isEmailEnabled()) return { ok: true }
  try {
    const resend = getResend()
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: data.candidateEmail,
      subject: `Entrevista programada: ${data.vacancyTitle} en ${data.companyName}`,
      html: interviewScheduledEmailHtml(data),
    })
    if (error) return { ok: false, error: error.message }
    return { ok: true }
  } catch (e) {
    return { ok: false, error: String(e) }
  }
}

export async function sendStageChangedEmail(data: StageChangedEmailData & { candidateEmail: string }): Promise<SendResult> {
  if (!isEmailEnabled()) return { ok: true }
  try {
    const resend = getResend()
    const isRejection =
      data.newStage.toLowerCase().includes('rechaz') ||
      data.newStage.toLowerCase().includes('descart')
    const subject = isRejection
      ? `Actualización sobre tu postulación en ${data.companyName}`
      : `¡Avanzaste en el proceso! ${data.vacancyTitle} — ${data.companyName}`
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: data.candidateEmail,
      subject,
      html: stageChangedEmailHtml(data),
    })
    if (error) return { ok: false, error: error.message }
    return { ok: true }
  } catch (e) {
    return { ok: false, error: String(e) }
  }
}
