'use client'

import * as React from 'react'
import { useSearchParams } from 'next/navigation'
import {
  Mail,
  MessageCircle,
  Video,
  Briefcase,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Plus,
  Trash2,
  RefreshCw,
  X,
  Loader2,
  Lock,
  Globe,
  ExternalLink,
  ChevronDown,
} from 'lucide-react'

/* LinkedIn pseudo-icon since lucide-react doesn't export Linkedin */
function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
    </svg>
  )
}
import { SupabaseProvider } from '@/lib/providers/supabase-provider'
import { useUser } from '@/lib/context/user-context'
import type { Integration, IntegrationPlatform, IntegrationStatus } from '@/types'

const PLAN_LIMITS: Record<string, number> = {
  free: 1,
  starter: 1,
  pro: 3,
  business: 5,
  enterprise: 999,
}

/* ─── status config ──────────────────────────────────────────── */
const STATUS_CONFIG: Record<IntegrationStatus, { label: string; icon: React.ReactNode; color: string }> = {
  connected: { label: 'Conectado', icon: <CheckCircle2 className="h-3.5 w-3.5" />, color: 'text-green-600 bg-green-100' },
  expired: { label: 'Expirado', icon: <AlertCircle className="h-3.5 w-3.5" />, color: 'text-amber-600 bg-amber-100' },
  error: { label: 'Error', icon: <XCircle className="h-3.5 w-3.5" />, color: 'text-red-600 bg-red-100' },
  pending: { label: 'Pendiente', icon: <Loader2 className="h-3.5 w-3.5 animate-spin" />, color: 'text-blue-600 bg-blue-100' },
}

/* ─── Toast notification ─────────────────────────────────────── */
const CONNECTED_LABELS: Record<string, string> = {
  linkedin: 'LinkedIn',
  google: 'Google (Gmail + Meet)',
  microsoft: 'Microsoft (Outlook + Teams)',
  zoom: 'Zoom',
  whatsapp: 'WhatsApp Business',
  meta: 'WhatsApp Business',
}

