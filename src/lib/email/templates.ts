const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ??
  'https://www.conectartalento.com'

const ACCENT = '#5D50D6'
const ACCENT2 = '#8B7EFF'
const BG = '#0B0B14'
const TEXT = '#ffffff'
const TEXT_SECONDARY = 'rgba(255,255,255,0.6)'
const CARD_BG = '#13131F'
const BORDER = 'rgba(255,255,255,0.08)'

const TYPE_BADGE: Record<string, { label: string; color: string; emoji: string }> = {
  fix:         { label: 'Fix',       color: '#f87171', emoji: '🔧' },
  feature:     { label: 'Novedad',   color: '#34d399', emoji: '✨' },
  improvement: { label: 'Mejora',    color: '#60a5fa', emoji: '⚡' },
  security:    { label: 'Seguridad', color: '#fbbf24', emoji: '🔒' },
}

// ── Client-branded base template (for candidate-facing emails) ─────────────────
//
// Shows the client's logo and name at the top. ConectAr Talento appears only
// in the small footer so candidates associate the email with the hiring company.
//
interface ClientBranding {
  name: string
  logoUrl?: string | null
  website?: string | null
}

function clientTemplate(client: ClientBranding, title: string, previewText: string, bodyHtml: string): string {
  const initials = client.name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
  const logoSection = client.logoUrl
    ? `<img src="${client.logoUrl}" alt="${client.name}" height="48"
           style="max-width:200px;height:48px;object-fit:contain;display:block;" />`
    : `<div style="display:inline-block;background:linear-gradient(135deg,${ACCENT},${ACCENT2});
               color:#fff;font-size:18px;font-weight:800;width:48px;height:48px;
               border-radius:12px;line-height:48px;text-align:center;">${initials}</div>`

  const websiteHref = client.website
    ? (client.website.startsWith('http') ? client.website : `https://${client.website}`)
    : APP_URL

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <meta name="description" content="${previewText}" />
</head>
<body style="margin:0;padding:0;background-color:${BG};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:${TEXT};">
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${previewText}</div>
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${BG};min-height:100vh;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;">
          <!-- Client header -->
          <tr>
            <td style="padding-bottom:28px;text-align:center;">
              <a href="${websiteHref}" style="text-decoration:none;display:inline-block;">
                ${logoSection}
              </a>
              <p style="margin:10px 0 0;font-size:16px;font-weight:700;color:${TEXT};">${client.name}</p>
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
            <td style="padding-top:24px;text-align:center;color:rgba(255,255,255,0.2);font-size:12px;line-height:1.6;">
              <p style="margin:0 0 4px;">
                Enviado por <strong style="color:rgba(255,255,255,0.3);">${client.name}</strong>
                &nbsp;·&nbsp;
                Gestionado con <a href="${APP_URL}" style="color:rgba(93,80,214,0.7);text-decoration:none;">ConectAr Talento</a>
              </p>
              <p style="margin:0;">
                <a href="${APP_URL}/privacy" style="color:rgba(255,255,255,0.15);text-decoration:none;">Privacidad</a>
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

// ── ConectAr Talento base template (for recruiter-facing emails) ───────────────

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

// ── Sistema de Novedades (recruiter-facing, ConectAr branded) ──────────────────

export interface SystemUpdateEmailData {
  recipientName: string
  updates: { id: string; title: string; description: string; type: string }[]
  unsubscribeUrl?: string
}

export function systemUpdateEmailHtml(data: SystemUpdateEmailData): string {
  const logoUrl = `${APP_URL}/logo-transparent.png`
  const novedadesUrl = `${APP_URL}/novedades`

  const updateCards = data.updates.map(u => {
    const meta = TYPE_BADGE[u.type] ?? { label: u.type, color: '#9ca3af', emoji: '📌' }
    return `
      <tr>
        <td style="background:#0d0d1a;border:1px solid rgba(93,80,214,0.2);border-radius:12px;padding:18px 20px;margin-bottom:12px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding-bottom:8px;">
                <span style="display:inline-block;background:${meta.color}1a;color:${meta.color};font-size:10px;font-weight:700;padding:3px 10px;border-radius:99px;text-transform:uppercase;letter-spacing:1px;">${meta.emoji} ${meta.label}</span>
              </td>
            </tr>
            <tr>
              <td style="padding-bottom:6px;">
                <p style="margin:0;font-size:15px;font-weight:800;color:#e2e8f0;">${u.title}</p>
              </td>
            </tr>
            <tr>
              <td>
                <p style="margin:0;font-size:13px;color:#64748b;line-height:1.65;">${u.description}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr><td style="height:10px;"></td></tr>
    `
  }).join('')

  const unsubscribeRow = data.unsubscribeUrl
    ? `<span style="color:rgba(255,255,255,0.15);">&nbsp;·&nbsp;</span>
       <a href="${data.unsubscribeUrl}" style="color:rgba(255,255,255,0.25);text-decoration:none;font-size:11px;">Desuscribirse</a>`
    : ''

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Novedades del sistema — ConectAr Talento</title>
  <meta name="description" content="Hay novedades en tu plataforma de reclutamiento" />
</head>
<body style="margin:0;padding:0;background-color:${BG};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;">${data.updates.length} novedad${data.updates.length !== 1 ? 'es' : ''} nueva${data.updates.length !== 1 ? 's' : ''} en ConectAr Talento</div>
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${BG};min-height:100vh;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background:#0d0d1a;border-radius:20px;overflow:hidden;border:1px solid rgba(93,80,214,0.2);">

          <!-- Barra superior gradiente -->
          <tr>
            <td style="background:linear-gradient(90deg,${ACCENT},${ACCENT2},#e879f9);height:4px;font-size:1px;line-height:1px;">&nbsp;</td>
          </tr>

          <!-- Header con logo real -->
          <tr>
            <td style="padding:24px 36px 0;border-bottom:1px solid rgba(93,80,214,0.12);">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td valign="middle">
                    <a href="${APP_URL}" style="text-decoration:none;display:inline-flex;align-items:center;gap:10px;">
                      <img src="${logoUrl}" alt="ConectAr Talento" width="36" height="36" style="border-radius:9px;display:inline-block;vertical-align:middle;" />
                      <span style="font-size:15px;font-weight:800;color:#e2e8f0;vertical-align:middle;margin-left:8px;">ConectAr <span style="color:${ACCENT2};">Talento</span></span>
                    </a>
                  </td>
                </tr>
              </table>
              <div style="height:20px;"></div>
            </td>
          </tr>

          <!-- Cuerpo -->
          <tr>
            <td style="padding:32px 36px;">
              <p style="margin:0 0 4px;font-size:13px;color:${ACCENT2};font-weight:600;">Hola, ${data.recipientName} 👋</p>
              <h1 style="margin:0 0 20px;font-size:24px;font-weight:900;color:#fff;line-height:1.2;">Tenemos novedades para vos</h1>

              <!-- Cards de actualizaciones -->
              <table width="100%" cellpadding="0" cellspacing="0">
                ${updateCards}
              </table>

              <!-- CTA -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:8px;">
                <tr>
                  <td align="center">
                    <a href="${novedadesUrl}" style="display:inline-block;background:rgba(93,80,214,0.15);border:1px solid rgba(93,80,214,0.4);color:${ACCENT2};text-decoration:none;font-size:13px;font-weight:700;padding:13px 32px;border-radius:10px;">Ver todas las novedades →</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 36px 28px;border-top:1px solid rgba(255,255,255,0.05);text-align:center;">
              <p style="margin:0 0 6px;font-size:11px;color:rgba(255,255,255,0.2);">ConectAr Talento · ATS para reclutadores de LATAM</p>
              <p style="margin:0;font-size:11px;">
                <a href="${APP_URL}" style="color:${ACCENT};text-decoration:none;">Plataforma</a>
                ${unsubscribeRow}
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

// ── Welcome email (recruiter-facing, ConectAr branded) ────────────────────────

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

// ── Interview scheduled email (candidate-facing, client branded) ──────────────

export interface InterviewScheduledEmailData {
  candidateName: string
  candidateEmail: string
  vacancyTitle: string
  companyName: string
  companyLogoUrl?: string | null
  companyWebsite?: string | null
  scheduledAt: Date
  interviewerName: string
  meetingPlatform?: string
  meetingLink?: string
  interviewType: string
  interviewAddress?: string | null
  arrivalDetails?: string | null
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

  const locationRow = data.interviewAddress
    ? `<tr>
         <td style="border-top:1px solid ${BORDER};padding-top:12px;padding-bottom:12px;">
           <span style="font-size:12px;color:${TEXT_SECONDARY};text-transform:uppercase;letter-spacing:1px;">Dirección</span><br/>
           <span style="font-size:15px;color:${TEXT};font-weight:600;">${data.interviewAddress}</span>
           ${data.arrivalDetails ? `<br/><span style="font-size:13px;color:${TEXT_SECONDARY};">${data.arrivalDetails}</span>` : ''}
         </td>
       </tr>`
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
              <td style="border-top:1px solid ${BORDER};padding-top:12px;padding-bottom:12px;">
                <span style="font-size:12px;color:${TEXT_SECONDARY};text-transform:uppercase;letter-spacing:1px;">Entrevistador/a</span><br/>
                <span style="font-size:15px;color:${TEXT};font-weight:600;">${data.interviewerName}</span>
              </td>
            </tr>
            ${locationRow}
          </table>
        </td>
      </tr>
    </table>

    ${meetingButton ? `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;"><tr><td align="center">${meetingButton}</td></tr></table>` : ''}

    <p style="margin:0;font-size:13px;color:${TEXT_SECONDARY};line-height:1.6;border-top:1px solid ${BORDER};padding-top:20px;">
      Si tenés alguna pregunta sobre la entrevista, respondé este mail.
    </p>
  `

  return clientTemplate(
    { name: data.companyName, logoUrl: data.companyLogoUrl, website: data.companyWebsite },
    `Entrevista programada: ${data.vacancyTitle} en ${data.companyName}`,
    `Tenés una entrevista el ${dateStr} a las ${timeStr} para el puesto ${data.vacancyTitle}.`,
    body
  )
}

// ── Stage change (advance / reject) — candidate-facing, client branded ─────────

export interface StageChangedEmailData {
  candidateName: string
  vacancyTitle: string
  companyName: string
  companyLogoUrl?: string | null
  companyWebsite?: string | null
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
             <p style="margin:0 0 4px;font-size:12px;color:${TEXT_SECONDARY};text-transform:uppercase;letter-spacing:1px;">Mensaje</p>
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
    <p style="margin:0;font-size:14px;color:${TEXT_SECONDARY};line-height:1.6;">
      ${closing}
    </p>
  `

  return clientTemplate(
    { name: data.companyName, logoUrl: data.companyLogoUrl, website: data.companyWebsite },
    `${isRejection ? 'Actualización de tu postulación' : 'Avanzaste en el proceso'}: ${data.vacancyTitle}`,
    `${isRejection ? 'Actualización sobre tu postulación' : `Avanzaste a: ${data.newStage}`} en ${data.companyName}.`,
    body
  )
}
