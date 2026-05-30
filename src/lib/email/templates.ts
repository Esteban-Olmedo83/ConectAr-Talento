const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ??
  'https://conect-ar-talento-esteban-olmedo83s-projects.vercel.app'

const ACCENT = '#5D50D6'
const BG = '#0B0B14'
const TEXT = '#ffffff'
const TEXT_SECONDARY = 'rgba(255,255,255,0.6)'
const CARD_BG = '#13131F'
const BORDER = 'rgba(255,255,255,0.08)'

function baseTemplate(title: string, previewText: string, bodyHtml: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <meta name="description" content="${previewText}" />
  <!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
</head>
<body style="margin:0;padding:0;background-color:${BG};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:${TEXT};">
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${previewText}</div>
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${BG};min-height:100vh;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;">
          <!-- Header -->
          <tr>
            <td style="padding-bottom:32px;text-align:center;">
              <a href="${APP_URL}" style="text-decoration:none;">
                <span style="color:${ACCENT};font-size:22px;font-weight:700;letter-spacing:-0.5px;">ConectAr</span>
                <span style="color:${TEXT};font-size:22px;font-weight:700;letter-spacing:-0.5px;"> Talento</span>
              </a>
            </td>
          </tr>
          <!-- Content card -->
          <tr>
            <td style="background-color:${CARD_BG};border:1px solid ${BORDER};border-radius:16px;padding:40px 36px;">
              ${bodyHtml}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding-top:28px;text-align:center;color:${TEXT_SECONDARY};font-size:13px;line-height:1.6;">
              <p style="margin:0 0 8px;">© 2026 ConectAr Talento. Todos los derechos reservados.</p>
              <p style="margin:0;">
                <a href="${APP_URL}" style="color:${ACCENT};text-decoration:none;">Abrir aplicación</a>
                &nbsp;·&nbsp;
                <a href="${APP_URL}/privacy" style="color:${TEXT_SECONDARY};text-decoration:none;">Privacidad</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

// ── Welcome email ──────────────────────────────────────────────────────────────

export interface WelcomeEmailData {
  fullName: string
  companyName: string
  email: string
}

export function welcomeEmailHtml(data: WelcomeEmailData): string {
  const firstName = data.fullName.split(' ')[0] ?? data.fullName
  const body = `
    <h1 style="margin:0 0 12px;font-size:26px;font-weight:700;color:${TEXT};line-height:1.2;">
      ¡Bienvenido/a, ${firstName}! 👋
    </h1>
    <p style="margin:0 0 24px;font-size:15px;color:${TEXT_SECONDARY};line-height:1.6;">
      Tu cuenta de <strong style="color:${TEXT};">${data.companyName}</strong> en ConectAr Talento
      ya está activa. Empezá a reclutar con IA hoy mismo.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
      <tr>
        <td style="background:rgba(93,80,214,0.12);border:1px solid rgba(93,80,214,0.25);border-radius:10px;padding:20px 24px;">
          <p style="margin:0 0 12px;font-size:13px;color:${TEXT_SECONDARY};font-weight:500;text-transform:uppercase;letter-spacing:1px;">Lo que podés hacer</p>
          <ul style="margin:0;padding-left:20px;color:${TEXT};font-size:14px;line-height:2;">
            <li>Subir CVs y analizarlos con IA en segundos</li>
            <li>Gestionar tu pipeline de candidatos por etapas</li>
            <li>Generar descripciones de puestos con un clic</li>
            <li>Programar entrevistas y generar reportes automáticos</li>
          </ul>
        </td>
      </tr>
    </table>

    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
      <tr>
        <td align="center">
          <a href="${APP_URL}/pipeline"
             style="display:inline-block;background-color:${ACCENT};color:${TEXT};text-decoration:none;
                    font-size:15px;font-weight:600;padding:14px 32px;border-radius:8px;letter-spacing:0.2px;">
            Ir al dashboard →
          </a>
        </td>
      </tr>
    </table>

    <p style="margin:0;font-size:13px;color:${TEXT_SECONDARY};line-height:1.6;border-top:1px solid ${BORDER};padding-top:20px;">
      Si tenés alguna pregunta, respondé este email o escribinos directamente.
      Estamos para ayudarte a encontrar el mejor talento.
    </p>
  `
  return baseTemplate(
    `Bienvenido/a a ConectAr Talento, ${firstName}`,
    `Tu cuenta de ${data.companyName} está lista. Empezá a reclutar con IA.`,
    body
  )
}

// ── Interview scheduled email ─────────────────────────────────────────────────

export interface InterviewScheduledEmailData {
  candidateName: string
  candidateEmail: string
  vacancyTitle: string
  companyName: string
  scheduledAt: Date
  interviewerName: string
  meetingPlatform?: string
  meetingLink?: string
  interviewType: string
}

export function interviewScheduledEmailHtml(data: InterviewScheduledEmailData): string {
  const dateStr = data.scheduledAt.toLocaleDateString('es-AR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  const timeStr = data.scheduledAt.toLocaleTimeString('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  })
  const platformLabel = data.meetingPlatform
    ? data.meetingPlatform.charAt(0).toUpperCase() + data.meetingPlatform.slice(1)
    : 'Virtual'

  const meetingButton = data.meetingLink
    ? `<a href="${data.meetingLink}"
         style="display:inline-block;background-color:${ACCENT};color:${TEXT};text-decoration:none;
                font-size:15px;font-weight:600;padding:14px 32px;border-radius:8px;">
         Unirse a la entrevista →
       </a>`
    : ''

  const body = `
    <h1 style="margin:0 0 12px;font-size:24px;font-weight:700;color:${TEXT};line-height:1.2;">
      Entrevista programada 📅
    </h1>
    <p style="margin:0 0 24px;font-size:15px;color:${TEXT_SECONDARY};line-height:1.6;">
      Hola <strong style="color:${TEXT};">${data.candidateName}</strong>,
      te confirmamos que tenés una entrevista programada para el puesto de
      <strong style="color:${TEXT};">${data.vacancyTitle}</strong>
      en <strong style="color:${TEXT};">${data.companyName}</strong>.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
      <tr>
        <td style="background:rgba(93,80,214,0.12);border:1px solid rgba(93,80,214,0.25);border-radius:10px;padding:24px;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="padding-bottom:12px;">
                <span style="font-size:12px;color:${TEXT_SECONDARY};text-transform:uppercase;letter-spacing:1px;">Fecha y hora</span><br/>
                <span style="font-size:15px;color:${TEXT};font-weight:600;">${dateStr}</span><br/>
                <span style="font-size:15px;color:${TEXT};">${timeStr}</span>
              </td>
            </tr>
            <tr>
              <td style="padding-bottom:12px;border-top:1px solid ${BORDER};padding-top:12px;">
                <span style="font-size:12px;color:${TEXT_SECONDARY};text-transform:uppercase;letter-spacing:1px;">Modalidad</span><br/>
                <span style="font-size:15px;color:${TEXT};font-weight:600;">${data.interviewType} · ${platformLabel}</span>
              </td>
            </tr>
            <tr>
              <td style="border-top:1px solid ${BORDER};padding-top:12px;">
                <span style="font-size:12px;color:${TEXT_SECONDARY};text-transform:uppercase;letter-spacing:1px;">Entrevistador/a</span><br/>
                <span style="font-size:15px;color:${TEXT};font-weight:600;">${data.interviewerName}</span>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    ${meetingButton ? `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;"><tr><td align="center">${meetingButton}</td></tr></table>` : ''}

    <p style="margin:0;font-size:13px;color:${TEXT_SECONDARY};line-height:1.6;border-top:1px solid ${BORDER};padding-top:20px;">
      Si tenés alguna pregunta sobre la entrevista, escribinos respondiendo este mail.
    </p>
  `
  return baseTemplate(
    `Entrevista programada: ${data.vacancyTitle} en ${data.companyName}`,
    `Tenés una entrevista el ${dateStr} a las ${timeStr} para el puesto ${data.vacancyTitle}.`,
    body
  )
}

// ── Stage change (advance / reject) ────────────────────────────────────────────

export interface StageChangedEmailData {
  candidateName: string
  vacancyTitle: string
  companyName: string
  newStage: string
  recruiterMessage?: string
}

export function stageChangedEmailHtml(data: StageChangedEmailData): string {
  const isRejection =
    data.newStage.toLowerCase().includes('rechaz') ||
    data.newStage.toLowerCase().includes('descart')

  const headline = isRejection
    ? 'Actualización sobre tu postulación'
    : `¡Avanzaste en el proceso! 🎉`

  const intro = isRejection
    ? `Hola <strong style="color:${TEXT};">${data.candidateName}</strong>, queremos agradecerte por tu interés en el puesto de
       <strong style="color:${TEXT};">${data.vacancyTitle}</strong> en <strong style="color:${TEXT};">${data.companyName}</strong>.
       Luego de evaluar tu perfil, hemos decidido avanzar con otros candidatos en esta oportunidad.`
    : `Hola <strong style="color:${TEXT};">${data.candidateName}</strong>, tenemos buenas noticias.
       Tu postulación para el puesto de <strong style="color:${TEXT};">${data.vacancyTitle}</strong>
       en <strong style="color:${TEXT};">${data.companyName}</strong> avanzó a la siguiente etapa:
       <strong style="color:${ACCENT};">${data.newStage}</strong>.`

  const messageBlock = data.recruiterMessage
    ? `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:20px 0;">
         <tr>
           <td style="background:rgba(255,255,255,0.04);border-left:3px solid ${ACCENT};border-radius:0 8px 8px 0;padding:16px 20px;">
             <p style="margin:0 0 4px;font-size:12px;color:${TEXT_SECONDARY};text-transform:uppercase;letter-spacing:1px;">Mensaje del reclutador</p>
             <p style="margin:0;font-size:14px;color:${TEXT};line-height:1.6;">${data.recruiterMessage}</p>
           </td>
         </tr>
       </table>`
    : ''

  const closing = isRejection
    ? 'Te deseamos mucho éxito en tu búsqueda laboral. ¡Seguí adelante!'
    : 'Pronto recibirás más novedades. ¡Muchos éxitos!'

  const body = `
    <h1 style="margin:0 0 12px;font-size:24px;font-weight:700;color:${TEXT};line-height:1.2;">
      ${headline}
    </h1>
    <p style="margin:0 0 24px;font-size:15px;color:${TEXT_SECONDARY};line-height:1.6;">
      ${intro}
    </p>
    ${messageBlock}
    <p style="margin:0 0 24px;font-size:14px;color:${TEXT_SECONDARY};line-height:1.6;">
      ${closing}
    </p>
    <p style="margin:0;font-size:13px;color:${TEXT_SECONDARY};line-height:1.6;border-top:1px solid ${BORDER};padding-top:20px;">
      Este email fue enviado por <strong style="color:${TEXT};">${data.companyName}</strong> vía ConectAr Talento.
    </p>
  `
  return baseTemplate(
    `${isRejection ? 'Actualización de tu postulación' : 'Avanzaste en el proceso'}: ${data.vacancyTitle}`,
    `${isRejection ? 'Actualización sobre tu postulación' : `Avanzaste a: ${data.newStage}`} en ${data.companyName}.`,
    body
  )
}