function SuccessToast({ platform, onClose }: { platform: string; onClose: () => void }) {
  const label = CONNECTED_LABELS[platform] ?? platform
  React.useEffect(() => {
    const t = setTimeout(onClose, 5000)
    return () => clearTimeout(t)
  }, [onClose])
  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-green-600 text-white px-4 py-3 rounded-xl shadow-xl animate-in slide-in-from-bottom-2">
      <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
      <span className="text-sm font-medium">{label} conectado correctamente</span>
      <button onClick={onClose} className="ml-2 p-0.5 hover:opacity-70 transition-opacity">
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

/* ─── ConnectedAccountRow ────────────────────────────────────── */
function ConnectedAccountRow({
  integration,
  onRemove,
  onReconnect,
}: {
  integration: Integration
  onRemove: (id: string) => void | Promise<void>
  onReconnect: (platform: IntegrationPlatform) => void
}) {
  const sc = STATUS_CONFIG[integration.status]
  return (
    <div className="flex items-center justify-between py-3 px-4 bg-muted/50 rounded-lg">
      <div className="flex items-center gap-3 min-w-0">
        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-foreground uppercase flex-shrink-0">
          {integration.accountName.slice(0, 2)}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground truncate">{integration.accountName}</p>
          {integration.accountEmail && (
            <p className="text-xs text-muted-foreground truncate">{integration.accountEmail}</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0 ml-2">
        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${sc.color}`}>
          {sc.icon}
          {sc.label}
        </span>
        {integration.status === 'expired' && (
          <button
            onClick={() => onReconnect(integration.platform)}
            className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
            title="Reconectar"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        )}
        <button
          onClick={() => onRemove(integration.id)}
          className="p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          title="Desconectar"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}

/* ─── Job board instructions per platform ────────────────────── */
const JOB_BOARD_INSTRUCTIONS: Record<string, { steps: string[]; apiKeyLabel: string; apiKeyHelp: string; apiKeyPlaceholder: string; contractNote?: string }> = {
  computrabajo: {
    steps: [
      'Iniciá sesión en tu cuenta de empresa en computrabajo.com',
      'Ir a Panel de control → Configuración → Integraciones API',
      'Solicitá acceso a la API Enterprise (requiere plan de publicación activo)',
      'Una vez aprobado, copiá tu API Key desde el panel',
    ],
    apiKeyLabel: 'API Key de Computrabajo',
    apiKeyHelp: 'La API key tiene formato largo (ej: CT-xxxx-xxxx-xxxx). Solo disponible en planes Enterprise.',
    apiKeyPlaceholder: 'CT-xxxx-xxxx-xxxx',
    contractNote: 'Computrabajo requiere un contrato enterprise activo para habilitar el acceso API. Contactá a tu ejecutivo de cuenta o escribí a api@computrabajo.com para solicitarlo.',
  },
  zonajobs: {
    steps: [
      'Iniciá sesión en tu cuenta empresa en zonajobs.com.ar',
      'Ir a Mi cuenta → Herramientas → Acceso API',
      'Completá el formulario de solicitud de acceso API (revisión en 3-5 días hábiles)',
      'Recibirás tu token por email una vez aprobado',
    ],
    apiKeyLabel: 'Token de API ZonaJobs',
    apiKeyHelp: 'El token tiene 40 caracteres. Solo disponible para cuentas con plan activo.',
    apiKeyPlaceholder: 'zj_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    contractNote: 'ZonaJobs no tiene API pública autodidacta. El acceso requiere aprobación manual del equipo comercial. Podés escribir a tecnologia@zonajobs.com.ar para acelerar el proceso.',
  },
  bumeran: {
    steps: [
      'Iniciá sesión en tu cuenta empresa en bumeran.com',
      'Ir a Configuración de empresa → API y Webhooks',
      'Solicitá tu API key (disponible solo para planes Premium y Enterprise)',
      'Copiá el token generado desde el panel de desarrolladores',
    ],
    apiKeyLabel: 'API Key de Bumeran',
    apiKeyHelp: 'Formato: bm_live_xxxxxxxxxxxx. Requiere plan Premium activo.',
    apiKeyPlaceholder: 'bm_live_xxxxxxxxxxxx',
    contractNote: 'Bumeran restringe el acceso API a clientes con plan Premium o Enterprise. Si no ves la opción en tu panel, contactá a soporte@bumeran.com o a tu ejecutivo de cuenta.',
  },
  occ: {
    steps: [
      'Iniciá sesión en tu cuenta empresa en occ.com.mx',
      'Ir a Administración → Integraciones → API',
      'Solicitá acceso API enviando un email a integraciones@occ.com.mx',
      'El equipo técnico de OCC te enviará las credenciales en 5-7 días hábiles',
    ],
    apiKeyLabel: 'API Key de OCC Mundial',
    apiKeyHelp: 'OCC entrega un Client ID y un Secret. Ingresá el Client ID aquí.',
    apiKeyPlaceholder: 'occ_client_xxxxxxxx',
    contractNote: 'OCC Mundial opera principalmente en México y requiere que tu empresa esté registrada con RFC mexicano para el acceso API comercial.',
  },
  indeed: {
    steps: [
      'Creá una cuenta de empleador en indeed.com/hire',
      'Ir a indeed.com/publisher para solicitar acceso al Publisher Program',
      'Completá la verificación de empresa (suele demorar 1-2 días)',
      'Desde el panel de Publisher, generá tu Publisher ID y API Key',
    ],
    apiKeyLabel: 'Publisher ID de Indeed',
    apiKeyHelp: 'El Publisher ID es un número de 8-12 dígitos que encontrás en tu panel de Publisher.',
    apiKeyPlaceholder: '1234567890',
    contractNote: 'Indeed requiere aprobación a través del Indeed Publisher Program. Las cuentas con pocos anuncios pueden ser rechazadas. Visitá indeed.com/publisher para más información.',
  },
  linkedin_jobs: {
    steps: [
      'Accedé a LinkedIn Talent Solutions como administrador de tu página de empresa',
      'Ir a linkedin.com/talent/api para solicitar acceso a la Talent Solutions API',
      'Completá el formulario de Partnership Application (proceso de 2-4 semanas)',
      'Una vez aprobado, generá el token desde el LinkedIn Developer Portal',
    ],
    apiKeyLabel: 'Access Token de LinkedIn Jobs',
    apiKeyHelp: 'El token OAuth 2.0 tiene formato largo. Obtenelo desde el LinkedIn Developer Portal bajo tu aplicación.',
    apiKeyPlaceholder: 'AQV...',
    contractNote: 'La API de LinkedIn Jobs está reservada para Talent Solutions Partners. El proceso de aprobación incluye revisión de caso de uso y firma de acuerdo de partnership. Para publicación de empleos masiva, considerá usar LinkedIn Recruiter System Connect (RSC).',
  },
  getonboard: {
    steps: [
      'Creá o iniciá sesión en tu cuenta empresa en getonbrd.com',
      'Ir a Configuración → API Keys',
      'Hacé click en "Generar nueva API Key"',
      'Copiá la key generada (solo se muestra una vez)',
    ],
    apiKeyLabel: 'API Key de GetOnBoard',
    apiKeyHelp: 'GetOnBoard tiene API pública REST. La key se genera instantáneamente desde tu panel.',
    apiKeyPlaceholder: 'gob_xxxxxxxxxxxxxxxx',
  },
  infojobs: {
    steps: [
      'Iniciá sesión en tu cuenta empresa en infojobs.net',
      'Ir a Área de empresa → Desarrolladores → API',
      'Registrá tu aplicación para obtener las credenciales OAuth',
      'Usá el Client ID como API Key aquí',
    ],
    apiKeyLabel: 'Client ID de InfoJobs',
    apiKeyHelp: 'InfoJobs usa OAuth 2.0. El Client ID lo obtenés al registrar tu app en el portal de desarrolladores de InfoJobs.',
    apiKeyPlaceholder: 'ij_client_xxxxxxxxxx',
  },
}

const DEFAULT_INSTRUCTIONS = {
  steps: [
    'Iniciá sesión en tu cuenta de empresa en el portal',
    'Buscá la sección de API o Integraciones en la configuración',
    'Solicitá o generá una API key',
    'Copiá la key e ingresala aquí',
  ],
  apiKeyLabel: 'API Key',
  apiKeyHelp: 'Ingresá la API key provista por el portal.',
  apiKeyPlaceholder: 'Ingresá tu API key',
}

/* ─── Job board modal ────────────────────────────────────────── */
function JobBoardModal({
  platform,
  name,
  onConnect,
  onClose,
}: {
  platform: IntegrationPlatform
  name: string
  onConnect: (platform: IntegrationPlatform, data: { accountName: string; accountEmail?: string; apiKey?: string }) => Promise<void>
  onClose: () => void
}) {
  const [apiKey, setApiKey] = React.useState('')
  const [accountEmail, setAccountEmail] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [showSteps, setShowSteps] = React.useState(true)

  const instructions = JOB_BOARD_INSTRUCTIONS[platform] ?? DEFAULT_INSTRUCTIONS

  async function handleSubmit() {
    setLoading(true)
    try {
      const res = await fetch('/api/integrations/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform,
          account_name: name,
          account_email: accountEmail || undefined,
          api_key: apiKey || undefined,
        }),
      })
      if (res.ok) {
        await onConnect(platform, { accountName: name, accountEmail: accountEmail || undefined, apiKey: apiKey || undefined })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)' }} className="rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5" style={{ borderBottom: '1px solid var(--border)' }}>
          <div>
            <h2 className="font-semibold" style={{ color: 'var(--text)', fontFamily: 'var(--font-nunito)' }}>Conectar {name}</h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>Integración mediante API key</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg transition-colors" style={{ color: 'var(--muted)' }}>
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Contract / access note */}
          {instructions.contractNote && (
            <div className="rounded-lg p-3 flex gap-2.5" style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)' }}>
              <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--gold)' }} />
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text)' }}>{instructions.contractNote}</p>
            </div>
          )}

          {/* Step-by-step instructions */}
          <div>
            <button
              onClick={() => setShowSteps(!showSteps)}
              className="flex items-center gap-2 text-xs font-medium mb-2 transition-colors"
              style={{ color: 'var(--accent-2)' }}
            >
              <ChevronDown className="h-3.5 w-3.5 transition-transform" style={{ transform: showSteps ? 'rotate(0deg)' : 'rotate(-90deg)' }} />
              Cómo obtener tu API key en {name}
            </button>
            {showSteps && (
              <ol className="space-y-2 rounded-lg p-3" style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}>
                {instructions.steps.map((step, i) => (
                  <li key={i} className="flex gap-2.5 text-xs" style={{ color: 'var(--text)' }}>
                    <span className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ background: 'var(--accent-soft)', color: 'var(--accent-2)' }}>
                      {i + 1}
                    </span>
                    <span className="leading-relaxed pt-0.5">{step}</span>
                  </li>
                ))}
              </ol>
            )}
          </div>

          {/* Form fields */}
          <div>
            <label className="text-xs font-medium uppercase tracking-wide block mb-1" style={{ color: 'var(--muted)' }}>
              Email de la cuenta
            </label>
            <input
              type="email"
              value={accountEmail}
              onChange={(e) => setAccountEmail(e.target.value)}
              placeholder="cuenta@empresa.com"
              className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none"
              style={{ background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)' }}
            />
          </div>
          <div>
            <label className="text-xs font-medium uppercase tracking-wide block mb-1" style={{ color: 'var(--muted)' }}>
              {instructions.apiKeyLabel}
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={instructions.apiKeyPlaceholder}
              className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none"
              style={{ background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)' }}
            />
            <p className="text-xs mt-1.5" style={{ color: 'var(--muted)' }}>{instructions.apiKeyHelp}</p>
          </div>

          <div className="flex items-center gap-2 text-xs rounded-lg p-3" style={{ background: 'var(--surface2)', color: 'var(--muted)' }}>
            <Lock className="h-3.5 w-3.5 flex-shrink-0" />
            <span>Tus credenciales se guardan encriptadas y nunca se comparten con terceros.</span>
          </div>
        </div>

        <div className="flex gap-2 justify-end p-5" style={{ borderTop: '1px solid var(--border)' }}>
          <button onClick={onClose} className="px-4 py-2 text-sm transition-colors" style={{ color: 'var(--muted)' }}>
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || (!apiKey && !accountEmail)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            style={{ background: 'var(--accent)', color: '#fff' }}
          >
            {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Guardar conexión
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─── section config ─────────────────────────────────────────── */
const JOB_BOARDS: { platform: IntegrationPlatform; name: string; countries: string; color: string; available: boolean }[] = [
  { platform: 'computrabajo', name: 'Computrabajo', countries: 'AR/MX/CO/PE/CL', color: '#E8003D', available: true },
  { platform: 'zonajobs', name: 'ZonaJobs', countries: 'AR', color: '#FF6B00', available: true },
  { platform: 'bumeran', name: 'Bumeran', countries: 'AR/MX/PE', color: '#0066CC', available: true },
  { platform: 'occ', name: 'OCC Mundial', countries: 'MX', color: '#ED1C24', available: true },
  { platform: 'indeed', name: 'Indeed', countries: 'Global', color: '#2164F3', available: true },
  { platform: 'linkedin_jobs', name: 'LinkedIn Jobs', countries: 'Global', color: '#0A66C2', available: true },
  { platform: 'getonboard', name: 'GetOnBoard', countries: 'CL/CO/AR', color: '#00B4A2', available: false },
  { platform: 'infojobs', name: 'InfoJobs', countries: 'AR/ES', color: '#36B37E', available: false },
]

/* ─── OAuth platform configs ─────────────────────────────────── */
const OAUTH_ROUTES: Record<string, { href: string; label: string; configKey: string; envVars: string[] }> = {
  linkedin: {
    href: '/api/oauth/linkedin',
    label: 'Conectar LinkedIn',
    configKey: 'linkedin',
    envVars: ['LINKEDIN_CLIENT_ID', 'LINKEDIN_CLIENT_SECRET'],
  },
  gmail: {
    href: '/api/oauth/google',
    label: 'Conectar Gmail + Google Meet',
    configKey: 'google',
    envVars: ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET'],
  },
  outlook: {
    href: '/api/oauth/microsoft',
    label: 'Conectar Outlook + Teams',
    configKey: 'microsoft',
    envVars: ['MICROSOFT_CLIENT_ID', 'MICROSOFT_CLIENT_SECRET'],
  },
  zoom: {
    href: '/api/oauth/zoom',
    label: 'Conectar Zoom',
    configKey: 'zoom',
    envVars: ['ZOOM_CLIENT_ID', 'ZOOM_CLIENT_SECRET'],
  },
  whatsapp: {
    href: '/api/oauth/meta',
    label: 'Conectar WhatsApp Business',
    configKey: 'meta',
    envVars: ['META_APP_ID', 'META_APP_SECRET'],
  },
}

/* ─── main page ──────────────────────────────────────────────── */
export default function IntegrationsPage() {
  const { user } = useUser()
  const searchParams = useSearchParams()
  const [integrations, setIntegrations] = React.useState<Integration[]>([])
  const [activeJobBoardModal, setActiveJobBoardModal] = React.useState<IntegrationPlatform | null>(null)
  const [toast, setToast] = React.useState<string | null>(null)
  const provider = React.useMemo(() => new SupabaseProvider(), [])

  // Handle ?connected= query param
  React.useEffect(() => {
    const connected = searchParams.get('connected')
    if (connected) {
      setToast(connected)
      // Remove query param from URL without reload
      const url = new URL(window.location.href)
      url.searchParams.delete('connected')
      window.history.replaceState({}, '', url.toString())
    }
  }, [searchParams])

  React.useEffect(() => {
    const tenantId = user?.tenantId ?? ''
    if (!tenantId) return
    provider.getIntegrations(tenantId).then((res) => {
      setIntegrations(res.data ?? [])
    })
  }, [provider, user])

  function getByPlatform(platform: IntegrationPlatform) {
    return integrations.filter((i) => i.platform === platform)
  }

  async function handleJobBoardConnect(
    platform: IntegrationPlatform,
    data: { accountName: string; accountEmail?: string }
  ) {
    const tenantId = user?.tenantId ?? ''
    const res = await provider.saveIntegration({
      tenantId,
      platform,
      accountName: data.accountName,
      accountEmail: data.accountEmail,
      status: 'connected',
    })
    if (res.data) setIntegrations((prev) => {
      const without = prev.filter((i) => i.platform !== platform)
      return [...without, res.data!]
    })
    setActiveJobBoardModal(null)
  }

  async function handleRemove(id: string) {
    if (!confirm('¿Desconectar esta integración?')) return
    await provider.deleteIntegration(id)
    setIntegrations((prev) => prev.filter((i) => i.id !== id))
  }

  function handleReconnect(platform: IntegrationPlatform) {
    const oauthConfig = Object.values(OAUTH_ROUTES).find((_, i) => {
      const keys = Object.keys(OAUTH_ROUTES)
      return keys[i] === platform
    })
    if (oauthConfig) {
      window.location.href = oauthConfig.href
    }
  }

  const plan = user?.plan ?? 'free'
  const limit = PLAN_LIMITS[plan] ?? 1

  function canConnect(platform: IntegrationPlatform) {
    const existing = getByPlatform(platform)
    return existing.length < limit
  }

  /* ── section component ── */
  function Section({
    icon,
    title,
    subtitle,
    children,
  }: {
    icon: React.ReactNode
    title: string
    subtitle?: string
    children: React.ReactNode
  }) {
    return (
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center text-foreground">
            {icon}
          </div>
          <div>
            <h2 className="font-semibold text-foreground text-sm">{title}</h2>
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          </div>
        </div>
        {children}
      </div>
    )
  }

  /* ── OAuth connect button (real redirect) ── */
  function OAuthConnectButton({
    platformKey,
    disabled,
  }: {
    platformKey: string
    disabled?: boolean
  }) {
    const config = OAUTH_ROUTES[platformKey]
    if (!config) return null

    return (
      <a
        href={disabled ? undefined : config.href}
        aria-disabled={disabled}
        className={`inline-flex items-center gap-2 text-sm bg-primary/10 hover:bg-primary/20 text-primary px-3 py-1.5 rounded-lg transition-colors ${disabled ? 'opacity-40 pointer-events-none cursor-not-allowed' : ''}`}
      >
        <ExternalLink className="h-3.5 w-3.5" />
        {config.label}
      </a>
    )
  }

  const activeJobBoard = activeJobBoardModal
    ? JOB_BOARDS.find((j) => j.platform === activeJobBoardModal)
    : null

  return (
    <div className="flex flex-col h-full">
      {/* success toast */}
      {toast && <SuccessToast platform={toast} onClose={() => setToast(null)} />}

      {/* header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-border">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Integraciones</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Conectá tus herramientas y publicá desde un solo lugar
          </p>
        </div>
        <div className="text-xs bg-muted text-muted-foreground px-3 py-1.5 rounded-full">
          Plan: <span className="font-semibold capitalize text-foreground">{plan}</span> · Hasta {limit} cuenta{limit > 1 ? 's' : ''} por canal
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

        {/* 1. Redes Profesionales */}
        <Section icon={<LinkedInIcon className="h-5 w-5 text-blue-600" />} title="Redes Profesionales" subtitle={`LinkedIn · hasta ${limit} cuenta${limit > 1 ? 's' : ''}`}>
          <div className="space-y-2">
            {getByPlatform('linkedin').map((i) => (
              <ConnectedAccountRow key={i.id} integration={i} onRemove={handleRemove} onReconnect={handleReconnect} />
            ))}
            <OAuthConnectButton platformKey="linkedin" disabled={!canConnect('linkedin')} />
            {!canConnect('linkedin') && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Lock className="h-3 w-3" /> Límite alcanzado. Subí de plan para agregar más cuentas.
              </p>
            )}
          </div>
        </Section>

        {/* 2. Google Workspace — disponible en plan gratuito */}
        <Section
          icon={
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
          }
          title="Google Workspace"
          subtitle="Gmail · Google Drive · Google Calendar · Google Meet — disponible en todos los planes"
        >
          <div className="space-y-4">
            {/* Connected accounts */}
            {getByPlatform('gmail').map((i) => (
              <ConnectedAccountRow key={i.id} integration={i} onRemove={handleRemove} onReconnect={handleReconnect} />
            ))}

            {/* Connect button */}
            <OAuthConnectButton platformKey="gmail" disabled={false} />

            {/* Feature list */}
            <div
              className="rounded-lg p-4 space-y-2.5"
              style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}
            >
              <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
                Al conectar tu cuenta de Google obtenés:
              </p>
              <ul className="space-y-1.5">
                {[
                  { icon: '📧', label: 'Gmail', desc: 'Enviá emails a candidatos directamente desde la app' },
                  { icon: '💾', label: 'Google Drive', desc: 'Almacená CVs y documentos de candidatos en tu Drive' },
                  { icon: '📅', label: 'Google Calendar', desc: 'Creá eventos de entrevistas automáticamente' },
                  { icon: '🎥', label: 'Google Meet', desc: 'Generá links de videollamada al agendar entrevistas' },
                ].map((f) => (
                  <li key={f.label} className="flex items-start gap-2 text-xs">
                    <span className="text-base leading-none mt-0.5">{f.icon}</span>
                    <span>
                      <span className="font-medium" style={{ color: 'var(--text)' }}>{f.label}</span>
                      <span style={{ color: 'var(--muted)' }}> — {f.desc}</span>
                    </span>
                  </li>
                ))}
              </ul>
              <p className="text-xs pt-1" style={{ color: 'var(--muted)' }}>
                🔒 Solo se accede a los datos que vos autorices. Podés desconectar en cualquier momento.
              </p>
            </div>
          </div>
        </Section>

        {/* 3. Email Corporativo */}
        <Section icon={<Mail className="h-5 w-5 text-gray-500" />} title="Email Corporativo" subtitle={`Outlook, SMTP · hasta ${limit} cuenta${limit > 1 ? 's' : ''}`}>
          <div className="space-y-3">
            {/* Outlook */}
            <div>
              <p className="text-xs font-medium text-foreground mb-2">Outlook / Microsoft 365</p>
              {getByPlatform('outlook').map((i) => (
                <ConnectedAccountRow key={i.id} integration={i} onRemove={handleRemove} onReconnect={handleReconnect} />
              ))}
              <OAuthConnectButton platformKey="outlook" disabled={!canConnect('outlook')} />
            </div>
          </div>
        </Section>

        {/* 4. WhatsApp Business */}
        <Section icon={<MessageCircle className="h-5 w-5 text-green-600" />} title="WhatsApp Business" subtitle={`Meta Cloud API · hasta ${limit} número${limit > 1 ? 's' : ''}`}>
          <div className="space-y-2">
            {getByPlatform('whatsapp').map((i) => (
              <ConnectedAccountRow key={i.id} integration={i} onRemove={handleRemove} onReconnect={handleReconnect} />
            ))}
            <OAuthConnectButton platformKey="whatsapp" disabled={!canConnect('whatsapp')} />
            <div className="text-xs text-muted-foreground bg-muted rounded-lg p-3 space-y-1">
              <p className="font-medium text-foreground">¿Cómo obtener acceso?</p>
              <p>1. Creá una app en <span className="text-primary">developers.facebook.com</span></p>
              <p>2. Agregá el producto "WhatsApp Business"</p>
              <p>3. Completá la verificación de negocio en Meta</p>
            </div>
          </div>
        </Section>

        {/* 5. Videollamadas */}
        <Section icon={<Video className="h-5 w-5 text-purple-600" />} title="Plataformas de Videollamadas" subtitle="Crear reuniones automáticamente al agendar entrevistas">
          <div className="space-y-3">
            {/* Zoom */}
            <div>
              <p className="text-xs font-medium text-foreground mb-2">Zoom</p>
              {getByPlatform('zoom').map((i) => (
                <ConnectedAccountRow key={i.id} integration={i} onRemove={handleRemove} onReconnect={handleReconnect} />
              ))}
              <OAuthConnectButton platformKey="zoom" disabled={!canConnect('zoom')} />
            </div>

            {/* Google Meet */}
            <div className="flex items-center justify-between py-2 px-3 bg-muted/50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-foreground">Google Meet</p>
                <p className="text-xs text-muted-foreground">Se activa automáticamente con tu cuenta de Gmail</p>
              </div>
              {getByPlatform('gmail').length > 0 ? (
                <span className="text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Activo
                </span>
              ) : (
                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                  Conectar Gmail primero
                </span>
              )}
            </div>

            {/* Teams */}
            <div className="flex items-center justify-between py-2 px-3 bg-muted/50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-foreground">Microsoft Teams</p>
                <p className="text-xs text-muted-foreground">Se activa automáticamente con tu cuenta de Outlook</p>
              </div>
              {getByPlatform('outlook').length > 0 ? (
                <span className="text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Activo
                </span>
              ) : (
                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                  Conectar Outlook primero
                </span>
              )}
            </div>
          </div>
        </Section>

        {/* 6. Job Boards LATAM */}
        <Section icon={<Briefcase className="h-5 w-5 text-indigo-600" />} title="Job Boards LATAM" subtitle="Publicá vacantes en múltiples portales con un click">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {JOB_BOARDS.map((jb) => {
              const connected = getByPlatform(jb.platform)
              const isConnected = connected.length > 0
              return (
                <div key={jb.platform} className="border border-border rounded-xl p-3 flex flex-col items-center gap-2 text-center hover:shadow-sm transition-shadow">
                  {/* logo placeholder */}
                  <div
                    className="h-10 w-full rounded-lg flex items-center justify-center text-white text-xs font-bold"
                    style={{ backgroundColor: jb.color }}
                  >
                    {jb.name.slice(0, 6)}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-foreground">{jb.name}</p>
                    <p className="text-xs text-muted-foreground">{jb.countries}</p>
                  </div>
                  {isConnected ? (
                    <div className="flex flex-col items-center gap-1 w-full">
                      <span className="text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" /> Conectado
                      </span>
                      <button
                        onClick={() => handleRemove(connected[0].id)}
                        className="text-xs text-muted-foreground hover:text-red-500 flex items-center gap-1 transition-colors"
                      >
                        <Trash2 className="h-3 w-3" /> Desconectar
                      </button>
                    </div>
                  ) : jb.available ? (
                    <button
                      onClick={() => setActiveJobBoardModal(jb.platform)}
                      className="text-xs bg-primary/10 text-primary hover:bg-primary/20 px-2 py-1 rounded-lg transition-colors"
                    >
                      Conectar
                    </button>
                  ) : (
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                      Próximamente
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </Section>

        {/* upgrade banner for free */}
        {plan === 'free' && (
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-5 text-white">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-semibold">Desbloqueá más integraciones</p>
                <p className="text-sm text-white/80 mt-0.5">
                  Con el plan Pro conectás hasta 3 cuentas por canal: LinkedIn, Email y WhatsApp simultáneamente.
                </p>
              </div>
              <button className="bg-white text-indigo-600 hover:bg-white/90 px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors flex-shrink-0">
                Ver planes
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Job board modal */}
      {activeJobBoard && (
        <JobBoardModal
          platform={activeJobBoard.platform}
          name={activeJobBoard.name}
          onConnect={handleJobBoardConnect}
          onClose={() => setActiveJobBoardModal(null)}
        />
      )}
    </div>
  )
}
