import { getResend, FROM_EMAIL } from './client'
import {
  welcomeEmailHtml,
  interviewScheduledEmailHtml,
  stageChangedEmailHtml,
  systemUpdateEmailHtml,
  type WelcomeEmailData,
  type InterviewScheduledEmailData,
  type StageChangedEmailData,
  type SystemUpdateEmailData,
} from './templates'
import { createAdminClient } from '@/lib/supabase/server'

type SendResult = { ok: true; resendId?: string } | { ok: false; error: string }

function isEmailEnabled(): boolean {
  return !!process.env.RESEND_API_KEY
}

async function logEmail(
  emailType: string,
  recipientEmail: string,
  recipientName: string | undefined,
  subject: string,
  status: 'sent' | 'failed',
  resendId: string | undefined,
  errorMessage: string | undefined,
  tenantId?: string,
  userId?: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  try {
    const adminClient = createAdminClient()
    await adminClient.from('email_logs').insert({
      email_type: emailType,
      recipient_email: recipientEmail,
      recipient_name: recipientName,
      subject,
      status,
      resend_id: resendId,
      error_message: errorMessage,
      tenant_id: tenantId,
      user_id: userId,
      metadata: metadata ? JSON.stringify(metadata) : null,
    })
  } catch (error) {
    console.error('[Email Logging] Error logging email:', error)
  }
}

export async function sendWelcomeEmail(
  data: WelcomeEmailData & { userId?: string; tenantId?: string }
): Promise<SendResult> {
  const subject = `¡Bienvenido/a a ConectAr Talento, ${data.fullName.split(' ')[0]}!`

  if (!isEmailEnabled()) {
    await logEmail('welcome', data.email, data.fullName, subject, 'sent', undefined, undefined, data.tenantId, data.userId)
    return { ok: true }
  }

  try {
    const resend = getResend()
    const { data: result, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: data.email,
      subject,
      html: welcomeEmailHtml(data),
    })

    if (error) {
      await logEmail('welcome', data.email, data.fullName, subject, 'failed', undefined, error.message, data.tenantId, data.userId)
      return { ok: false, error: error.message }
    }

    await logEmail('welcome', data.email, data.fullName, subject, 'sent', result?.id, undefined, data.tenantId, data.userId)
    return { ok: true, resendId: result?.id }
  } catch (e) {
    const errorMsg = String(e)
    await logEmail('welcome', data.email, data.fullName, subject, 'failed', undefined, errorMsg, data.tenantId, data.userId)
    return { ok: false, error: errorMsg }
  }
}

export async function sendInterviewScheduledEmail(
  data: InterviewScheduledEmailData & { replyTo?: string; userId?: string; tenantId?: string; interviewId?: string }
): Promise<SendResult> {
  const subject = `Entrevista programada: ${data.vacancyTitle} en ${data.companyName}`

  if (!isEmailEnabled()) {
    await logEmail('interview_scheduled', data.candidateEmail, data.candidateName, subject, 'sent', undefined, undefined, data.tenantId, data.userId, { interviewId: data.interviewId })
    return { ok: true }
  }

  try {
    const resend = getResend()
    const { data: result, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: data.candidateEmail,
      ...(data.replyTo ? { replyTo: data.replyTo } : {}),
      subject,
      html: interviewScheduledEmailHtml(data),
    })

    if (error) {
      await logEmail('interview_scheduled', data.candidateEmail, data.candidateName, subject, 'failed', undefined, error.message, data.tenantId, data.userId, { interviewId: data.interviewId })
      return { ok: false, error: error.message }
    }

    await logEmail('interview_scheduled', data.candidateEmail, data.candidateName, subject, 'sent', result?.id, undefined, data.tenantId, data.userId, { interviewId: data.interviewId })
    return { ok: true, resendId: result?.id }
  } catch (e) {
    const errorMsg = String(e)
    await logEmail('interview_scheduled', data.candidateEmail, data.candidateName, subject, 'failed', undefined, errorMsg, data.tenantId, data.userId, { interviewId: data.interviewId })
    return { ok: false, error: errorMsg }
  }
}

export async function sendSystemUpdateEmail(
  to: string,
  data: SystemUpdateEmailData & { userId?: string; tenantId?: string; recipientName?: string }
): Promise<SendResult> {
  const count = data.updates.length
  const subject = count === 1
    ? `Novedad en ConectAr Talento: ${data.updates[0].title}`
    : `${count} novedades nuevas en ConectAr Talento`

  if (!isEmailEnabled()) {
    await logEmail('system_update', to, data.recipientName, subject, 'sent', undefined, undefined, data.tenantId, data.userId, { updateCount: count })
    return { ok: true }
  }

  try {
    const resend = getResend()
    const { data: result, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html: systemUpdateEmailHtml(data),
    })

    if (error) {
      await logEmail('system_update', to, data.recipientName, subject, 'failed', undefined, error.message, data.tenantId, data.userId, { updateCount: count })
      return { ok: false, error: error.message }
    }

    await logEmail('system_update', to, data.recipientName, subject, 'sent', result?.id, undefined, data.tenantId, data.userId, { updateCount: count })
    return { ok: true, resendId: result?.id }
  } catch (e) {
    const errorMsg = String(e)
    await logEmail('system_update', to, data.recipientName, subject, 'failed', undefined, errorMsg, data.tenantId, data.userId, { updateCount: count })
    return { ok: false, error: errorMsg }
  }
}

export async function sendStageChangedEmail(
  data: StageChangedEmailData & { candidateEmail: string; replyTo?: string; userId?: string; tenantId?: string; applicationId?: string }
): Promise<SendResult> {
  const isRejection =
    data.newStage.toLowerCase().includes('rechaz') ||
    data.newStage.toLowerCase().includes('descart')
  const subject = isRejection
    ? `Actualización sobre tu postulación en ${data.companyName}`
    : `¡Avanzaste en el proceso! ${data.vacancyTitle} — ${data.companyName}`

  if (!isEmailEnabled()) {
    await logEmail('stage_changed', data.candidateEmail, data.candidateName, subject, 'sent', undefined, undefined, data.tenantId, data.userId, { applicationId: data.applicationId, newStage: data.newStage })
    return { ok: true }
  }

  try {
    const resend = getResend()
    const { data: result, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: data.candidateEmail,
      ...(data.replyTo ? { replyTo: data.replyTo } : {}),
      subject,
      html: stageChangedEmailHtml(data),
    })

    if (error) {
      await logEmail('stage_changed', data.candidateEmail, data.candidateName, subject, 'failed', undefined, error.message, data.tenantId, data.userId, { applicationId: data.applicationId, newStage: data.newStage })
      return { ok: false, error: error.message }
    }

    await logEmail('stage_changed', data.candidateEmail, data.candidateName, subject, 'sent', result?.id, undefined, data.tenantId, data.userId, { applicationId: data.applicationId, newStage: data.newStage })
    return { ok: true, resendId: result?.id }
  } catch (e) {
    const errorMsg = String(e)
    await logEmail('stage_changed', data.candidateEmail, data.candidateName, subject, 'failed', undefined, errorMsg, data.tenantId, data.userId, { applicationId: data.applicationId, newStage: data.newStage })
    return { ok: false, error: errorMsg }
  }
}
